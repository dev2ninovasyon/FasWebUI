"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box, Grid } from "@mui/material";
import { useState } from "react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import dynamic from "next/dynamic";
import PersonelBoxAutocomplete from "@/app/(Uygulama)/components/Layout/Vertical/Header/PersonelBoxAutoComplete";
import BagimsizlikSorumlulukBeyaniLayout from "./BagimsizlikSorumlulukBeyaniLayout";
import BelgeKontrolCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCard";

const CustomEditor = dynamic(
  () => import("@/app/(Uygulama)/components/Editor/CustomEditor"),
  { ssr: false }
);

const controller = "BagimsizlikSorumlulukBeyani";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [personelId, setPersonelId] = useState(user.id);
  const [personelAdi, setPersonelAdi] = useState(user.kullaniciAdi);

  return (
    <BagimsizlikSorumlulukBeyaniLayout>
      <PageContainer
        title="Bağımsızlık Sorumluluk Beyanı"
        description="this is Bağımsızlık Sorumluluk Beyanı"
      >
        <Grid container>
          <Grid item xs={12} mb={3}>
            <PersonelBoxAutocomplete
              initialValue={user.kullaniciAdi}
              tip={"Hepsi"}
              onSelectAdi={(selectedPersonelAdi) =>
                setPersonelAdi(selectedPersonelAdi)
              }
              onSelectId={(selectedPersonelId) =>
                setPersonelId(selectedPersonelId)
              }
            />
          </Grid>
        </Grid>
        <Box>
          <CustomEditor controller={controller} personelId={personelId || 0} />
        </Box>
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
                hazirlayan="Denetçi - Yardımcı Denetçi"
                controller={controller}
              ></BelgeKontrolCard>
            </Grid>
            <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
              <BelgeKontrolCard
                onaylayan="Sorumlu Denetçi"
                controller={controller}
              ></BelgeKontrolCard>
            </Grid>
            <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
              <BelgeKontrolCard
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
    </BagimsizlikSorumlulukBeyaniLayout>
  );
};

export default Page;
