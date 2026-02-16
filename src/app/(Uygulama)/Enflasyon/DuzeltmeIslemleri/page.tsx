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
    to: "/Enflasyon/DuzeltmeIslemleri",
    title: "Düzeltme İşlemleri",
  },
];

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  return (
    <ProtectedPage allowed={user?.enflasyonmu || false}>
      <PageContainer
        title="Düzeltme İşlemleri"
        description="this is Düzeltme İşlemleri"
      >
        <Breadcrumb title="Düzeltme İşlemleri" items={BCrumb} />

        <Box>
          <TopCards title="Düzeltme İşlemleri" />
        </Box>
      </PageContainer>
    </ProtectedPage>
  );
};

export default Page;
