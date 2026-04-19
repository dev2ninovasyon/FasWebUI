"use client";

// import { Helmet } from 'react-helmet';
import { Helmet, HelmetProvider } from "react-helmet-async";
import { ReactNode } from "react";

import { usePathname } from "next/navigation";

type Props = {
  description?: string;
  children: ReactNode;
  title?: string;
};

const TITLE_MAP: Record<string, string> = {
  Anasayfa: "Ana Sayfa",
  Musteri: "Müşteri",
  MusteriIslemleri: "Müşteri İşlemleri",
  MusteriTanima: "Müşteri Tanıma",
  IsletmeTanima: "İşletme Tanıma",
  IsletmeFaaliyetVeCevresiTanima: "İşletme Faaliyet ve Çevresi Tanıma",
  TeklifHesaplama: "Teklif Hesaplama",
  TeklifBelgesi: "Teklif Belgesi",
  TeklifMektubu: "Teklif Mektubu",
  KendiYetkinliginiDegerlendirme: "Kendi Yetkinliğini Değerlendirme",
  MusteriDurustlugunuDegerlendirme: "Müşteri Dürüstlüğünü Değerlendirme",
  MusteriKabulIslemi: "Müşteri Kabul İşlemi",
  SozlesmeKabul: "Sözleşme Kabul",
  Sozlesme: "Sözleşme",
  DenetimKadrosuAtama: "Denetim Kadrosu Atama",
  BagimsizDenetimSozlesmesi: "Bağımsız Denetim Sözleşmesi",
  Veri: "Veri",
  DefterKVBeyannamesiYukleme: "Defter / K. V. Beyannamesi Yükleme",
  VeriYukleme: "Veri Yükleme",
  Mizanlar: "Mizanlar",
  EDefterMizan: "E-Defter Mizan",
  OlusturulmusMizanlar: "Oluşturulmuş Mizanlar",
  Fatura: "Fatura",
  EDefterInceleme: "E-Defter İnceleme",
  MusteriBelgeleri: "Müşteri Belgeleri",
  PlanVeProgram: "Plan ve Program",
  DenetimProgrami: "Denetim Programı",
  MaddiDogrulukGorevAtamalari: "Maddi Doğruluk Görev Atamaları",
  DenetimTakvimi: "Denetim Takvimi",
  DenetimPlani: "Denetim Planı",
  GorevTebligi: "Görev Tebliği",
  BagimsizlikSorumlulukBeyani: "Bağımsızlık Sorumluluk Beyanı",
  EtikGerekliliklereIliskinBildirim: "Etik Gerekliliklere İlişkin Bildirim",
  MeslekiEtik: "Mesleki Etik",
  DenetimZamaniBildirme: "Denetim Zamanı Bildirme",
  MeslekiDeneyimYeterlilik: "Mesleki Deneyim Yeterlilik",
  SorumlulukBildirimi: "Sorumluluk Bildirimi",
  DenetimStratejiKilavuzu: "Denetim Strateji Kılavuzu",
  FaaliyetRiskBelirleme: "Faaliyet Risk Belirleme",
  TespitEdilenRiskler: "Tespit Edilen Riskler",
  DenetimRiskBelirleme: "Denetim Risk Belirleme",
  FinansalTablolarDenetimRiskiBelirleme: "Finansal Tablolar Denetim Riski Belirleme",
  BulguRiskiBelirleme: "Bulgu Riski Belirleme",
  DenetimRiskDegerlendirme: "Denetim Risk Değerlendirme",
  BilgiIslemMuhasebe: "Bilgi İşlem ve Muhasebe Sistemi",
  IsletmeyeIliskinIcKontrolTespit: "İşletmeye İlişkin İç Kontrol Tespit",
  HesaplaraIliskinIcKontrolTespit: "Hesaplara İlişkin İç Kontrol Tespit",
  IsletmeyeIliskinIcKontrolSistemiOzetDegerlendirme: "İç Kontrol Sistemi Özet Değerlendirme",
  IcKontrolDegerlendirme: "İç Kontrol Değerlendirmesi",
  HileUsulsuzlukEkipCalismasi: "Hile ve Usulsüzlük Ekip Çalışması",
  HileUsulsuzlukBelirleme: "Hile ve Usulsüzlük Belirleme",
  HileUsulsuzlukDegerlendirme: "Hile ve Usulsüzlük Değerlendirmesi",
  IsletmeVarliklarininKorunmasinaIliskinDegerlendirme: "İşletme Varlıklarının Korunması Değerlendirmesi",
  Hesaplamalar: "Hesaplamalar",
  Yaslandirma: "Yaşlandırma",
  BeklenenKrediZarari: "Beklenen Kredi Zararı",
  KidemTazminatiBobi: "Kıdem Tazminatı (Bobi)",
  KidemTazminatiTfrs: "Kıdem Tazminatı (Tfrs)",
  Amortisman: "Amortisman",
  Kredi: "Kredi",
  CekSenetReeskont: "Çek / Senet Reeskont",
  DavaKarsiliklari: "Dava Karşılıkları",
  ErtelenmisVergiHesabi: "Ertelenmiş Vergi Hesabı",
  IliskiliTarafSiniflama: "İlişkili Taraf Sınıflama",
  VadeliBankaMevduati: "Vadeli Banka Mevduatı",
  Hareketsiz: "Hareketsiz",
  GecmisYillarKarZararKontrolleri: "Geçmiş Yıllar Kar Zarar Kontrolleri",
  KurFarkiKayitlari: "Kur Farkı Kayıtları",
  Donusum: "Dönüşüm",
  FisGirisi: "Fiş Girişi",
  FisListesi: "Fiş Listesi",
  MizanDonusum: "Mizan Dönüşümü",
  HazirFisler: "Hazır Fişler",
};

const prettifyPathname = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "";

  let lastSegment = segments[segments.length - 1];

  // Önce map içinde var mı kontrol et (Türkçe karşılık için)
  if (TITLE_MAP[lastSegment]) {
    return TITLE_MAP[lastSegment];
  }

  // CamelCase veya PascalCase'i ayır
  lastSegment = lastSegment.replace(/([A-Z])/g, " $1").trim();

  // Tire veya alt çizgiyi boşluğa çevir
  lastSegment = lastSegment.replace(/[-_]/g, " ");

  // Kelimelerin ilk harfini büyüt
  return lastSegment
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const PageContainer = ({ title, description, children }: Props) => {
  const pathname = usePathname();
  const pageTitle = title || prettifyPathname(pathname);
  const finalTitle = pageTitle ? `${pageTitle} | FAS Denetim` : "FAS Denetim";

  return (
    <HelmetProvider>
      <div>
        <Helmet>
          <title>{finalTitle}</title>
          <meta name="description" content={description} />
        </Helmet>
        {children}
      </div>
    </HelmetProvider>
  );
};

export default PageContainer;
