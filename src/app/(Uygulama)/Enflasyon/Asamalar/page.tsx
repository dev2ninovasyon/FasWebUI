"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ProtectedPage from "@/app/ProtectedPage";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Box, Grid, Paper, Typography } from "@mui/material";

const BCrumb = [
  {
    to: "/Enflasyon",
    title: "Enflasyon",
  },
  {
    to: "/Enflasyon/Asamalar",
    title: "Aşamalar",
  },
];

type Step = {
  text: string;
  note?: string;
};

type YearSection = {
  year: string;
  steps: Step[];
};

const sections: YearSection[] = [
  {
    year: "2021 YILI",
    steps: [
      { text: "Stoklar enflasyon düzeltmesi" },
      {
        text: "Maddi ve maddi olmayan duran varlıklar enflasyon düzeltmesi",
        note:
          "Düzeltme işlemleri yapılmadan önce, “Hesaplamalar” menüsündeki “Amortisman” hesaplama modülünde yer alan mizan ve excel karşılaştırma tablosundan maliyet bedeli ve amortisman tutarlarının uyumluluğu teyit edilmelidir. Tabloda fark olması durumunda “Amortisman Hesaplama” excel dosyası kontrol edilmeli ve mizanla uyumlu olarak yeniden yüklenmelidir.",
      },
      { text: "Diğer varlık ve kaynaklar enflasyon düzeltmesi" },
      { text: "Proje-inşaat enflasyon düzeltmesi" },
      { text: "Kullanım hakkı varlıkları ve yükümlülüklerine ilişkin kayıtların fiş girişi ekranından yapılması" },
      { text: "Ertelenen vergi hesaplaması ve kaydı" },
      {
        text: "Dönüşüm işleminin yapılması",
        note:
          "Dönüşüm menüsünde görüntülenen BOBİ FRS / TFRS dönüşüm fişlerinden amortisman düzeltme ve sınıflama kayıtları seçilerek hariç bırakılmalıdır.",
      },
      { text: "Finansal tabloların oluşturulması" },
    ],
  },
  {
    year: "2022 YILI",
    steps: [
      {
        text: "Taşıma fişinin oluşturulması",
        note:
          "Önceki yıl stoklar, ertelenen vergi varlık veya yükümlülüğü ve dönem ayırıcı hesaplar için yapılmış olan enflasyon düzeltmesi tutarlarının cari yıla taşınması.",
      },
      {
        text: "Maliyet devir fişi",
        note:
          "Önceki yıl stoklar ve dönem ayırıcı hesaplar için yapılmış olan enflasyon düzeltmesinin maliyete aktarılması.",
      },
      { text: "Yıl içinde giren stoklar için stoklar enflasyon düzeltmesi" },
      {
        text: "Maddi ve maddi olmayan duran varlıklar enflasyon düzeltmesi",
        note:
          "Düzeltme işlemleri yapılmadan önce, “Hesaplamalar” menüsündeki “Amortisman” hesaplama modülünde yer alan mizan ve excel karşılaştırma tablosundan maliyet bedeli ve amortisman tutarlarının uyumluluğu teyit edilmelidir. Tabloda fark olması durumunda “Amortisman Hesaplama” excel dosyası kontrol edilmeli ve mizanla uyumlu olarak yeniden yüklenmelidir.",
      },
      { text: "Yıl içinde alından varlıklar ve ortaya çıkan kaynaklar için diğer varlık ve kaynaklar enflasyon düzeltmesi" },
      { text: "Yıl içinde gerçekleşen proje-inşaat enflasyon düzeltmesi" },
      { text: "Kullanım hakkı varlıkları ve yükümlülüklerine ilişkin kayıtların fiş girişi ekranından yapılması" },
      { text: "Gelir ve giderlere ilişkin enflasyon düzeltmesi" },
      { text: "Ertelenen vergi hesaplaması ve kaydı" },
      {
        text: "Dönüşüm işleminin yapılması",
        note:
          "Dönüşüm menüsünde görüntülenen BOBİ FRS / TFRS dönüşüm fişlerinden amortisman düzeltme ve sınıflama kayıtları seçilerek hariç bırakılmalıdır.",
      },
      { text: "Finansal tabloların oluşturulması" },
    ],
  },
  {
    year: "2023 YILI",
    steps: [
      {
        text: "Taşıma fişinin oluşturulması",
        note:
          "Önceki yıl stoklar, ertelenen vergi varlık veya yükümlülüğü ve dönem ayırıcı hesaplar için yapılmış olan enflasyon düzeltmesi tutarlarının cari yıla taşınması.",
      },
      {
        text: "Maliyet devir fişi",
        note:
          "Önceki yıl stoklar ve dönem ayırıcı hesaplar için yapılmış olan enflasyon düzeltmesinin maliyete aktarılması.",
      },
      { text: "Yıl içinde giren stoklar için stoklar enflasyon düzeltmesi" },
      {
        text: "Maddi ve maddi olmayan duran varlıklar enflasyon düzeltmesi",
        note:
          "Düzeltme işlemleri yapılmadan önce, “Hesaplamalar” menüsündeki “Amortisman” hesaplama modülünde yer alan mizan ve excel karşılaştırma tablosundan maliyet bedeli ve amortisman tutarlarının uyumluluğu teyit edilmelidir. Tabloda fark olması durumunda “Amortisman Hesaplama” excel dosyası kontrol edilmeli ve mizanla uyumlu olarak yeniden yüklenmelidir.",
      },
      { text: "Yıl içinde alından varlıklar ve ortaya çıkan kaynaklar için diğer varlık ve kaynaklar enflasyon düzeltmesi" },
      { text: "Yıl içinde gerçekleşen proje-inşaat enflasyon düzeltmesi" },
      { text: "Kullanım hakkı varlıkları ve yükümlülüklerine ilişkin kayıtların fiş girişi ekranından yapılması" },
      { text: "Gelir ve giderlere ilişkin enflasyon düzeltmesi" },
      { text: "Ertelenen vergi hesaplaması ve kaydı" },
      {
        text: "Dönüşüm işleminin yapılması",
        note:
          "Dönüşüm menüsünde görüntülenen BOBİ FRS / TFRS dönüşüm fişlerinden amortisman düzeltme ve sınıflama kayıtları seçilerek hariç bırakılmalıdır.",
      },
      { text: "Finansal tabloların oluşturulması" },
      { text: "Sunum endeksi ile karşılaştırmalı finansal tabloların hazırlanması" },
    ],
  },
  {
    year: "2024 YILI",
    steps: [
      { text: "2024 Yılı mizan oluşturma aşamasında hariç fişler belirlenirken tüm VUK enflasyon düzeltmesi fişleri ve kapanış fişleri hariç bırakılarak mizan oluşturulmalıdır." },
      {
        text: "“Önceki Dönem VUK Enflasyon İptal Fişi” menüsünden; e‑defter yüklendi ise e‑defter üzerinden, e‑defter yok ise Kurumlar Vergisi Beyannamesi üzerinden önceki yılın VUK enflasyon düzeltmesi fişlerini iptal edilmesi için dönüşüm fişi oluşturulmalıdır.",
      },
      {
        text: "Taşıma fişinin kaydedilmesi",
        note:
          "Ertelenen vergi varlık veya yükümlülüğü için yapılmış olan enflasyon düzeltmesi tutarlarının cari yıla taşınması.",
      },
      {
        text: "Maliyet fark fişinin oluşturulması",
        note:
          "Önceki yıl stoklar ve dönem ayırıcı hesaplar için yapılmış olan enflasyon düzeltmesinin maliyete aktarılması.",
      },
      { text: "Yıl içinde giren stoklar için stoklar enflasyon düzeltmesi" },
      {
        text: "Maddi ve maddi olmayan duran varlıklar enflasyon düzeltmesi",
        note:
          "Düzeltme işlemleri yapılmadan önce, “Hesaplamalar” menüsündeki “Amortisman” hesaplama modülünde yer alan mizan ve excel karşılaştırma tablosundan maliyet bedeli ve amortisman tutarlarının uyumluluğu teyit edilmelidir. Tabloda fark olması durumunda “Amortisman Hesaplama” excel dosyası kontrol edilmeli ve mizanla uyumlu olarak yeniden yüklenmelidir.",
      },
      { text: "Diğer varlık ve kaynaklar enflasyon düzeltmesi" },
      { text: "Proje-inşaat enflasyon düzeltmesi" },
      { text: "Kullanım hakkı varlıkları ve yükümlülüklerine ilişkin kayıtların fiş girişi ekranından yapılması" },
      { text: "Gelir ve giderlere ilişkin enflasyon düzeltmesi" },
      { text: "Ertelenen vergi hesaplaması ve kaydı" },
      {
        text: "Dönüşüm işleminin yapılması",
        note:
          "Dönüşüm menüsünde görüntülenen BOBİ FRS / TFRS dönüşüm fişlerinden amortisman düzeltme ve sınıflama kayıtları seçilerek hariç bırakılmalıdır.",
      },
      { text: "Finansal tabloların oluşturulması" },
      { text: "Sunum endeksi ile karşılaştırmalı finansal tabloların hazırlanması" },
    ],
  },
  {
    year: "2025 YILI",
    steps: [
      { text: "2025 Yılı mizan oluşturma aşamasında hariç fişler belirlenirken tüm VUK kapanış fişleri hariç bırakılarak mizan oluşturulmalıdır." },
      { text: "“VUK Enflasyon İptal Fişi” menüsünden; 2023 ve 2024 VUK enflasyon düzeltmelerinin iptal edilmesi için düzeltme fişi oluşturulmalıdır. VUK enflasyon iptal fişi, e-defter üzerinden otomatik oluşturulabileceği gibi excel formatında fiş yüklenerek de oluşturulabilir." },
      {
        text: "Taşıma fişinin kaydedilmesi",
        note:
          "Önceki yıllarda FAS üzerinden yapılmış olan enflasyon düzeltmesinden kaynaklanan ertelenen vergi varlık veya yükümlülüğü tutarlarının cari yıla taşınması.",
      },
      {
        text: "Maliyet fark fişinin oluşturulması",
        note:
          "Önceki yıl stoklar ve dönem ayırıcı hesaplar için yapılmış olan enflasyon düzeltmesinin maliyete aktarılması.",
      },
      { text: "Yeniden Değerleme hakkında(iptal kaydı) kontrol edilmeli ve bu kayıt iptal edilmelidir" },
      { text: "Yıl içinde giren stoklar için stoklar enflasyon düzeltmesi" },
      {
        text: "Maddi ve maddi olmayan duran varlıklar enflasyon düzeltmesi",
        note:
          "Düzeltme işlemleri yapılmadan önce, “Hesaplamalar” menüsündeki “Amortisman” hesaplama modülünde yer alan mizan ve excel karşılaştırma tablosundan maliyet bedeli ve amortisman tutarlarının uyumluluğu teyit edilmelidir. Tabloda fark olması durumunda “Amortisman Hesaplama” excel dosyası kontrol edilmeli ve mizanla uyumlu olarak yeniden yüklenmelidir.",
      },
      { text: "Diğer varlık ve kaynaklar enflasyon düzeltmesi" },
      { text: "Proje-inşaat enflasyon düzeltmesi" },
      { text: "Kullanım hakkı varlıkları ve yükümlülüklerine ilişkin kayıtların fiş girişi ekranından yapılması" },
      { text: "Gelir ve giderlere ilişkin enflasyon düzeltmesi" },
      { text: "Ertelenen vergi hesaplaması ve kaydı" },
      {
        text: "Dönüşüm işleminin yapılması",
        note:
          "Dönüşüm menüsünde görüntülenen BOBİ FRS / TFRS dönüşüm fişlerinden amortisman düzeltme ve sınıflama kayıtları seçilerek hariç bırakılmalıdır.",
      },
      { text: "Finansal tabloların oluşturulması" },
      { text: "Sunum endeksi ile karşılaştırmalı finansal tabloların hazırlanması" },
    ],
  },
];

