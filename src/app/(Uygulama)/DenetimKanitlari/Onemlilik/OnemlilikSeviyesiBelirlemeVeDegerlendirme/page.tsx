"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React, { useState } from "react";
import { Box, Button, CircularProgress, Grid, useMediaQuery, useTheme } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import { enqueueSnackbar } from "notistack";
import Onemlilik from "./Onemlilik";
import { createOnemlilik } from "@/api/DenetimKanitlari/DenetimKanitlari";
import OnemlilikHesaplamaBazi from "./OnemlilikHesaplamaBazi";
import BelgeKontrolCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCard";

import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
const BCrumb = [
  {
    to: "/DenetimKanitlari",
    title: "Denetim Kanıtları",
  },
  {
    to: "/DenetimKanitlari/Onemlilik",
    title: "Önemlilik",
  },
  {
    to: "/DenetimKanitlari/Onemlilik/OnemlilikSeviyesiBelirlemeVeDegerlendirme",
    title: "Önemlilik Seviyesi Belirleme Ve Değerlendirme",
  },
];

const Page = () => {
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const controller = "OnemlilikSeviyesiKayitlari";

  const [hesaplaTiklandimi, setHesaplaTiklandimi] = useState(false);

  const handleHesapla = async () => {
    try {
      const result = await createOnemlilik(user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );
      if (result) {
        enqueueSnackbar("Önemlilik Hesaplandı", {
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
        enqueueSnackbar("Önemlilik Hesaplanamadı", {
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
      console.log("Bir hata oluştu:", error);
    } finally {
      setHesaplaTiklandimi(false);
    }
  };

  return (
    <PageContainer
      title="Önemlilik Seviyesi Belirleme Ve Değerlendirme"
      description="this is Önemlilik Seviyesi Belirleme Ve Değerlendirme"
    >
      <Breadcrumb title="Önemlilik Seviyesi Belirleme Ve Değerlendirme"
        items={BCrumb}>
        <EkBelgeYukleButton formKodu="OnemlilikSeviyesiKayitlari" />
      </Breadcrumb>
      <Grid container>
        <Grid
          sx={{
            display: "flex",
            flexDirection: smDown ? "column" : "row",
            alignItems: "center",
            justifyContent: "flex-end",
            mb: 2,
            gap: 1,
          }}
          size={{
            xs: 12,
            lg: 12
          }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: smDown ? "column" : "row",
              gap: 1,
              width: smDown ? "100%" : "auto",
            }}
          >
            <Button
              type="button"
              size="medium"
              disabled={hesaplaTiklandimi}
              variant="outlined"
              color="primary"
              onClick={() => {
                setHesaplaTiklandimi(true);
                handleHesapla();
              }}
              startIcon={
                hesaplaTiklandimi ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {hesaplaTiklandimi ? "Hesaplanıyor..." : "Hesapla"}
            </Button>
          </Box>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 12,
            lg: 12
          }}>
          <OnemlilikHesaplamaBazi />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 12,
            lg: 12
          }}>
          <Onemlilik
            hesaplaTiklandimi={hesaplaTiklandimi}
            setHesaplaTiklandimi={setHesaplaTiklandimi}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 12,
            lg: 12
          }}>
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
            <Grid
              mt={5}
              size={{
                xs: 12,
                lg: 12
              }}>
              <IslemlerCard controller={controller} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </PageContainer >
  );
};

export default Page;

