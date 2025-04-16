"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import OnemlilikLayout from "./OnemlilikLayout";

const Page = () => {
  return (
    <OnemlilikLayout>
      <PageContainer title="Önemlilik" description="this is Önemlilik">
        <Box>
          <TopCards title="Önemlilik" />
        </Box>
      </PageContainer>
    </OnemlilikLayout>
  );
};

export default Page;
