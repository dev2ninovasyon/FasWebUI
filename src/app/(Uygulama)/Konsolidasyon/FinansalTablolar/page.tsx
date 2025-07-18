"use client";

import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import ProtectedPage from "@/app/ProtectedPage";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

const BCrumb = [
  {
    to: "/Konsolidasyon",
    title: "Konsolidasyon",
  },
  {
    to: "/Konsolidasyon/FinansalTablolar",
    title: "Finansal Tablolar",
  },
];

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  return (
    <ProtectedPage allowed={user?.konsolidemi || false}>
      <PageContainer
        title="Finansal Tablolar"
        description="this is Finansal Tablolar"
      >
        <Breadcrumb title="Finansal Tablolar" items={BCrumb} />
        <Box>
          <TopCards parenTitle="KONSOLİDASYON" title="Finansal Tablolar" />
        </Box>
      </PageContainer>
    </ProtectedPage>
  );
};

export default Page;
