"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React from "react";
import { Grid } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "react-redux";
import DonusturulmusMizan from "./DonusturulmusMizan";

const BCrumb = [
  {
    to: "/Veri",
    title: "Veri",
  },
  {
    to: "/Veri/DonusturulmusMizanVeriYukleme",
    title: "Dönüştürülmüş Mizan Veri Yükleme",
  },
];

const Page: React.FC = () => {
  const customizer = useSelector((state: AppState) => state.customizer);

  return (
    <PageContainer
      title="Dönüştürülmüş Mizan Veri Yükleme"
      description="this is Dönüştürülmüş Mizan Veri Yükleme"
    >
      <Breadcrumb title="Dönüştürülmüş Mizan Veri Yükleme" items={BCrumb} />
      <Grid container>
        <Grid item xs={12} lg={12}>
          <DonusturulmusMizan />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
