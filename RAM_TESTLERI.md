# RAM Testleri

Bu dokuman RAM test komutlarini ve yorumlama adimlarini verir.

## Test Komutlari

1. Tum RAM testleri (idle + navigation):

```bash
npm run test:ram
```

2. Sadece idle testi (uygulama acik, kullanici etkilesimi yok):

```bash
npm run test:ram:idle
```

3. Sadece navigation testi (kritik sayfalar gezilir):

```bash
npm run test:ram:navigation
```

4. 15 dakika navigation + hotspot log testi:

```bash
npm run test:ram:navigation:15m
```

5. Production yuk testi (build + start, 10/25/50 eszamanli):

```bash
npm run test:load:prod
```

## Cikti Dosyalari

Testler JSON sonucunu `ram-metrics/` klasorune yazar:

- `idle-YYYYMMDD-HHMMSS.json`
- `navigation-YYYYMMDD-HHMMSS.json`
- `nav-trace-15m-YYYYMMDD-HHMMSS.csv`
- `nav-summary-15m-YYYYMMDD-HHMMSS.json`
- `prod-load-YYYYMMDDHHMMSS.json`

## Onemli Alanlar

- Idle:
  - `peakNodeWorkingSetMB`
  - `avgNodeWorkingSetMB`
- Navigation:
  - `peakNodeTreeMB`
  - `avgNodeTreeMB`
- Navigation 15m:
  - `peakNodeMB`
  - `peakRoute`
  - `hotspotCount`
  - `topHotspots`

## Kisa Yorumlama

- `peak` yuksek ama `avg` dusukse: gecici pik vardir.
- Hem `peak` hem `avg` yuksekse: surekli bellek baskisi vardir.
- Navigation testi idle testine gore asiri yuksekse: sayfa gecislerinde bellek birikimi vardir.
- `hotspotCount > 0` ise `topHotspots` ve CSV uzerinden ilgili route icin inceleme yapin.

## Parametreli Calistirma (opsiyonel)

Varsayilan sureleri degistirmek icin:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/ram-test-suite.ps1 -DevDurationSeconds 180 -NavRounds 3
```
