using FasWebApi.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FasWebApi.Data.Configurations
{
    public class KysBelgelerConfiguration : IEntityTypeConfiguration<KysBelgeler>
    {
        public void Configure(EntityTypeBuilder<KysBelgeler> builder)
        {
            builder.HasKey(x => x.Id);
            var createdDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            builder.HasData(

                new KysBelgeler
                {
                    Id = 1,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "1.1 Belgelendirme Politikası Beyanı",
                    FormKodu = "KysBelgelendirmePolitikasi",
                    Islem = "Kalite yönetim sistemine ilişkin çalışma kâğıtları, en az [sayı yazınız] yıl süreyle saklanacaktır.",
                    Tespit = "",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                },

                new KysBelgeler
                {
                    Id = 2,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "1.2 Kalite Yönetim Sistemi Esas Belgesi",
                    FormKodu = "KysKaliteYonetimSistemiEsasBelgesi",
                    Islem = "Denetim Şirketinin Felsefesi nasıldır?",
                    Tespit = "",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                },

                new KysBelgeler
                {
                    Id = 3,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "1.2 Kalite Yönetim Sistemi Esas Belgesi",
                    FormKodu = "KysKaliteYonetimSistemiEsasBelgesi",
                    Islem = "Bağımsız Denetçi mesleği hakkında şirketimizin görüşleri nelerdir?",
                    Tespit = "Bağımsız denetçilik mesleğine değer veriyor ve seçeceğimiz müşterilerin dürüstlüğünden emin olmaya çalışıyoruz. Çalışanlarımızdan mesleğe yakışır bir şekilde davranmalarını bekliyor ve şirket içi politika ve eğitimler vasıtasıyla etik ve mesleki şüpheciliğin önemine vurgu yapıyoruz.",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                },

                new KysBelgeler
                {
                    Id = 4,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "1.2 Kalite Yönetim Sistemi Esas Belgesi",
                    FormKodu = "KysKaliteYonetimSistemiEsasBelgesi",
                    Islem = "Şirketimizin müşteri ilişkileri nasıldır?",
                    Tespit = "",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                },

                new KysBelgeler
                {
                    Id = 5,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "1.2 Kalite Yönetim Sistemi Esas Belgesi",
                    FormKodu = "KysKaliteYonetimSistemiEsasBelgesi",
                    Islem = "Şirketimizdeki çalışanlar ile ilişkilerimiz nasıldır?",
                    Tespit = "",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                },

                new KysBelgeler
                {
                    Id = 6,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "1.2 Kalite Yönetim Sistemi Esas Belgesi",
                    FormKodu = "KysKaliteYonetimSistemiEsasBelgesi",
                    Islem = "Denetim Şirketimizin Geçmişi hakkında bilgiler",
                    Tespit = "Denetim şirketi [yıl yazınız] yılında kurulmuştur ve çok farklı sektörlerde faaliyet gösteren müşterilere güvence, derleme ve danışmanlık hizmetleri [gerektiği gibi uyarlayınız] vermektedir [Belirli sektörlerdeki müşteri türlerini ve deneyimlerini belirlemek için faydalıdır].",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                },

                new KysBelgeler
                {
                    Id = 7,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "1.2 Kalite Yönetim Sistemi Esas Belgesi",
                    FormKodu = "KysKaliteYonetimSistemiEsasBelgesi",
                    Islem = "Denetim Şirketinin Yapısı hakkında bilgiler",
                    Tespit = "Denetim şirketinin yapı diyagramına [1.3] atıfta bulununuz. Denetim şirketi bir denetim ağının parçası değildir.",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                },

                new KysBelgeler
                {
                    Id = 8,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "1.2 Kalite Yönetim Sistemi Esas Belgesi",
                    FormKodu = "KysKaliteYonetimSistemiEsasBelgesi",
                    Islem = "Denetim Şirketinin Hedefi hakkında bilgiler",
                    Tespit = "Denetim şirketi olarak müşterilerimize ve mesleğimize hizmet etme yükümlülüğümüzün olduğunu kabul ediyoruz. Denetim şirketimizin temel hedefi, bu yükümlülükleri yerine getirmek ve yüksek kalitede iş sunmaktır. Temel hedeflerimiz aşağıdaki şekildedir: • Denetim ve güvence mesleğine uygun her alandaki müşterilerimize mükemmel bir şekilde hizmet vermek. • Denetim şirketi içerisinde en yüksek düzeyde yetkinliği, bağımsızlığı ve dürüstlüğü sürdürerek, müşteri hizmetlerinde mükemmelliği sağlamak. • Muhasebe ve denetim mesleğinin ve topluluğumuzun gelişmesine dâhil olmak ve katkıda bulunmak. • Denetim şirketi içerisinde kişisel ve mesleki gelişim, becerilerde ve kişisel ilişkilerde ilerleme ve ödüllendirici iş deneyimleri için fırsat sağlamak. • Özel becerileri ve uzmanlığı geliştirip iyileştirerek, hizmet kapsamımızı ve müşteri çevremizi korumak.",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                },

                new KysBelgeler
                {
                    Id = 9,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "1.2 Kalite Yönetim Sistemi Esas Belgesi",
                    FormKodu = "KysKaliteYonetimSistemiEsasBelgesi",
                    Islem = "Denetim şirketinin büyüklüğü",
                    Tespit = "Denetim şirketinin mevcut durumda [sayı yazınız] sorumlu denetçisi ve [sayı yazınız] profesyonel çalışanı ile [diğer çalışanların kim olduğunu belirtiniz, örneğin, idari yönetici] vardır. Denetim şirketi tarafından yıllık olarak artırılan ücretlerin düzeyi, mevcut sektör ölçütlerine göre bu yapıyı yansıtmaktadır. Üniversite mezunları veya öğrencileri istihdam edilir ve uygun eğitim alır.",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                },

                new KysBelgeler
                {
                    Id = 10,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "1.2 Kalite Yönetim Sistemi Esas Belgesi",
                    FormKodu = "KysKaliteYonetimSistemiEsasBelgesi",
                    Islem = "Hizmet Yaklaşımı",
                    Tespit = "Üstün müşteri hizmeti, mevzuatın ve mesleki standartların sınırları dâhilinde, temel hedefimiz ve çalışma ilkemizdir. Bu hizmeti, mesleki yeteneklerimizin tamamını her müşteriye hazır tutarak ve değişen ihtiyaçlarının zamanında karşılanmasını sağlayarak vermeye çalışıyoruz. Deneyim ve uzmanlık alanlarımız dışındaki mesleki çalışmalar kabul edilmemektedir. [Hangi tür müşteriler ve hizmetler için bünyenize en uygun olduğunu düşünüyorsanız, bu hususları burada açıklayınız; örneğin, küçük ve orta ölçekli denetim hizmetleri gibi.] Ayrıca, ücret ödemenin bir müşterinin işine gösterdiğimiz özen ve ilginin düzeyi üzerinde herhangi bir etkisinin olmamasını sağlamaya çalışıyoruz. Bu nedenle ekiplerimizi ve liderlik yapımızı, müşterilere sunulan hizmetin kalite seviyesini etkileyebilecek kişisel tercihlerden kaçınmaya çalışacak şekilde planlıyoruz. İletişim kurmaya çalıştığımız husus; daha küçük müşteriler için sağladığımız hizmetlerde, daha az deneyimli çalışanlar bütün çalışmaların tek başına sorumluluğunu hiçbir zaman üstlenmeyeceklerdir. Öte yandan, daha büyük müşterilerimizin kıdemli yöneticiler ve ortaklarla sürekli ve doğrudan iletişim kurmalarını ve bu sayede değer katmayı hedefliyoruz. Tüm bu hizmetleri gerçekleştirirken, birlikte çalıştığımız tüm kişilere karşı her zaman özenli ve tedbirli davranılması gerekmektedir.",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                },

                new KysBelgeler
                {
                    Id = 11,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "1.2 Kalite Yönetim Sistemi Esas Belgesi",
                    FormKodu = "KysKaliteYonetimSistemiEsasBelgesi",
                    Islem = "Mesleki hizmetler",
                    Tespit = "Finansal tabloların bağımsız denetimi ile sınırlı bağımsız denetimleri; kendi büromuzda veya yerinde yapıyoruz. Bağımsız denetim sözleşmeleri için, yalnızca Uluslararası Denetim Standardı veya ülkemizde yürürlükte olan denetim standartlarına uygun denetimler gerçekleştiriyoruz. Mevzuatın gerektirdiği diğer denetimler için, her zaman ilgili standartlara uyarız. Denetim hizmetleri dışında; muhasebe, vergi ve danışmanlık hizmetleri de sunmaktayız. Ancak, bağımsızlık ve mesleki etik kuralları göz önünde bulundurarak, aynı müşteriye hem denetim hem danışmanlık hizmeti verilip verilemeyeceğini her durumda dikkatle değerlendiririz.",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                },

                new KysBelgeler
                {
                    Id = 12,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "1.2 Kalite Yönetim Sistemi Esas Belgesi",
                    FormKodu = "KysKaliteYonetimSistemiEsasBelgesi",
                    Islem = "Coğrafi Ayrıntılar",
                    Tespit = "Denetim şirketi müşterilerinin bulunduğu bölge büyük ölçüde [coğrafi bölgeyi yazınız] bölgesinden oluşmaktadır. Faaliyet gösterdiğimiz coğrafi alan, şirketin kaynak tahsisini, seyahat planlamasını ve müşteri ilişkilerini önemli ölçüde etkiler. Bu nedenle, coğrafi detaylar düzenli aralıklarla gözden geçirilmeli ve müşteri portföyündeki değişiklikler ışığında güncellenmelidir.",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                },
                new KysBelgeler
                {
                    Id = 13,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "1.3 Denetim Şirketinin Yapısı",
                    FormKodu = "KysDenetimSirketininYapisi",
                    Islem = "Denetim Şirketinin Yapısı",
                    Tespit = "Sorumlu Denetçiler:\r\nDenetim Ekibi:\r\nYöneticiler:",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                },


                //2
                new KysBelgeler
                {
                    Id = 14,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "2.1 Risk Değerlendirme Süreci Politikası Beyanı",
                    FormKodu = "KysRiskDegerlendirmePolitikasi",
                    Islem = "Denetim şirketimizin risk esaslı yaklaşımı nasıl tanımlanmıştır?",
                    Tespit = "Denetim şirketi, kalite yönetim sistemi unsurlarının tasarımı, uygulanması ve sürdürülmesinde risk esaslı bir yaklaşımı temel alır. Bu yaklaşımın amacı; kalite hedeflerine ulaşılmasını olumsuz etkileyebilecek faktörleri önceden belirlemek ve denetim kalitesinin kesintisiz şekilde korunmasını sağlamaktır.",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                },
                new KysBelgeler
                {
                    Id = 15,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "2.1 Risk Değerlendirme Süreci Politikası Beyanı",
                    FormKodu = "KysRiskDegerlendirmePolitikasi",
                    Islem = "Risk değerlendirme süreci nasıl tasarlanmaktadır?",
                    Tespit = "Şirket, kalite hedeflerini oluşturmak, kalite risklerini belirlemek ve bu risklere yönelik işleri tasarlamak amacıyla sistematik bir risk değerlendirme süreci uygular. Süreç yılda en az bir kez ve gerekli görüldüğünde güncellenir.",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                },
                new KysBelgeler
                {
                    Id = 16,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "2.1 Risk Değerlendirme Süreci Politikası Beyanı",
                    FormKodu = "KysRiskDegerlendirmePolitikasi",
                    Islem = "Kalite hedefleri şirket içinde nasıl belirlenmektedir?",
                    Tespit = "Kalite hedefleri, KYS 1’in 28–33. paragraflarına uygun olarak oluşturulur. Mevcut hedeflerin yeterliliği her yıl gözden geçirilir ve gerektiğinde ilave kalite hedefleri belirlenir.",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                },
                new KysBelgeler
                {
                    Id = 17,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "2.1 Risk Değerlendirme Süreci Politikası Beyanı",
                    FormKodu = "KysRiskDegerlendirmePolitikasi",
                    Islem = "Şirketin niteliği ve içinde bulunduğu şartlar kalite risklerini nasıl etkilemektedir?",
                    Tespit = "Şirketin büyüklüğü, müşteri profili, denetim türleri, iş süreçleri, liderlik yapısı, kaynaklar ve faaliyet gösterilen mevzuat çevresi kalite risklerinin belirlenmesinde temel girdilerdir.",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                },

                new KysBelgeler
                {
                    Id = 18,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "2.1 Risk Değerlendirme Süreci Politikası Beyanı",
                    FormKodu = "KysRiskDegerlendirmePolitikasi",
                    Islem = "Politikalar ve prosedürler kalite risklerini azaltmak amacıyla nasıl uygulanmaktadır?",
                    Tespit = "Politikalar, çalışanın hangi durumlarda nasıl davranması gerektiğini ortaya koyarken; prosedürler adım adım uygulamayı tarif eder. Bu süreçler tüm personele duyurulur ve uyum izlenir.",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                },
                new KysBelgeler
                {
                    Id = 19,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı",
                    FormKodu = "KysUstYonetimPolitikasi",
                    Islem = "Denetim şirketimizin risk esaslı yaklaşımı nasıl tanımlanmıştır?",
                    Tespit = "Denetim şirketi, kalite yönetim sistemi unsurlarının tasarımı, uygulanması ve sürdürülmesinde risk esaslı bir yaklaşımı temel alır. Bu yaklaşımın amacı; kalite hedeflerine ulaşılmasını olumsuz etkileyebilecek faktörleri önceden belirlemek ve denetim kalitesinin kesintisiz şekilde korunmasını sağlamaktır.",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                },
                new KysBelgeler
                {
                    Id = 20,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı",
                    FormKodu = "KysUstYonetimPolitikasi",
                    Islem = "Kalite yönetim sisteminin nihai sorumluluğu kimdedir?",
                    Tespit = "KYS’nin nihai sorumluluğu, deneyimli ve nitelikli bir yönetici ortağa verilmiştir. Bu kişi KYS’nin tasarımı, uygulanması ve hesap verebilirliğinden sorumludur.",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                }
                , new KysBelgeler
                {
                    Id = 21,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı",
                    FormKodu = "KysUstYonetimPolitikasi",
                    Islem = "Üst yönetimin kaliteye bağlılığı nasıl tanımlanmıştır?",
                    Tespit = "Yönetim, kaliteyi tüm ticari kaygıların üzerinde tutmakta; düşük kalitenin şirketin ve mesleğin itibarına zarar vereceğini kabul etmektedir.",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                }
                , new KysBelgeler
                {
                    Id = 22,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı",
                    FormKodu = "KysUstYonetimPolitikasi",
                    Islem = "Ekip üyelerinden kalite konusunda hangi temel beklentiler vardır?",
                    Tespit = "Tüm ekip üyelerinin verilen görevlerde yüksek kaliteyi sürdürmesi ve kabul edilen prosedürlere tam uyum göstermesi beklenmektedir.",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                }
                , new KysBelgeler
                {
                    Id = 23,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı",
                    FormKodu = "KysUstYonetimPolitikasi",
                    Islem = "Ticari baskıların kaliteyi etkilemesi nasıl önlenmektedir?",
                    Tespit = "Yönetim kaliteye ilişkin kararların ticari kaygılardan bağımsız alınmasını garanti eder; kalite hiçbir şartta ikinci plana atılamaz.",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                }
                , new KysBelgeler
                {
                    Id = 24,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı",
                    FormKodu = "KysUstYonetimPolitikasi",
                    Islem = "Kaliteye bağlılık performans değerlendirmelerinde nasıl dikkate alınmaktadır?",
                    Tespit = "Hem ekip üyelerinin hem sorumlu denetçilerin performans ve ücret değerlendirmelerinde kaliteye bağlılık dikkate alınmaktadır.",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                }
                , new KysBelgeler
                {
                    Id = 25,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı",
                    FormKodu = "KysUstYonetimPolitikasi",
                    Islem = "Eğitim kalite yönetim sisteminde ne rol oynar?",
                    Tespit = "Eğitim, kaliteyi sürdürmenin temel unsurudur. Şirket tüm çalışanların görevleriyle ilgili eğitimlere katılmasını zorunlu tutar.",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                }
                , new KysBelgeler
                {
                    Id = 26,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı",
                    FormKodu = "KysUstYonetimPolitikasi",
                    Islem = "KYS’nin belgelendirilmesi ve dokümantasyonu nasıl sağlanmıştır?",
                    Tespit = "Politika ve prosedürler yazılı hale getirilmiş, KYS 1 hükümleri denetim süreçlerinin tamamına entegre edilmiştir.",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                }
                , new KysBelgeler
                {
                    Id = 27,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı",
                    FormKodu = "KysUstYonetimPolitikasi",
                    Islem = "",
                    Tespit = "",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                }
                , new KysBelgeler
                {
                    Id = 28,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı",
                    FormKodu = "KysUstYonetimPolitikasi",
                    Islem = "Kalite yönetim sisteminin güncelliği nasıl korunmaktadır?",
                    Tespit = "Sistem yılda en az bir kez gözden geçirilir; mevzuat değişiklikleri, müşteri profili ve izleme sonuçlarına göre güncellenir.",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                }
                , new KysBelgeler
                {
                    Id = 29,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı",
                    FormKodu = "KysUstYonetimPolitikasi",
                    Islem = "Üst yönetim kalite kültürünü çalışanlara nasıl yansıtmaktadır?",
                    Tespit = "Üst yönetim açık iletişim, rol model davranış, prosedürlere bağlılık ve düzenli geri bildirim yoluyla kalite odaklı bir çalışma ortamı oluşturur.",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                }
                , new KysBelgeler
                {
                    Id = 30,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı",
                    FormKodu = "KysUstYonetimPolitikasi",
                    Islem = "KYS’nin işleyişi ve uyumu nasıl izlenmektedir?",
                    Tespit = "İzleme faaliyetleri, dosya incelemeleri, performans değerlendirmeleri ve şikâyet/iddia analizleri ile yapılır; sonuçlar doğrultusunda sistem iyileştirilir.",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                }
                , new KysBelgeler
                {
                    Id = 31,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "3.2 Sorumlulukların Verilmesi",
                    FormKodu = "KysSorumluluklarinVerilmesi",
                    Islem = "Kalite yönetim sistemi için nihai sorumluluk ve hesap verme yükümlülüğü:",
                    Tespit = "Kalite yönetim sistemi için nihai sorumluluk ve hesap verme yükümlülüğünün [Adını buraya yazınız] adlı kişiye verilmesi kararlaştırılmıştır",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                }
                ,
                new KysBelgeler
                {
                    Id = 32,
                    DenetlenenId = null,
                    DenetciId = null,
                    Yil = null,
                    Standartmi = true,
                    BelgeAdi = "3.2 Sorumlulukların Verilmesi",
                    FormKodu = "KysSorumluluklarinVerilmesi",
                    Islem = "Kalite yönetim sisteminin işleyişine ilişkin sorumluluk:",
                    Tespit = "Kalite yönetim sisteminin işleyişine ilişkin sorumluluğun[Adını buraya yazınız] adlı kişiye verilmesi kararlaştırılmıştır",
                    CreatedDate = new DateTime(2024, 1, 1),
                    UpdatedDate = null
                },

                // 4.1 Etik Hükümler Politikası Beyanı
                new KysBelgeler
                {
                    Id = 33,
                    BelgeAdi = "4.1 Etik Hükümler Politikası Beyanı",
                    FormKodu = "EtikHukumlerPolitikaBeyani",
                    Islem = "Ekip üyeleri, mesleki faaliyetlerinde kamu yararına hizmet etme sorumluluğunun farkında mı ve bu doğrultuda hareket ediyor mu?",
                    Tespit = "Ekip üyelerinin kamu yararına hizmet etme sorumluluğu konusunda farkındalıkları mevcuttur ve bu ilke denetim sürecine yansıtılmıştır.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 34,
                    BelgeAdi = "4.1 Etik Hükümler Politikası Beyanı",
                    FormKodu = "EtikHukumlerPolitikaBeyani",
                    Islem = "Ekip üyeleri, müşterilerle olan ilişkilerinde dürüstlük, tarafsızlık ve bağımsızlık ilkelerine uygun şekilde hareket etmekte midir?",
                    Tespit = "Ekip üyelerinin müşteriye olan kişisel, mali ve sosyal ilişkileri değerlendirilmiş, bağımsızlık ilkelerini zedeleyecek bir durum tespit edilmemiştir. Gerekli bildirim ve onay süreçleri işletilmiştir.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 35,
                    BelgeAdi = "4.1 Etik Hükümler Politikası Beyanı",
                    FormKodu = "EtikHukumlerPolitikaBeyani",
                    Islem = "Ekip üyeleri, müşteri bilgilerini gizli tutma yükümlülüğüne uygun davranmakta ve gerekli tedbirleri almakta mıdır?",
                    Tespit = "Ekip üyelerinin gizliliğe ilişkin yükümlülükleri konusunda bilgilendirildiği ve müşteri bilgilerine ilişkin gizlilik kurallarına uygun hareket ettikleri gözlemlenmiştir.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 36,
                    BelgeAdi = "4.1 Etik Hükümler Politikası Beyanı",
                    FormKodu = "EtikHukumlerPolitikaBeyani",
                    Islem = "Ekip üyeleri, Bağımsız Denetçiler için Etik Kurallar'a ve ilgili düzenlemelere uygun şekilde hareket etmekte midir?",
                    Tespit = "Etik hükümlere ilişkin farkındalık sağlanmış, ekip üyeleri tarafından herhangi bir etik endişe bildirilmemiştir. Gerekli durumlar için danışma mekanizmaları tanımlanmıştır.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 37,
                    BelgeAdi = "4.1 Etik Hükümler Politikası Beyanı",
                    FormKodu = "EtikHukumlerPolitikaBeyani",
                    Islem = "Bağımsızlığa yönelik tehditlerin belirlenmesi, değerlendirilmesi ve gerekli bildirimlerin yapılması süreçleri etkili biçimde işletilmekte midir?",
                    Tespit = "Bağımsızlık tehditleri değerlendirilmiş, açıkça önemsiz olmayan durumlar belgelendirilmiş ve denetim kalite liderine bildirilmiştir.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 38,
                    BelgeAdi = "4.1 Etik Hükümler Politikası Beyanı",
                    FormKodu = "EtikHukumlerPolitikaBeyani",
                    Islem = "Ekip üyeleri yıllık bağımsızlık taahhütlerini tamamlamış ve müşteri ilişkileri ile sunulan hizmetler bu kapsamda değerlendirilmiş midir?",
                    Tespit = "Yıllık bağımsızlık taahhütleri alınmış, güvence müşterilerine yönelik hizmetlerin kapsamı ekip üyelerine bildirilmiştir.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 39,
                    BelgeAdi = "4.1 Etik Hükümler Politikası Beyanı",
                    FormKodu = "EtikHukumlerPolitikaBeyani",
                    Islem = "Denetçi rotasyonu ilgili mevzuata uygun şekilde yürütülmekte midir?",
                    Tespit = "Rotasyona tabi denetçiler için geçmiş dönem çalışmaları kontrol edilmiş ve yasal süreler aşılmamıştır.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 40,
                    BelgeAdi = "4.1 Etik Hükümler Politikası Beyanı",
                    FormKodu = "EtikHukumlerPolitikaBeyani",
                    Islem = "Denetim şirketi, tek bir müşteriye olan gelir bağımlılığına ilişkin tehditleri izlemekte ve gerekli değerlendirmeleri yapmakta mıdır?",
                    Tespit = "Ücret bağımlılığı izlenmiş, belirlenen eşik değerlere yaklaşılması halinde önlem alınmasına yönelik değerlendirme yapılmıştır.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 41,
                    BelgeAdi = "4.1 Etik Hükümler Politikası Beyanı",
                    FormKodu = "EtikHukumlerPolitikaBeyani",
                    Islem = "Bağımsızlığa etki edebilecek hususlar müşterinin yönetimi veya denetim komitesine uygun şekilde iletilmiş midir?",
                    Tespit = "Bağımsızlıkla ilgili konular, denetim türüne uygun şekilde müşteriye yazılı/sözlü olarak bildirilmiştir.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },

                // 4.2 Yıllık Bağımsızlık Taahhüdü
                new KysBelgeler
                {
                    Id = 42,
                    BelgeAdi = "4.2 Yıllık Bağımsızlık Taahhüdü",
                    FormKodu = "YillikBagimsizlikTaahhudu",
                    Islem = "Bir müşteride ya da onun bağlı ortaklıklarında/iştiraklerinde doğrudan veya dolaylı önemli bir finansal çıkarınız bulunuyor mu?",
                    Tespit = "",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 43,
                    BelgeAdi = "4.2 Yıllık Bağımsızlık Taahhüdü",
                    FormKodu = "YillikBagimsizlikTaahhudu",
                    Islem = "Bir müşterinin herhangi bir büyük rakibi, yatırımcısı veya iştiraklerinde finansal çıkarınız bulunuyor mu?",
                    Tespit = "",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 44,
                    BelgeAdi = "4.2 Yıllık Bağımsızlık Taahhüdü",
                    FormKodu = "YillikBagimsizlikTaahhudu",
                    Islem = "Bir müşterinin herhangi bir büyük rakibi, yatırımcısı veya iştiraklerinde finansal çıkarınız bulunuyor mu?",
                    Tespit = "",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 45,
                    BelgeAdi = "4.2 Yıllık Bağımsızlık Taahhüdü",
                    FormKodu = "YillikBagimsizlikTaahhudu",
                    Islem = "Bir müşteriye herhangi bir borcunuz var mı (normal bir müşteri gibi olunması veya normal borç verme şartları altında bir konut kredisi dışında)?",
                    Tespit = "",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 46,
                    BelgeAdi = "4.2 Yıllık Bağımsızlık Taahhüdü",
                    FormKodu = "YillikBagimsizlikTaahhudu",
                    Islem = "Bir müşteri için ödeme izni verme yetkiniz var mı?",
                    Tespit = "",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 47,
                    BelgeAdi = "4.2 Yıllık Bağımsızlık Taahhüdü",
                    FormKodu = "YillikBagimsizlikTaahhudu",
                    Islem = "Bir müşteriyle tanıtımcı, sigortacı veya oy veren mütevelli/kayyum, yönetici, yetkili olarak ya da yönetimin bir üyesi veya bir çalışana eşdeğer herhangi bir sıfatla bağlantınız var mı?",
                    Tespit = "",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 48,
                    BelgeAdi = "4.2 Yıllık Bağımsızlık Taahhüdü",
                    FormKodu = "YillikBagimsizlikTaahhudu",
                    Islem = "Bir müşterinin yöneticisi, mütevelli/kayyumu, yetkilisi veya çalışanı olarak hizmet veriyor musunuz?",
                    Tespit = "",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 49,
                    BelgeAdi = "4.2 Yıllık Bağımsızlık Taahhüdü",
                    FormKodu = "YillikBagimsizlikTaahhudu",
                    Islem = "Eşiniz veya bakmakla yükümlü olduğunuz çocuğunuz bir müşteri tarafından istihdam ediliyor mu?",
                    Tespit = "",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 50,
                    BelgeAdi = "4.2 Yıllık Bağımsızlık Taahhüdü",
                    FormKodu = "YillikBagimsizlikTaahhudu",
                    Islem = "Ailenizden herhangi biri bir müşteri tarafından yönetimle ilgili pozisyonda istihdam edildi mi?",
                    Tespit = "",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 51,
                    BelgeAdi = "4.2 Yıllık Bağımsızlık Taahhüdü",
                    FormKodu = "YillikBagimsizlikTaahhudu",
                    Islem = "Sorumluluğunuzdaki müşteriler için ödemesi gecikmiş herhangi bir fatura var mı?",
                    Tespit = "",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },

                // 4.3 Bağımsızlıkla İlgili Sorunları Çözüme Kavuşturma Formu
                new KysBelgeler
                {
                    Id = 52,
                    BelgeAdi = "4.3 Bağımsızlıkla İlgili Sorunları Çözüme Kavuşturma Formu",
                    FormKodu = "KysBagimsizlikSorunlariCozumu",
                    Islem = "Bağımsızlıkla ilgili sorun hakkında bilgiler :",
                    Tespit = "",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 53,
                    BelgeAdi = "4.3 Bağımsızlıkla İlgili Sorunları Çözüme Kavuşturma Formu",
                    FormKodu = "KysBagimsizlikSorunlariCozumu",
                    Islem = "Sorunu ve bağımsızlığa yönelik potansiyel tehdidi açıklayınız:",
                    Tespit = "",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 54,
                    BelgeAdi = "4.3 Bağımsızlıkla İlgili Sorunları Çözüme Kavuşturma Formu",
                    FormKodu = "KysBagimsizlikSorunlariCozumu",
                    Islem = "Başvurulan kaynaklar/kişiler (ilgili materyalin kopyasını ekleyiniz):",
                    Tespit = "",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 55,
                    BelgeAdi = "4.3 Bağımsızlıkla İlgili Sorunları Çözüme Kavuşturma Formu",
                    FormKodu = "KysBagimsizlikSorunlariCozumu",
                    Islem = "Bulgular nelerdir?",
                    Tespit = "",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 56,
                    BelgeAdi = "4.3 Bağımsızlıkla İlgili Sorunları Çözüme Kavuşturma Formu",
                    FormKodu = "KysBagimsizlikSorunlariCozumu",
                    Islem = "Atılan adım veya (varsa) alınan önlem, söz konusu tehdidi nasıl ortadan kaldırdı ya da kabul edilebilir bir düzeye indirdi?",
                    Tespit = "",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },

                // 5.1 Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Ettirilmesi Politikası Beyanı
                new KysBelgeler
                {
                    Id = 57,
                    BelgeAdi = "5.1 Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Ettirilmesi Politikası Beyanı",
                    FormKodu = "KysMusteriIliskisiPolitikasi",
                    Islem = "Denetim şirketi, yeni müşteri kabul sürecinde dürüstlük, bağımsızlık, etik ilkeler, kaynak yeterliliği ve mevzuat hükümleri çerçevesinde gerekli değerlendirme ve belgelendirmeleri eksiksiz şekilde gerçekleştirmekte midir?",
                    Tespit = "Yeni müşteri kabulüne ilişkin süreçte; dürüstlük, bağımsızlık, etik ilkeler ve kaynak yeterliği değerlendirilmiş, gerekli belgelendirme ve etik mektuba işlemleri tamamlanmıştır.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 58,
                    BelgeAdi = "5.1 Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Ettirilmesi Politikası Beyanı",
                    FormKodu = "KysMusteriIliskisiPolitikasi",
                    Islem = "Denetim şirketi, yürütülen tüm denetim ve güvence hizmetleri için ilgili standartlara uygun şekilde denetim sözleşmesi hazırlamakta, güncelliliğini değerlendirmekte ve gerektiğinde revize etmekte midir?",
                    Tespit = "Denetim hizmetine ilişkin BDS 210 kapsamında sözleşme düzenlenmiş, mevcut şartlara uygunluğu değerlendirilmiş ve gerek görülerse güncellenmiştir.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 59,
                    BelgeAdi = "5.1 Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Ettirilmesi Politikası Beyanı",
                    FormKodu = "KysMusteriIliskisiPolitikasi",
                    Islem = "Denetim şirketi, mevcut müşteri ilişkilerinin ve sözleşmelerin devam edip etmeyeceğine dair etik, yasal ve kalite yönetimi açısından uygunluk değerlendirmelerini yapmakta ve olası çekilme durumlarını gerekçeleriyle birlikte belgelendirmekte midir?",
                    Tespit = "Mevcut müşteri ilişkisi ve sözleşmenin devamına yönelik etik ve mevzuata aykırı bir durum tespit edilmemiştir. Sözleşmenin sürdürülmesinde engel bulunmamaktadır.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },

                // 5.2 Müşteri Araştırma Soruları
                new KysBelgeler
                {
                    Id = 60,
                    BelgeAdi = "5.2 Müşteri Araştırma Soruları",
                    FormKodu = "KysMusteriArastirmaSorulari",
                    Islem = "Şirketinizin ana faaliyet konuları nelerdir?",
                    Tespit = "Müşterinin faaliyet alanları hakkında bilgi alınmış; sektör, iş modeli ve temel süreçler değerlendirilmiştir.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 61,
                    BelgeAdi = "5.2 Müşteri Araştırma Soruları",
                    FormKodu = "KysMusteriArastirmaSorulari",
                    Islem = "Önceki denetim/güvence hizmeti sağlayıcınız kimdi?",
                    Tespit = "Önceki denetim firması bilgisi alınmış, önceki hizmet süresi ve kapsamı kaydedilmiştir.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 62,
                    BelgeAdi = "5.2 Müşteri Araştırma Soruları",
                    FormKodu = "KysMusteriArastirmaSorulari",
                    Islem = "Denetim/güvence hizmeti sağlayıcınızı değiştirme nedeniniz nedir?",
                    Tespit = "Hizmet sağlayıcı değişikliği gereklilikleri alınmış; bağımsızlık, kalite veya mali nedenler değerlendirilmiştir.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 63,
                    BelgeAdi = "5.2 Müşteri Araştırma Soruları",
                    FormKodu = "KysMusteriArastirmaSorulari",
                    Islem = "Önceki denetçiyle iletişime geçilmesi için izninizi talep ediyoruz. Bu konuda onayınız var mı?",
                    Tespit = "Müşteriye, önceki denetçiyle iletişim kurulmasının bağımsız denetimler için zorunlu olduğu, diğer hizmetlerde de tavsiye edildiği açıklanmış, onay alınmıştır.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 64,
                    BelgeAdi = "5.2 Müşteri Araştırma Soruları",
                    FormKodu = "KysMusteriArastirmaSorulari",
                    Islem = "Bu denetim şirketini tercih etme nedeniniz nedir?",
                    Tespit = "Müşterinin firmayı tercih nedenleri (uzmanlık, referans, fiyat, kalite vs.) sorgulanmış ve not alınmıştır.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 65,
                    BelgeAdi = "5.2 Müşteri Araştırma Soruları",
                    FormKodu = "KysMusteriArastirmaSorulari",
                    Islem = "İş süreçlerinizde karşılaştığınız başlıca riskler, zorluklar veya dikkat edilmesi gereken hususlar?",
                    Tespit = "Müşteri açısından önemli görülen konu ve hassas alanlar belirlenmiş, denetim planlamasına esas teşkil edecek bilgiler toplanmıştır.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 66,
                    BelgeAdi = "5.2 Müşteri Araştırma Soruları",
                    FormKodu = "KysMusteriArastirmaSorulari",
                    Islem = "Vergi beyannameleri ve ödemeleriniz konusunda güncel ve bilgili misiniz?",
                    Tespit = "Müşteri, vergi yükümlülüklerine ilişkin genel farkındalık ve güncellik durumunu açıklamıştır. Gerekli değerlendirme yapılmıştır.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 67,
                    BelgeAdi = "5.2 Müşteri Araştırma Soruları",
                    FormKodu = "KysMusteriArastirmaSorulari",
                    Islem = "Hangi tür denetim/güvence hizmetlerine ihtiyaç duyuyorsunuz (bağımsız denetim, iç kontrol incelemesi, özel amaçlı raporlar vb.)?",
                    Tespit = "Talep edilen hizmet türleri netleştirilmiş ve planlamaya esas olacak şekilde belgelenmiştir.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 68,
                    BelgeAdi = "5.2 Müşteri Araştırma Soruları",
                    FormKodu = "KysMusteriArastirmaSorulari",
                    Islem = "Kalite yönetim sistemimiz ve denetim sürecine ilişkin yaklaşımımız hakkında görüş ve sorularınızı paylaşır mısınız?",
                    Tespit = "Denetim yaklaşımı ve kalite yönetimi hakkında müşteri bilgilendirilmiş; sorumlu denetçinin sorumlulukları açıklanmıştır.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 69,
                    BelgeAdi = "5.2 Müşteri Araştırma Soruları",
                    FormKodu = "KysMusteriArastirmaSorulari",
                    Islem = "Tesis ziyareti ve sanal belge talebiyle iç kontrol ve muhasebe sistemine ilişkin bilgi almamıza onay veriyor musunuz?",
                    Tespit = "Kayıt düzeni, muhasebe altyapısı ve iç kontrollerin değerlendirilmesi amacıyla tesis ziyareti ve belge paylaşımına onay alınmıştır. Müşteri kabul prosedürleri uygulanmıştır.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },

                // 6.1 Denetimin Yürütülmesi Politikası Beyanı
                new KysBelgeler
                {
                    Id = 70,
                    BelgeAdi = "6.1 Denetimin Yürütülmesi Politikası Beyanı",
                    FormKodu = "KysDenetiminYurutulmesiPolitikasi",
                    Islem = "Denetim çalışmaları, ilgili mesleki ve etik standartlara uygun şekilde planlanıp yürütülüyor mu?",
                    Tespit = "Denetim, geçerli standartlar doğrultusunda mesleki süphecilik ve muhakeme esas alınarak yürütülmekte olup, denetim planı ve dokümantasyonu uygun şekilde hazırlanmıştır.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 71,
                    BelgeAdi = "6.1 Denetimin Yürütülmesi Politikası Beyanı",
                    FormKodu = "KysDenetiminYurutulmesiPolitikasi",
                    Islem = "Denetim ekibi, görev için yeterli deneyime ve yetkinliğe sahip mi?",
                    Tespit = "Ekip üyelerinin yetkinlikleri değerlendirilmiş, işin niteliğine uygun uzmanlık ve deneyim seviyesine sahip kişilerle görevlendirme yapılmıştır.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 72,
                    BelgeAdi = "6.1 Denetimin Yürütülmesi Politikası Beyanı",
                    FormKodu = "KysDenetiminYurutulmesiPolitikasi",
                    Islem = "Denetim gözetimi uygun biçimde sağlanıyor ve ilerleme düzenli olarak izleniyor mu?",
                    Tespit = "İş akışı yönetim sistemi ve zaman bütçeleri aracılığıyla denetim ilerleyişi takip edilmekte, düzenli ekip toplantılarında süreç gözden geçirilmektedir.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 73,
                    BelgeAdi = "6.1 Denetimin Yürütülmesi Politikası Beyanı",
                    FormKodu = "KysDenetiminYurutulmesiPolitikasi",
                    Islem = "Tamamlanan işler, yöneticiler tarafından etkin biçimde gözden geçiriliyor mu?",
                    Tespit = "Tüm önemli konular yöneticiler tarafından kontrol edilmiş; mesleki standartlara uygunluk, yeterlilik ve doğruluk açısından gerekli incelemeler yapılmıştır.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 74,
                    BelgeAdi = "6.1 Denetimin Yürütülmesi Politikası Beyanı",
                    FormKodu = "KysDenetiminYurutulmesiPolitikasi",
                    Islem = "Denetim sırasında gerektiğinde uzman görüşüne başvuruluyor mu?",
                    Tespit = "Zor veya teknik konularda iç ya da dış uzmanlara danışılmış, iştiraşler belgelenmiş ve sonuçlar müşteri dosyalarına dâhil edilmiştir.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 75,
                    BelgeAdi = "6.1 Denetimin Yürütülmesi Politikası Beyanı",
                    FormKodu = "KysDenetiminYurutulmesiPolitikasi",
                    Islem = "Çalışma kağıtları zamanında ve güvenli şekilde hazırlanıp korunuyor mu?",
                    Tespit = "Tüm çalışma kağıtları, denetim raporunun yayımlanmasından itibaren 60 gün içinde tamamlanmış, ilgili güvenlik prosedürlerine uygun biçimde korunmaktadır.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 76,
                    BelgeAdi = "6.1 Denetimin Yürütülmesi Politikası Beyanı",
                    FormKodu = "KysDenetiminYurutulmesiPolitikasi",
                    Islem = "Görüş farklılıkları zamanında tespit edilip uygun şekilde yönetiliyor mu?",
                    Tespit = "Görüş ayrılıkları erken aşamada tespit edilmiş, çözüm süreçleri belgelenmiş ve ilgili raporların yayımlanması durdurularak uygun prosedürler izlenmiştir.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 77,
                    BelgeAdi = "6.1 Denetimin Yürütülmesi Politikası Beyanı",
                    FormKodu = "KysDenetiminYurutulmesiPolitikasi",
                    Islem = "Bu denetim için Kalite Gözden Geçirme (KGG) gerekliliği değerlendirilmiş midir?",
                    Tespit = "Denetimin KGG'ye tabi olup olmadığı değerlendirilmiş; mevzuata tabiiyet, borsada işlem görme durumu, risk düzeyi, ekip kıdemi ve geçmiş KGG sonuçları dikkate alınmıştır. Uygunluk durumuna göre KGG ataması yapılmıştır / yapılmasına gerek olmadığı sonucuna varılmıştır.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },

                // 7.1 Kaynaklar Politikası Beyanı
                new KysBelgeler
                {
                    Id = 78,
                    BelgeAdi = "7.1 Kaynaklar Politikası Beyanı",
                    FormKodu = "KysKaynaklarPolitikasi",
                    Islem = "Ekip üyeleri, denetim şirketi açısından nasıl bir değer olarak görülmektedir ve bu yaklaşım şirketin yatırım stratejisine nasıl yansımaktadır?",
                    Tespit = "Ekip üyeleri sadece bir maliyet unsuru olarak değil, aynı zamanda şirketin verimliliğini, müşteri ilişkilerini ve fikir üretimini destekleyen bir entelektüel sermaye olarak görülmektedir. Bu nedenle şirket, ekip üyelerinin eğitimi ve gelişimi için ciddi yatırımlar yapar. Bu yaklaşım, kaliteye odaklanmayı, yazılı/sözlü iletişim, detaylara dikkat, proaktiflik gibi becerileri ön planda tutmayı ve sürekli gelişimi desteklemeyi esas alır.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 79,
                    BelgeAdi = "7.1 Kaynaklar Politikası Beyanı",
                    FormKodu = "KysKaynaklarPolitikasi",
                    Islem = "Denetim şirketi insan kaynakları süreçlerini nasıl yapılandırmakta ve etik hükümlerle bu süreçleri nasıl desteklemektedir?",
                    Tespit = "İnsan kaynakları yönetimi, yeterli personel temininden performans değerlendirmeye kadar yöneticilerin sorumluluğundadır. İşe alım, terfi, ücretlendirme gibi süreçlerde etik hükümler esas alınır. Bu hükümleri ihlal eden personele danışmanlık verilir ve gerekirse disiplin cezası uygulanır. İnsan kaynakları prosedürleri; görev tanımları, referans kontrolleri, oryantasyon programları, performans gözden geçirmeleri ve sektörel ücret analizlerini kapsar.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 80,
                    BelgeAdi = "7.1 Kaynaklar Politikası Beyanı",
                    FormKodu = "KysKaynaklarPolitikasi",
                    Islem = "Denetim şirketi, ekip üyelerinin mesleki gelişimini ve yetkinlik takibini nasıl sağlar?",
                    Tespit = "Şirket, hem yöneticilerin hem de ekip üyelerinin sürekli mesleki eğitim yükümlülüklerini yerine getirmesini zorunlu kılar. Eğitim kayıtları tutulur ve yıllık gözden geçirmelerde değerlendirilir. Ayrıca iş başında eğitim, düzenli ekip toplantıları, haftalık iç eğitim oturumları ve bağımsızlık takibi yoluyla gelişim desteklenir.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 81,
                    BelgeAdi = "7.1 Kaynaklar Politikası Beyanı",
                    FormKodu = "KysKaynaklarPolitikasi",
                    Islem = "Denetimlerde görev dağılımı nasıl belirlenir ve takip edilir?",
                    Tespit = "Görevlendirme, işin karmaşıklığı ile personelin yetkinlik ve deneyim düzeyine göre yapılır. Daha az deneyimli ekiplerde yöneticiler daha yoğun destek ve gözetim sağlar. Tüm işler, iş akış sistemine kaydedilir, planlama kağıtlarına yansıtılır ve ekip toplantılarında süre ve görev takibi yapılır.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 82,
                    BelgeAdi = "7.1 Kaynaklar Politikası Beyanı",
                    FormKodu = "KysKaynaklarPolitikasi",
                    Islem = "Denetim şirketi, teknolojik kaynakların kullanımında nasıl bir güvenlik ve uygunluk politikası uygular?",
                    Tespit = "Teknolojik kaynaklar, yalnızca şirket tarafından onaylanan uygulamalar üzerinden kullanılır. Siber güvenlik, veri gizliliği ve yasal uygunluk esas alınır. Şifreli erişim, kötü amaçlı yazılımlara karşı önlem, yetkisiz yazılım yüklememe ve yasaklı sitelere erişim yasağı gibi güvenlik politikaları uygulanır. Hizmet sağlayıcıların kullandığı teknolojiler yıllık olarak değerlendirilir.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 83,
                    BelgeAdi = "7.1 Kaynaklar Politikası Beyanı",
                    FormKodu = "KysKaynaklarPolitikasi",
                    Islem = "Denetim şirketi entelektüel kaynaklarını nasıl korur ve kimlerin erişimine izin verir?",
                    Tespit = "Entelektüel kaynaklar, denetim kalitesini sağlamak ve tutarlılığı desteklemek amacıyla dikkatle hazırlanır ve gözden geçirilir. Erişim, yalnızca izinli kullanıcılarla sınırlıdır. Bu kaynakların çoğaltılması veya paylaşımı sorumlu denetçinin onayına bağlıdır. Şirket, çalışanların geliştirdiği çalışmaların telif hakkına sahiptir ve bu husus sözleşmelerde belirtilmiştir.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 84,
                    BelgeAdi = "7.1 Kaynaklar Politikası Beyanı",
                    FormKodu = "KysKaynaklarPolitikasi",
                    Islem = "Denetim şirketi, dış hizmet sağlayıcıların kullanımında hangi kriterleri dikkate alır?",
                    Tespit = "Hizmet sağlayıcılar kullanılmadan önce yazılı teklifler alınır, itibarı araştırılır, bağımsızlık riski ve veri güvenliği değerlendirilir. Gizlilik sözleşmesi gerekliliği ve felaket durumunda hizmetin sürdürülebilirliği incelenir. Onay süreci tamamlanmadan hizmet sağlayıcı kullanılmaz ve denetim şirketi kalite yönetiminden sorumluluğunu sürdürür.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },

                // 8.1 Bilgi ve İletişim Politikası Beyanı
                new KysBelgeler
                {
                    Id = 85,
                    BelgeAdi = "8.1 Bilgi ve İletişim Politikası Beyanı",
                    FormKodu = "KysBilgiVeIletisimPolitikasi",
                    Islem = "Denetim şirketi bilgi sistemlerine nasıl yatırım yapar ve bu sistemlerin güvenliğini, etkinliğini ve sürekliğini nasıl sağlar?",
                    Tespit = "Denetim şirketi, hem mevcut ihtiyaçlara cevap veren hem de gelecekteki değişimlere uyum sağlayacak bilgi sistemlerine yatırım yapmaya kararlıdır. Bu yatırımlar, liderlik yapısının onayıyla ve çalışma grubu veya proje komitesi aracılığıyla gerçekleştirilir. Bilgi sistemleri sürekli geliştirilir, güncellenir ve kullanıcı ihtiyaçlarına göre uyarlanır. Değişiklikler belgelenir; kullanıcıların geri bildirimi alınır ve sistemlerin etkinliği düzenli olarak gözden geçirilir.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 86,
                    BelgeAdi = "8.1 Bilgi ve İletişim Politikası Beyanı",
                    FormKodu = "KysBilgiVeIletisimPolitikasi",
                    Islem = "Denetim şirketi, kalite odaklı bir kurumsal kültürü nasıl destekler ve bu kültür çalışan performansına nasıl yansıtılır?",
                    Tespit = "Denetim şirketi, kaynakların paylaşımını teşvik eden, bilgi alışverişine açık, sorumluluk bilinci taşıyan bir kültürü destekler. Bu kültürel yapı, kalite yönetim sistemine katkı sağlar. Şirketin hedeflerine ve stratejilerine uygun olarak çalışanların bu kültüre olan desteği, yıllık performans değerlendirmelerinde dikkate alınır. Bu yaklaşım, hem bireysel hem de kurumsal gelişimi destekler.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 87,
                    BelgeAdi = "8.1 Bilgi ve İletişim Politikası Beyanı",
                    FormKodu = "KysBilgiVeIletisimPolitikasi",
                    Islem = "Denetim şirketi iç ve dış paydaşlarla etkili iletişimi nasıl sağlar ve iletişim araçlarını nasıl seçer?",
                    Tespit = "Denetim şirketi, açık, kısa ve bilgilendirici bir iletişim sürecini benimser. Sözlü iletişimden intranete, el kitapçıklarından sosyal medyaya kadar birçok yöntem kullanılır. Hedef kitle ve iletilen bilginin niteliği göz önünde bulundurularak en uygun iletişim yöntemi ve sıklığı belirlenir. Bazı durumlarda aynı bilgi farklı kanallar üzerinden iletilerek en geniş etkiye ulaşılır. İletişim eğitimi, gelişim planlarının parçası olarak çalışanlara sunulur.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },

                // 9.2 İzleme ve Düzeltme Süreci Politikası Beyanı
                new KysBelgeler
                {
                    Id = 88,
                    BelgeAdi = "9.2 İzleme ve Düzeltme Süreci Politikası Beyanı",
                    FormKodu = "KysIzlemeVeDuzeltmePolitikasi",
                    Islem = "Denetim şirketi, kalite yönetim sistemini izlerken hangi unsurları dikkate alır ve izleme faaliyetlerini nasıl yürütür?",
                    Tespit = "İzleme faaliyetleri, kalite risklerinin değerlendirilmesi, bu risklere yönelik tasarımlar, süreç değişiklikleri ve kalite yönetim sisteminin genel durumu dikkate alınarak planlanır. İzlemeyi yürüten kişiler yeterli zaman, yetkinlik ve kabiliyete sahip olmalıdır. Raporlar müşteriye sunulmadan önce sorumlu denetçi incelemesi yapılır. Ayrıca kültür değerlendirmesi, üç ayda bir yapılan resmi olmayan değerlendirmeler ve üç yılda bir sorumlu denetçiye özel dosya incelemeleri yürütülür. KGK gözetimi de desteklenir.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 89,
                    BelgeAdi = "9.2 İzleme ve Düzeltme Süreci Politikası Beyanı",
                    FormKodu = "KysIzlemeVeDuzeltmePolitikasi",
                    Islem = "Denetim şirketi, izleme faaliyetleri sonucunda tespit edilen eksiklikleri nasıl analiz eder ve hangi düzeltici adımları uygular?",
                    Tespit = "Denetim kalite lideri, izleme bulgularını değerlendirerek eksikliklerin kök nedenini belirler, ciddiyetini ve yaygınlığını analiz eder. Uygun düzeltici adımlar; sahiplik, zamanlama ve etkinlik kriterlerine göre planlanır ve uygulanır. Etkinlik değerlendirilir; uygun bulunmayan adımlar revize edilir. Gerekirse eylem planları oluşturulur. Tespit edilen eksikliklerin kalite, etik veya yasal gerekliliklere aykırı olması durumunda, gerekirse hukuki danışmanlık alınır ve ilgili ekiplerle bilgi paylaşılır.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 90,
                    BelgeAdi = "9.2 İzleme ve Düzeltme Süreci Politikası Beyanı",
                    FormKodu = "KysIzlemeVeDuzeltmePolitikasi",
                    Islem = "Denetim şirketi, denetimle ilgili şikâyet ve iddiaları nasıl değerlendirir ve bu süreci nasıl yönetir?",
                    Tespit = "Şikâyetler ciddiyetle ele alınır, denetimde yer almayan bir yönetici tarafından araştırılır. Ciddi görülen şikâyetler danışmana veya başka bir şirkete devredilebilir. Müşteri, süreç hakkında bilgilendirilir. Her resmi şikâyet, kalite yönetim sistemi çerçevesinde bir zayıflık açısından incelenir ve Müşteri Şikâyet Kaydı ile belge altına alınır. Gerekirse mesleki sorumluluk sigortacıları bilgilendirilir. Çalışanlar, endişelerini özgürce dile getirme hakkına sahiptir.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 91,
                    BelgeAdi = "9.2 İzleme ve Düzeltme Süreci Politikası Beyanı",
                    FormKodu = "KysIzlemeVeDuzeltmePolitikasi",
                    Islem = "Kalite yönetim sisteminin yıllık değerlendirmesi nasıl yapılır ve bu değerlendirme hangi sorumluları kapsar?",
                    Tespit = "Kalite yönetim sistemi, en geç 31 Aralık 202X'te başlayacak şekilde yıllık olarak değerlendirilir. Nihai sorumlular, sistemin kalite hedeflerine ulaşıp ulaşmadığını değerlendirerek KYS 1'e uygun sonuçlara varır. Eksiklikler varsa, ilave önlemler alınır. Ayrıca kalite yönetim sistemi için sorumlu kişiler ve denetim kalite lideri hakkında periyodik performans değerlendirmeleri yapılır. Bu değerlendirmelerde, yıllık kalite sistemi incelemeleri esas alınır.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },

                // 9.5 Müşteri Şikâyet Kaydı
                new KysBelgeler
                {
                    Id = 92,
                    BelgeAdi = "9.5 Müşteri Şikâyet Kaydı",
                    FormKodu = "KysMusteriSikayetKaydi",
                    Islem = "Şikâyetin detayları nelerdir?",
                    Tespit = "Müşteri tarafından iletilen şikâyetin içeriği, kapsamı, ilgili kişi ve olaylarla birlikte açıkça belirtilmelidir. Gerekirse tarih, belge ve yazışmalarla desteklenmelidir.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 93,
                    BelgeAdi = "9.5 Müşteri Şikâyet Kaydı",
                    FormKodu = "KysMusteriSikayetKaydi",
                    Islem = "Müşterinin endişelerinin olası sonuçları nelerdir?",
                    Tespit = "Şikâyetin denetim sürecine, raporun doğruluğuna, mesleki veya etik standartlara etkisi değerlendirilmelidir. Müşteri güveni ve yasal riskler de göz önünde bulundurulmalıdır.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 94,
                    BelgeAdi = "9.5 Müşteri Şikâyet Kaydı",
                    FormKodu = "KysMusteriSikayetKaydi",
                    Islem = "Konu hakkında hangi adımlar atıldı ve kalite konusunda nihai sorumluya iletildi mi?",
                    Tespit = "Şikâyetin alınmasını müteakip yapılan işlem adımları listelenmeli ve konu, kalite yönetim sisteminden nihai olarak sorumlu kişiye aktarılıp aktarılmadığı belirtilmelidir.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 95,
                    BelgeAdi = "9.5 Müşteri Şikâyet Kaydı",
                    FormKodu = "KysMusteriSikayetKaydi",
                    Islem = "Müşteriyle hangi çözüm üzerinde anlaşıldı veya müşteriyle nasıl bir çözüm paylaşıldı?",
                    Tespit = "Sorunun çözümüne yönelik atılan adımlar ve müşteriye ne şekilde ve ne zaman bilgi verildiği açıklanmalıdır.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 96,
                    BelgeAdi = "9.5 Müşteri Şikâyet Kaydı",
                    FormKodu = "KysMusteriSikayetKaydi",
                    Islem = "Mesleki sorumluluk sigortacısına danışılacak mı?",
                    Tespit = "Evet veya hayır şeklinde net bir cevap verilmeli; eğer danışılacaksa gerekçeleri (örneğin potansiyel mali yük, hukuki risk, itibar riski) açıkça ifade edilmelidir.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                },
                new KysBelgeler
                {
                    Id = 97,
                    BelgeAdi = "9.5 Müşteri Şikâyet Kaydı",
                    FormKodu = "KysMusteriSikayetKaydi",
                    Islem = "Kalite yönetim sisteminde sistemsel bir zayıflık tespit edildi mi?",
                    Tespit = "1. Evet veya hayır cevabı ile birlikte, varsa zayıflığın ne olduğu ve sistemsel düzeyde düzeltici ve önleyici etkili (örneğin yetersiz kontrol, belirsiz prosedürler) belirtilmelidir.",
                    DenetlenenId = null,
                    CreatedDate = createdDate
                }
            );
        }
    }
}
