"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box, Button, Grid, Typography } from "@mui/material";
import { useState } from "react";
import TekliCalısmaKagidiBelge from "@/app/(Uygulama)/components/CalismaKagitlari/TekliCalismaKagidiBelge";

const BCrumb = [
  {
    to: "/DenetimKanitlari",
    title: "Denetim Kanıtları",
  },
  {
    to: "/DenetimKanitlari/DigerKanitlar",
    title: "Diğer Kanıtlar",
  },
  {
    to: "/DenetimKanitlari/DigerKanitlar/DenetimStratejisiBelirleme",
    title: "Denetim Satratejisi Belirleme",
  },
];

const Page = () => {
  const [isCreatePopUpOpen, setIsCreatePopUpOpen] = useState(false);
  const [isClickedYeniGrupEkle, setIsClickedYeniGrupEkle] = useState(false);
  const [isClickedVarsayılanaDon, setIsClickedVarsayılanaDon] = useState(false);

  const [tamamlanan, setTamamlanan] = useState(0);
  const [toplam, setToplam] = useState(0);

  const controller = "DenetimStratejisiBelirleme";
  const grupluMu = false;
  const alanAdi = "İşlem";

  const handleOpen = () => {
    setIsCreatePopUpOpen(true);
    setIsClickedYeniGrupEkle(true);
  };
  return (
    <>
      <Breadcrumb title="Denetim Satratejisi Belirleme" items={BCrumb}>
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
              xs={12}
              md={grupluMu ? 2.8 : 3.8}
              lg={grupluMu ? 2.8 : 3.8}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  overflowWrap: "break-word",
                  wordWrap: "break-word",
                  textAlign: "center",
                }}
              >
                {tamamlanan}/{toplam} Tamamlandı
              </Typography>
            </Grid>
            {grupluMu && (
              <Grid
                item
                xs={3.8}
                md={grupluMu ? 2.8 : 3.8}
                lg={grupluMu ? 2.8 : 3.8}
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
                  onClick={() => handleOpen()}
                  sx={{ width: "100%" }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      overflowWrap: "break-word",
                      wordWrap: "break-word",
                    }}
                  >
                    Yeni Grup Ekle
                  </Typography>{" "}
                </Button>
              </Grid>
            )}
            <Grid
              item
              xs={5.8}
              md={grupluMu ? 2.8 : 3.8}
              lg={grupluMu ? 2.8 : 3.8}
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
              md={grupluMu ? 2.8 : 3.8}
              lg={grupluMu ? 2.8 : 3.8}
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
                onClick={() => setIsClickedVarsayılanaDon(true)}
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
        title="Denetim Satratejisi Belirleme"
        description="this is Denetim Satratejisi Belirleme"
      >
        <Box>
          <TekliCalısmaKagidiBelge
            controller={controller}
            grupluMu={grupluMu}
            alanAdi={alanAdi}
            isClickedYeniGrupEkle={isClickedYeniGrupEkle}
            isClickedVarsayılanaDon={isClickedVarsayılanaDon}
            setIsClickedVarsayılanaDon={setIsClickedVarsayılanaDon}
            setTamamlanan={setTamamlanan}
            setToplam={setToplam}
          />
        </Box>
      </PageContainer>
    </>
  );
};

export default Page;
