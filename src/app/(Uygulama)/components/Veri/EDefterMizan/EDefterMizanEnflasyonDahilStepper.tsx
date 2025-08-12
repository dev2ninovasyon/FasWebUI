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
import {
  Dialog,
  DialogContent,
  Divider,
  Fab,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { IconHistory } from "@tabler/icons-react";
import { IconX } from "@tabler/icons-react";
import { createAnaHesapMizan, createDetayHesapMizan } from "@/api/Veri/Mizan";
import {
  getStandartYevmiyeFisNo,
  getYevmiyeFisNo,
} from "@/api/Veri/HaricFisListesi";
import HaricFisListesiForm from "@/app/(Uygulama)/components/Veri/HaricFisListesi/HaricFisListesiForm";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import KurumlarVergisiBeyannamesiKarsilastirma from "@/app/(Uygulama)/components/Veri/Mizan/KurumlarVergisiBeyannamesiKarsilastirma";
import MizanCard from "@/app/(Uygulama)/components/Veri/Mizan/MizanCard";
import Mizan from "@/app/(Uygulama)/components/Veri/Mizan/Mizan";
import MizanTable from "@/app/(Uygulama)/components/Veri/Mizan/MizanTable";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import HaricFisListesiTable from "@/app/(Uygulama)/components/Veri/HaricFisListesi/HaricFisListesiTable";

const steps = [
  "Hariç Fiş Belirleme",
  "E-Defter Mizan Oluştuma",
  "KV. B. Karşılaştırma",
];

const EDefterMizanEnflasyonStepper = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());

  const customizer = useSelector((state: AppState) => state.customizer);
  const user = useSelector((state: AppState) => state.userReducer);
  const theme = useTheme();

  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));

  const [showDrawer, setShowDrawer] = React.useState(false);

  const [hesapNo, setHesapNo] = useState("");
  const [yevmiyeFisNo, setYevmiyeFisNo] = useState("");
  const [baslangicTarihi, setBaslangicTarihi] = useState(`${user.yil}-12-31`);
  const [bitisTarihi, setBitisTarihi] = useState(`${user.yil}-12-31`);

  const [mizanBaslangicTarihi, setMizanBaslangicTarihi] = useState(
    `${user.yil}-01-01`
  );
  const [mizanBitisTarihi, setMizanBitisTarihi] = useState(`${user.yil}-12-31`);

  const [loading, setLoading] = useState(false);

  const [mizanOlusturTiklandimi, setMizanOlusturTiklandimi] = useState(false);

  const [fisleriGosterTiklandimi, setFisleriGosterTiklandimi] = useState(false);

  const [standartFisleriGosterTiklandimi, setStandartFisleriGosterTiklandimi] =
    useState(false);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [openCartAlert, setOpenCartAlert] = useState(false);

  useEffect(() => {
    if (mizanOlusturTiklandimi) {
      setIsAlertOpen(true);
      setOpenCartAlert(true);
    } else {
      setIsAlertOpen(false);
      setOpenCartAlert(false);
    }
  }, [mizanOlusturTiklandimi]);

  const handleDrawerClose = () => {
    setShowDrawer(false);
  };

  const handleGetStandartYevmiyeFisNo = async () => {
    try {
      setYevmiyeFisNo("");
      setLoading(true);

      const standartfisListesi = await getStandartYevmiyeFisNo(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0
      );

      setYevmiyeFisNo(standartfisListesi);
      setStandartFisleriGosterTiklandimi(true);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const handleAnaHesapMizan = async () => {
    try {
      const result = await createAnaHesapMizan(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        mizanBaslangicTarihi,
        mizanBitisTarihi
      );
      if (result) {
        setMizanOlusturTiklandimi(false);
        enqueueSnackbar("Ana Hesap Mizan Oluşturuldu", {
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
        enqueueSnackbar("Ana Hesap Mizan Oluşturulamadı", {
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

  const handleDetayHesapMizan = async () => {
    try {
      const result = await createDetayHesapMizan(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        mizanBaslangicTarihi,
        mizanBitisTarihi
      );
      if (result) {
        setMizanOlusturTiklandimi(false);
        enqueueSnackbar("Detay Hesap Mizan Oluşturuldu", {
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
        enqueueSnackbar("Detay Hesap Mizan Oluşturulamadı", {
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

  const fetchData = async () => {
    try {
      const fisListesi = await getYevmiyeFisNo(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0
      );

      setYevmiyeFisNo(fisListesi);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
                sx={{
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
              Mizan Oluşturuldu
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 1, px: 1 }}>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleReset}>Başa Dön</Button>
          </Box>
        </>
      ) : (
        <>
          {activeStep == 0 ? (
            <>
              <Grid container marginTop={3}>
                <Grid item xs={12} lg={12} padding={1}>
                  <HaricFisListesiForm
                    hesapNo={hesapNo}
                    yevmiyeFisNo={yevmiyeFisNo}
                    baslangicTarihi={baslangicTarihi}
                    bitisTarihi={bitisTarihi}
                    setHesapNo={setHesapNo}
                    setYevmiyeFisNo={setYevmiyeFisNo}
                    setBaslangicTarihi={setBaslangicTarihi}
                    setBitisTarihi={setBitisTarihi}
                    setFisleriGosterTiklandimi={setFisleriGosterTiklandimi}
                  />
                </Grid>
              </Grid>
              <Grid container marginTop={3}>
                <Grid item xs={12} lg={12} padding={1}>
                  <HaricFisListesiTable
                    hesapNo={hesapNo}
                    yevmiyeFisNo={yevmiyeFisNo}
                    baslangicTarihi={baslangicTarihi}
                    bitisTarihi={bitisTarihi}
                    loading={loading}
                    setLoading={setLoading}
                    fisleriGosterTiklandimi={fisleriGosterTiklandimi}
                    standartfisleriGosterTiklandimi={
                      standartFisleriGosterTiklandimi
                    }
                    setFisleriGosterTiklandimi={setFisleriGosterTiklandimi}
                    setStandartFisleriGosterTiklandimi={
                      setStandartFisleriGosterTiklandimi
                    }
                    handleGetStandartYevmiyeFisNo={
                      handleGetStandartYevmiyeFisNo
                    }
                  />
                </Grid>
              </Grid>
            </>
          ) : activeStep == 1 ? (
            <>
              <Grid container marginTop={3}>
                <Grid item xs={12} lg={6} display="flex">
                  {lgDown ? (
                    <>
                      <Grid container p={1}>
                        <Grid
                          item
                          xs={12}
                          display="flex"
                          justifyContent={"space-between"}
                          mb={1}
                        >
                          <CustomFormLabel
                            htmlFor="mizanBaslangicTarihi"
                            sx={{
                              mt: 0,
                              mb: { xs: "-10px", sm: 0 },
                              mr: 0,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Typography variant="subtitle1">
                              Başlangıç Tarihi:
                            </Typography>
                          </CustomFormLabel>
                          <CustomTextField
                            id="mizanBaslangicTarihi"
                            type="date"
                            value={mizanBaslangicTarihi}
                            onChange={(e: any) =>
                              setMizanBaslangicTarihi(e.target.value)
                            }
                          />
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          display="flex"
                          justifyContent={"space-between"}
                          mb={1}
                        >
                          <CustomFormLabel
                            htmlFor="mizanBitisTarihi"
                            sx={{
                              mt: 0,
                              mb: { xs: "-10px", sm: 0 },
                              mr: 0,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Typography variant="subtitle1">
                              Bitiş Tarihi:
                            </Typography>
                          </CustomFormLabel>
                          <CustomTextField
                            id="mizanBitisTarihi"
                            type="date"
                            value={mizanBitisTarihi}
                            onChange={(e: any) =>
                              setMizanBitisTarihi(e.target.value)
                            }
                          />
                        </Grid>
                        <Grid item xs={12} mb={1}>
                          <Button
                            size="medium"
                            variant="outlined"
                            color="primary"
                            fullWidth
                            disabled={mizanOlusturTiklandimi}
                            onClick={() => {
                              setMizanOlusturTiklandimi(true);
                              handleAnaHesapMizan();
                            }}
                          >
                            Ana Hesap Mizan
                          </Button>
                        </Grid>
                        <Grid item xs={12} mb={2}>
                          <Button
                            size="medium"
                            variant="outlined"
                            color="primary"
                            fullWidth
                            disabled={mizanOlusturTiklandimi}
                            onClick={() => {
                              setMizanOlusturTiklandimi(true);
                              handleDetayHesapMizan();
                            }}
                          >
                            Detay Mizan
                          </Button>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          paddingX={1}
                          sx={{
                            display: "flex",
                            justifyContent: "end",
                            alignItems: "center",
                          }}
                        >
                          <Tooltip title="Mizan Oluşturma Kayıtları">
                            <Fab
                              color="warning"
                              size="small"
                              onClick={() => setShowDrawer(true)}
                            >
                              <IconHistory width={18.25} height={18.25} />
                            </Fab>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid container>
                        <Grid
                          item
                          lg={12}
                          display="flex"
                          justifyContent={"space-between"}
                          height={"30%"}
                          padding={1}
                        >
                          <CustomFormLabel
                            htmlFor="mizanBaslangicTarihi"
                            sx={{
                              mt: 0,
                              mb: { xs: "-10px", sm: 0 },
                              mr: 0,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Typography variant="subtitle1">
                              Başlangıç Tarihi:
                            </Typography>
                          </CustomFormLabel>
                          <CustomTextField
                            id="mizanBaslangicTarihi"
                            type="date"
                            value={mizanBaslangicTarihi}
                            onChange={(e: any) =>
                              setMizanBaslangicTarihi(e.target.value)
                            }
                          />
                          <CustomFormLabel
                            htmlFor="mizanBitisTarihi"
                            sx={{
                              mt: 0,
                              mb: { xs: "-10px", sm: 0 },
                              mr: 0,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Typography variant="subtitle1">
                              Bitiş Tarihi:
                            </Typography>
                          </CustomFormLabel>
                          <CustomTextField
                            id="mizanBitisTarihi"
                            type="date"
                            value={mizanBitisTarihi}
                            onChange={(e: any) =>
                              setMizanBitisTarihi(e.target.value)
                            }
                          />
                          <Button
                            size="medium"
                            variant="outlined"
                            color="primary"
                            disabled={mizanOlusturTiklandimi}
                            sx={{ height: "125%", width: "17%" }}
                            onClick={() => {
                              setMizanOlusturTiklandimi(true);
                              handleAnaHesapMizan();
                            }}
                          >
                            Ana Hesap Mizan
                          </Button>
                          <Button
                            size="medium"
                            variant="outlined"
                            color="primary"
                            disabled={mizanOlusturTiklandimi}
                            sx={{ height: "125%", width: "17%" }}
                            onClick={() => {
                              setMizanOlusturTiklandimi(true);
                              handleDetayHesapMizan();
                            }}
                          >
                            Detay Mizan
                          </Button>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          lg={12}
                          paddingX={1}
                          sx={{
                            display: "flex",
                            justifyContent: "end",
                            alignItems: "center",
                          }}
                        >
                          <Tooltip title="Mizan Oluşturma Kayıtları">
                            <Fab
                              color="warning"
                              size="small"
                              onClick={() => setShowDrawer(true)}
                            >
                              <IconHistory width={18.25} height={18.25} />
                            </Fab>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </>
                  )}
                </Grid>
                <Grid item xs={12} lg={6} padding={1}>
                  <MizanCard
                    type={"E-Defter"}
                    mizanOlusturTiklandimi={mizanOlusturTiklandimi}
                    setMizanOlusturTiklandimi={setMizanOlusturTiklandimi}
                  />
                </Grid>
              </Grid>
              <Grid container marginTop={3}>
                <Grid item xs={12} lg={12} padding={1}>
                  <Mizan
                    type={"E-Defter"}
                    mizanOlusturTiklandimi={mizanOlusturTiklandimi}
                    setMizanOlusturTiklandimi={setMizanOlusturTiklandimi}
                  />
                </Grid>
              </Grid>
            </>
          ) : (
            <Grid container marginTop={3}>
              <Grid item xs={12} lg={12} padding={1}>
                <KurumlarVergisiBeyannamesiKarsilastirma type={"E-Defter"} />
              </Grid>
            </Grid>
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
        <MizanTable type={"E-Defter"} />
      </Dialog>
      {isAlertOpen && (
        <InfoAlertCart
          openCartAlert={openCartAlert}
          setOpenCartAlert={setOpenCartAlert}
        ></InfoAlertCart>
      )}
    </Box>
  );
};

export default EDefterMizanEnflasyonStepper;
