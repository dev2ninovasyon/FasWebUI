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
import { useSelector } from "@/store/hooks";
import { enqueueSnackbar } from "notistack";
import { createKrediHesaplanmis } from "@/api/Hesaplamalar/Hesaplamalar";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import KrediVeriYukleme from "./KrediVeriYukleme";
import KrediHesaplama from "./KrediHesaplama";
import { getBaglantiBilgileriByTip } from "@/api/BaglantiBilgileri/BaglantiBilgileri";
import PaylasimBaglantisiPopUp from "@/app/(Uygulama)/components/PopUp/PaylasimBaglantisiPopUp";
import KrediHesaplamaDetay from "./KrediHesaplamaDetay";
import { FloatingButtonFisler } from "@/app/(Uygulama)/components/Hesaplamalar/FloatingButtonFisler";
import { IconX } from "@tabler/icons-react";
import KrediHesaplamaOrnekFisler from "./KrediHesaplamaOrnekFisler";

const BCrumb = [
  {
    to: "/Hesaplamalar",
    title: "Hesaplamalar",
  },
  {
    to: "/Hesaplamalar/Kredi",
    title: "Kredi",
  },
];

interface Veri {
  id: number;
  link: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  tip: string;
}

const Page: React.FC = () => {
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const controller = "Kredi";

  const [tip, setTip] = useState("VeriYukleme");
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTip(newValue);
  };

  const [control, setControl] = useState(false);

  const [fetchedData, setFetchedData] = useState<Veri | null>(null);

  const [kaydetTiklandimi, setKaydetTiklandimi] = useState(false);

  const [hesaplaKaydetTiklandimi, setHesaplaKaydetTiklandimi] = useState(false);
  const [hesaplaTiklandimi, setHesaplaTiklandimi] = useState(false);

  const [sonKaydedilmeTarihi, setSonKaydedilmeTarihi] = useState("");

  const [floatingButtonTiklandimi, setFloatingButtonTiklandimi] =
    useState(false);

  const [openCartAlert, setOpenCartAlert] = useState(false);

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);

  const handleClosePopUp = () => {
    setIsPopUpOpen(false);
  };

  const handleHesapla = async () => {
    try {
      const result = await createKrediHesaplanmis(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );
      if (result) {
        setHesaplaTiklandimi(false);
        enqueueSnackbar("Kredi Hesaplandı", {
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
        enqueueSnackbar("Amortisman Hesaplanamadı", {
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
      const baglantiBilgisi = await getBaglantiBilgileriByTip(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.id || 0,
        user.yil || 0,
        controller
      );
      if (baglantiBilgisi != undefined) {
        // Tarihleri "DD.MM.YYYY HH:mm" formatında ayarla
        const formatDateTime = (dateTimeStr?: string) => {
          if (!dateTimeStr) return "";
          const date = new Date(dateTimeStr);
          const pad = (n: number) => n.toString().padStart(2, "0");
          return `${pad(date.getDate())}.${pad(
            date.getMonth() + 1
          )}.${date.getFullYear()} ${pad(date.getHours())}:${pad(
            date.getMinutes()
          )}`;
        };

        const newRow: Veri = {
          id: baglantiBilgisi.id,
          link: baglantiBilgisi.link,
          baslangicTarihi: formatDateTime(baglantiBilgisi.baslangicTarihi),
          bitisTarihi: formatDateTime(baglantiBilgisi.bitisTarihi),
          tip: baglantiBilgisi.tip,
        };
        setFetchedData(newRow);
      } else {
        setFetchedData(null);
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (control) {
      fetchData();
      setControl(false);
    }
  }, [control]);

  useEffect(() => {
    if (hesaplaTiklandimi) {
      setOpenCartAlert(true);
    } else {
      setOpenCartAlert(false);
    }
  }, [hesaplaTiklandimi]);

  return (
    <PageContainer title="Kredi" description="this is Kredi">
      <Breadcrumb title="Kredi" items={BCrumb} />
      <Grid container>
        <Grid item xs={12} lg={12}>
          <TabContext value={tip}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              <Tab label="Veri Yükleme" value="VeriYukleme" />
              <Tab label="Hesaplama" value="Hesaplama" />
            </TabList>
            <Divider />
            <TabPanel value="VeriYukleme" sx={{ paddingX: 0 }}>
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
                  {sonKaydedilmeTarihi && (
                    <Typography
                      variant="body2"
                      textAlign={"center"}
                      sx={{ mb: smDown ? 1 : 0 }}
                    >
                      Son Kaydedilme: {sonKaydedilmeTarihi}
                    </Typography>
                  )}
                  <Box flex={1}></Box>
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
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        setIsPopUpOpen(true);
                      }}
                    >
                      Paylaşım Bağlantısı
                    </Button>
                    <Button
                      type="button"
                      size="medium"
                      disabled={
                        kaydetTiklandimi ||
                        hesaplaTiklandimi ||
                        fetchedData != null
                      }
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        setKaydetTiklandimi(true);
                      }}
                    >
                      Kaydet
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12} lg={12}>
                  <KrediVeriYukleme
                    kaydetTiklandimi={kaydetTiklandimi}
                    setKaydetTiklandimi={setKaydetTiklandimi}
                    setSonKaydedilmeTarihi={setSonKaydedilmeTarihi}
                  />
                </Grid>
              </Grid>
            </TabPanel>
            <TabPanel value="Hesaplama" sx={{ paddingX: 0 }}>
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
                <Grid item xs={12} lg={12} mb={3}>
                  <KrediHesaplama hesaplaTiklandimi={hesaplaTiklandimi} />
                </Grid>
                <Grid item xs={12} lg={12}>
                  <KrediHesaplamaDetay hesaplaTiklandimi={hesaplaTiklandimi} />
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
                  <DialogContent
                    className="testdialog"
                    sx={{ overflow: "visible" }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      justifyContent={"space-between"}
                      alignItems="center"
                    >
                      <Box>
                        <Typography variant="h5" p={1}>
                          Sizin için oluşturduğum fişleri kaydetmek ister
                          misiniz?
                        </Typography>
                        <Typography variant="body1" p={1}>
                          Sizin için oluşturduğum fiş kayıtlarının doğruluğunu
                          mutlaka kontrol edin. Fişlerinizi kontrol etmeden
                          kaydetmek, hatalı kayıtların oluşmasına yol açabilir.
                          Unutmayın, bu alanda gerçekleştirdiğiniz işlemlerden
                          kaynaklanan hatalı kayıtlar
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
                    <KrediHesaplamaOrnekFisler
                      hesaplaTiklandimi={hesaplaTiklandimi}
                      kaydetTiklandimi={hesaplaKaydetTiklandimi}
                      setkaydetTiklandimi={setHesaplaKaydetTiklandimi}
                    />
                  </DialogContent>
                  <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
                    <Button
                      variant="outlined"
                      color="success"
                      onClick={() => {
                        setHesaplaKaydetTiklandimi(true);
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
            </TabPanel>
          </TabContext>
        </Grid>
        {isPopUpOpen && (
          <PaylasimBaglantisiPopUp
            controller={controller}
            setControl={setControl}
            isPopUpOpen={isPopUpOpen}
            handleClosePopUp={handleClosePopUp}
          ></PaylasimBaglantisiPopUp>
        )}
      </Grid>
    </PageContainer>
  );
};

export default Page;
