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
    to: "/Enflasyon/FinansalTablolar",
    title: "Finansal Tablolar",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="Finansal Tablolar"
      description="this is Finansal Tablolar"
    >
      <Breadcrumb title="Finansal Tablolar" items={BCrumb} />

      <Box>
        <TopCards title="Finansal Tablolar" parenTitle="ENFLASYON"/>
      </Box>
    </PageContainer>
  );
};

export default Page;
