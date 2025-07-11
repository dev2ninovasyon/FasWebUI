"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React from "react";
import { Grid } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import YabanciParaHesapListesi from "./YabanciParaHesapListesi";

const BCrumb = [
  {
    to: "/Veri",
    title: "Veri",
  },
  {
    to: "/Veri/YabanciParaHesapListesiVeriYukleme",
    title: "Yabancı Para Hesap Listesi Veri Yükleme",
  },
];

const Page: React.FC = () => {
  const customizer = useSelector((state: AppState) => state.customizer);

  return (
    <PageContainer
      title="Yabancı Para Hesap Listesi Veri Yükleme"
      description="this is Yabancı Para Hesap Listesi Veri Yükleme"
    >
      <Breadcrumb
        title="Yabancı Para Hesap Listesi Veri Yükleme"
        items={BCrumb}
      />
      <Grid container>
        <Grid item xs={12} lg={12}>
          <YabanciParaHesapListesi />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
