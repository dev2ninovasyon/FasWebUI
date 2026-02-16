"use client";

import React from "react";
import { Box } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ProtectedPage from "@/app/ProtectedPage";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

const BCrumb = [
  {
    to: "/Enflasyon",
    title: "Enflasyon",
  },
  {
    to: "/Enflasyon/Rapor",
    title: "Rapor",
  },
];

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  return (
    <ProtectedPage allowed={user?.enflasyonmu || false}>
      <PageContainer title="Rapor" description="this is Rapor">
        <Breadcrumb title="Rapor" items={BCrumb} />

        <Box>
          <TopCards title="Rapor" />
        </Box>
      </PageContainer>
    </ProtectedPage>
  );
};

export default Page;
