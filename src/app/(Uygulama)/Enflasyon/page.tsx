"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import EnflasyonLayout from "./EnflasyonLayout";

const Page = () => {
  return (
    <EnflasyonLayout>
      <PageContainer title="Enflasyon" description="this is Enflasyon">
        <Box>
          <TopCards title="ENFLASYON" />
        </Box>
      </PageContainer>
    </EnflasyonLayout>
  );
};

export default Page;
