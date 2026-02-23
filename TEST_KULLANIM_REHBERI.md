# Playwright Test Kullanım Rehberi

Bu rehber, projedeki otomatik testlerin nasıl çalıştırılacağı, raporlanacağı ve hata ayıklanacağı ile ilgili bilgileri içerir.

## 🚀 Testleri Çalıştırma

Testleri çalıştırmadan önce **Next.js geliştirme sunucusunun** (npm run dev) veya prodüksiyon build'inin çalıştığından emin olun.

### Tüm Testleri Çalıştır
```bash
npx playwright test
```

### Belirli Bir Testi Çalıştır (Örn: E-Defter Yükleme)
```bash
npx playwright test e-defter-load.spec.ts
```

### Paralel Çalıştırma (Worker Sayısını Belirleme)
E-Defter yükleme gibi ağır testleri belirli sayıda paralel worker ile çalıştırmak sistem kaynaklarını optimize eder:
```bash
npx playwright test e-defter-load.spec.ts --workers=5
```

---

## 📊 Raporlama ve Hata Ayıklama

### HTML Raporunu Görüntüle
Testler tamamlandıktan sonra detaylı bir HTML raporu oluşturulur. Bu raporu açmak için:
```bash
npx playwright show-report
```

### UI Modu (Görsel Hata Ayıklama)
Testleri adım adım izlemek ve hata ayıklamak için UI modunu kullanabilirsiniz:
```bash
npx playwright test --ui
```

### Hata Durumunda Ekran Kaydı ve Trace
Hata alan testler için otomatik olarak:
- **Trace**: Adım adım DOM durumu ve network logları.
- **Video**: Testin tüm sürecinin ekran kaydı.
- **Screenshot**: Hata anının fotoğrafı.

Bu dosyalara `playwright-report` klasöründeki HTML raporu üzerinden erişebilirsiniz.

---

## 📝 E-Defter Yükleme Testi (e-defter-load.spec.ts) Özellikleri

Bu test, sistemin yük altındaki performansını ve doğruluğunu ölçmek için tasarlanmıştır:
1. **Çoklu Şirket Desteği**: 5 farklı şirket/denetlenen ID'si için paralel işlem yapar.
2. **Toplu Yükleme**: Her şirket için 12 adet (yıllık) büyük XML dosyasını otomatik seçer ve yükler.
3. **Smart Polling**: Yükleme sonrası "İşleniyor" durumlarını takip eder ve tüm süreç tamamlanana kadar (maksimum 20 dk) bekler.
4. **Adımlı Raporlama**: HTML raporunda her aşama (Yükleme, Polling, Kontrol) ayrı adımlar olarak görünür.

### Test Verisi Hazırlığı
`e2e/e-defter-load.spec.ts` dosyasındaki `XML_FOLDER_PATH` değişkeninin bilgisayarınızdaki XML dosyalarının bulunduğu doğru yolu gösterdiğinden emin olun.

---

## 🛠️ Yeni Test Ekleme
Yeni bir test eklemek için `e2e` klasörü altında `.spec.ts` uzantılı bir dosya oluşturmanız yeterlidir. Ortak fonksiyonlar için `e2e/helpers` klasörünü kullanabilirsiniz.
