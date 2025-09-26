"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React from "react";
import { Grid, useTheme } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import BagimsizDenetciRaporuStepper from "@/app/(Uygulama)/components/Rapor/BagimsizDenetciRaporu/BagimsizDenetciRaporuStepper";
import FaaliyetRaporuStepper from "../../components/GenelKurul/FaaliyetRaporu/FaaliyetRaporuStepper";

const BCrumb = [
  {
    to: "/GenelKurul",
    title: "Genel Kurul",
  },
  {
    to: "/GenelKurul/FaaliyetRaporu",
    title: "Faaliyet Raporu",
  },
];

const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  return (
    <PageContainer
      title="Faaliyet Raporu"
      description="this is Faaliyet Raporu"
    >
      <Breadcrumb title="Faaliyet Raporu" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12} lg={12}>
          <FaaliyetRaporuStepper />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
