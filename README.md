# FasWebUI

Bu dosya, UI testlerini nasil calistiracaginizi ve raporlari nasil acacaginizi ozetler.

## Gereksinimler

- Node.js ve npm
- Bagimliliklarin kurulmus olmasi

Kurulum:

```powershell
cd C:\Users\lenov\source\repos\dev2ninovasyon\FasWebUI
npm install
```

## Sik Kullanilan Komutlar

Unit testleri:

```powershell
npm run test
```

Unit testleri watch modu:

```powershell
npm run test:watch
```

Coverage:

```powershell
npm run test:coverage
```

Tum Playwright E2E testleri:

```powershell
npm run test:e2e
```

Playwright UI modu:

```powershell
npm run test:e2e:ui
```

Smoke E2E:

```powershell
npm run e2e:smoke
```

Tam E2E:

```powershell
npm run e2e:full
```

Staging E2E:

```powershell
npm run e2e:staging
```

Resilience testi:

```powershell
npm run test:resilience
```

RAM ve load testleri:

```powershell
npm run test:ram
npm run test:ram:idle
npm run test:ram:navigation
npm run test:ram:navigation:15m
npm run test:load:prod
```

## Security Testleri

Onerilen hizli calistirma:

```powershell
npm run test:security
```

Bu komut:

- local hedefte calisir
- `2 worker` kullanir
- security suite'i production benzeri web server ile acmaya calisir

Tek browser session ile calistirma:

```powershell
npx playwright test tests/security/security.spec.ts --workers=1
```

Bu modda:

- tek test uretilir
- tek browser session kullanilir
- tarayici test bitene kadar kapanmaz

Headed debug:

```powershell
npm run test:security:headed
```

Security suite icinde kac route taranacagini gormek icin:

```powershell
npx playwright test tests/security/security.spec.ts --workers=1 --list
```

Beklenen format:

```text
Single browser session - full security scan (629 routes)
```

Not:

- `629 routes` sayisi su anki dogrulanmis envanterdir.
- Bunun `314` adedi static, `316` adedi UI uzerinden kesfedilen dinamik Maddi Dogrulama route'udur.
- Dinamik route listesi cache olarak [tests/security/maddi-dogrulama-routes.json](/c:/Users/lenov/source/repos/dev2ninovasyon/FasWebUI/tests/security/maddi-dogrulama-routes.json) dosyasina yazilir.

## Playwright Raporu Acma

Security veya diger Playwright testlerinden sonra HTML raporu acmak icin:

```powershell
npx playwright show-report tests/e2e/reports/playwright-html-report
```

Ayni komut package script olarak da var:

```powershell
npm run e2e:report
```

Rapor klasoru:

[tests/e2e/reports/playwright-html-report](/c:/Users/lenov/source/repos/dev2ninovasyon/FasWebUI/tests/e2e/reports/playwright-html-report)

## Belirli Test Dosyalari

Ana E2E spec:

```powershell
npx playwright test tests/e2e/main.spec.ts
```

Security spec:

```powershell
npx playwright test tests/security/security.spec.ts
```

Resilience spec:

```powershell
npx playwright test tests/security/resilience.spec.ts
```

Diger mevcut Playwright spec ornekleri:

```powershell
npx playwright test e2e/security/SecurityAudit.spec.ts --headed
```

```powershell
$env:E_DEFTER_XML_DIR='C:\ornek\klasor'
npx playwright test e2e/e-defter-load.spec.ts --workers=5 --headed
```

## Notlar

- E2E testleri oncesinde hedef ortamin ayakta oldugunu dogrulayin.
- `.next/lock` veya benzeri kilit hatalarinda eski `next` sureclerini kapatip testi tekrar calistirin.
- Security suite icin en stabil komut `npm run test:security` komutudur.
- Headed mod daha yavas calisir; sadece debug icin kullanin.
- E2E yapi detaylari icin [tests/e2e/README.md](/c:/Users/lenov/source/repos/dev2ninovasyon/FasWebUI/tests/e2e/README.md) dosyasina bakin.
