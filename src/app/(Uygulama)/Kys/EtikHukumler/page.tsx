"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";

const Page = () => {
  return (
    <PageContainer
      title="4. Etik Hükümler"
      description="Etik Hükümler"
    >
      <Box>
        <TopCards title="4. Etik Hükümler" />
      </Box>
    </PageContainer>
  );
};

export default Page;
