# ⚡ Skill: Kidem Tazminatı Hesaplama Modülü & AI Fiş Oluşturma

**Proje**: FasWebUI - Finansal Denetim Yazılımı  
**Alanı**: Hesaplama Modülleri, AI Fiş Oluşturma, Backend API Entegrasyonu  
**Versiyon**: 1.0

---

## 📋 Amaç

Kidem tazminatı hesaplaması ve FasAI tarafından otomatik fiş oluşturma işlemlerini yönetmek. Backend API'lerle iletişim, fiş ön izlemesi ve e-deftere kaydetme işlemlerini güvenilir şekilde yapma.

---

## 🎯 Kapsam

### ✅ Bu Skill'in Sorumlu Olduğu Alanlar

1. **Frontend Hesaplama Sayfaları**
   - `src/app/(Uygulama)/Hesaplamalar/KidemTazminatiBobi/page.tsx`
   - `src/app/(Uygulama)/Hesaplamalar/KidemTazminatiTfrs/page.tsx`

2. **Fiş Oluşturma & Yönetimi**
   - `src/app/(Uygulama)/Hesaplamalar/KidemTazminatiBobi/KidemTazminatiBobiOrnekFisler.tsx`
   - Fiş tablosu (Handsontable grid)
   - Fiş kaydetme işlemleri

3. **Backend API Çağrıları**
   - `GET /Hesaplamalar/KidemHesapla` (Hesaplama & AI fiş oluşturma)
   - `POST /Donusum/DonusumFisleri` (Fiş kaydetme)
   - `POST /Hesaplamalar/KidemTazminatiBobiEkBilgi` (Ek bilgiler)

4. **Veri Yönetimi**
   - `src/api/Veri/KidemTazminatiBobi.ts`
   - CRUD işlemleri

---

## 🛠️ Teknik Stack

| Teknoloji | Kullanım |
|-----------|----------|
| **Next.js 16.1.6** | Framework |
| **React + TypeScript** | Frontend |
| **Material-UI (MUI)** | Bileşen Kütüphanesi |
| **Handsontable** | Fiş Tablosu Grid |
| **Redux** | State Management |
| **TanStack Query** | API Caching (isteğe bağlı) |

---

## 📁 Dosya Yapısı

```
src/
├── app/(Uygulama)/Hesaplamalar/
│   ├── KidemTazminatiBobi/
│   │   ├── page.tsx (Ana sayfa - 2250+ satır)
│   │   ├── KidemTazminatiBobiOrnekFisler.tsx (Fiş tablosu)
│   │   ├── KidemTazminatiBobiVeriYukleme.tsx (Personel verisi)
│   │   └── KidemTazminatiBobiHesaplama.tsx (Hesaplama sonuçları)
│   └── KidemTazminatiTfrs/
│       └── page.tsx (TFRS hesaplama)
│
├── api/
│   ├── Hesaplamalar/
│   │   └── Hesaplamalar.ts
│   │       ├── createKidemTazminatiBobiHesapla() (Line 315)
│   │       └── createKidemTazminatiBobiEkBilgi() (Line 359)
│   │
│   ├── Donusum/
│   │   └── FisGirisi.ts
│   │       └── createFisGirisiVerisi() (Line 4)
│   │
│   └── Veri/
│       └── KidemTazminatiBobi.ts
│           ├── getBilgiler()
│           ├── setBilgiler()
│           └── deleteBilgiler()
│
└── types/
    └── (Kidem Tazminatı ilişkili tipler)
```

---

## 🔄 İş Akışı (Workflow)

