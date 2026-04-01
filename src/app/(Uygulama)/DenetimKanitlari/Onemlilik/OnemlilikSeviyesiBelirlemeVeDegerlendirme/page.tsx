"use client";

import React, { useRef } from "react";
import { Button, Grid, Tooltip } from "@mui/material";
import { IconRotate } from "@tabler/icons-react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
import BelgeKontrolCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCard";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import OnemlilikExcelStepper, { OnemlilikExcelStepperRef } from "./OnemlilikExcelStepper";

const BCrumb = [
  { to: "/DenetimKanitlari", title: "Denetim Kanıtları" },
  { to: "/DenetimKanitlari/Onemlilik", title: "Önemlilik" },
  {
    to: "/DenetimKanitlari/Onemlilik/OnemlilikSeviyesiBelirlemeVeDegerlendirme",
    title: "Önemlilik Seviyesi Belirleme Ve Değerlendirme",
  },
];

const controller = "OnemlilikSeviyesiKayitlari";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const stepperRef = useRef<OnemlilikExcelStepperRef>(null);

  return (
    <PageContainer
      title="Önemlilik Seviyesi Belirleme Ve Değerlendirme"
      description="Önemlilik Seviyesi Belirleme Ve Değerlendirme"
    >
      <Breadcrumb title="Önemlilik Seviyesi Belirleme Ve Değerlendirme" items={BCrumb}>
        <Grid container spacing={1} justifyContent="flex-end" alignItems="center">
          <Grid>
            <Tooltip title="Tüm manuel oranları silerek, programın varsayılan matris hesaplamasına geri döner." arrow>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<IconRotate size={18} />}
                onClick={() => stepperRef.current?.handleReset()}
                sx={{ textTransform: "none" }}
              >
                Program Varsayılanlarına Dön
              </Button>
            </Tooltip>
          </Grid>
          <Grid>
            <EkBelgeYukleButton formKodu="OnemlilikSeviyesiKayitlari" />
          </Grid>
        </Grid>
      </Breadcrumb>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <OnemlilikExcelStepper ref={stepperRef} />
        </Grid>

        {(user.rol?.includes("KaliteKontrolSorumluDenetci") ||
          user.rol?.includes("SorumluDenetci") ||
          user.rol?.includes("Denetci") ||
          user.rol?.includes("DenetciYardimcisi")) && (
          <>
            <Grid size={{ xs: 12, md: 4 }}>
              <BelgeKontrolCard fetch={() => {}} hazirlayan="Denetçi - Yardımcı Denetçi" controller={controller} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <BelgeKontrolCard fetch={() => {}} onaylayan="Sorumlu Denetçi" controller={controller} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <BelgeKontrolCard fetch={() => {}} kaliteKontrol="Kalite Kontrol Sorumlu Denetçi" controller={controller} />
            </Grid>
          </>
        )}

        <Grid size={{ xs: 12 }}>
          <IslemlerCard controller={controller} />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
