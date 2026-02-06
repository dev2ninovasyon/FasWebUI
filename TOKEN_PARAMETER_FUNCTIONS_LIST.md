# Token Parametreli API Fonksiyonları Listesi

## Özet
FasWebUI src/api klasöründe **130+ adet** `token: string` parametresi içeren fonksiyon bulunmaktadır.

---

## Hesaplamalar (Hesaplamalar.ts) - 89+ Fonksiyon

### Amortisman
- createAmortismanHesaplanmis(token: string, denetciId: number, yil: number, ...)
- getAmortismanHesaplanmis(token: string, denetciId: number, yil: number, ...)

### Kredi
- createKrediHesaplanmis(token: string, denetciId: number, yil: number, ...)
- getKrediHesaplanmis(token: string, denetciId: number, yil: number, ...)
- getKrediHesaplanmisDetay(token: string, denetciId: number, yil: number, ...)
- getKrediHesaplanmisOrnekFisler(token: string, denetciId: number, yil: number, ...)

### Dava Karşılıkları
- createDavaKarsiliklariHesaplanmis(token: string, denetciId: number, yil: number, ...)
- getDavaKarsiliklariHesaplanmis(token: string, denetciId: number, yil: number, ...)

### Yaşlandırma
- createYaslandirmaHesaplanmis(token: string, denetciId: number, yil: number, ...)
- getYaslandirmaHesaplanmis(token: string, denetciId: number, yil: number, ...)

### Kıdem Tazminatı BOBI
- createKidemTazminatiBobiHesapla(token: string, denetciId: number, yil: number, ...)
- createKidemTazminatiBobiEkBilgi(token: string, createdKidemTazminatiBobiEkBilgiVerisi: any)
- getKidemTazminatiBobiEkBilgi(token: string, denetciId: number, yil: number, ...)

### Kıdem Tazminatı TFRS
- createKidemTazminatiTfrsHesapla(token: string, denetciId: number, yil: number, ...)
- createKidemTazminatiTfrsEkBilgi(token: string, createdKidemTazminatiTfrsEkBilgiVerisi: any)
- getKidemTazminatiTfrsEkBilgi(token: string, denetciId: number, yil: number, ...)

### Çek Senet Reeskont
- createCekSenetReeskontHesapla(token: string, denetciId: number, yil: number, ...)
- createCekSenetReeskontEkBilgi(token: string, createdCekSenetReeskontEkBilgiVerisi: any)
- getCekSenetReeskontEkBilgi(token: string, denetciId: number, yil: number, ...)
- getCekSenetReeskontIskontoOranlari(token: string, oranAdi: string, yil: number)
- getCekSenetReeskontHesaplama(token: string, denetciId: number, yil: number, ...)
- getCekSenetReeskontDuzeltmeFarklari(token: string, denetciId: number, yil: number, ...)
- getCekSenetReeskontHesaplamadaKullanilanDegerler(token: string, denetciId: number, yil: number, ...)

### Beklenen Kredi Zararı
- createBeklenenKrediZarariHesaplanmis(token: string, denetciId: number, yil: number, ...)
- getBeklenenKrediZarariHesaplanmis(token: string, denetciId: number, yil: number, ...)

### Oranlar
- getEnflasyonOrani(token: string, yil: number)
- getFaizOrani(token: string, yil: number)
- getIskontoOrani(token: string, yil: number)

### Vergi Varlığı ve Yükümlülüğü
- createVergiVarligiVeYukumlulugu(token: string, denetciId: number, yil: number, ...)
- getVergiVarligiVeYukumluluguOzet(token: string, denetciId: number, yil: number, ...)
- getVergiVarligi(token: string, denetciId: number, yil: number, ...)
- getVergiYukumlulugu(token: string, denetciId: number, yil: number, ...)
- getVergiVarligiVeYukumluluguOrnekFisler(token: string, denetciId: number, yil: number, ...)

