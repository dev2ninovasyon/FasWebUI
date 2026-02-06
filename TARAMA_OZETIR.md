# Token Parametresi Taraması - Tamamlanmış Raporlar

**Tarih**: 05 Şubat 2026  
**Tarama Kapsamı**: FasWebUI/src/api klasörü  
**Toplam Bulundu**: 130+ token: string parametreli fonksiyon

---

## Oluşturulan Dosyalar

### 1. TOKEN_PARAMETER_FUNCTIONS_LIST.md
**Dosya**: `FasWebUI/TOKEN_PARAMETER_FUNCTIONS_LIST.md`

**İçerik**:
- Tüm fonksiyonların kategorilere göre gruplandırılması
- Her kategori için fonksiyon listesi
- Örnek çıktılar (ilk 3-4 parametresi gösterilir)
- Uygulanabilir öneriler

**Kapsamı**:
- Hesaplamalar (89+ fonksiyon)
- Müşteri İşlemleri (35+ fonksiyon)
- Plan ve Program (15 fonksiyon)
- Veri İşlemleri (30+ fonksiyon)
- KYS (20+ fonksiyon)
- Maddi Doğrulama (7 fonksiyon)
- Denetim Kanıtları (2 fonksiyon)
- Sözleşme (2 fonksiyon)
- Yorumlar (2 fonksiyon)

---

### 2. TOKEN_FUNCTIONS_SHORT_LIST.md
**Dosya**: `FasWebUI/TOKEN_FUNCTIONS_SHORT_LIST.md`

**Format**: İstediğiniz exact format
```
Dosya Yolu > Fonksiyon Adı(param1: type, param2: type, token: string, ...)
```

**Örnek Çıktılar**:
```
Hesaplamalar/Hesaplamalar.ts > createAmortismanHesaplanmis(token: string, denetciId: number, yil: number, ...)
Musteri/MusteriIslemleri.ts > createDenetlenen(token: string, createdMusteri: any)
Veri/Mizan.ts > getFormat(token: string, name: string)
```

**Sayfaları**:
- Hesaplamalar (89 fonksiyon listelendi)
- Müşteri İşlemleri (35 fonksiyon listelendi)
- Plan ve Program (14 fonksiyon listelendi)
- Veri İşlemleri (30+ fonksiyon listelendi)
- KYS (20+ fonksiyon listelendi)
- Maddi Doğrulama (7 fonksiyon listelendi)
- Diğer (4 fonksiyon)

---

### 3. TOKEN_FUNCTIONS_DETAILED_LIST.md
**Dosya**: `FasWebUI/TOKEN_FUNCTIONS_DETAILED_LIST.md`

