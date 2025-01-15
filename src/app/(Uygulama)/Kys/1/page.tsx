"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import Kys1Layout from "./Kys1Layout";

const Page = () => {
  return (
    <Kys1Layout>
      <PageContainer title="KYS-1" description="this is KYS-1">
        <Box>
          <TopCards title="KYS-1" />
        </Box>
      </PageContainer>
    </Kys1Layout>
  );
};

export default Page;
