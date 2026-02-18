"use client";

import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { alpha } from "@mui/material/styles";
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
import { useSelector } from "@/store/hooks";
import { enqueueSnackbar } from "notistack";
import {
  createKidemTazminatiBobiEkBilgi,
  createKidemTazminatiBobiHesapla,
  getKidemTazminatiBobiEkBilgi,
} from "@/api/Hesaplamalar/Hesaplamalar";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import KidemTazminatiBobiVeriYukleme from "./KidemTazminatiBobiVeriYukleme";
import KidemTazminatiBobiHesaplama from "./KidemTazminatiBobiHesaplama";
import { FloatingButtonFisler } from "@/app/(Uygulama)/components/Hesaplamalar/FloatingButtonFisler";
import { IconX } from "@tabler/icons-react";
import KidemTazminatiBobiOrnekFisler from "./KidemTazminatiBobiOrnekFisler";
import CustomSelect from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSelect";
import { getBaglantiBilgileriByTip } from "@/api/BaglantiBilgileri/BaglantiBilgileri";
import PaylasimBaglantisiPopUp from "@/app/(Uygulama)/components/PopUp/PaylasimBaglantisiPopUp";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { Collapse } from "@mui/material";
import NumericInput from "@/app/(Uygulama)/components/Forms/ThemeElements/NumericInput";

