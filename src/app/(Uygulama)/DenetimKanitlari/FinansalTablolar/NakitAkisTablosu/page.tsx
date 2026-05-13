"use client";

import React from "react";
import { Grid } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import NakitAkisTablosu from "@/app/(Uygulama)/components/DenetimKanitlari/FinansalTablolar/NakitAkisTablosu";

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
    to: "/DenetimKanitlari/FinansalTablolar/NakitAkisTablosu",
    title: "Nakit Akış Tablosu",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="Nakit Akış Tablosu"
      description="this is Nakit Akış Tablosu"
    >
      <Breadcrumb title="Nakit Akış Tablosu" items={BCrumb}>
        <Grid container spacing={1}>
          <Grid size="auto">
            <EkBelgeYukleButton formKodu="FinansalTabloKayitlari" />
          </Grid>
          <Grid size="auto">
            <KgkExcelButton tabloTuru="nakitakis" konsolidasyonMu={false} />
          </Grid>
        </Grid>
      </Breadcrumb>
      <Grid container>
        <Grid size={{ xs: 12, lg: 12 }}>
          <NakitAkisTablosu konsolidasyonMu={false} />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
