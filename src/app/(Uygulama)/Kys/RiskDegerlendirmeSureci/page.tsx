"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";

const Page = () => {
  return (
    <PageContainer
      title="2. Risk Değerlendirme Süreci"
      description="Risk Değerlendirme Süreci"
    >
      <Box>
        <TopCards title="2. Risk Değerlendirme Süreci" />
      </Box>
    </PageContainer>
  );
};

export default Page;
