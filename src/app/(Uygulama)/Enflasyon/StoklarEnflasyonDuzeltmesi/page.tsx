"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React, { useState } from "react";
import { Grid, CircularProgress, Box } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import ProtectedPage from "@/app/ProtectedPage";
import EnflasyonIframe from "@/app/(Uygulama)/components/Enflasyon/EnflasyonIframe";

import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
const BCrumb = [
  {
    to: "/Enflasyon",
    title: "Enflasyon",
  },
  {
    to: "/Enflasyon/StoklarEnflasyonDuzeltmesi",
    title: "Stoklar Enflasyon Düzeltmesi",
  },
];


const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  return (
    <ProtectedPage allowed={user?.enflasyonmu || false}>
      <PageContainer
        title="Stoklar Enflasyon Düzeltmesi"
        description="this is Stoklar Enflasyon Düzeltmesi"
      >
        <Breadcrumb title="Stoklar Enflasyon Düzeltmesi" items={BCrumb}>
        <EkBelgeYukleButton formKodu="StoklarEnflasyonDuzeltmesi" />
      </Breadcrumb>
        <Grid container spacing={3} sx={{ height: "calc(100vh - 225px)", overflow: "hidden" }}>
          <Grid
            size={{
              xs: 12,
              sm: 12,
              lg: 12
            }} sx={{ height: "100%", position: "relative", overflow: "hidden" }}>
            <EnflasyonIframe url="/EnflasyonDuzeltmesi/FinansmanMaliyeti" />
          </Grid>
        </Grid>
      </PageContainer>
    </ProtectedPage>
  );
};

export default Page;