### İlişkili Taraf Sınıflaması
- getIliskiliTarafSiniflamaHesaplar(token: string, denetciId: number, yil: number, ...)
- getIliskiliTarafSiniflama(token: string, denetciId: number, yil: number, ...)
- getIliskiliTarafSiniflamaOrnekFisler(token: string, denetciId: number, yil: number, ...)

### Vadeli Banka Mevduatı Otomatik Sınıflama
- createVadeliBankaMevduatiOtomatikSiniflama(token: string, denetciId: number, yil: number, ...)
- createVadeliBankaMevduatOtomatikSiniflama(token: string, createdVadeliBankaMevduat: any, ...)
- getVadeliBankaMevduatiOtomatikSiniflama(token: string, denetciId: number, yil: number, ...)
- getVadeliBankaMevduatiOtomatikSiniflamaOrnekFisler(token: string, denetciId: number, yil: number, ...)
- deleteVadeliBankaMevduatiOtomatikSiniflamaById(token: string, id: number, ...)

### Vadeli Banka Mevduatı Manuel Sınıflama
- getVadeliBankaMevduatiManuelSiniflama(token: string, denetciId: number, yil: number, ...)
- getVadeliBankaMevduatiManuelSiniflamaOrnekFisler(token: string, denetciId: number, yil: number, ...)

### Vadeli Banka Mevduatı Faiz Tahakkuk
- createVadeliBankaMevduatiFaizTahakkuk(token: string, denetciId: number, yil: number, ...)
- getVadeliBankaMevduatiFaizTahakkuk(token: string, denetciId: number, yil: number, ...)

### Hareketsiz Ticari Alacaklar
- createHareketsizTicariAlacaklar(token: string, denetciId: number, yil: number, ...)
- createHareketsizTicariAlacak(token: string, createdHareketsizTicariAlacak: any)
- getHareketsizTicariAlacaklar(token: string, denetciId: number, yil: number, ...)
- getHareketsizTicariAlacaklarOzet(token: string, denetciId: number, yil: number, ...)
- getHareketsizTicariAlacaklarOrnekFisler(token: string, denetciId: number, yil: number, ...)
- deleteHareketsizTicariAlacaklarById(token: string, id: number, ...)

### Hareketsiz Stoklar
- createHareketsizStoklar(token: string, denetciId: number, yil: number, ...)
- createHareketsizStok(token: string, createdHareketsizStok: any, ...)
- getHareketsizStoklar(token: string, denetciId: number, yil: number, ...)
- getHareketsizStoklarOzet(token: string, denetciId: number, yil: number, ...)
- getHareketsizStoklarOrnekFisler(token: string, denetciId: number, yil: number, ...)
- deleteHareketsizStoklarById(token: string, id: number, ...)

### Diğer
- getGecmisYilKarZararKontrol(token: string, denetciId: number, yil: number, ...)
- getGecmisYilKarZararKontrolOrnekFisler(token: string, denetciId: number, yil: number, ...)
- getKurFarki(token: string, denetciId: number, yil: number, ...)
- getKurFarkiKontrolleriOzet(token: string, denetciId: number, yil: number, ...)
- getKurFarkiKontrolleriFisler(token: string, denetciId: number, yil: number, ...)
- getKurFarkiOrnekFisler(token: string, denetciId: number, yil: number, ...)
- getDovizKurlariOtuzBirAralik(token: string)

---

## Müşteri İşlemleri (Musteri/MusteriIslemleri.ts) - 35+ Fonksiyon

### Denetlenen
- createDenetlenen(token: string, createdMusteri: any)
- uploadAndParseKurumlarBeyannamesi(token: string, file: File, denetciId: number, ...)
- getDenetlenenById(token: string, id: any)
- getDenetlenenByDenetciId(token: string, denetciId: number)
- getDenetlenenKonsolideAnaSirketByDenetciId(token: string, denetciId: number)
- getDenetlenenByRol(token: string, denetciId: number, kullaniciId: number)
- updateDenetlenen(token: string, id: any, updatedDenetlenen: any)
- updateDenetlenenDenetimTuru(token: string, id: number, denetimTuru: string, ...)
- deleteDenetlenenById(token: string, id: number)

