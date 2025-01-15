"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import SozlesmeLayout from "./SozlesmeLayout";

const Page = () => {
  return (
    <SozlesmeLayout>
      <PageContainer title="Sözleşme" description="this is Sözleşme">
        <Box>
          <TopCards title="SÖZLEŞME" />
        </Box>
      </PageContainer>
    </SozlesmeLayout>
  );
};

export default Page;
