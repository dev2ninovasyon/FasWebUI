"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import DenetimDosyaLayout from "./DenetimDosyaLayout";

const Page = () => {
  return (
    <DenetimDosyaLayout>
      <PageContainer title="Denetim Dosya" description="this is Denetim Dosya">
        <Box>
          <TopCards title="DENETİM DOSYA" />
        </Box>
      </PageContainer>
    </DenetimDosyaLayout>
  );
};

export default Page;
