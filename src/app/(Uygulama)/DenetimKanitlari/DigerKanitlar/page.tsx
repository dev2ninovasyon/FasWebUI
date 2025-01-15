"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import DigerKanitlarLayout from "./DigerKanitlarLayout";

const Page = () => {
  return (
    <DigerKanitlarLayout>
      <PageContainer
        title="Diğer Kanıtlar"
        description="this is Diğer Kanıtlar"
      >
        <Box>
          <TopCards title="Diğer Kanıtlar" />
        </Box>
      </PageContainer>
    </DigerKanitlarLayout>
  );
};

export default Page;
