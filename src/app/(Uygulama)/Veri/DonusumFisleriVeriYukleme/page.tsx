"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React from "react";
import { Grid } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "react-redux";
import DonusumFisleri from "./DonusumFisleri";

const BCrumb = [
  {
    to: "/Veri",
    title: "Veri",
  },
  {
    to: "/Veri/DonusumFisleriVeriYukleme",
    title: "Dönüşüm Fişleri Veri Yükleme",
  },
];

const Page: React.FC = () => {
  const customizer = useSelector((state: AppState) => state.customizer);

  return (
    <PageContainer
      title="Dönüşüm Fişleri Veri Yükleme"
      description="this is Dönüşüm Fişleri Veri Yükleme"
    >
      <Breadcrumb title="Dönüşüm Fişleri Veri Yükleme" items={BCrumb} />
      <Grid container>
        <Grid item xs={12} lg={12}>
          <DonusumFisleri />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
