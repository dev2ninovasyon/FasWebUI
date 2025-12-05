"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";

const Page = () => {
  return (
    <PageContainer
      title="7. Kaynaklar"
      description="Kaynaklar"
    >
      <Box>
        <TopCards title="7. Kaynaklar" />
      </Box>
    </PageContainer>
  );
};

export default Page;