### Sektor
- getSektorKodlari(token: string)

### Şirket Yönetim Kadrosu
- createSirketYonetimKadrosu(token: string, createdSirketYonetimKadrosu: any)
- getSirketYonetimKadrosuById(token: string, id: any)
- getSirketYonetimKadrosuByDenetlenenId(token: string, denetlenenId: number)
- updateSirketYonetimKadrosu(token: string, id: any, updatedSirketYonetimKadrosu: any)
- deleteSirketYonetimKadrosuById(token: string, id: number)

### Şubeler
- createSubeler(token: string, createdSubeler: any)
- getSubelerById(token: string, id: any)
- getSubelerByDenetlenenId(token: string, denetlenenId: number)
- updateSubeler(token: string, id: any, updatedSubeler: any)
- deleteSubelerById(token: string, id: number)

### Hissedarlar
- createHissedarlar(token: string, createdHissedarlar: any)
- getHissedarlarById(token: string, id: any)
- getHissedarlarByDenetlenenIdYil(token: string, denetlenenId: number, yil: number)
- getMizandanHissedarlarByDenetlenenIdYil(token: string, denetlenenId: number, yil: number)
- updateHissedarlar(token: string, id: any, updatedHissedarlar: any)
- deleteHissedarlarById(token: string, id: number)

### İlişkili Taraflar
- createIliskiliTaraflar(token: string, createdIliskiliTaraflar: any)
- getIliskiliTaraflarById(token: string, id: any)
- getIliskiliTaraflarByDenetlenenId(token: string, denetlenenId: number)
- updateIliskiliTaraflar(token: string, id: any, updatedIliskiliTaraflar: any)
- deleteIliskiliTaraflarById(token: string, id: number)
- createIliskiliTaraflarListe(token: string, denetciId: number, denetlenenId: number, ...)

### Müşteri Tanıma
- getMusteriTanimaSayisalBilgiler(token: string, denetciId: number, denetlenenId: number, ...)
- updateMusteriTanimaSayisalBilgiler(token: string, updatedMusteriTanimaSayisalBilgiler: any)
- getMusteriTanimaStatikBilgiler(token: string, denetciId: number, denetlenenId: number, ...)
- updateMusteriTanimaStatikBilgiler(token: string, updatedMusteriTanimaStatikBilgiler: any)

### Teklif Hesaplama
- getTeklifHesaplama(token: string, denetciId: number, denetlenenId: number, yil: number)
- updateTeklifHesaplama(token: string, updatedTeklifHesaplama: any)
- TeklifHesapla(token: string, denetciId: number, denetlenenId: number, yil: number)
- deleteTeklifHesaplama(token: string, denetciId: number, denetlenenId: number, yil: number)

---

## Plan ve Program (PlanVeProgram/PlanVeProgram.ts) - 15+ Fonksiyon

- getOnemlilikVeOrneklemSeviyesi(token: string, denetciId: number, denetlenenId: number, ...)
- createOnemlilikVeOrneklem(token: string, denetciId: number, yil: number, ...)
- getOnemlilikVeOrneklem(token: string, denetciId: number, denetlenenId: number, ...)
- updateOnemlilikVeOrneklem(token: string, updatedOnemlilikVeOrneklem: any)
- createOnemlilikVeOrneklemHesaplamaBazi(token: string, denetciId: number, yil: number, ...)
- getOnemlilikVeOrneklemHesaplamaBazi(token: string, denetciId: number, denetlenenId: number, ...)
- updateOnemlilikVeOrneklemHesaplamaBazi(token: string, json: any)
- createFinansalTabloKalemlerindeDegisim(token: string, denetciId: number, yil: number, ...)
- getFinansalTabloKalemlerindeDegisim(token: string, denetciId: number, denetlenenId: number, ...)
- updateFinansalTabloKalemlerindeDegisim(token: string, updatedFinansalTabloKalemlerindeDegisim: any)
- createBulguRiskiBelirleme(token: string, denetciId: number, yil: number, ...)
- getBulguRiskiBelirleme(token: string, denetciId: number, yil: number, ...)
- getFisBuyukluguAnaliziYillik(token: string, denetciId: number, yil: number, ...)
- upsertFisBuyukluguAylikNot(token: string, denetciId: number, yil: number, ...)

