"use client";

import React from "react";
import { Box } from "@mui/material";

import MizanKontrolLayout from "./MizanKontrolLayout";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";

const Page = () => {
  return (
    <MizanKontrolLayout>
      <PageContainer title="Mizan Kontrol" description="this is Mizan Kontrol">
        <Box>
          <TopCards title="Mizan Kontrol" />
        </Box>
      </PageContainer>
    </MizanKontrolLayout>
  );
};

export default Page;
