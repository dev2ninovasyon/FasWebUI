"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React, { useState } from "react";
import { Box, Button, Grid, useMediaQuery, useTheme } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import { enqueueSnackbar } from "notistack";
import Onemlilik from "./Onemlilik";
import { createOnemlilik } from "@/api/DenetimKanitlari/DenetimKanitlari";
import OnemlilikHesaplamaBazi from "./OnemlilikHesaplamaBazi";

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

  const [hesaplaTiklandimi, setHesaplaTiklandimi] = useState(false);

  const handleHesapla = async () => {
    try {
      const result = await createOnemlilik(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );
      if (result) {
        setHesaplaTiklandimi(false);
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
      console.error("Bir hata oluştu:", error);
    }
  };

  return (
    <PageContainer
      title="Önemlilik Seviyesi Belirleme Ve Değerlendirme"
      description="this is Önemlilik Seviyesi Belirleme Ve Değerlendirme"
    >
      <Breadcrumb
        title="Önemlilik Seviyesi Belirleme Ve Değerlendirme"
        items={BCrumb}
      />
      <Grid container>
        <Grid
          item
          xs={12}
          lg={12}
          sx={{
            display: "flex",
            flexDirection: smDown ? "column" : "row",
            alignItems: "center",
            justifyContent: "flex-end",
            mb: 2,
            gap: 1,
          }}
        >
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
            >
              Hesapla
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} lg={12}>
          <OnemlilikHesaplamaBazi />
        </Grid>
        <Grid item xs={12} sm={12} lg={12}>
          <Onemlilik
            hesaplaTiklandimi={hesaplaTiklandimi}
            setHesaplaTiklandimi={setHesaplaTiklandimi}
          />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
