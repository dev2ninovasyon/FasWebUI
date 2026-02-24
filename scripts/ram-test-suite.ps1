param(
  [int]$DevDurationSeconds = 120,
  [int]$NavRounds = 2,
  [string]$OutputDir = "ram-metrics"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$idleJson = Join-Path $OutputDir ("idle-" + $timestamp + ".json")
$navJson = Join-Path $OutputDir ("navigation-" + $timestamp + ".json")

Write-Host "[1/2] RAM idle testi..."
powershell -ExecutionPolicy Bypass -File scripts/measure-ram.ps1 -Command "npm run dev" -DurationSeconds $DevDurationSeconds -OutputJson $idleJson

Write-Host "[2/2] RAM navigation testi..."
powershell -ExecutionPolicy Bypass -File scripts/ram-navigation-test.ps1 -Rounds $NavRounds -OutputJson $navJson

$idle = Get-Content $idleJson | ConvertFrom-Json
$nav = Get-Content $navJson | ConvertFrom-Json

Write-Host ""
Write-Host "=== RAM TEST SUMMARY ==="
Write-Host ("Idle Peak Node RAM: {0} MB" -f $idle.peakNodeWorkingSetMB)
Write-Host ("Idle Avg  Node RAM: {0} MB" -f $idle.avgNodeWorkingSetMB)
Write-Host ("Nav  Peak Node RAM: {0} MB" -f $nav.peakNodeTreeMB)
Write-Host ("Nav  Avg  Node RAM: {0} MB" -f $nav.avgNodeTreeMB)
Write-Host ("Saved: {0}" -f (Resolve-Path $idleJson))
Write-Host ("Saved: {0}" -f (Resolve-Path $navJson))