import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
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
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const [openHesapDetay, setOpenHesapDetay] = useState(true);
  const [openIzinDetay, setOpenIzinDetay] = useState(true);
  const [openOdenenKidem, setOpenOdenenKidem] = useState(false);
  const [openTurnover, setOpenTurnover] = useState(false);

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
  const [hesap620, setHesap620] = useState<number>(0);
  const [hesap622, setHesap622] = useState<number>(0);
  const [hesap630, setHesap630] = useState<number>(0);
  const [hesap631, setHesap631] = useState<number>(0);
  const [hesap632, setHesap632] = useState<number>(0);
  const [hesap620Izin, setHesap620Izin] = useState<number>(0);
  const [hesap622Izin, setHesap622Izin] = useState<number>(0);
  const [hesap630Izin, setHesap630Izin] = useState<number>(0);
  const [hesap631Izin, setHesap631Izin] = useState<number>(0);
  const [hesap632Izin, setHesap632Izin] = useState<number>(0);
  const [hesap720, setHesap720] = useState<number>(0);
  const [hesap730, setHesap730] = useState<number>(0);
  const [hesap740, setHesap740] = useState<number>(0);
  const [hesap750, setHesap750] = useState<number>(0);
  const [hesap760, setHesap760] = useState<number>(0);
  const [hesap770, setHesap770] = useState<number>(0);
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
      hesap620: hesap620,
      hesap622: hesap622,
      hesap630: hesap630,
      hesap631: hesap631,
      hesap632: hesap632,
      hesap620Izin: hesap620Izin,
      hesap622Izin: hesap622Izin,
      hesap630Izin: hesap630Izin,
      hesap631Izin: hesap631Izin,
      hesap632Izin: hesap632Izin,
      hesap720: hesap720,
      hesap730: hesap730,
      hesap740: hesap740,
      hesap750: hesap750,
      hesap760: hesap760,
      hesap770: hesap770,
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
      const result = await createKidemTazminatiBobiEkBilgi(createdKidemEkBilgi
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
      console.log("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const kidemEkBilgiVerileri = await getKidemTazminatiBobiEkBilgi(user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );
      if (kidemEkBilgiVerileri) {
        setHesaplananKarsilik(kidemEkBilgiVerileri.hesaplananKarsilik);
        setHesaplansinMi(kidemEkBilgiVerileri.hesaplansinMi);
        setIzinKarsiligi(kidemEkBilgiVerileri.izinKarsiligi);
        setKacGun(kidemEkBilgiVerileri.kacGun);
        setHesap720(kidemEkBilgiVerileri.hesap720);
        setHesap730(kidemEkBilgiVerileri.hesap730);
        setHesap740(kidemEkBilgiVerileri.hesap740);
        setHesap750(kidemEkBilgiVerileri.hesap750);
        setHesap760(kidemEkBilgiVerileri.hesap760);
        setHesap770(kidemEkBilgiVerileri.hesap770);
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
      console.log("Bir hata oluştu:", error);
    }
  };

  const fetchData2 = async () => {
    try {
      const kidem = await createKidemTazminatiBobiHesapla(user.denetciId || 0,
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
      console.log("Bir hata oluştu:", error);
    }
  };

  const fetchData3 = async () => {
    try {
      const baglantiBilgisi = await getBaglantiBilgileriByTip(user.denetciId || 0,
        user.denetlenenId || 0,
        user.id || 0,
        user.yil || 0,
        controller
      );
      if (baglantiBilgisi != undefined) {
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
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    const toplam =
      Number(hesap620) +
      Number(hesap622) +
      Number(hesap630) +
      Number(hesap631) +
      Number(hesap632);

    setHesaplananKarsilik(toplam);
  }, [hesap620, hesap622, hesap630, hesap631, hesap632]);

  useEffect(() => {
    const toplamIzin =
      Number(hesap620Izin) +
      Number(hesap622Izin) +
      Number(hesap630Izin) +
      Number(hesap631Izin) +
      Number(hesap632Izin);
    setIzinKarsiligi(toplamIzin);
  }, [hesap620Izin, hesap622Izin, hesap630Izin, hesap631Izin, hesap632Izin]);

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
    <PageContainer title="Kıdem Tazminatı (Bobi)" description="this is Kıdem Tazminatı (Bobi)">
      <Breadcrumb title="Kıdem Tazminatı (Bobi)" items={BCrumb}>
        <EkBelgeYukleButton formKodu="KidemTazminatiBobiHesaplanmis" />
      </Breadcrumb>
      <Grid container>
        <Grid size={12}>
          <TabContext value={tip}>
            <TabList onChange={(e, v) => setTip(v)}>
              <Tab label="Veri Yükleme" value="VeriYukleme" />
              <Tab label="Hesaplama" value="Hesaplama" />
            </TabList>
            <Divider />
            <TabPanel value="VeriYukleme" sx={{ paddingX: 0 }}>
              <KidemTazminatiBobiVeriYukleme kaydetTiklandimi={kaydetTiklandimi} setKaydetTiklandimi={setKaydetTiklandimi} setSonKaydedilmeTarihi={setSonKaydedilmeTarihi} sonKaydedilmeTarihi={sonKaydedilmeTarihi} setIsPopUpOpen={setIsPopUpOpen} setShowDrawer={setShowDrawer} isDataFetched={fetchedData != null} />

              <Dialog open={showDrawer} onClose={handleDrawerClose} maxWidth="md" fullWidth>
                <DialogContent sx={{ overflow: "visible" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5" p={1}>Ek Bilgiler</Typography>
                    <IconButton size="small" onClick={handleDrawerClose}><IconX size="18" /></IconButton>
                  </Stack>
                </DialogContent>
                <Divider />
                <DialogContent>
                  <Grid container spacing={2}>
                    <Grid
                      size={{
                        xs: 12,
                        lg: 6
                      }}><CustomFormLabel>Bir Önceki Yıl Hesaplanan Kıdem Karşılık
                        <Box
                          sx={(theme) => ({
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.75,
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            border: `1px solid ${alpha(theme.palette.warning.main, 0.35)}`,
                            backgroundColor: alpha(theme.palette.warning.main, 0.08),
                            color: theme.palette.warning.dark,
                            width: "fit-content",
                          })}
                        >
                          <WarningAmberRoundedIcon sx={{ fontSize: 16, opacity: 0.9 }} />
                          <Typography sx={{ fontSize: 12, opacity: 0.9 }}>
                            İlk önce detay verilerini giriniz...
                          </Typography>
                        </Box>
                      </CustomFormLabel>
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,
                        lg: 6
                      }}><NumericInput fullWidth value={hesaplananKarsilik} onChange={(val) => setHesaplananKarsilik(val)} /></Grid>

                    <Grid size={12}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        onClick={() => setOpenHesapDetay(!openHesapDetay)}
                        sx={{ cursor: 'pointer', mt: 2 }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Bir Önceki Yıl Hesaplanan Kıdem KarşılıkDetayları
                        </Typography>
                        {openHesapDetay ? <IconChevronUp size="20" /> : <IconChevronDown size="20" />}
                      </Stack>
                      <Divider />
                    </Grid>
                    <Grid size={12}>
                      <Collapse in={openHesapDetay}>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><CustomFormLabel>620 Hesap</CustomFormLabel></Grid>
                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><NumericInput fullWidth value={hesap620} onChange={(val) => setHesap620(val)} /></Grid>
                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><CustomFormLabel>622 Hesap</CustomFormLabel></Grid>
                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><NumericInput fullWidth value={hesap622} onChange={(val) => setHesap622(val)} /></Grid>

                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><CustomFormLabel>630 Hesap</CustomFormLabel></Grid>
                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><NumericInput fullWidth value={hesap630} onChange={(val) => setHesap630(val)} /></Grid>

                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><CustomFormLabel>631 Hesap</CustomFormLabel></Grid>
                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><NumericInput fullWidth value={hesap631} onChange={(val) => setHesap631(val)} /></Grid>

                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><CustomFormLabel>632 Hesap</CustomFormLabel></Grid>
                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><NumericInput fullWidth value={hesap632} onChange={(val) => setHesap632(val)} /></Grid>

                        </Grid>
                      </Collapse>
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,
                        lg: 6
                      }}><CustomFormLabel>1 Yıldan Az Çalışanlar İçin Hesaplansın mı?</CustomFormLabel></Grid>
                    <Grid
                      size={{
                        xs: 12,
                        lg: 6
                      }}><CustomSelect fullWidth value={hesaplansinMi} onChange={(e: any) => setHesaplansinMi(e.target.value)}><MenuItem value="Evet">Evet</MenuItem><MenuItem value="Hayır">Hayır</MenuItem></CustomSelect></Grid>

                    <Grid
                      size={{
                        xs: 12,
                        lg: 6
                      }}>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                        <CustomFormLabel>Bir Önceki Yıl İzin Karşılığı

                        </CustomFormLabel>
                        <Box
                          sx={(theme) => ({
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.75,
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            border: `0.5px solid ${alpha(theme.palette.warning.main, 0.35)}`,
                            backgroundColor: alpha(theme.palette.warning.main, 0.08),
                            color: theme.palette.warning.dark,
                            width: "fit-content",
                          })}
                        >
                          <WarningAmberRoundedIcon sx={{ fontSize: 16, opacity: 0.9 }} />
                          <Typography sx={{ fontSize: 12, opacity: 0.9 }}>
                            İlk önce detay verilerini giriniz...
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid
                      size={{
                        xs: 12,
                        lg: 6
                      }}><NumericInput fullWidth value={izinKarsiligi} onChange={(val) => setIzinKarsiligi(val)} /></Grid>

                    <Grid size={12}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        onClick={() => setOpenIzinDetay(!openIzinDetay)}
                        sx={{ cursor: 'pointer', mt: 2 }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Bir Önceki Yıl İzin Karşılığı Detayları
                        </Typography>
                        {openIzinDetay ? <IconChevronUp size="20" /> : <IconChevronDown size="20" />}
                      </Stack>
                      <Divider />
                    </Grid>
                    <Grid size={12}>
                      <Collapse in={openIzinDetay}>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><CustomFormLabel>620 Hesap</CustomFormLabel></Grid>
                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><NumericInput fullWidth value={hesap620Izin} onChange={(val) => setHesap620Izin(val)} /></Grid>
                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><CustomFormLabel>622 Hesap</CustomFormLabel></Grid>
                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><NumericInput fullWidth value={hesap622Izin} onChange={(val) => setHesap622Izin(val)} /></Grid>

                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><CustomFormLabel>630 Hesap</CustomFormLabel></Grid>
                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><NumericInput fullWidth value={hesap630Izin} onChange={(val) => setHesap630Izin(val)} /></Grid>

                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><CustomFormLabel>631 Hesap</CustomFormLabel></Grid>
                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><NumericInput fullWidth value={hesap631Izin} onChange={(val) => setHesap631Izin(val)} /></Grid>

                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><CustomFormLabel>632 Hesap</CustomFormLabel></Grid>
                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><NumericInput fullWidth value={hesap632Izin} onChange={(val) => setHesap632Izin(val)} /></Grid>

                        </Grid>
                      </Collapse>
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,
                        lg: 6
                      }}><CustomFormLabel>Bir Yıl Kaç Gün?</CustomFormLabel></Grid>
                    <Grid
                      size={{
                        xs: 12,
                        lg: 6
                      }}><CustomSelect fullWidth value={kacGun} onChange={(e: any) => setKacGun(Number(e.target.value))}><MenuItem value={365}>365</MenuItem><MenuItem value={360}>360</MenuItem></CustomSelect></Grid>

                    <Grid size={12}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        onClick={() => setOpenOdenenKidem(!openOdenenKidem)}
                        sx={{ cursor: 'pointer', mt: 2 }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Cari Yıl İçinde Ödenen Kıdem Tazminatı Verileri
                        </Typography>
                        {openOdenenKidem ? <IconChevronUp size="20" /> : <IconChevronDown size="20" />}
                      </Stack>
                      <Divider />
                    </Grid>

                    <Grid size={12}>
                      <Collapse in={openOdenenKidem}>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><CustomFormLabel>720 Hesap</CustomFormLabel></Grid>
                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><NumericInput fullWidth value={hesap720} onChange={(val) => setHesap720(val)} /></Grid>

                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><CustomFormLabel>730 Hesap</CustomFormLabel></Grid>
                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><NumericInput fullWidth value={hesap730} onChange={(val) => setHesap730(val)} /></Grid>

                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><CustomFormLabel>740 Hesap</CustomFormLabel></Grid>
                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><NumericInput fullWidth value={hesap740} onChange={(val) => setHesap740(val)} /></Grid>

                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><CustomFormLabel>750 Hesap</CustomFormLabel></Grid>
                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><NumericInput fullWidth value={hesap750} onChange={(val) => setHesap750(val)} /></Grid>

                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><CustomFormLabel>760 Hesap</CustomFormLabel></Grid>
                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><NumericInput fullWidth value={hesap760} onChange={(val) => setHesap760(val)} /></Grid>

                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><CustomFormLabel>760 Hesap</CustomFormLabel></Grid>
                          <Grid
                            size={{
                              xs: 12,
                              lg: 6
                            }}><NumericInput fullWidth value={hesap770} onChange={(val) => setHesap770(val)} /></Grid>
                        </Grid>
                      </Collapse>
                    </Grid>

                    <Grid size={12}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        onClick={() => setOpenTurnover(!openTurnover)}
                        sx={{ cursor: 'pointer', mt: 2 }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Personel Verileri
                        </Typography>
                        {openTurnover ? <IconChevronUp size="20" /> : <IconChevronDown size="20" />}
                      </Stack>
                      <Divider />
                    </Grid>

                    <Grid size={12}>
                      <Collapse in={openTurnover}>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          {[2019, 2020, 2021, 2022, 2023].map((yil) => {
                            const yrAyrilan = yil === 2019 ? ayrilan2019 : yil === 2020 ? ayrilan2020 : yil === 2021 ? ayrilan2021 : yil === 2022 ? ayrilan2022 : ayrilan2023;
                            const setYrAyrilan = yil === 2019 ? setAyrilan2019 : yil === 2020 ? setAyrilan2020 : yil === 2021 ? setAyrilan2021 : yil === 2022 ? setAyrilan2022 : setAyrilan2023;
                            const yrPersonel = yil === 2019 ? personel2019 : yil === 2020 ? personel2020 : yil === 2021 ? personel2021 : yil === 2022 ? personel2022 : personel2023;
                            const setYrPersonel = yil === 2019 ? setPersonel2019 : yil === 2020 ? setPersonel2020 : yil === 2021 ? setPersonel2021 : yil === 2022 ? setPersonel2022 : setPersonel2023;
                            return (
                              <React.Fragment key={yil}>
                                <Grid
                                  size={{
                                    xs: 12,
                                    lg: 6
                                  }}><CustomFormLabel>Tazminatsız Ayrılan Sayısı ({yil})</CustomFormLabel></Grid>
                                <Grid
                                  size={{
                                    xs: 12,
                                    lg: 6
                                  }}><NumericInput fullWidth value={yrAyrilan} onChange={(val) => setYrAyrilan(val)} /></Grid>
                                <Grid
                                  size={{
                                    xs: 12,
                                    lg: 6
                                  }}><CustomFormLabel>Ortalama Personel Sayısı ({yil})</CustomFormLabel></Grid>
                                <Grid
                                  size={{
                                    xs: 12,
                                    lg: 6
                                  }}><NumericInput fullWidth value={yrPersonel} onChange={(val) => setYrPersonel(val)} /></Grid>
                              </React.Fragment>
                            );
                          })}
                        </Grid>
                      </Collapse>
                    </Grid>

                  </Grid>
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
                  <Button variant="outlined" color="success" onClick={handleSave} sx={{ width: "20%" }}>Kaydet</Button>
                  <Button variant="outlined" color="error" onClick={handleDrawerClose} sx={{ width: "20%" }}>Vazgeç</Button>
                </DialogActions>
              </Dialog>
            </TabPanel>

            <TabPanel value="Hesaplama" sx={{ paddingX: 0 }}>
              <Grid container spacing={3}>
                <Grid display="flex" justifyContent="flex-end" size={12}>
                  <Button variant="outlined" onClick={() => { setHesaplaTiklandimi(true); handleHesapla(); }}>Hesapla</Button>
                </Grid>
                {fetchedKidemTazminatiCalismasi.length > 0 && <Grid size={12}><KidemTazminatiBobiHesaplama data={fetchedKidemTazminatiCalismasi} title="Kıdem Tazminatı Çalışması" /></Grid>}
                {fetchedHesaplananKidemTazminatiToplami.length > 0 && <Grid size={12}><KidemTazminatiBobiHesaplama data={fetchedHesaplananKidemTazminatiToplami} title="Dönem Toplamı" /></Grid>}
                <FloatingButtonFisler handleClick={() => setFloatingButtonTiklandimi(true)} />
              </Grid>

              <Dialog open={floatingButtonTiklandimi} onClose={() => setFloatingButtonTiklandimi(false)} fullWidth maxWidth="lg">
                <DialogContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5">Örnek Fişleri Kaydet</Typography>
                    <IconButton onClick={() => setFloatingButtonTiklandimi(false)}><IconX size="18" /></IconButton>
                  </Stack>
                  <Typography variant="body2" sx={{ mt: 1 }}>Oluşturulan fişleri kontrol ederek kaydediniz.</Typography>
                </DialogContent>
                <Divider />
                <DialogContent>
                  <KidemTazminatiBobiOrnekFisler data={fetchedKidemTazminatiBobiOrnekFisler} kaydetTiklandimi={hesaplaKaydetTiklandimi} setkaydetTiklandimi={setHesaplaKaydetTiklandimi} />
                </DialogContent>
                <DialogActions>
                  <Button variant="outlined" color="success" onClick={() => { setHesaplaKaydetTiklandimi(true); setFloatingButtonTiklandimi(false); }}>Kaydet</Button>
                  <Button variant="outlined" color="error" onClick={() => setFloatingButtonTiklandimi(false)}>Kapat</Button>
                </DialogActions>
              </Dialog>
              {openCartAlert && <InfoAlertCart openCartAlert={openCartAlert} setOpenCartAlert={setOpenCartAlert} />}
            </TabPanel>
          </TabContext>
        </Grid>
        {isPopUpOpen && <PaylasimBaglantisiPopUp controller={controller} setControl={setControl} isPopUpOpen={isPopUpOpen} handleClosePopUp={handleClosePopUp} />}
      </Grid>
    </PageContainer>
  );
};
export default Page;

