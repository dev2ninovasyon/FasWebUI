"use client";

import React, { useEffect, useState } from "react";
import { Grid, useTheme } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import OrneklemForm from "@/app/(Uygulama)/components/DenetimKanitlari/Onemlilik/OrneklemForm";
import Orneklem from "@/app/(Uygulama)/DenetimKanitlari/Onemlilik/Orneklem/Orneklem";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import { createOrneklem } from "@/api/DenetimKanitlari/DenetimKanitlari";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { enqueueSnackbar } from "notistack";

const BCrumb = [
  {
    to: "/DenetimKanitlari",
    title: "Denetim Kanıtları",
  },
  {
    to: "/DenetimKanitlari/Onemlilik",
    title: "Önemlilik",
  },
  {
    to: "/DenetimKanitlari/Onemlilik/Orneklem",
    title: "Örneklem",
  },
];

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [guvenilirlikDuzeyi, setGuvenilirlikDuzeyi] = useState(95);
  const [hataPayi, setHataPayi] = useState(5);
  const [listelemeTuru, setListelemeTuru] = useState("Aya Göre");

  const [hesaplaTiklandimi, setHesaplaTiklandimi] = useState(false);

  const [openCartAlert, setOpenCartAlert] = useState(false);

  const handleHesapla = async () => {
    try {
      const result = await createOrneklem(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        guvenilirlikDuzeyi,
        hataPayi,
        listelemeTuru
      );
      if (result) {
        setHesaplaTiklandimi(false);
        enqueueSnackbar("Örneklem Hesaplandı", {
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
        enqueueSnackbar("Örneklem Hesaplanamadı", {
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
    <PageContainer title="Örneklem" description="this is Örneklem">
      <Breadcrumb title="Örneklem" items={BCrumb} />
      <Grid container>
        <Grid item xs={12} lg={12} mb={3}>
          <OrneklemForm
            guvenilirlikDuzeyi={guvenilirlikDuzeyi}
            hataPayi={hataPayi}
            listelemeTuru={listelemeTuru}
            setGuvenilirlikDuzeyi={setGuvenilirlikDuzeyi}
            setHataPayi={setHataPayi}
            setListelemeTuru={setListelemeTuru}
            setHesaplaTiklandimi={setHesaplaTiklandimi}
            handleHesapla={handleHesapla}
          />
        </Grid>
        <Grid item xs={12} lg={12}>
          <Orneklem
            setGuvenilirlikDuzeyi={setGuvenilirlikDuzeyi}
            setHataPayi={setHataPayi}
            setListelemeTuru={setListelemeTuru}
            hesaplaTiklandimi={hesaplaTiklandimi}
          />
        </Grid>
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