---

## Veri İşlemleri (Veri/) - 30+ Fonksiyon

### Base
- getFormat(token: string, name: string)

### Mizan
- getMizanVerileri(token: string, denetciId: number, denetlenenId: number, yil: number, ...)
- getMizanVerileriByHesapNo(token: string, denetciId: number, denetlenenId: number, ...)
- getKurumlarVergisiBeyannamesiKarsilastirma(token: string, denetciId: number, denetlenenId: number, ...)
- getKurumlarVergisiBeyannamesiKarsilastirmaHaric(token: string, denetciId: number, denetlenenId: number, ...)
- getProgramVukMizan(token: string, denetciId: number, denetlenenId: number, ...)
- getGenelHesapPlani(token: string, tip: string)
- getProgramVukMizanWithoutType(token: string, denetciId: number, denetlenenId: number, ...)
- getProgramVukMizanControl(token: string, denetciId: number, denetlenenId: number, ...)
- createAnaHesapMizan(token: string, denetciId: number, denetlenenId: number, ...)
- createAnaHesapMizanHaric(token: string, denetciId: number, denetlenenId: number, ...)
- createDetayHesapMizan(token: string, denetciId: number, denetlenenId: number, ...)
- createDetayHesapMizanHaric(token: string, denetciId: number, denetlenenId: number, ...)
- createVukMizan(token: string, denetciId: number, denetlenenId: number, ...)
- createProgramVukMizan(token: string, denetciId: number, denetlenenId: number, ...)
- getMizanBilgileri(token: string, denetciId: number, denetlenenId: number, ...)
- deleteMizanBilgisiMultiple(token: string, ids: any)

### VUK Mizan
- getVukMizanVerileriByDenetciDenetlenenYil(token: string, denetciId: number, ...)
- createVukMizanVerisi(token: string, jsonData: any)
- deleteVukMizanVerisi(token: string, denetciId: number, denetlenenId: number, ...)

### Amortisman
- getAmortismanVerileriByDenetciDenetlenenYil(token: string, denetciId: number, ...)
- createAmortismanVerisi(token: string, jsonData: any)
- deleteAmortismanVerisi(token: string, denetciId: number, denetlenenId: number, ...)

### Çek Senet Reeskont
- getCekSenetReeskontVerileriByDenetciDenetlenenYil(token: string, denetciId: number, ...)
- createCekSenetReeskontVerisi(token: string, createdCekSenetReeskontVerisi: any)
- deleteCekSenetReeskontVerisi(token: string, denetciId: number, denetlenenId: number, ...)

### Dava Karşılıkları
- getDavaKarsiliklariVerileriByDenetciDenetlenenYil(token: string, denetciId: number, ...)
- createDavaKarsiliklariVerisi(token: string, createdDavaKarsiliklariVerisi: any)
- deleteDavaKarsiliklariVerisi(token: string, denetciId: number, denetlenenId: number, ...)

### Dönüştürülmüş Mizan
- getDonusturulmusMizanVerileriByDenetciDenetlenenYil(token: string, denetciId: number, ...)
- createDonusturulmusMizanVerisi(token: string, createdDonusturulmusMizanVerisi: any)
- deleteDonusturulmusMizanVerisi(token: string, denetciId: number, denetlenenId: number, ...)

