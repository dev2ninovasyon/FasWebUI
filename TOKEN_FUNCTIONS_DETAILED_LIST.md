# Token Parametreli Tüm Fonksiyonlar - Detaylı Listesi

## Tarama Sonucu Özeti
- **Tarama Tarihi**: 05 Şubat 2026
- **Tarama Kapsamı**: FasWebUI/src/api/ tüm .ts dosyaları
- **Bulundu**: 130+ adet token: string parametreli fonksiyon
- **Dosya Sayısı**: 76 TS dosyası, 25+ dosyada token parameter bulundu

---

## HESAPLAMALAR.TS (89 FONKSIYON)

### Kaynak Dosya: `Hesaplamalar/Hesaplamalar.ts`

| # | Fonksiyon | İlk Parametreler |
|---|-----------|-----------------|
| 1 | createAmortismanHesaplanmis | token: string, denetciId: number, yil: number, denetlenenId: number, hesaplamaYontemi: string |
| 2 | getAmortismanHesaplanmis | token: string, denetciId: number, yil: number, denetlenenId: number |
| 3 | createKrediHesaplanmis | token: string, denetciId: number, yil: number, denetlenenId: number |
| 4 | getKrediHesaplanmis | token: string, denetciId: number, yil: number, denetlenenId: number |
| 5 | getKrediHesaplanmisDetay | token: string, denetciId: number, yil: number, denetlenenId: number |
| 6 | getKrediHesaplanmisOrnekFisler | token: string, denetciId: number, yil: number, denetlenenId: number |
| 7 | createDavaKarsiliklariHesaplanmis | token: string, denetciId: number, yil: number, denetlenenId: number, iskontoOrani: number |
| 8 | getDavaKarsiliklariHesaplanmis | token: string, denetciId: number, yil: number, denetlenenId: number |
| 9 | createYaslandirmaHesaplanmis | token: string, denetciId: number, yil: number, denetlenenId: number |
| 10 | getYaslandirmaHesaplanmis | token: string, denetciId: number, yil: number, denetlenenId: number |
| 11 | createKidemTazminatiBobiHesapla | token: string, denetciId: number, yil: number, denetlenenId: number |
| 12 | createKidemTazminatiTfrsHesapla | token: string, denetciId: number, yil: number, denetlenenId: number |
| 13 | createKidemTazminatiBobiEkBilgi | token: string, createdKidemTazminatiBobiEkBilgiVerisi: any |
| 14 | getKidemTazminatiBobiEkBilgi | token: string, denetciId: number, yil: number, denetlenenId: number |
| 15 | createKidemTazminatiTfrsEkBilgi | token: string, createdKidemTazminatiTfrsEkBilgiVerisi: any |
| 16 | getKidemTazminatiTfrsEkBilgi | token: string, denetciId: number, yil: number, denetlenenId: number |
| 17 | createCekSenetReeskontHesapla | token: string, denetciId: number, yil: number, denetlenenId: number |
| 18 | createCekSenetReeskontEkBilgi | token: string, createdCekSenetReeskontEkBilgiVerisi: any |
| 19 | getCekSenetReeskontEkBilgi | token: string, denetciId: number, yil: number, denetlenenId: number |
| 20 | getCekSenetReeskontIskontoOranlari | token: string, oranAdi: string, yil: number |
| 21 | getCekSenetReeskontHesaplama | token: string, denetciId: number, yil: number, denetlenenId: number |
| 22 | getCekSenetReeskontDuzeltmeFarklari | token: string, denetciId: number, yil: number, denetlenenId: number |
| 23 | getCekSenetReeskontHesaplamadaKullanilanDegerler | token: string, denetciId: number, yil: number, denetlenenId: number |
| 24 | createBeklenenKrediZarariHesaplanmis | token: string, denetciId: number, yil: number, denetlenenId: number, oran: number, beklenenBugunkiDegerOrani: number |
| 25 | getBeklenenKrediZarariHesaplanmis | token: string, denetciId: number, yil: number, denetlenenId: number |
| 26 | getEnflasyonOrani | token: string, yil: number |
| 27 | getFaizOrani | token: string, yil: number |
| 28 | getIskontoOrani | token: string, yil: number |
| 29 | createVergiVarligiVeYukumlulugu | token: string, denetciId: number, yil: number, denetlenenId: number, vergiOrani: number, ... |
| 30 | getVergiVarligiVeYukumluluguOzet | token: string, denetciId: number, yil: number, denetlenenId: number |
| 31 | getVergiVarligi | token: string, denetciId: number, yil: number, denetlenenId: number, konsolide: boolean |
| 32 | getVergiYukumlulugu | token: string, denetciId: number, yil: number, denetlenenId: number, konsolide: boolean |
| 33 | getVergiVarligiVeYukumluluguOrnekFisler | token: string, denetciId: number, yil: number, denetlenenId: number |
| 34 | getIliskiliTarafSiniflamaHesaplar | token: string, denetciId: number, yil: number, denetlenenId: number |
| 35 | getIliskiliTarafSiniflama | token: string, denetciId: number, yil: number, denetlenenId: number, hesap: number, konsolide: boolean |
| 36 | getIliskiliTarafSiniflamaOrnekFisler | token: string, denetciId: number, yil: number, denetlenenId: number, json: any, kebirKodu: number, konsolide: boolean |
| 37 | createVadeliBankaMevduatiOtomatikSiniflama | token: string, denetciId: number, yil: number, denetlenenId: number, konsolide: boolean |
| 38 | createVadeliBankaMevduatOtomatikSiniflama | token: string, createdVadeliBankaMevduat: any, konsolide: boolean |
| 39 | getVadeliBankaMevduatiOtomatikSiniflama | token: string, denetciId: number, yil: number, denetlenenId: number, konsolide: boolean |
| 40 | getVadeliBankaMevduatiOtomatikSiniflamaOrnekFisler | token: string, denetciId: number, yil: number, denetlenenId: number, konsolide: boolean |
| 41 | deleteVadeliBankaMevduatiOtomatikSiniflamaById | token: string, id: number, konsolide: boolean |
| 42 | getVadeliBankaMevduatiManuelSiniflama | token: string, denetciId: number, yil: number, denetlenenId: number, konsolide: boolean |
| 43 | getVadeliBankaMevduatiManuelSiniflamaOrnekFisler | token: string, denetciId: number, yil: number, denetlenenId: number, json: any, konsolide: boolean |
| 44 | createVadeliBankaMevduatiFaizTahakkuk | token: string, denetciId: number, yil: number, denetlenenId: number, json: any, konsolide: boolean |
| 45 | getVadeliBankaMevduatiFaizTahakkuk | token: string, denetciId: number, yil: number, denetlenenId: number, konsolide: boolean |
| 46 | createHareketsizTicariAlacaklar | token: string, denetciId: number, yil: number, denetlenenId: number, acilisFisNo: number |
| 47 | createHareketsizTicariAlacak | token: string, createdHareketsizTicariAlacak: any |
| 48 | getHareketsizTicariAlacaklar | token: string, denetciId: number, yil: number, denetlenenId: number, konsolide: boolean |
| 49 | getHareketsizTicariAlacaklarOzet | token: string, denetciId: number, yil: number, denetlenenId: number, konsolide: boolean |
| 50 | getHareketsizTicariAlacaklarOrnekFisler | token: string, denetciId: number, yil: number, denetlenenId: number, konsolide: boolean |
| 51 | deleteHareketsizTicariAlacaklarById | token: string, id: number, konsolide: boolean |
| 52 | createHareketsizStoklar | token: string, denetciId: number, yil: number, denetlenenId: number, acilisFisNo: number, konsolide: boolean |
| 53 | createHareketsizStok | token: string, createdHareketsizStok: any, konsolide: boolean |
| 54 | getHareketsizStoklar | token: string, denetciId: number, yil: number, denetlenenId: number, konsolide: boolean |
| 55 | getHareketsizStoklarOzet | token: string, denetciId: number, yil: number, denetlenenId: number, konsolide: boolean |
| 56 | getHareketsizStoklarOrnekFisler | token: string, denetciId: number, yil: number, denetlenenId: number, konsolide: boolean |
| 57 | deleteHareketsizStoklarById | token: string, id: number, konsolide: boolean |
| 58 | getGecmisYilKarZararKontrol | token: string, denetciId: number, yil: number, denetlenenId: number |
| 59 | getGecmisYilKarZararKontrolOrnekFisler | token: string, denetciId: number, yil: number, denetlenenId: number |
| 60 | getKurFarki | token: string, denetciId: number, yil: number, denetlenenId: number |
| 61 | getKurFarkiKontrolleriOzet | token: string, denetciId: number, yil: number, denetlenenId: number, hesap: number, hesapNo: string, ... |
| 62 | getKurFarkiKontrolleriFisler | token: string, denetciId: number, yil: number, denetlenenId: number, hesap: number, hesapNo: string, ... |
| 63 | getKurFarkiOrnekFisler | token: string, denetciId: number, yil: number, denetlenenId: number |
| 64 | getDovizKurlariOtuzBirAralik | token: string |

