import { uniqueId } from "lodash";

export interface MenuitemsType {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: string;
  children?: MenuitemsType[];
  chip?: string;
  chipColor?: string;
  variant?: string;
  external?: boolean;
  aciklama?: string;
}
import {
  IconPoint,
  IconUpload,
  IconFilters,
  IconTimeline,
  IconFolderOpen,
  IconFileDescription,
  IconFolderUp,
  IconTrendingUp,
  IconFileCheck,
  IconLayoutGridAdd,
  IconScript,
  IconUsersGroup,
  IconHierarchy,
  IconInfoCircle,
  IconFileAnalytics,
  IconUsers,
  IconHome,
  IconCalculator,
  IconRepeat,
  IconRecycle,
} from "@tabler/icons-react";

const Menuitems: MenuitemsType[] = [
  {
    id: uniqueId(),
    title: "ANASAYFA",
    icon: IconHome,
    href: "/Anasayfa",
  },
  /*{ navlabel: true, subheader: "MENÜ" },*/
  /*{
    id: uniqueId(),
    title: "KULLANICI",
    icon: IconUser,
    href: "/Kullanici",
    children: [
      {
        id: uniqueId(),
        title: "Kullanıcı İşlemleri",
        icon: IconPoint,
        href: "/Kullanici/KullaniciIslemleri",
      },
      {
        id: uniqueId(),
        title: "Kullanıcı Sözleşme Saatleri",
        icon: IconPoint,
        href: "/Kullanici/KullaniciSozlesmeSaatleri",
      },
      {
        id: uniqueId(),
        title: "Denetçi Yıllık Taahütname",
        icon: IconPoint,
        href: "/Kullanici/DenetciYillikTaahutname",
      },
      {
        id: uniqueId(),
        title: "Sürekli Eğitim Belge ve Bilgileri",
        icon: IconPoint,
        href: "/Kullanici/SurekliEgitimBelgeVeBilgileri",
      },
      {
        id: uniqueId(),
        title: "Denetçi Puantaj Belgesi",
        icon: IconPoint,
        href: "/Kullanici/DenetciPuantajBelgesi",
      },
    ],
  },*/
  {
    id: uniqueId(),
    title: "MÜŞTERİ",
    icon: IconUsers,
    href: "/Musteri",
    children: [
      {
        id: uniqueId(),
        title: "Müşteri İşlemleri",
        icon: IconPoint,
        href: "/Musteri/MusteriIslemleri",
      },
      {
        id: uniqueId(),
        title: "Şirket Yönetim Kadrosu",
        icon: IconPoint,
        href: "/",
      },
      {
        id: uniqueId(),
        title: "Şubeler",
        icon: IconPoint,
        href: "/",
      },
      {
        id: uniqueId(),
        title: "Hissedarlar",
        icon: IconPoint,
        href: "/",
      },
      {
        id: uniqueId(),
        title: "Müşteri Tanıma",
        icon: IconPoint,
        href: "/",
      },
      {
        id: uniqueId(),
        title: "İşletme Tanıma",
        icon: IconPoint,
        href: "/Musteri/IsletmeTanima",
      },
      {
        id: uniqueId(),
        title: "İşletme Faaliyet ve Çevresi Tanıma",
        icon: IconPoint,
        href: "/Musteri/IsletmeFaaliyetVeCevresiTanima",
      },
      {
        id: uniqueId(),
        title: "Teklif Hesaplama",
        icon: IconPoint,
        href: "/",
      },
      {
        id: uniqueId(),
        title: "Teklif Belgesi",
        icon: IconPoint,
        href: "/",
      },
      {
        id: uniqueId(),
        title: "Teklif Mektubu",
        icon: IconPoint,
        href: "/Musteri/TeklifMektubu",
      },
      {
        id: uniqueId(),
        title: "Kendi Yetkinliğini Değerlendirme",
        icon: IconPoint,
        href: "/Musteri/KendiYetkinliginiDegerlendirme",
      },
      {
        id: uniqueId(),
        title: "Müşteri Dürüstlüğünü Değerlendirme",
        icon: IconPoint,
        href: "/Musteri/MusteriDurustlugunuDegerlendirme",
      },
      {
        id: uniqueId(),
        title: "Müşteri Kabul İşlemi",
        icon: IconPoint,
        href: "/",
      },
      {
        id: uniqueId(),
        title: "Sözleşme Kabul Belgesi",
        icon: IconPoint,
        href: "/Musteri/SozlesmeKabul",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "SÖZLEŞME",
    icon: IconScript,
    href: "/Sozlesme",
    children: [
      {
        id: uniqueId(),
        title: "Denetim Kadrosu Atama",
        icon: IconPoint,
        href: "/Sozlesme/DenetimKadrosuAtama",
      },
      {
        id: uniqueId(),
        title: "Bağımsız Denetim Sözleşmesi",
        icon: IconPoint,
        href: "/",
      },
    ],
  },
  { id: uniqueId(), navlabel: true, subheader: "MENÜ" },
  {
    id: uniqueId(),
    title: "VERİ",
    icon: IconUpload,
    href: "/Veri",
    children: [
      {
        id: uniqueId(),
        title: "Defter Yükleme",
        icon: IconPoint,
        href: "/Veri/DefterYukleme",
      },
      {
        id: uniqueId(),
        title: "E-Defter İnceleme",
        icon: IconPoint,
        href: "/Veri/EDefterInceleme",
      },
      /*{
        id: uniqueId(),
        title: "Excel Yevmiye Yükleme",
        icon: IconPoint,
        href: "/Veri/ExcelYevmiyeYukleme",
      },*/
      {
        id: uniqueId(),
        title: "Vuk Mizan Veri Yükleme",
        icon: IconPoint,
        href: "/Veri/VukMizanVeriYukleme",
      },
      {
        id: uniqueId(),
        title: "Dönüştürülmüş Mizan Veri Yükleme",
        icon: IconPoint,
        href: "/Veri/DonusturulmusMizanVeriYukleme",
      },
      {
        id: uniqueId(),
        title: "Dönüşüm Fişleri Veri Yükleme",
        icon: IconPoint,
        href: "/Veri/DonusumFisleriVeriYukleme",
      },
      {
        id: uniqueId(),
        title: "Yabancı Para Hesap Listesi Veri Yükleme",
        icon: IconPoint,
        href: "/Veri/YabanciParaHesapListesiVeriYukleme",
      },
      {
        id: uniqueId(),
        title: "Mizanlar",
        icon: IconPoint,
        href: "/Veri/Mizanlar",
        children: [
          {
            id: uniqueId(),
            title: "E-Defter Mizan Oluşturma",
            icon: IconPoint,
            href: "/Veri/Mizanlar/EDefterMizan",
          },
          {
            id: uniqueId(),
            title: "Vuk Mizan Oluşturma",
            icon: IconPoint,
            href: "/Veri/Mizanlar/VukMizan",
          },
        ],
      },
      /*{
        id: uniqueId(),
        title: "Yevmiye İnceleme",
        icon: IconPoint,
        href: "/",
      },*/
    ],
  },
  {
    id: uniqueId(),
    title: "HESAPLAMALAR",
    icon: IconCalculator,
    href: "/Hesaplamalar",
    children: [
      {
        id: uniqueId(),
        title: "Yaşlandırma",
        icon: IconPoint,
        href: "/Hesaplamalar/Yaslandirma",
      },
      {
        id: uniqueId(),
        title: "Beklenen Kredi Zararı",
        icon: IconPoint,
        href: "/Hesaplamalar/BeklenenKrediZarari",
      },
      {
        id: uniqueId(),
        title: "Kıdem Tazminatı (Bobi)",
        icon: IconPoint,
        href: "/Hesaplamalar/KidemTazminatiBobi",
        aciklama:
          "Veri Yükleme sekmesi altında, personel verilerini sisteme girebilirsiniz. ",
      },
      {
        id: uniqueId(),
        title: "Kıdem Tazminatı (Tfrs)",
        icon: IconPoint,
        href: "/Hesaplamalar/KidemTazminatiTfrs",
      },
      {
        id: uniqueId(),
        title: "Amortisman",
        icon: IconPoint,
        href: "/Hesaplamalar/Amortisman",
        aciklama:
          "Veri Yükleme sekmesi altında, amortisman verilerini sisteme girebilirsiniz. Hesaplama sekmesi altında ise, Veri Yükleme sekmesi altında girmiş olduğunuz amortismanları standartlarına uygun olarak aylık veya günlük bazda hesaplama işlemini gerçekleştirebilirsiniz.",
      },
      {
        id: uniqueId(),
        title: "Kredi",
        icon: IconPoint,
        href: "/Hesaplamalar/Kredi",
      },
      {
        id: uniqueId(),
        title: "Çek / Senet Reeskont",
        icon: IconPoint,
        href: "/Hesaplamalar/CekSenetReeskont",
      },
      {
        id: uniqueId(),
        title: "Dava Karşılıkları",
        icon: IconPoint,
        href: "/Hesaplamalar/DavaKarsiliklari",
      },
      {
        id: uniqueId(),
        title: "Ertelenmiş Vergi Hesabı",
        icon: IconPoint,
        href: "/Hesaplamalar/ErtelenmisVergiHesabi",
      },
      {
        id: uniqueId(),
        title: "İlişkili Taraf Sınıflama",
        icon: IconPoint,
        href: "/Hesaplamalar/IliskiliTarafSiniflama",
      },
      {
        id: uniqueId(),
        title: "Vadeli Banka Mevduatı",
        icon: IconPoint,
        href: "/Hesaplamalar/VadeliBankaMevduati",
        children: [
          {
            id: uniqueId(),
            title: "Vadeli Banka Mevduatı Otomatik Sınıflama",
            icon: IconPoint,
            href: "/Hesaplamalar/VadeliBankaMevduati/VadeliBankaMevduatiOtomatikSiniflama",
          },
          {
            id: uniqueId(),
            title: "Vadeli Banka Mevduatı Manuel Sınıflama",
            icon: IconPoint,
            href: "/Hesaplamalar/VadeliBankaMevduati/VadeliBankaMevduatiManuelSiniflama",
          },
          {
            id: uniqueId(),
            title: "Vadeli Banka Mevduatı Faiz Tahakkuk",
            icon: IconPoint,
            href: "/Hesaplamalar/VadeliBankaMevduati/VadeliBankaMevduatiFaizTahakkuk",
          },
        ],
      },
      {
        id: uniqueId(),
        title: "Hareketsiz",
        icon: IconPoint,
        href: "/Hesaplamalar/Hareketsiz",
      },
      {
        id: uniqueId(),
        title: "Geçmiş Yıllar Kar Zarar Kontrolleri",
        icon: IconPoint,
        href: "/Hesaplamalar/GecmisYillarKarZararKontrolleri",
      },
      {
        id: uniqueId(),
        title: "Kur Farkı Kayıtları",
        icon: IconPoint,
        href: "/Hesaplamalar/KurFarkiKayitlari",
        children: [
          {
            id: uniqueId(),
            title: "Kur Farkı",
            icon: IconPoint,
            href: "/Hesaplamalar/KurFarkiKayitlari/KurFarki",
          },
          {
            id: uniqueId(),
            title: "Kur Farkı Kontrolleri",
            icon: IconPoint,
            href: "/Hesaplamalar/KurFarkiKayitlari/KurFarkiKontrolleri",
          },
        ],
      },
    ],
  },
  {
    id: uniqueId(),
    title: "DÖNÜŞÜM",
    icon: IconRepeat,
    href: "/Donusum",
    children: [
      {
        id: uniqueId(),
        title: "Fiş Girişi",
        icon: IconPoint,
        href: "/Donusum/FisGirisi",
      },
      {
        id: uniqueId(),
        title: "Fiş Listesi",
        icon: IconPoint,
        href: "/Donusum/FisListesi",
      },
      {
        id: uniqueId(),
        title: "Hazır Fişler",
        icon: IconPoint,
        href: "/Donusum/HazirFisler",
      },
      {
        id: uniqueId(),
        title: "Dönüşüm İşlemi",
        icon: IconPoint,
        href: "/Donusum/DonusumIslemi",
      },
    ],
  },
  { id: uniqueId(), navlabel: true, subheader: "DENETİM" },
  {
    id: uniqueId(),
    title: "PLAN VE PROGRAM",
    icon: IconTimeline,
    href: "/PlanVeProgram",
    children: [
      {
        id: uniqueId(),
        title: "Denetim Programı",
        icon: IconPoint,
        href: "/",
      },
      {
        id: uniqueId(),
        title: "Genel Bağımsız Denetim Planı",
        icon: IconPoint,
        href: "/PlanVeProgram/DenetimPlani",
      },
      {
        id: uniqueId(),
        title:
          "Denetlenen İşletmenin Tabi Olduğu Mevzuata İlişkin Değerlendirme",
        icon: IconPoint,
        href: "/PlanVeProgram/DenetlenenIsletmeninTabiOlduguMevzuataIliskinDegerlendirme",
      },
      {
        id: uniqueId(),
        title: "İşletmeye İlişkin İç Kontrol Sistemi Özet Değerlendirme",
        icon: IconPoint,
        href: "/PlanVeProgram/IsletmeyeIliskinIcKontrolSistemiOzetDegerlendirme",
      },
      {
        id: uniqueId(),
        title: "İşletme Varlıklarının Korunmasına İlişkin Değerlendirme",
        icon: IconPoint,
        href: "/PlanVeProgram/IsletmeVarliklarininKorunmasinaIliskinDegerlendirme",
      },
      {
        id: uniqueId(),
        title: "Denetim Risk Değerlendirme",
        icon: IconPoint,
        href: "/PlanVeProgram/DenetimRiskDegerlendirme",
      },
      {
        id: uniqueId(),
        title: "Denetim Strateji Kılavuzu",
        icon: IconPoint,
        href: "/PlanVeProgram/DenetimStratejiKilavuzu",
      },
      {
        id: uniqueId(),
        title: "Hile Usulsüzlük ve Risk Faktörleri Değerlendirme",
        icon: IconPoint,
        href: "/PlanVeProgram/HileUsulsuzlukDegerlendirme",
      },
      {
        id: uniqueId(),
        title: "Denetim Takvimi",
        icon: IconPoint,
        href: "/PlanVeProgram/DenetimTakvimi",
      },
      {
        id: uniqueId(),
        title: "Denetim Zamanı Bildirme",
        icon: IconPoint,
        href: "/PlanVeProgram/DenetimZamaniBildirme",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "DENETİM KANITLARI",
    icon: IconFolderOpen,
    href: "/DenetimKanitlari",
    children: [
      {
        id: uniqueId(),
        title: "Mizan Kontrol",
        icon: IconPoint,
        href: "/DenetimKanitlari/MizanKontrol",
        children: [
          {
            id: uniqueId(),
            title: "Dönüşüm Mizan Kontrol",
            icon: IconPoint,
            href: "/DenetimKanitlari/MizanKontrol/DonusumMizanKontrol",
          },
        ],
      },
      {
        id: uniqueId(),
        title: "Finansal Tablolar",
        icon: IconPoint,
        href: "/DenetimKanitlari/FinansalTablolar",
        children: [
          {
            id: uniqueId(),
            title: "Finansal Durum Tablosu",
            icon: IconPoint,
            href: "/DenetimKanitlari/FinansalTablolar/FinansalDurumTablosu",
          },
          {
            id: uniqueId(),
            title: "Kar / Zarar Tablosu",
            icon: IconPoint,
            href: "/DenetimKanitlari/FinansalTablolar/KarZararTablosu",
          },
          {
            id: uniqueId(),
            title: "Nakit Akış Tablosu",
            icon: IconPoint,
            href: "/DenetimKanitlari/FinansalTablolar/NakitAkisTablosu",
          },
          {
            id: uniqueId(),
            title: "Özkaynak Değişim Tablosu",
            icon: IconPoint,
            href: "/DenetimKanitlari/FinansalTablolar/OzkaynakDegisimTablosu",
          },
        ],
      },
      {
        id: uniqueId(),
        title: "İşletmenin Sürekliliği ve Analitik İnceleme",
        icon: IconPoint,
        href: "/DenetimKanitlari/IsletmeninSurekliligiVeAnalitikInceleme",
        children: [
          {
            id: uniqueId(),
            title: "Önemli Süreçlerin İzlenmesi ve Risk Belirleme",
            icon: IconPoint,
            href: "/DenetimKanitlari/IsletmeninSurekliligiVeAnalitikInceleme/OnemliSureclerinIzlenmesiVeRiskBelirleme",
          },
          {
            id: uniqueId(),
            title: "Karşılaştırmalı Analiz",
            icon: IconPoint,
            href: "/DenetimKanitlari/IsletmeninSurekliligiVeAnalitikInceleme/KarsilastirmaliAnaliz",
          },
          {
            id: uniqueId(),
            title: "Dikey Analiz",
            icon: IconPoint,
            href: "/DenetimKanitlari/IsletmeninSurekliligiVeAnalitikInceleme/DikeyAnaliz",
          },
          {
            id: uniqueId(),
            title: "Kullanılan Analitik Tekniklere İlişkin Belgeler",
            icon: IconPoint,
            href: "/DenetimKanitlari/IsletmeninSurekliligiVeAnalitikInceleme/KullanilanAnalitikTekniklereIliskinBelgeler",
          },
          {
            id: uniqueId(),
            title: "İşletmenin Sürekliliğine İlişkin Değerlendirme",
            icon: IconPoint,
            href: "/DenetimKanitlari/IsletmeninSurekliligiVeAnalitikInceleme/IsletmeninSurekliligineIliskinDegerlendirme",
          },
        ],
      },
      {
        id: uniqueId(),
        title: "Uzman Yeterliliği Değerlendirme Belgesi",
        icon: IconPoint,
        href: "/DenetimKanitlari/UzmanYeterliligiDegerlendirme",
      },
      {
        id: uniqueId(),
        title: "Bilanço Tarihinden Sonra Ortaya Çıkan Olayları Değerlendirme",
        icon: IconPoint,
        href: "/DenetimKanitlari/BilancoTarihindenSonraOrtayaCikanOlaylariDegerlendirme",
      },
      {
        id: uniqueId(),
        title: "Diğer Kanıtlar",
        icon: IconPoint,
        href: "/DenetimKanitlari/DigerKanitlar",
        children: [
          {
            id: uniqueId(),
            title: "Müşteri İşletme Yönetimi İle Yapılan Görüşme",
            icon: IconPoint,
            href: "/DenetimKanitlari/DigerKanitlar/MusteriIsletmeYonetimiIleYapilanGorusme",
          },
          {
            id: uniqueId(),
            title: "Müşteri İşletme Personeli İle Yapılan Görüşme",
            icon: IconPoint,
            href: "/DenetimKanitlari/DigerKanitlar/MusteriIsletmePersoneliIleYapilanGorusme",
          },
          {
            id: uniqueId(),
            title: "Gerçeğe Uygun Değer Hesaplamaları Değerlendirme",
            icon: IconPoint,
            href: "/DenetimKanitlari/DigerKanitlar/GercegeUygunDegerHesaplamalariDegerlendirme",
          },
          {
            id: uniqueId(),
            title: "Kullanılan Tahminlere İlişkin Değerlendirme",
            icon: IconPoint,
            href: "/DenetimKanitlari/DigerKanitlar/KullanilanTahminlereIliskinDegerlendirme",
          },
          {
            id: uniqueId(),
            title: "Denetim Çalışmalarının Sınırlandırılmasını Değerlendirme",
            icon: IconPoint,
            href: "/DenetimKanitlari/DigerKanitlar/DenetimCalismalarininSinirlandirilmasiniDegerlendirme",
          },
          {
            id: uniqueId(),
            title: "Yevmiye Kayıtları Kontrol",
            icon: IconPoint,
            href: "/DenetimKanitlari/DigerKanitlar/YevmiyeKayitlariKontrol",
          },
          {
            id: uniqueId(),
            title: "Risklere Karşı Uygulanan Denetim Prosedürleri",
            icon: IconPoint,
            href: "/DenetimKanitlari/DigerKanitlar/RisklereKarsiUygulananDenetimProsedurleri",
          },
          {
            id: uniqueId(),
            title: "Muhasebe Hataları ve Hile Kanıtları Değerlendirme",
            icon: IconPoint,
            href: "/DenetimKanitlari/DigerKanitlar/MuhasebeHatalariVeHileKanitlariDegerlendirme",
          },
          {
            id: uniqueId(),
            title: "Denetim Kontrol Testleri",
            icon: IconPoint,
            href: "/DenetimKanitlari/DigerKanitlar/DenetimKontrolTestleri",
          },
          {
            id: uniqueId(),
            title: "Yönetim Kurulu Faaliyet Raporu Değerlendirme",
            icon: IconPoint,
            href: "/DenetimKanitlari/DigerKanitlar/YonetimKuruluFaaliyetRaporuDegerlendirme",
          },
          {
            id: uniqueId(),
            title: "Satış Tahsilat Kontrol",
            icon: IconPoint,
            href: "/DenetimKanitlari/DigerKanitlar/SatisTahsilatKontrol",
          },
          {
            id: uniqueId(),
            title: "Satın Alma Ödeme Kontrol",
            icon: IconPoint,
            href: "/DenetimKanitlari/DigerKanitlar/SatinAlmaOdemeKontrol",
          },
          {
            id: uniqueId(),
            title: "Uygulanan Muhasebe Politikalarının Tespiti",
            icon: IconPoint,
            href: "/DenetimKanitlari/DigerKanitlar/UygulananMuhasebePolitikalarininTespiti",
          },
          {
            id: uniqueId(),
            title: "İhmal Edilen Düzeltme",
            icon: IconPoint,
            href: "/DenetimKanitlari/DigerKanitlar/IhmalEdilenDuzeltme",
          },
          {
            id: uniqueId(),
            title: "Denetim Kanıtları Değerlendirme",
            icon: IconPoint,
            href: "/DenetimKanitlari/DigerKanitlar/DenetimKanitlariDegerlendirme",
          },
          {
            id: uniqueId(),
            title: "Tespit Edlien Hususların Yönetim Bildirimi",
            icon: IconPoint,
            href: "/DenetimKanitlari/DigerKanitlar/TespitEdilenHususlarinYonetimeBildirimi",
          },
          {
            id: uniqueId(),
            title: "Denetim Satratejisi Belirleme",
            icon: IconPoint,
            href: "/DenetimKanitlari/DigerKanitlar/DenetimStratejisiBelirleme",
          },
          {
            id: uniqueId(),
            title: "Habersiz İşletme Ziyareti",
            icon: IconPoint,
            href: "/DenetimKanitlari/DigerKanitlar/HabersizIsletmeZiyareti",
          },
          {
            id: uniqueId(),
            title: "Transfer Fiyatlaması ve Örtülü Kazanç Kontrol",
            icon: IconPoint,
            href: "/DenetimKanitlari/DigerKanitlar/TransferFiyatlamasiOrtuluKazanc",
          },
        ],
      },
      {
        id: uniqueId(),
        title: "Maddi Doğrulama Prosedürleri",
        icon: IconPoint,
        href: "/DenetimKanitlari/MaddiDogrulamaProsedurleri",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "GENEL KURUL",
    icon: IconUsersGroup,
    href: "/GenelKurul",
    children: [
      {
        id: uniqueId(),
        title: "Müşteri Genel Kurul Toplantısı",
        icon: IconPoint,
        href: "/",
      },
      {
        id: uniqueId(),
        title: "Denetim Çalışması İzleme",
        icon: IconPoint,
        href: "/GenelKurul/DenetimCalimasiIzleme",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "MÜŞTERİ BELGELERİ",
    icon: IconFileDescription,
    href: "/",
  },
  {
    id: uniqueId(),
    title: "KYS",
    icon: IconFileCheck,
    href: "/Kys",
    children: [
      {
        id: uniqueId(),
        title: "KYS-1",
        icon: IconPoint,
        href: "/Kys/1",
        children: [
          {
            id: uniqueId(),
            title: "Risk Değerlendirme Süreci",
            icon: IconPoint,
            href: "/Kys/1/RiskDegerlendirmeSureci",
            children: [
              {
                id: uniqueId(),
                title: "Risk Belirleme",
                icon: IconPoint,
                href: "/Kys/1/RiskDegerlendirmeSureci/RiskBelirleme",
              },
              {
                id: uniqueId(),
                title: "Riske Karşılık Verme",
                icon: IconPoint,
                href: "/Kys/1/RiskDegerlendirmeSureci/RiskeKarsilikVerme",
              },
            ],
          },

          {
            id: uniqueId(),
            title: "Üst Yönetim ve Liderlik Yapısı",
            icon: IconPoint,
            href: "/Kys/1/UstYonetimVeLiderlikYapisi",
          },
          {
            id: uniqueId(),
            title: "Etik Hükümler",
            icon: IconPoint,
            href: "/Kys/1/EtikHukumler",
          },
          {
            id: uniqueId(),
            title:
              "Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Ettirilmesi",
            icon: IconPoint,
            href: "/Kys/1/MusteriIliskileriVeSozlesmeKabulu",
          },
          {
            id: uniqueId(),
            title: "Denetimin Yürütülmesi",
            icon: IconPoint,
            href: "/Kys/1/DenetiminYurutulmesi",
          },
          {
            id: uniqueId(),
            title: "Kaynaklar",
            icon: IconPoint,
            href: "/Kys/1/Kaynaklar",
            children: [
              {
                id: uniqueId(),
                title: "İnsan Kaynakları",
                icon: IconPoint,
                href: "/Kys/1/Kaynaklar/InsanKaynaklari",
              },
              {
                id: uniqueId(),
                title:
                  "Teknolojik, Entelektüel Kaynaklar ve Hizmet Sağlayacılar",
                icon: IconPoint,
                href: "/Kys/1/Kaynaklar/HizmetSaglayicilar",
              },
            ],
          },
          {
            id: uniqueId(),
            title: "Bilgi ve İletişim",
            icon: IconPoint,
            href: "/Kys/1/BilgiVeIletisim",
          },
          {
            id: uniqueId(),
            title: "İzleme ve Düzeltme",
            icon: IconPoint,
            href: "/Kys/1/IzlemeVeDuzeltme",
          },
        ],
      },
      {
        id: uniqueId(),
        title: "KYS-2",
        icon: IconPoint,
        href: "/Kys/2",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "DENETİM RAPORU",
    icon: IconFileAnalytics,
    href: "/",
    children: [
      {
        id: uniqueId(),
        title: "Dipnot / Görüş Düzenle",
        icon: IconPoint,
        href: "/",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "DENETİM DOSYA",
    icon: IconFolderUp,
    href: "/",
    children: [
      {
        id: uniqueId(),
        title: "Bağımsız Denetim Metodolojisi",
        icon: IconPoint,
        href: "/",
      },
      {
        id: uniqueId(),
        title: "Denetim Dosyası Yazdır",
        icon: IconPoint,
        href: "/",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "DİĞER İŞLEMLER",
    icon: IconHierarchy,
    href: "/",
    children: [
      {
        id: uniqueId(),
        title: "Arşiv",
        icon: IconPoint,
        href: "/",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "ENFLASYON",
    icon: IconTrendingUp,
    href: "/",
    children: [
      {
        id: uniqueId(),
        title: "Düzeltme Katsayıları",
        icon: IconPoint,
        href: "/",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "KONSOLİDASYON",
    icon: IconLayoutGridAdd,
    href: "/",
    children: [
      {
        id: uniqueId(),
        title: "Konsolide Tanımlama",
        icon: IconPoint,
        href: "/",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "BDDK",
    icon: IconFilters,
    href: "/",
    children: [
      {
        id: uniqueId(),
        title: "İşletmenin Sürekliliğine İlişkin Değerlendirme - BDDK Analizi",
        icon: IconPoint,
        href: "/",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "SÜRDÜRÜLEBİLİRLİK",
    icon: IconRecycle,
    href: "/",
    children: [
      {
        id: uniqueId(),
        title: "Sürdürülebilirlik",
        icon: IconPoint,
        href: "/",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "KULLANIM KILAVUZU",
    icon: IconInfoCircle,
    href: "/",
  },
];

export default Menuitems;
