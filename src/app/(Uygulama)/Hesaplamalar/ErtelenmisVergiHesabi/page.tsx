"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "react-redux";
import { enqueueSnackbar } from "notistack";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import VergiVarlik from "./VergiVarlik";
import VergiYukumluluk from "./VergiYukumluluk";
import ErtelenmisVergiHesabiCard from "@/app/(Uygulama)/components/Hesaplamalar/ErtelenmisVergiHesabi/ErtelenemisVergiHesabiCard";
import { FloatingButton } from "@/app/(Uygulama)/components/Hesaplamalar/FloatingButton";
import { IconX } from "@tabler/icons-react";
import ErtelenmisVergiHesabiOrnekFisler from "./ErtelenmisVergiHesabiOrnekFisler";
import { createVergiVarligiVeYukumlulugu } from "@/api/Hesaplamalar/Hesaplamalar";

const BCrumb = [
  {
    to: "/Hesaplamalar",
    title: "Hesaplamalar",
  },
  {
    to: "/Hesaplamalar/ErtelenmisVergiHesabi",
    title: "Ertelenmiş Vergi Hesabı",
  },
];

const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [vergiOrani, setVergiOrani] = useState<number>(22);
  const [maliZararVeBenzeriIndirimler, setMaliZararVeBenzeriIndirimler] =
    useState<number>(0);
  const [vergiAvantajVeBenzerleri, setVergiAvantajVeBenzerleri] =
    useState<number>(0);

  const [hesaplaTiklandimi, setHesaplaTiklandimi] = useState(false);
  const [kaydetTiklandimi, setKaydetTiklandimi] = useState(false);

  const [floatingButtonTiklandimi, setFloatingButtonTiklandimi] =
    useState(false);

  const [openCartAlert, setOpenCartAlert] = useState(false);

  const handleHesapla = async () => {
    try {
      const result = await createVergiVarligiVeYukumlulugu(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        vergiOrani,
        maliZararVeBenzeriIndirimler,
        vergiAvantajVeBenzerleri
      );
      if (result) {
        setHesaplaTiklandimi(false);
        enqueueSnackbar("Ertelenmiş Vergi Hesaplandı", {
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
        enqueueSnackbar("Ertelenmiş Vergi Hesaplanamadı", {
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
      title="Ertelenmiş Vergi Hesabı"
      description="this is Ertelenmiş Vergi Hesabı"
    >
      <Breadcrumb title="Ertelenmiş Vergi Hesabı" items={BCrumb} />
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
            htmlFor="vergiOrani"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
          >
            <Typography variant="subtitle1">Vergi Oranı:</Typography>
          </CustomFormLabel>
          <CustomTextField
            id="vergiOrani"
            type="number"
            value={vergiOrani}
            onChange={(e: any) => setVergiOrani(e.target.value)}
          />
          <CustomFormLabel
            htmlFor="mali"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mx: 2 }}
          >
            <Typography variant="subtitle1">
              Mali Zarar ve Benzeri İndirimler:
            </Typography>
          </CustomFormLabel>
          <CustomTextField
            id="mali"
            type="number"
            value={maliZararVeBenzeriIndirimler}
            onChange={(e: any) =>
              setMaliZararVeBenzeriIndirimler(e.target.value)
            }
          />
          <CustomFormLabel
            htmlFor="vergi"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mx: 2 }}
          >
            <Typography variant="subtitle1">
              Vergi Avantaj ve Benzerleri:
            </Typography>
          </CustomFormLabel>
          <CustomTextField
            id="vergi"
            type="number"
            value={vergiAvantajVeBenzerleri}
            onChange={(e: any) => setVergiAvantajVeBenzerleri(e.target.value)}
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
        <Grid item xs={12} lg={12} mb={2}>
          <VergiVarlik hesaplaTiklandimi={hesaplaTiklandimi} />
        </Grid>
        <Grid item xs={12} lg={12} mb={2}>
          <VergiYukumluluk hesaplaTiklandimi={hesaplaTiklandimi} />
        </Grid>
        <Grid item xs={12} lg={12}>
          <ErtelenmisVergiHesabiCard hesaplaTiklandimi={hesaplaTiklandimi} />
        </Grid>
        <FloatingButton handleClick={() => setFloatingButtonTiklandimi(true)} />
        <Dialog
          open={floatingButtonTiklandimi}
          onClose={() => setFloatingButtonTiklandimi(false)}
          fullWidth
          maxWidth={"lg"}
        >
          <DialogContent className="testdialog" sx={{ overflow: "visible" }}>
            <Stack
              direction="row"
              spacing={2}
              justifyContent={"space-between"}
              alignItems="center"
            >
              <Box>
                <Typography variant="h5" p={1}>
                  Sizin için oluşturduğum fişleri kaydetmek ister misiniz?
                </Typography>
                <Typography variant="body1" p={1}>
                  Sizin için oluşturduğum fiş kayıtlarının doğruluğunu mutlaka
                  kontrol edin. Fişlerinizi kontrol etmeden kaydetmek, hatalı
                  kayıtların oluşmasına yol açabilir. Unutmayın, bu alanda
                  gerçekleştirdiğiniz işlemlerden kaynaklanan hatalı kayıtlar
                  <strong> tamamen sizin sorumluluğunuzdadır</strong>.
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => setFloatingButtonTiklandimi(false)}
              >
                <IconX size="18" />
              </IconButton>
            </Stack>
          </DialogContent>
          <Divider />
          <DialogContent>
            <ErtelenmisVergiHesabiOrnekFisler
              hesaplaTiklandimi={hesaplaTiklandimi}
              kaydetTiklandimi={kaydetTiklandimi}
              setkaydetTiklandimi={setKaydetTiklandimi}
            />
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
            <Button
              variant="outlined"
              color="success"
              onClick={() => {
                setKaydetTiklandimi(true);
                setFloatingButtonTiklandimi(false);
              }}
              sx={{ width: "20%" }}
            >
              Evet, Kaydet
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setFloatingButtonTiklandimi(false)}
              sx={{ width: "20%" }}
            >
              Hayır, Vazgeç
            </Button>
          </DialogActions>
        </Dialog>
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
