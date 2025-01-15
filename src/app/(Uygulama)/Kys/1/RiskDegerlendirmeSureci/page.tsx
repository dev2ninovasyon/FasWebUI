"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import RiskDegerlendirmeSureciLayout from "./RiskDegerlendirmeSureciLayout";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";

const Page = () => {
  return (
    <RiskDegerlendirmeSureciLayout>
      <PageContainer
        title="Risk Değerlendirme Süreci"
        description="this is Risk Değerlendirme Süreci"
      >
        <Box>
          <TopCards title="Risk Değerlendirme Süreci" />
        </Box>
      </PageContainer>
    </RiskDegerlendirmeSureciLayout>
  );
};

export default Page;
