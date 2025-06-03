"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import MutabakatLayout from "./MutabakatLayout";

const Page = () => {
  return (
    <MutabakatLayout>
      <PageContainer title="Mutabakat" description="this is Mutabakat">
        <Box>
          <TopCards title="Mutabakat" />
        </Box>
      </PageContainer>
    </MutabakatLayout>
  );
};

export default Page;
