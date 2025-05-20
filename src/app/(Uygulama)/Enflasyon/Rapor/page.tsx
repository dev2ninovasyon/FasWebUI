"use client";

import React from "react";
import { Box } from "@mui/material";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/Enflasyon",
    title: "Enflasyon",
  },
  {
    to: "/Enflasyon/Rapor",
    title: "Rapor",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="Rapor"
      description="this is Rapor"
    >
      <Breadcrumb title="Rapor" items={BCrumb} />

      <Box>
        <TopCards title="Rapor" />
      </Box>
    </PageContainer>
  );
};

export default Page;
