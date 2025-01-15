"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import DonusumLayout from "./DonusumLayout";

const Page = () => {
  return (
    <DonusumLayout>
      <PageContainer title="Veri" description="this is Veri">
        <Box>
          <TopCards title="DÖNÜŞÜM" />
        </Box>
      </PageContainer>
    </DonusumLayout>
  );
};

export default Page;
