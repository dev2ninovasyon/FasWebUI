# PowerShell script to apply responsive breadcrumb pattern to all remaining files
# This script finds and replaces the Breadcrumb children Grid section with responsive version

$files = @(
    "src\app\(Uygulama)\PlanVeProgram\DenetimProgrami\page.tsx",
   "src\app\(Uygulama)\PlanVeProgram\DenetimPlani\page.tsx",
    "src\app\(Uygulama)\PlanVeProgram\DenetimRiskBelirleme\page.tsx",
    "src\app\(Uygulama)\PlanVeProgram\DenetimRiskDegerlendirme\page.tsx",
    "src\app\(Uygulama)\PlanVeProgram\DenetimStratejiKilavuzu\page.tsx",
    "src\app\(Uygulama)\PlanVeProgram\DenetimZamaniBildirme\page.tsx",
    "src\app\(Uygulama)\PlanVeProgram\EtikGerekliliklereIliskinBildirim\page.tsx",
    "src\app\(Uygulama)\PlanVeProgram\FaaliyetRiskBelirleme\page.tsx",
    "src\app\(Uygulama)\PlanVeProgram\HesaplaraIliskinIcKontrolTespit\page.tsx",
    "src\app\(Uygulama)\PlanVeProgram\HileUsulsuzlukBelirleme\page.tsx",
    "src\app\(Uygulama)\PlanVeProgram\HileUsulsuzlukDegerlendirme\page.tsx",
    "src\app\(Uygulama)\PlanVeProgram\IsletmeyeIliskinIcKontrolTespit\page.tsx",
    "src\app\(Uygulama)\PlanVeProgram\IsletmeyeIliskinIcKontrolSistemiOzetDegerlendirme\page.tsx",
    "src\app\(Uygulama)\PlanVeProgram\IsletmeVarliklarininKorunmasinaIliskinDegerlendirme\page.tsx",
    "src\app\(Uygulama)\PlanVeProgram\BilgiIslemMuhasebe\page.tsx",
    "src\app\(Uygulama)\PlanVeProgram\DenetlenenIsletmeninTabiOlduguMevzuataIliskinDegerlendirme\page.tsx",
    "src\app\(Uygulama)\PlanVeProgram\MaddiDogrulukGorevAtamalari\page.tsx",
    "src\app\(Uygulama)\PlanVeProgram\MeslekiDeneyimYeterlilik\page.tsx",
    "src\app\(Uygulama)\PlanVeProgram\MeslekiEtik\page.tsx",
    "src\app\(Uygulama)\PlanVeProgram\BulguRiskiBelirleme\page.tsx",
    "src\app\(Uygulama)\Surdurulebilirlik\SurdurulebilirlikGenelBilgiler\page.tsx",
    "src\app\(Uygulama)\Surdurulebilirlik\SurdurulebilirlikCevreselEtkiler\page.tsx",
    "src\app\(Uygulama)\Surdurulebilirlik\SurdurulebilirlikKurumsalYonetisim\page.tsx",
    "src\app\(Uygulama)\Surdurulebilirlik\SurdurulebilirlikSosyalSorumluluk\page.tsx",
    "src\app\(Uygulama)\Surdurulebilirlik\SurdurulebilirlikEkBilgiler\page.tsx",
    "src\app\(Uygulama)\Musteri\TeklifBelgesi\page.tsx",
    "src\app\(Uygulama)\Musteri\SozlesmeKabul\page.tsx",
    "src\app\(Uygulama)\Musteri\MusteriDurustlugunuDegerlendirme\page.tsx",
    "src\app\(Uygulama)\Musteri\IsletmeTanima\page.tsx",
    "src\app\(Uygulama)\Musteri\KendiYetkinliginiDegerlendirme\page.tsx",
    "src\app\(Uygulama)\Musteri\IsletmeFaaliyetVeCevresiTanima\page.tsx"
)

$templateFile = "src\app\(Uygulama)\PlanVeProgram\DenetimTakvimi\page.tsx"

Write-Host "Reading template file..." -ForegroundColor Green
$templateContent = Get-Content $templateFile -Raw

# Extract the responsive breadcrumb section from template
$pattern = '(?s)(<Breadcrumb[^>]*>\s*<>\s*)(.+?)(\s*</Breadcrumb>)'
if ($templateContent -match $pattern) {
    $responsiveSection = $matches[2]
    Write-Host "Template section extracted successfully" -ForegroundColor Green
    
    $successCount = 0
    $skipCount = 0
    
    foreach ($file in $files) {
        if (Test-Path $file) {
            $content = Get-Content $file -Raw
            
            # Skip if already has isMobile (already converted)
            if ($content -match '\{isMobile \?') {
                Write-Host "- Skipped (already converted): $file" -ForegroundColor Yellow
                $skipCount++
                continue
            }
            
            # Replace the breadcrumb children section
            $newContent = $content -replace $pattern, "`$1$responsiveSection`$3"
            
            if ($newContent -ne $content) {
                Set-Content -Path $file -Value $newContent -NoNewline
                Write-Host "✓ Updated: $file" -ForegroundColor Green
                $successCount++
            } else {
                Write-Host "- No change needed: $file" -ForegroundColor Gray
                $skipCount++
            }
        } else {
            Write-Host "✗ File not found: $file" -ForegroundColor Red
        }
    }
    
    Write-Host "`nComplete! Updated: $successCount, Skipped: $skipCount" -ForegroundColor Cyan
} else {
    Write-Host "ERROR: Could not extract template section" -ForegroundColor Red
}
