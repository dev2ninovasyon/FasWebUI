"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React from "react";
import { Grid, useTheme } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "react-redux";

const BCrumb = [
  {
    to: "/Enflasyon",
    title: "Enflasyon",
  },
  {
    to: "/Enflasyon/MaddiVeMaddiOlmayanDuranVarliklar",
    title: "Maddi Ve Maddi Olmayan Duran Varlıklar",
  },
];

const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  return (
    <PageContainer
      title="Maddi Ve Maddi Olmayan Duran Varlıklar"
      description="this is Maddi Ve Maddi Olmayan Duran Varlıklar"
    >
      <Breadcrumb
        title="Maddi Ve Maddi Olmayan Duran Varlıklar"
        items={BCrumb}
      />
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12} lg={12}>
          <iframe
            src={`https://93.89.73.135/EnflasyonDuzeltmesi/MaddiVeMaddiOlmayanDuranVarliklarEnflasyonDuzeltmesi?username=${user.kullaniciAdi}&denetciId=${user.denetciId}&kullaniciId=${user.id}&denetlenenId=${user.denetlenenId}&yil=${user.yil}`}
            style={{
              border: "0px",
              width: "100%",
              height: 700,
            }}
          ></iframe>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
