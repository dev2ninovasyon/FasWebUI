"use client";

import React from "react";
import { Grid } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import DonusumMizanKontrol from "@/app/(Uygulama)/components/DenetimKanitlari/DonusumMizanKontrol/DonusumMizanKontrol";
import DonusumMizanKontrolCardTable from "@/app/(Uygulama)/components/DenetimKanitlari/DonusumMizanKontrol/DonusumMizanKontrolCardTable";
// Ek import:
import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton"

const BCrumb = [
  {
    to: "/DenetimKanitlari",
    title: "Denetim Kanıtları",
  },
  {
    to: "/DenetimKanitlari/MizanKontrol",
    title: "Mizan Kontrol",
  },
  {
    to: "/DenetimKanitlari/MizanKontrol/DonusumMizanKontrol",
    title: "Dönüşüm Mizan Kontrol",
  },
];

const Page: React.FC = () => {
  const customizer = useSelector((state: AppState) => state.customizer);

  return (
    <PageContainer
      title="Dönüşüm Mizan Kontrol"
      description="this is Dönüşüm Mizan Kontrol"
    >
      <Breadcrumb title="Dönüşüm Mizan Kontrol" items={BCrumb}>
        <>
          <EkBelgeYukleButton
            formKodu="DonusumMizan"
            fullWidth={false}           // sağda küçük buton
            text="Belge Yükle"
          />
        </>
      </Breadcrumb>
      <Grid container>
        <Grid
          size={{
            xs: 12,
            lg: 12
          }}>
          <DonusumMizanKontrolCardTable konsolidasyonMu={false} />
        </Grid>
      </Grid>
      <Grid container>
        <Grid
          size={{
            xs: 12,
            lg: 12
          }}>
          <DonusumMizanKontrol konsolidasyonMu={false} />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
