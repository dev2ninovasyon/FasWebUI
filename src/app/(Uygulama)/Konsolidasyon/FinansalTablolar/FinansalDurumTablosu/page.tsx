"use client";

import React from "react";
import { Grid } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import FinansalDurumTablosu from "@/app/(Uygulama)/components/DenetimKanitlari/FinansalTablolar/FinansalDurumTablosu";

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
    to: "/Konsolidasyon/FinansalTablolar/FinansalDurumTablosu",
    title: "Finansal Durum Tablosu",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="Finansal Durum Tablosu"
      description="this is Finansal Durum Tablosu"
    >
      <Breadcrumb title="Finansal Durum Tablosu" items={BCrumb} />
      <Grid container>
        <Grid item xs={12} lg={12}>
          <FinansalDurumTablosu />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
