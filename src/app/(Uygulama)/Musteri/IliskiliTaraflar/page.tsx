"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import { Box, Grid } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import IliskiliTaraflarLayout from "./IliskiliTaraflarLayout";
import IliskiliTaraflarTable from "@/app/(Uygulama)/components/Musteri/IliskiliTaraflar/IliskiliTaraflarTable";
import IliskiliTarafTanimlaButton from "@/app/(Uygulama)/components/Musteri/IliskiliTaraflar/IliskiliTarafTanimlaButton";
import MizandanIliskiliTarafTanimlaButton from "@/app/(Uygulama)/components/Musteri/IliskiliTaraflar/MizandanIliskiliTarafTanimlaButton";
import BelgeKontrolCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCard";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const title = `${user.denetlenenFirmaAdi} İlişkili Taraflar`;

  const controller = "IliskiliTaraflar";
  return (
    <IliskiliTaraflarLayout>
      <PageContainer
        title="İlişkili Taraflar"
        description="this is İlişkili Taraflar"
      >
        <ParentCard title={title}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12} mb={1}>
              <IliskiliTarafTanimlaButton />
              <MizandanIliskiliTarafTanimlaButton />
            </Grid>
            <Grid item xs={12}>
              <Box>
                <IliskiliTaraflarTable />
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
        </Box>
      </PageContainer>
    </IliskiliTaraflarLayout>
  );
};

export default Page;
