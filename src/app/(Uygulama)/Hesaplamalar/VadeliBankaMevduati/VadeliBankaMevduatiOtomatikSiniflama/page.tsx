"use client";

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
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { FloatingButtonFisler } from "@/app/(Uygulama)/components/Hesaplamalar/FloatingButtonFisler";
import { IconX } from "@tabler/icons-react";
import { enqueueSnackbar } from "notistack";
import { useSelector } from "react-redux";
import { AppState } from "@/store/store";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import { createVadeliBankaMevduatiOtomatikSiniflama } from "@/api/Hesaplamalar/Hesaplamalar";
import VadeliBankaMevduatiOtomatikSiniflama from "./VadeliBankaMevduatiOtomatikSiniflama";
import VadeliBankaMevduatiOtomatikSiniflamaOrnekFisler from "./VadeliBankaMevduatiOtomatikSiniflamaOrnekFisler";

const BCrumb = [
  {
    to: "/Hesaplamalar",
    title: "Hesaplamalar",
  },
  {
    to: "/Hesaplamalar/VadeliBankaMevduati",
    title: "Vadeli Banka Mevduatı",
  },
  {
    to: "/Hesaplamalar/VadeliBankaMevduati/VadeliBankaMevduatiOtomatikSiniflama",
    title: "Vadeli Banka Mevduatı Otomatik Sınıflama",
  },
];

const Page = () => {
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [hesaplaTiklandimi, setHesaplaTiklandimi] = useState(false);
  const [kaydetTiklandimi, setKaydetTiklandimi] = useState(false);

  const [floatingButtonTiklandimi, setFloatingButtonTiklandimi] =
    useState(false);

  const [openCartAlert, setOpenCartAlert] = useState(false);

  const handleHesapla = async () => {
    try {
      const result = await createVadeliBankaMevduatiOtomatikSiniflama(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );
      if (result) {
        setHesaplaTiklandimi(false);
        enqueueSnackbar("Vadeli Banka Mevduatı Hesaplandı", {
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
        enqueueSnackbar("Vadeli Banka Mevduatı Hesaplanamadı", {
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
    <PageContainer
      title="Vadeli Banka Mevduatı Otomatik Sınıflama"
      description="this is Vadeli Banka Mevduatı Otomatik Sınıflama"
    >
      <Breadcrumb
        title="Vadeli Banka Mevduatı Otomatik Sınıflama"
        items={BCrumb}
      />
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
        <Grid item xs={12} lg={12}>
          <VadeliBankaMevduatiOtomatikSiniflama
            hesaplaTiklandimi={hesaplaTiklandimi}
          />
        </Grid>
        <FloatingButtonFisler
          handleClick={() => setFloatingButtonTiklandimi(true)}
        />
        <Dialog
          open={floatingButtonTiklandimi}
          onClose={() => setFloatingButtonTiklandimi(false)}
          fullWidth
          maxWidth={"lg"}
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
            <VadeliBankaMevduatiOtomatikSiniflamaOrnekFisler
              hesaplaTiklandimi={hesaplaTiklandimi}
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
