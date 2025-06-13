"use client";

import React, { useEffect, useState } from "react";
import { Box, Button, Grid, useMediaQuery, useTheme } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import { createFinansalTabloKalemlerindeDegisim } from "@/api/PlanVeProgram/PlanVeProgram";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { enqueueSnackbar } from "notistack";
import FinansalTabloKalemlerindeDegisim from "./FinansalTabloKalemlerindeDegisim";

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
    to: "/PlanVeProgram/DenetimPlanindaOnemlilik/FinansalTabloKalemlerindeDegisim",
    title: "Finansal Tablo Kalemlerinde Değişim",
  },
];

const Page = () => {
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [hesaplaTiklandimi, setHesaplaTiklandimi] = useState(false);

  const [openCartAlert, setOpenCartAlert] = useState(false);

  const handleHesapla = async () => {
    try {
      const result = await createFinansalTabloKalemlerindeDegisim(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );
      if (result) {
        setHesaplaTiklandimi(false);
        enqueueSnackbar("Hesaplandı", {
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
        enqueueSnackbar("Hesaplanamadı", {
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
      title="Finansal Tablo Kalemlerinde Değişim"
      description="this is Finansal Tablo Kalemlerinde Değişim"
    >
      <Breadcrumb title="Finansal Tablo Kalemlerinde Değişim" items={BCrumb} />
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
              sx={{ height: "100%" }}
              onClick={() => {
                setHesaplaTiklandimi(true);
                handleHesapla();
              }}
            >
              Hesapla
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} lg={12}>
          <FinansalTabloKalemlerindeDegisim
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
