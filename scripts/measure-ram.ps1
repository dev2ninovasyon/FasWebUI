param(
  [Parameter(Mandatory = $true)]
  [string]$Command,
  [int]$DurationSeconds = 0,
  [int]$PollMs = 500,
  [string]$OutputJson = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-ChildPids([int]$ParentPid) {
  $children = Get-CimInstance Win32_Process -Filter "ParentProcessId = $ParentPid" | Select-Object -ExpandProperty ProcessId
  $all = @()
  foreach ($cp in $children) {
    $all += $cp
    $all += Get-ChildPids -ParentPid $cp
  }
  return $all
}

function Get-TreePids([int]$RootPid) {
  return @($RootPid) + (Get-ChildPids -ParentPid $RootPid)
}

function Get-NodeTreeMemoryBytes([int[]]$Pids) {
  $sum = [int64]0
  foreach ($procId in $Pids) {
    try {
      $p = Get-Process -Id $procId -ErrorAction Stop
      if ($p.ProcessName -eq 'node') {
        $sum += [int64]$p.WorkingSet64
      }
    } catch {
    }
  }
  return $sum
}

$startedAt = Get-Date
$stdoutFile = [System.IO.Path]::GetTempFileName()
$stderrFile = [System.IO.Path]::GetTempFileName()
$proc = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', $Command -PassThru -WindowStyle Hidden -WorkingDirectory (Get-Location).Path -RedirectStandardOutput $stdoutFile -RedirectStandardError $stderrFile

$peakBytes = [int64]0
$peakAt = $startedAt
$samples = 0
$sumBytes = [double]0
$timedOut = $false

while ($true) {
  Start-Sleep -Milliseconds $PollMs

  $now = Get-Date
  $elapsed = ($now - $startedAt).TotalSeconds

  $treePids = Get-TreePids -RootPid $proc.Id
  $memBytes = Get-NodeTreeMemoryBytes -Pids $treePids

  $samples++
  $sumBytes += $memBytes

  if ($memBytes -gt $peakBytes) {
    $peakBytes = $memBytes
    $peakAt = $now
  }

  if ($DurationSeconds -gt 0 -and $elapsed -ge $DurationSeconds) {
    $timedOut = $true
    try { taskkill /PID $proc.Id /T /F | Out-Null } catch {}
    break
  }

  if ($proc.HasExited) {
    break
  }
}

if (-not $proc.HasExited) {
  $proc.WaitForExit()
}

$exitCode = $proc.ExitCode
$endedAt = Get-Date
$totalSeconds = [math]::Round(($endedAt - $startedAt).TotalSeconds, 2)
$peakMB = [math]::Round($peakBytes / 1MB, 2)
$avgMB = if ($samples -gt 0) { [math]::Round(($sumBytes / $samples) / 1MB, 2) } else { 0 }

$result = [ordered]@{
  command = $Command
  startedAt = $startedAt.ToString('o')
  endedAt = $endedAt.ToString('o')
  durationSeconds = $totalSeconds
  peakNodeWorkingSetMB = $peakMB
  avgNodeWorkingSetMB = $avgMB
  samples = $samples
  timedOut = $timedOut
  exitCode = $exitCode
}

$resultObj = [pscustomobject]$result
$resultObj | Format-List

if ($OutputJson -ne "") {
  $json = $resultObj | ConvertTo-Json -Depth 4
  Set-Content -Path $OutputJson -Value $json -Encoding utf8
}

if ($exitCode -ne 0) {
  Write-Host "`n--- command stdout (tail) ---"
  Get-Content $stdoutFile -ErrorAction SilentlyContinue | Select-Object -Last 40
  Write-Host "`n--- command stderr (tail) ---"
  Get-Content $stderrFile -ErrorAction SilentlyContinue | Select-Object -Last 40
}

Remove-Item $stdoutFile, $stderrFile -ErrorAction SilentlyContinue

if (-not $timedOut -and $exitCode -ne 0) {
  exit $exitCode
}
