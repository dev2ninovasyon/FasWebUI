"use client";

import React from "react";
import { Box } from "@mui/material";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/Hesaplamalar",
    title: "Hesaplamalar",
  },
  {
    to: "/Hesaplamalar/VadeliBankaMevduati",
    title: "Vadeli Banka Mevduatı",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="Vadeli Banka Mevduatı"
      description="this is Vadeli Banka Mevduatı"
    >
      <Breadcrumb title="Vadeli Banka Mevduatı" items={BCrumb} />

      <Box>
        <TopCards title="Vadeli Banka Mevduatı" />
      </Box>
    </PageContainer>
  );
};

export default Page;
