"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box, Button, Grid, Typography, useMediaQuery } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import { useState } from "react";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import BelgeKontrolCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCard";
import IcKontrolDegerlemeUnsurBelge from "@/app/(Uygulama)/components/CalismaKagitlari/IcKontrolDegerlemeUnsurBelge";
import IcKontrolDegerlemeAnketBelge from "@/app/(Uygulama)/components/CalismaKagitlari/IcKontrolDegerlemeAnketBelge";
import IcKontrolDegerlemeTeknikBelge from "@/app/(Uygulama)/components/CalismaKagitlari/IcKontrolDegerlemeTeknikBelge";

const BCrumb = [
  {
    to: "/PlanVeProgram",
    title: "Plan ve Program",
  },
  {
    to: "/PlanVeProgram/IcKontrolDegerlendirme",
    title: "İç Kontrol Değerlendirme",
  },
];

const Page = () => {
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const [isClickedVarsayilanaDon, setIsClickedVarsayilanaDon] = useState(false);

  const [tamamlanan1, setTamamlanan1] = useState(0);
  const [toplam1, setToplam1] = useState(0);

  const [tamamlanan2, setTamamlanan2] = useState(0);
  const [toplam2, setToplam2] = useState(0);

  const [tamamlanan3, setTamamlanan3] = useState(0);
  const [toplam3, setToplam3] = useState(0);

  const [isRefresh, setIsRefresh] = useState(false);

  const user = useSelector((state: AppState) => state.userReducer);
  const controller =
    "IcKontrolDegerlemeUnsur-IcKontrolDegerlemeAnket-IcKontrolDegerlemeTeknik";
  const grupluMu = false;

  return (
    <>
      <Breadcrumb title="İç Kontrol Değerlendirme" items={BCrumb}>
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
        </>
      </Breadcrumb>
      <PageContainer
        title="İç Kontrol Değerlendirme"
        description="this is İç Kontrol Değerlendirme"
      >
        <Box
          sx={{
            width: "95%",
            margin: "0 auto",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <ParentCard title="İç Kontrol Sisteminin Unsurları">
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
                  justifyContent={"flex-end"}
                >
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
              <IcKontrolDegerlemeUnsurBelge
                refresh={isRefresh}
                controller={"IcKontrolDegerlemeUnsur"}
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
            mb: 3,
          }}
        >
          <ParentCard title="Genel İç Kontrol Anketine Göre;">
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
                  justifyContent={"flex-end"}
                >
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
              <IcKontrolDegerlemeAnketBelge
                refresh={isRefresh}
                controller={"IcKontrolDegerlemeAnket"}
                isClickedVarsayilanaDon={isClickedVarsayilanaDon}
                setIsClickedVarsayilanaDon={setIsClickedVarsayilanaDon}
                setTamamlanan={setTamamlanan2}
                setToplam={setToplam2}
              />
            </>
          </ParentCard>
        </Box>
        <Box
          sx={{
            width: "95%",
            margin: "0 auto",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <ParentCard title="Hesapların İç Kontrol Anketlerine Göre Uygulanacak Denetim Teknikleri">
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
                  justifyContent={"flex-end"}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      overflowWrap: "break-word",
                      wordWrap: "break-word",
                      textAlign: "center",
                    }}
                  >
                    {tamamlanan3}/{toplam3} Tamamlandı
                  </Typography>
                </Grid>
              </Grid>
              <IcKontrolDegerlemeTeknikBelge
                refresh={isRefresh}
                controller={"IcKontrolDegerlemeTeknik"}
                isClickedVarsayilanaDon={isClickedVarsayilanaDon}
                setIsClickedVarsayilanaDon={setIsClickedVarsayilanaDon}
                setTamamlanan={setTamamlanan3}
                setToplam={setToplam3}
              />
            </>
          </ParentCard>
        </Box>
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
                fetch={() => {
                  setIsRefresh(true);
                }}
                hazirlayan="Denetçi - Yardımcı Denetçi"
                controller={controller}
              ></BelgeKontrolCard>
            </Grid>
            <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
              <BelgeKontrolCard
                fetch={() => {
                  setIsRefresh(true);
                }}
                onaylayan="Sorumlu Denetçi"
                controller={controller}
              ></BelgeKontrolCard>
            </Grid>
            <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
              <BelgeKontrolCard
                fetch={() => {
                  setIsRefresh(true);
                }}
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
