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
    to: "/DenetimKanitlari/DigerKanitlar/TespitEdilenHususlarinYonetimeBildirimi",
    title: "Tespit Edlien Hususların Yönetim Bildirimi",
  },
];

const Page = () => {
  const [isCreatePopUpOpen, setIsCreatePopUpOpen] = useState(false);
  const [isClickedYeniGrupEkle, setIsClickedYeniGrupEkle] = useState(false);
  const [isClickedVarsayılanaDon, setIsClickedVarsayılanaDon] = useState(false);

  const [tamamlanan, setTamamlanan] = useState(0);
  const [toplam, setToplam] = useState(0);

  const controller = "TespitEdilenHususlarinYonetimeBildirimi";
  const grupluMu = false;
  const alanAdi = "Tespit";

  const handleOpen = () => {
    setIsCreatePopUpOpen(true);
    setIsClickedYeniGrupEkle(true);
  };
  return (
    <>
      <Breadcrumb
        title="Tespit Edlien Hususların Yönetim Bildirimi"
        items={BCrumb}
      >
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
        title="Tespit Edlien Hususların Yönetim Bildirimi"
        description="this is Tespit Edlien Hususların Yönetim Bildirimi"
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
