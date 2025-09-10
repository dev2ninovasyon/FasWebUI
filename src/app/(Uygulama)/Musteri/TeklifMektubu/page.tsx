"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box, Grid } from "@mui/material";
import dynamic from "next/dynamic";
import TeklifMektubuLayout from "./TeklifMektubuLayout";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import BelgeKontrolCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCard";

const CustomEditor = dynamic(
  () => import("@/app/(Uygulama)/components/Editor/CustomEditor"),
  { ssr: false }
);

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const controller = "TeklifMektubu";
  return (
    <TeklifMektubuLayout>
      <PageContainer
        title="Teklif Mektubu"
        description="this is Teklif Mektubu"
      >
        <CustomEditor controller={controller} />
      </PageContainer>
      <Box>
        {(user.rol?.includes("KaliteKontrolSorumluDenetci") ||
          user.rol?.includes("SorumluDenetci") ||
          user.rol?.includes("Denetci") ||
          user.rol?.includes("DenetciYardimcisi")) && (
          <Grid
            container
            sx={{
              width: "95%",
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
        )}
        <Grid
          container
          sx={{
            width: "95%",
            margin: "0 auto",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Grid item xs={12} lg={12} mt={5}>
            <IslemlerCard controller={controller} />
          </Grid>
        </Grid>
      </Box>
    </TeklifMektubuLayout>
  );
};

export default Page;
