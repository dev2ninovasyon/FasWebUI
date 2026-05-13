"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React from "react";
import { Grid } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import ProtectedPage from "@/app/ProtectedPage";
import EnflasyonIframe from "@/app/(Uygulama)/components/Enflasyon/EnflasyonIframe";
import KgkExcelButton from "@/app/(Uygulama)/components/DenetimKanitlari/FinansalTablolar/KgkExcelButton";

const BCrumb = [
  {
    to: "/Enflasyon",
    title: "Enflasyon",
  },
  {
    to: "/Enflasyon/FinansalTablolar",
    title: "Finansal Tablolar",
  },
  {
    to: "/Enflasyon/FinansalTablolar/FinansalDurumTablosu",
    title: "Finansal Durum Tablosu",
  },
];


const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  return (
    <ProtectedPage allowed={user?.enflasyonmu || false}>
      <PageContainer
        title="Finansal Durum Tablosu"
        description="this is Finansal Durum Tablosu"
      >
        <Breadcrumb title="Finansal Durum Tablosu" items={BCrumb}>
          <KgkExcelButton tabloTuru="finansaldurum" konsolidasyonMu={false} />
        </Breadcrumb>
        <Grid container spacing={3} sx={{ height: "calc(100vh - 225px)", overflow: "hidden" }}>
          <Grid
            size={{
              xs: 12,
              sm: 12,
              lg: 12
            }} sx={{ height: "100%", position: "relative", overflow: "hidden" }}>
            <EnflasyonIframe url={user.bobimi ? "/EnflasyonDuzeltmesi/BilancoTablosu" : "/EnflasyonDuzeltmesi/BilancoTablosuTfrs"} />
          </Grid>
        </Grid>
      </PageContainer>
    </ProtectedPage>
  );
};

export default Page;
