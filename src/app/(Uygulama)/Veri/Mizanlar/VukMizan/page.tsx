"use client";

import React, { useState } from "react";
import { Grid, useMediaQuery } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import VukMizanStepper from "@/app/(Uygulama)/components/Veri/VukMizan/VukMizanStepper";

const BCrumb = [
  {
    to: "/Veri",
    title: "Veri",
  },
  {
    to: "/Veri/Mizanlar",
    title: "Mizanlar",
  },
  {
    to: "/Veri/Mizanlar/VukMizan",
    title: "Vuk Mizan Oluşturma",
  },
];

const Page: React.FC = () => {
  return (
    <PageContainer
      title="Vuk Mizan Oluşturma"
      description="this is Vuk Mizan Oluşturma"
    >
      <Breadcrumb title="Vuk Mizan Oluşturma" items={BCrumb} />

      <Grid container spacing={3}>
        <Grid item xs={12} lg={12}>
          <VukMizanStepper />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
