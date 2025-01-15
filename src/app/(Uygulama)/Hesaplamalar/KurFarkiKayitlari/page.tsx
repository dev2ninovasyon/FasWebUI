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
    to: "/Hesaplamalar/KurFarkiKayitlari",
    title: "Kur Farkı Kayıtları",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="Kur Farkı Kayıtları"
      description="this is Kur Farkı Kayıtları"
    >
      <Breadcrumb title="Kur Farkı Kayıtları" items={BCrumb} />

      <Box>
        <TopCards title="Kur Farkı Kayıtları" />
      </Box>
    </PageContainer>
  );
};

export default Page;
