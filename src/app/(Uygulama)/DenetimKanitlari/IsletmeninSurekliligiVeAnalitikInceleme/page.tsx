"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import IsletmeninSurekliliğiVeAnalitikIncelemeLayout from "./IsletmeninSurekliliğiVeAnalitikIncelemeLayout";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";

const Page = () => {
  return (
    <IsletmeninSurekliliğiVeAnalitikIncelemeLayout>
      <PageContainer
        title="İşletmenin Sürekliliği ve Analitik İnceleme"
        description="this is İşletmenin Sürekliliği ve Analitik İnceleme"
      >
        <Box>
          <TopCards title="İşletmenin Sürekliliği ve Analitik İnceleme" />
        </Box>
      </PageContainer>
    </IsletmeninSurekliliğiVeAnalitikIncelemeLayout>
  );
};

export default Page;
