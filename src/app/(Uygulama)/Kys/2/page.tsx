"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import Kys2Layout from "./Kys2Layout";

const Page = () => {
  return (
    <Kys2Layout>
      <PageContainer title="KYS-2" description="this is KYS-2">
        <Box>
          <TopCards title="KYS-2" />
        </Box>
      </PageContainer>
    </Kys2Layout>
  );
};

export default Page;
