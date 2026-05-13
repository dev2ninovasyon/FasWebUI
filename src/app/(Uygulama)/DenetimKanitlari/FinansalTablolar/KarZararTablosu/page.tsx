"use client";

import React from "react";
import { Grid } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import KarZararTablosu from "@/app/(Uygulama)/components/DenetimKanitlari/FinansalTablolar/KarZararTablosu";

import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
import KgkExcelButton from "@/app/(Uygulama)/components/DenetimKanitlari/FinansalTablolar/KgkExcelButton";
const BCrumb = [
  {
    to: "/DenetimKanitlari",
    title: "Denetim Kanıtları",
  },
  {
    to: "/DenetimKanitlari/FinansalTablolar",
    title: "Finansal Tablolar",
  },
  {
    to: "/DenetimKanitlari/FinansalTablolar/KarZararTablosu",
    title: "Kar Zarar Tablosu",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="Kar Zarar Tablosu"
      description="this is Kar Zarar Tablosu"
    >
      <Breadcrumb title="Kar Zarar Tablosu" items={BCrumb}>
        <Grid container spacing={1}>
          <Grid size="auto">
            <EkBelgeYukleButton formKodu="FinansalTabloKayitlari" />
          </Grid>
          <Grid size="auto">
            <KgkExcelButton tabloTuru="karzarar" konsolidasyonMu={false} />
          </Grid>
        </Grid>
      </Breadcrumb>
      <Grid container>
        <Grid size={{ xs: 12, lg: 12 }}>
          <KarZararTablosu konsolidasyonMu={false} />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
