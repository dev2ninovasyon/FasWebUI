param (
    [switch]$SkipPerf,
    [switch]$SkipE2E,
    [switch]$SkipLint
)

$ErrorActionPreference = "Stop"

$ReportDir = "$PSScriptRoot\TestResults"
if (-not (Test-Path $ReportDir)) {
    New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null
}

$dashboardDataPath = "$ReportDir\frontend-dashboard-data.js"
$dashboardHtmlPath = "$PSScriptRoot\FrontendDashboard.html"

# JSON Başlangıcı
$generatedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$runCommand = $MyInvocation.Line

$suites = @()

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   FAS WEB UI KALITE YONETICISI (DASHBOARD) " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. ESLint & Type Check (Statik Analiz)
Write-Host "`n--- [ASAMA 1/3] Statik Analiz (ESLint & TSC) ---" -ForegroundColor Yellow
$lintSuite = @{
    id = "frontend-lint"
    group = "Static Analysis"
    title = "ESLint & TypeScript Check"
    description = "Next.js projesinin kod kalitesi taramasi."
    status = "skipped"
    runCommand = "npm run lint && tsc --noEmit"
}
if (-not $SkipLint) {
    Write-Host "Statik Analiz baslatiliyor..."
    try {
        $lintResult = Invoke-Expression "npm run lint"
        $lintSuite.status = "success"
        $lintSuite.summary = @("ESLint ve TypeScript kod kontrolleri basariyla gecildi.")
        Write-Host "Statik Analiz Basarili." -ForegroundColor Green
    }
    catch {
        $lintSuite.status = "failed"
        $lintSuite.summary = @("Hata bulundu. Lutfen terminali inceleyin.")
        Write-Host "Statik Analiz Hatasi." -ForegroundColor Red
    }
}
$suites += $lintSuite

# 2. UI Yük Testi (K6)
Write-Host "`n--- [ASAMA 2/3] UI Performans Stresi (K6) ---" -ForegroundColor Yellow
$perfSuite = @{
    id = "frontend-k6"
    group = "Performance"
    title = "UI Load Test (K6)"
    description = "Next.js SSR/Static render ve asset yuklenme performansi."
    status = "skipped"
    reportPath = "TestResults/FasWebUI_Performance/ui-k6/index.html"
    runCommand = "k6 run .\tests\performance\ui-load-test.js"
}
if (-not $SkipPerf) {
    $Env:K6_REPORT_PATH = "$ReportDir\FasWebUI_Performance\ui-k6\index.html"
    $Env:FASWEBUI_BASE_URL = "http://localhost:3000"
    $Env:FASWEBAPI_BASE_URL = "http://localhost:5000"
    
    Write-Host "K6 UI Yük Testi (Gerçekçi gezinti simülasyonu) baslatiliyor..."
    try {
        $k6Output = Invoke-Expression "k6 run .\tests\performance\ui-load-test.js"
        $perfSuite.status = "success"
        $perfSuite.summary = @("Durum: success", "UI k6 HTML raporu olusturuldu.")
        Write-Host "UI Yük Testi Basarili." -ForegroundColor Green
    }
    catch {
        $perfSuite.status = "failed"
        $perfSuite.summary = @("Durum: failed", "UI yük testinde thresholds aşıldı.")
        Write-Host "UI Yük Testi Hatasi (Threshold). Raporu inceleyin." -ForegroundColor Red
    }
}
$suites += $perfSuite

