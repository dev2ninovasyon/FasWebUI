"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import {
  Box,
  Button,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import { useEffect, useState } from "react";
import { CreateGroupPopUp } from "@/app/(Uygulama)/components/CalismaKagitlari/CreateGroupPopUp";
import { createCalismaKagidiVerisi } from "@/api/CalismaKagitlari/CalismaKagitlari";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import BelgeKontrolCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCard";
import DogalRiskBelge from "@/app/(Uygulama)/components/CalismaKagitlari/DogalRiskBelge";
import KontrolRiskiBelge from "@/app/(Uygulama)/components/CalismaKagitlari/KontrolRiskiBelge";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import { createBulguRiskiBelirleme } from "@/api/PlanVeProgram/PlanVeProgram";
import { enqueueSnackbar } from "notistack";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import BulguRiskiBelirleme from "./BulguRiskiBelirleme";
import BulguRiskiBelirlemeBelge from "./BulguRiskiBelirlemeBelge";

const BCrumb = [
  {
    to: "/PlanVeProgram",
    title: "Plan ve Program",
  },
  {
    to: "/PlanVeProgram/BulguRiskiBelirleme",
    title: "Bulgu Riski Belirleme",
  },
];

const Page = () => {
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const [denetimRiski, setDenetimRiski] = useState<number>(0);
  const [hesaplaTiklandimi, setHesaplaTiklandimi] = useState(false);

  const [openCartAlert, setOpenCartAlert] = useState(false);

  const [islem1, setIslem1] = useState("");
  const [isCreatePopUpOpen1, setIsCreatePopUpOpen1] = useState(false);
  const [islem2, setIslem2] = useState("");
  const [isCreatePopUpOpen2, setIsCreatePopUpOpen2] = useState(false);

  const [isClickedYeniGrupEkle1, setIsClickedYeniGrupEkle1] = useState(false);
  const [isClickedYeniGrupEkle2, setIsClickedYeniGrupEkle2] = useState(false);

  const [isClickedVarsayilanaDon, setIsClickedVarsayilanaDon] = useState(false);

  const [tamamlanan1, setTamamlanan1] = useState(0);
  const [toplam1, setToplam1] = useState(0);

  const [tamamlanan2, setTamamlanan2] = useState(0);
  const [toplam2, setToplam2] = useState(0);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const controller = "DogalRisk-KontrolRiski";

  const handleOpen1 = () => {
    setIsCreatePopUpOpen1(true);
    setIsClickedYeniGrupEkle1(true);
  };

  const handleOpen2 = () => {
    setIsCreatePopUpOpen2(true);
    setIsClickedYeniGrupEkle2(true);
  };

  const handleCreateGroup1 = async (islem: string) => {
    const createdCalismaKagidiGrubu = {
      denetlenenId: user.denetlenenId,
      denetciId: user.denetciId,
      yil: user.yil,
      islem: islem,
    };

    try {
      const result = await createCalismaKagidiVerisi(
        "DogalRisk",
        user.token || "",
        createdCalismaKagidiGrubu
      );
      if (result) {
        setIsCreatePopUpOpen1(false);
        setIsClickedYeniGrupEkle1(false);
      } else {
        console.error("Çalışma Kağıdı Verisi ekleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const handleCreateGroup2 = async (konu: string) => {
    const createdCalismaKagidiGrubu = {
      denetlenenId: user.denetlenenId,
      denetciId: user.denetciId,
      yil: user.yil,
      konu: konu,
    };

    try {
      const result = await createCalismaKagidiVerisi(
        "KontrolRiski",
        user.token || "",
        createdCalismaKagidiGrubu
      );
      if (result) {
        setIsCreatePopUpOpen2(false);
        setIsClickedYeniGrupEkle2(false);
      } else {
        console.error("Çalışma Kağıdı Verisi ekleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const handleHesapla = async () => {
    try {
      const result = await createBulguRiskiBelirleme(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        denetimRiski
      );
      if (result) {
        setHesaplaTiklandimi(false);
        enqueueSnackbar("Bulgu Riski Hesaplandı", {
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
        enqueueSnackbar("Bulgu Riski Hesaplanamadı", {
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

  useEffect(() => {
    if (hesaplaTiklandimi) {
      setOpenCartAlert(true);
    } else {
      setOpenCartAlert(false);
    }
  }, [hesaplaTiklandimi]);

  return (
    <>
      <Breadcrumb title="Bulgu Riski Belirleme" items={BCrumb}>
        <>
          <Grid
            container
            sx={{
              width: "95%",
              height: "100%",
              margin: "0 auto",
              justifyContent: "space-between",
            }}
          >
            <Grid
              item
              xs={5.8}
              md={5.8}
              lg={5.8}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Button
                size="medium"
                variant="outlined"
                color="primary"
                sx={{ width: "100%" }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    overflowWrap: "break-word",
                    wordWrap: "break-word",
                  }}
                >
                  Ek Belge Yükle
                </Typography>
              </Button>
            </Grid>
            <Grid
              item
              xs={5.8}
              md={5.8}
              lg={5.8}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Button
                size="medium"
                variant="outlined"
                color="primary"
                onClick={() => setIsClickedVarsayilanaDon(true)}
                sx={{ width: "100%" }}
              >
                <Typography
                  variant="body1"
                  sx={{ overflowWrap: "break-word", wordWrap: "break-word" }}
                >
                  Varsayılana Dön
                </Typography>
              </Button>
            </Grid>
          </Grid>
          {isCreatePopUpOpen1 && (
            <CreateGroupPopUp
              islem={islem1}
              setIslem={setIslem1}
              isPopUpOpen={isCreatePopUpOpen1}
              setIsPopUpOpen={setIsCreatePopUpOpen1}
              handleCreateGroup={handleCreateGroup1}
            />
          )}
          {isCreatePopUpOpen2 && (
            <CreateGroupPopUp
              islem={islem2}
              setIslem={setIslem2}
              isPopUpOpen={isCreatePopUpOpen2}
              setIsPopUpOpen={setIsCreatePopUpOpen2}
              handleCreateGroup={handleCreateGroup2}
            />
          )}
        </>
      </Breadcrumb>
      <PageContainer
        title="Bulgu Riski Belirleme"
        description="this is Bulgu Riski Belirleme"
      >
        <Box
          sx={{
            width: "95%",
            margin: "0 auto",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <ParentCard title="Doğal Risk">
            <>
              <Grid
                container
                sx={{
                  width: "95%",
                  margin: "0 auto",
                  justifyContent: "space-between",
                }}
              >
                <Grid
                  item
                  xs={12}
                  md={12}
                  lg={12}
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <Button
                    size="medium"
                    variant="outlined"
                    color="primary"
                    onClick={() => handleOpen1()}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        overflowWrap: "break-word",
                        wordWrap: "break-word",
                      }}
                    >
                      Yeni Grup Ekle
                    </Typography>
                  </Button>
                  <Typography
                    variant="body1"
                    sx={{
                      overflowWrap: "break-word",
                      wordWrap: "break-word",
                      textAlign: "center",
                    }}
                  >
                    {tamamlanan1}/{toplam1} Tamamlandı
                  </Typography>
                </Grid>
              </Grid>

              <DogalRiskBelge
                controller={"DogalRisk"}
                grupluMu={true}
                isClickedYeniGrupEkle={isClickedYeniGrupEkle1}
                isClickedVarsayilanaDon={isClickedVarsayilanaDon}
                setIsClickedVarsayilanaDon={setIsClickedVarsayilanaDon}
                setTamamlanan={setTamamlanan1}
                setToplam={setToplam1}
              />
            </>
          </ParentCard>
        </Box>
        <Box
          sx={{
            width: "95%",
            margin: "0 auto",
            justifyContent: "space-between",
            mb: 6,
          }}
        >
          <ParentCard title="Kontrol Riski">
            <>
              <Grid
                container
                sx={{
                  width: "95%",
                  margin: "0 auto",
                  justifyContent: "space-between",
                }}
              >
                <Grid
                  item
                  xs={12}
                  md={12}
                  lg={12}
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <Button
                    size="medium"
                    variant="outlined"
                    color="primary"
                    onClick={() => handleOpen2()}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        overflowWrap: "break-word",
                        wordWrap: "break-word",
                      }}
                    >
                      Yeni Grup Ekle
                    </Typography>
                  </Button>
                  <Typography
                    variant="body1"
                    sx={{
                      overflowWrap: "break-word",
                      wordWrap: "break-word",
                      textAlign: "center",
                    }}
                  >
                    {tamamlanan2}/{toplam2} Tamamlandı
                  </Typography>
                </Grid>
              </Grid>
              <KontrolRiskiBelge
                controller={"KontrolRiski"}
                grupluMu={true}
                isClickedYeniGrupEkle={isClickedYeniGrupEkle2}
                isClickedVarsayilanaDon={isClickedVarsayilanaDon}
                setIsClickedVarsayilanaDon={setIsClickedVarsayilanaDon}
                setTamamlanan={setTamamlanan2}
                setToplam={setToplam2}
              />
            </>
          </ParentCard>
        </Box>
        <Grid
          container
          sx={{
            width: "95%",
            margin: "0 auto",
            justifyContent: "space-between",
          }}
        >
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
                htmlFor="iskonto"
                sx={{ mt: 0, mb: { sm: 0 }, mx: 2 }}
              >
                <Typography variant="subtitle1">
                  Denetçinin Kabul Edebileceği Denetim Riski:
                </Typography>
              </CustomFormLabel>
              <CustomTextField
                id="iskonto"
                type="number"
                value={denetimRiski}
                onChange={(e: any) => setDenetimRiski(e.target.value)}
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
          <Grid item xs={12} lg={12} mb={3}>
            <BulguRiskiBelirleme hesaplaTiklandimi={hesaplaTiklandimi} />
          </Grid>
          <Grid item xs={12} lg={12}>
            <BulguRiskiBelirlemeBelge />
          </Grid>
          {openCartAlert && (
            <InfoAlertCart
              openCartAlert={openCartAlert}
              setOpenCartAlert={setOpenCartAlert}
            ></InfoAlertCart>
          )}
        </Grid>
        {user.rol?.includes("KaliteKontrolSorumluDenetci") ||
        user.rol?.includes("SorumluDenetci") ||
        user.rol?.includes("Denetci") ||
        user.rol?.includes("DenetciYardimcisi") ? (
          <Grid
            container
            sx={{
              width: "95%",
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
        ) : (
          <></>
        )}
        <Grid
          container
          sx={{
            width: "95%",
            margin: "0 auto",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Grid item xs={12} lg={12} mt={5}>
            <IslemlerCard controller={controller} />
          </Grid>
        </Grid>
      </PageContainer>
    </>
  );
};

export default Page;