const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  return (
    <ProtectedPage allowed={user?.enflasyonmu || false}>
      <PageContainer title="Aşamalar" description="this is Aşamalar">
        <Breadcrumb title="Aşamalar" items={BCrumb} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 12, lg: 12 }}>
            <Paper sx={{ p: 3 }}>
              {sections.map((section) => (
                <Box key={section.year} sx={{ mb: 4 }}>
                  <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 700 }}>
                    {section.year}
                  </Typography>
                  <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                    {section.steps.map((step, index) => (
                      <Box component="li" key={`${section.year}-${index}`} sx={{ mb: 1 }}>
                        <Typography variant="body1" component="span" sx={{ fontWeight: 700 }}>
                          {step.text}
                        </Typography>
                        {step.note && (
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            ({step.note})
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}

              <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                Not: Stoklar ve dönem ayırıcı hesaplar için maliyet fark fişi düzenlenmektedir. Stoklar ve dönem ayırıcı hesaplar dışındaki tüm varlık ve kaynakların enflasyon düzeltmesi tutarlarının taşıma işlemleri, düzeltme fişinin içerisinde yapılmaktadır. Taşıma fişi sayfasında oluşturulan fiş dışında taşıma işlemi yapılmasına gerek duyulmamaktadır.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </PageContainer>
    </ProtectedPage>
  );
};

export default Page;