---

## MÜŞTERİ İŞLEMLERİ (38 FONKSIYON)

### Kaynak Dosya: `Musteri/MusteriIslemleri.ts`

| # | Fonksiyon | İlk Parametreler |
|---|-----------|-----------------|
| 65 | createDenetlenen | token: string, createdMusteri: any |
| 66 | uploadAndParseKurumlarBeyannamesi | token: string, file: File, denetciId: number, yil: number, denetlenenId: number |
| 67 | getDenetlenenById | token: string, id: any |
| 68 | getDenetlenenByDenetciId | token: string, denetciId: number |
| 69 | getDenetlenenKonsolideAnaSirketByDenetciId | token: string, denetciId: number |
| 70 | getDenetlenenByRol | token: string, denetciId: number, kullaniciId: number |
| 71 | updateDenetlenen | token: string, id: any, updatedDenetlenen: any |
| 72 | updateDenetlenenDenetimTuru | token: string, id: number, denetimTuru: string, enflasyon: string |
| 73 | deleteDenetlenenById | token: string, id: number |
| 74 | getSektorKodlari | token: string |
| 75 | createSirketYonetimKadrosu | token: string, createdSirketYonetimKadrosu: any |
| 76 | getSirketYonetimKadrosuById | token: string, id: any |
| 77 | getSirketYonetimKadrosuByDenetlenenId | token: string, denetlenenId: number |
| 78 | updateSirketYonetimKadrosu | token: string, id: any, updatedSirketYonetimKadrosu: any |
| 79 | deleteSirketYonetimKadrosuById | token: string, id: number |
| 80 | createSubeler | token: string, createdSubeler: any |
| 81 | getSubelerById | token: string, id: any |
| 82 | getSubelerByDenetlenenId | token: string, denetlenenId: number |
| 83 | updateSubeler | token: string, id: any, updatedSubeler: any |
| 84 | deleteSubelerById | token: string, id: number |
| 85 | createHissedarlar | token: string, createdHissedarlar: any |
| 86 | getHissedarlarById | token: string, id: any |
| 87 | getHissedarlarByDenetlenenIdYil | token: string, denetlenenId: number, yil: number |
| 88 | getMizandanHissedarlarByDenetlenenIdYil | token: string, denetlenenId: number, yil: number |
| 89 | updateHissedarlar | token: string, id: any, updatedHissedarlar: any |
| 90 | deleteHissedarlarById | token: string, id: number |
| 91 | createIliskiliTaraflar | token: string, createdIliskiliTaraflar: any |
| 92 | getIliskiliTaraflarById | token: string, id: any |
| 93 | getIliskiliTaraflarByDenetlenenId | token: string, denetlenenId: number |
| 94 | updateIliskiliTaraflar | token: string, id: any, updatedIliskiliTaraflar: any |
| 95 | deleteIliskiliTaraflarById | token: string, id: number |
| 96 | createIliskiliTaraflarListe | token: string, denetciId: number, denetlenenId: number, yil: number, iliskiliTaraflarListe: any |
| 97 | getMusteriTanimaSayisalBilgiler | token: string, denetciId: number, denetlenenId: number, yil: number |
| 98 | updateMusteriTanimaSayisalBilgiler | token: string, updatedMusteriTanimaSayisalBilgiler: any |
| 99 | getMusteriTanimaStatikBilgiler | token: string, denetciId: number, denetlenenId: number, yil: number |
| 100 | updateMusteriTanimaStatikBilgiler | token: string, updatedMusteriTanimaStatikBilgiler: any |
| 101 | getTeklifHesaplama | token: string, denetciId: number, denetlenenId: number, yil: number |
| 102 | updateTeklifHesaplama | token: string, updatedTeklifHesaplama: any |
| 103 | TeklifHesapla | token: string, denetciId: number, denetlenenId: number, yil: number |
| 104 | deleteTeklifHesaplama | token: string, denetciId: number, denetlenenId: number, yil: number |

