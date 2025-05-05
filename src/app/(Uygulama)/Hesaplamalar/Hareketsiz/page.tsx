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
  Tab,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "react-redux";
import { enqueueSnackbar } from "notistack";
import {
  createHareketsizStoklar,
  createHareketsizTicariAlacaklar,
} from "@/api/Hesaplamalar/Hesaplamalar";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import Hareketsiz from "./Hareketsiz";
import HareketsizOrnekFisler from "./HareketsizOrnekFisler";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import HareketsizOzet from "./HareketsizOzet";
import { FloatingButtonFisler } from "@/app/(Uygulama)/components/Hesaplamalar/FloatingButtonFisler";
import { IconX } from "@tabler/icons-react";

const BCrumb = [
  {
    to: "/Hesaplamalar",
    title: "Hesaplamalar",
  },
  {
    to: "/Hesaplamalar/Hareketsiz",
    title: "Hareketsiz",
  },
];

const Page: React.FC = () => {
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [tip, setTip] = useState("TicariAlacaklar");
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTip(newValue);
  };
  const [acilisFisNo, setAcilisFisNo] = useState<number>(1);

  const [hesaplaTiklandimi, setHesaplaTiklandimi] = useState(false);
  const [kaydetTiklandimi, setKaydetTiklandimi] = useState(false);

  const [floatingButtonTiklandimi, setFloatingButtonTiklandimi] =
    useState(false);

  const [openCartAlert, setOpenCartAlert] = useState(false);

  const handleHesapla = async () => {
    try {
      if (tip == "TicariAlacaklar") {
        const result = await createHareketsizTicariAlacaklar(
          user.token || "",
          user.denetciId || 0,
          user.yil || 0,
          user.denetlenenId || 0,
          1
        );
        if (result) {
          setHesaplaTiklandimi(false);
          enqueueSnackbar("Hareketsiz Ticari Alacaklar Hesaplandı", {
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
          enqueueSnackbar("Hareketsiz Ticari Alacaklar Hesaplanamadı", {
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
      }
      if (tip == "Stoklar") {
        const result = await createHareketsizStoklar(
          user.token || "",
          user.denetciId || 0,
          user.yil || 0,
          user.denetlenenId || 0,
          1
        );
        if (result) {
          setHesaplaTiklandimi(false);
          enqueueSnackbar("Hareketsiz Stoklar Hesaplandı", {
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
          enqueueSnackbar("Hareketsiz Stoklar Hesaplanamadı", {
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
    <PageContainer title="Hareketsiz" description="this is Hareketsiz">
      <Breadcrumb title="Hareketsiz" items={BCrumb} />
      <Grid container>
        <Grid item xs={12} lg={12}>
          <TabContext value={tip}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              <Tab label="Ticari Alacaklar" value="TicariAlacaklar" />
              <Tab label="Stoklar" value="Stoklar" />
            </TabList>
            <Divider />
            <TabPanel value="TicariAlacaklar" sx={{ paddingX: 0 }}>
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
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CustomFormLabel
                      htmlFor="acilisFisNo"
                      sx={{ mt: 0, mb: { sm: 0 }, mr: 2 }}
                    >
                      <Typography variant="subtitle1">
                        Açılış Fiş No:
                      </Typography>
                    </CustomFormLabel>
                    <CustomTextField
                      id="acilisFisNo"
                      type="number"
                      value={acilisFisNo}
                      onChange={(e: any) => setAcilisFisNo(e.target.value)}
                    />
                  </Box>
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
                  <HareketsizOzet
                    hesaplaTiklandimi={hesaplaTiklandimi}
                    tip={tip}
                  />
                </Grid>
                <Grid item xs={12} lg={12}>
                  <Hareketsiz hesaplaTiklandimi={hesaplaTiklandimi} tip={tip} />
                </Grid>
              </Grid>
            </TabPanel>
            <TabPanel value="Stoklar" sx={{ paddingX: 0 }}>
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
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CustomFormLabel
                      htmlFor="acilisFisNo"
                      sx={{ mt: 0, mb: { sm: 0 }, mr: 2 }}
                    >
                      <Typography variant="subtitle1">
                        Açılış Fiş No:
                      </Typography>
                    </CustomFormLabel>
                    <CustomTextField
                      id="acilisFisNo"
                      type="number"
                      value={acilisFisNo}
                      onChange={(e: any) => setAcilisFisNo(e.target.value)}
                    />
                  </Box>
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
                  <HareketsizOzet
                    hesaplaTiklandimi={hesaplaTiklandimi}
                    tip={tip}
                  />
                </Grid>
                <Grid item xs={12} lg={12}>
                  <Hareketsiz hesaplaTiklandimi={hesaplaTiklandimi} tip={tip} />
                </Grid>
              </Grid>
            </TabPanel>
          </TabContext>
        </Grid>
        <FloatingButtonFisler
          handleClick={() => setFloatingButtonTiklandimi(true)}
        />
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
            <HareketsizOrnekFisler
              hesaplaTiklandimi={hesaplaTiklandimi}
              tip={tip}
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
