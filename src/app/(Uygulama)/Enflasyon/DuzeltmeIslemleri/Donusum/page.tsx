"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React, { useEffect, useState } from "react";
import { Grid, CircularProgress, Box } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import ProtectedPage from "@/app/ProtectedPage";
import EnflasyonIframe from "@/app/(Uygulama)/components/Enflasyon/EnflasyonIframe";

const BCrumb = [
  {
    to: "/Enflasyon",
    title: "Enflasyon",
  },
  {
    to: "/Enflasyon/DuzeltmeIslemleri",
    title: "Düzeltme İşlemleri",
  },
  {
    to: "/Enflasyon/DuzeltmeIslemleri/Donusum",
    title: "Enflasyon Dönüşüm",
  },
];


const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const denetimTuruNormalized = (user.denetimTuru || "").trim().toLowerCase();
  const isBobi =
    denetimTuruNormalized.length > 0
      ? denetimTuruNormalized === "bobi"
      : !!user.bobimi;
  const enflasyonUrl = isBobi
    ? "/EnflasyonDuzeltmesi/DonusumBobi"
    : "/EnflasyonDuzeltmesi/Donusum";

  useEffect(() => {
    console.log("[Enflasyon/Donusum] denetimTuru:", user.denetimTuru);
    console.log("[Enflasyon/Donusum] bobimi:", user.bobimi);
    console.log("[Enflasyon/Donusum] selectedIframeUrl:", enflasyonUrl);
  }, [user.denetimTuru, user.bobimi, enflasyonUrl]);

  return (
    <ProtectedPage allowed={user?.enflasyonmu || false}>
      <PageContainer
        title="Enflasyon Dönüşüm"
        description="this is Enflasyon Dönüşüm"
      >
        <Breadcrumb title="Enflasyon Dönüşüm" items={BCrumb} />
        <Grid container spacing={3} sx={{ height: "calc(100vh - 225px)", overflow: "hidden" }}>
          <Grid
            size={{
              xs: 12,
              sm: 12,
              lg: 12
            }} sx={{ height: "100%", position: "relative", overflow: "hidden" }}>
            <EnflasyonIframe url={enflasyonUrl} />
          </Grid>
        </Grid>
      </PageContainer>
    </ProtectedPage>
  );
};

export default Page;

