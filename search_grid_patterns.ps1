$results = @()
$maxResults = 30
$counter = 0

$files = Get-ChildItem -Path src -Filter "*.tsx" -Recurse

foreach ($file in $files) {
    if ($counter -ge $maxResults) { break }
    
    try {
        $content = Get-Content -Path $file.FullName -Raw
        $lines = $content -split "`n"
        
        for ($i = 0; $i -lt $lines.Count - 1; $i++) {
            if ($counter -ge $maxResults) { break }
            
            if ($lines[$i] -match '<Grid.*container') {
                $containerLine = $i + 1
                
                # Container içinde 100 satır ara
                for ($j = $i + 1; $j -lt [Math]::Min($i + 100, $lines.Count); $j++) {
                    if ($lines[$j] -match '<Grid.*size=\{12\}') {
                        $gridLine = $j + 1
                        
                        # Grid size={12} içinde 10 satır ara
                        for ($k = $j; $k -lt [Math]::Min($j + 10, $lines.Count); $k++) {
                            if ($lines[$k] -match '<Button') {
                                $buttonLine = $k + 1
                                
                                if ($counter -lt $maxResults) {
                                    $rel = $file.FullName -replace 'C:\\Users\\lenov\\source\\repos\\dev2ninovasyon\\FasWebUI\\', ''
                                    $rel = $rel.Replace('\', '/')
                                    
                                    $results += @{
                                        file = $rel
                                        start = $containerLine
                                        end = $buttonLine
                                    }
                                    $counter++
                                }
                                break
                            }
                        }
                        break
                    }
                }
            }
        }
    } catch {
        # Hata varsa devam et
    }
}

$results | ForEach-Object { 
    "$($_.file) - Lines $($_.start)-$($_.end)"
}

Write-Output ""
Write-Output "Toplam bulundu: $($results.Count) desen"
