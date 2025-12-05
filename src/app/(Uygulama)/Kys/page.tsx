"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import KysLayout from "./KysLayout";

const Page = () => {
  return (
    <KysLayout>
      <PageContainer title="KYS" description="this is KYS">
        <Box>
          <TopCards title="KYS" />
        </Box>
      </PageContainer>
    </KysLayout>
  );
};

export default Page;
