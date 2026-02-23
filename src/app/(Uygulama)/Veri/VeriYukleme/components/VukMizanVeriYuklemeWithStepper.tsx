"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Typography,
  useMediaQuery,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  Fab,
  IconButton,
  Stack,
  Tooltip,
  useTheme,
} from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import { enqueueSnackbar } from "notistack";
import { IconHistory, IconX } from "@tabler/icons-react";
import VukMizan from "@/app/(Uygulama)/Veri/VukMizanVeriYukleme/VukMizan";
import {
  getGenelHesapPlani,
  createVukMizan,
  createProgramVukMizan,
  getProgramVukMizanControl,
  getMizanVerileri,
} from "@/api/Veri/Mizan";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import KurumlarVergisiBeyannamesiKarsilastirma from "@/app/(Uygulama)/components/Veri/Mizan/KurumlarVergisiBeyannamesiKarsilastirma";
import ProgramVukMizan from "@/app/(Uygulama)/components/Veri/Mizan/ProgramVukMizan";
import ProgramFormatiCard from "@/app/(Uygulama)/components/Veri/Mizan/ProgramFormatiCard";
import MizanCard from "@/app/(Uygulama)/components/Veri/Mizan/MizanCard";
import Mizan from "@/app/(Uygulama)/components/Veri/Mizan/Mizan";
import MizanTable from "@/app/(Uygulama)/components/Veri/Mizan/MizanTable";
import { MizanConfirmPopUpComponent } from "@/app/(Uygulama)/components/Veri/Mizan/MizanConfirmPopUpComponent";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";

const steps = [
  "Vuk Mizan Veri Yükleme",
  "Mizan Oluştur",
  "KV. B. Karşılaştırma",
  "P. F.",
];

interface Veri {
  id: number;
  kod: string;
  adi: string;
  paraBirimi: string;
}

