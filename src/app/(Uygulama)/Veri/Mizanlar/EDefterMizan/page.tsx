"use client";

import React, { useState } from "react";
import { Grid, useMediaQuery } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import EDefterMizanStepper from "@/app/(Uygulama)/components/Veri/EDefterMizan/EDefterMizanStepper";

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
    to: "/Veri/Mizanlar/EDefterMizan",
    title: "E-Defter Mizan Oluşturma",
  },
];

const Page: React.FC = () => {
  return (
    <PageContainer
      title="E-Defter Mizan Oluşturma"
      description="this is E-Defter Mizan Oluşturma"
    >
      <Breadcrumb title="E-Defter Mizan Oluşturma" items={BCrumb} />

      <Grid container spacing={3}>
        <Grid item xs={12} lg={12}>
          <EDefterMizanStepper />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
