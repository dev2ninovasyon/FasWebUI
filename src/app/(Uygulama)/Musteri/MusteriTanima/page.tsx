"use client";

import React, { useState } from "react";
import { Grid } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import BelgeKontrolCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCard";
import RecentActionsTable from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/RecentActionsTable";
import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
import MusteriTanima from "./MusteriTanima";

const BCrumb = [
  { to: "/Musteri", title: "Musteri" },
  { to: "/Musteri/MusteriTanima", title: "Musteri Tanima" },
];

const controller = "MusteriTanima";

const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <PageContainer title="Musteri Tanima" description="Musteri Tanima Belgesi">
      <Breadcrumb title="Musteri Tanima" items={BCrumb}>
        <EkBelgeYukleButton formKodu="MusteriTanima" />
      </Breadcrumb>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <MusteriTanima onSaved={() => setRefreshKey((prev) => prev + 1)} />
        </Grid>

        {(user.rol?.includes("KaliteKontrolSorumluDenetci") ||
          user.rol?.includes("SorumluDenetci") ||
          user.rol?.includes("Denetci") ||
          user.rol?.includes("DenetciYardimcisi")) && (
          <>
            <Grid size={{ xs: 12, md: 4 }}>
              <BelgeKontrolCard fetch={() => {}} hazirlayan="Denetci - Yardimci Denetci" controller={controller} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <BelgeKontrolCard fetch={() => {}} onaylayan="Sorumlu Denetci" controller={controller} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <BelgeKontrolCard fetch={() => {}} kaliteKontrol="Kalite Kontrol Sorumlu Denetci" controller={controller} />
            </Grid>
          </>
        )}

        <Grid size={{ xs: 12 }}>
          <IslemlerCard controller={controller} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <RecentActionsTable controller="MusteriTanima" actionFilter="MusteriTanima" refreshKey={refreshKey} />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
