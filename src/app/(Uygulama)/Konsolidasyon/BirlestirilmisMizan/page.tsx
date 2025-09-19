"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React from "react";
import { Grid, useTheme } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import ProtectedPage from "@/app/ProtectedPage";
import BirlestirilmisMizan from "@/app/(Uygulama)/components/Konsolidasyon/BirlestirilmisMizan";

const BCrumb = [
  {
    to: "/Konsolidasyon",
    title: "Konsolidasyon",
  },
  {
    to: "/Konsolidasyon/BirlestirilmisMizan",
    title: "Birleştirilmiş Mizan",
  },
];

const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const theme = useTheme();

  return (
    <ProtectedPage allowed={user?.konsolidemi || false}>
      <PageContainer
        title="Birleştirilmiş Mizan"
        description="this is Birleştirilmiş Mizan"
      >
        <Breadcrumb title="Birleştirilmiş Mizan" items={BCrumb} />
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <BirlestirilmisMizan />
          </Grid>
        </Grid>
      </PageContainer>
    </ProtectedPage>
  );
};

export default Page;
