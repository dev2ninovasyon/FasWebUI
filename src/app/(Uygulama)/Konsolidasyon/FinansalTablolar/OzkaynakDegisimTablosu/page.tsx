"use client";

import React from "react";
import { Grid } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import OzkaynakDegisimTablosu from "@/app/(Uygulama)/components/DenetimKanitlari/FinansalTablolar/OzkaynakDegisimTablosu";

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
    to: "/Konsolidasyon/FinansalTablolar/OzkaynakDegisimTablosu",
    title: "Özkaynak Değişim Tablosu",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="Özkaynak Değişim Tablosu"
      description="this is Özkaynak Değişim Tablosu"
    >
      <Breadcrumb title="Özkaynak Değişim Tablosu" items={BCrumb} />
      <Grid container>
        <Grid
          item
          xs={12}
          lg={12}
          sx={{
            width: "500px",
          }}
        >
          <OzkaynakDegisimTablosu />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
