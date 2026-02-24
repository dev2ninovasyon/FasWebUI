$baseDir = "C:\Users\lenov\source\repos\dev2ninovasyon\FasWebUI\src"

# Find ALL remaining files with registerAllModules (excluding handsontableSetup.ts)
$files = Get-ChildItem -Path $baseDir -Filter "*.tsx" -Recurse | Where-Object {
    Select-String -Path $_.FullName -Pattern "registerAllModules\(\)" -Quiet
}

foreach ($file in $files) {
    Write-Host "Cleaning: $($file.FullName)"
    $content = Get-Content -Path $file.FullName -Raw
    $content = $content -replace 'import \{ registerAllModules \} from "handsontable/registry";?\r?\n?', ''
    $content = $content -replace "import \{ registerAllModules \} from 'handsontable/registry';?\r?\n?", ''
    $content = $content -replace 'registerAllModules\(\);?\r?\n?', ''
    Set-Content -Path $file.FullName -Value $content -NoNewline
}

Write-Host "Total cleaned: $($files.Count) files"
