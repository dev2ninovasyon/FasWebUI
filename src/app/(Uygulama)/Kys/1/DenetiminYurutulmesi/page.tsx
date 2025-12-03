"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";

const Page = () => {
  return (
    <PageContainer
      title="6. Denetimin Yürütülmesi"
      description="Denetimin Yürütülmesi"
    >
      <Box>
        <TopCards title="6. Denetimin Yürütülmesi" />
      </Box>
    </PageContainer>
  );
};

export default Page;
