"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import HileProsedurleriLayout from "./HileProsedurleriLayout";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";

const Page = () => {
  return (
    <HileProsedurleriLayout>
      <PageContainer
        title="Hile Prosedürleri"
        description="this is Hile Prosedürleri"
      >
        <Box>
          <TopCards title="Hile Prosedürleri" />
        </Box>
      </PageContainer>
    </HileProsedurleriLayout>
  );
};

export default Page;
