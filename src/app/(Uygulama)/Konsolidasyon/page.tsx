"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import KonsolidasyonLayout from "./KonsolidasyonLayout";

const Page = () => {
  usePageTitle("Konsolidasyon");
  return (
    <KonsolidasyonLayout>
      <PageContainer title="Konsolidasyon" description="this is Konsolidasyon">
        <Box>
          <TopCards title="KONSOLİDASYON" />
        </Box>
      </PageContainer>
    </KonsolidasyonLayout>
  );
};

export default Page;