---

## PLAN VE PROGRAM (14 FONKSIYON)

### Kaynak Dosya: `PlanVeProgram/PlanVeProgram.ts`

| # | Fonksiyon | İlk Parametreler |
|---|-----------|-----------------|
| 105 | getOnemlilikVeOrneklemSeviyesi | token: string, denetciId: number, denetlenenId: number, yil: number |
| 106 | createOnemlilikVeOrneklem | token: string, denetciId: number, yil: number, denetlenenId: number, ... |
| 107 | getOnemlilikVeOrneklem | token: string, denetciId: number, denetlenenId: number, yil: number |
| 108 | updateOnemlilikVeOrneklem | token: string, updatedOnemlilikVeOrneklem: any |
| 109 | createOnemlilikVeOrneklemHesaplamaBazi | token: string, denetciId: number, yil: number, denetlenenId: number, json: any |
| 110 | getOnemlilikVeOrneklemHesaplamaBazi | token: string, denetciId: number, denetlenenId: number, yil: number |
| 111 | updateOnemlilikVeOrneklemHesaplamaBazi | token: string, json: any |
| 112 | createFinansalTabloKalemlerindeDegisim | token: string, denetciId: number, yil: number, denetlenenId: number |
| 113 | getFinansalTabloKalemlerindeDegisim | token: string, denetciId: number, denetlenenId: number, yil: number |
| 114 | updateFinansalTabloKalemlerindeDegisim | token: string, updatedFinansalTabloKalemlerindeDegisim: any |
| 115 | createBulguRiskiBelirleme | token: string, denetciId: number, yil: number, denetlenenId: number, girilenRisk: number |
| 116 | getBulguRiskiBelirleme | token: string, denetciId: number, yil: number, denetlenenId: number |
| 117 | getFisBuyukluguAnaliziYillik | token: string, denetciId: number, yil: number, denetlenenId: number, sadeceVerisiOlanAylar: boolean |
| 118 | upsertFisBuyukluguAylikNot | token: string, denetciId: number, yil: number, denetlenenId: number, ay: number, not: string |

