"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import VeriLayout from "./VeriLayout";

const Page = () => {
  return (
    <VeriLayout>
      <PageContainer title="Veri" description="this is Veri">
        <Box>
          <TopCards title="VERİ" />
        </Box>
      </PageContainer>
    </VeriLayout>
  );
};

export default Page;
