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
      title="9. İzleme ve Düzeltme Süreci"
      description="İzleme ve Düzeltme Süreci"
    >
      <Breadcrumb title="İzleme ve Düzeltme Süreci" items={BCrumb} />
      <Box>
        <TopCards title="9. İzleme ve Düzeltme Süreci" />
      </Box>
    </PageContainer>
  );
};

export default Page;
