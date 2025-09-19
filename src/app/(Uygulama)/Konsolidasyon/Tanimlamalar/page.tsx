"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React from "react";
import { Grid, useTheme } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import ProtectedPage from "@/app/ProtectedPage";
import TanimlamalarTable from "@/app/(Uygulama)/components/Konsolidasyon/TanimlamalarTable";
import ParentCard from "../../components/Layout/Shared/ParentCard/ParentCard";

const BCrumb = [
  {
    to: "/Konsolidasyon",
    title: "Konsolidasyon",
  },
  {
    to: "/Konsolidasyon/Tanimlamalar",
    title: "Tanımlamalar",
  },
];

const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const theme = useTheme();

  return (
    <ProtectedPage allowed={user?.konsolidemi || false}>
      <PageContainer title="Tanımlamalar" description="this is Tanımlamalar">
        <Breadcrumb title="Tanımlamalar" items={BCrumb} />
        <ParentCard title="Konsolidasyon Tanımlamalar">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TanimlamalarTable />
            </Grid>
          </Grid>
        </ParentCard>
      </PageContainer>
    </ProtectedPage>
  );
};

export default Page;
