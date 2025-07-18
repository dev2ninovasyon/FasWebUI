"use client";

import React from "react";
import { Grid } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import NakitAkisTablosu from "@/app/(Uygulama)/components/DenetimKanitlari/FinansalTablolar/NakitAkisTablosu";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import ProtectedPage from "@/app/ProtectedPage";

const BCrumb = [
  {
    to: "/Konsolidasyon",
    title: "Konsolidasyon",
  },
  {
    to: "/Konsolidasyon/FinansalTablolar",
    title: "Finansal Tablolar",
  },
  {
    to: "/Konsolidasyon/FinansalTablolar/NakitAkisTablosu",
    title: "Nakit Akış Tablosu",
  },
];

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  return (
    <ProtectedPage allowed={user?.konsolidemi || false}>
      <PageContainer
        title="Nakit Akış Tablosu"
        description="this is Nakit Akış Tablosu"
      >
        <Breadcrumb title="Nakit Akış Tablosu" items={BCrumb} />
        <Grid container>
          <Grid item xs={12} lg={12}>
            <NakitAkisTablosu />
          </Grid>
        </Grid>
      </PageContainer>
    </ProtectedPage>
  );
};

export default Page;
