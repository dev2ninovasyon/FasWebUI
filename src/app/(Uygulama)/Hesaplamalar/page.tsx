"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import HesaplamalarLayout from "./HesaplamalarLayout";

const Page = () => {
  return (
    <HesaplamalarLayout>
      <PageContainer title="Hesaplamalar" description="this is Hesaplamalar">
        <Box>
          <TopCards title="HESAPLAMALAR" />
        </Box>
      </PageContainer>
    </HesaplamalarLayout>
  );
};

export default Page;
