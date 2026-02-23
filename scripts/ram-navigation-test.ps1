param(
  [int]$Rounds = 2,
  [int]$SampleDelayMs = 400,
  [string]$BaseUrl = "http://localhost:3000",
  [string]$OutputJson = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$stdout = Join-Path $env:TEMP ("fas-dev-out-" + $stamp + ".log")
$stderr = Join-Path $env:TEMP ("fas-dev-err-" + $stamp + ".log")

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
  Get-Content $stdout -Tail 60 -ErrorAction SilentlyContinue
  Get-Content $stderr -Tail 60 -ErrorAction SilentlyContinue
  exit 1
}

$pages = @(
  "/Anasayfa",
  "/Veri",
  "/Veri/Fatura",
  "/Veri/Mizanlar/VukMizan",
  "/Hesaplamalar",
  "/Hesaplamalar/Kredi",
  "/Hesaplamalar/KidemTazminatiTfrs",
  "/DenetimKanitlari",
  "/DenetimKanitlari/MaddiDogrulamaProsedurleri",
  "/Kys/MusteriIliskisi/MusteriBirakmaFormu"
)

$peak = 0.0
$sum = 0.0
$samples = 0

for ($round = 0; $round -lt $Rounds; $round++) {
  foreach ($p in $pages) {
    try {
      Invoke-WebRequest -Uri ($BaseUrl + $p) -UseBasicParsing -TimeoutSec 60 | Out-Null
    } catch {}

    for ($i = 0; $i -lt 3; $i++) {
      Start-Sleep -Milliseconds $SampleDelayMs
      $mb = Get-TotalNodeMemoryMB
      if ($mb -gt $peak) { $peak = $mb }
      $sum += $mb
      $samples += 1
    }
  }
}

$avg = if ($samples -gt 0) { [math]::Round($sum / $samples, 2) } else { 0 }

$result = [ordered]@{
  navExitCode = 0
  peakNodeTreeMB = $peak
  avgNodeTreeMB = $avg
  samples = $samples
  rounds = $Rounds
  baseUrl = $BaseUrl
  stdoutLog = $stdout
  stderrLog = $stderr
}

$resultObj = [pscustomobject]$result
$resultObj | Format-List

if ($OutputJson -ne "") {
  $json = $resultObj | ConvertTo-Json -Depth 4
  Set-Content -Path $OutputJson -Value $json -Encoding utf8
}

try { cmd /c "taskkill /PID $($devProc.Id) /T /F >nul 2>nul" | Out-Null } catch {}
