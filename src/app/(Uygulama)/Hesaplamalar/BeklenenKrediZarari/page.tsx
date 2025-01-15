"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React, { useEffect, useState } from "react";
import { Button, Grid, Typography, useTheme } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "react-redux";
import { enqueueSnackbar } from "notistack";
import {
  createBeklenenKrediZarariHesaplanmis,
  getIskontoOrani,
} from "@/api/Hesaplamalar/Hesaplamalar";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import BeklenenKrediZarari from "./BeklenenKrediZarari";

const BCrumb = [
  {
    to: "/Hesaplamalar",
    title: "Hesaplamalar",
  },
  {
    to: "/Hesaplamalar/BeklenenKrediZarari",
    title: "Beklenen Kredi Zararı",
  },
];

const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [revizeOrani, setRevizeOrani] = useState<number>(0);
  const [iskontoOrani, setIskontoOrani] = useState<number>(0);
  const [hesaplaTiklandimi, setHesaplaTiklandimi] = useState(false);

  const [openCartAlert, setOpenCartAlert] = useState(false);

  const handleHesapla = async () => {
    try {
      const result = await createBeklenenKrediZarariHesaplanmis(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        revizeOrani,
        iskontoOrani
      );
      if (result) {
        setHesaplaTiklandimi(false);
        enqueueSnackbar("Beklenen Kredi Zararı Hesaplandı", {
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
        enqueueSnackbar("Beklenen Kredi Zararı Hesaplanamadı", {
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

  const fetchIskontoOrani = async () => {
    try {
      const iskontoOraniVerisi = await getIskontoOrani(user.token || "");

      if (iskontoOraniVerisi) {
        setIskontoOrani(iskontoOraniVerisi);
        setRevizeOrani(iskontoOraniVerisi);
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchIskontoOrani();
  }, []);

  return (
    <PageContainer
      title="Beklenen Kredi Zararı"
      description="this is Beklenen Kredi Zararı"
    >
      <Breadcrumb title="Beklenen Kredi Zararı" items={BCrumb} />
      <Grid container>
        <Grid
          item
          xs={12}
          lg={12}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            mb: 2,
          }}
        >
          <CustomFormLabel
            htmlFor="revize"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
          >
            <Typography variant="subtitle1">Revize Oranı:</Typography>
          </CustomFormLabel>
          <CustomTextField
            id="revize"
            type="number"
            value={revizeOrani}
            onChange={(e: any) => setRevizeOrani(e.target.value)}
          />
          <CustomFormLabel
            htmlFor="iskonto"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mx: 2 }}
          >
            <Typography variant="subtitle1">İskonto Oranı:</Typography>
          </CustomFormLabel>
          <CustomTextField
            id="iskonto"
            type="number"
            value={iskontoOrani}
            onChange={(e: any) => setIskontoOrani(e.target.value)}
          />
          <Button
            type="button"
            size="medium"
            disabled={hesaplaTiklandimi}
            variant="outlined"
            color="primary"
            sx={{ ml: 2, height: "100%" }}
            onClick={() => {
              setHesaplaTiklandimi(true);
              handleHesapla();
            }}
          >
            Hesapla
          </Button>
        </Grid>
        <Grid item xs={12} lg={12}>
          <BeklenenKrediZarari hesaplaTiklandimi={hesaplaTiklandimi} />
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
