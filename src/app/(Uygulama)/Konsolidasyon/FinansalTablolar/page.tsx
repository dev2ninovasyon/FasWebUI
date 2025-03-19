"use client";

import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";

const BCrumb = [
  {
    to: "/Konsolidasyon",
    title: "Konsolidasyon",
  },
  {
    to: "/Konsolidasyon/FinansalTablolar",
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
        <TopCards parenTitle="KONSOLİDASYON" title="Finansal Tablolar" />
      </Box>
    </PageContainer>
  );
};

export default Page;
