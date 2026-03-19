# RAM Olcum Rehberi

RAM olcum komutlari kok [README.md](c:\Users\lenov\source\repos\dev2ninovasyon\FasWebUI\README.md) dosyasina tasindi.

## Ciktidaki Alanlar

- `peakNodeWorkingSetMB`: Olcum boyunca gorulen en yuksek Node RAM
- `avgNodeWorkingSetMB`: Olcum boyunca ortalama Node RAM
- `durationSeconds`: Olcum suresi
- `timedOut`: Sure sonunda surecin zorla durdurulup durdurulmadigi
- `exitCode`: Calistirilan komutun cikis kodu

## Notlar

- `ram:dev` olcumunde sure sonunda surec otomatik sonlandirilir.
- Olcum scriptleri `scripts/measure-ram.ps1` ve `scripts/benchmark-ram.ps1` altindadir.
- `.next/lock` veya `.next/dev/lock` gorulurse once calisan eski `next` surecini kapatin.
