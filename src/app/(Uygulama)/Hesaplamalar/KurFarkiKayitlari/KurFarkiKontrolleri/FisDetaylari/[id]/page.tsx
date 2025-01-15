"use client";

import { Grid } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import FisDetaylari from "./FisDetaylari";

const BCrumb = [
  {
    to: "/Hesaplamalar",
    title: "Hesaplamalar",
  },
  {
    to: "/Hesaplamalar/KurFarkiKayitlari",
    title: "Kur Farkı Kayıtları",
  },
  {
    to: "/Hesaplamalar/KurFarkiKayitlari/KurFarkiKontrolleri",
    title: "Kur Farkı Kontrolleri",
  },
  {
    to: "/Hesaplamalar/KurFarkiKayitlari/KurFarkiKontrolleri/FisDetaylari",
    title: "Fiş Detayları",
  },
];

const Page = () => {
  return (
    <PageContainer title="Fiş Detayları" description="this is Fiş Detayları">
      <Breadcrumb title="Fiş Detayları" items={BCrumb} />

      <Grid container marginTop={3}>
        <Grid item xs={12} lg={12}>
          <FisDetaylari />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
