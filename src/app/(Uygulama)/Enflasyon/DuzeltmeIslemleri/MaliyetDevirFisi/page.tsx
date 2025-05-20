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
    to: "/Enflasyon/DuzeltmeIslemleri",
    title: "Düzeltme İşlemleri",
  },
  {
    to: "/Enflasyon/DuzeltmeIslemleri/MaliyetDevirFisi",
    title: "Maliyet Devir Fişi",
  },
];

const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  return (
    <PageContainer title="Maliyet Devir Fişi" description="this is Maliyet Devir Fişi">
      <Breadcrumb title="Maliyet Devir Fişi" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12} lg={12}>
          <iframe
            src={`https://93.89.73.135//EnflasyonDuzeltmesi/EnflasyonMuhasebesiTasimaFisi?username=${user.kullaniciAdi}&denetciId=${user.denetciId}&kullaniciId=${user.id}&denetlenenId=${user.denetlenenId}&yil=${user.yil}`}
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
