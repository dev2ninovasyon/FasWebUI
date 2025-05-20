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
    to: "/Enflasyon/NetParasalPozisyon",
    title: "Net Parasal Pozisyon",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="Net Parasal Pozisyon"
      description="this is Net Parasal Pozisyon"
    >
      <Breadcrumb title="Net Parasal Pozisyon" items={BCrumb} />

      <Box>
        <TopCards title="Net Parasal Pozisyon" />
      </Box>
    </PageContainer>
  );
};

export default Page;
