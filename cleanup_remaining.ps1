$files = @(
    "src/app/(Uygulama)/Veri/EDefterInceleme/FisDetaylari/[id]/FisDetaylari.tsx",
    "src/app/(Uygulama)/Donusum/FisListesi/FisDetaylari/[id]/FisDetaylari.tsx",
    "src/app/(Uygulama)/Konsolidasyon/FisListesi/FisDetaylari/[id]/FisDetaylari.tsx",
    "src/app/(Uygulama)/Hesaplamalar/Kredi/KrediDetaylari/[krediNo]/KrediDetayVeriYukleme.tsx",
    "src/app/(Uygulama)/Hesaplamalar/KurFarkiKayitlari/KurFarkiKontrolleri/FisDetaylari/[id]/FisDetaylari.tsx",
    "src/app/(Uygulama)/DenetimKanitlari/HileVeUsulsuzluk/MuhasebeHatalariVeHile/[formUrl]/Orneklem.tsx",
    "src/app/(Uygulama)/DenetimKanitlari/HileVeUsulsuzluk/MuhasebeHatalariVeHile/[formUrl]/OrneklemFisleri.tsx",
    "src/app/(Uygulama)/DenetimKanitlari/Onemlilik/Orneklem/OrneklemFisleri/[kebirKodu]/FisDetaylari/[id]/FisDetaylari.tsx"
)

foreach ($f in $files) {
    if (Test-Path $f) {
        $content = Get-Content $f -Raw
        $content = $content -replace 'import \{ registerAllModules \} from "handsontable/registry";?\r?\n?', ''
        $content = $content -replace "import \{ registerAllModules \} from 'handsontable/registry';?\r?\n?", ''
        $content = $content -replace 'registerAllModules\(\);?\r?\n?', ''
        Set-Content $f $content -NoNewline
        Write-Host "Done: $f"
    }
    else {
        Write-Host "Not found: $f"
    }
}
Write-Host "All done."
