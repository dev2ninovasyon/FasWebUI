"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import DenetimPlanindaOnemlilikLayout from "./DenetimPlanindaOnemlilikLayout";

const Page = () => {
  return (
    <DenetimPlanindaOnemlilikLayout>
      <PageContainer
        title="Denetim Planında Önemlilik"
        description="this is Denetim Planında Önemlilik"
      >
        <Box>
          <TopCards title="Denetim Planında Önemlilik" />
        </Box>
      </PageContainer>
    </DenetimPlanindaOnemlilikLayout>
  );
};

export default Page;
