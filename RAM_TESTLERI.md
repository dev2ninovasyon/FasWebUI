# RAM Testleri

RAM test komutlari kok [README.md](c:\Users\lenov\source\repos\dev2ninovasyon\FasWebUI\README.md) dosyasinda tutulur.

## Cikti Dosyalari

Testler JSON ve CSV sonucunu `ram-metrics/` klasorune yazar:

- `idle-YYYYMMDD-HHMMSS.json`
- `navigation-YYYYMMDD-HHMMSS.json`
- `nav-trace-15m-YYYYMMDD-HHMMSS.csv`
- `nav-summary-15m-YYYYMMDD-HHMMSS.json`
- `prod-load-YYYYMMDDHHMMSS.json`

## Onemli Alanlar

- Idle: `peakNodeWorkingSetMB`, `avgNodeWorkingSetMB`
- Navigation: `peakNodeTreeMB`, `avgNodeTreeMB`
- Navigation 15m: `peakNodeMB`, `peakRoute`, `hotspotCount`, `topHotspots`

## Kisa Yorumlama

- `peak` yuksek ama `avg` dusukse gecici pik vardir.
- Hem `peak` hem `avg` yuksekse surekli bellek baskisi vardir.
- Navigation testi idle testine gore asiri yuksekse sayfa gecislerinde bellek birikimi vardir.
- `hotspotCount > 0` ise `topHotspots` ve CSV uzerinden ilgili route incelenmelidir.
