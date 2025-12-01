"use client";

import React, { useEffect, useState } from "react";
import { Button, Grid, useTheme } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import BilancoDegerlendirmeBelgesi from "@/app/(Uygulama)/components/DenetimKanitlari/Analizler/BilancoDegerlendirmeBelgesi";
import { IconChartBar, IconTable } from "@tabler/icons-react";
import { enqueueSnackbar } from "notistack";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";

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
    to: "/DenetimKanitlari/IsletmeninSurekliliğiVeAnalitikInceleme/BilancoDegerlendirmeBelgesi",
    title: "Bilanço Değerlendirme Belgesi",
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
    <PageContainer title="Bilanço Değerlendirme Belgesi" description="this is Bilanço Değerlendirme Belgesi">
      <Breadcrumb title="Bilanço Değerlendirme Belgesi" items={BCrumb} />
      <Grid container>
        <Grid
          item
          xs={12}
          lg={12}
          sx={{ display: "flex", justifyContent: "flex-end" }}
        >
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
        <Grid item xs={12} lg={12}>
           <BilancoDegerlendirmeBelgesi
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
