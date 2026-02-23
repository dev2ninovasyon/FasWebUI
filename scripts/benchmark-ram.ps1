param(
  [int]$DevDurationSeconds = 120,
  [int]$PollMs = 500,
  [string]$OutputDir = "ram-metrics"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$buildJson = Join-Path $OutputDir "build-$timestamp.json"
$devJson = Join-Path $OutputDir "dev-$timestamp.json"

Write-Host "[1/2] Measuring build memory..."
powershell -ExecutionPolicy Bypass -File scripts/measure-ram.ps1 -Command "npm run build" -PollMs $PollMs -OutputJson $buildJson

Write-Host "[2/2] Measuring dev memory ($DevDurationSeconds sec)..."
powershell -ExecutionPolicy Bypass -File scripts/measure-ram.ps1 -Command "npm run dev" -DurationSeconds $DevDurationSeconds -PollMs $PollMs -OutputJson $devJson

$build = Get-Content $buildJson | ConvertFrom-Json
$dev = Get-Content $devJson | ConvertFrom-Json

Write-Host "`n=== RAM SUMMARY ==="
Write-Host ("Build Peak Node RAM: {0} MB" -f $build.peakNodeWorkingSetMB)
Write-Host ("Build Avg  Node RAM: {0} MB" -f $build.avgNodeWorkingSetMB)
Write-Host ("Dev   Peak Node RAM: {0} MB" -f $dev.peakNodeWorkingSetMB)
Write-Host ("Dev   Avg  Node RAM: {0} MB" -f $dev.avgNodeWorkingSetMB)
Write-Host ("Saved: {0}" -f (Resolve-Path $buildJson))
Write-Host ("Saved: {0}" -f (Resolve-Path $devJson))
