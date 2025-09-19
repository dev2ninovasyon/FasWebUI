"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React from "react";
import { Grid, useTheme } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import ProtectedPage from "@/app/ProtectedPage";

const BCrumb = [
  {
    to: "/Konsolidasyon",
    title: "Konsolidasyon",
  },
  {
    to: "/Konsolidasyon/Asamalar",
    title: "Aşamalar",
  },
];

const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const theme = useTheme();

  return (
    <ProtectedPage allowed={user?.konsolidemi || false}>
      <PageContainer title="Aşamalar" description="this is Aşamalar">
        <Breadcrumb title="Aşamalar" items={BCrumb} />
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12} lg={12}>
            <iframe
              //src={`${url}/Konsolidasyon/Asamalar`}
              src={`/templates/KonsolidasyonAsamalar.html`}
              style={{
                background: theme.palette.common.white,
                border: "0px",
                width: "100%",
                height: 700,
              }}
            ></iframe>
          </Grid>
        </Grid>
      </PageContainer>
    </ProtectedPage>
  );
};

export default Page;
