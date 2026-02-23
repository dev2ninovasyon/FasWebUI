# Proje Test Çalıştırma Rehberi (FasWebAPI & FasWebUI)

Bu rehber, hem backend (`FasWebAPI`) hem de frontend (`FasWebUI`) projeleri için yazılmış olan testlerin nasıl çalıştırılacağını adım adım açıklamaktadır.

---

## 🏗️ 1. Backend (FasWebAPI) Testleri

Backend projesinde **Birim (Unit)** ve **Entegrasyon (Integration)** testleri bulunmaktadır. Testleri çalıştırmak için `dotnet` CLI komutları kullanılır.

### 🔹 Tüm Testleri Çalıştırma
Tüm testleri (hem Unit hem Integration) tek seferde çalıştırmak için `FasWebAPI` dizininde şu komutu çalıştırın:
```bash
cd c:\Users\lenov\source\repos\dev2ninovasyon\FasWebAPI
dotnet test
```

### 🔹 Sadece Birim Testlerini (Unit Tests) Çalıştırma
Sadece `FasWebAPI.UnitTests` projesindeki testleri çalıştırmak için:
```bash
cd c:\Users\lenov\source\repos\dev2ninovasyon\FasWebAPI\FasWebAPI.UnitTests
dotnet test
```

### 🔹 Sadece Entegrasyon Testlerini (Integration Tests) Çalıştırma
Sadece `FasWebAPI.IntegrationTests` projesindeki testleri çalıştırmak için:
```bash
cd c:\Users\lenov\source\repos\dev2ninovasyon\FasWebAPI\FasWebAPI.IntegrationTests
dotnet test
```

---

## 🎨 2. Frontend (FasWebUI) Testleri

Frontend projesinde **Jest**, **Vitest** ve **Playwright** yapıları üzerine kurulu çeşitli test scriptleri tanımlanmıştır. Tüm komutlar `FasWebUI` dizininde çalıştırılır.

Öncelikle terminal veya PowerShell üzerinden ilgili klasöre gidin:
```bash
cd c:\Users\lenov\source\repos\dev2ninovasyon\FasWebUI
```

### 🔹 Tüm Jest Testlerini Çalıştırma
Projeye ait temel Jest testlerini bir kez çalıştırmak için:
```bash
npm run test
```

### 🔹 Testleri İzleme (Watch) Modunda Çalıştırma (Jest)
Geliştirme yaparken dosya değişikliklerinde testlerin otomatik tetiklenmesini ve anında sonuç vermesini istiyorsanız:
```bash
npm run test:watch
```

### 🔹 Test Kapsam (Coverage) Raporu Alma (Jest)
Yazılan testlerin kodun ne kadarını (yüzde kaçını) kapsadığını ve test edilmeyen satırları görmek için:
```bash
npm run test:coverage
```

### 🔹 Unit (Birim) Testlerini Çalıştırma (Vitest)
Vitest kullanılarak yazılmış özel birim testlerinizi çalıştırmak için:
```bash
npm run test:unit
```

### 🔹 Uçtan Uca (E2E) Testleri Çalıştırma (Playwright)
Kullanıcı deneyimini tarayıcı üzerinden simüle eden Playwright testlerini headless (görünmez) olarak başlatmak için:
```bash
npm run test:e2e
```

### 🔹 Uçtan Uca (E2E) Testleri Arayüz (UI) Modunda Çalıştırma
Playwright testlerinin tarayıcıdaki tüm adımlarını, tıklamalarını ve navigasyonlarını görsel bir arayüz ile incelemek için:
```bash
npm run test:e2e:ui
```
