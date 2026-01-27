"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import RaporLayout from "./RaporLayout";

const Page = () => {
  return (
    <RaporLayout>
      <PageContainer title="Rapor" description="this is Rapor">
        <Box>
          <TopCards title="RAPOR" />
        </Box>
      </PageContainer>
    </RaporLayout>
  );
};

export default Page;
