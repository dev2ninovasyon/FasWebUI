"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";

const Page = () => {
  return (
    <PageContainer
      title="9. İzleme ve Düzeltme Süreci"
      description="İzleme ve Düzeltme Süreci"
    >
      <Box>
        <TopCards title="9. İzleme ve Düzeltme Süreci" />
      </Box>
    </PageContainer>
  );
};

export default Page;
