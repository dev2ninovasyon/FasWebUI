"use client";

import React from "react";
import { Grid } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import NakitAkisTablosu from "@/app/(Uygulama)/components/DenetimKanitlari/FinansalTablolar/NakitAkisTablosu";

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
      <Breadcrumb title="Nakit Akış Tablosu" items={BCrumb} />
      <Grid container>
        <Grid item xs={12} lg={12}>
          <NakitAkisTablosu konsolidasyonMu={false} />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
