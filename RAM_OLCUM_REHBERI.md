# RAM Ölçüm Rehberi

Bu proje için RAM ölçüm komutları `package.json` içine eklendi.

## Komutlar

1. Sadece build RAM ölçümü:

```bash
npm run ram:build
```

2. Sadece dev RAM ölçümü (varsayılan 120 sn):

```bash
npm run ram:dev
```

3. Build + dev toplu benchmark:

```bash
npm run ram:benchmark
```

## Çıktıdaki Alanlar

- `peakNodeWorkingSetMB`: Ölçüm boyunca görülen en yüksek Node RAM.
- `avgNodeWorkingSetMB`: Ölçüm boyunca ortalama Node RAM.
- `durationSeconds`: Ölçüm süresi.
- `timedOut`: Süre dolduğu için durduruldu mu (`true/false`).
- `exitCode`: Çalıştırılan komutun çıkış kodu.

## Notlar

- `ram:dev` komutu süre sonunda süreci otomatik sonlandırır.
- Ölçüm scriptleri:
  - `scripts/measure-ram.ps1`
  - `scripts/benchmark-ram.ps1`
- Eğer kilit hatası görürsen (`.next/lock` veya `.next/dev/lock`), çalışan eski `next` sürecini kapatıp tekrar dene.