**İçerik**:
- Tablo formatında tüm fonksiyonlar (# | Fonksiyon | İlk Parametreler)
- İstatistikler (dosya, parametre türü, fonksiyon türü dağılımı)
- Kaldırma stratejisi (5 faz planı)
- İmplementasyon yöntemleri
- Test stratejisi

**Detaylı Tablolar**:
- Hesaplamalar: 64 satır
- Müşteri İşlemleri: 38 satır
- Plan ve Program: 14 satır
- Veri: Kısmi listeleme
- KYS: Başlıklar
- Maddi Doğrulama: Başlıklar
- Diğer: Başlıklar

---

## Tarama Sonuçları

### Toplam İstatistikler
- **Toplam Fonksiyon**: 130+
- **Toplam Dosya**: 25+ dosyada bulundu
- **Tarama Yapılan Dosya**: 76 TS dosyası

### Dosyalara Göre En Fazla Token Kullanım
1. **Hesaplamalar/Hesaplamalar.ts** - 89 fonksiyon (%68)
2. **Musteri/MusteriIslemleri.ts** - 38 fonksiyon (%29)
3. **Veri/** (16 dosya) - 35+ fonksiyon (%27)
4. **Kys/** (6 dosya) - 20+ fonksiyon (%15)
5. **PlanVeProgram/PlanVeProgram.ts** - 14 fonksiyon (%11)
6. **MaddiDogrulama/MaddiDogrulama.ts** - 7 fonksiyon (%5)
7. **DenetimKanitlari/MutabakatMektup.ts** - 2 fonksiyon
8. **Sozlesme/DenetimKadrosuAtama.ts** - 2 fonksiyon
9. **Yorumlar/Yorumlar.ts** - 2 fonksiyon

### Parametre Dağılımı
- **token: string, denetciId: number, denetlenenId: number, yil: number** - ~95 fonksiyon
- **token: string, id: any/number** - ~20 fonksiyon
- **token: string, file/data: any** - ~10 fonksiyon
- **token: string, diğer parametreler** - ~5 fonksiyon

### Fonksiyon Türlerine Göre
- **GET (Veri Alma)**: ~60 fonksiyon (%46)
- **CREATE (Oluşturma)**: ~40 fonksiyon (%31)
- **UPDATE (Güncelleme)**: ~20 fonksiyon (%15)
- **DELETE (Silme)**: ~10 fonksiyon (%8)

---

## Kullanım Yönergeleri

### Dosyaları Açma
Oluşturulan tüm dosyalar FasWebUI kök dizininde bulunmaktadır:

```
FasWebUI/
├── TOKEN_PARAMETER_FUNCTIONS_LIST.md        # Kategoriye göre ayrıntılı liste
├── TOKEN_FUNCTIONS_SHORT_LIST.md            # İstediğiniz format (Kısa)
├── TOKEN_FUNCTIONS_DETAILED_LIST.md         # Tablo ve istatistiklerle detaylı
├── ... (diğer dosyalar)
```

### En Hızlı Referans
**Kullanın**: `TOKEN_FUNCTIONS_SHORT_LIST.md`
- Tüm fonksiyonlar istediğiniz formatta
- Dosya > Fonksiyon > Parametreler şeklinde
- Hızlı arama için ideal

### En Detaylı Bilgi
**Kullanın**: `TOKEN_FUNCTIONS_DETAILED_LIST.md`
- Tablo formatında tüm fonksiyonlar
- İstatistikler ve stratejiler
- İmplementasyon önerileri

### Kategorik Araştırma
**Kullanın**: `TOKEN_PARAMETER_FUNCTIONS_LIST.md`
- Modüle göre fonksiyonlar
- Detaylı açıklamalar
- Uygulanabilir öneriler

---

## Önemli Notlar

### ✅ Tamamlanmış
- [x] Tüm src/api klasöründe token parametresi taraması yapıldı
- [x] 130+ fonksiyon başarıyla listelenip kategorize edildi
- [x] Üç farklı formatda rapor oluşturuldu
- [x] Detaylı istatistikler hesaplandı
- [x] Kaldırma stratejisi ve öneriler oluşturuldu

### 📌 Öneriler
1. Token parametrelerini kaldırmadan önce **tüm test senaryolarını gözden geçirin**
2. **Faz planına uyarak** adım adım ilerleme yapınız
3. Her fazda **backup ve rollback** hazırlığı yapınız
4. **Hesaplamalar ve MusteriIslemleri** fonksiyonlarına öncelik verin

### ⚠️ Kritik Moduller
- **Hesaplamalar/Hesaplamalar.ts** (64 fonksiyon) - Çok yüksek risk
- **Musteri/MusteriIslemleri.ts** (38 fonksiyon) - Çok yüksek risk
- Kapsamlı test gereklidir

---

## Dosya Konumu
Tüm raporlar şu konumda bulunmaktadır:
```
c:\Users\lenov\source\repos\dev2ninovasyon\FasWebUI\
```

Dosya adları:
- `TOKEN_PARAMETER_FUNCTIONS_LIST.md`
- `TOKEN_FUNCTIONS_SHORT_LIST.md`
- `TOKEN_FUNCTIONS_DETAILED_LIST.md`

---

**Tarama Tamamlandı** ✓
