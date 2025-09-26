import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { enqueueSnackbar } from "notistack";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Grid, MenuItem, useTheme } from "@mui/material";
import DonusumIslemiCard from "./DonusumIslemiCard";
import CustomSelect from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSelect";
import { DonusumIslemiYap } from "@/api/Donusum/Donusum";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import { FinansalTabloOlustur } from "@/api/FinansalTablolar/FinansalToblolar";
import DonusumMizanKontrol from "@/app/(Uygulama)/components/DenetimKanitlari/DonusumMizanKontrol/DonusumMizanKontrol";
import DonusumMizanKontrolCardTable from "@/app/(Uygulama)/components/DenetimKanitlari/DonusumMizanKontrol/DonusumMizanKontrolCardTable";

interface Props {
  konsolidasyonMu?: boolean;
}

const steps = ["Dönüşüm", "Finansal Tablo"];

const DonusumIslemiStepper: React.FC<Props> = ({ konsolidasyonMu = false }) => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());

  const customizer = useSelector((state: AppState) => state.customizer);
  const user = useSelector((state: AppState) => state.userReducer);
  const theme = useTheme();

  const [nakitAkisYontemi, setNakitAkisYontemi] = useState("nakitakisdogrudan");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNakitAkisYontemi(event.target.value);
  };

  const [donusumIslemiYapTiklandiMi, setDonusumIslemiYapTiklandiMi] =
    useState(false);

  const [finansalTabloOlusturTiklandiMi, setFinansalTabloOlusturTiklandiMi] =
    useState(false);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [openCartAlert, setOpenCartAlert] = useState(false);

  useEffect(() => {
    if (donusumIslemiYapTiklandiMi) {
      setIsAlertOpen(true);
      setOpenCartAlert(true);
    } else {
      setIsAlertOpen(false);
      setOpenCartAlert(false);
    }
  }, [donusumIslemiYapTiklandiMi]);

  useEffect(() => {
    if (finansalTabloOlusturTiklandiMi) {
      setIsAlertOpen(true);
      setOpenCartAlert(true);
    } else {
      setIsAlertOpen(false);
      setOpenCartAlert(false);
    }
  }, [finansalTabloOlusturTiklandiMi]);

  const handleDonusumIslemi = async () => {
    try {
      const donusumIslemi = await DonusumIslemiYap(
        user.token || "",
        user.denetlenenId || 0,
        user.yil || 0,
        user.denetimTuru || "",
        konsolidasyonMu
      );
      if (donusumIslemi) {
        setDonusumIslemiYapTiklandiMi(false);
        enqueueSnackbar("Dönüşüm İşlemi Yapıldı.", {
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
        setDonusumIslemiYapTiklandiMi(false);
        enqueueSnackbar("Dönüşüm İşlemi Yapılamadı", {
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

  const handleFinansalTabloOlustur = async () => {
    try {
      const finansalTabloOlustur = await FinansalTabloOlustur(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        nakitAkisYontemi || "",
        konsolidasyonMu
      );
      if (finansalTabloOlustur) {
        setFinansalTabloOlusturTiklandiMi(false);
        enqueueSnackbar("Finansal Tablolar Oluşturuldu.", {
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
        setFinansalTabloOlusturTiklandiMi(false);
        enqueueSnackbar("Finansal Tablolar Oluşturulamadı.", {
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

  const isStepOptional = (step: number) => {
    return step == -1;
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      enqueueSnackbar("Bu Adımı Geçemezsiniz. Tamamlamanız Gerekmektedir.", {
        variant: "warning",
        autoHideDuration: 5000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.warning.dark
              : theme.palette.warning.main,
          maxWidth: "720px",
        },
      });
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleStepClick = (stepName: string) => {
    const stepIndex = steps.indexOf(stepName);
    if (stepIndex !== -1) {
      setActiveStep(stepIndex);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Box>
      <Stepper
        activeStep={activeStep}
        sx={{
          flexWrap: { xs: "wrap", sm: "nowrap" },
          width: "100%",
          justifyContent: "center",
        }}
      >
        {steps.map((label, index) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: {
            optional?: React.ReactNode;
          } = {};
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
                onClick={() => handleStepClick(label)}
                sx={{
                  cursor: "pointer !important",
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
      {activeStep === steps.length ? (
        <>
          <Grid container minHeight={425} marginY={3}>
            <Grid
              item
              xs={12}
              lg={12}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Typography
                sx={{
                  height: "36.5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Dönüşüm İşlemi Bitirildi
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 0.5, px: 1 }}>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleReset}>Başa Dön</Button>
          </Box>
        </>
      ) : (
        <>
          {activeStep == 0 ? (
            <>
              <Grid container minHeight={428} marginY={3}>
                <Grid
                  item
                  xs={12}
                  lg={12}
                  sx={{ p: 1 }}
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                >
                  <Button
                    size="medium"
                    variant="outlined"
                    color="primary"
                    disabled={
                      donusumIslemiYapTiklandiMi ||
                      finansalTabloOlusturTiklandiMi
                    }
                    onClick={async () => {
                      setDonusumIslemiYapTiklandiMi(true);
                      handleDonusumIslemi();
                    }}
                  >
                    Dönüşüm İşlemi Yap
                  </Button>
                </Grid>
                <Grid
                  item
                  xs={12}
                  lg={12}
                  padding={1}
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                >
                  <DonusumIslemiCard
                    konsolidasyonMu={konsolidasyonMu}
                    donusumIslemiYapTiklandiMi={donusumIslemiYapTiklandiMi}
                    setDonusumIslemiYapTiklandiMi={
                      setDonusumIslemiYapTiklandiMi
                    }
                  />
                </Grid>
                <Grid item xs={12} lg={12} mt={1} padding={1}>
                  <DonusumMizanKontrolCardTable
                    konsolidasyonMu={konsolidasyonMu}
                    donusumIslemiYapTiklandiMi={donusumIslemiYapTiklandiMi}
                    setDonusumIslemiYapTiklandiMi={
                      setDonusumIslemiYapTiklandiMi
                    }
                  />
                </Grid>
                <Grid item xs={12} lg={12} padding={1}>
                  <DonusumMizanKontrol
                    konsolidasyonMu={konsolidasyonMu}
                    donusumIslemiYapTiklandiMi={donusumIslemiYapTiklandiMi}
                    setDonusumIslemiYapTiklandiMi={
                      setDonusumIslemiYapTiklandiMi
                    }
                  />
                </Grid>
              </Grid>
            </>
          ) : (
            <>
              <Grid container minHeight={428} marginY={3}>
                <Grid
                  item
                  xs={12}
                  lg={12}
                  px={1}
                  sx={{ p: 1 }}
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                >
                  <Grid container>
                    <Grid
                      item
                      xs={12}
                      lg={12}
                      mb={2}
                      display={"flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                    >
                      <CustomSelect
                        labelId="nakitAkis"
                        id="nakitAkis"
                        size="small"
                        value={nakitAkisYontemi}
                        onChange={handleChange}
                        height={"36px"}
                      >
                        <MenuItem value={"nakitakisdogrudan"}>
                          Nakit Akış Tablosu: Doğrudan Yöntem
                        </MenuItem>
                        <MenuItem value={"nakitakisdolayli"}>
                          Nakit Akış Tablosu: Dolaylı Yöntem
                        </MenuItem>
                      </CustomSelect>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      lg={12}
                      display={"flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                    >
                      <Button
                        size="medium"
                        variant="outlined"
                        color="primary"
                        disabled={
                          donusumIslemiYapTiklandiMi ||
                          finansalTabloOlusturTiklandiMi
                        }
                        onClick={async () => {
                          setFinansalTabloOlusturTiklandiMi(true);
                          handleFinansalTabloOlustur();
                        }}
                        sx={{
                          height: "36px",
                        }}
                      >
                        Finansal Tablo Oluştur
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid
                  item
                  xs={12}
                  lg={12}
                  padding={1}
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                >
                  <DonusumIslemiCard
                    konsolidasyonMu={konsolidasyonMu}
                    donusumIslemiYapTiklandiMi={donusumIslemiYapTiklandiMi}
                    setDonusumIslemiYapTiklandiMi={
                      setDonusumIslemiYapTiklandiMi
                    }
                  />
                </Grid>
                <Grid item xs={12} lg={12} mt={1} padding={1}>
                  <DonusumMizanKontrolCardTable
                    konsolidasyonMu={konsolidasyonMu}
                    donusumIslemiYapTiklandiMi={donusumIslemiYapTiklandiMi}
                    setDonusumIslemiYapTiklandiMi={
                      setDonusumIslemiYapTiklandiMi
                    }
                  />
                </Grid>
                <Grid item xs={12} lg={12} padding={1}>
                  <DonusumMizanKontrol
                    konsolidasyonMu={konsolidasyonMu}
                    donusumIslemiYapTiklandiMi={donusumIslemiYapTiklandiMi}
                    setDonusumIslemiYapTiklandiMi={
                      setDonusumIslemiYapTiklandiMi
                    }
                  />
                </Grid>
              </Grid>
            </>
          )}
          <Box sx={{ display: "flex", flexDirection: "row", px: 1 }}>
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
        </>
      )}
      {isAlertOpen && (
        <InfoAlertCart
          openCartAlert={openCartAlert}
          setOpenCartAlert={setOpenCartAlert}
        ></InfoAlertCart>
      )}
    </Box>
  );
};

export default DonusumIslemiStepper;
