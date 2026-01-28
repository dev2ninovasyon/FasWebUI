"use client";

import React from "react";
import { Grid } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import VukMizanDonusumMizanKarsilastirma from "@/app/(Uygulama)/components/DenetimKanitlari/DonusumMizanKontrol/VukMizanDonusumMizanKarsilastirma";
import DonusumMizanKontrolCardTable from "@/app/(Uygulama)/components/DenetimKanitlari/DonusumMizanKontrol/DonusumMizanKontrolCardTable";

const BCrumb = [
  {
    to: "/DenetimKanitlari",
    title: "Denetim Kanıtları",
  },
  {
    to: "/DenetimKanitlari/MizanKontrol",
    title: "Mizan Kontrol",
  },
  {
    to: "/DenetimKanitlari/MizanKontrol/VukMizanDonusumMizanKarsilastirma",
    title: "Vuk Mizan Dönüşüm Mizan Karşılaştırma",
  },
];

const Page: React.FC = () => {
  const customizer = useSelector((state: AppState) => state.customizer);

  return (
    <PageContainer
      title="Vuk Mizan Dönüşüm Mizan Karşılaştırma Kontrol"
      description="this is  Vuk Mizan Dönüşüm Mizan Karşılaştırma"
    >
      <Breadcrumb
        title="Vuk Mizan Dönüşüm Mizan Karşılaştırma"
        items={BCrumb}
      />
      <Grid container>
        <Grid
          size={{
            xs: 12,
            lg: 12
          }}>
          <DonusumMizanKontrolCardTable konsolidasyonMu={false} />
        </Grid>
      </Grid>
      <Grid container>
        <Grid
          size={{
            xs: 12,
            lg: 12
          }}>
          <VukMizanDonusumMizanKarsilastirma />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
