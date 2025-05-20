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
  MenuItem,
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
  createKidemTazminatiTfrsEkBilgi,
  createKidemTazminatiTfrsHesapla,
  getKidemTazminatiTfrsEkBilgi,
} from "@/api/Hesaplamalar/Hesaplamalar";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import KidemTazminatiTfrsVeriYukleme from "./KidemTazminatiTfrsVeriYukleme";
import { FloatingButtonFisler } from "@/app/(Uygulama)/components/Hesaplamalar/FloatingButtonFisler";
import { IconX } from "@tabler/icons-react";
import CustomSelect from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSelect";
import { getBaglantiBilgileriByTip } from "@/api/BaglantiBilgileri/BaglantiBilgileri";
import PaylasimBaglantisiPopUp from "@/app/(Uygulama)/components/PopUp/PaylasimBaglantisiPopUp";
import KidemTazminatiTfrsHesaplama from "./KidemTazminatiTfrsHesaplama";
import KidemTazminatiTfrsOrnekFisler from "./KidemTazminatiTfrsOrnekFisler";

const BCrumb = [
  {
    to: "/Hesaplamalar",
    title: "Hesaplamalar",
  },
  {
    to: "/Hesaplamalar/KidemTazminatiTfrs",
    title: "Kıdem Tazminatı (Tfrs)",
  },
];

interface Veri {
  aciklama: string;
  sayisi: number;
}

interface Veri2 {
  yevmiyeNo: number;
  fisTipi: string;
  detayKodu: string;
  hesapAdi: string;
  paraBirimi: string;
  borcTutari: number;
  alacakTutari: number;
  aciklama: string;
}

interface Veri3 {
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

  const controller = "KidemTazminatiTfrs";

