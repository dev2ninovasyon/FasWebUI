"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import { Box, Grid } from "@mui/material";
import SirketYonetimKadrosuLayout from "./SirketYonetimKadrosuLayout";
import SirketYonetimKadrosuEkleButton from "@/app/(Uygulama)/components/Musteri/SirketYonetimKadrosu/SirketYonetimKadrosuEkleButton";
import SirketYonetimKadrosuTable from "@/app/(Uygulama)/components/Musteri/SirketYonetimKadrosu/SirketYonetimKadrosuTable";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import BelgeKontrolCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCard";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const title = `${user.denetlenenFirmaAdi} Yönetim Kadrosu`;

  const controller = "SirketYonetimKadrosu";
  return (
    <SirketYonetimKadrosuLayout>
      <PageContainer
        title="Şirket Yönetim Kadrosu"
        description="this is Şirket Yönetim Kadrosu"
      >
        <ParentCard title={title}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <SirketYonetimKadrosuEkleButton />
              <Box>
                <SirketYonetimKadrosuTable />
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
    </SirketYonetimKadrosuLayout>
  );
};

export default Page;
