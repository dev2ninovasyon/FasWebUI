"use client";

import React, { useEffect, useState } from "react";
import { Button, Grid, useTheme } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import DikeyAnaliz from "@/app/(Uygulama)/components/DenetimKanitlari/Analizler/DikeyAnaliz";
import { IconChartBar, IconTable } from "@tabler/icons-react";
import { enqueueSnackbar } from "notistack";
import { useSelector } from "react-redux";
import { AppState } from "@/store/store";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import { createDikeyAnaliz } from "@/api/Analizler/Analizler";

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
    to: "/DenetimKanitlari/IsletmeninSurekliliğiVeAnalitikInceleme/DikeyAnaliz",
    title: "Dikey Analiz",
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

  const handleHesapla = async () => {
    try {
      const result = await createDikeyAnaliz(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );
      if (result) {
        setHesaplaTiklandimi(false);
        enqueueSnackbar("Dikey Analiz Oluşturuldu", {
          variant: "success",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.success.light
                : theme.palette.success.main,
          },
        });
      } else {
        enqueueSnackbar("Dikey Analiz Oluşturulamadı", {
          variant: "error",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.error.light
                : theme.palette.error.main,
            maxWidth: "720px",
          },
        });
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    if (hesaplaTiklandimi) {
      setOpenCartAlert(true);
    } else {
      setOpenCartAlert(false);
    }
  }, [hesaplaTiklandimi]);

  return (
    <PageContainer title="Dikey Analiz" description="this is Dikey Analiz">
      <Breadcrumb title="Dikey Analiz" items={BCrumb} />
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
              handleHesapla();
            }}
          >
            Hesapla
          </Button>
          <Button onClick={handleToggle}>
            {showGraph ? <IconTable size={24} /> : <IconChartBar size={24} />}
          </Button>
        </Grid>
        <Grid item xs={12} lg={12}>
          <DikeyAnaliz
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
