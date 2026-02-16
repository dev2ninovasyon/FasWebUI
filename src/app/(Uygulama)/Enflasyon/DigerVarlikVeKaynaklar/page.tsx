"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React, { useState } from "react";
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
    to: "/Enflasyon/DigerVarlikVeKaynaklar",
    title: "Diğer Varlık Ve Kaynaklar Enflasyon Düzeltmesi",
  },
];


const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  return (
    <ProtectedPage allowed={user?.enflasyonmu || false}>
      <PageContainer
        title="Diğer Varlık Ve Kaynaklar Enflasyon Düzeltmesi"
        description="this is Diğer Varlık Ve Kaynaklar Enflasyon Düzeltmesi"
      >
        <Breadcrumb
          title="Diğer Varlık Ve Kaynaklar Enflasyon Düzeltmesi"
          items={BCrumb}
        />
        <Grid container spacing={3} sx={{ height: "calc(100vh - 225px)", overflow: "hidden" }}>
          <Grid
            size={{
              xs: 12,
              sm: 12,
              lg: 12
            }} sx={{ height: "100%", position: "relative" }}>
            <EnflasyonIframe url="/EnflasyonDuzeltmesi/DigerVarlikVeKaynaklarEnflasyonDuzeltmesi" />
          </Grid>
        </Grid>
      </PageContainer>
    </ProtectedPage>
  );
};

export default Page;

