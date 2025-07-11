"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
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
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import { FloatingButtonFisler } from "@/app/(Uygulama)/components/Hesaplamalar/FloatingButtonFisler";
import { IconX } from "@tabler/icons-react";
import GecmisYillarKarZararKontrolleriOrnekFisler from "./GecmisYillarKarZararKontrolleriOrnekFisler";
import GecmisYillarKarZararKontrolleri from "./GecmisYillarKarZararKontrolleri";

const BCrumb = [
  {
    to: "/Hesaplamalar",
    title: "Hesaplamalar",
  },
  {
    to: "/Hesaplamalar/GecmisYillarKarZararKontrolleri",
    title: "Geçmiş Yıllar Kar Zarar Kontrolleri",
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

  return (
    <PageContainer
      title="Geçmiş Yıllar Kar Zarar Kontrolleri"
      description="this is Geçmiş Yıllar Kar Zarar Kontrolleri"
    >
      <Breadcrumb title="Geçmiş Yıllar Kar Zarar Kontrolleri" items={BCrumb} />
      <Grid container>
        <Grid item xs={12} lg={12} mb={2}>
          <GecmisYillarKarZararKontrolleri />
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
            <GecmisYillarKarZararKontrolleriOrnekFisler
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
