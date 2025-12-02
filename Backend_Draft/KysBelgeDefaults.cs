using System.Collections.Generic;

namespace FasBackend.Helpers
{
    public static class KysBelgeDefaults
    {
        public static (string Baslik, string Icerik, string ChecklistJson) GetDefaults(string formKodu)
        {
            var data = GetAllDefaults();
            if (data.ContainsKey(formKodu))
                return data[formKodu];
            
            return (formKodu, "<p>İçerik henüz oluşturulmamış.</p>", "[]");
        }

        private static Dictionary<string, (string Baslik, string Icerik, string ChecklistJson)> GetAllDefaults()
        {
            return new Dictionary<string, (string, string, string)>
            {
                // 1. ÜST YÖNETİM VE LİDERLİK YAPISI
                ["UstYonetimPolitikaBeyani"] = (
                    "Üst Yönetim ve Liderlik Yapısı Politikası Beyanı (1.1)",
                    "<p><strong>Belge Kodu:</strong> KYS-1 / 1.0</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>Üst yönetim, kalite yönetim sisteminin etkinliğini sağlamak, sürekli iyileştirmeyi teşvik etmek ve etik ilkelere dayalı liderlik göstermekten sorumludur.</p>" +
                    "<h3>Sorumluluklar:</h3>" +
                    "<ul><li>Yönetim Kurulu veya Denetim Komitesi kalite sisteminin gözetiminden sorumludur.</li>" +
                    "<li>Kalite yöneticisi, sistemin uygulanmasını ve izlenmesini sağlar.</li>" +
                    "<li>Her ortak ve kıdemli denetçi, kendi denetim ekibinin kalite politikasına uygun çalışmasını güvence altına alır.</li></ul>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<p>Yıllık kalite toplantıları yapılır; politika tüm personele duyurulur; performans sonuçları liderlik tarafından izlenir.</p>",
                    "[{\"label\":\"Yönetim toplantı tutanakları\",\"checked\":false},{\"label\":\"Politika duyurusu\",\"checked\":false},{\"label\":\"İç iletişim kayıtları\",\"checked\":false}]"
                ),

                ["SorumluluklarinVerilmesi"] = (
                    "Sorumlulukların Verilmesi (2.0)",
                    "<p><strong>Belge Kodu:</strong> KYS-1 / 2.0</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>Kalite yönetim sisteminin başarısı, sorumlulukların açık şekilde tanımlanması ve yetkilendirilmesi ile mümkündür.</p>" +
                    "<h3>Sorumluluklar:</h3>" +
                    "<ul><li>Üst yönetim, kalite politika ve hedeflerini belirler.</li>" +
                    "<li>Kalite yöneticisi, prosedürlerin uygulanmasını koordine eder.</li>" +
                    "<li>Denetim ekip liderleri, görev dağılımını yazarak onaylatır.</li></ul>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<p>Her denetim için 'Görev Dağılım Formu' doldurulur. Yeni atamalar yazılı bildirilir.</p>",
                    "[{\"label\":\"Görev dağılım formları\",\"checked\":false},{\"label\":\"Yetki devri yazıları\",\"checked\":false},{\"label\":\"Onay imzaları\",\"checked\":false}]"
                ),

                ["BelgelendirmePolitikasi"] = (
                    "Belgelendirme Politikası Beyanı (1.1)",
                    "<p><strong>Belge Kodu:</strong> KYS-1 / 1.1</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>Tüm kalite yönetimi faaliyetleri yazılı olarak belgelenir. Belgeler, şeffaflık ve izlenebilirlik ilkeleri çerçevesinde saklanır.</p>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<ul><li>Her süreç için standart form ve kayıt formatı belirlenir.</li>" +
                    "<li>Belgelerin revizyonu yalnızca yetkili kişilerce yapılabilir.</li></ul>",
                    "[{\"label\":\"Belgelerin versiyon numarası var\",\"checked\":false},{\"label\":\"Yetkili onay mevcut\",\"checked\":false},{\"label\":\"Arşiv planına uygun saklama\",\"checked\":false}]"
                ),

                ["KaliteYonetimSistemiEsas"] = (
                    "Kalite Yönetim Sistemi Esas Belgesi (1.2)",
                    "<p><strong>Belge Kodu:</strong> KYS-1 / 1.2</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>Kalite yönetim sistemi, bağımsız denetimlerin tutarlılığını ve BDS 220'ye uygunluğunu güvence altına alan esasları tanımlar.</p>" +
                    "<h3>Esaslar:</h3>" +
                    "<ol><li>Liderlik ve sorumluluk yapısı</li>" +
                    "<li>Etik ilkeler ve bağımsızlık</li>" +
                    "<li>İnsan kaynakları yönetimi</li>" +
                    "<li>Belgelendirme, izleme ve sürekli iyileştirme</li></ol>",
                    "[{\"label\":\"KYS doküman listesi güncel\",\"checked\":false},{\"label\":\"Personel bilgilendirmesi yapılmış\",\"checked\":false}]"
                ),

                ["ProfesyonelPerformans"] = (
                    "Profesyonel Çalışanların Performansının Değerlendirilmesi (7.5)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 7.5</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>Denetim hizmetinin kalitesi, profesyonel personelin performansına bağlıdır. Performans değerlendirmeleri objektif kriterlerle yapılır.</p>" +
                    "<h3>Değerlendirme Kriterleri:</h3>" +
                    "<ul><li>Teknik yeterlilik ve BDS bilgisi</li>" +
                    "<li>Mesleki şüphecilik düzeyi</li>" +
                    "<li>Ekip çalışmasına katkı</li>" +
                    "<li>Zamanında raporlama</li></ul>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<p>Yılda en az bir kez performans değerlendirme formu doldurulur.</p>",
                    "[{\"label\":\"Değerlendirme formu\",\"checked\":false},{\"label\":\"Görüşme notları\",\"checked\":false},{\"label\":\"Eğitim planı\",\"checked\":false}]"
                ),

                ["IdariPerformans"] = (
                    "İdari Çalışanların Performansının Gözden Geçirilmesi (7.6)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 7.6</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>İdari personelin kalite süreçlerine katkısı, destekleyici performans kriterleriyle ölçülür.</p>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<ul><li>Yıllık gözden geçirme toplantıları yapılır.</li>" +
                    "<li>Sonuçlara göre geliştirme planı hazırlanır.</li></ul>",
                    "[{\"label\":\"Gözden geçirme formu\",\"checked\":false},{\"label\":\"İyileştirme önerileri\",\"checked\":false},{\"label\":\"Onay imzaları\",\"checked\":false}]"
                ),

                ["IzlemeDuzeltme"] = (
                    "İzleme ve Düzeltme Süreci Politikası Beyanı (9.2)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 9.2</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>Kalite sisteminin etkinliği düzenli olarak izlenir; uygunsuzluklar tespit edildiğinde düzeltici faaliyet başlatılır.</p>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<ul><li>İç gözden geçirme yılda en az bir defa yapılır.</li>" +
                    "<li>Bulgular raporlanır ve sorumlu kişilere atanır.</li>" +
                    "<li>Düzeltici faaliyetler izleme formuna kaydedilir.</li></ul>",
                    "[{\"label\":\"İç denetim raporu\",\"checked\":false},{\"label\":\"Düzeltici faaliyet formu\",\"checked\":false},{\"label\":\"Takip sonuçları\",\"checked\":false}]"
                ),

                ["UstYonetimGenisletilmis"] = (
                    "Üst Yönetim ve Liderlik Yapısı - Genişletilmiş Versiyon (3.1)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 3.1</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>Üst yönetim, kalite hedeflerini stratejik planlara entegre eder ve etik liderlik kültürünü güçlendirir.</p>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<ul><li>Yönetim, yıllık kalite gözden geçirme raporunu yayımlar.</li>" +
                    "<li>Liderlik gelişim eğitimleri planlanır.</li></ul>",
                    "[{\"label\":\"Stratejik plan\",\"checked\":false},{\"label\":\"Gözden geçirme raporu\",\"checked\":false},{\"label\":\"Eğitim katılım belgeleri\",\"checked\":false}]"
                ),

                // 2. ETİK HÜKÜMLER
                ["EtikHukumlerPolitika"] = (
                    "Etik Hükümler Politikası Beyanı",
                    "<p><strong>Belge Kodu:</strong> KYS-1 / 2.0</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>FAS DENETİM, tüm denetim faaliyetlerinde dürüstlük, tarafsızlık, mesleki yeterlilik, gizlilik ve profesyonel davranış ilkelerine bağlı kalır.</p>" +
                    "<h3>Sorumluluklar:</h3>" +
                    "<ul><li>Üst yönetim etik politikasının uygulanmasını gözetir.</li>" +
                    "<li>Her çalışan, etik ihlali tespit ettiğinde yazılı bildirim yapmakla yükümlüdür.</li></ul>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<p>Etik eğitimleri yılda en az bir kez gerçekleştirilir; çalışanlardan etik uygunluk beyanı alınır.</p>",
                    "[{\"label\":\"Etik politika imzalı\",\"checked\":false},{\"label\":\"Eğitim kayıtları\",\"checked\":false},{\"label\":\"Bildirim formları\",\"checked\":false}]"
                ),

                ["YillikBagimsizlikTaahhut"] = (
                    "Yıllık Bağımsızlık Taahhüdü (4.2)",
                    "<p><strong>Belge Kodu:</strong> KYS-1 / 4.2</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>Bağımsızlık, denetim kalitesinin temel unsurudur. Tüm ortaklar ve çalışanlar, her yıl bağımsızlık beyanı vermekle yükümlüdür.</p>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<ul><li>Yıl başında bağımsızlık formları doldurulur.</li>" +
                    "<li>Menfaat ilişkisi tespit edilirse bağımsızlık riski değerlendirilir.</li></ul>",
                    "[{\"label\":\"Yıllık beyan formları\",\"checked\":false},{\"label\":\"Risk değerlendirme raporu\",\"checked\":false},{\"label\":\"Onay kaydı\",\"checked\":false}]"
                ),

                ["EtikMusteriArastirma"] = (
                    "Müşteri Araştırma Soruları (5.2)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 5.2</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>Yeni müşteri kabulü öncesinde, müşterinin dürüstlüğü, itibarı ve faaliyetlerinin yasal uygunluğu araştırılır.</p>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<p>Standart 'Müşteri Araştırma Formu' kullanılır; vergi, ticaret sicil, medya ve sektör kaynakları incelenir.</p>",
                    "[{\"label\":\"Form eksiksiz\",\"checked\":false},{\"label\":\"Olumsuz bulgu yok\",\"checked\":false},{\"label\":\"Yönetim onayı alınmış\",\"checked\":false}]"
                ),

                ["EtikMektubu"] = (
                    "Etik Mektubu (5.4)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 5.4</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>Denetim öncesinde müşteriye, bağımsızlık, gizlilik ve tarafsızlık ilkelerini içeren etik mektup gönderilir.</p>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<p>Etik mektubu her yıl güncellenir ve müşteri temsilcisi tarafından imzalanarak iade edilir.</p>",
                    "[{\"label\":\"Mektup gönderilmiş\",\"checked\":false},{\"label\":\"İmza alınmış\",\"checked\":false},{\"label\":\"Dosyada saklanmış\",\"checked\":false}]"
                ),

                ["UzmanCalismalari"] = (
                    "Uzman Çalışmalarının Kullanılması (6.3)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 6.3</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>Denetim sürecinde uzmanlardan yararlanılması durumunda, uzman yeterliliği ve bağımsızlığı değerlendirilir.</p>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<p>Uzman seçimi kalite yöneticisi onayıyla yapılır. Uzman raporu dosyaya eklenir.</p>",
                    "[{\"label\":\"Uzman özgeçmişi\",\"checked\":false},{\"label\":\"Yeterlilik onayı\",\"checked\":false},{\"label\":\"Rapor eklendi\",\"checked\":false}]"
                ),

                ["DisUzmanKontrol"] = (
                    "Dış Uzmanların Kullanılmasına İlişkin Kontrol Listesi (6.4)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 6.4</p>" +
                    "<h3>Kontrol Alanları:</h3>" +
                    "<ul><li>Uzmanın mesleki yeterliliği değerlendirildi mi?</li>" +
                    "<li>Bağımsızlık beyanı alındı mı?</li>" +
                    "<li>Hizmet kapsamı yazılı olarak tanımlandı mı?</li>" +
                    "<li>Rapor veya çıktılar zamanında teslim edildi mi?</li></ul>",
                    "[{\"label\":\"Uzman sözleşmesi\",\"checked\":false},{\"label\":\"Bağımsızlık formu\",\"checked\":false},{\"label\":\"Rapor tarihi\",\"checked\":false}]"
                ),

                ["EgitimGelisim"] = (
                    "Eğitim ve Gelişim Kayıtları (7.7)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 7.7</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>Profesyonel bilgi ve becerilerin güncel tutulması amacıyla, çalışanlar düzenli mesleki eğitimlere katılır.</p>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<p>Her yıl kişi bazında asgari 40 saat eğitim hedeflenir; kayıtlar kalite yöneticisi tarafından arşivlenir.</p>",
                    "[{\"label\":\"Katılım sertifikaları\",\"checked\":false},{\"label\":\"Eğitim planı\",\"checked\":false},{\"label\":\"Saat sayımı kayıtları\",\"checked\":false}]"
                ),

                ["YeniHizmetSaglayici"] = (
                    "Yeni Hizmet Sağlayıcı Talep Formu (7.9)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 7.9</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>Yeni hizmet sağlayıcılar kalite ve güvenilirlik açısından değerlendirilir.</p>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<p>Talep formu doldurulur, risk değerlendirmesi yapılır ve onay alınır.</p>",
                    "[{\"label\":\"Talep formu\",\"checked\":false},{\"label\":\"Referans kontrolü\",\"checked\":false},{\"label\":\"Onay imzası\",\"checked\":false}]"
                ),

                ["MusteriSikayetKaydi"] = (
                    "Müşteri Şikâyet Kaydı (9.5)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 9.5</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>Müşteri şikâyetleri kayıt altına alınır, değerlendirilir ve düzeltici faaliyet başlatılır.</p>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<p>Şikâyet kayıt formu kalite yöneticisine iletilir, sonuç raporu hazırlanır.</p>",
                    "[{\"label\":\"Şikâyet kaydedildi mi?\",\"checked\":false},{\"label\":\"Çözüm süreci başlatıldı mı?\",\"checked\":false}]"
                ),

                // 3. MÜŞTERİ İLİŞKİSİ VE SÖZLEŞMENİN KABULÜ / DEVAMI
                ["MusteriIliskisiKabul"] = (
                    "Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Ettirilmesi (5.1)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 5.1</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>FAS DENETİM, yalnızca dürüstlüğü, itibarı ve yasal uygunluğu teyit edilen müşterilerle çalışır.</p>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<ul><li>Müşteri kabulü öncesi araştırma formları doldurulur.</li>" +
                    "<li>Denetim sözleşmesi kalite yöneticisinin onayıyla imzalanır.</li>" +
                    "<li>Devam eden müşteriler yılda en az bir kez yeniden değerlendirilir.</li></ul>",
                    "[{\"label\":\"Müşteri kabul formu\",\"checked\":false},{\"label\":\"Risk değerlendirme\",\"checked\":false},{\"label\":\"Onay yazısı\",\"checked\":false}]"
                ),

                ["MusteriArastirmaSorulari"] = (
                    "Müşteri Araştırma Soruları (5.2)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 5.2</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>Yeni müşteriyle çalışmadan önce, müşterinin yasal durumu, etik itibarı ve finansal güvenilirliği araştırılır.</p>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<ul><li>Vergi dairesi, ticaret sicil, finansal medya ve referans kaynakları incelenir.</li>" +
                    "<li>Bulgular standart forma işlenir ve yönetim onayı alınır.</li></ul>",
                    "[{\"label\":\"Form doldurulmuş\",\"checked\":false},{\"label\":\"Olumsuz bulgu yok\",\"checked\":false},{\"label\":\"Onay imzalı\",\"checked\":false}]"
                ),

                ["YeniMusteriFormu"] = (
                    "Yeni Müşteri Formu (5.3)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 5.3</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>Müşteri kabul süreci yazılı kayıt altına alınır. Form, denetim planlamasında kullanılacak temel bilgileri içerir.</p>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<ul><li>Formda unvan, faaliyet alanı, ortaklık yapısı, iletişim ve geçmiş denetçi bilgileri yer alır.</li>" +
                    "<li>Kalite yöneticisi ve ilgili ortak tarafından onaylanır.</li></ul>",
                    "[{\"label\":\"Form eksiksiz\",\"checked\":false},{\"label\":\"Bilgiler doğrulanmış\",\"checked\":false},{\"label\":\"Onay alınmış\",\"checked\":false}]"
                ),

                ["YeniMusteriKontrolListesi"] = (
                    "Yeni Müşteri Kabulü İçin Kontrol Listesi (5.5)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 5.5</p>" +
                    "<h3>Kontrol Alanları:</h3>" +
                    "<ul><li>Müşteri geçmişi araştırıldı mı?</li>" +
                    "<li>Bağımsızlık riski değerlendirildi mi?</li>" +
                    "<li>Yasal yükümlülükler kontrol edildi mi?</li>" +
                    "<li>Onay süreci tamamlandı mı?</li></ul>",
                    "[{\"label\":\"Araştırma formları\",\"checked\":false},{\"label\":\"Onay kayıtları\",\"checked\":false},{\"label\":\"Yönetim tutanağı\",\"checked\":false}]"
                ),

                ["DevamEdenMusteriKontrol"] = (
                    "Devam Eden Müşteri İçin Kontrol Listesi (5.6)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 5.6</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>Devam eden müşterilerin uygunluğu yılda bir kez yeniden gözden geçirilir.</p>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<ul><li>Müşteriyle geçmiş dönem performansı incelenir.</li>" +
                    "<li>Etik veya bağımsızlık ihlali olup olmadığı kontrol edilir.</li></ul>",
                    "[{\"label\":\"Yıllık değerlendirme formu\",\"checked\":false},{\"label\":\"Risk analizi\",\"checked\":false},{\"label\":\"Onay imzası\",\"checked\":false}]"
                ),

                ["KulturDegerlendirmesi"] = (
                    "Kültür Değerlendirmesi - Kalite (8.2)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 8.2</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>Kurumsal kültür, kaliteyi destekleyen değerler üzerine inşa edilmiştir.</p>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<ul><li>Çalışan geri bildirimleri yılda bir kez alınır.</li>" +
                    "<li>Etik davranışlar ödüllendirilir, kaliteye aykırı tutumlar raporlanır.</li></ul>",
                    "[{\"label\":\"Anket sonuçları\",\"checked\":false},{\"label\":\"Yönetim değerlendirmesi\",\"checked\":false},{\"label\":\"İyileştirme planı\",\"checked\":false}]"
                ),

                // 4. DENETİMİN YÜRÜTÜLMESİ
                ["DenetimEtikHukumler"] = (
                    "Denetim - Etik Hükümler Politikası (4.1)",
                    "<p><strong>Belge Kodu:</strong> KYS-1 / 4.1</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>Tüm denetim ekipleri, dürüstlük, tarafsızlık, profesyonel davranış ve gizlilik ilkelerine uymakla yükümlüdür.</p>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<ul><li>Her denetim başında etik uygunluk beyanı alınır.</li>" +
                    "<li>Etik ihlal durumlarında kalite yöneticisine rapor verilir.</li></ul>",
                    "[{\"label\":\"Etik beyan formu\",\"checked\":false},{\"label\":\"Eğitim kayıtları\",\"checked\":false},{\"label\":\"Bildirim tutanakları\",\"checked\":false}]"
                ),

                ["DenetimYurutulmesiPolitika"] = (
                    "Denetimin Yürütülmesi Politikası (6.1)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 6.1</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>Denetim çalışmaları, planlama aşamasından raporlamaya kadar kalite, doğruluk ve BDS standartlarına uygun şekilde yürütülür.</p>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<ul><li>Her denetim için görev dağılımı yapılır.</li>" +
                    "<li>Çalışma belgeleri elektronik ortamda arşivlenir.</li>" +
                    "<li>Kalite gözden geçirme süreçleri uygulanır.</li></ul>",
                    "[{\"label\":\"Planlama notu\",\"checked\":false},{\"label\":\"Görev dağılımı\",\"checked\":false},{\"label\":\"Gözden geçirme onayı\",\"checked\":false}]"
                ),

                ["CalismaKontrolFormu"] = (
                    "Çalışma Kontrol Formu (6.2)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 6.2</p>" +
                    "<h3>Amaç:</h3>" +
                    "<p>Denetim çalışmaları tamamlanmadan önce tüm önemli alanların incelendiğini ve kanıtların yeterli olduğunu belgelemek.</p>" +
                    "<h3>Kontrol Alanları:</h3>" +
                    "<ul><li>Denetim programı tamamlandı mı?</li>" +
                    "<li>Tüm örneklem dosyaları eklendi mi?</li>" +
                    "<li>Bulgular özetlendi mi?</li></ul>",
                    "[{\"label\":\"Tamamlanmış çalışma kâğıtları\",\"checked\":false},{\"label\":\"Denetçi onayı\",\"checked\":false}]"
                ),

                ["GorusFarkliliklarCozum"] = (
                    "Görüş Farklılıklarının Çözüme Kavuşturulması (6.5)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 6.5</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>Denetim ekibi içinde veya müşteriyle ortaya çıkan görüş farklılıkları, objektif ve belgelendirilebilir şekilde çözülür.</p>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<ul><li>Görüş ayrılığı kalite yöneticisine bildirilir.</li>" +
                    "<li>Çözüm süreci yazılı tutanakla kayıt altına alınır.</li></ul>",
                    "[{\"label\":\"Görüş farklılığı formu\",\"checked\":false},{\"label\":\"Karar tutanağı\",\"checked\":false},{\"label\":\"Taraf imzaları\",\"checked\":false}]"
                ),

                ["DenetimKaliteGozden"] = (
                    "Denetimin Kalitesinin Gözden Geçirilmesi Formu (6.6)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 6.6</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>Denetim raporu yayımlanmadan önce, kalite yöneticisi veya kıdemli denetçi tarafından ikinci gözle değerlendirme yapılır.</p>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<ul><li>Rapor, finansal tablo ve çalışma dosyası tutarlılığı kontrol edilir.</li>" +
                    "<li>Gözden geçirme sonuçları formda belge edilir.</li></ul>",
                    "[{\"label\":\"İnceleme formu\",\"checked\":false},{\"label\":\"Onay kaydı\",\"checked\":false},{\"label\":\"Düzeltme notu\",\"checked\":false}]"
                ),

                ["DenetimGozdenGecirme"] = (
                    "Denetimin Gözden Geçirilmesi Formu (9.3)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 9.3</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>Denetim süreçlerinin genel kalitesi periyodik olarak gözden geçirilir ve sonuçlar yönetim raporuna yansıtılır.</p>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<ul><li>Her yıl rastgele seçilen denetimler kalite ekibi tarafından incelenir.</li>" +
                    "<li>Bulgular kalite iyileştirme planına dahil edilir.</li></ul>",
                    "[{\"label\":\"Gözden geçirme raporu\",\"checked\":false},{\"label\":\"İyileştirme planı\",\"checked\":false},{\"label\":\"Takip notu\",\"checked\":false}]"
                ),

                // 5. KAYNAKLAR
                ["KaynaklarPolitika"] = (
                    "Kaynaklar Politikası Beyanı (7.1)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 7.1</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>FAS DENETİM, kalite hedeflerine ulaşmak için gerekli insan, finansal, teknolojik ve fiziksel kaynakların yeterliliğini sağlar.</p>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<ul><li>İnsan kaynağı ihtiyaçları yıllık planlamada belirlenir.</li>" +
                    "<li>Donanım ve yazılım altyapısı periyodik olarak yenilenir.</li></ul>",
                    "[{\"label\":\"Kaynak planı\",\"checked\":false},{\"label\":\"Onay kaydı\",\"checked\":false},{\"label\":\"Revizyon izleme tablosu\",\"checked\":false}]"
                ),

                ["IsTanimlari"] = (
                    "İş Tanımları (7.2)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 7.2</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>Her pozisyon için görev, yetki ve sorumluluklar yazılı olarak tanımlanır.</p>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<ul><li>İş tanımları yıllık olarak gözden geçirilir.</li>" +
                    "<li>Değişiklikler personele yazılı olarak bildirilir.</li></ul>",
                    "[{\"label\":\"Güncel iş tanımı\",\"checked\":false},{\"label\":\"Bildirim onayı\",\"checked\":false},{\"label\":\"Revizyon tarihi\",\"checked\":false}]"
                ),

                ["AdayGorusmeKontrol"] = (
                    "Aday Görüşme ve Değerlendirme Kontrol Listesi (7.3)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 7.3</p>" +
                    "<h3>Amaç:</h3>" +
                    "<p>Yeni personel seçiminde adil, objektif ve kalite odaklı değerlendirme sürecinin belgelenmesini sağlamak.</p>" +
                    "<h3>Kontrol Alanları:</h3>" +
                    "<ul><li>Aday özgeçmişi incelendi mi?</li>" +
                    "<li>Görüşme formu dolduruldu mu?</li>" +
                    "<li>Değerlendirme komitesi onayladı mı?</li></ul>",
                    "[{\"label\":\"Görüşme formu\",\"checked\":false},{\"label\":\"Aday değerlendirme tablosu\",\"checked\":false},{\"label\":\"Onay tutanağı\",\"checked\":false}]"
                ),

                ["YeniCalisanOryantasyon"] = (
                    "Yeni Çalışan Oryantasyon Kontrol Listesi (7.4)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 7.4</p>" +
                    "<h3>Amaç:</h3>" +
                    "<p>Yeni personelin kurum kültürüne, kalite politikalarına ve etik ilkelere uyum sürecini takip etmek.</p>" +
                    "<h3>Kontrol Alanları:</h3>" +
                    "<ul><li>Etik politika eğitimi verildi mi?</li>" +
                    "<li>Sistem erişim yetkileri tanımlandı mı?</li>" +
                    "<li>Mentor atanması yapıldı mı?</li></ul>",
                    "[{\"label\":\"Eğitim formu\",\"checked\":false},{\"label\":\"Yetkilendirme kaydı\",\"checked\":false},{\"label\":\"İmza listesi\",\"checked\":false}]"
                ),

                ["TeknoljiSatinAlma"] = (
                    "Teknoloji Satın Alma Talep Formu (7.8)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 7.8</p>" +
                    "<h3>Amaç:</h3>" +
                    "<p>Yeni yazılım, donanım veya lisans alımlarının kalite gerekliliklerine uygunluğunu değerlendirmek.</p>" +
                    "<h3>Kontrol Alanları:</h3>" +
                    "<ul><li>Talep gerekçesi açıklandı mı?</li>" +
                    "<li>Bütçe onayı alındı mı?</li>" +
                    "<li>Teknik uygunluk kontrol edildi mi?</li></ul>",
                    "[{\"label\":\"Talep formu\",\"checked\":false},{\"label\":\"Onay yazısı\",\"checked\":false},{\"label\":\"Satın alma fişi\",\"checked\":false}]"
                ),

                // 6. BİLGİ VE İLETİŞİM
                ["BilgiIletisimPolitika"] = (
                    "Bilgi ve İletişim Politikası Beyanı (8.1)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 8.1</p>" +
                    "<h3>Politika Beyanı:</h3>" +
                    "<p>Denetim faaliyetlerinde doğru, zamanında ve güvenli bilgi akışı esastır. FAS DENETİM, tüm iletişim kanallarında gizlilik, bütünlük ve erişilebilirlik ilkelerine bağlıdır.</p>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<ul><li>E-posta ve yazışmalarda gizlilik politikası uygulanır.</li>" +
                    "<li>Bilgi paylaşımı yetkilendirme ilkelerine göre yapılır.</li></ul>",
                    "[{\"label\":\"Bilgi politikası duyurusu\",\"checked\":false},{\"label\":\"Erişim kayıtları\",\"checked\":false},{\"label\":\"Onay raporu\",\"checked\":false}]"
                ),

                ["BilgiYonetimiGuvenlik"] = (
                    "Bilgi Yönetimi ve Güvenlik Prosedürü Özeti (8.3)",
                    "<p><strong>Belge Kodu:</strong> KYS-2 / 8.3</p>" +
                    "<h3>Amaç:</h3>" +
                    "<p>Bilgi varlıklarının gizliliğini, bütünlüğünü ve erişilebilirliğini korumak.</p>" +
                    "<h3>Uygulama Esasları:</h3>" +
                    "<ul><li>Tüm cihazlar parola korumalıdır.</li>" +
                    "<li>Hassas veriler şifreli kanallar üzerinden iletilir.</li>" +
                    "<li>Bilgi ihlali durumunda olay raporu hazırlanır.</li></ul>",
                    "[{\"label\":\"Güvenlik protokolü\",\"checked\":false},{\"label\":\"Olay kayıtları\",\"checked\":false},{\"label\":\"Eğitim katılım listesi\",\"checked\":false}]"
                )
            };
        }
    }
}