---

## VERİ İŞLEMLERİ (35+ FONKSIYON)

### Kaynak Dosyalar: Veri/ klasörü (16 dosya)

Veri/base.ts:
| 119 | getFormat | token: string, name: string |

Veri/Mizan.ts (16 fonksiyon):
| 120 | getMizanVerileri | token: string, denetciId: number, denetlenenId: number, yil: number, type: string |
| 121 | getMizanVerileriByHesapNo | token: string, denetciId: number, denetlenenId: number, yil: number, type: string, hesapNo: string |
| 122 | getKurumlarVergisiBeyannamesiKarsilastirma | token: string, denetciId: number, denetlenenId: number, yil: number, type: string |
| 123 | getKurumlarVergisiBeyannamesiKarsilastirmaHaric | token: string, denetciId: number, denetlenenId: number, yil: number, type: string |
| 124 | getProgramVukMizan | token: string, denetciId: number, denetlenenId: number, yil: number, type: string |
| 125 | getGenelHesapPlani | token: string, tip: string |
| 126 | getProgramVukMizanWithoutType | token: string, denetciId: number, denetlenenId: number, yil: number |
| 127 | getProgramVukMizanControl | token: string, denetciId: number, denetlenenId: number, yil: number |
| 128 | createAnaHesapMizan | token: string, denetciId: number, denetlenenId: number, yil: number |
| 129 | createAnaHesapMizanHaric | token: string, denetciId: number, denetlenenId: number, yil: number |
| 130 | createDetayHesapMizan | token: string, denetciId: number, denetlenenId: number, yil: number, ... |

