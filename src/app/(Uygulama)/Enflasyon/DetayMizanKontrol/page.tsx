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
    to: "/Enflasyon/DetayMizanKontrol",
    title: "Dönüşüm Mizan Kontrol",
  },
];


const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  return (
    <ProtectedPage allowed={user?.enflasyonmu || false}>
      <PageContainer
        title="Dönüşüm Mizan Kontrol"
        description="this is Dönüşüm Mizan Kontrol"
      >
        <Breadcrumb title="Dönüşüm Mizan Kontrol" items={BCrumb} />
        <Box sx={{
          width: "calc(100% + 16px)",
          marginLeft: "-16px",
          marginRight: "-16px",
          height: 'calc(100vh - 225px)',
          overflow: 'hidden'
        }}>
          <Grid container spacing={0} sx={{ height: '100%', overflow: 'hidden' }}>
            <Grid
              size={{
                xs: 12,
                sm: 12,
                lg: 12
              }} sx={{ height: "100%", position: "relative", overflow: "hidden" }}
            >
              <EnflasyonIframe url="/EnflasyonDuzeltmesi/DetayMizanKontrol" />
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
    </ProtectedPage>
  );
};

export default Page;
