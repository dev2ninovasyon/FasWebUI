"use client";

import React from "react";
import { Grid } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import DonusumMizanKontrol from "@/app/(Uygulama)/components/DenetimKanitlari/DonusumMizanKontrol/DonusumMizanKontrol";
import DonusumMizanKontrolCardTable from "@/app/(Uygulama)/components/DenetimKanitlari/DonusumMizanKontrol/DonusumMizanKontrolCardTable";
import ProtectedPage from "@/app/ProtectedPage";

const BCrumb = [
  {
    to: "/Konsolidasyon",
    title: "Konsolidasyon",
  },
  {
    to: "/Konsolidasyon/DonusumMizanKontrol",
    title: "Dönüşüm Mizan Kontrol",
  },
];

const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  return (
    <ProtectedPage allowed={user?.konsolidemi || false}>
      <PageContainer
        title="Dönüşüm Mizan Kontrol"
        description="this is Dönüşüm Mizan Kontrol"
      >
        <Breadcrumb title="Dönüşüm Mizan Kontrol" items={BCrumb} />

        <Grid container>
          <Grid item xs={12} lg={12}>
            <DonusumMizanKontrolCardTable konsolidasyonMu={true} />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12} lg={12}>
            <DonusumMizanKontrol konsolidasyonMu={true} />
          </Grid>
        </Grid>
      </PageContainer>
    </ProtectedPage>
  );
};

export default Page;