```
┌────────────────────────────────────────────────────────────────┐
│ 1. PERSONEL VERİSİ YÜKLEME                                    │
│    - KidemTazminatiBobiVeriYukleme.tsx                         │
│    - Excel/CSV işçi ve yönetici verisi                        │
└──────────────────────┬─────────────────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────────────────┐
│ 2. HESAPLA BUTONU (handleHesapla)                             │
│    - page.tsx:215                                              │
│    - fetchData2() çağrısı                                      │
└──────────────────────┬─────────────────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────────────────┐
│ 3. BACKEND AI HESAPLAMA                                       │
│    - GET /Hesaplamalar/KidemHesapla                           │
│    - FasAI: Otomatik fiş oluştur (ornekFisler[])              │
│    - Response: kidem.ornekFisler[]                            │
└──────────────────────┬─────────────────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────────────────┐
│ 4. FİŞ ÖN İZLEMESİ                                            │
│    - KidemTazminatiBobiOrnekFisler.tsx                        │
│    - Handsontable grid ile göster                              │
│    - "Sizin için oluşturduğum fişleri kaydetmek               │
│      ister misiniz?" mesajı                                    │
└──────────────────────┬─────────────────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────────────────┐
│ 5. FİŞ KAYDETME ONAYLAMASI                                    │
│    - handleKaydet() (KidemTazminatiBobiOrnekFisler.tsx:54)    │
│    - Veri parse et ve dönüştür                                │
└──────────────────────┬─────────────────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────────────────┐
│ 6. E-DEFTERE KAYIT                                            │
│    - POST /Donusum/DonusumFisleri                             │
│    - konsolidasyonMu=false parametresi                        │
│    - Fiş kayıtları muhasebe deftere eklenir                  │
└────────────────────────────────────────────────────────────────┘
```

---

## 💡 Temel Konseptler

### Fiş Yapısı (Voucher Structure)
```typescript
interface DonusumFisi {
  denetciId: number;
  denetlenenId: number;
  yil: number;
  yevmiyeNo: string;        // Günlük numarası
  fisTipi: string;          // "Kidem Tazminatı", vb.
  detayKodu: string;        // Muhasebe kodu
  hesapAdi: string;         // Hesap adı
  borc: number;             // Borç tutarı
  alacak: number;           // Alacak tutarı
  aciklama: string;         // Fiş açıklaması
  tarih: string;            // Tarih (YYYY-MM-DD)
}
```

### API Kalıpları
```typescript
// 1. Hesaplama Başlatma
const kidem = await createKidemTazminatiBobiHesapla(
  denetciId,
  yil,
  denetlenenId
);
// Response: { ornekFisler: [...], ... }

// 2. Fiş Kaydetme
await createFisGirisiVerisi({
  denetciId,
  denetlenenId,
  yil,
  yevmiyeNo,
  fisTipi,
  detayKodu,
  hesapAdi,
  borc,
  alacak,
  aciklama,
  tarih
});

// 3. Ek Bilgiler (İsteğe bağlı)
await createKidemTazminatiBobiEkBilgi({...});
```

---

## 🎨 Component Patterns

### State Yönetimi
```typescript
// Ana page.tsx'de global state
const [hesaplama, setHesaplama] = useState(null);
const [fisList, setFisList] = useState([]);
const [floatingButtonTiklandimi, setFloatingButtonTiklandimi] = useState(false);
```

### UI Bileşenleri
- **Grid Layout**: MUI Grid - Denetçi/Denetlenen/Yıl seçimi
- **Handsontable**: Fiş tablosu
- **Dialog/Modal**: Fiş kaydetme onayı
- **Button**: "Hesapla", "Kaydet", "İptal"

---

## 🔐 Best Practices

### 1. **Error Handling**
```typescript
try {
  const kidem = await createKidemTazminatiBobiHesapla(...);
  if (!kidem || !kidem.ornekFisler) {
    enqueueSnackbar("Hesaplama başarısız", { variant: "error" });
    return;
  }
} catch (error) {
  console.error("API Error:", error);
  enqueueSnackbar("Bir hata oluştu", { variant: "error" });
}
```

### 2. **Validasyon**
- Personel verisi boş mu kontrolü
- Fiş tutarları (borç + alacak dengesi)
- Tarih geçerliliği

### 3. **Performance**
- Büyük fiş listeleri için pagination
- Handsontable virtualization
- API caching (eğer gerekli ise)

