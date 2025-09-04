"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import CustomSelect from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSelect";
import React, { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { IconX } from "@tabler/icons-react";
import {
  getMusteriTanimaStatikBilgiler,
  updateMusteriTanimaStatikBilgiler,
} from "@/api/Musteri/MusteriIslemleri";
import CustomSwitch from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSwitch";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import CustomTextAreaAutoSize from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextAreaAutoSize";
import MusteriTanima from "./MusteriTanima";
import BelgeKontrolCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCard";

const BCrumb = [
  {
    to: "/Musteri",
    title: "Müşteri",
  },
  {
    to: "/Musteri/MusteriTanima",
    title: "Müşteri Tanıma",
  },
];

const Page: React.FC = () => {
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const controller = "MusteriTanimaStatikBilgiler-MusteriTanimaSayisalBilgiler";

  const [showDrawer, setShowDrawer] = React.useState(false);
  const handleDrawerClose = () => {
    setShowDrawer(false);
  };

  const [musteriTanimaStatikBilgilerId, setMusteriTanimaStatikBilgilerId] =
    useState<number>(0);
  const [tur, setTur] = useState("Bobi");
  const [
    konsolideMaliTablolarInceleniyorMu,
    setKonsolideMaliTablolarInceleniyorMu,
  ] = React.useState(false);
  const [uzmanTalebi, setUzmanTalebi] = React.useState(false);
  const [uzmanUcreti, setUzmanUcreti] = useState<number>(0);
  const [dahaOncekiDenetimRaporu, setDahaOncekiDenetimRaporu] = useState("");
  const [
    oncekiDenetimRaporlarinaIliskinTespitler,
    setOncekiDenetimRaporlarinaIliskinTespitler,
  ] = useState("");
  const [webBasinYayinEldeEdilenBilgiler, setWebBasinYayinEldeEdilenBilgiler] =
    useState("");
  const [digerBilgiler, setDigerBilgiler] = useState("");

  const handleChangeTur = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTur(event.target.value);
  };
  const handleChangeKonsolideMaliTablolarInceleniyorMu = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setKonsolideMaliTablolarInceleniyorMu(event.target.checked);
  };
  const handleChangeUzmanTalebi = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUzmanTalebi(event.target.checked);
  };

  const [kaydetTiklandimi, setKaydetTiklandimi] = useState(false);

  const handleSave = async () => {
    const createdMusteriTanimaStatikBilgiler = {
      id: musteriTanimaStatikBilgilerId,
      denetciId: user.denetciId,
      denetlenenId: user.denetlenenId,
      yil: user.yil,
      tur: tur,
      konsolideMaliTablolarInceleniyorMu: konsolideMaliTablolarInceleniyorMu,
      uzmanTalebi: uzmanTalebi,
      uzmanUcreti: uzmanUcreti,
      dahaOncekiDenetimRaporu: dahaOncekiDenetimRaporu,
      oncekiDenetimRaporlarinaIliskinTespitler:
        oncekiDenetimRaporlarinaIliskinTespitler,
      webBasinYayinEldeEdilenBilgiler: webBasinYayinEldeEdilenBilgiler,
      digerBilgiler: digerBilgiler,
    };
    try {
      const result = await updateMusteriTanimaStatikBilgiler(
        user.token || "",
        createdMusteriTanimaStatikBilgiler
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
      const musteriTanimaStatikBilgiler = await getMusteriTanimaStatikBilgiler(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0
      );
      if (musteriTanimaStatikBilgiler) {
        setMusteriTanimaStatikBilgilerId(musteriTanimaStatikBilgiler.id);
        if (musteriTanimaStatikBilgiler.tur)
          setTur(musteriTanimaStatikBilgiler.tur);
        setKonsolideMaliTablolarInceleniyorMu(
          musteriTanimaStatikBilgiler.konsolideMaliTablolarInceleniyorMu
        );
        setUzmanTalebi(musteriTanimaStatikBilgiler.uzmanTalebi);
        if (musteriTanimaStatikBilgiler.uzmanUcreti)
          setUzmanUcreti(musteriTanimaStatikBilgiler.uzmanUcreti);
        if (musteriTanimaStatikBilgiler.dahaOncekiDenetimRaporu)
          setDahaOncekiDenetimRaporu(
            musteriTanimaStatikBilgiler.dahaOncekiDenetimRaporu
          );
        if (
          musteriTanimaStatikBilgiler.oncekiDenetimRaporlarinaIliskinTespitler
        )
          setOncekiDenetimRaporlarinaIliskinTespitler(
            musteriTanimaStatikBilgiler.oncekiDenetimRaporlarinaIliskinTespitler
          );
        if (musteriTanimaStatikBilgiler.webBasinYayinEldeEdilenBilgiler)
          setWebBasinYayinEldeEdilenBilgiler(
            musteriTanimaStatikBilgiler.webBasinYayinEldeEdilenBilgiler
          );
        if (musteriTanimaStatikBilgiler.digerBilgiler)
          setDigerBilgiler(musteriTanimaStatikBilgiler.digerBilgiler);
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <PageContainer title="Müşteri Tanıma" description="Müşteri Tanıma">
      <Breadcrumb title="Müşteri Tanıma" items={BCrumb} />
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
              variant="outlined"
              color="primary"
              onClick={() => setShowDrawer(true)}
            >
              Ek Bilgi
            </Button>
            <Button
              type="button"
              size="medium"
              disabled={kaydetTiklandimi}
              variant="outlined"
              color="primary"
              sx={{ height: "100%" }}
              onClick={() => {
                setKaydetTiklandimi(true);
              }}
            >
              Kaydet
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} lg={12}>
          <MusteriTanima
            kaydetTiklandimi={kaydetTiklandimi}
            setKaydetTiklandimi={setKaydetTiklandimi}
          />
        </Grid>
        <Grid item xs={12} lg={12}>
          {(user.rol?.includes("KaliteKontrolSorumluDenetci") ||
            user.rol?.includes("SorumluDenetci") ||
            user.rol?.includes("Denetci") ||
            user.rol?.includes("DenetciYardimcisi")) && (
            <Grid
              container
              sx={{
                width: "100%",
                margin: "0 auto",
                justifyContent: "space-between",
              }}
            >
              <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
                <BelgeKontrolCard
                  hazirlayan="Denetçi - Yardımcı Denetçi"
                  controller={controller}
                ></BelgeKontrolCard>
              </Grid>
              <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
                <BelgeKontrolCard
                  onaylayan="Sorumlu Denetçi"
                  controller={controller}
                ></BelgeKontrolCard>
              </Grid>
              <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
                <BelgeKontrolCard
                  kaliteKontrol="Kalite Kontrol Sorumlu Denetçi"
                  controller={controller}
                ></BelgeKontrolCard>
              </Grid>
            </Grid>
          )}
          <Grid
            container
            sx={{
              width: "100%",
              margin: "0 auto",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Grid item xs={12} lg={12} mt={5}>
              <IslemlerCard controller={controller} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Dialog
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        maxWidth={"md"}
      >
        <DialogContent className="testdialog" sx={{ overflow: "visible" }}>
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
                mb: 2,
              }}
            >
              <CustomSelect
                labelId="tur"
                id="tur"
                size="small"
                value={tur}
                onChange={handleChangeTur}
                height={"36px"}
                fullWidth
              >
                <MenuItem value={"Bobi"}>Denetim Türü: Bobi</MenuItem>
                <MenuItem value={"BobiBüyük"}>
                  Denetim Türü: Bobi Büyük
                </MenuItem>
                <MenuItem value={"Tfrs"}>Denetim Türü: Tfrs</MenuItem>
                <MenuItem value={"TfrsDönemsel"}>
                  Denetim Türü: Tfrs Dönemsel
                </MenuItem>
                <MenuItem value={"ÖzelDenetim"}>
                  Denetim Türü: Özel Denetim
                </MenuItem>
              </CustomSelect>
            </Grid>
            <Grid item xs={12} lg={6}>
              <FormControlLabel
                control={
                  <CustomSwitch
                    checked={konsolideMaliTablolarInceleniyorMu}
                    onChange={handleChangeKonsolideMaliTablolarInceleniyorMu}
                    color="primary"
                  />
                }
                label="Konsolide Mali Tablolar İnceleniyor Mu"
                labelPlacement="start"
                sx={{ ml: 1 }}
              />
            </Grid>
            <Grid item xs={12} lg={6}>
              <FormControlLabel
                control={
                  <CustomSwitch
                    checked={uzmanTalebi}
                    onChange={handleChangeUzmanTalebi}
                    color="primary"
                  />
                }
                label="Uzman Talebi"
                labelPlacement="start"
                sx={{ ml: 1 }}
              />
            </Grid>
            {uzmanTalebi ? (
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
                    htmlFor="uzmanUcreti"
                    sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                  >
                    <Typography variant="body1" p={1}>
                      Uzman Ücreti
                    </Typography>
                  </CustomFormLabel>
                </Grid>
                <Grid item xs={14} lg={6}>
                  <CustomTextField
                    id="uzmanUcreti"
                    type="number"
                    fullWidth
                    value={uzmanUcreti}
                    onChange={(e: any) => setUzmanUcreti(e.target.value)}
                  />
                </Grid>
              </Grid>
            ) : (
              <></>
            )}
            <Grid
              item
              xs={11}
              lg={12}
              sx={{
                display: "flex",
                alignContent: "center",
                justifyContent: "flex-start",
                mt: 2,
              }}
            >
              <Grid item xs={12} md={6} lg={6}>
                <CustomFormLabel
                  htmlFor="dahaOncekiDenetimRaporu"
                  sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                >
                  <Typography variant="body1" p={1}>
                    Daha Önceki Denetim Raporu:
                  </Typography>
                </CustomFormLabel>
              </Grid>
              <Grid item xs={12} md={5.6} lg={5.6}>
                <CustomTextAreaAutoSize
                  id="dahaOncekiDenetimRaporu"
                  value={dahaOncekiDenetimRaporu}
                  fullWidth
                  onChange={(e: any) =>
                    setDahaOncekiDenetimRaporu(e.target.value)
                  }
                />
              </Grid>
            </Grid>
            <Grid
              item
              xs={11}
              lg={12}
              sx={{
                display: "flex",
                alignContent: "center",
                justifyContent: "flex-start",
                mt: 2,
              }}
            >
              <Grid item xs={12} md={6} lg={6}>
                <CustomFormLabel
                  htmlFor="oncekiDenetimRaporlarinaIliskinTespitler"
                  sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                >
                  <Typography variant="body1" p={1}>
                    Önceki Denetim Raporlarına İlişkin Tespitler:
                  </Typography>
                </CustomFormLabel>
              </Grid>
              <Grid item xs={12} md={5.6} lg={5.6}>
                <CustomTextAreaAutoSize
                  id="oncekiDenetimRaporlarinaIliskinTespitler"
                  value={oncekiDenetimRaporlarinaIliskinTespitler}
                  fullWidth
                  onChange={(e: any) =>
                    setOncekiDenetimRaporlarinaIliskinTespitler(e.target.value)
                  }
                />
              </Grid>
            </Grid>
            <Grid
              item
              xs={11}
              lg={12}
              sx={{
                display: "flex",
                alignContent: "center",
                justifyContent: "flex-start",
                mt: 2,
              }}
            >
              <Grid item xs={12} md={6} lg={6}>
                <CustomFormLabel
                  htmlFor="webBasinYayinEldeEdilenBilgiler"
                  sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                >
                  <Typography variant="body1" p={1}>
                    Web, Basın Yayın vb. Yerlerden Elde Edilen Bilgiler:
                  </Typography>
                </CustomFormLabel>
              </Grid>
              <Grid item xs={12} md={5.6} lg={5.6}>
                <CustomTextAreaAutoSize
                  id="webBasinYayinEldeEdilenBilgiler"
                  value={webBasinYayinEldeEdilenBilgiler}
                  fullWidth
                  onChange={(e: any) =>
                    setWebBasinYayinEldeEdilenBilgiler(e.target.value)
                  }
                />
              </Grid>
            </Grid>
            <Grid
              item
              xs={11}
              lg={12}
              sx={{
                display: "flex",
                alignContent: "center",
                justifyContent: "flex-start",
                mt: 2,
              }}
            >
              <Grid item xs={12} md={6} lg={6}>
                <CustomFormLabel
                  htmlFor="digerBilgiler"
                  sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                >
                  <Typography variant="body1" p={1}>
                    Diğer Bilgiler:
                  </Typography>
                </CustomFormLabel>
              </Grid>
              <Grid item xs={12} md={5.6} lg={5.6}>
                <CustomTextAreaAutoSize
                  id="digerBilgiler"
                  value={digerBilgiler}
                  fullWidth
                  onChange={(e: any) => setDigerBilgiler(e.target.value)}
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
    </PageContainer>
  );
};

export default Page;
