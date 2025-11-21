"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import SurdurulebilirlikLayout from "./SurdurulebilirlikLayout";

const Page = () => {
  return (
    <SurdurulebilirlikLayout>
      <PageContainer title="SÜRDÜRÜLEBİLİRLİK" description="this is Sürdürülebilirlik">
        <Box>
          <TopCards title="SÜRDÜRÜLEBİLİRLİK" />
        </Box>
      </PageContainer>
    </SurdurulebilirlikLayout>
  );
};

export default Page;
