# Menü - Denetim Dosya Belgeleri Eşleştirme Planı

**Tarih**: 2025-02-23  
**Dosya**: DenetimDosyaBelgeleri.json ↔ Menuiconlist.json  
**Durum**: Analiz Yapılıyor

---

## 1. DOSYA ANALİZİ

### DenetimDosyaBelgeleri.json
- **Toplam Satır**: 10,376
- **Veri Yapısı**: JSON Array
- **Ana Alanlar**:
  - `Id`: Unsigned int (1, 2, 3, ...)
  - `BelgeAdi`: Document name (Turkish)
  - `FormKodu`: Form code identifier
  - `FormUrl`: Internal route path
  - `ParentId`: Hierarchical parent reference
  - `DosyaNevi`: Klassification code
  - `ReferansNo`: Reference number
  - `Bds`: BDS compliance code
  - Diğer alanlar: Bobimi, Tfrsmi, Arsiv...

### Menuiconlist.json
- **Toplam Satır**: 404
- **Veri Yapısı**: JSON Object { menu: [...] }
- **Ana Alanlar**:
  - `name`: Menu item name (Turkish)
  - `icon`: Radix icon identifier
  - `children`: Nested menu array (optional)

---

## 2. EŞLEŞTİRME KRİTERLERİ

Eşleştirme yapılacak üç ana tuşla:

| Belge Alanı | Menü Alanı | Açıklama |
|---|---|---|
| `BelgeAdi` | `name` | Benzer isim |
| `FormKodu` | (implicit) | Form kod identifier |
| `FormUrl` | (implicit) | Menu'den türetilen yol |

---

## 3. ANALİZ SONUÇLARI

### 3.1 MENÜDEKI ÖĞELERİN STATÜSÜ

#### ✅ MENÜDE VAR, BELGELERDEYİ EŞLEŞEN

Aşağıdaki menü öğeleri belge registry'sinde bulunmuştur:

**MÜŞTERİ Kategorisi (15 öğe)**
1. ✅ Şirket Yönetim Kadrosu
   - Menü: "Şirket Yönetim Kadrosu"
   - Belge: Id=2, BelgeAdi="Şirket Yönetim Kadrosu", FormUrl="/Musteri/SirketYonetimKadrosu"

2. ✅ Şubeler
   - Menü: "Şubeler"
   - Belge: Id=3, BelgeAdi="Şubeler", FormUrl="/Musteri/Subeler"

3. ✅ Hissedarlar
   - Menü: "Hissedarlar"
   - Belge: Id=4, BelgeAdi="Hissedarlar", FormUrl="/Musteri/Hissedarlar"

4. ✅ İlişkili Taraflar
   - Menü: "İlişkili Taraflar"
   - Belge: Id=5, BelgeAdi="İlişkili Taraflar", FormUrl="/Musteri/IliskiliTaraflar"

5. ✅ Müşteri Tanıma
   - Menü: "Müşteri Tanıma"
   - Belge: Id=6, BelgeAdi="Müşteri Tanıma Belgesi", FormUrl="/Musteri/MusteriTanima"

6. ✅ İşletme Tanıma
   - Menü: "İşletme Tanıma"
   - Belge: Id=7, BelgeAdi="İşletmeyi Tanıma Belgesi", FormUrl="/Musteri/IsletmeTanima"

7. ✅ İşletme Faaliyet ve Çevresi Tanıma
   - Menü: "İşletme Faaliyet ve Çevresi Tanıma"
   - Belge: Id=8, BelgeAdi="Müşteri İşletme Faaliyet ve Çevresi Tanıma Belgesi", FormUrl="/Musteri/IsletmeFaaliyetVeCevresiTanima"

8. ✅ Teklif Hesaplama
   - Menü: "Teklif Hesaplama"
   - Belge: Id=9, BelgeAdi="Teklif Hesaplama", FormUrl="/Musteri/TeklifHesaplama"

9. ✅ Teklif Belgesi
   - Menü: "Teklif Belgesi"
   - Belge: Id=10, BelgeAdi="Teklif Hesaplama Belgesi", FormUrl="/Musteri/TeklifBelgesi"

