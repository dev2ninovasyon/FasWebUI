const fs = require('fs');

const bobiDynamic = [
  { "id": 167, "parentId": 166, "name": "Finansal Tablolar", "reference": "23CD03-060100-01", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri"] },
  { "id": 168, "parentId": 166, "name": "Dipnot Açıklamaları", "reference": "23CD03-060100-02", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri"] },
  { "id": 170, "parentId": 166, "name": "Nakit ve Nakit Benzerleri", "reference": "23CD03-060100-04", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol", "Mutabakatlar(VUK)"] },
  { "id": 172, "parentId": 166, "name": "Finansal Varlık ve Yatırımlar", "reference": "23CD03-060100-06", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol"] },
  { "id": 173, "parentId": 166, "name": "Ticari Alacaklar", "reference": "23CD03-060100-07", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Mutabakatlar(VUK)", "Reeskont Testleri", "Çek Senet Tablosu", "Fatura Testleri", "Süpheli Alacak Testleri", "Sonraki Dönem Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol", "Hareketsiz Ticari Alacaklar"] },
  { "id": 174, "parentId": 166, "name": "Ticari Borçlar", "reference": "23CD03-060100-08", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Mutabakatlar(VUK)", "Reeskont Testleri", "Çek Senet Tablosu", "Fatura Testleri", "Sonraki Dönem Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol"] },
  { "id": 175, "parentId": 166, "name": "Diğer Alacaklar", "reference": "23CD03-060100-09", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Mutabakatlar(VUK)", "Sonraki Dönem Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol"] },
  { "id": 176, "parentId": 166, "name": "Diğer Borçlar", "reference": "23CD03-060100-10", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Mutabakatlar(VUK)", "Sonraki Dönem Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol"] },
  { "id": 177, "parentId": 166, "name": "Stoklar", "reference": "23CD03-060100-11", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Mutabakatlar(VUK)", "Sözlesme Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Stok Dönemsellik Testi", "Stoklar Net Gerçeklesebilir Deger", "Dönüsüm Kayitlari Kontrol", "Hareketsiz Stoklar"] },
  { "id": 179, "parentId": 166, "name": "Ertelenmiş Giderler", "reference": "23CD03-060100-13", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Mutabakatlar(VUK)", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol"] },
  { "id": 180, "parentId": 166, "name": "Cari Dönem Vergisiyle İlgili Varlıklar", "reference": "23CD03-060100-14", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol"] },
  { "id": 184, "parentId": 166, "name": "Diğer Dönen Duran Varlıklar", "reference": "23CD03-060100-18", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol", "Mutabakatlar(VUK)"] },
  { "id": 186, "parentId": 166, "name": "Yatırım Amaçlı Gayrimenkuller", "reference": "23CD03-060100-20", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol"] },
  { "id": 187, "parentId": 166, "name": "Maddi Duran Varlıklar", "reference": "23CD03-060100-21", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Amortisman Kontrolleri", "Varlik ve Amortisman Özet Tablo", "Degerleme ve Deger Düsüklügü Kontrolleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol"] },
  { "id": 189, "parentId": 166, "name": "Maddi Olmayan Duran Varlıklar", "reference": "23CD03-060100-23", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Amortisman Kontrolleri", "Degerleme ve Deger Düsüklügü Kontrolleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol"] },
  { "id": 190, "parentId": 166, "name": "Özkaynak Yöntemiyle Değerlenen Yatırımlar", "reference": "23CD03-060100-24", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol"] },
  { "id": 191, "parentId": 166, "name": "Ertelenen Vergi Varlığı - Yükümlülüğü", "reference": "23CD03-060100-25", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol"] },
  { "id": 192, "parentId": 166, "name": "Finansal Borçlar", "reference": "23CD03-060100-26", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Mutabakatlar(VUK)", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol", "Kredi Çalışması"] },
  { "id": 196, "parentId": 166, "name": "Diğer Finansal Yükümlülükler", "reference": "23CD03-060100-30", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Mutabakatlar(VUK)", "Sözlesme Testleri", "Sonraki Dönem Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol"] },
  { "id": 197, "parentId": 166, "name": "Ödenecek Vergi ve Yükümlülükler", "reference": "23CD03-060100-31", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol"] },
  { "id": 198, "parentId": 166, "name": "Kisa ve Uzun Vadeli Karsiliklar", "reference": "23CD03-060100-32", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol", "Dava Karsiliklari "] },
  { "id": 199, "parentId": 166, "name": "Ertelenmiş Gelirler", "reference": "23CD03-060100-33", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol"] },
  { "id": 201, "parentId": 166, "name": "Diğer Kısa ve Uzun Vadeli Yükümlülükler", "reference": "23CD03-060100-35", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol", "Kidem Tazminati Calismasi"] },
  { "id": 202, "parentId": 166, "name": "Özkaynaklar", "reference": "23CD03-060100-36", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol"] },
  { "id": 204, "parentId": 166, "name": "Hasılat", "reference": "23CD03-060100-38", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Hasilat Dönemsellik Testi", "Dönüsüm Kayitlari Kontrol"] },
  { "id": 205, "parentId": 166, "name": "Satışların Maliyeti", "reference": "23CD03-060100-39", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Sonraki Dönem Testleri", "Maliyet Kontrolleri", "Envanter Kontrolleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol"] },
  { "id": 206, "parentId": 166, "name": "Faaliyet Giderleri", "reference": "23CD03-060100-40", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol"] },
  { "id": 208, "parentId": 166, "name": "Esas Faaliyetlerden Diğer Gelirler", "reference": "23CD03-060100-42", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol"] },
  { "id": 209, "parentId": 166, "name": "Esas Faaliyetlerden Diğer Giderler", "reference": "23CD03-060100-43", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol"] },
  { "id": 211, "parentId": 166, "name": "Diğer Faaliyetlerden Gelirler - Giderler", "reference": "23CD03-060100-45", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol"] },
  { "id": 215, "parentId": 166, "name": "Finansman Gelirleri", "reference": "23CD03-060100-49", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol"] },
  { "id": 216, "parentId": 166, "name": "Finansman Giderleri", "reference": "23CD03-060100-50", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara Iliskin Uygulanan Denetim Testleri", "Yabanci Para Testleri", "Örneklem Çalismasi", "Önemlilik Çalismasi", "Dönüsüm Kayitlari Kontrol"] }
];

const menuTree = [
  { title: "ANASAYFA", href: "/Anasayfa" },
  { title: "MÜŞTERİ", href: "/Musteri", children: [
    { title: "Müşteri İşlemleri", href: "/Musteri/MusteriIslemleri", formKodu: "MusteriIslemleri" },
    { title: "Şirket Yönetim Kadrosu", href: "/Musteri/SirketYonetimKadrosu", formKodu: "SirketYonetimKadrosu" },
    { title: "Şubeler", href: "/Musteri/Subeler", formKodu: "Subeler" },
    { title: "Hissedarlar", href: "/Musteri/Hissedarlar", formKodu: "Hissedarlar" },
    { title: "Müşteri Tanıma", href: "/Musteri/MusteriTanima", formKodu: "MusteriTanimaStatikBilgiler-MusteriTanimaSayisalBilgiler" },
    { title: "İşletme Tanıma", href: "/Musteri/IsletmeTanima", formKodu: "IsletmeTanimaBelgesi" },
    { title: "İşletme Faaliyet ve Çevresi Tanıma", href: "/Musteri/IsletmeFaaliyetVeCevresiTanima", formKodu: "IsletmeFaaliyetveCevreTanima" },
    { title: "Teklif Hesaplama", href: "/Musteri/TeklifHesaplama", formKodu: "TeklifHesaplama" },
    { title: "Teklif Belgesi", href: "/Musteri/TeklifBelgesi", formKodu: "TeklifBelgesi" },
    { title: "Teklif Mektubu", href: "/Musteri/TeklifMektubu", formKodu: "TeklifMektubu" },
    { title: "Kendi Yetkinliğini Değerlendirme", href: "/Musteri/KendiYetkinliginiDegerlendirme", formKodu: "KendiYetkinliginiDegerlendirmeBelgesi" },
    { title: "Müşteri Dürüstlüğünü Değerlendirme", href: "/Musteri/MusteriDurustlugunuDegerlendirme", formKodu: "MusteriDurustlugunuDegerlendirme" },
    { title: "Müşteri Kabul İşlemi", href: "/Musteri/MusteriKabulIslemi" },
    { title: "Sözleşme Kabul Belgesi", href: "/Musteri/SozlesmeKabul", formKodu: "SozlesmeKabul" }
  ]},
  { title: "SÖZLEŞME", href: "/Sozlesme", children: [
    { title: "Denetim Kadrosu Atama", href: "/Sozlesme/DenetimKadrosuAtama" },
    { title: "Bağımsız Denetim Sözleşmesi", href: "/Sozlesme/BagimsizDenetimSozlesmesi", formKodu: "DenetimSozlesmesi" }
  ]},
  { title: "VERİ", href: "/Veri", children: [
    { title: "Defter / K. V. Beyannamesi Yükleme", href: "/Veri/DefterKVBeyannamesiYukleme" },
    { title: "Diğer Veri Yükleme", href: "/Veri/VeriYukleme" },
    { title: "Mizanlar", href: "/Veri/Mizanlar", children: [
      { title: "E-Defter Mizan Oluşturma", href: "/Veri/Mizanlar/EDefterMizan" },
      { title: "Oluşturulmuş Mizanlar", href: "/Veri/Mizanlar/OlusturulmusMizanlar" }
    ]},
    { title: "Fatura", href: "/Veri/Fatura" },
    { title: "E-Defter İnceleme", href: "/Veri/EDefterInceleme" }
  ]},
  { title: "MÜŞTERİ BELGELERİ", href: "/MusteriBelgeleri" },
  { title: "PLAN VE PROGRAM", href: "/PlanVeProgram", children: [
    { title: "Denetim Programı", href: "/PlanVeProgram/DenetimProgrami", formKodu: "DenetimProgrami" },
    { title: "Maddi Doğruluk Görev Atamaları", href: "/PlanVeProgram/MaddiDogrulukGorevAtamalari", formKodu: "MaddiDogrulukGorevAtamalari" },
    { title: "Denetim Takvimi", href: "/PlanVeProgram/DenetimTakvimi", formKodu: "DenetimTakvimi" },
    { title: "Denetim Planı", href: "/PlanVeProgram/DenetimPlani", formKodu: "DenetimPlani" },
    { title: "Denetim Ekibi Görev Tebliği", href: "/PlanVeProgram/GorevTebligi", formKodu: "GorevTebligi" },
    { title: "Denetçi Bağımsızlık ve Sorumluluk Taahhütnameleri", href: "/PlanVeProgram/BagimsizlikSorumlulukBeyani", formKodu: "BagimsizlikSorumlulukBeyani" },
    { title: "Etik Gerekliliklere İlişkin Bildirim ve Değerlendirme", href: "/PlanVeProgram/EtikGerekliliklereIliskinBildirim", formKodu: "EtikGerekliliklereIliskinBildirim" },
    { title: "Mesleki Etik İlkelere Uyum", href: "/PlanVeProgram/MeslekiEtik", formKodu: "MeslekiEtik" },
    { title: "Denetim Zamanı Bildirme", href: "/PlanVeProgram/DenetimZamaniBildirme", formKodu: "DenetimZamaniBildirme" },
    { title: "Sorumlu Denetçi Kimlik ve Deneyim Bildirim", href: "/PlanVeProgram/MeslekiDeneyimYeterlilik", formKodu: "MeslekiDeneyimYeterlilik" },
    { title: "Sorumlu Denetçi Sorumlulukları Bildirim", href: "/PlanVeProgram/SorumlulukBildirimi", formKodu: "SorumlulukBildirimi" },
    { title: "Denetlenen İşletmenin Tabi Olduğu Mevzuat", href: "/PlanVeProgram/DenetlenenIsletmeninTabiOlduguMevzuataIliskinDegerlendirme", formKodu: "DenetlenenIsletmeninTabiOlduguMevzuataIliskinDegerlendirme" },
    { title: "Denetim Strateji Kılavuzu", href: "/PlanVeProgram/DenetimStratejiKilavuzu", formKodu: "DenetimStratejiKilavuzu" },
    { title: "Faaliyet Riski Belirleme Belgesi", href: "/PlanVeProgram/FaaliyetRiskBelirleme", formKodu: "FaaliyetRiskBelirleme" },
    { title: "Tespit Edilen Riskler", href: "/PlanVeProgram/TespitEdilenRiskler", formKodu: "TespitEdilenRiskler" },
    { title: "Denetim Riski Belirleme Belgesi", href: "/PlanVeProgram/DenetimRiskBelirleme", formKodu: "DenetimRiskBelirleme" },
    { title: "Finansal Tablolar Denetim Riski Belirleme", href: "/PlanVeProgram/FinansalTablolarDenetimRiskiBelirleme", formKodu: "FinansalTablolarDenetimRiskiBelirleme" },
    { title: "Bulgu Riski Belirleme", href: "/PlanVeProgram/BulguRiskiBelirleme", formKodu: "DogalRisk-KontrolRiski" },
    { title: "Önemlilik Ve Örneklem", href: "/PlanVeProgram/DenetimPlanindaOnemlilik/OnemlilikVeOrneklem", formKodu: "OnemlilikVeOrneklem" }
  ]},
  { title: "HESAPLAMALAR", href: "/Hesaplamalar", children: [
    { title: "Yaşlandırma", href: "/Hesaplamalar/Yaslandirma" },
    { title: "Beklenen Kredi Zararı", href: "/Hesaplamalar/BeklenenKrediZarari" },
    { title: "Kıdem Tazminatı (Bobi)", href: "/Hesaplamalar/KidemTazminatiBobi" },
    { title: "Kıdem Tazminatı (Tfrs)", href: "/Hesaplamalar/KidemTazminatiTfrs" },
    { title: "Amortisman", href: "/Hesaplamalar/Amortisman" },
    { title: "Kredi", href: "/Hesaplamalar/Kredi" },
    { title: "Çek / Senet Reeskont", href: "/Hesaplamalar/CekSenetReeskont" },
    { title: "Dava Karşılıkları", href: "/Hesaplamalar/DavaKarsiliklari" },
    { title: "Ertelenmiş Vergi Hesabı", href: "/Hesaplamalar/ErtelenmisVergiHesabi" },
    { title: "İlişkili Taraf Sınıflama", href: "/Hesaplamalar/IliskiliTarafSiniflama" },
    { title: "Hareketsiz", href: "/Hesaplamalar/Hareketsiz" },
    { title: "Kur Farkı Kayıtları", href: "/Hesaplamalar/KurFarkiKayitlari" }
  ]},
  { title: "DÖNÜŞÜM", href: "/Donusum", children: [
    { title: "Fiş Girişi", href: "/Donusum/FisGirisi" },
    { title: "Fiş Listesi", href: "/Donusum/FisListesi" },
    { title: "Hazır Fişler", href: "/Donusum/HazirFisler" },
    { title: "Dönüşüm İşlemi", href: "/Donusum/DonusumIslemi" },
    { title: "Belirleme Belgesi", href: "/Donusum/BobiFrs/BelirlemeBelgesi", formKodu: "DenetimTuruBelirlemeBelgesi" }
  ]},
  { title: "DENETİM KANITLARI", href: "/DenetimKanitlari", children: [
    { title: "Denetim Stratejisi Belirleme", href: "/DenetimKanitlari/DenetimStratejisiBelirleme", formKodu: "DenetimStratejisiBelirleme" },
    { title: "Uzman Yeterliliği", href: "/DenetimKanitlari/UzmanYeterliligiDegerlendirme", formKodu: "UzmanYeterliligiDegerlendirme" },
    { title: "Denetim Kontrol Testleri", href: "/DenetimKanitlari/DenetimKontrolTestleri", formKodu: "DenetimKontrolTestleri" },
    { title: "Mizan Kontrol", href: "/DenetimKanitlari/MizanKontrol", children: [
        { title: "Dönüşüm Mizan Kontrol", href: "/DenetimKanitlari/MizanKontrol/DonusumMizanKontrol", formKodu: "DonusumMizan" },
        { title: "Özet Denetim Mizan", href: "/DenetimKanitlari/MizanKontrol/OzetDonusumMizanKontrol", formKodu: "OzetDonusumMizan" }
    ]},
    { title: "Finansal Tablolar", href: "/DenetimKanitlari/FinansalTablolar", children: [
        { title: "Finansal Durum Tablosu", href: "/DenetimKanitlari/FinansalTablolar/FinansalDurumTablosu" },
        { title: "Kar / Zarar Tablosu", href: "/DenetimKanitlari/FinansalTablolar/KarZararTablosu" },
        { title: "Nakit Akış Tablosu", href: "/DenetimKanitlari/FinansalTablolar/NakitAkisTablosu" },
        { title: "Özkaynak Değişim Tablosu", href: "/DenetimKanitlari/FinansalTablolar/OzkaynakDegisimTablosu" }
    ]},
    { title: "Analitik İnceleme", href: "/DenetimKanitlari/IsletmeninSurekliligiVeAnalitikInceleme" },
    { title: "Önemlilik", href: "/DenetimKanitlari/Onemlilik" },
    { title: "Mutabakat", href: "/DenetimKanitlari/Mutabakat" },
    { title: "Diğer Kanıtlar", href: "/DenetimKanitlari/DigerKanitlar" },
    { 
        title: "Maddi Doğrulama Prosedürleri", 
        href: "/DenetimKanitlari/MaddiDogrulamaProsedurleri",
        isMaddiDogrulama: true 
    },
    { title: "Hile ve Usulsüzlük", href: "/DenetimKanitlari/HileVeUsulsuzluk" }
  ]},
  { title: "GENEL KURUL", href: "/GenelKurul" },
  { title: "RAPOR", href: "/Rapor", children: [
      { title: "Dipnotlar", href: "/Rapor/Dipnotlar" },
      { title: "Bağımsız Denetçi Raporu", href: "/Rapor/BagimsizDenetciRaporu" }
  ]},
  { title: "ENFLASYON", href: "/Enflasyon" }
];

let globalId = 1;
let globalSira = 1;

function slugify(text) {
    if (!text) return "";
    return text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

function processNodes(nodes, parentId = null, depthPrefix = "", refPrefix = "") {
    let results = [];
    nodes.forEach((item, index) => {
        const id = globalId++;
        const currentSira = globalSira++;
        const indexStr = (index + 1).toString().padStart(2, '0');
        const dosyaNevi = depthPrefix ? `${depthPrefix}.${indexStr}` : indexStr;
        let referansNo = item.reference || `-${(refPrefix + indexStr).padEnd(6, '0')}`;
        
        results.push({
            "Id": id,
            "DosyaNevi": dosyaNevi,
            "BelgeAdi": (item.title || item.name).toUpperCase(),
            "ReferansNo": referansNo,
            "FormKodu": item.formKodu || "",
            "ParentId": parentId,
            "FormUrl": item.href || "",
            "ArsivKlasorAdi": "CD",
            "Bobimi": 1,
            "Tfrsmi": 1,
            "ArsivAdi": null,
            "Sira": currentSira
        });
        
        if (item.isMaddiDogrulama) {
            // Maddi Doğrulama Dinamik Alt Menüler
            const dynamicNodes = bobiDynamic.map(d => ({
                name: d.name,
                reference: d.reference,
                href: `${item.href}/${slugify(d.name)}`,
                children: d.children.map(c => ({
                    name: c,
                    href: `${item.href}/${slugify(d.name)}/${slugify(c)}`
                }))
            }));
            results = results.concat(processNodes(dynamicNodes, id, dosyaNevi, refPrefix + indexStr));
        } else if (item.children && Array.isArray(item.children)) {
            results = results.concat(processNodes(item.children, id, dosyaNevi, refPrefix + indexStr));
        }
    });
    return results;
}

const finalOutput = processNodes(menuTree);
fs.writeFileSync('c:\\Users\\lenov\\source\\repos\\dev2ninovasyon\\FasWebAPI\\Data\\JsonFiles\\NihaiMenuler.json', JSON.stringify(finalOutput, null, 2), 'utf8');
console.log('NihaiMenuler.json başarıyla oluşturuldu.');
