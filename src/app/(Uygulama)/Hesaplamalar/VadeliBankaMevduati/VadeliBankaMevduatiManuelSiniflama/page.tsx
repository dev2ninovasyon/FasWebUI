"use client";

import React from "react";
import { Grid } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import VadeliBankaMevduatiManuelSiniflama from "./VadeliBankaMevduatiManuelSiniflama";

const BCrumb = [
  {
    to: "/Hesaplamalar",
    title: "Hesaplamalar",
  },
  {
    to: "/Hesaplamalar/VadeliBankaMevduati",
    title: "Vadeli Banka Mevduatı",
  },
  {
    to: "/Hesaplamalar/VadeliBankaMevduati/VadeliBankaMevduatiManuelSiniflama",
    title: "Vadeli Banka Mevduatı Manuel Sınıflama",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="Vadeli Banka Mevduatı Manuel Sınıflama"
      description="this is Vadeli Banka Mevduatı Manuel Sınıflama"
    >
      <Breadcrumb
        title="Vadeli Banka Mevduatı Manuel Sınıflama"
        items={BCrumb}
      />
      <Grid container>
        <Grid item xs={12} lg={12}>
          <VadeliBankaMevduatiManuelSiniflama />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