  const [tip, setTip] = useState("VeriYukleme");
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTip(newValue);
  };

  const [showDrawer, setShowDrawer] = React.useState(false);
  const handleDrawerClose = () => {
    setShowDrawer(false);
  };

  const [fetchedKidemTazminatiCalismasi, setFetchedKidemTazminatiCalismasi] =
    useState<Veri[]>([]);

  const [
    fetchedKidemTazminatiTfrsOrnekFisler,
    setFetchedKidemTazminatiTfrsOrnekFisler,
  ] = useState<Veri2[]>([]);

  const [floatingButtonTiklandimi, setFloatingButtonTiklandimi] =
    useState(false);

  const [hesaplansinMi, setHesaplansinMi] = useState("Evet");
  const handleChangeHesaplansinMi = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setHesaplansinMi(event.target.value);
  };

  const [hesaplananKarsilik, setHesaplananKarsilik] = useState<number>(0);
  const [birikmisFon, setBirikmisFon] = useState<number>(0);
  const [izinKarsiligi, setIzinKarsiligi] = useState<number>(0);
  const [vergiOrani, setVergiOrani] = useState<number>(0);
  const [ayrilan2019, setAyrilan2019] = useState<number>(0);
  const [personel2019, setPersonel2019] = useState<number>(0);
  const [ayrilan2020, setAyrilan2020] = useState<number>(0);
  const [personel2020, setPersonel2020] = useState<number>(0);
  const [ayrilan2021, setAyrilan2021] = useState<number>(0);
  const [personel2021, setPersonel2021] = useState<number>(0);
  const [ayrilan2022, setAyrilan2022] = useState<number>(0);
  const [personel2022, setPersonel2022] = useState<number>(0);
  const [ayrilan2023, setAyrilan2023] = useState<number>(0);
  const [personel2023, setPersonel2023] = useState<number>(0);
  const [odenenKidemTazminati170, setOdenenKidemTazminati170] =
    useState<number>(0);
  const [kullanilmamisIzinKarsiligi170, setKullanilmamisIzinKarsiligi170] =
    useState<number>(0);
  const [odenenKidemTazminati258, setOdenenKidemTazminati258] =
    useState<number>(0);
  const [kullanilmamisIzinKarsiligi258, setKullanilmamisIzinKarsiligi258] =
    useState<number>(0);
  const [odenenKidemTazminati720, setOdenenKidemTazminati720] =
    useState<number>(0);
  const [kullanilmamisIzinKarsiligi720, setKullanilmamisIzinKarsiligi720] =
    useState<number>(0);
  const [odenenKidemTazminati730, setOdenenKidemTazminati730] =
    useState<number>(0);
  const [kullanilmamisIzinKarsiligi730, setKullanilmamisIzinKarsiligi730] =
    useState<number>(0);
  const [odenenKidemTazminati740, setOdenenKidemTazminati740] =
    useState<number>(0);
  const [kullanilmamisIzinKarsiligi740, setKullanilmamisIzinKarsiligi740] =
    useState<number>(0);
  const [odenenKidemTazminati750, setOdenenKidemTazminati750] =
    useState<number>(0);
  const [kullanilmamisIzinKarsiligi750, setKullanilmamisIzinKarsiligi750] =
    useState<number>(0);
  const [odenenKidemTazminati760, setOdenenKidemTazminati760] =
    useState<number>(0);
  const [kullanilmamisIzinKarsiligi760, setKullanilmamisIzinKarsiligi760] =
    useState<number>(0);
  const [odenenKidemTazminati770, setOdenenKidemTazminati770] =
    useState<number>(0);
  const [kullanilmamisIzinKarsiligi770, setKullanilmamisIzinKarsiligi770] =
    useState<number>(0);

  const [control, setControl] = useState(false);

  const [fetchedData, setFetchedData] = useState<Veri3 | null>(null);

  const [kaydetTiklandimi, setKaydetTiklandimi] = useState(false);

  const [hesaplaKaydetTiklandimi, setHesaplaKaydetTiklandimi] = useState(false);
  const [hesaplaTiklandimi, setHesaplaTiklandimi] = useState(false);

  const [sonKaydedilmeTarihi, setSonKaydedilmeTarihi] = useState("");

  const [openCartAlert, setOpenCartAlert] = useState(false);

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);

  const handleClosePopUp = () => {
    setIsPopUpOpen(false);
  };

  const handleHesapla = async () => {
    try {
      await fetchData2();
      setHesaplaTiklandimi(false);
      enqueueSnackbar("Kıdem Tazminatı (Tfrs) Hesaplandı", {
        variant: "success",
        autoHideDuration: 5000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.success.light
              : theme.palette.success.main,
        },
      });
    } catch (error) {
      enqueueSnackbar("Kıdem Tazminatı (Tfrs) Hesaplanamadı", {
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
  };

  const handleSave = async () => {
    const createdKidemEkBilgi = {
      denetciId: user.denetciId,
      yil: user.yil,
      denetlenenId: user.denetlenenId,
      hesaplananKarsilik: hesaplananKarsilik,
      birikmisFon: birikmisFon,
      hesaplansinMi: hesaplansinMi,
      izinKarsiligi: izinKarsiligi,
      vergiOrani: vergiOrani,
      ayrilan2019: ayrilan2019,
      personel2019: personel2019,
      ayrilan2020: ayrilan2020,
      personel2020: personel2020,
      ayrilan2021: ayrilan2021,
      personel2021: personel2021,
      ayrilan2022: ayrilan2022,
      personel2022: personel2022,
      ayrilan2023: ayrilan2023,
      personel2023: personel2023,
      odenenKidemTazminati170: odenenKidemTazminati170,
      kullanilmamisIzinKarsiligi170: kullanilmamisIzinKarsiligi170,
      odenenKidemTazminati258: odenenKidemTazminati258,
      kullanilmamisIzinKarsiligi258: kullanilmamisIzinKarsiligi258,
      odenenKidemTazminati720: odenenKidemTazminati720,
      kullanilmamisIzinKarsiligi720: kullanilmamisIzinKarsiligi720,
      odenenKidemTazminati730: odenenKidemTazminati730,
      kullanilmamisIzinKarsiligi730: kullanilmamisIzinKarsiligi730,
      odenenKidemTazminati740: odenenKidemTazminati740,
      kullanilmamisIzinKarsiligi740: kullanilmamisIzinKarsiligi740,
      odenenKidemTazminati750: odenenKidemTazminati750,
      kullanilmamisIzinKarsiligi750: kullanilmamisIzinKarsiligi750,
      odenenKidemTazminati760: odenenKidemTazminati760,
      kullanilmamisIzinKarsiligi760: kullanilmamisIzinKarsiligi760,
      odenenKidemTazminati770: odenenKidemTazminati770,
      kullanilmamisIzinKarsiligi770: kullanilmamisIzinKarsiligi770,
    };
    try {
      const result = await createKidemTazminatiTfrsEkBilgi(
        user.token || "",
        createdKidemEkBilgi
      );
      if (result) {
        handleDrawerClose();
        enqueueSnackbar("Ek Bilgiler Kaydedildi", {
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
        enqueueSnackbar("Ek Bilgiler Kaydedilemedi", {
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
      const kidemEkBilgiVerileri = await getKidemTazminatiTfrsEkBilgi(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );
      if (kidemEkBilgiVerileri) {
        setHesaplananKarsilik(kidemEkBilgiVerileri.hesaplananKarsilik);
        setBirikmisFon(kidemEkBilgiVerileri.birikmisFon);
        setHesaplansinMi(kidemEkBilgiVerileri.hesaplansinMi);
        setIzinKarsiligi(kidemEkBilgiVerileri.izinKarsiligi);
        setVergiOrani(kidemEkBilgiVerileri.vergiOrani);
        setAyrilan2019(kidemEkBilgiVerileri.ayrilan2019);
        setPersonel2019(kidemEkBilgiVerileri.personel2019);
        setAyrilan2020(kidemEkBilgiVerileri.ayrilan2020);
        setPersonel2020(kidemEkBilgiVerileri.personel2020);
        setAyrilan2021(kidemEkBilgiVerileri.ayrilan2021);
        setPersonel2021(kidemEkBilgiVerileri.personel2021);
        setAyrilan2022(kidemEkBilgiVerileri.ayrilan2022);
        setPersonel2022(kidemEkBilgiVerileri.personel2022);
        setAyrilan2023(kidemEkBilgiVerileri.ayrilan2023);
        setPersonel2023(kidemEkBilgiVerileri.personel2023);
        setOdenenKidemTazminati170(
          kidemEkBilgiVerileri.odenenKidemTazminati170
        );
        setKullanilmamisIzinKarsiligi170(
          kidemEkBilgiVerileri.kullanilmamisIzinKarsiligi170
        );
        setOdenenKidemTazminati258(
          kidemEkBilgiVerileri.odenenKidemTazminati258
        );
        setKullanilmamisIzinKarsiligi258(
          kidemEkBilgiVerileri.kullanilmamisIzinKarsiligi258
        );
        setOdenenKidemTazminati720(
          kidemEkBilgiVerileri.odenenKidemTazminati720
        );
        setKullanilmamisIzinKarsiligi720(
          kidemEkBilgiVerileri.kullanilmamisIzinKarsiligi720
        );
        setOdenenKidemTazminati730(
          kidemEkBilgiVerileri.odenenKidemTazminati730
        );
        setKullanilmamisIzinKarsiligi730(
          kidemEkBilgiVerileri.kullanilmamisIzinKarsiligi730
        );
        setOdenenKidemTazminati740(
          kidemEkBilgiVerileri.odenenKidemTazminati740
        );
        setKullanilmamisIzinKarsiligi740(
          kidemEkBilgiVerileri.kullanilmamisIzinKarsiligi740
        );
        setOdenenKidemTazminati750(
          kidemEkBilgiVerileri.odenenKidemTazminati750
        );
        setKullanilmamisIzinKarsiligi750(
          kidemEkBilgiVerileri.kullanilmamisIzinKarsiligi750
        );
        setOdenenKidemTazminati760(
          kidemEkBilgiVerileri.odenenKidemTazminati760
        );
        setKullanilmamisIzinKarsiligi760(
          kidemEkBilgiVerileri.kullanilmamisIzinKarsiligi760
        );
        setOdenenKidemTazminati770(
          kidemEkBilgiVerileri.odenenKidemTazminati770
        );
        setKullanilmamisIzinKarsiligi770(
          kidemEkBilgiVerileri.kullanilmamisIzinKarsiligi770
        );
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData2 = async () => {
    try {
      const kidem = await createKidemTazminatiTfrsHesapla(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );

      const rows1: any = [];
      const rows2: any = [];

      kidem.kidemTazminatiSonuc.forEach((veri: any) => {
        const newRow: any = [veri.aciklama, veri.sayisi];
        rows1.push(newRow);
      });

      kidem.ornekFisler.forEach((veri: any) => {
        const newRow: any = [
          veri.yevmiyeNo,
          veri.fisTipi,
          veri.detayKodu,
          veri.hesapAdi,
          veri.paraBirimi,
          veri.borcTutari,
          veri.alacakTutari,
          veri.aciklama,
        ];
        rows2.push(newRow);
      });

      setFetchedKidemTazminatiCalismasi(rows1);
      setFetchedKidemTazminatiTfrsOrnekFisler(rows2);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData3 = async () => {
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

        const newRow: Veri3 = {
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
    fetchData2();
    fetchData3();
  }, []);

  useEffect(() => {
    if (control) {
      fetchData3();
      setControl(false);
    }
  }, [control]);

  useEffect(() => {
    if (hesaplaTiklandimi) {
      setOpenCartAlert(true);
      setFetchedKidemTazminatiCalismasi([]);
    } else {
      setOpenCartAlert(false);
    }
  }, [hesaplaTiklandimi]);

  return (
    <PageContainer
      title="Kıdem Tazminatı (Tfrs)"
      description="this is Kıdem Tazminatı (Tfrs)"
    >
      <Breadcrumb title="Kıdem Tazminatı (Tfrs)" items={BCrumb} />
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
                      onClick={() => setShowDrawer(true)}
                    >
                      Ek Bilgi
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
                  <KidemTazminatiTfrsVeriYukleme
                    kaydetTiklandimi={kaydetTiklandimi}
                    setKaydetTiklandimi={setKaydetTiklandimi}
                    setSonKaydedilmeTarihi={setSonKaydedilmeTarihi}
                  />
                </Grid>
                <Dialog
                  open={showDrawer}
                  onClose={() => setShowDrawer(false)}
                  maxWidth={"md"}
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
                      <Typography variant="h5" p={1}>
                        Ek Bilgiler
                      </Typography>
                      <IconButton size="small" onClick={handleDrawerClose}>
                        <IconX size="18" />
                      </IconButton>
                    </Stack>
                  </DialogContent>
                  <Divider />
                  <DialogContent>
                    <Grid container>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="hesaplananKarsilik"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              Bir Önceki Yıl Hesaplanan Karşılık
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="hesaplananKarsilik"
                            type="number"
                            fullWidth
                            value={hesaplananKarsilik}
                            onChange={(e: any) =>
                              setHesaplananKarsilik(parseInt(e.target.value))
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="birikmisFon"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              Bir Önceki Yıl Birikmiş Fon
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="birikmisFon"
                            type="number"
                            fullWidth
                            value={birikmisFon}
                            onChange={(e: any) =>
                              setBirikmisFon(parseInt(e.target.value))
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="hesaplansinMi"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              Bir Yıldan Az Çalışma Süresi Olanlar İçin Kıdem
                              Tazminatı Hesaplansın mı?
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomSelect
                            labelId="hesaplansinMi"
                            id="hesaplansinMi"
                            size="medium"
                            fullWidth
                            value={hesaplansinMi}
                            onChange={handleChangeHesaplansinMi}
                          >
                            <MenuItem value={"Evet"}>Evet</MenuItem>
                            <MenuItem value={"Hayır"}>Hayır </MenuItem>
                          </CustomSelect>
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="izinKarsiligi"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              Bir Önceki Yıl Hesaplanan Kullanılmamış İzin
                              Karşılığı
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="izinKarsiligi"
                            type="number"
                            fullWidth
                            value={izinKarsiligi}
                            onChange={(e: any) =>
                              setIzinKarsiligi(parseInt(e.target.value))
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="vergiOrani"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              Vergi Oranı
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="vergiOrani"
                            type="number"
                            fullWidth
                            value={vergiOrani}
                            onChange={(e: any) =>
                              setVergiOrani(parseInt(e.target.value))
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 2,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="ayrilan2019"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              Tazminat Almadan Ayrılan Kişi Sayısı (
                              {user.yil ? user.yil - 4 : 0})
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="ayrilan2019"
                            type="number"
                            fullWidth
                            value={ayrilan2019}
                            onChange={(e: any) =>
                              setAyrilan2019(parseInt(e.target.value))
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="personel2019"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              Ortalama Personel Sayısı (
                              {user.yil ? user.yil - 4 : 0})
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="personel2019"
                            type="number"
                            fullWidth
                            value={personel2019}
                            onChange={(e: any) =>
                              setPersonel2019(parseInt(e.target.value))
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 2,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="ayrilan2020"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              Tazminat Almadan Ayrılan Kişi Sayısı (
                              {user.yil ? user.yil - 3 : 0})
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="ayrilan2020"
                            type="number"
                            fullWidth
                            value={ayrilan2020}
                            onChange={(e: any) =>
                              setAyrilan2020(parseInt(e.target.value))
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="personel2020"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              Ortalama Personel Sayısı (
                              {user.yil ? user.yil - 3 : 0})
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="personel2020"
                            type="number"
                            fullWidth
                            value={personel2020}
                            onChange={(e: any) =>
                              setPersonel2020(parseInt(e.target.value))
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 2,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="ayrilan2021"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              Tazminat Almadan Ayrılan Kişi Sayısı (
                              {user.yil ? user.yil - 2 : 0})
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="ayrilan2021"
                            type="number"
                            fullWidth
                            value={ayrilan2021}
                            onChange={(e: any) =>
                              setAyrilan2021(parseInt(e.target.value))
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="personel2021"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              Ortalama Personel Sayısı (
                              {user.yil ? user.yil - 2 : 0})
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="personel2021"
                            type="number"
                            fullWidth
                            value={personel2021}
                            onChange={(e: any) =>
                              setPersonel2021(parseInt(e.target.value))
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 2,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="ayrilan2022"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              Tazminat Almadan Ayrılan Kişi Sayısı (
                              {user.yil ? user.yil - 1 : 0})
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="ayrilan2022"
                            type="number"
                            fullWidth
                            value={ayrilan2022}
                            onChange={(e: any) =>
                              setAyrilan2022(parseInt(e.target.value))
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="personel2022"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              Ortalama Personel Sayısı (
                              {user.yil ? user.yil - 1 : 0})
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="personel2022"
                            type="number"
                            fullWidth
                            value={personel2022}
                            onChange={(e: any) =>
                              setPersonel2022(parseInt(e.target.value))
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 2,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="ayrilan2023"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              Tazminat Almadan Ayrılan Kişi Sayısı (
                              {user.yil ? user.yil : 0})
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="ayrilan2023"
                            type="number"
                            fullWidth
                            value={ayrilan2023}
                            onChange={(e: any) =>
                              setAyrilan2023(parseInt(e.target.value))
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="personel2023"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              Ortalama Personel Sayısı (
                              {user.yil ? user.yil : 0})
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="personel2023"
                            type="number"
                            fullWidth
                            value={personel2023}
                            onChange={(e: any) =>
                              setPersonel2023(parseInt(e.target.value))
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="odenenKidemTazminati170"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              170 Ödenen Kıdem Tazminatı Karşılığı
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="odenenKidemTazminati170"
                            type="number"
                            fullWidth
                            value={odenenKidemTazminati170}
                            onChange={(e: any) =>
                              setOdenenKidemTazminati170(e.target.value)
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="kullanilmamisIzinKarsiligi170"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              170 Kullanılmamış İzin Karşılığı
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="kullanilmamisIzinKarsiligi170"
                            type="number"
                            fullWidth
                            value={kullanilmamisIzinKarsiligi170}
                            onChange={(e: any) =>
                              setKullanilmamisIzinKarsiligi170(e.target.value)
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="odenenKidemTazminati258"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              258 Ödenen Kıdem Tazminatı Karşılığı
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="odenenKidemTazminati258"
                            type="number"
                            fullWidth
                            value={odenenKidemTazminati258}
                            onChange={(e: any) =>
                              setOdenenKidemTazminati258(e.target.value)
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="kullanilmamisIzinKarsiligi258"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              258 Kullanılmamış İzin Karşılığı
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="kullanilmamisIzinKarsiligi258"
                            type="number"
                            fullWidth
                            value={kullanilmamisIzinKarsiligi258}
                            onChange={(e: any) =>
                              setKullanilmamisIzinKarsiligi258(e.target.value)
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="odenenKidemTazminati720"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              720 Ödenen Kıdem Tazminatı Karşılığı
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="odenenKidemTazminati720"
                            type="number"
                            fullWidth
                            value={odenenKidemTazminati720}
                            onChange={(e: any) =>
                              setOdenenKidemTazminati720(e.target.value)
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="kullanilmamisIzinKarsiligi720"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              720 Kullanılmamış İzin Karşılığı
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="kullanilmamisIzinKarsiligi720"
                            type="number"
                            fullWidth
                            value={kullanilmamisIzinKarsiligi720}
                            onChange={(e: any) =>
                              setKullanilmamisIzinKarsiligi720(e.target.value)
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="odenenKidemTazminati730"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              730 Ödenen Kıdem Tazminatı Karşılığı
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="odenenKidemTazminati730"
                            type="number"
                            fullWidth
                            value={odenenKidemTazminati730}
                            onChange={(e: any) =>
                              setOdenenKidemTazminati730(e.target.value)
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="kullanilmamisIzinKarsiligi730"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              730 Kullanılmamış İzin Karşılığı
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="kullanilmamisIzinKarsiligi730"
                            type="number"
                            fullWidth
                            value={kullanilmamisIzinKarsiligi730}
                            onChange={(e: any) =>
                              setKullanilmamisIzinKarsiligi730(e.target.value)
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="odenenKidemTazminati740"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              740 Ödenen Kıdem Tazminatı Karşılığı
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="odenenKidemTazminati740"
                            type="number"
                            fullWidth
                            value={odenenKidemTazminati740}
                            onChange={(e: any) =>
                              setOdenenKidemTazminati740(e.target.value)
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="kullanilmamisIzinKarsiligi740"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              740 Kullanılmamış İzin Karşılığı
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="kullanilmamisIzinKarsiligi740"
                            type="number"
                            fullWidth
                            value={kullanilmamisIzinKarsiligi740}
                            onChange={(e: any) =>
                              setKullanilmamisIzinKarsiligi740(e.target.value)
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="odenenKidemTazminati750"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              750 Ödenen Kıdem Tazminatı Karşılığı
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="odenenKidemTazminati750"
                            type="number"
                            fullWidth
                            value={odenenKidemTazminati750}
                            onChange={(e: any) =>
                              setOdenenKidemTazminati750(e.target.value)
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="kullanilmamisIzinKarsiligi750"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              750 Kullanılmamış İzin Karşılığı
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="kullanilmamisIzinKarsiligi750"
                            type="number"
                            fullWidth
                            value={kullanilmamisIzinKarsiligi750}
                            onChange={(e: any) =>
                              setKullanilmamisIzinKarsiligi750(e.target.value)
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="odenenKidemTazminati760"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              760 Ödenen Kıdem Tazminatı Karşılığı
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="odenenKidemTazminati760"
                            type="number"
                            fullWidth
                            value={odenenKidemTazminati760}
                            onChange={(e: any) =>
                              setOdenenKidemTazminati760(e.target.value)
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="kullanilmamisIzinKarsiligi760"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              760 Kullanılmamış İzin Karşılığı
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="kullanilmamisIzinKarsiligi760"
                            type="number"
                            fullWidth
                            value={kullanilmamisIzinKarsiligi760}
                            onChange={(e: any) =>
                              setKullanilmamisIzinKarsiligi760(e.target.value)
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="odenenKidemTazminati770"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              770 Ödenen Kıdem Tazminatı Karşılığı
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="odenenKidemTazminati770"
                            type="number"
                            fullWidth
                            value={odenenKidemTazminati770}
                            onChange={(e: any) =>
                              setOdenenKidemTazminati770(e.target.value)
                            }
                          />
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={12}
                        sx={{
                          display: "flex",
                          alignContent: "center",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Grid item xs={12} lg={6}>
                          <CustomFormLabel
                            htmlFor="kullanilmamisIzinKarsiligi770"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              770 Kullanılmamış İzin Karşılığı
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomTextField
                            id="kullanilmamisIzinKarsiligi770"
                            type="number"
                            fullWidth
                            value={kullanilmamisIzinKarsiligi770}
                            onChange={(e: any) =>
                              setKullanilmamisIzinKarsiligi770(e.target.value)
                            }
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </DialogContent>
                  <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
                    <Button
                      variant="outlined"
                      color="success"
                      onClick={() => handleSave()}
                      sx={{ width: "20%" }}
                    >
                      Kaydet
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDrawerClose()}
                      sx={{ width: "20%" }}
                    >
                      Vazgeç
                    </Button>
                  </DialogActions>
                </Dialog>
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
                      disabled={hesaplaTiklandimi || kaydetTiklandimi}
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
                {fetchedKidemTazminatiCalismasi.length > 0 && (
                  <Grid item xs={12} lg={12} marginBottom={3}>
                    <KidemTazminatiTfrsHesaplama
                      data={fetchedKidemTazminatiCalismasi}
                      title="Kıdem Tazminatı Çalışması"
                    />
                  </Grid>
                )}
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
                    <KidemTazminatiTfrsOrnekFisler
                      data={fetchedKidemTazminatiTfrsOrnekFisler}
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