const VukMizanVeriYuklemeWithStepper: React.FC = () => {
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));
  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());

  // Vuk Mizan Veri Yükleme (Step 0)
  const [kaydetTiklandimi, setKaydetTiklandimi] = useState(false);
  const [fetchedData, setFetchedData] = useState<Veri[]>([]);
  const [hasDataInTable, setHasDataInTable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [mizanBaslangicTarihi, setMizanBaslangicTarihi] = useState(
    `${user.yil}-01-01`
  );
  const [mizanBitisTarihi, setMizanBitisTarihi] = useState(`${user.yil}-12-31`);
  const [mizanOlusturTiklandimi, setMizanOlusturTiklandimi] = useState(false);
  const [mizanOlusturuluyor, setMizanOlusturuluyor] = useState(false);
  const [mizanOlusturmaHatasi, setMizanOlusturmaHatasi] = useState(false);

  // Program Formatına Dönüştür (Step 3-4)
  const [programFormatinaDonusturTiklandimi, setProgramFormatinaDonusturTiklandimi] = useState(false);

  // Dialogs
  const [showDrawer, setShowDrawer] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [openCartAlert, setOpenCartAlert] = useState(false);

  // Confirm Popup
  const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = useState(false);
  const [control, setControl] = useState(false);
  const [tip, setTip] = useState("");

  const fetchData = async () => {
    try {
      const genelHesapPlaniVerileri = await getGenelHesapPlani(
        user.denetimTuru || ""
      );

      const rowsAll: Veri[] = [];

      genelHesapPlaniVerileri.forEach((veri: any) => {
        rowsAll.push({
          id: veri.id,
          kod: veri.kod.replace("-", "."),
          adi: veri.adi,
          paraBirimi: veri.paraBirimi,
        });
      });

      rowsAll.sort((a: any, b: any) => (a[0] > b[0] ? -1 : 1));

      setFetchedData(rowsAll);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (mizanOlusturTiklandimi || programFormatinaDonusturTiklandimi) {
      setIsAlertOpen(true);
      setOpenCartAlert(true);
    } else {
      setIsAlertOpen(false);
      setOpenCartAlert(false);
    }
  }, [mizanOlusturTiklandimi, programFormatinaDonusturTiklandimi]);

  const handleDrawerClose = () => {
    setShowDrawer(false);
  };

  const handleIsConfirm = () => {
    setIsConfirmPopUpOpen(!isConfirmPopUpOpen);
  };

  const handleCloseConfirmPopUp = () => {
    setIsConfirmPopUpOpen(false);
  };

  const handleVukMizan = async () => {
    try {
      setMizanOlusturuluyor(true);
      setMizanOlusturmaHatasi(false);
      
      const result = await createVukMizan(
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        mizanBaslangicTarihi,
        mizanBitisTarihi
      );
      
      if (result) {
        setMizanOlusturTiklandimi(false);
        setMizanOlusturuluyor(false);
        enqueueSnackbar("VukMizan Oluşturuldu", {
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
        setMizanOlusturmaHatasi(true);
        setMizanOlusturuluyor(false);
        enqueueSnackbar("Vuk Mizan Oluşturulamadı", {
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
      setMizanOlusturmaHatasi(true);
      setMizanOlusturuluyor(false);
    }
  };

  const handleProgramVukMizan = async () => {
    try {
      const result = await createProgramVukMizan(
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        "VukMizan"
      );
      if (result) {
        setProgramFormatinaDonusturTiklandimi(false);
        enqueueSnackbar("Program Vuk Mizan Oluşturuldu", {
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
        enqueueSnackbar("Program Vuk Mizan Oluşturulamadı", {
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

  const handleProgramFormatinaDonusturOnClick = async () => {
    try {
      const control = await getProgramVukMizanControl(
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        "VukMizan"
      );
      if (control) {
        setTip("VukMizan");
        setControl(true);
        handleIsConfirm();
      } else {
        setTip("VukMizan");
        setControl(false);
        handleIsConfirm();
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const handleContinue = () => {
    handleProgramVukMizan();
    handleCloseConfirmPopUp();
  };

  const isStepOptional = (step: number) => {
    return false;
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    if (activeStep === 0 && !hasDataInTable) {
      alert("Lütfen en az bir satır veri yükleyerek Kaydet butonuna tıklayın");
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
    setKaydetTiklandimi(false);
    setMizanOlusturTiklandimi(false);
    setProgramFormatinaDonusturTiklandimi(false);
  };

  const handleStepClick = (index: number) => {
    if (index === 0 || (index > 0 && hasDataInTable)) {
      setActiveStep(index);
    } else if (index > 0 && !hasDataInTable) {
      alert("Lütfen önce veri yükleyip Kaydet butonuna tıklayın");
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 3 }}>
        {steps.map((label, index) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: { optional?: React.ReactNode } = {};
          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography variant="caption">İsteğe Bağlı</Typography>
            );
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel
                {...labelProps}
                onClick={() => handleStepClick(index)}
                sx={{
                  cursor:
                    index === 0 || (index > 0 && hasDataInTable)
                      ? "pointer !important"
                      : "not-allowed",
                  opacity:
                    index === 0 || (index > 0 && hasDataInTable) ? 1 : 0.5,
                  "& .MuiStepLabel-label": {
                    fontSize: theme.typography.h6,
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>

      <Box sx={{ minHeight: "500px", mb: 3 }}>
        {activeStep === steps.length ? (
          <>
            <Box>
              <Typography
                sx={{
                  height: "36.5px",
                  mt: 3.5,
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Tüm adımlar tamamlandı!
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "row", pt: 1, px: 1 }}>
              <Box sx={{ flex: "1 1 auto" }} />
              <Button onClick={handleReset}>Başa Dön</Button>
            </Box>
          </>
        ) : activeStep === 0 ? (
          // Step 0: Vuk Mizan Veri Yükleme
          <Grid container spacing={3}>
            <Grid
              size={{ xs: 12, lg: 12 }}
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
                  disabled={kaydetTiklandimi || isLoading}
                  variant={kaydetTiklandimi ? "contained" : "outlined"}
                  color={kaydetTiklandimi ? "success" : "primary"}
                  onClick={() => {
                    setKaydetTiklandimi(true);
                  }}
                  startIcon={
                    isLoading ? <CircularProgress size={20} color="inherit" /> : null
                  }
                >
                  {kaydetTiklandimi
                    ? "✓ Kaydedildi"
                    : isLoading
                    ? "Kaydediliyor..."
                    : "Kaydet"}
                </Button>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              <VukMizan
                genelHesapPlaniListesi={fetchedData}
                kaydetTiklandimi={kaydetTiklandimi}
                setKaydetTiklandimi={setKaydetTiklandimi}
                onLoadingChange={setIsLoading}
                onDataLoaded={setHasDataInTable}
              />
            </Grid>
          </Grid>
        ) : activeStep === 1 ? (
          // Step 1: Mizan Oluştur + Vuk Mizan (özet tablosu + tam tablo)
          <>
            <Grid container marginTop={3}>
              <Grid
                display="flex"
                size={{ xs: 12, lg: 6 }}
                flexDirection="column"
                gap={2}
              >
                <Box sx={{ textAlign: "center", py: 2 }}>
                  <Button
                    size="large"
                    variant="contained"
                    color="primary"
                    disabled={mizanOlusturuluyor}
                    startIcon={mizanOlusturuluyor ? <CircularProgress size={20} color="inherit" /> : null}
                    onClick={() => {
                      setMizanOlusturTiklandimi(true);
                      handleVukMizan();
                    }}
                  >
                    {mizanOlusturuluyor ? "Oluşturuluyor..." : "Oluştur"}
                  </Button>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Tooltip title="Mizan Oluşturma Kayıtları">
                    <Fab color="warning" size="small" onClick={() => setShowDrawer(true)}>
                      <IconHistory width={18.25} height={18.25} />
                    </Fab>
                  </Tooltip>
                </Box>
              </Grid>
              <Grid padding={1} size={{ xs: 12, lg: 6 }}>
                <MizanCard
                  type={"VukMizan"}
                  mizanOlusturTiklandimi={mizanOlusturTiklandimi && !mizanOlusturmaHatasi}
                  setMizanOlusturTiklandimi={setMizanOlusturTiklandimi}
                />
              </Grid>
            </Grid>
            <Grid container marginTop={2}>
              <Grid size={{ xs: 12, lg: 12 }}>
                <Mizan
                  type={"VukMizan"}
                  mizanOlusturTiklandimi={mizanOlusturTiklandimi && !mizanOlusturmaHatasi}
                  setMizanOlusturTiklandimi={setMizanOlusturTiklandimi}
                  showOnlyTable={true}
                />
              </Grid>
            </Grid>
          </>
        ) : activeStep === 2 ? (
          // Step 2: KV. B. Karşılaştırma
          <Grid container marginTop={3}>
            <Grid padding={1} size={{ xs: 12, lg: 12 }}>
              <KurumlarVergisiBeyannamesiKarsilastirma type={"VukMizan"} />
            </Grid>
          </Grid>
        ) : activeStep === 3 ? (
          // Step 3: P. F. (Program Formatı)
          <>
            <Grid container marginTop={3}>
              <Grid
                sx={{ pl: { xs: 1, lg: 1 }, pr: { xs: 1, lg: 0 }, py: 1 }}
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
                size={{
                  xs: 12,
                  lg: 1.75,
                }}
              >
                <Button
                  size="medium"
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={() => {
                    handleProgramFormatinaDonusturOnClick();
                  }}
                >
                  Program Formatına Dönüştür
                </Button>
              </Grid>
              <Grid
                padding={1}
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
                size={{
                  xs: 12,
                  lg: 10.25,
                }}
              >
                <ProgramFormatiCard
                  type={"VukMizan"}
                  programFormatinaDonusturTiklandimi={programFormatinaDonusturTiklandimi}
                  setProgramFormatinaDonusturTiklandimi={setProgramFormatinaDonusturTiklandimi}
                />
              </Grid>
            </Grid>
            <Grid
              padding={1}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              size={{
                xs: 12,
                lg: 10.25,
              }}
            />
            <Grid container marginTop={3}>
              <Grid
                padding={1}
                size={{
                  xs: 12,
                  lg: 12,
                }}
              >
                <ProgramVukMizan
                  type={"VukMizan"}
                  programFormatinaDonusturTiklandimi={programFormatinaDonusturTiklandimi}
                  setProgramFormatinaDonusturTiklandimi={setProgramFormatinaDonusturTiklandimi}
                />
              </Grid>
            </Grid>
          </>
        ) : null}
      </Box>

      <Box sx={{ display: "flex", flexDirection: "row", px: 1, pt: 2 }}>
        <Button
          color="inherit"
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          Önceki
        </Button>
        <Box sx={{ flex: "1 1 auto" }} />
        {isStepOptional(activeStep) && (
          <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
            Atla
          </Button>
        )}
        <Button onClick={handleNext}>
          {activeStep === steps.length - 1 ? "Tamamla" : "Sonraki"}
        </Button>
      </Box>

      {/* Dialog for Mizan Table */}
      <Dialog
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        fullWidth
        maxWidth={"md"}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{ sx: { position: "fixed", top: 30, m: 0 } }}
      >
        <DialogContent className="testdialog">
          <Stack
            direction="row"
            spacing={2}
            justifyContent={"space-between"}
            alignItems="center"
          >
            <Typography variant="h5" p={1}>
              Mizan Oluşturma Kayıtları
            </Typography>
            <IconButton size="small" onClick={handleDrawerClose}>
              <IconX size="18" />
            </IconButton>
          </Stack>
        </DialogContent>
        <Divider />
        <MizanTable type={"VukMizan"} />
      </Dialog>

      {/* Confirm Popup */}
      {isConfirmPopUpOpen && (
        <MizanConfirmPopUpComponent
          tip={tip}
          isConfirmPopUp={isConfirmPopUpOpen}
          handleClose={handleCloseConfirmPopUp}
          handleContinue={handleContinue}
        />
      )}

      {/* Alert */}
      {isAlertOpen && (
        <InfoAlertCart
          openCartAlert={openCartAlert}
          setOpenCartAlert={setOpenCartAlert}
        ></InfoAlertCart>
      )}
    </Box>
  );
};

export default VukMizanVeriYuklemeWithStepper;
