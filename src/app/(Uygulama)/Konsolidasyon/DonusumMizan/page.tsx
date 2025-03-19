"use client";

import React from "react";
import { Grid } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "react-redux";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import DonusumMizanKontrol from "@/app/(Uygulama)/components/DenetimKanitlari/DonusumMizanKontrol/DonusumMizanKontrol";
import DonusumMizanKontrolCardTable from "@/app/(Uygulama)/components/DenetimKanitlari/DonusumMizanKontrolCardTable";

const BCrumb = [
  {
    to: "/Konsolidasyon",
    title: "Konsolidasyon",
  },
  {
    to: "/Konsolidasyon/DonusumMizanK",
    title: "Dönüşüm Mizan",
  },
];

const Page: React.FC = () => {
  const customizer = useSelector((state: AppState) => state.customizer);

  return (
    <PageContainer title="Dönüşüm Mizan" description="this is Dönüşüm Mizan">
      <Breadcrumb title="Dönüşüm Mizan" items={BCrumb} />

      <Grid container>
        <Grid item xs={12} lg={12}>
          <DonusumMizanKontrolCardTable />
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={12} lg={12}>
          <DonusumMizanKontrol />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
