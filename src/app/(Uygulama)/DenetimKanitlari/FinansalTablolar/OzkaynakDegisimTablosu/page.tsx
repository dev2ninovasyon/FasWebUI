"use client";

import React from "react";
import { Grid } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import OzkaynakDegisimTablosu from "@/app/(Uygulama)/components/DenetimKanitlari/FinansalTablolar/OzkaynakDegisimTablosu";

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
    to: "/DenetimKanitlari/FinansalTablolar/OzkaynakDegisimTablosu",
    title: "Özkaynak Değişim Tablosu",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="Özkaynak Değişim Tablosu"
      description="this is Özkaynak Değişim Tablosu"
    >
      <Breadcrumb title="Özkaynak Değişim Tablosu" items={BCrumb}>
        <Grid container spacing={1}>
          <Grid size="auto">
            <EkBelgeYukleButton formKodu="FinansalTabloOzkaynakKayitlari" />
          </Grid>
          <Grid size="auto">
            <KgkExcelButton tabloTuru="ozkaynak" konsolidasyonMu={false} />
          </Grid>
        </Grid>
      </Breadcrumb>
      <Grid container>
        <Grid
          sx={{
            width: "500px",
          }}
          size={{ xs: 12, lg: 12 }}>
          <OzkaynakDegisimTablosu konsolidasyonMu={false} />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
