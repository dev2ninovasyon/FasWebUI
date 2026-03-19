# FAS Test Stratejisi

Bu doküman, FAS (Finansal Analiz Sistemi) projesi için uygulanan Kurumsal Test Mimarisi yaklaşımlarını açıklar.

## 1. Mimari Prensipler
Sistemimiz UI (FasWebUI) ve API (FasWebAPI) olmak üzere iki ana bağımsız bileşenden oluştuğu için test stratejimizde **"Ayır ama Gerçekçi Entegre Et" (Decoupled but Real-World Integrated)** modelini benimsiyoruz.

- **Backend Testleri (K6):** FasWebAPI repository'sinde barınır. Sadece API yanıt sürelerine, hata oranlarına ve sistemin HTTP trafik yükü altındaki kararlılığına odaklanır.
- **UI Testleri (Playwright):** FasWebUI repository'sinde barınır. Ancak mock veri kullanmaz. Müşterinin deneyimlediği gibi **gerçek Backend API** ortamına bağlanır, DOM render sürelerini ve kullanıcı akışlarını (liste yükleme, filtreleme) doğrular. 

## 2. Araç Seçimleri ve Nedenleri
* **Neden K6 (Backend)?** Golang tabanlı, çok düşük kaynak tüketerek binlerce Sanal Kullanıcı (VU) simüle edebilen modern bir yük testi aracıdır. C# projesinin içinde izole klasörde (`tests/performance/k6`) modüler JavaScript senaryoları ile barındırılır.
* **Neden Playwright (Frontend E2E)?** Modern web (React/Next.js) uygulamalarında Cypress'e göre daha hızlı, çoklu sekme (browser context) ve Page Object Model (POM) mimarisine çok daha uygundur. Gerçek Network trafiğini bekleme (`networkidle`) ve Trace alma yetenekleri çok güçlüdür.

## 3. Mock Yerine Neden Gerçek Backend?
UI'da Mock verilerle yapılan E2E testleri, "Veritabanı 5 saniye geç cevap verirse UI patlar mı?" sorusuna yanıt veremez. Amacımız sadece UI bileşenlerinin varlığını değil, uygulamanın entegre halde **doğru çalışıp çalışmadığını** kanıtlamaktır.

## 4. Smoke ve Full Senaryo Farkları
* **Smoke Testleri:** Sistemin sadece çalışır / ayakta (HealthCheck) olduğunu doğrular. Düşük VU (10-20), kısa süreli (30s) API testleridir. Veya UI'da sadece Login olup anasayfanın geldiğini doğrulayan ufak testlerdir. Canlıya (Production) atmadan hemen önce veya CI/CD pipeline başlangıcında tetiklenir.
* **Full E2E / Load Testleri:** Gerçekçi iş akışlarını kapsar. Mizan oluşturma, filtreleme işlemleri, binlerce satırın çekilmesi veya yüzlerce kullanıcının eşzamanlı `AmortismanHesapla` isteği atmasıdır. Gece (Nightly) build'lerde veya önemli Major versiyon geçişlerinde çalıştırılır.

## 5. Performans vs E2E (UI) Karşılaştırması
E2E (Playwright) uygulamada işlevselliğin ve görsel doğruluğun kanıtıdır (Login olabiliyor mu? Filtre çalışıyor mu?). Performans (K6) ise sistemin dayanıklılığının kanıtıdır (1000 kişi aynı anda filtre yaparsa sistem çöker mi? Veya gecikme P95 < 2 sn sağlaniyor mu?). İki test türü birbirini tamamlar.
