$path = "c:\Users\lenov\source\repos\dev2ninovasyon\FasWebUI\src\app\(Uygulama)"
$files = Get-ChildItem -Path $path -Filter "*.tsx" -Recurse

foreach ($f in $files) {
    try {
        $content = [System.IO.File]::ReadAllText($f.FullName)
        if ($content -match "<iframe") {
            $changed = $false
            
            # 1. Hatalı yerleşmiş isLoading state'ini bul ve temizle (importların altına yanlışlıkla giren fısıltı)
            if ($content -match 'import \{.*?\} from ".*?";\s+const \[isLoading, setIsLoading\] = useState\(true\);') {
                $content = $content -replace '(import \{.*?\} from ".*?";)\s+const \[isLoading, setIsLoading\] = useState\(true\);', '$1'
                $changed = $true
            }

            # 2. Page bileşeni içinde isLoading yoksa en başa ekle
            if ($content -match 'const Page: React.FC = \(\) => \{' -and $content -notmatch 'const \[isLoading, setIsLoading\] = useState\(true\)') {
                $content = $content -replace '(const Page: React.FC = \(\) => \{)', "$1`n  const [isLoading, setIsLoading] = useState(true);"
                $changed = $true
            }

            # 3. Çift sx atamasını temizle
            if ($content -match 'sx=\{\{ height: "100%", position: "relative" \}\}\s+sx=\{\{ height: ''100%'' \}\}') {
                $content = $content -replace 'sx=\{\{ height: "100%", position: "relative" \}\}\s+sx=\{\{ height: ''100%'' \}\}', 'sx={{ height: "100%", position: "relative" }}'
                $changed = $true
            }

            # 4. Box (loading) eklenmemişse ekle
            if ($content -notmatch 'isLoading &&') {
                $content = $content -replace '(<iframe.*?>.*?</iframe>)', "`n            {isLoading && (`n              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1, background: 'transparent' }}>`n                <CircularProgress />`n              </Box>`n            )}`n            $1"
                $changed = $true
            }

            if ($changed) {
                [System.IO.File]::WriteAllText($f.FullName, $content, [System.Text.Encoding]::UTF8)
                Write-Host "Fixed: $($f.Name)"
            }
        }
    }
    catch {
        Write-Host "Error in $($f.Name): $($_.Exception.Message)"
    }
}
