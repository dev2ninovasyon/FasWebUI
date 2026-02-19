"use client";

import React, { useState } from "react";
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
  Typography,
  useTheme,
} from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";

import { IconX, IconArrowsMaximize, IconArrowsMinimize } from "@tabler/icons-react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { FloatingButtonFisler } from "@/app/(Uygulama)/components/Hesaplamalar/FloatingButtonFisler";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import KurFarki from "./KurFarki";
import DovizKurlariOtuzBirAralik from "./DovizKurlariOtuzBirAralik";
import KurFarkiOrnekFisler from "./KurFarkiOrnekFisler";

const BCrumb = [
  {
    to: "/Hesaplamalar",
    title: "Hesaplamalar",
  },
  {
    to: "/Hesaplamalar/KurFarkiKayitlari",
    title: "Kur Farkı Kayıtları",
  },
  {
    to: "/Hesaplamalar/KurFarkiKayitlari/KurFarki",
    title: "Kur Farkı",
  },
];

const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [kaydetTiklandimi, setKaydetTiklandimi] = useState(false);

  const [floatingButtonTiklandimi, setFloatingButtonTiklandimi] =
    useState(false);

  const [openCartAlert, setOpenCartAlert] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [hasData, setHasData] = useState(false);

  const handleDataCount = (count: number) => {
    if (count > 0) {
      setHasData(true);
    }
  };

  return (
    <PageContainer title="Kur Farkı" description="this is Kur Farkı">
      <Breadcrumb title="Kur Farkı" items={BCrumb} />
      <Grid container>
        <Grid
          mb={1}
          size={{
            xs: 12,
            lg: 12
          }}>
          <KurFarki onDataCount={handleDataCount} />
        </Grid>
        <Grid
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
          size={{
            xs: 12,
            lg: 12
          }}>
          <Typography variant="h6" paddingRight={"16px"} paddingY={"8px"}>
            Kur Bilgileri
          </Typography>
        </Grid>
        <Grid
          size={{
            xs: 12,
            lg: 12
          }}>
          <DovizKurlariOtuzBirAralik onDataCount={handleDataCount} />
        </Grid>
        {hasData && (
          <FloatingButtonFisler
            handleClick={() => setFloatingButtonTiklandimi(true)}
          />
        )}
        <Dialog
          open={floatingButtonTiklandimi}
          onClose={() => setFloatingButtonTiklandimi(false)}
          fullWidth
          maxWidth={false}
          fullScreen={isFullScreen}
          PaperProps={isFullScreen ? {} : { sx: { maxWidth: "98vw" } }}
        >
          <DialogContent className="testdialog" sx={{ overflow: "visible" }}>
            <Stack
              direction="row"
              spacing={2}
              justifyContent={"space-between"}
              alignItems="center"
            >
              <Box>
                <Typography variant="h5" p={1}>
                  Sizin için oluşturduğum fişleri kaydetmek ister misiniz?
                </Typography>
                <Typography variant="body1" p={1}>
                  Sizin için oluşturduğum fiş kayıtlarının doğruluğunu mutlaka
                  kontrol edin. Fişlerinizi kontrol etmeden kaydetmek, hatalı
                  kayıtların oluşmasına yol açabilir. Unutmayın, bu alanda
                  gerçekleştirdiğiniz işlemlerden kaynaklanan hatalı kayıtlar
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
            <KurFarkiOrnekFisler
              kaydetTiklandimi={kaydetTiklandimi}
              setkaydetTiklandimi={setKaydetTiklandimi}
            />
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
            <Button
              variant="outlined"
              color="success"
              onClick={() => {
                setKaydetTiklandimi(true);
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
    </PageContainer>
  );
};

export default Page;
