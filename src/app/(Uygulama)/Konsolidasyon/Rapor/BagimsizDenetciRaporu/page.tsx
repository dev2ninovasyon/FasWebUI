"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React from "react";
import { Grid, useTheme } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import BagimsizDenetciRaporuStepper from "@/app/(Uygulama)/components/Rapor/BagimsizDenetciRaporu/BagimsizDenetciRaporuStepper";
import ProtectedPage from "@/app/ProtectedPage";

const BCrumb = [
  {
    to: "/Rapor",
    title: "Rapor",
  },
  {
    to: "/Rapor/BagimsizDenetciRaporu",
    title: "Bağımsız Denetçi Raporu",
  },
];

const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  return (
    <PageContainer
      title="Bağımsız Denetçi Raporu"
      description="this is Bağımsız Denetçi Raporu"
    >
      <Breadcrumb title="Bağımsız Denetçi Raporu" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12} lg={12}>
          <BagimsizDenetciRaporuStepper />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
