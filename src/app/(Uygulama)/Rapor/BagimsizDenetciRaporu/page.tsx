"use client";
import Script from "next/script";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React from "react";
import { Box, Grid, useTheme } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import BagimsizDenetciRaporuStepper from "@/app/(Uygulama)/components/Rapor/BagimsizDenetciRaporu/BagimsizDenetciRaporuStepper";

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
      <Box className="no-print">
        <Breadcrumb title="Bağımsız Denetçi Raporu" items={BCrumb} />
      </Box>
      <Grid container spacing={3}>
        <Grid
          size={{
            xs: 12,
            sm: 12,
            lg: 12
          }}>
          <Script
            src="/libs/html-docx.js"
            strategy="afterInteractive"
            onLoad={() => {
              console.log("html-docx-js yüklendi", window.htmlDocx);
            }}
          />
          <BagimsizDenetciRaporuStepper />
        </Grid>
      </Grid>
      <style jsx global>{`
        @media print {
          .no-print, 
          header, 
          footer, 
          nav, 
          aside, 
          .MuiDrawer-root,
          .MuiAppBar-root,
          .left-sidebar,
          .topbar,
          #main-wrapper > header,
          #main-wrapper > aside {
            display: none !important;
          }
          body {
            background-color: white !important;
          }
          .MuiContainer-root {
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
          }
        }
      `}</style>
    </PageContainer>
  );
};

export default Page;
