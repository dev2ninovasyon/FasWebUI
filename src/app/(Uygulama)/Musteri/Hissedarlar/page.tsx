"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import { Box, Grid } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import HissedarlarLayout from "./HissedarlarLayout";
import HissedarEkleButton from "@/app/(Uygulama)/components/Musteri/Hissedarlar/HissedarEkleButton";
import HissedarlarTable from "@/app/(Uygulama)/components/Musteri/Hissedarlar/HissedarlarTable";
import MizandanHissedarEkleButton from "@/app/(Uygulama)/components/Musteri/Hissedarlar/MizandanHissedarEkleButton";
import { useState } from "react";
import BelgeKontrolCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCard";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const title = `${user.denetlenenFirmaAdi} Hissedarlar`;

  const [isClickedMizandanHissedarEkle, setIsClickedMizandanHissedarEkle] =
    useState(false);

  const controller = "Hissedarlar";
  return (
    <HissedarlarLayout>
      <PageContainer title="Hissedarlar" description="this is Hissedarlar">
        <ParentCard title={title}>
          <Grid container spacing={3}>
            <Grid
              mb={1}
              size={{
                xs: 12,
                md: 12,
                lg: 12
              }}>
              <HissedarEkleButton />
              <MizandanHissedarEkleButton
                setIsClickedMizandanHissedarEkle={
                  setIsClickedMizandanHissedarEkle
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 12,
                lg: 12
              }}>
              <Box>
                <HissedarlarTable
                  isClickedMizandanHissedarEkle={isClickedMizandanHissedarEkle}
                  setIsClickedMizandanHissedarEkle={
                    setIsClickedMizandanHissedarEkle
                  }
                />
              </Box>
            </Grid>
          </Grid>
        </ParentCard>
        <Box>
          {(user.rol?.includes("KaliteKontrolSorumluDenetci") ||
            user.rol?.includes("SorumluDenetci") ||
            user.rol?.includes("Denetci") ||
            user.rol?.includes("DenetciYardimcisi")) && (
            <Grid
              container
              sx={{
                width: "100%",
                margin: "0 auto",
                justifyContent: "space-between",
              }}
            >
              <Grid
                mt={3}
                size={{
                  xs: 12,
                  md: 3.9,
                  lg: 3.9
                }}>
                <BelgeKontrolCard
                  fetch={() => {}}
                  hazirlayan="Denetçi - Yardımcı Denetçi"
                  controller={controller}
                ></BelgeKontrolCard>
              </Grid>
              <Grid
                mt={3}
                size={{
                  xs: 12,
                  md: 3.9,
                  lg: 3.9
                }}>
                <BelgeKontrolCard
                  fetch={() => {}}
                  onaylayan="Sorumlu Denetçi"
                  controller={controller}
                ></BelgeKontrolCard>
              </Grid>
              <Grid
                mt={3}
                size={{
                  xs: 12,
                  md: 3.9,
                  lg: 3.9
                }}>
                <BelgeKontrolCard
                  fetch={() => {}}
                  kaliteKontrol="Kalite Kontrol Sorumlu Denetçi"
                  controller={controller}
                ></BelgeKontrolCard>
              </Grid>
            </Grid>
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
            <Grid
              mt={5}
              size={{
                xs: 12,
                lg: 12
              }}>
              <IslemlerCard controller={controller} />
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
    </HissedarlarLayout>
  );
};

export default Page;