### Dönüşüm Fişleri
- getDonusumFisleriVerileriByDenetciDenetlenenYil(token: string, denetciId: number, ...)
- createDonusumFisleriVerisi(token: string, createdDonusumFisleriVerisi: any)
- deleteDonusumFisleriVerisi(token: string, denetciId: number, denetlenenId: number, ...)

### E-Defter İnceleme
- getEDefterIncelemeVerileri(token: string, denetciId: number, denetlenenId: number, ...)
- getEDefterIncelemeVerileriPaged(token: string, denetciId: number, denetlenenId: number, ...)
- updateEDefterIncelemeVerisi(token: string, createdEDefterIncelemeVerisi: any)
- updateEDefterIncelemeListeVerisi(token: string, createdEDefterIncelemeListeVerisi: any)
- getEDefterIncelemeVerileriByFisNo(token: string, denetciId: number, denetlenenId: number, ...)

### Haric Fiş Listesi
- getYevmiyeFisNo(token: string, denetciId: number, denetlenenId: number, ...)
- getStandartYevmiyeFisNo(token: string, denetciId: number, denetlenenId: number, ...)
- getStandartYevmiyeFisNoHaric(token: string, denetciId: number, denetlenenId: number, ...)
- getFisListesi(token: string, denetciId: number, denetlenenId: number, ...)
- getFisListesiHaric(token: string, denetciId: number, denetlenenId: number, ...)
- saveHaricFisListesi(token: string, denetciId: number, denetlenenId: number, ...)
- saveHaricFisListesiHaric(token: string, denetciId: number, denetlenenId: number, ...)
- getYevmiyeFisNoHaric(token: string, denetciId: number, denetlenenId: number, ...)

### Kıdem Tazminatı BOBI
- getKidemTazminatiBobiVerileriByDenetciDenetlenenYil(token: string, denetciId: number, ...)
- createKidemTazminatiBobiVerisi(token: string, createdKidemTazminatiBobiVerisi: any)
- deleteKidemTazminatiBobiVerisi(token: string, denetciId: number, denetlenenId: number, ...)

### Kıdem Tazminatı TFRS
- getKidemTazminatiTfrsVerileriByDenetciDenetlenenYil(token: string, denetciId: number, ...)
- createKidemTazminatiTfrsVerisi(token: string, createdKidemTazminatiTfrsVerisi: any)
- deleteKidemTazminatiTfrsVerisi(token: string, denetciId: number, denetlenenId: number, ...)

### Kredi Hesaplama
- getKrediHesaplamaVerileriByDenetciDenetlenenYil(token: string, denetciId: number, ...)
- getKrediHesaplamaVerileriByDenetciDenetlenenYilId(token: string, denetciId: number, ...)
- createKrediHesaplamaVerisi(token: string, createdKrediHesaplamaVerisi: any)
- deleteKrediHesaplamaVerisi(token: string, denetciId: number, denetlenenId: number, ...)

### Kredi Hesaplama Detay
- getKrediHesaplamaDetayVerileriByDenetciDenetlenenYil(token: string, denetciId: number, ...)
- createKrediHesaplamaDetayVerisi(token: string, createdKrediHesaplamaDetayVerisi: any)
- deleteKrediHesaplamaDetayVerisi(token: string, denetciId: number, denetlenenId: number, ...)

---

## KYS (Kys/) - 20+ Fonksiyon

### KysBelge
- getKysBelge(token: string, denetciId: number, denetlenenId: number, ...)
- updateKysBelge(token: string, createdKysBelge: any)
- updateKysBelgeChecklist(token: string, createdKysBelge: any)

### KysBelgeler API
- getKysBelgeler(token: string, denetciId: number, denetlenenId: number, ...)
- createKysBelge(token: string, createdKysBelge: any)
- updateKysBelge(token: string, id: string, updatedKysBelge: any)
- deleteKysBelge(token: string, id: string)

