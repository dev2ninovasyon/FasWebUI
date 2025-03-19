"use client";

import React from "react";
import { Grid } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import KarZararTablosu from "@/app/(Uygulama)/components/DenetimKanitlari/FinansalTablolar/KarZararTablosu";

const BCrumb = [
  {
    to: "/Konsolidasyon",
    title: "Konsolidasyon",
  },
  {
    to: "/Konsolidasyon/FinansalTablolar",
    title: "Finansal Tablolar",
  },
  {
    to: "/Konsolidasyon/FinansalTablolar/KarZararTablosu",
    title: "Kar Zarar Tablosu",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="Kar Zarar Tablosu"
      description="this is Kar Zarar Tablosu"
    >
      <Breadcrumb title="Kar Zarar Tablosu" items={BCrumb} />
      <Grid container>
        <Grid item xs={12} lg={12}>
          <KarZararTablosu />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
