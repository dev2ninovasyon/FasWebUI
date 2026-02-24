param(
  [int]$DurationSeconds = 900,
  [string]$BaseUrl = "http://localhost:3000",
  [int]$RequestDelayMs = 1200,
  [int]$HotspotDeltaThresholdMB = 80,
  [string]$OutputDir = "ram-metrics"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$stdout = Join-Path $env:TEMP ("fas-dev-out-" + $timestamp + ".log")
$stderr = Join-Path $env:TEMP ("fas-dev-err-" + $timestamp + ".log")
$traceCsv = Join-Path $OutputDir ("nav-trace-15m-" + $timestamp + ".csv")
$summaryJson = Join-Path $OutputDir ("nav-summary-15m-" + $timestamp + ".json")

$devProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm run dev" -PassThru -WindowStyle Hidden -RedirectStandardOutput $stdout -RedirectStandardError $stderr

function Get-TotalNodeMemoryMB {
  $sum = 0.0
  $procs = Get-Process -Name node -ErrorAction SilentlyContinue
  foreach ($p in $procs) {
    $sum += ($p.WorkingSet64 / 1MB)
  }
  return [math]::Round($sum, 2)
}

$ready = $false
for ($i = 0; $i -lt 90; $i++) {
  Start-Sleep -Seconds 1
  try {
    $ok = (Test-NetConnection -ComputerName localhost -Port 3000 -WarningAction SilentlyContinue).TcpTestSucceeded
    if ($ok) {
      $ready = $true
      break
    }
  } catch {}
}

if (-not $ready) {
  try { cmd /c "taskkill /PID $($devProc.Id) /T /F >nul 2>nul" | Out-Null } catch {}
  Write-Output "DEV_NOT_READY"
  Get-Content $stdout -Tail 80 -ErrorAction SilentlyContinue
  Get-Content $stderr -Tail 80 -ErrorAction SilentlyContinue
  exit 1
}

$pages = @(
  "/Anasayfa",
  "/Veri",
  "/Veri/Fatura",
  "/Veri/Mizanlar/VukMizan",
  "/Hesaplamalar",
  "/Hesaplamalar/Kredi",
  "/Hesaplamalar/Kredi/KrediDetaylari/1",
  "/Hesaplamalar/KidemTazminatiTfrs",
  "/DenetimKanitlari",
  "/DenetimKanitlari/MaddiDogrulamaProsedurleri",
  "/Kys/MusteriIliskisi/MusteriBirakmaFormu"
)

$startAt = Get-Date
$trace = New-Object System.Collections.Generic.List[object]
$hotspots = New-Object System.Collections.Generic.List[object]
$peakMb = 0.0
$peakRoute = ""

while (((Get-Date) - $startAt).TotalSeconds -lt $DurationSeconds) {
  foreach ($route in $pages) {
    if (((Get-Date) - $startAt).TotalSeconds -ge $DurationSeconds) { break }

    $beforeMb = Get-TotalNodeMemoryMB
    $status = 0
    $ok = $false

    try {
      $resp = Invoke-WebRequest -Uri ($BaseUrl + $route) -UseBasicParsing -TimeoutSec 60
      $status = [int]$resp.StatusCode
      $ok = $status -ge 200 -and $status -lt 400
    } catch {
      $status = 0
      $ok = $false
    }

    Start-Sleep -Milliseconds $RequestDelayMs
    $afterMb = Get-TotalNodeMemoryMB
    $delta = [math]::Round(($afterMb - $beforeMb), 2)
    $elapsed = [math]::Round(((Get-Date) - $startAt).TotalSeconds, 2)
    $now = Get-Date

    if ($afterMb -gt $peakMb) {
      $peakMb = $afterMb
      $peakRoute = $route
    }

    $trace.Add([pscustomobject]@{
      timestamp = $now.ToString("o")
      elapsedSeconds = $elapsed
      route = $route
      statusCode = $status
      success = $ok
      beforeMB = $beforeMb
      afterMB = $afterMb
      deltaMB = $delta
    })

    if ($delta -ge $HotspotDeltaThresholdMB) {
      $hotspots.Add([pscustomobject]@{
        timestamp = $now.ToString("o")
        route = $route
        beforeMB = $beforeMb
        afterMB = $afterMb
        deltaMB = $delta
      })
    }
  }
}

$avgAfter = 0.0
if ($trace.Count -gt 0) {
  $avgAfter = [math]::Round((($trace | Measure-Object -Property afterMB -Average).Average), 2)
}

$routeStats = @()
if ($trace.Count -gt 0) {
  $routeStats = $trace |
    Group-Object -Property route |
    ForEach-Object {
      $items = $_.Group
      [pscustomobject]@{
        route = $_.Name
        samples = $items.Count
        avgDeltaMB = [math]::Round((($items | Measure-Object -Property deltaMB -Average).Average), 2)
        maxAfterMB = [math]::Round((($items | Measure-Object -Property afterMB -Maximum).Maximum), 2)
        maxDeltaMB = [math]::Round((($items | Measure-Object -Property deltaMB -Maximum).Maximum), 2)
      }
    } | Sort-Object -Property maxAfterMB -Descending
}

$topRoutes = @($routeStats | Select-Object -First 5)
$topHotspots = @($hotspots | Sort-Object -Property deltaMB -Descending | Select-Object -First 10)

$trace | Export-Csv -Path $traceCsv -NoTypeInformation -Encoding utf8
$traceCsvPath = (Resolve-Path $traceCsv).Path

$summary = [pscustomobject]@{
  startedAt = $startAt.ToString("o")
  endedAt = (Get-Date).ToString("o")
  durationSeconds = [math]::Round(((Get-Date) - $startAt).TotalSeconds, 2)
  peakNodeMB = $peakMb
  peakRoute = $peakRoute
  avgAfterMB = $avgAfter
  totalSamples = $trace.Count
  hotspotDeltaThresholdMB = $HotspotDeltaThresholdMB
  hotspotCount = $hotspots.Count
  topRoutes = $topRoutes
  topHotspots = $topHotspots
  traceCsv = $traceCsvPath
  stdoutLog = $stdout
  stderrLog = $stderr
}

$summary | ConvertTo-Json -Depth 6 | Set-Content -Path $summaryJson -Encoding utf8

$summary | Format-List
Write-Host ("Summary JSON: {0}" -f (Resolve-Path $summaryJson))

try { cmd /c "taskkill /PID $($devProc.Id) /T /F >nul 2>nul" | Out-Null } catch {}
