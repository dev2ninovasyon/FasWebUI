using FasBackend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;

namespace FasBackend.Data.Configurations
{
    public class KysRiskMatrisiConfiguration : IEntityTypeConfiguration<KysRiskMatrisi>
    {
        public void Configure(EntityTypeBuilder<KysRiskMatrisi> builder)
        {
            builder.HasKey(x => x.Id);
            
            builder.HasIndex(x => new { x.DenetlenenId, x.Yil, x.KategoriKodu });

            // Seed Data - Standart Risk Matrisleri
            var createdDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            
            // 1. ÜST YÖNETİM VE LİDERLİK YAPISI Risk Matrisi
            var ustYonetimMatris = @"{
  ""rows"": [
    {
      ""objective"": {
        ""letter"": ""a"",
        ""title"": ""Denetim şirketi ve personeli;"",
        ""items"": [
          ""(i) Kalite denetimlerinin tutarlı bir şekilde yürüdürek kamu yararına hizmet etme konusunda denetim şirketinin rolü,"",
          ""(ii) Mesleki etik, değer ve tutumların önemi,"",
          ""(iii) Kalite yönetim sistemi kapsamında gerçekleştirmeleri ve işlemlerinde tüm personelin kaliteye ilişkin sorumluluğu ve personelden beklenen davranışlar ve"",
          ""(iv) Denetim şirketinin finansal ve operasyonel öncelikleri dâhil olmak üzere, şirketin stratejik karar ve eylemlerinde kalitenin önemi.""
        ]
      },
      ""risks"": [
        { ""text"": ""Kaliteye ilişkin sorumluluklar belirlendirilir ve/veya sorumluluklar yetersince güncellenmediği ve iletilmediği için personel tarafından yeterince bilinmemektedir."" },
        { ""text"": ""Şirketin liderlik yapısı, temel stratejik karar ve eylemlerde de kalitenin öncelik verilmemektedir."" },
        { ""text"": ""Liderlik yapısı ve personel, diğer hususları (örneğin finansal ve operasyonel performans), etik, mesleki standartlar, değerler ve tutumların önünde tutmaktadır."" },
        { ""text"": ""Liderlik yapısı ve personel, denetim şirketinin kaliteli denetimlerin tutarlı bir şekilde yürüttürerek kamu yararına hizmet etme konusundaki rolünü açıkça ele almak veya güçlendirmek için puan kartları ve kalite kıstasları kullanmamaktadır."" },
        { ""text"": ""Performans değerlendirmede sürecinde kalite kıstaslarına uygun ağırlık verilmemektedir."" },
        { ""text"": ""Kalite yönetim sistemi için kaynak tahsisine öncelik verilmemektedir."" },
        { ""text"": ""Kalite yönetimine ilişkin sorumluluklar uygun lidere/liderlere veya personele dağılmamıştır."" },
        { ""text"": ""Denetim şirketinin, finansal ve operasyonel önceliklere odaklanan ve kaliteye bağlılık gösteren davranışlardan caydırıcı nitelikte olabilecek teşvikleri bulunmaktadır."" },
        { ""text"": ""[Varsa ilave riskleri ekleyin]"" }
      ],
      ""actions"": [
        { ""text"": ""3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı"", ""link"": ""/Kys/1/UstYonetimVeLiderlikYapisi/PolitikaBeyani"" },
        { ""text"": ""3.2 Sorumlulukların Verilmesi"" },
        { ""text"": ""3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı"", ""link"": ""/Kys/1/UstYonetimVeLiderlikYapisi/PolitikaBeyani"" },
        { ""text"": ""3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı"", ""link"": ""/Kys/1/UstYonetimVeLiderlikYapisi/PolitikaBeyani"" },
        { ""text"": ""3.2 Sorumlulukların Verilmesi"" },
        { ""text"": ""7.5 Profesyonel Çalışanların Performansının Değerlendirilmesi"" },
        { ""text"": ""3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı"", ""link"": ""/Kys/1/UstYonetimVeLiderlikYapisi/PolitikaBeyani"" },
        { ""text"": ""1.2 Kalite Yönetim Sistemi 'Esas' Belgesi"" },
        { ""text"": ""3.2 Sorumlulukların Verilmesi"" },
        { ""text"": ""3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı"", ""link"": ""/Kys/1/UstYonetimVeLiderlikYapisi/PolitikaBeyani"" }
      ]
    },
    {
      ""objective"": {
        ""letter"": ""b"",
        ""title"": ""Liderlik yapısı kaliteden sorumludur ve kalite konusunda hesap verebilirdir.""
      },
      ""risks"": [
        { ""text"": ""Şirketin liderlik yapısı, zamanında düzeltici adımları vurgulayarak kalite konusunda bir şekilde sorumluluk almamakta ve hesap verme yükümlüğü altına girmemektedir."" },
        { ""text"": ""Kalite yönetim sistemi, liderliğin kaliteye ulaşmasını değerlendirmek ve yönetmek için bilgi toplayacak ve saklayacak şekilde tasarlanmamıştır."" },
        { ""text"": ""[Varsa ilave riskleri ekleyin]"" }
      ],
      ""actions"": [
        { ""text"": ""3.2 Sorumlulukların Verilmesi"" },
        { ""text"": ""9.2 İzleme ve Düzeltme Süreci Politikası Beyanı"" },
        { ""text"": ""9.2 İzleme ve Düzeltme Süreci Politikası Beyanı"" },
        { ""text"": ""1.1 Belgelendirme Politikası Beyanı"" }
      ]
    },
    {
      ""objective"": {
        ""letter"": ""c"",
        ""title"": ""Liderlik yapısı, eylem ve davranışlarıyla kaliteye olan bağlılığını göstermektedir.""
      },
      ""risks"": [
        { ""text"": ""Şirketin liderlik yapısı, şirket genelinde iletişim kurmak suretiyle eylem ve davranışlarıyla kaliteyi tutarlı bir bağlılık göstermemektedir."" },
        { ""text"": ""Sorumlu denetçiler, kaliteyi gözden geçiren kişiler, belli bir konunun uzmanları ve şirketin kalite yönetim sistemi için sorumluluk verilerin dâhil temel liderlik görevleri için performans değerlendirmeleri zamanında yapılmamaktadır."" },
        { ""text"": ""[Varsa ilave riskleri ekleyin]"" }
      ],
      ""actions"": [
        { ""text"": ""9.2 İzleme ve Düzeltme Süreci Politikası Beyanı"" },
        { ""text"": ""3.2 Sorumlulukların Verilmesi"" },
        { ""text"": ""7.5 Profesyonel Çalışanların Performansının Değerlendirilmesi"" },
        { ""text"": ""7.6 İdari Çalışanların Performansının Gözden Geçirilmesi"" }
      ]
    },
    {
      ""objective"": {
        ""letter"": ""d"",
        ""title"": ""Organizasyon yapısı ile görev, sorumluluk ve yetkilerin tahsisi, denetim şirketinin kalite yönetim sisteminin tasarımı, uygulanması ve işleyişinin sağlanması açısından uygundur.""
      },
      ""risks"": [
        { ""text"": ""Organizasyon yapısı ile görev, sorumluluk ve yetkilerin tahsisi açık değildir ve şirket personeli tarafından anlaşılmamıştır."" },
        { ""text"": ""Organizasyon yapısı ile görev, sorumluluk ve yetkilerin tahsisi denetim şirketinin kalite yönetim sistemi tasarımı, uygulanması ve işleyişinin sağlanması açısından uygun değildir."" },
        { ""text"": ""[Varsa ilave riskleri ekleyin]"" }
      ],
      ""actions"": [
        { ""text"": ""1.2 Kalite Yönetim Sistemi 'Esas' Belgesi"" },
        { ""text"": ""1.3 Denetim Şirketinin Yapısı"" },
        { ""text"": ""3.2 Sorumlulukların Verilmesi"" }
      ]
    },
    {
      ""objective"": {
        ""letter"": ""e"",
        ""title"": ""Finansal kaynaklar dâhil olmak üzere, ihtiyaç duyulan kaynaklar planlanan ve dağıtım veya tahsisi yapılmıştır.""
      },
      ""risks"": [
        { ""text"": ""Şirketin kaliteye bağlılığın desteklemek için yeterli kaynak temin ederememektedir."" },
        { ""text"": ""Finansal kaynaklar dâhil olmak üzere dağıtım ve tahsisi etkileliğilecek nitelikteki kaynak ihtiyaçları yeterince planlanamamaktadır."" },
        { ""text"": ""[Varsa ilave riskleri ekleyin]"" }
      ],
      ""actions"": [
        { ""text"": ""3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı"", ""link"": ""/Kys/1/UstYonetimVeLiderlikYapisi/PolitikaBeyani"" },
        { ""text"": ""3.2 Sorumlulukların Verilmesi"" },
        { ""text"": ""3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı"", ""link"": ""/Kys/1/UstYonetimVeLiderlikYapisi/PolitikaBeyani"" },
        { ""text"": ""3.2 Sorumlulukların Verilmesi"" }
      ]
    }
  ]
}";