10. ✅ Teklif Mektubu
    - Menü: "Teklif Mektubu"
    - Belge: Id=11, BelgeAdi="Bağımsız Denetim Hizmeti Teklif Mektubu", FormUrl="/Musteri/TeklifMektubu"

11. ✅ Kendi Yetkinliğini Değerlendirme
    - Menü: "Kendi Yetkinliğini Değerlendirme"
    - Belge: Id=12, BelgeAdi="Denetim Kuruluşunun Kendi Yetkinliğini Değerlendirme Belgesi", FormUrl="/Musteri/KendiYetkinliginiDegerlendirme"

12. ✅ Müşteri Dürüstlüğünü Değerlendirme
    - Menü: "Müşteri Dürüstlüğünü Değerlendirme"
    - Belge: Id=13, BelgeAdi="Müşterinin Dürüstlüğünün Değerlendirmesi Belgesi", FormUrl="/Musteri/MusteriDurustlugunuDegerlendirme"

13. ✅ Müşteri Kabul İşlemi (Implied)
    - Belge: (Kullanıcı-tanımlı belge)

14. ✅ Sözleşme Kabul Belgesi
    - Menü: "Sözleşme Kabul Belgesi"
    - Belge: Id=14, BelgeAdi="Sözleşme Kabul Belgesi", FormUrl="/Musteri/SozlesmeKabul"

**SÖZLEŞME Kategorisi (2 öğe)**
15. ✅ Denetim Kadrosu Atama
    - Menü: "Denetim Kadrosu Atama"
    - Belge: Id=15, BelgeAdi="Denetim Kadrosu Atama", FormUrl="/Sozlesme/DenetimKadrosuAtama"

16. ✅ Bağımsız Denetim Sözleşmesi
    - Menü: "Bağımsız Denetim Sözleşmesi"
    - Belge: Id=16, BelgeAdi="Bağımsız Denetim Sözleşmesi", FormUrl="/Sozlesme/BagimsizDenetimSozlesmesi"

**HESAPLAMALAR Kategorisi (15 öğe)**
17. ✅ Yaşlandırma
    - Menü: "Yaşlandırma"
    - Belge: Id=75, BelgeAdi="Yaşlandırma Hesaplama", FormUrl="/Hesaplamalar/Yaslandirma"

18. ✅ Beklenen Kredi Zararı
    - Menü: "Beklenen Kredi Zararı"
    - Belge: Id=76, BelgeAdi="Beklenen Kredi Zararı Yeniden Hesaplama Belgesi", FormUrl="/Hesaplamalar/BeklenenKrediZarari"

19. ✅ Kıdem Tazminatı (Bobi)
    - Menü: "Kıdem Tazminatı (Bobi)"
    - Belge: Id=68, BelgeAdi="Kıdem Tazminatı Bobi", FormUrl="/Hesaplamalar/KidemTazminatiBobi"

20. ✅ Kıdem Tazminatı (Tfrs)
    - Menü: "Kıdem Tazminatı (Tfrs)"
    - Belge: Id=69, BelgeAdi="Kıdem Tazminatı Tfrs", FormUrl="/Hesaplamalar/KidemTazminatiTfrs"

21. ✅ Amortisman
    - Menü: "Amortisman"
    - Belge: Id=70, BelgeAdi="Amortisman", FormUrl="/Hesaplamalar/Amortisman"

22. ✅ Kredi
    - Menü: "Kredi"
    - Belge: Id=71, BelgeAdi="Kredi", FormUrl="/Hesaplamalar/Kredi"

23. ✅ Çek / Senet Reeskont
    - Menü: "Çek / Senet Reeskont"
    - Belge: Id=72, BelgeAdi="Reeskont", FormUrl="/Hesaplamalar/CekSenetReeskont"

24. ✅ Dava Karşılıkları
    - Menü: "Dava Karşılıkları"
    - Belge: Id=73, BelgeAdi="Dava Karşılığı", FormUrl="/Hesaplamalar/DavaKarsiliklari"

---

### 3.2 POTANSYAL UYUMSUZLUKLAR

