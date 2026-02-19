"use client";

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
    to: "/Enflasyon/MaddiVeMaddiOlmayanDuranVarliklar",
    title: "Maddi Ve Maddi Olmayan Duran Varlıklar",
  },
];


const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  return (
    <ProtectedPage allowed={user?.enflasyonmu || false}>
      <PageContainer
        title="Maddi Ve Maddi Olmayan Duran Varlıklar"
        description="this is Maddi Ve Maddi Olmayan Duran Varlıklar"
      >
        <Breadcrumb title="Maddi Ve Maddi Olmayan Duran Varlıklar"
          items={BCrumb}>
        <EkBelgeYukleButton formKodu="MaddiVeMaddiOlmayanVarliklarEnflasyonDuzeltmesi" />
      </Breadcrumb>
        <Grid container spacing={3} sx={{ height: "calc(100vh - 225px)", overflow: "hidden" }}>
          <Grid
            size={{
              xs: 12,
              sm: 12,
              lg: 12
            }} sx={{ height: "100%", position: "relative", overflow: "hidden" }}>
            <EnflasyonIframe url="/EnflasyonDuzeltmesi/MaddiVeMaddiOlmayanDuranVarliklarEnflasyonDuzeltmesiV3" />
          </Grid>
        </Grid>
      </PageContainer>
    </ProtectedPage>
  );
};

export default Page;