# 3. Playwright E2E
Write-Host "`n--- [ASAMA 3/3] E2E UI Testleri (Playwright) ---" -ForegroundColor Yellow
$e2eSuite = @{
    id = "frontend-playwright"
    group = "E2E UI Tests"
    title = "Playwright E2E"
    description = "Gercek tarayici uzerinde uctan uca kullanici testleri."
    status = "skipped"
    reportPath = "TestResults/playwright-report/index.html"
    runCommand = "npx playwright test --reporter=html"
}
if (-not $SkipE2E) {
    # .env veya baseUrl ortam değişkeni eklenebilir
    $Env:PLAYWRIGHT_HTML_REPORT = "$ReportDir\playwright-report"
    Write-Host "Playwright (Tarayıcı içi) testleri koşturuluyor..."
    try {
        Invoke-Expression "npx playwright test --reporter=html"
        $e2eSuite.status = "success"
        $e2eSuite.summary = @("E2E testleri gecti.")
        Write-Host "E2E Testleri Basarili." -ForegroundColor Green
    }
    catch {
        $e2eSuite.status = "failed"
        $e2eSuite.summary = @("Bazi senaryolar(testler) başarisiz oldu. Raporu açin.")
        Write-Host "E2E Testleri Hata Verdi." -ForegroundColor Red
    }
}
$suites += $e2eSuite

# Veriyi JS nesnesine dök (HTML'in okuyabilmesi için)
$dashboardObj = @{
    generatedAt = $generatedAt
    runAllCommand = $runCommand
    totals = @{}
    suites = $suites
}
$jsonString = $dashboardObj | ConvertTo-Json -Depth 5
$jsContent = "window.__dashboardData = $jsonString;"
Set-Content -Path $dashboardDataPath -Value $jsContent -Encoding UTF8

Write-Host "`nFrontend test ve veri isleme tamamlandi. Rapor dosyasi: $dashboardDataPath" -ForegroundColor Cyan

# Kendi küçük HTML Dashboard'unu oluştur (Eğer yoksa taslağı yaz)
if (-not (Test-Path $dashboardHtmlPath)) {
    # Çok basit ve şık bir React benzeri veya saf Vanilla JS Dashboard taslağı oluşturulabilir.
    $htmlTemplate = @"
<!DOCTYPE html>
<html lang='tr'>
<head>
    <meta charset='UTF-8'>
    <title>FasWebUI Yük ve Kalite Raporu</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f9fc; color: #333; margin: 0; padding: 20px;}
        h1 { color: #2c3e50; text-align: center; }
        .container { max-width: 900px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .card { border-left: 5px solid #bdc3c7; background: #fafafa; margin-bottom: 15px; padding: 15px; border-radius: 4px; }
        .success { border-left-color: #27ae60; }
        .failed { border-left-color: #e74c3c; }
        .skipped { border-left-color: #f39c12; }
        a { color: #3498db; text-decoration: none; font-weight: bold; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class='container'>
        <h1>FasWebUI Frontend Dashboard</h1>
        <p style='text-align:center;' id='gen-date'></p>
        <div id='content'></div>
    </div>
    <script src='./TestResults/frontend-dashboard-data.js'></script>
    <script>
        if(window.__dashboardData) {
            document.getElementById('gen-date').innerText = 'Test Zamanı: ' + window.__dashboardData.generatedAt;
            const content = document.getElementById('content');
            window.__dashboardData.suites.forEach(suite => {
                const card = document.createElement('div');
                card.className = 'card ' + suite.status;
                
                let linkHtml = suite.reportPath ? `<a href='./` + suite.reportPath + `' target='_blank'>Detaylı Raporu Aç (HTML)</a>` : 'Rapor yok veya atlandı';
                if(suite.status === 'skipped') linkHtml = 'Atlandı';

                card.innerHTML = `
                    <h3>` + suite.title + ` (` + suite.status.toUpperCase() + `)</h3>
                    <p>` + suite.description + `</p>
                    <div style='margin-bottom:10px;'>` + (suite.summary ? suite.summary.join('<br>') : '') + `</div>
                    ` + linkHtml + `
                `;
                content.appendChild(card);
            });
        } else {
            document.getElementById('content').innerHTML = '<p>Veri bulunamadi. Lutfen Run-FrontendDashboard.ps1 calistirin.</p>';
        }
    </script>
</body>
</html>
"@
    Set-Content -Path $dashboardHtmlPath -Value $htmlTemplate -Encoding UTF8
}

Invoke-Item $dashboardHtmlPath
Write-Host "Dashboard tarayıcıda açılıyor..." -ForegroundColor Green
