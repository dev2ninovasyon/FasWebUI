# FAS Frontend E2E Testleri

Bu klasor, FAS projesinin gercek kullanici akislarini Playwright ile test eder. Testler mock veri yerine gercek backend ortamini hedefleyebilir ve Page Object Model yapisi kullanilir.

## Klasor Yapisi

- `pages/`: Sayfa nesneleri
- `test-data/`: Sabit girdiler ve test verileri
- `utils/`: Ortak yardimcilar
- `main.spec.ts`: Ana senaryolar
- `reports/`: E2E rapor ciktilari

## Calistirma

Calistirma komutlari kok [README.md](c:\Users\lenov\source\repos\dev2ninovasyon\FasWebUI\README.md) dosyasinda tutulur.

## Dikkat Edilecekler

- Form dolduran testler sistemde test kayitlari olusturabilir.
- Hata aninda trace, screenshot ve benzeri artefact'lar raporlara eklenir.
- Hedef URL bilgisi `playwright.config.ts` veya ortam degiskenlerinden gelir.
