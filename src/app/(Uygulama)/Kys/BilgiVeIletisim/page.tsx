"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";

const Page = () => {
  return (
    <PageContainer
      title="8. Bilgi ve İletişim"
      description="Bilgi ve İletişim"
    >
      <Box>
        <TopCards title="8. Bilgi ve İletişim" />
      </Box>
    </PageContainer>
  );
};

export default Page;
