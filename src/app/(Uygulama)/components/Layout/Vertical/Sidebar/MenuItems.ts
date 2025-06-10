import { uniqueId } from "lodash";

export interface MenuitemsType {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  parentTitle?: string;
  icon?: any;
  customIcon?: any;
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

export function createMenuItems(denetimTuru: string): MenuitemsType[] {
  return [
    {
      id: uniqueId(),
      title: "ANASAYFA",
      icon: IconHome,
      href: "/Anasayfa",
    },
    {
      id: uniqueId(),
      title: "MÜŞTERİ",
      icon: IconUsers,
      href: "/Musteri",
      children: [
        {
          id: uniqueId(),
          title: "Müşteri İşlemleri",
          customIcon: "public/images/svgs/musteri/musteri-islemleri.svg",
          icon: IconPoint,
          href: "/Musteri/MusteriIslemleri",
        },
        {
          id: uniqueId(),
          title: "Şirket Yönetim Kadrosu",
          customIcon: "public/images/svgs/musteri/sirket-yonetim-kadrosu.svg",
          icon: IconPoint,
          href: "/Musteri/SirketYonetimKadrosu",
        },
        {
          id: uniqueId(),
          title: "Şubeler",
          customIcon: "public/images/svgs/musteri/subeler.svg",
          icon: IconPoint,
          href: "/Musteri/Subeler",
        },
        {
          id: uniqueId(),
          title: "Hissedarlar",
          customIcon: "public/images/svgs/musteri/hissedarlar.svg",
          icon: IconPoint,
          href: "/Musteri/Hissedarlar",
        },
        {
          id: uniqueId(),
          title: "İlişkili Taraflar",
          customIcon: "public/images/svgs/musteri/iliskili-taraflar.svg",
          icon: IconPoint,
          href: "/Musteri/IliskiliTaraflar",
        },
        {
          id: uniqueId(),
          title: "Müşteri Tanıma",
          customIcon: "public/images/svgs/musteri/musteri-tanima.svg",
          icon: IconPoint,
          href: "/Musteri/MusteriTanima",
        },
        {
          id: uniqueId(),
          title: "İşletme Tanıma",
          customIcon: "public/images/svgs/musteri/isletme-tanima.svg",
          icon: IconPoint,
          href: "/Musteri/IsletmeTanima",
        },
        {
          id: uniqueId(),
          title: "İşletme Faaliyet ve Çevresi Tanıma",
          customIcon:
            "public/images/svgs/musteri/isletme-faaliyet-ve-cevresi-tanima.svg",
          icon: IconPoint,
          href: "/Musteri/IsletmeFaaliyetVeCevresiTanima",
        },
        {
          id: uniqueId(),
          title: "Teklif Hesaplama",
          customIcon: "public/images/svgs/musteri/teklif-hesaplama.svg",
          icon: IconPoint,
          href: "/Musteri/TeklifHesaplama",
        },
        {
          id: uniqueId(),
          title: "Teklif Belgesi",
          customIcon: "public/images/svgs/musteri/teklif-belgesi.svg",
          icon: IconPoint,
          href: "/Musteri/TeklifBelgesi",
        },
        {
          id: uniqueId(),
          title: "Teklif Mektubu",
          customIcon: "public/images/svgs/musteri/teklif-mektubu.svg",
          icon: IconPoint,
          href: "/Musteri/TeklifMektubu",
        },
        {
          id: uniqueId(),
          title: "Kendi Yetkinliğini Değerlendirme",
          customIcon:
            "public/images/svgs/musteri/kendi-yetkinligini-degerlendirme.svg",
          icon: IconPoint,
          href: "/Musteri/KendiYetkinliginiDegerlendirme",
        },
        {
          id: uniqueId(),
          title: "Müşteri Dürüstlüğünü Değerlendirme",
          customIcon:
            "public/images/svgs/musteri/musteri-durustlugunu-degerlendirme.svg",
          icon: IconPoint,
          href: "/Musteri/MusteriDurustlugunuDegerlendirme",
        },
        {
          id: uniqueId(),
          title: "Müşteri Kabul İşlemi",
          customIcon: "public/images/svgs/musteri/musteri-kabul.svg",
          icon: IconPoint,
          href: "/Musteri/MusteriKabulIslemi",
        },
        {
          id: uniqueId(),
          title: "Sözleşme Kabul Belgesi",
          customIcon: "public/images/svgs/musteri/sozlesme-kabul.svg",
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
          href: "/Sozlesme/BagimsizDenetimSozlesmesi",
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
          title: "Defter / K. V. Beyannamesi Yükleme",
          customIcon:
            "public/images/svgs/veri/defter-k-v-beyannamesi-yukleme.svg",
          icon: IconPoint,
          href: "/Veri/DefterKVBeyannamesiYukleme",
        },
        {
          id: uniqueId(),
          title: "Vuk Mizan Veri Yükleme",
          customIcon: "public/images/svgs/veri/vuk-mizan-veri-yukleme.svg",
          icon: IconPoint,
          href: "/Veri/VukMizanVeriYukleme",
        },
        {
          id: uniqueId(),
          title: "Dönüştürülmüş Mizan Veri Yükleme",
          customIcon:
            "public/images/svgs/veri/donusturulmus-mizan-veri-yukleme.svg",
          icon: IconPoint,
          href: "/Veri/DonusturulmusMizanVeriYukleme",
        },
        {
          id: uniqueId(),
          title: "Dönüşüm Fişleri Veri Yükleme",
          customIcon:
            "public/images/svgs/veri/donusum-fisleri-veri-yukleme.svg",
          icon: IconPoint,
          href: "/Veri/DonusumFisleriVeriYukleme",
        },
        /*{
          id: uniqueId(),
          title: "Yabancı Para Hesap Listesi Veri Yükleme",
          icon: IconPoint,
          href: "/Veri/YabanciParaHesapListesiVeriYukleme",
        },*/
        {
          id: uniqueId(),
          title: "Mizanlar",
          customIcon: "public/images/svgs/veri/mizanlar.svg",
          icon: IconPoint,
          href: "/Veri/Mizanlar",
          children: [
            {
              id: uniqueId(),
              title: "E-Defter Mizan Oluşturma",
              customIcon: "public/images/svgs/veri/mizanlar.svg",
              icon: IconPoint,
              href: "/Veri/Mizanlar/EDefterMizan",
            },
            {
              id: uniqueId(),
              title: "Vuk Mizan Oluşturma",
              customIcon: "public/images/svgs/veri/mizanlar.svg",
              icon: IconPoint,
              href: "/Veri/Mizanlar/VukMizan",
            },
          ],
        },
        {
          id: uniqueId(),
          title: "E-Defter İnceleme",
          customIcon: "public/images/svgs/veri/defter-inceleme.svg",
          icon: IconPoint,
          href: "/Veri/EDefterInceleme",
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
      title: "HESAPLAMALAR",
      icon: IconCalculator,
      href: "/Hesaplamalar",
      children: [
        {
          id: uniqueId(),
          title: "Yaşlandırma",
          customIcon: "public/images/svgs/hesaplamalar/yaslandirma.svg",
          icon: IconPoint,
          href: "/Hesaplamalar/Yaslandirma",
        },
        {
          id: uniqueId(),
          title: "Beklenen Kredi Zararı",
          customIcon:
            "public/images/svgs/hesaplamalar/beklenen-kredi-zarari.svg",
          icon: IconPoint,
          href: "/Hesaplamalar/BeklenenKrediZarari",
        },
        {
          id: uniqueId(),
          title: "Kıdem Tazminatı (Bobi)",
          customIcon: "public/images/svgs/hesaplamalar/kidem-bobi.svg",
          icon: IconPoint,
          href: "/Hesaplamalar/KidemTazminatiBobi",
        },
        {
          id: uniqueId(),
          title: "Kıdem Tazminatı (Tfrs)",
          customIcon: "public/images/svgs/hesaplamalar/kidem-tfrs.svg",
          icon: IconPoint,
          href: "/Hesaplamalar/KidemTazminatiTfrs",
        },
        {
          id: uniqueId(),
          title: "Amortisman",
          customIcon: "public/images/svgs/hesaplamalar/amortisman.svg",
          icon: IconPoint,
          href: "/Hesaplamalar/Amortisman",
          aciklama:
            "Veri Yükleme sekmesi altında, amortisman verilerini sisteme girebilirsiniz. Hesaplama sekmesi altında ise, Veri Yükleme sekmesi altında girmiş olduğunuz amortismanları standartlarına uygun olarak aylık veya günlük bazda hesaplama işlemini gerçekleştirebilirsiniz.",
        },
        {
          id: uniqueId(),
          title: "Kredi",
          customIcon: "public/images/svgs/hesaplamalar/kredi.svg",
          icon: IconPoint,
          href: "/Hesaplamalar/Kredi",
        },
        {
          id: uniqueId(),
          title: "Çek / Senet Reeskont",
          customIcon: "public/images/svgs/hesaplamalar/cek-senet-reeskont.svg",
          icon: IconPoint,
          href: "/Hesaplamalar/CekSenetReeskont",
        },
        {
          id: uniqueId(),
          title: "Dava Karşılıkları",
          customIcon: "public/images/svgs/hesaplamalar/dava-karsiliklari.svg",
          icon: IconPoint,
          href: "/Hesaplamalar/DavaKarsiliklari",
        },
        {
          id: uniqueId(),
          title: "Ertelenmiş Vergi Hesabı",
          customIcon:
            "public/images/svgs/hesaplamalar/ertelenmis-vergi-hesabi.svg",
          icon: IconPoint,
          href: "/Hesaplamalar/ErtelenmisVergiHesabi",
        },
        {
          id: uniqueId(),
          title: "İlişkili Taraf Sınıflama",
          customIcon:
            "public/images/svgs/hesaplamalar/iliskili-taraf-siniflama.svg",
          icon: IconPoint,
          href: "/Hesaplamalar/IliskiliTarafSiniflama",
        },
        {
          id: uniqueId(),
          title: "Vadeli Banka Mevduatı",
          customIcon:
            "public/images/svgs/hesaplamalar/vadeli-banka-mevduati.svg",
          icon: IconPoint,
          href: "/Hesaplamalar/VadeliBankaMevduati",
          children: [
            {
              id: uniqueId(),
              title: "Vadeli Banka Mevduatı Otomatik Sınıflama",
              customIcon:
                "public/images/svgs/hesaplamalar/vadeli-banka-mevduati.svg",
              icon: IconPoint,
              href: "/Hesaplamalar/VadeliBankaMevduati/VadeliBankaMevduatiOtomatikSiniflama",
            },
            {
              id: uniqueId(),
              title: "Vadeli Banka Mevduatı Manuel Sınıflama",
              customIcon:
                "public/images/svgs/hesaplamalar/vadeli-banka-mevduati.svg",
              icon: IconPoint,
              href: "/Hesaplamalar/VadeliBankaMevduati/VadeliBankaMevduatiManuelSiniflama",
            },
            {
              id: uniqueId(),
              title: "Vadeli Banka Mevduatı Faiz Tahakkuk",
              customIcon:
                "public/images/svgs/hesaplamalar/vadeli-banka-mevduati.svg",
              icon: IconPoint,
              href: "/Hesaplamalar/VadeliBankaMevduati/VadeliBankaMevduatiFaizTahakkuk",
            },
          ],
        },
        {
          id: uniqueId(),
          title: "Hareketsiz",
          customIcon: "public/images/svgs/hesaplamalar/hareketsiz.svg",
          icon: IconPoint,
          href: "/Hesaplamalar/Hareketsiz",
        },
        {
          id: uniqueId(),
          title: "Geçmiş Yıllar Kar Zarar Kontrolleri",
          customIcon:
            "public/images/svgs/hesaplamalar/gecmis-yillar-kar-zarar.svg",
          icon: IconPoint,
          href: "/Hesaplamalar/GecmisYillarKarZararKontrolleri",
        },
        {
          id: uniqueId(),
          title: "Kur Farkı Kayıtları",
          customIcon: "public/images/svgs/hesaplamalar/kur-farki-kayitlari.svg",
          icon: IconPoint,
          href: "/Hesaplamalar/KurFarkiKayitlari",
          children: [
            {
              id: uniqueId(),
              title: "Kur Farkı",
              customIcon:
                "public/images/svgs/hesaplamalar/kur-farki-kayitlari.svg",
              icon: IconPoint,
              href: "/Hesaplamalar/KurFarkiKayitlari/KurFarki",
            },
            {
              id: uniqueId(),
              title: "Kur Farkı Kontrolleri",
              customIcon:
                "public/images/svgs/hesaplamalar/kur-farki-kayitlari.svg",
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
        {
          id: uniqueId(),
          title:
            denetimTuru == "Bobi"
              ? "Bobi Frs Belirleme Belgesi"
              : "Tms Tfrs Belirleme Belgesi",
          icon: IconPoint,
          href:
            denetimTuru == "Bobi"
              ? "/Donusum/BobiFrs/BelirlemeBelgesi"
              : "/Donusum/TmsTfrs/BelirlemeBelgesi",
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
        /*{
          id: uniqueId(),
          title: "Denetim Programı",
          icon: IconPoint,
          href: "/",
        },
        {
          id: uniqueId(),
          title: "Maddi Doğrulama Görev Atamaları",
          icon: IconPoint,
          href: "/",
        },*/
        {
          id: uniqueId(),
          title: "Denetim Takvimi",
          icon: IconPoint,
          href: "/PlanVeProgram/DenetimTakvimi",
        },
        {
          id: uniqueId(),
          title: "Denetim Planı",
          icon: IconPoint,
          href: "/PlanVeProgram/DenetimPlani",
        },
        /*{
          id: uniqueId(),
          title: "Denetim Ekibi Görev Tebliği",
          icon: IconPoint,
          href: "/",
        },
        {
          id: uniqueId(),
          title: "Denetçi Bağımsızlık ve Sorumluluk Taahhütnameleri",
          icon: IconPoint,
          href: "/",
        },
        {
          id: uniqueId(),
          title: "Etik Bildirim ve Değerlendirme",
          icon: IconPoint,
          href: "/",
        },
        {
          id: uniqueId(),
          title:
            "Mesleki Etik İlkelere Uyum, Bağımsızlık Değerlendirme ve Kontrol",
          icon: IconPoint,
          href: "/",
        },*/
        {
          id: uniqueId(),
          title: "Denetim Zamanı Bildirme",
          icon: IconPoint,
          href: "/PlanVeProgram/DenetimZamaniBildirme",
        },
        /*{
          id: uniqueId(),
          title: "Sorumlu Denetçi Kimlik ve Deneyim Bildirim",
          icon: IconPoint,
          href: "/",
        },
       {
          id: uniqueId(),
          title: "Denetçi Sorumlulukları Bildirim",
          icon: IconPoint,
          href: "/",
        },*/
        {
          id: uniqueId(),
          title:
            "Denetlenen İşletmenin Tabi Olduğu Mevzuata İlişkin Değerlendirme",
          icon: IconPoint,
          href: "/PlanVeProgram/DenetlenenIsletmeninTabiOlduguMevzuataIliskinDegerlendirme",
        },
        {
          id: uniqueId(),
          title: "Denetim Risk Tespit Kılavuzu",
          icon: IconPoint,
          href: "/PlanVeProgram/",
        },
        {
          id: uniqueId(),
          title: "Finansal Tablolar Denetim Riski Belirleme",
          icon: IconPoint,
          href: "/PlanVeProgram/FinansalTablolarDenetimRiskiBelirleme",
        },
        {
          id: uniqueId(),
          title: "Denetim Risk Değerlendirme",
          icon: IconPoint,
          href: "/PlanVeProgram/DenetimRiskDegerlendirme",
        },
        {
          id: uniqueId(),
          title: "İşletmeye İlişkin İç Kontrol Sistemi Özet Değerlendirme",
          icon: IconPoint,
          href: "/PlanVeProgram/IsletmeyeIliskinIcKontrolSistemiOzetDegerlendirme",
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
          title: "İşletme Varlıklarının Korunmasına İlişkin Değerlendirme",
          icon: IconPoint,
          href: "/PlanVeProgram/IsletmeVarliklarininKorunmasinaIliskinDegerlendirme",
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
          title: "Önemlilik",
          icon: IconPoint,
          href: "/DenetimKanitlari/Onemlilik",
          children: [
            {
              id: uniqueId(),
              title: "Fiş İşlem Sayıları",
              icon: IconPoint,
              href: "/DenetimKanitlari/Onemlilik/FisIslemSayilari",
            },
            {
              id: uniqueId(),
              title: "Örneklem",
              icon: IconPoint,
              href: "/DenetimKanitlari/Onemlilik/Orneklem",
            },
            {
              id: uniqueId(),
              title: "Önemlilik Seviyesi Belirleme Kılavuzu",
              icon: IconPoint,
              href: "/DenetimKanitlari/Onemlilik/OnemlilikSeviyesiBelirlemeKilavuzu",
            },
            {
              id: uniqueId(),
              title: "Önemlilik Seviyesi Belirleme Ve Değerlendirme",
              icon: IconPoint,
              href: "/DenetimKanitlari/Onemlilik/OnemlilikSeviyesiBelirlemeVeDegerlendirme",
            },
          ],
        },
        {
          id: uniqueId(),
          title: "Mutabakat",
          icon: IconPoint,
          href: "/DenetimKanitlari/Mutabakat",
          children: [
            {
              id: uniqueId(),
              title: "Mutabakat Seçimi Ve Kontrol",
              icon: IconPoint,
              href: "/DenetimKanitlari/Mutabakat/MutabakatSecimiVeKontrol",
            },
            {
              id: uniqueId(),
              title: "Doğrulama Mektuplarına Alınan Yanıtlar",
              icon: IconPoint,
              href: "/DenetimKanitlari/Mutabakat/DogrulamaMektuplarinaAlinanYanitlar",
            },
          ],
        },
        {
          id: uniqueId(),
          title: "Diğer Kanıtlar",
          icon: IconPoint,
          href: "/DenetimKanitlari/DigerKanitlar",
          children: [
            {
              id: uniqueId(),
              title: "Denetim Satratejisi Belirleme",
              icon: IconPoint,
              href: "/DenetimKanitlari/DigerKanitlar/DenetimStratejisiBelirleme",
            },
            {
              id: uniqueId(),
              title: "Uzman Yeterliliği Değerlendirme Belgesi",
              icon: IconPoint,
              href: "/DenetimKanitlari/DigerKanitlar/UzmanYeterliligiDegerlendirme",
            },
            {
              id: uniqueId(),
              title: "Denetim Kontrol Testleri",
              icon: IconPoint,
              href: "/DenetimKanitlari/DigerKanitlar/DenetimKontrolTestleri",
            },
            {
              id: uniqueId(),
              title:
                "Bilanço Tarihinden Sonra Ortaya Çıkan Olayları Değerlendirme",
              icon: IconPoint,
              href: "/DenetimKanitlari/DigerKanitlar/BilancoTarihindenSonraOrtayaCikanOlaylariDegerlendirme",
            },
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
              title: "Uygulanan Muhasebe Politikalarının Tespiti",
              icon: IconPoint,
              href: "/DenetimKanitlari/DigerKanitlar/UygulananMuhasebePolitikalarininTespiti",
            },
            {
              id: uniqueId(),
              title: "Kullanılan Tahminlere İlişkin Değerlendirme",
              icon: IconPoint,
              href: "/DenetimKanitlari/DigerKanitlar/KullanilanTahminlereIliskinDegerlendirme",
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
              title: "Transfer Fiyatlaması ve Örtülü Kazanç Kontrol",
              icon: IconPoint,
              href: "/DenetimKanitlari/DigerKanitlar/TransferFiyatlamasiOrtuluKazanc",
            },
            {
              id: uniqueId(),
              title: "İhmal Edilen Düzeltme",
              icon: IconPoint,
              href: "/DenetimKanitlari/DigerKanitlar/IhmalEdilenDuzeltme",
            },
            {
              id: uniqueId(),
              title: "Gerçeğe Uygun Değer Hesaplamaları Değerlendirme",
              icon: IconPoint,
              href: "/DenetimKanitlari/DigerKanitlar/GercegeUygunDegerHesaplamalariDegerlendirme",
            },
            {
              id: uniqueId(),
              title: "Habersiz İşletme Ziyareti",
              icon: IconPoint,
              href: "/DenetimKanitlari/DigerKanitlar/HabersizIsletmeZiyareti",
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
              title: "Yönetim Kurulu Faaliyet Raporu Değerlendirme",
              icon: IconPoint,
              href: "/DenetimKanitlari/DigerKanitlar/YonetimKuruluFaaliyetRaporuDegerlendirme",
            },
            {
              id: uniqueId(),
              title: "Yevmiye Kayıtları Kontrol",
              icon: IconPoint,
              href: "/DenetimKanitlari/DigerKanitlar/YevmiyeKayitlariKontrol",
            },
            /*{
              id: uniqueId(),
              title: "Denetim Çalışmalarının Sınırlandırılmasını Değerlendirme",
              icon: IconPoint,
              href: "/DenetimKanitlari/DigerKanitlar/DenetimCalismalarininSinirlandirilmasiniDegerlendirme",
            },*/
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
      title: "RAPOR",
      icon: IconFileAnalytics,
      href: "/Rapor",
      children: [
        {
          id: uniqueId(),
          title: "Rapor Düzenle",
          icon: IconPoint,
          href: "/Rapor/RaporDuzenle",
        },
        {
          id: uniqueId(),
          title: "Bağımsız Denetçi Raporu",
          icon: IconPoint,
          href: "/Rapor/BagimsizDenetciRaporu",
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
      parentTitle: "ENFLASYON",
      title: "ENFLASYON",
      icon: IconTrendingUp,
      href: "/Enflasyon",
      children: [
        {
          id: uniqueId(),
          parentTitle: "ENFLASYON",
          title: "Aşamalar",
          icon: IconPoint,
          href: "/Enflasyon/Asamalar",
        },
        {
          id: uniqueId(),
          title: "Düzeltme Katsayıları",
          icon: IconPoint,
          href: "/Enflasyon/DuzeltmeKatsayilari",
        },
        {
          id: uniqueId(),
          title: "Ortalama Ticari Kredi Faiz Oranları",
          icon: IconPoint,
          href: "/Enflasyon/OrtalamaTicariKrediFaizOranlari",
        },
        {
          id: uniqueId(),
          title: "Maddi Ve Maddi Olmayan Duran Varlıklar",
          icon: IconPoint,
          href: "/Enflasyon/MaddiVeMaddiOlmayanDuranVarliklar",
        },
        {
          id: uniqueId(),
          title: "Reel Olmayan Finansman Maaliyeti",
          icon: IconPoint,
          href: "/Enflasyon/ReelOlmayanFinansmanMaaliyeti",
        },
        {
          id: uniqueId(),
          title: "Stoklar Enflasyon Düzeltmesi",
          icon: IconPoint,
          href: "/Enflasyon/StoklarEnflasyonDuzeltmesi",
        },
        {
          id: uniqueId(),
          title: "Diğer Varlık Ve Kaynaklar Enflasyon Düzeltmesi",
          icon: IconPoint,
          href: "/Enflasyon/DigerVarlikVeKaynaklar",
        },
        {
          id: uniqueId(),
          title: "Proje-İnşaat Enflasyon Düzeltmesi",
          icon: IconPoint,
          href: "/Enflasyon/ProjeInsaat",
        },
        {
          id: uniqueId(),
          title: "Gelir Ve Giderlere İlişkin Enflasyon Düzeltmesi",
          icon: IconPoint,
          href: "/Enflasyon/GelirVeGiderlerEnflasyonDuzeltmesi",
        },
        {
          id: uniqueId(),
          title: "Net Parasal Pozisyon",
          icon: IconPoint,
          href: "Enflasyon/NetParasalPozisyon",
          children: [
            {
              id: uniqueId(),
              title: "NPP Kayıp/Kazanç",
              icon: IconPoint,
              href: "/Enflasyon/NetParasalPozisyon/NetParasalPozisyonTablosu",
            },
            {
              id: uniqueId(),
              title: "Ertelenen Vergi",
              icon: IconPoint,
              href: "/Enflasyon/NetParasalPozisyon/ErtelenenVergi",
            },
          ],
        },
        {
          id: uniqueId(),
          title: "Enflasyon Düzeltmesi Çalışma Kağıdı",
          icon: IconPoint,
          href: "/Enflasyon/EnflasyonDuzeltmesiCalismaKagidi",
        },
        {
          id: uniqueId(),
          title: "Düzeltme İşlemleri",
          icon: IconPoint,
          href: "Enflasyon/DuzeltmeIslemleri",
          children: [
            {
              id: uniqueId(),
              title: "Fiş Girişi",
              icon: IconPoint,
              href: "/Enflasyon/DuzeltmeIslemleri/FisGirisi",
            },
            {
              id: uniqueId(),
              title: "Fiş İşlemleri",
              icon: IconPoint,
              href: "/Enflasyon/DuzeltmeIslemleri/FisIslemleri",
            },
            {
              id: uniqueId(),
              title: "Taşıma Fişi",
              icon: IconPoint,
              href: "/Enflasyon/DuzeltmeIslemleri/TasimaFisi",
            },
            {
              id: uniqueId(),
              title: "Maliyet Fark Fişi Oluştur",
              icon: IconPoint,
              href: "/Enflasyon/DuzeltmeIslemleri/MaliyetFarkFisi",
            },
            {
              id: uniqueId(),
              title: "Maliyet Devir Fişi Oluştur",
              icon: IconPoint,
              href: "/Enflasyon/DuzeltmeIslemleri/MaliyetDevirFisi",
            },
            {
              id: uniqueId(),
              title: "Enflasyon Dönüşüm",
              icon: IconPoint,
              href: "/Enflasyon/DuzeltmeIslemleri/Donusum",
            },
          ],
        },
        {
          id: uniqueId(),
          title: "Sunum Endeksi",
          icon: IconPoint,
          href: "/Enflasyon/SunumEndeksi",
        },
        {
          id: uniqueId(),
          title: "Dönüşüm Mizan Kontrol",
          icon: IconPoint,
          href: "/Enflasyon/DetayMizanKontrol",
        },
        {
          id: uniqueId(),
          title: "Finansal Tablolar",
          parentTitle: "ENFLASYON",
          icon: IconPoint,
          href: "Enflasyon/FinansalTablolar",
          children: [
            {
              id: uniqueId(),
              title: "Finansal Durum Tablosu",
              parentTitle: "ENFLASYON",
              icon: IconPoint,
              href: "/Enflasyon/FinansalTablolar/FinansalDurumTablosu",
            },
            {
              id: uniqueId(),
              title: "Kar / Zarar Tablosu",
              parentTitle: "ENFLASYON",
              icon: IconPoint,
              href: "/Enflasyon/FinansalTablolar/KarZararTablosu",
            },
            {
              id: uniqueId(),
              title: "Nakit Akış Tablosu",
              parentTitle: "ENFLASYON",
              icon: IconPoint,
              href: "/Enflasyon/FinansalTablolar/NakitAkisTablosu",
            },
            {
              id: uniqueId(),
              title: "Özkaynak Değişim Tablosu",
              parentTitle: "ENFLASYON",
              icon: IconPoint,
              href: "/Enflasyon/FinansalTablolar/OzkaynakDegisimTablosu",
            },
          ],
        },
        {
          id: uniqueId(),
          title: "Rapor",
          icon: IconPoint,
          href: "Enflasyon/Rapor",
          children: [
            {
              id: uniqueId(),
              title: "Dipnotlar",
              icon: IconPoint,
              href: "/Enflasyon/Rapor/Dipnotlar",
            },
            {
              id: uniqueId(),
              title: "Denetçi Raporu",
              icon: IconPoint,
              href: "/Enflasyon/Rapor/DenetciRaporu",
            },
          ],
        },
      ],
    },
    {
      id: uniqueId(),
      parentTitle: "KONSOLİDASYON",
      title: "KONSOLİDASYON",
      icon: IconLayoutGridAdd,
      href: "/Konsolidasyon",
      children: [
        {
          id: uniqueId(),
          parentTitle: "KONSOLİDASYON",
          title: "Aşamalar",
          icon: IconPoint,
          href: "/Konsolidasyon/Asamalar",
        },
        {
          id: uniqueId(),
          title: "Tanımlama",
          icon: IconPoint,
          href: "/Konsolidasyon/Tanimlama",
        },
        {
          id: uniqueId(),
          title: "Birleştirilmiş Mizan",
          icon: IconPoint,
          href: "/Konsolidasyon/BirlestirilmisMizan",
        },
        {
          id: uniqueId(),
          title: "Eliminasyon Fiş İşlemleri",
          icon: IconPoint,
          href: "/Konsolidasyon/EliminasyonFisIslemleri",
        },
        {
          id: uniqueId(),
          parentTitle: "KONSOLİDASYON",
          title: "Dönüşüm İşlemi",
          icon: IconPoint,
          href: "/Konsolidasyon/DonusumIslemi",
        },
        {
          id: uniqueId(),
          parentTitle: "KONSOLİDASYON",
          title: "Dönüşüm Mizan Kontrol",
          icon: IconPoint,
          href: "/Konsolidasyon/DonusumMizanKontrol",
        },
        {
          id: uniqueId(),
          parentTitle: "KONSOLİDASYON",
          title: "Finansal Tablolar",
          icon: IconPoint,
          href: "/Konsolidasyon/FinansalTablolar",
          children: [
            {
              id: uniqueId(),
              parentTitle: "KONSOLİDASYON",
              title: "Finansal Durum Tablosu",
              icon: IconPoint,
              href: "/Konsolidasyon/FinansalTablolar/FinansalDurumTablosu",
            },
            {
              id: uniqueId(),
              parentTitle: "KONSOLİDASYON",
              title: "Kar / Zarar Tablosu",
              icon: IconPoint,
              href: "/Konsolidasyon/FinansalTablolar/KarZararTablosu",
            },
            {
              id: uniqueId(),
              parentTitle: "KONSOLİDASYON",
              title: "Nakit Akış Tablosu",
              icon: IconPoint,
              href: "/Konsolidasyon/FinansalTablolar/NakitAkisTablosu",
            },
            {
              id: uniqueId(),
              parentTitle: "KONSOLİDASYON",
              title: "Özkaynak Değişim Tablosu",
              icon: IconPoint,
              href: "/Konsolidasyon/FinansalTablolar/OzkaynakDegisimTablosu",
            },
          ],
        },
        {
          id: uniqueId(),
          parentTitle: "KONSOLİDASYON",
          title: "Rapor",
          icon: IconPoint,
          href: "/Konsolidasyon/Rapor",
          children: [
            {
              id: uniqueId(),
              parentTitle: "KONSOLİDASYON",
              title: "Rapor Düzenle",
              icon: IconPoint,
              href: "/Konsolidasyon/Rapor/RaporDuzenle",
            },
            {
              id: uniqueId(),
              parentTitle: "KONSOLİDASYON",
              title: "Bağımsız Denetçi Raporu",
              icon: IconPoint,
              href: "/Konsolidasyon/Rapor/BagimsizDenetciRaporu",
            },
          ],
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
          title:
            "İşletmenin Sürekliliğine İlişkin Değerlendirme - BDDK Analizi",
          icon: IconPoint,
          href: "/",
        },
      ],
    },
    /*
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
    */
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
      title: "KULLANIM KILAVUZU",
      icon: IconInfoCircle,
      href: "/",
    },
  ];
}
