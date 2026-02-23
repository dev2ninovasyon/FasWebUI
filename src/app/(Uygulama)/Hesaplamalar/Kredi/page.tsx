"use client";import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React, { useEffect, useRef, useState } from "react";
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
import KrediHesaplamaBakiye from "./KrediHesaplamaBakiye"
import { getBaglantiBilgileriByTip } from "@/api/BaglantiBilgileri/BaglantiBilgileri";
import PaylasimBaglantisiPopUp from "@/app/(Uygulama)/components/PopUp/PaylasimBaglantisiPopUp";
import KrediHesaplamaDetay from "./KrediHesaplamaDetay";
import KrediMizanKarsilastirmaTable from "./KrediMizanKarsilastirmaTable";
import { FloatingButtonFisler } from "@/app/(Uygulama)/components/Hesaplamalar/FloatingButtonFisler";
import { IconX, IconArrowsMaximize, IconArrowsMinimize } from "@tabler/icons-react";
import KrediHesaplamaOrnekFisler from "./KrediHesaplamaOrnekFisler";
import ExceleAktarButton from "@/app/(Uygulama)/components/Veri/ExceleAktarButton";import { saveAs } from "file-saver";

import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
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
  const [isFullScreen, setIsFullScreen] = useState(false);

  const krediHesaplamaRef = useRef<any>(null);
  const krediHesaplamaDetayRef = useRef<any>(null);
  const krediHesaplamaBakiyeRef = useRef<any>(null);
  const krediMizanKarsilastirmaRef = useRef<any>(null);

  const [hasData, setHasData] = useState(false);
  const [hasMizanDifference, setHasMizanDifference] = useState(false);
  const [openMizanDifferenceDialog, setOpenMizanDifferenceDialog] = useState(false);

  const handleDataCount = (count: number) => {
    if (count > 0) {
      setHasData(true);
    }
  };

  const handleClosePopUp = () => {
    setIsPopUpOpen(false);
  };

  const handleHesapla = async () => {
    try {
      setHesaplaTiklandimi(true);

      const result = await createKrediHesaplanmis(user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );

      if (result?.success) {
        setHesaplaTiklandimi(false);

        // Warnings varsa göster
        if (result.warnings && result.warnings.length > 0) {
          result.warnings.forEach((warning: string) => {
            enqueueSnackbar(warning, {
              variant: "warning",
              autoHideDuration: 7000,
              style: {
                backgroundColor:
                  customizer.activeMode === "dark"
                    ? theme.palette.warning.light
                    : theme.palette.warning.main,
              },
            });
          });
        }

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
      console.log("Bir hata oluştu:", error);
    }
  };

  const handleHesaplaClick = () => {
    if (hasMizanDifference) {
      setOpenMizanDifferenceDialog(true);
      return;
    }

    handleHesapla();
  };

  const handleDownloadAll = async () => {
    const { default: ExcelJS } = await import("exceljs");
    const workbook = new ExcelJS.Workbook();

    const addSheet = (ref: any, name: string) => {
      if (ref.current && ref.current.hotInstance) {
        const hotInstance = ref.current.hotInstance;
        const data = hotInstance.getData();
        const headers = hotInstance.getColHeader();
        const fullData = [
          headers,
          ...data.map((row: any[]) => row.slice(0, headers.length)),
        ];

        const worksheet = workbook.addWorksheet(name);

        fullData.forEach((row: any) => {
          worksheet.addRow(row);
        });

        const headerRow = worksheet.getRow(1);
        headerRow.font = {
          name: "Calibri",
          size: 12,
          bold: true,
          color: { argb: "FFFFFF" },
        };
        headerRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "1a6786" },
        };
        headerRow.alignment = { horizontal: "left" };

        worksheet.columns.forEach((column) => {
          column.width = 25;
        });
      }
    };

    addSheet(krediMizanKarsilastirmaRef, "Kredi Mizan Karşılaştırma");
    addSheet(krediHesaplamaRef, "Kredi Hesaplama");
    addSheet(krediHesaplamaDetayRef, "Kredi Hesaplama Detay");
    addSheet(krediHesaplamaBakiyeRef, "Kredi Hesaplama Bakiye");

    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "KrediRaporu.xlsx");
      enqueueSnackbar("Excel raporu başarıyla oluşturuldu", { variant: "success" });
    } catch (error) {
      console.error("Excel oluşturma hatası:", error);
      enqueueSnackbar("Excel oluşturulurken bir hata oluştu", { variant: "error" });
    }
  };

  const fetchData = async () => {
    try {
      const baglantiBilgisi = await getBaglantiBilgileriByTip(user.denetciId || 0,
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
        setHasData(true);
      } else {
        setFetchedData(null);
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
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
      setHasData(false);
    } else {
      setOpenCartAlert(false);
    }
  }, [hesaplaTiklandimi]);

  return (
    <PageContainer title="Kredi" description="this is Kredi">
      <Breadcrumb title="Kredi" items={BCrumb}>
        <EkBelgeYukleButton formKodu="KrediHesaplanmis" />
      </Breadcrumb>
      <Grid container>
        <Grid
          size={{
            xs: 12,
            lg: 12
          }}>
          <TabContext value={tip}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              <Tab label="Veri Yükleme" value="VeriYukleme" />
              <Tab label="Hesaplama" value="Hesaplama" />
            </TabList>
            <Divider />
            <TabPanel value="VeriYukleme" sx={{ paddingX: 0 }}>
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
                <Grid
                  size={{
                    xs: 12,
                    lg: 12
                  }}>
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
                  mb={3}
                  size={{
                    xs: 12,
                    lg: 12
                  }}>
                  <KrediMizanKarsilastirmaTable
                    ref={krediMizanKarsilastirmaRef}
                    hesaplaTiklandimi={hesaplaTiklandimi}
                    onHasDifferenceChange={setHasMizanDifference}
                  />
                </Grid>
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
                      flexDirection: smDown ? "column" : "row",
                      gap: 1,
                      width: smDown ? "100%" : "auto",
                    }}
                  >
                    <ExceleAktarButton handleDownload={handleDownloadAll} />
                    <Button
                      type="button"
                      size="medium"
                      disabled={hesaplaTiklandimi}
                      variant="outlined"
                      color="primary"
                      onClick={handleHesaplaClick}
                    >
                      Hesapla
                    </Button>
                  </Box>
                </Grid>
                <Grid
                  mb={3}
                  size={{
                    xs: 12,
                    lg: 12
                  }}>
                  <KrediHesaplama
                    ref={krediHesaplamaRef}
                    hesaplaTiklandimi={hesaplaTiklandimi}
                    onDataCount={handleDataCount}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    lg: 12
                  }}>
                  <KrediHesaplamaDetay
                    ref={krediHesaplamaDetayRef}
                    hesaplaTiklandimi={hesaplaTiklandimi}
                    onDataCount={handleDataCount}
                  />
                </Grid>
                <Grid
                  mb={3}
                  size={{
                    xs: 12,
                    lg: 12
                  }}>
                  <KrediHesaplamaBakiye
                    ref={krediHesaplamaBakiyeRef}
                    hesaplaTiklandimi={hesaplaTiklandimi}
                    onDataCount={handleDataCount}
                  />
                </Grid>
                {hasData && (
                  <FloatingButtonFisler
                    handleClick={() => setFloatingButtonTiklandimi(true)}
                  />
                )}
                <Dialog
                  open={openMizanDifferenceDialog}
                  onClose={() => setOpenMizanDifferenceDialog(false)}
                  fullWidth
                  maxWidth="sm"
                >
                  <DialogContent className="testdialog" sx={{ overflow: "visible" }}>
                    <Box>
                      <Typography variant="h5" p={1}>
                        Uyarı
                      </Typography>
                      <Typography variant="body1" p={1}>
                      Mizan ile girilen kredi listesi arasında fark vardır.
                      Hesaplamaya devam etmek istiyor musunuz?
                      </Typography>
                    </Box>
                  </DialogContent>
                  <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
                    <Button
                      variant="outlined"
                      color="success"
                      sx={{ width: "20%", whiteSpace: "nowrap" }}
                      onClick={() => {
                        setOpenMizanDifferenceDialog(false);
                        handleHesapla();
                      }}
                    >
                      Evet, Devam Et
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      sx={{ width: "20%", whiteSpace: "nowrap" }}
                      onClick={() => setOpenMizanDifferenceDialog(false)}
                    >
                      Hayır, Vazgeç
                    </Button>
                  </DialogActions>
                </Dialog>
                <Dialog
                  open={floatingButtonTiklandimi}
                  onClose={() => setFloatingButtonTiklandimi(false)}
                  fullWidth
                  maxWidth={false}
                  fullScreen={isFullScreen}
                  PaperProps={isFullScreen ? {} : { sx: { maxWidth: "98vw" } }}
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
                      <Box display="flex" alignItems="center">
                        <IconButton
                          size="small"
                          onClick={() => setIsFullScreen(!isFullScreen)}
                        >
                          {isFullScreen ? (
                            <IconArrowsMinimize size="24" />
                          ) : (
                            <IconArrowsMaximize size="24" />
                          )}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setFloatingButtonTiklandimi(false)}
                        >
                          <IconX size="24" />
                        </IconButton>
                      </Box>
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