### KysBelgeler Editor API
- getKysBelgelerEditorText(token: string, denetciId: number, denetlenenId: number, ...)
- saveKysBelgelerEditorText(token: string, createdKysBelgelerEditor: any)

### KysBelgeler Üç Sütun API
- getKysBelgeler(token: string, denetciId: number, denetlenenId: number, ...)
- createKysBelge(token: string, createdKysBelge: any)
- updateKysBelge(token: string, id: string, updatedKysBelge: any)
- deleteKysBelge(token: string, id: string)

### KYS Risk Matrisi
- getKysRiskMatrisi(token: string, denetciId: number, denetlenenId: number, ...)
- updateKysRiskMatrisi(token: string, createdKysRiskMatrisi: any)
- createKysRiskMatrisi(token: string, createdKysRiskMatrisi: any)
- getAllKysRiskMatrisi(token: string, denetciId: number, denetlenenId: number, ...)
- generateKysRiskMatrisiFullData(token: string, denetciId: number, denetlenenId: number, ...)

### KYS Yeni Müşteri Formu
- getYeniMusteriFormu(token: string, denetciId: number, denetlenenId: number, ...)
- saveYeniMusteriFormu(token: string, createdYeniMusteriFormu: any)

### Müşteri Bırakma Formu
- getMusteriBirakmaFormu(token: string, denetciId: number, denetlenenId: number, ...)
- createMusteriBirakmaFormu(token: string, createdMusteriBirakmaFormu: any)
- updateMusteriBirakmaFormu(token: string, id: string, updatedMusteriBirakmaFormu: any)
- deleteMusteriBirakmaFormu(token: string, id: string)

---

## Maddi Doğrulama (MaddiDogrulama/MaddiDogrulama.ts) - 6 Fonksiyon

- getMaddiDogrulama(token: string, denetciId: number, denetlenenId: number, ...)
- getUygulananDenetimProsedurleri(token: string, denetciId: number, denetlenenId: number, ...)
- getDipnotNoByDipnotAdi(token: string, denetciId: number, denetlenenId: number, ...)
- createCalismaKagidiVerisi(token: string, createdCalismaKagidiVerisi: any)
- updateCalismaKagidiVerisi(token: string, id: any, updatedCalismaKagidiVerisi: any)
- deleteCalismaKagidiVerisiById(token: string, id: any)
- deleteAllCalismaKagidiVerileri(token: string, denetciId: number, denetlenenId: number, ...)

---

## Denetim Kanıtları (DenetimKanitlari/MutabakatMektup.ts) - 2 Fonksiyon

- validateMutabakatToken(token: string, token2: string)
- uploadViaMutabakatToken(token: string, formData: FormData)

---

## Sözleşme (Sozlesme/DenetimKadrosuAtama.ts) - 2 Fonksiyon

- getGorevAtamalariByKullaniciId(token: string, kullaniciId: number)
- getGorevAtamalariByDenetlenenIdYil(token: string, denetlenenId: number, yil: number)

---

## Yorumlar (Yorumlar/Yorumlar.ts) - 2 Fonksiyon

- getYorum(token: string, denetciId: number, denetlenenId: number, ...)
- saveYorum(token: string, createdYorum: any)

---

## Öneriler

Token parametresini kaldırırken:

1. **apiFetch fonksiyonuna geçiş**: Authorization header'ı apiFetch içinde yönetilmelidir
2. **useAuthStore kullanımı**: Token, Zustand veya benzeri state management'dan alınabilir
3. **Interceptor pattern**: API çağrılarına otomatik olarak token eklenmesi
4. **Sıralı kaldırılabilir**: 
   - İlk olarak Veri/ klasöründeki fonksiyonlar
   - Sonra Hesaplamalar/ fonksiyonları
   - Son olarak Müşteri İşlemleri ve diğer kritik fonksiyonlar
