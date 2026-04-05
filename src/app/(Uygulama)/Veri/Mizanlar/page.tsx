"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import MizanlarLayout from "./MizanlarLayout";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";

const Page = () => {
  usePageTitle("Mizanlar");
  return (
    <MizanlarLayout>
      <PageContainer title="Mizanlar" description="this is Mizanlar">
        <Box>
          <TopCards title="Mizanlar" />
        </Box>
      </PageContainer>
    </MizanlarLayout>
  );
};

export default Page;
