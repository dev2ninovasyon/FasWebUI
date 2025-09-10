"use client";

import React from "react";
import { Grid } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import FisIslemSayilari from "@/app/(Uygulama)/components/DenetimKanitlari/Onemlilik/FisIslemSayilari";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import BelgeKontrolCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCard";

const BCrumb = [
  {
    to: "/DenetimKanitlari",
    title: "Denetim Kanıtları",
  },
  {
    to: "/DenetimKanitlari/Onemlilik",
    title: "Önemlilik",
  },
  {
    to: "/DenetimKanitlari/Onemlilik/FisIslemSayilari",
    title: "Fiş İşlem Sayıları",
  },
];

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const controller = "FisIslemSayilari";

  return (
    <PageContainer
      title="Fiş İşlem Sayıları"
      description="this is Fiş İşlem Sayıları"
    >
      <Breadcrumb title="Fiş İşlem Sayıları" items={BCrumb} />
      <Grid container>
        <Grid item xs={12} lg={12}>
          <FisIslemSayilari />
        </Grid>
        <Grid item xs={12} lg={12}>
          {user.rol?.includes("KaliteKontrolSorumluDenetci") ||
          user.rol?.includes("SorumluDenetci") ||
          user.rol?.includes("Denetci") ||
          user.rol?.includes("DenetciYardimcisi") ? (
            <Grid
              container
              sx={{
                width: "100%",
                margin: "0 auto",
                justifyContent: "space-between",
              }}
            >
              <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
                <BelgeKontrolCard
                  fetch={() => {}}
                  hazirlayan="Denetçi - Yardımcı Denetçi"
                  controller={controller}
                ></BelgeKontrolCard>
              </Grid>
              <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
                <BelgeKontrolCard
                  fetch={() => {}}
                  onaylayan="Sorumlu Denetçi"
                  controller={controller}
                ></BelgeKontrolCard>
              </Grid>
              <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
                <BelgeKontrolCard
                  fetch={() => {}}
                  kaliteKontrol="Kalite Kontrol Sorumlu Denetçi"
                  controller={controller}
                ></BelgeKontrolCard>
              </Grid>
            </Grid>
          ) : (
            <></>
          )}
          <Grid
            container
            sx={{
              width: "100%",
              margin: "0 auto",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Grid item xs={12} lg={12} mt={5}>
              <IslemlerCard controller={controller} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
