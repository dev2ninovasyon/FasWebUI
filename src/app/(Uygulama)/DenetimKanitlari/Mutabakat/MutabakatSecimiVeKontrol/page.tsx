"use client";

import React, { useEffect, useState } from "react";
import { Button, Grid, Typography, useTheme } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import MutabakatForm from "@/app/(Uygulama)/components/DenetimKanitlari/Onemlilik/MutabakatForm";
import Mutabakat from "./Mutabakat";
import { deleteMutabakat } from "@/api/DenetimKanitlari/DenetimKanitlari";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { enqueueSnackbar } from "notistack";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import BelgeKontrolCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCard";

const BCrumb = [
  {
    to: "/DenetimKanitlari",
    title: "Denetim Kanıtları",
  },
  {
    to: "/DenetimKanitlari/Mutabakat",
    title: "Mutabakat",
  },
  {
    to: "/DenetimKanitlari/Mutabakat/MutabakatSecimiVeKontrol",
    title: "Mutabakat Seçimi Ve Kontrol",
  },
];

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const controller = "MutabakatKontrolKayitlari";

  const [grupKodu, setGrupKodu] = useState("Hepsi");
  const [hesapAdi, setHesapAdi] = useState("");

  const [verileriGetirTiklandimi, setVerileriGetirTiklandimi] = useState(false);

  const [kaydetTiklandimi, setKaydetTiklandimi] = useState(false);

  const [varsayilanaDonTiklandimi, setVarsayilanaDonTiklandimi] =
    useState(false);

  const [openCartAlert, setOpenCartAlert] = useState(false);

  const handleDeleteMutabakat = async () => {
    try {
      const result = await deleteMutabakat(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0
      );
      if (result) {
        setVarsayilanaDonTiklandimi(false);
        enqueueSnackbar("Tamamlandı", {
          variant: "success",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.success.light
                : theme.palette.success.main,
            maxWidth: "720px",
          },
        });
      } else {
        enqueueSnackbar("Tamamlanamadı", {
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
    if (varsayilanaDonTiklandimi) {
      setOpenCartAlert(true);
      handleDeleteMutabakat();
    } else {
      setOpenCartAlert(false);
    }
  }, [varsayilanaDonTiklandimi]);

  return (
    <PageContainer
      title="Mutabakat Seçimi Ve Kontrol"
      description="this is Mutabakat Seçimi Ve Kontrol"
    >
      <Breadcrumb title="Mutabakat Seçimi Ve Kontrol" items={BCrumb}>
        <>
          <Grid
            container
            sx={{
              width: "95%",
              height: "100%",
              margin: "0 auto",
              justifyContent: "space-between",
            }}
          >
            <Grid
              item
              xs={12}
              md={12}
              lg={12}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Button
                size="medium"
                variant="outlined"
                color="primary"
                onClick={() => setVarsayilanaDonTiklandimi(true)}
                sx={{ width: "100%" }}
              >
                <Typography
                  variant="body1"
                  sx={{ overflowWrap: "break-word", wordWrap: "break-word" }}
                >
                  Varsayılana Dön
                </Typography>
              </Button>
            </Grid>
          </Grid>
        </>
      </Breadcrumb>
      <Grid container>
        <Grid item xs={12} lg={12} mb={3}>
          <MutabakatForm
            grupKodu={grupKodu}
            hesapAdi={hesapAdi}
            setGrupKodu={setGrupKodu}
            setHesapAdi={setHesapAdi}
            setVerileriGetirTiklandimi={setVerileriGetirTiklandimi}
            setKaydetTiklandimi={setKaydetTiklandimi}
          />
        </Grid>
        <Grid item xs={12} lg={12}>
          <Mutabakat
            grupKodu={grupKodu}
            hesapAdi={hesapAdi}
            verileriGetirTiklandimi={verileriGetirTiklandimi}
            kaydetTiklandimi={kaydetTiklandimi}
            varsayilanaDonTiklandimi={varsayilanaDonTiklandimi}
            setVerileriGetirTiklandimi={setVerileriGetirTiklandimi}
            setKaydetTiklandimi={setKaydetTiklandimi}
          />
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