            // 2. ETİK HÜKÜMLER Risk Matrisi
            var etikHukumlerMatris = @"{
  ""rows"": [
    {
      ""objective"": {
        ""letter"": ""a"",
        ""title"": ""Denetim şirketi ve personeli;"",
        ""items"": [
          ""(i) Denetim şirketinin ve yürüttüler denetimlerin tabi olduğu etik hükümlere vâkıftır ve"",
          ""(ii) Denetim şirketinin ve yürütülen denetimlerin tabi olduğu etik hükümlere ilişkin sorumluluklarını yerine getirmektedir.""
        ]
      },
      ""risks"": [
        { ""text"": ""Etik hükümler açık bir şekilde belgelendirilemekte ve konuya ilgili olarak şirket içinde iletişim kurulmamaktadır."" },
        { ""text"": ""Etik hükümler personel tarafından iyi anlaşılmamﮑﮧﮦﮦﮧr."" },
        { ""text"": ""Personel/şirketin ilgili etik hükümlere ilişkin bilgileri güncel tutulmamaktadır."" },
        { ""text"": ""[Varsa ilave riskleri ekleyin]"" }
      ],
      ""actions"": [
        { ""text"": ""4.1 Etik Hükümler Politikası Beyanı"" },
        { ""text"": ""4.1 Etik Hükümler Politikası Beyanı"" },
        { ""text"": ""4.2 Yıllık Bağımsızlık Taahhüdü"" },
        { ""text"": ""Yeni değişikliklerin ortaya çıktığı durumlarda da dâhil olmak üzere tüm çalışanlara düzenli eğitim verilir."" },
        { ""text"": ""4.2 Yıllık Bağımsızlık Taahhüdü"" },
        { ""text"": ""4.3 Bağımsızlıkla İlgili Sorunları Çözüme Kavuşturma Formu"" },
        { ""text"": ""9.5 Müşteri Şikâyet Kaydı"" },
        { ""text"": ""4.2 Yıllık Bağımsızlık Taahhüdü"" },
        { ""text"": ""7.7 Eğitim ve Gelişim Kayıtları"" }
      ]
    },
    {
      ""objective"": {
        ""letter"": ""b"",
        ""title"": ""Denetim ağı, denetim ağına dâhil şirketler, hizmet sağlayıcılar, denetim ağındaki kişiler veya denetim ağına dâhil şirketlerdeki kişiler dâhil olmak üzere, denetim şirketinin ve yürütülen denetimlerin tabi olduğu etik hükümlere tâbi olan diğerler;"",
        ""items"": [
          ""(i) Kendileri için geçerli olan etik hükümlere vâkıftır ve"",
          ""(ii) Kendileri için geçerli olan etik hükümlere ilişkin sorumluluklarını yerine getirmektedir.""
        ]
      },
      ""risks"": [
        { ""text"": ""Etik hükümler, diğer önemli taraflarca iyi anlaşılmamıştır."" },
        { ""text"": ""Diğer önemli taraflar, etik hükümlere ilişkin sorumluluklarını yerine getirmemektedir."" },
        { ""text"": ""[Varsa ilave riskleri ekleyin]"" }
      ],
      ""actions"": [
        { ""text"": ""5.2 Müşteri Araştırma Soruları"" },
        { ""text"": ""5.4 Etik Mektubu"" },
        { ""text"": ""7.9 Yeni Hizmet Sağlayıcı Talep Formu"" },
        { ""text"": ""6.3 Uzman Çalışmalarının Kullanılması"" },
        { ""text"": ""6.4 Dış Uzmanların Kullanılmasına İlişkin Kontrol Listesi"" },
        { ""text"": ""7.9 Yeni Hizmet Sağlayıcı Talep Formu"" }
      ]
    }
  ]
}";

            builder.HasData(
                new KysRiskMatrisi
                {
                    Id = 1,
                    DenetciId = null,
                    DenetlenenId = null,
                    Yil = null,
                    KategoriKodu = "UstYonetim",
                    Baslik = "Üst Yönetim ve Liderlik Yapısı Risk Matrisi",
                    MatrisJson = ustYonetimMatris,
                    StandartMi = true,
                    CreatedDate = createdDate
                },
                new KysRiskMatrisi
                {
                    Id = 2,
                    DenetciId = null,
                    DenetlenenId = null,
                    Yil = null,
                    KategoriKodu = "EtikHukumler",
                    Baslik = "Etik Hükümler Risk Matrisi",
                    MatrisJson = etikHukumlerMatris,
                    StandartMi = true,
                    CreatedDate = createdDate
                }
            );
        }
    }
}
