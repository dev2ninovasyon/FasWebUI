"use client";

import React, { useEffect, useState } from "react";
import { Grid, useTheme } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import { createOnemlilikVeOrneklem } from "@/api/PlanVeProgram/PlanVeProgram";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { enqueueSnackbar } from "notistack";
import OnemlilikVeOrneklemForm from "@/app/(Uygulama)/components/PlanVeProgram/OnemlilikVeOrneklem/OnemlilikVeOrneklemForm";
import OnemlilikVeOrneklem from "./OnemlilikVeOrneklem";
import OnemlilikVeOrneklemSeviyesi from "./OnemlilikVeOrneklemSeviyesi";
import OnemlilikVeOrneklemHesaplamaBazi from "./OnemlilikVeOrneklemHesaplamaBazi";
import BelgeKontrolCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCard";

const BCrumb = [
  {
    to: "/PlanVeProgram",
    title: "Plan Ve Program",
  },
  {
    to: "/PlanVeProgram/DenetimPlanindaOnemlilik",
    title: "Denetim Planında Önemlilik",
  },
  {
    to: "/PlanVeProgram/DenetimPlanindaOnemlilik/OnemlilikVeOrneklem",
    title: "Önemlilik Ve Örneklem",
  },
];

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const controller = "OnemlilikVeOrneklem";

  const [guvenilirlikDuzeyi, setGuvenilirlikDuzeyi] = useState(95);
  const [hataPayi, setHataPayi] = useState(5);

  const [hesaplaTiklandimi, setHesaplaTiklandimi] = useState(false);
  const [hesaplaTiklandimi2, setHesaplaTiklandimi2] = useState(false);

  const [openCartAlert, setOpenCartAlert] = useState(false);

  const handleHesapla = async () => {
    try {
      const result = await createOnemlilikVeOrneklem(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        guvenilirlikDuzeyi || 0,
        hataPayi || 0
      );
      if (result) {
        setHesaplaTiklandimi(false);
        enqueueSnackbar("Önemlilik Ve Örneklem Hesaplandı", {
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
        enqueueSnackbar("Önemlilik Ve Örneklem Hesaplanamadı", {
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
    <PageContainer
      title="Önemlilik Ve Örneklem"
      description="this is Önemlilik Ve Örneklem"
    >
      <Breadcrumb title="Önemlilik Ve Örneklem" items={BCrumb} />
      <Grid container>
        <Grid item xs={12} lg={12} mb={3}>
          <OnemlilikVeOrneklemForm
            guvenilirlikDuzeyi={guvenilirlikDuzeyi}
            hataPayi={hataPayi}
            setGuvenilirlikDuzeyi={setGuvenilirlikDuzeyi}
            setHataPayi={setHataPayi}
            setHesaplaTiklandimi={setHesaplaTiklandimi}
            handleHesapla={handleHesapla}
          />
        </Grid>
        <Grid item xs={12} lg={12}>
          <OnemlilikVeOrneklemSeviyesi
            hesaplaTiklandimi={hesaplaTiklandimi2}
            setHesaplaTiklandimi={setHesaplaTiklandimi2}
          />
        </Grid>
        <Grid item xs={12} lg={12}>
          <OnemlilikVeOrneklemHesaplamaBazi
            hesaplaTiklandimi={hesaplaTiklandimi2}
            setHesaplaTiklandimi={setHesaplaTiklandimi2}
          />
        </Grid>
        <Grid item xs={12} lg={12}>
          <OnemlilikVeOrneklem hesaplaTiklandimi={hesaplaTiklandimi} />
        </Grid>
        <Grid item xs={12} lg={12}>
          {user.rol?.includes("KaliteKontrolSorumluDenetci") ||
          user.rol?.includes("SorumluDenetci") ||
          user.rol?.includes("Denetci") ||
          user.rol?.includes("DenetciYardimcisi") ? (
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
          ) : (
            <></>
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
