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
  Fab,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Tab,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "react-redux";
import { enqueueSnackbar } from "notistack";
import {
  createKidemTazminatiBobiEkBilgi,
  createKidemTazminatiHesapla,
  getKidemTazminatiBobiEkBilgi,
} from "@/api/Hesaplamalar/Hesaplamalar";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import KidemTazminatiBobiVeriYukleme from "./KidemTazminatiBobiVeriYukleme";
import { IconInfoCircle } from "@tabler/icons-react";
import KidemTazminatiBobiHesaplama from "./KidemTazminatiBobiHesaplama";
import { FloatingButtonFisler } from "@/app/(Uygulama)/components/Hesaplamalar/FloatingButtonFisler";
import { IconX } from "@tabler/icons-react";
import KidemTazminatiBobiOrnekFisler from "./KidemTazminatiBobiOrnekFisler";
import CustomSelect from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSelect";
import { getBaglantiBilgileriByTip } from "@/api/BaglantiBilgileri/BaglantiBilgileri";
import PaylasimBaglantisiPopUp from "@/app/(Uygulama)/components/PopUp/PaylasimBaglantisiPopUp";

const BCrumb = [
  {
    to: "/Hesaplamalar",
    title: "Hesaplamalar",
  },
  {
    to: "/Hesaplamalar/KidemTazminatiBobi",
    title: "Kıdem Tazminatı (Bobi)",
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
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const controller = "KidemTazminatiBobi";

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
    fetchedHesaplananKidemTazminatiToplami,
    setFetchedHesaplananKidemTazminatiToplami,
  ] = useState<Veri[]>([]);

  const [
    fetchedOdenenKidemTazminatiToplami,
    setFetchedOdenenKidemTazminatiToplami,
  ] = useState<Veri[]>([]);

  const [
    fetchedDonemIcinKaydedilecekKidemTazminati,
    setFetchedDonemIcinKaydedilecekKidemTazminati,
  ] = useState<Veri[]>([]);

  const [
    fetchedGecmisYillarIcinKaydedilecekKidemTazminati,
    setFetchedGecmisYillarIcinKaydedilecekKidemTazminati,
  ] = useState<Veri[]>([]);

  const [fetchedIsTenCikisKodlari, setFetchedIsTenCikisKodlari] = useState<
    Veri[]
  >([]);

  const [
    fetchedHesaplananKullanilmamisIzinKarsiligi,
    setFetchedHesaplananKullanilmamisIzinKarsiligi,
  ] = useState<Veri[]>([]);

  const [
    fetchedOncekiDonemKaydedilmisKullanilmamisIzinKarsiligi,
    setFetchedOncekiDonemKaydedilmisKullanilmamisIzinKarsiligi,
  ] = useState<Veri[]>([]);

  const [
    fetchedOdenenKaydedilecekKullanilmamisIzinKarsiligi,
    setFetchedKaydedilecekKullanilmamisIzinKarsiligi,
  ] = useState<Veri[]>([]);

  const [
    fetchedKidemTazminatiBobiOrnekFisler,
    setFetchedKidemTazminatiBobiOrnekFisler,
  ] = useState<Veri2[]>([]);

  const [floatingButtonTiklandimi, setFloatingButtonTiklandimi] =
    useState(false);

  const [hesaplansinMi, setHesaplansinMi] = useState("Evet");
  const handleChangeHesaplansinMi = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setHesaplansinMi(event.target.value);
  };

  const [kacGun, setKacGun] = useState(365);
  const handleChangeKacGun = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKacGun(parseInt(event.target.value));
  };

  const [hesaplananKarsilik, setHesaplananKarsilik] = useState<number>(0);
  const [izinKarsiligi, setIzinKarsiligi] = useState<number>(0);
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

  const [control, setControl] = useState(false);

  const [fetchedData, setFetchedData] = useState<Veri3 | null>(null);

  const [kaydetTiklandimi, setKaydetTiklandimi] = useState(false);

  const [hesaplaKaydetTiklandimi, setHesaplaKaydetTiklandimi] = useState(false);
  const [hesaplaTiklandimi, setHesaplaTiklandimi] = useState(false);

  const [openCartAlert, setOpenCartAlert] = useState(false);

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);

  const handleClosePopUp = () => {
    setIsPopUpOpen(false);
  };

  const handleHesapla = async () => {
    try {
      await fetchData2();
      setHesaplaTiklandimi(false);
      enqueueSnackbar("Kıdem Tazminatı (Bobi) Hesaplandı", {
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
      enqueueSnackbar("Kıdem Tazminatı (Bobi) Hesaplanamadı", {
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
      hesaplansinMi: hesaplansinMi,
      kacGun: kacGun,
      izinKarsiligi: izinKarsiligi,
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
    };
    try {
      const result = await createKidemTazminatiBobiEkBilgi(
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
      const kidemEkBilgiVerileri = await getKidemTazminatiBobiEkBilgi(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );
      if (kidemEkBilgiVerileri) {
        setHesaplananKarsilik(kidemEkBilgiVerileri.hesaplananKarsilik);
        setHesaplansinMi(kidemEkBilgiVerileri.hesaplansinMi);
        setIzinKarsiligi(kidemEkBilgiVerileri.izinKarsiligi);
        setKacGun(kidemEkBilgiVerileri.kacGun);
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
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData2 = async () => {
    try {
      const kidem = await createKidemTazminatiHesapla(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );

      const rows1: any = [];
      const rows2: any = [];
      const rows3: any = [];
      const rows4: any = [];
      const rows5: any = [];
      const rows6: any = [];
      const rows7: any = [];
      const rows8: any = [];
      const rows9: any = [];
      const rows10: any = [];

      kidem.kidemTazminatiSonuc.kidemTazminatiCalismasi.forEach((veri: any) => {
        const newRow: any = [veri.aciklama, veri.sayisi];
        rows1.push(newRow);
      });
      kidem.kidemTazminatiSonuc.hesaplananKidemTazminatiToplami.forEach(
        (veri: any) => {
          const newRow: any = [veri.aciklama, veri.sayisi];
          rows2.push(newRow);
        }
      );
      kidem.kidemTazminatiSonuc.odenenKidemTazminatiToplami.forEach(
        (veri: any) => {
          const newRow: any = [veri.aciklama, veri.sayisi];
          rows3.push(newRow);
        }
      );
      kidem.kidemTazminatiSonuc.donemIcinKaydedilecekKidemTazminati.forEach(
        (veri: any) => {
          const newRow: any = [veri.aciklama, veri.sayisi];
          rows4.push(newRow);
        }
      );
      kidem.kidemTazminatiSonuc.gecmisYillarIcinKaydedilecekKidemTazminati.forEach(
        (veri: any) => {
          const newRow: any = [veri.aciklama, veri.sayisi];
          rows5.push(newRow);
        }
      );
      kidem.kidemTazminatiSonuc.isTenCikisKodlari.forEach((veri: any) => {
        const newRow: any = [veri.aciklama, veri.sayisi];
        rows6.push(newRow);
      });
      kidem.kidemTazminatiSonuc.hesaplananKullanilmamisIzinKarsiligi.forEach(
        (veri: any) => {
          const newRow: any = [veri.aciklama, veri.sayisi];
          rows7.push(newRow);
        }
      );
      kidem.kidemTazminatiSonuc.oncekiDonemKaydedilmisKullanilmamisIzinKarsiligi.forEach(
        (veri: any) => {
          const newRow: any = [veri.aciklama, veri.sayisi];
          rows8.push(newRow);
        }
      );
      kidem.kidemTazminatiSonuc.kaydedilecekKullanilmamisIzinKarsiligi.forEach(
        (veri: any) => {
          const newRow: any = [veri.aciklama, veri.sayisi];
          rows9.push(newRow);
        }
      );
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
        rows10.push(newRow);
      });

      setFetchedKidemTazminatiCalismasi(rows1);
      setFetchedHesaplananKidemTazminatiToplami(rows2);
      setFetchedOdenenKidemTazminatiToplami(rows3);
      setFetchedDonemIcinKaydedilecekKidemTazminati(rows4);
      setFetchedGecmisYillarIcinKaydedilecekKidemTazminati(rows5);
      setFetchedIsTenCikisKodlari(rows6);
      setFetchedHesaplananKullanilmamisIzinKarsiligi(rows7);
      setFetchedOncekiDonemKaydedilmisKullanilmamisIzinKarsiligi(rows8);
      setFetchedKaydedilecekKullanilmamisIzinKarsiligi(rows9);
      setFetchedKidemTazminatiBobiOrnekFisler(rows10);
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
      setFetchedHesaplananKidemTazminatiToplami([]);
      setFetchedOdenenKidemTazminatiToplami([]);
      setFetchedDonemIcinKaydedilecekKidemTazminati([]);
      setFetchedGecmisYillarIcinKaydedilecekKidemTazminati([]);
      setFetchedIsTenCikisKodlari([]);
      setFetchedHesaplananKullanilmamisIzinKarsiligi([]);
      setFetchedOncekiDonemKaydedilmisKullanilmamisIzinKarsiligi([]);
      setFetchedKaydedilecekKullanilmamisIzinKarsiligi([]);
    } else {
      setOpenCartAlert(false);
    }
  }, [hesaplaTiklandimi]);

  return (
    <PageContainer
      title="Kıdem Tazminatı (Bobi)"
      description="this is Kıdem Tazminatı (Bobi)"
    >
      <Breadcrumb title="Kıdem Tazminatı (Bobi)" items={BCrumb} />
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
                  sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}
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
                    sx={{ ml: 2 }}
                    onClick={() => {
                      setKaydetTiklandimi(true);
                    }}
                  >
                    Kaydet
                  </Button>
                </Grid>
                <Grid item xs={12} lg={12}>
                  <KidemTazminatiBobiVeriYukleme
                    kaydetTiklandimi={kaydetTiklandimi}
                    setKaydetTiklandimi={setKaydetTiklandimi}
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
                    alignItems: "center",
                    justifyContent: "flex-end",
                    mb: 2,
                  }}
                >
                  <Tooltip title="Ek Bilgiler">
                    <Fab
                      color="info"
                      size="small"
                      onClick={() => setShowDrawer(true)}
                    >
                      <IconInfoCircle width={18.25} height={18.25} />
                    </Fab>
                  </Tooltip>
                  <Button
                    type="button"
                    size="medium"
                    disabled={hesaplaTiklandimi || kaydetTiklandimi}
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
                {fetchedKidemTazminatiCalismasi.length > 0 && (
                  <Grid item xs={12} lg={12} marginBottom={3}>
                    <KidemTazminatiBobiHesaplama
                      data={fetchedKidemTazminatiCalismasi}
                      title="Kıdem Tazminatı Çalışması"
                    />
                  </Grid>
                )}
                {fetchedHesaplananKidemTazminatiToplami.length > 0 && (
                  <Grid item xs={12} lg={12} marginBottom={3}>
                    <KidemTazminatiBobiHesaplama
                      data={fetchedHesaplananKidemTazminatiToplami}
                      title="Hesaplanan Dönem Kıdem Tazminatı Toplamı"
                    />
                  </Grid>
                )}
                {fetchedOdenenKidemTazminatiToplami.length > 0 && (
                  <Grid item xs={12} lg={12} marginBottom={3}>
                    <KidemTazminatiBobiHesaplama
                      data={fetchedOdenenKidemTazminatiToplami}
                      title="Ödenen Dönem Kıdem Tazminatı Toplamı"
                    />
                  </Grid>
                )}
                {fetchedDonemIcinKaydedilecekKidemTazminati.length > 0 && (
                  <Grid item xs={12} lg={12} marginBottom={3}>
                    <KidemTazminatiBobiHesaplama
                      data={fetchedDonemIcinKaydedilecekKidemTazminati}
                      title="Dönem İçin Kaydedilecek Kıdem Tazminatı"
                    />
                  </Grid>
                )}
                {fetchedGecmisYillarIcinKaydedilecekKidemTazminati.length >
                  0 && (
                  <Grid item xs={12} lg={12} marginBottom={3}>
                    <KidemTazminatiBobiHesaplama
                      data={fetchedGecmisYillarIcinKaydedilecekKidemTazminati}
                      title="Geçmiş Yıllar İçin Kaydedilecek Kıdem Tazminatı"
                    />
                  </Grid>
                )}
                {fetchedIsTenCikisKodlari.length > 0 && (
                  <Grid item xs={12} lg={12} marginBottom={3}>
                    <KidemTazminatiBobiHesaplama
                      data={fetchedIsTenCikisKodlari}
                      title="İşten Çıkış Kodları ve Açıklamaları"
                    />
                  </Grid>
                )}
                {fetchedHesaplananKullanilmamisIzinKarsiligi.length > 0 && (
                  <Grid item xs={12} lg={12} marginBottom={3}>
                    <KidemTazminatiBobiHesaplama
                      data={fetchedHesaplananKullanilmamisIzinKarsiligi}
                      title="Hesaplanan Kullanılmamış İzin Karşılığı"
                    />
                  </Grid>
                )}
                {fetchedOncekiDonemKaydedilmisKullanilmamisIzinKarsiligi.length >
                  0 && (
                  <Grid item xs={12} lg={12} marginBottom={3}>
                    <KidemTazminatiBobiHesaplama
                      data={
                        fetchedOncekiDonemKaydedilmisKullanilmamisIzinKarsiligi
                      }
                      title="Önceki Dönem Kaydedilmiş Kullanılmamış İzin Karşılığı"
                    />
                  </Grid>
                )}
                {fetchedOdenenKaydedilecekKullanilmamisIzinKarsiligi.length >
                  0 && (
                  <Grid item xs={12} lg={12}>
                    <KidemTazminatiBobiHesaplama
                      data={fetchedOdenenKaydedilecekKullanilmamisIzinKarsiligi}
                      title="Kaydedilecek Kullanılmamış İzin Karşılığı"
                    />
                  </Grid>
                )}
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
                            htmlFor="kacGun"
                            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                          >
                            <Typography variant="h6" p={1}>
                              Bir Yıl Kaç Gün Olarak Hesaplansın?
                            </Typography>
                          </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                          <CustomSelect
                            labelId="kacGun"
                            id="kacGun"
                            size="medium"
                            fullWidth
                            value={kacGun}
                            onChange={handleChangeKacGun}
                          >
                            <MenuItem value={365}>365</MenuItem>
                            <MenuItem value={360}>360</MenuItem>
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
                    <KidemTazminatiBobiOrnekFisler
                      data={fetchedKidemTazminatiBobiOrnekFisler}
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
