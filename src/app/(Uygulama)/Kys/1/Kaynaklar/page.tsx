"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";

import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import KaynaklarLayout from "./KaynaklarLayout";

const Page = () => {
  return (
    <KaynaklarLayout>
      <PageContainer title="Kaynaklar" description="this is Kaynaklar">
        <Box>
          <TopCards title="Kaynaklar" />
        </Box>
      </PageContainer>
    </KaynaklarLayout>
  );
};

export default Page;