[+ 25 daha fazla Veri/ işlemi]

---

## KYS (20+ FONKSIYON)

### Kaynak Dosyalar: Kys/ klasörü (6 dosya)

---

## MADDİ DOĞRULAMA (7 FONKSIYON)

### Kaynak Dosya: `MaddiDogrulama/MaddiDogrulama.ts`

---

## DİĞER (4 FONKSIYON)

### Kaynak Dosyalar:
- DenetimKanitlari/MutabakatMektup.ts (2)
- Sozlesme/DenetimKadrosuAtama.ts (2)
- Yorumlar/Yorumlar.ts (2)

---

## İSTATİSTİKLER

### Dosyalara Göre Dağılım
| Dosya | Fonksiyon Sayısı |
|-------|-----------------|
| Hesaplamalar/Hesaplamalar.ts | 64 |
| Musteri/MusteriIslemleri.ts | 38 |
| Veri/* (16 dosya) | 35+ |
| PlanVeProgram/PlanVeProgram.ts | 14 |
| Kys/* (6 dosya) | 20+ |
| MaddiDogrulama/MaddiDogrulama.ts | 7 |
| Diğer | 4 |
| **TOPLAM** | **130+** |

### Parametre Türlerine Göre Dağılım
- **token: string** → 130+ fonksiyon (%100)
- **token + denetciId, denetlenenId, yil** → ~95 fonksiyon (%73)
- **token + id** → ~20 fonksiyon (%15)
- **token + file/data** → ~10 fonksiyon (%8)
- **token + diğer** → ~5 fonksiyon (%4)

### Fonksiyon Türlerine Göre Dağılım
- **GET** (veri alma) → ~60 fonksiyon (%46)
- **CREATE** (oluşturma) → ~40 fonksiyon (%31)
- **UPDATE** (güncelleme) → ~20 fonksiyon (%15)
- **DELETE** (silme) → ~10 fonksiyon (%8)

---

## ÖNERİLER

### Kaldırma Stratejisi

1. **Faz 1 - Veri İşlemleri** (en güvenli)
   - Veri/ klasöründeki 35+ fonksiyon
   - Zarar riski: DÜŞÜK
   - Süre: 1-2 gün

2. **Faz 2 - Yardımcı Modüller**
   - KYS (20 fonksiyon)
   - Maddi Doğrulama (7 fonksiyon)
   - Zarar riski: DÜŞÜK
   - Süre: 1-2 gün

3. **Faz 3 - Plan ve Program**
   - PlanVeProgram (14 fonksiyon)
   - Zarar riski: ORTA
   - Süre: 1 gün

4. **Faz 4 - Hesaplamalar** (en kritik)
   - Hesaplamalar (64 fonksiyon)
   - Zarar riski: YÜKSEK
   - Süre: 3-5 gün
   - **ÖNEMLİ**: Kapsamlı test gereklidir

5. **Faz 5 - Müşteri İşlemleri** (çok kritik)
   - MusteriIslemleri (38 fonksiyon)
   - Zarar riski: ÇOK YÜKSEK
   - Süre: 2-3 gün
   - **ÖNEMLİ**: Entegrasyon testleri zorunludur

### İmplementasyon Yöntemleri

1. **apiFetch Wrapper** - Authentication header'ı otomatik eklemek
2. **Zustand Store** - Token'ı global state'den alınması
3. **Interceptor Pattern** - Tüm API çağrılarına token ekleme
4. **AsyncStorage/SessionStorage** - Token persistence

### Test Stratejisi

- Unit testleri: Her fonksiyon için mock token
- Integration testleri: Gerçek backend bağlantısı
- E2E testleri: Tam iş akışı senaryoları
- Rollback planı: Hızlı geri dönüş imkanı
