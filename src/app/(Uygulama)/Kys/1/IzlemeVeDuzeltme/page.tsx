"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/Kys",
    title: "KYS",
  },
  {
    to: "/Kys/1",
    title: "KYS-1",
  },
  {
    to: "/Kys/1/IzlemeVeDuzeltme",
    title: "İzleme ve Düzeltme",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="9. İzleme ve Düzeltme Süreci"
      description="İzleme ve Düzeltme Süreci"
    >
      <Breadcrumb title="İzleme ve Düzeltme" items={BCrumb} />
      <Box>
        <TopCards title="9. İzleme ve Düzeltme Süreci" />
      </Box>
    </PageContainer>
  );
};

export default Page;
