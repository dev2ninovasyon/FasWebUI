"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import { Box, Grid } from "@mui/material";
import KullaniciBoxAutocomplete from "@/app/(Uygulama)/components/Sozlesme/DenetimKadrosuAtama/AutoCompleteBox/KullaniciBoxAutoComplete";
import { useState } from "react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import DenetciYillikTaahutnameLayout from "./DenetciYillikTaahutnameLayout";
import dynamic from "next/dynamic";
import BelgeKontrolCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCard";
import NoUsersAlert from "@/app/(Uygulama)/components/Alerts/NoUsersAlert";

const CustomEditor = dynamic(
  () => import("@/app/(Uygulama)/components/Editor/CustomEditor"),
  { ssr: false }
);

const controller = "YillikTaahhutname";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [personelId, setPersonelId] = useState(user.id);
  const [personelAdi, setPersonelAdi] = useState(user.kullaniciAdi);
  const [showNoUsersAlert, setShowNoUsersAlert] = useState(false);

  return (
    <DenetciYillikTaahutnameLayout>
      <PageContainer
        title="Denetçi Yıllık Taahhütname"
        description="this is Denetçi Yıllık Taahhütname"
      >
        <Grid container>
          <Grid mb={3} size={12}>
            <KullaniciBoxAutocomplete
              initialValue={user.kullaniciAdi}
              onSelectAdi={(selectedPersonelAdi) =>
                setPersonelAdi(selectedPersonelAdi)
              }
              onSelectId={(selectedPersonelId) =>
                setPersonelId(selectedPersonelId)
              }
              onEmptyUsers={() => setShowNoUsersAlert(true)}
            />
          </Grid>
        </Grid>
        <ParentCard title={`${personelAdi} Yıllık Taahhütname`}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <CustomEditor
                controller={controller}
                personelId={personelId || 0}
              />
            </Grid>
          </Grid>
        </ParentCard>
      </PageContainer>
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
                  fetch={() => { }}
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
                  fetch={() => { }}
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
                  fetch={() => { }}
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
      <NoUsersAlert
        open={showNoUsersAlert}
        onClose={() => setShowNoUsersAlert(false)}
      />
    </DenetciYillikTaahutnameLayout>
  );
};

export default Page;
