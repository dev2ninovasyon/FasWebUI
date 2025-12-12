"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
const BCrumb = [
  { to: "/Kys", title: "KYS" },
];

const Page = () => {
  return (
    <PageContainer
      title="2. Risk Değerlendirme Süreci"
      description="Risk Değerlendirme Süreci"
    >
      <Breadcrumb title="2.Risk Değerlendirme Süreci" items={BCrumb} />
      <Box>
        <TopCards title="2. Risk Değerlendirme Süreci" />
      </Box>
    </PageContainer>
  );
};

export default Page;