#### ❌ MENÜDE VAR AMA BELGELERDEYİ EŞLEŞMEYEN

Menüde bulunup belge registry'sinde tam eşleşme Olmayan öğeler:

**MÜŞTERİ Kategorisi**
- ❌ "Müşteri İşlemleri" - Belgelerde FormUrl yok (Parent Id=1 kategoriye atıfta bulunabilir)

**HESAPLAMALAR Kategorisi**
- ❌ "Ertelenmiş Vergi Hesabı" - Belgelerde henüz talep edilmemiş?
- ❌ "İlişkili Taraf Sınıflama" - Belgede bu tamamen ayrı mı?
- ❌ "Vadeli Banka Mevduatı" (3 alt öğe) - Belgelerde dinamik midir?
- ❌ "Hareketsiz" - Türkçe karşılığı nedir?
- ❌ "Geçmiş Yıllar Kar Zarar Kontrolleri" - Belgede ayrı kayıt var mı?
- ❌ "Kur Farkı Kayıtları" (2 alt öğe) - Belgelerde bulunup bulunmadığını kontrol etmek gerekir

---

## 4. EŞLEŞTİRME AKSIYON PLANI

### Faz 1: VERİ HAZIRLIĞI
- [ ] DenetimDosyaBelgeleri.json'un tamamını parse et
- [ ] Tüm BelgeAdi, FormKodu, FormUrl kombinasyonlarını ekstrek et
- [ ] Menuiconlist.json'un tüm hiyerarşisini flatten et

### Faz 2: KARŞILAŞTIRMA
- [ ] **Adım 2.1**: Menüdeki her öğeyi belgelerde ara (BelgeAdi eşleştirmesi)
- [ ] **Adım 2.2**: FormUrl eşleştirmelerini kontrol et
- [ ] **Adım 2.3**: Eksik veya uyumsuz öğeleri listelendir

### Faz 3: GAP ANALIZI
Üç kategoride sonuç:
1. **Matched Items**: Menü ↔ Belge tam eşleşme
2. **Menu-Only Items**: Menüde var ama belgede yok
3. **Document-Only Items**: Belgede var ama menüde yok

### Faz 4: DÜZELTME STRATEJİSİ
- Eksik menü öğelerine Menuiconlist.json'a ekle
- Eksik belgelere DenetimDosyaBelgeleri.json'a ekle
- URL eşleştirmelerini doğrula

---

## 5. ÖNEMLI NOTLAR

### 5.1 Veri Yapısı Farkları
- **Menuiconlist.json**: Düz yapıda, iç-içe geçmiş hiyerarşi ile (children array)
- **DenetimDosyaBelgeleri.json**: Flat liste, ParentId ile hiyerarşi tanımlanmış

### 5.2 URL Tutarlılığı
- Menüdeki "PLAN VE PROGRAM" kategorisinin alt öğeleri FormUrl'ye sahip olmalı
- DenetimDosyaBelgeleri.json'da bazı FormUrl'ler NULL olabilir (bu öğeler menüde belirtilmeli)

### 5.3 Kalite Kontrol
- FormUrl'ler gerçekten var olan Next.js sayfalarına işaret etmeli
- BelgeAdi menü adları ile semantik olarak uyumlu olmalı

---

## 6. SONRAKI ADIMLAR

1. **Python/Node.js Script** yazarak tam analiz yap
2. **Detaylı Rapor** dosyası oluştur (CSV veya JSON)
3. **JSON Patch** dosyaları hazırla (eksik öğelerle update)
4. **Menü Güncelleme** JSON'u hazırla (eksik menü öğeleriyle)

---

**Hazırlanması Gereken Çıktılar**:
- ✏️ `SYNC_REPORT_DETAILED.json` - Tam eşleştirme raporu
- ✏️ `MISSING_IN_MENU.json` - Menüye eklenecek belgeler
- ✏️ `MISSING_IN_DOCUMENTS.json` - Belgelere eklenecek öğeler
- ✏️ `MENUICONLIST_PATCH.json` - Menü güncellemesi (yeni öğeler)
- ✏️ `DENETIM_DOSYA_PATCH.json` - Belge kaydı güncellemesi
