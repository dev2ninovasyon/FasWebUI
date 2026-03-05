"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Fab,
  Grid,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Link,
} from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import { enqueueSnackbar } from "notistack";
import { createBeklenenKrediZarariHesaplanmis, getIskontoOrani } from "@/api/Hesaplamalar/Hesaplamalar";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import BeklenenKrediZarari from "./BeklenenKrediZarari";
import { IconExclamationMark } from "@tabler/icons-react";

import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
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
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [revizeOrani, setRevizeOrani] = useState<number>(0);
  const [iskontoOrani, setIskontoOrani] = useState<number>(0);
  const [openInfoDialog, setOpenInfoDialog] = useState<boolean>(false);
  const [hesaplaTiklandimi, setHesaplaTiklandimi] = useState(false);

  const [openCartAlert, setOpenCartAlert] = useState(false);

  const handleHesapla = async () => {
    try {
      if (!Number.isFinite(revizeOrani) || !Number.isFinite(iskontoOrani)) {
        enqueueSnackbar("Lütfen geçerli bir oran giriniz.", {
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
        return;
      }

      const result = await createBeklenenKrediZarariHesaplanmis(user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        revizeOrani,
        iskontoOrani
      );
      if (result?.success) {
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
        enqueueSnackbar(result?.message || "Beklenen Kredi Zararı Hesaplanamadı", {
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
      if (!user.yil || user.yil <= 0) return;
      const iskontoOraniVerisi = await getIskontoOrani(user.yil);
      if (iskontoOraniVerisi !== undefined && iskontoOraniVerisi !== null) {
        setIskontoOrani(iskontoOraniVerisi);
        setRevizeOrani(iskontoOraniVerisi);
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchIskontoOrani();
  }, [user.yil]);

  return (
    <PageContainer
      title="Beklenen Kredi Zararı"
      description="this is Beklenen Kredi Zararı"
    >
      <Breadcrumb title="Beklenen Kredi Zararı" items={BCrumb}>
        <EkBelgeYukleButton formKodu="BeklenenKrediZarari" />
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
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CustomFormLabel
              htmlFor="iskonto"
              sx={{ mt: 0, mb: { sm: 0 }, mr: 2 }}
            >
              <Typography variant="subtitle1">İskonto Oranı:</Typography>
            </CustomFormLabel>
            <CustomTextField
              id="iskonto"
              type="number"
              value={iskontoOrani}
              onChange={(e: any) => setIskontoOrani(Number(e.target.value))}
            />

            <CustomFormLabel
              htmlFor="revize"
              sx={{ mt: 0, mb: { sm: 0 }, mx: 2 }}
            >
              <Typography variant="subtitle1">Revize Oranı:</Typography>
            </CustomFormLabel>
            <CustomTextField
              id="revize"
              type="number"
              value={revizeOrani}
              onChange={(e: any) => setRevizeOrani(Number(e.target.value))}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: smDown ? "column" : "row",
              gap: 1,
              width: smDown ? "100%" : "auto",
            }}
          >
            <Tooltip title="Oranların kaynağı ve açıklamaları">
              <Fab
                color="warning"
                size="small"
                onClick={() => setOpenInfoDialog(true)}
              >
                <IconExclamationMark width={18.25} height={18.25} />
              </Fab>
            </Tooltip>
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
        <Grid
          size={{
            xs: 12,
            lg: 12
          }}>
          <BeklenenKrediZarari hesaplaTiklandimi={hesaplaTiklandimi} />
        </Grid>
        {openCartAlert && (
          <InfoAlertCart
            openCartAlert={openCartAlert}
            setOpenCartAlert={setOpenCartAlert}
          ></InfoAlertCart>
        )}
        <Dialog
          open={openInfoDialog}
          onClose={() => setOpenInfoDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Oranların Kaynağı ve Açıklamalar</DialogTitle>
          <DialogContent dividers>
            <Typography paragraph>
              İskonto oranı: "Bankalarca Açılan Ticari Kredilere Uygulanan Ağırlıklı Ortalama Faiz Oranları" verisinden veya alacağın vadesine uygun DİBS (Devlet İç Borçlanma Senetleri) getiri eğrisinden veya TLREF oranı alınabilir. TLREF için: <Link href="https://www.borsaistanbul.com/endeksler/tlref" target="_blank" rel="noopener">https://www.borsaistanbul.com/endeksler/tlref</Link>
            </Typography>
            <Typography paragraph>
              Revize oran için açıklama: Değişken faizli araçlarda, piyasa koşullarına göre faiz güncellendiğinde, revize edilmiş nakit akışlarını varlığın defter değerine eşitleyen yeni bir etkin faiz oranı hesaplanır.
            </Typography>

          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenInfoDialog(false)}>Kapat</Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </PageContainer>
  );
};

export default Page;

