$path = "c:\Users\lenov\source\repos\dev2ninovasyon\FasWebUI\src\app\(Uygulama)"
$files = Get-ChildItem -Path $path -Filter "*.tsx" -Recurse

foreach ($f in $files) {
    try {
        $content = [System.IO.File]::ReadAllText($f.FullName)
        if ($content -match "<iframe") {
            
            # 1. useState import kontrolü
            if ($content -notmatch 'import \{.*useState.*\} from "react"') {
                $content = $content -replace 'import React from "react"', 'import React, { useState } from "react"'
                $content = $content -replace 'import React, \{ useTheme \} from "react"', 'import React, { useState, useTheme } from "react"'
            }

            # 2. state ekleme
            if ($content -notmatch 'const \[isLoading, setIsLoading\] = useState\(true\)') {
                $content = $content -replace '(const Page: React.FC = \(\) => \{)', "$1`n  const [isLoading, setIsLoading] = useState(true);"
            }

            # 3. CircularProgress import (MUI)
            if ($content -notmatch 'CircularProgress') {
                $content = $content -replace 'import \{ Grid \}', 'import { Grid, CircularProgress, Box }'
                $content = $content -replace 'import \{ Grid, useTheme \}', 'import { Grid, useTheme, CircularProgress, Box }'
            }

            # 4. Loading UI ve onLoad ekleme
            if ($content -notmatch 'isLoading &&') {
                # Iframe'e onLoad ekle
                $content = $content -replace '<iframe', '<iframe onLoad={() => setIsLoading(false)}'
                
                # Loading Box'ı Grid içine ekle
                $content = $content -replace '(<iframe.*?>.*?</iframe>)', "`n            {isLoading && (`n              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1, background: 'transparent' }}>`n                <CircularProgress />`n              </Box>`n            )}`n            $1"
                
                # Container'a relative ver ki loading ortalansın
                $content = $content -replace '(sx=\{\{ height: "100%" \}\})', 'sx={{ height: "100%", position: "relative" }}'
                
                [System.IO.File]::WriteAllText($f.FullName, $content, [System.Text.Encoding]::UTF8)
                Write-Host "Added loading to: $($f.Name)"
            }
        }
    }
    catch {
        Write-Host "Error in $($f.Name): $($_.Exception.Message)"
    }
}