### 4. **UX**
- Loading indicator sırasında disable et butonları
- Success/Error snackbar mesajları
- Fiş önceki ızlemesi (Handsontable read-only mod)
- "Sizin için oluşturduğum" mesajı kullanıcıyı bilgilendir

---

## 🚀 Geliştirme Yönergeleri

### Yeni Fiş Oluşturma Modülü Eklemek İçin

1. **Backend Endpoint Oluştur**
   ```
   GET /Hesaplamalar/YeniFisHesapla?denetciId=...&yil=...
   Response: { ornekFisler: [...] }
   ```

2. **API Wrapper Oluştur** (`src/api/Hesaplamalar/Hesaplamalar.ts`)
   ```typescript
   export const createYeniFisHesapla = async (...) => {
     return apiFetch(`/Hesaplamalar/YeniFisHesapla?...`);
   };
   ```

3. **Page Komponenti Oluştur**
   - Seçim inputları (Denetçi, Denetlenen, Yıl)
   - Veri yükleme bileşeni
   - Hesapla butonu → handleHesapla()
   - Fiş tablosu bileşeni

4. **Fiş Tablosu Bileşeni**
   - Handsontable grid
   - Kaydet butonu → handleKaydet()
   - POST /Donusum/DonusumFisleri

---

## 📊 Geçerli Modüller

| Modül | Dosya | Backend Endpoint | Durum |
|-------|-------|------------------|-------|
| **Kidem Tazminatı (BOBI)** | `KidemTazminatiBobi/page.tsx` | GET `/Hesaplamalar/KidemHesapla` | ✅ Aktif |
| **Kidem Tazminatı (TFRS)** | `KidemTazminatiTfrs/page.tsx` | GET `/Hesaplamalar/KidemTfrsHesapla` | ✅ Aktif |
| **Vadeli Banka Mevduatı** | `VadeliBankaMevduati/.../` | POST `/Hesaplamalar/...` | ✅ Aktif |
| **Kur Farkı** | `KurFarkiKayitlari/...` | GET `/Hesaplamalar/...` | ✅ Aktif |
| **İlişkili Taraf** | `IliskiliTarafSiniflama/...` | POST `/Hesaplamalar/...` | ✅ Aktif |

---

## 🔍 Debugging Tips

### Problem: Fiş oluşturulmuyor
1. Network tab'da API çağrısını kontrol et
2. Backend response'ı kontrol et (ornekFisler array'i boş mu?)
3. Console'da hata mesajını oku

### Problem: Fiş kayıt hatası
1. Fiş verisi formatını kontrol et (borç/alacak sayısal mı?)
2. Tarih formatı doğru mu? (YYYY-MM-DD)
3. API endpoint'in path'i doğru mu?

### Problem: Handsontable görünmüyor
1. CSS import'ları kontrol et
2. Grid data'sı yüklü mü?
3. Browser console'da React hataları var mı?

---

## 📚 Kaynaklar

- **Handsontable Docs**: https://handsontable.com/docs
- **Material-UI**: https://mui.com/
- **Next.js**: https://nextjs.org/docs
- **Redux**: https://redux.js.org/

---

## 🔗 İlişkili Dosyalar

- `src/api/Hesaplamalar/Hesaplamalar.ts` - Backend çağrıları
- `src/api/Donusum/FisGirisi.ts` - Fiş kayıt API'si
- `src/api/Veri/KidemTazminatiBobi.ts` - Veri yönetimi
- `src/types/` - TypeScript interface'leri

---

## 📝 Notlar

- FasAI backend tarafından fiş oluşturur
- Tüm fiş modülleri aynı pattern'i takip eder
- Konsolidasyon işlemlerinde `konsolidasyonMu=false` kullan
- E-deftere gönderilen fişler otomatik borç-alacak kaydı yapılır

---

**Son Güncelleme**: 17 Mart 2026  
**Hazırlayan**: FasWebUI Development Team
