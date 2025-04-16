"use client";

import React from "react";
import { Grid } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import FinansalDurumTablosu from "@/app/(Uygulama)/components/DenetimKanitlari/FinansalTablolar/FinansalDurumTablosu";
import FisIslemSayilari from "@/app/(Uygulama)/components/DenetimKanitlari/Onemlilik/FisIslemSayilari";

const BCrumb = [
  {
    to: "/DenetimKanitlari",
    title: "Denetim Kanıtları",
  },
  {
    to: "/DenetimKanitlari/Onemlilik",
    title: "Önemlilik",
  },
  {
    to: "/DenetimKanitlari/Onemlilik/FisIslemSayilari",
    title: "Fiş İşlem Sayıları",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="Fiş İşlem Sayıları"
      description="this is Fiş İşlem Sayıları"
    >
      <Breadcrumb title="Fiş İşlem Sayıları" items={BCrumb} />
      <Grid container>
        <Grid item xs={12} lg={12}>
          <FisIslemSayilari />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
