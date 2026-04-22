# Handsontable Çalışma Kağıdı Standartları ve AI Tooling Kılavuzu

Bu dosya, projedeki Handsontable tabanlı çalışma kağıtları için geliştirilen modern UI/UX ve AI özelliklerinin nasıl uygulanacağını açıklar. Bir "Çalışma Kağıdı" istendiğinde bu standartlar takip edilmelidir.

## 1. Tablo Düzeni ve Responsive Yapı (Width Management)

Tabloların sağ tarafında boşluk kalmaması ve yatay scroll oluşmaması için şu yapı uygulanmalıdır:

- **Sütun Sıralaması:** En uzun metne sahip olan ve esnemesi istenen sütun (genellikle "Açıklama / Tespit") her zaman **en sonda** olmalıdır.
- **StretchH Ayarı:** JSX içinde `stretchH="last"` kullanılmalıdır. Bu sayede son sütun kalan tüm boşluğu milimetrik olarak doldurur.
- **Dinamik Genişlik Hesaplama (`applyWidth`):**
  - `ResizeObserver` kullanılarak container genişliği takip edilmelidir.
  - Sabit sütunlara (No, Risk, Yanıt vb.) kesin pikseller verilmeli, esnek sütunlar (Soru gibi) kalan alanın yüzdesi olarak hesaplanmalıdır.
  - `hot.updateSettings({ colWidths: [...] })` ile genişlikler güncellenmelidir.
- **GlobalStyles:** Hücre içi metinlerin düzgün wrap edilmesi için `.ht-cell-clamp` CSS sınıfı ve `white-space: pre-wrap` kuralları eklenmelidir.

## 2. SpeechTextEditor (Hücre İçi Editör)

Her metin hücresi `editor: "speech-text"` kullanmalıdır. Bu editör şu özelliklere sahiptir:

- **İkon Butonları:** Editör açıldığında hücrenin altında 3 ana buton bulunur:
  - **FasAI (Yıldız):** Hızlı AI zenginleştirme menüsünü açar.
  - **Panel (Ok/Kutu):** Detaylı düzenleme için sağ Drawer paneli açar.
  - **Mikrofon:** Sesli yazma özelliğini başlatır.
- **Dinamik Tooltip/Hint:** Butonların üzerine gelindiğinde tablonun sol alt köşesindeki hint alanında butonun işlevi (ör: "Sesle Yaz") görünmelidir.
- **Görsel Standart:** Butonlar 26x26px, yuvarlak ve modern ikonlar (`AutoAwesomeRoundedIcon` vb.) kullanmalıdır.

## 3. Drawer AI & Düzenleme Paneli

Karmaşık metin girişleri için sağdan açılan bir `Drawer` paneli bulunmalıdır:

- **AI Prompts:** Panelde "Zenginleştir", "Özetle", "Detaylandır" gibi hazır AI komutları (Gemini tabanlı) Chip/Buton olarak sunulmalıdır.
- **Sesli Yazma:** `webkitSpeechRecognition` API entegrasyonu ile panel içinden sesli veri girişi yapılabilmelidir.
- **Canlı Önizleme:** AI çıktısı panelde görünmeli ve "Tabloya Uygula" butonu ile hücreye aktarılmalıdır.

## 4. Renderer Standartları

- **Metin Hücreleri:** `islemRenderer` veya `tespitRenderer` kullanılmalıdır.
- **Cell Clamping:** Metinler 3 satırla sınırlanmalı (`-webkit-line-clamp: 3`), satır yüksekliği sabit (`72px`) kalmalıdır.
- **Placeholder:** Hücre boşsa "Evet içeriği" veya "Hayır içeriği" soluk ve italik olarak renderer içinde gösterilmelidir.

## 5. Uygulama Şablonu (Kısa Özet)

```typescript
// 1. İndeksleri tanımla
const COL_TESPIT = 5; // Her zaman son sütun (esneme için)

// 2. Sütun tanımı
const columns = [
  { width: 40, ... }, // Sabit
  { renderer: tespitRenderer, editor: "speech-text" } // Esnek (Genişlik vermeyin)
];

// 3. JSX
<CalismaKagitiHotTable
  stretchH="last"
  width="100%"
  ...
/>
```

---
**Önemli Not:** Yeni bir çalışma kağıdı yaparken bu AI ve genişlik mantığı kopyalanarak sayfaya özel (BDS referansı, Soru metni vb.) özelleştirmeler eklenmelidir.
