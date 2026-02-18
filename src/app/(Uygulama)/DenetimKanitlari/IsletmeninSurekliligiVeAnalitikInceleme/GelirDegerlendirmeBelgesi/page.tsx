"use client";

import React, { useEffect, useState } from "react";
import { Button, Grid, useTheme } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import DikeyAnaliz from "@/app/(Uygulama)/components/DenetimKanitlari/Analizler/DikeyAnaliz";
import { IconChartBar, IconTable } from "@tabler/icons-react";
import { enqueueSnackbar } from "notistack";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import { createDikeyAnaliz } from "@/api/Analizler/Analizler";
import GelirDegerlendirmeBelgesi from "@/app/(Uygulama)/components/DenetimKanitlari/Analizler/GelirDegerlendirmeBelgesi";

import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
const BCrumb = [
  {
    to: "/DenetimKanitlari",
    title: "Denetim Kanıtları",
  },
  {
    to: "/DenetimKanitlari/IsletmeninSurekliligiVeAnalitikInceleme",
    title: "İşletmenin Sürekliliği ve Analitik İnceleme",
  },
  {
    to: "/DenetimKanitlari/IsletmeninSurekliliğiVeAnalitikInceleme/GelirDegerlendirmeBelgesi",
    title: "Gelir Değerlendirme Belgesi",
  },
];

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [hesaplaTiklandimi, setHesaplaTiklandimi] = useState(false);

  const [openCartAlert, setOpenCartAlert] = useState(false);

  const [showGraph, setShowGraph] = useState(false);

  const handleToggle = () => {
    setShowGraph((prev) => !prev);
  };


  useEffect(() => {
    if (hesaplaTiklandimi) {
      setOpenCartAlert(true);
    } else {
      setOpenCartAlert(false);
    }
  }, [hesaplaTiklandimi]);

  return (
    <PageContainer title="Gelir Değerlendirme Belgesi" description="this is Gelir Değerlendirme Belgesi">
      <Breadcrumb title="Gelir Değerlendirme Belgesi" items={BCrumb}>
        <EkBelgeYukleButton formKodu="GelirDegerlendirmeBelgesi" />
      </Breadcrumb>
      <Grid container>
        <Grid
          sx={{ display: "flex", justifyContent: "flex-end" }}
          size={{
            xs: 12,
            lg: 12
          }}>
          <Button
            type="button"
            size="medium"
            disabled={hesaplaTiklandimi}
            variant="outlined"
            color="primary"
            sx={{ mr: 2 }}
            onClick={() => {
              setHesaplaTiklandimi(true);
            }}
          >
            Hesapla
          </Button>
          <Button onClick={handleToggle}>
            {showGraph ? <IconTable size={24} /> : <IconChartBar size={24} />}
          </Button>
        </Grid>
        <Grid
          size={{
            xs: 12,
            lg: 12
          }}>
          <GelirDegerlendirmeBelgesi
            showGraph={showGraph}
            hesaplaTiklandimi={hesaplaTiklandimi}
          />
        </Grid>
        {openCartAlert && (
          <InfoAlertCart
            openCartAlert={openCartAlert}
            setOpenCartAlert={setOpenCartAlert}
          ></InfoAlertCart>
        )}
      </Grid>
    </PageContainer>
  );
};

export default Page;
