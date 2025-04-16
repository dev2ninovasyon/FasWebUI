"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React, { useEffect, useState } from "react";
import {
  Button,
  Divider,
  Grid,
  Tab,
  Typography,
  useTheme,
} from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "react-redux";
import { enqueueSnackbar } from "notistack";
import {
  createDavaKarsiliklariHesaplanmis,
  getIskontoOrani,
} from "@/api/Hesaplamalar/Hesaplamalar";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import DavaKarsiliklariVeriYukleme from "./DavaKarsiliklariVeriYukleme";
import DavaKarsiliklariHesaplama from "./DavaKarsiliklariHesaplama";
import DavaKarsiliklariCard from "@/app/(Uygulama)/components/Hesaplamalar/DavaKarsiliklari/DavaKarsiliklariCard";

const BCrumb = [
  {
    to: "/Hesaplamalar",
    title: "Hesaplamalar",
  },
  {
    to: "/Hesaplamalar/DavaKarsiliklari",
    title: "Dava Karşılıkları",
  },
];

const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [tip, setTip] = useState("VeriYukleme");
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTip(newValue);
  };

  const [iskontoOrani, setIskontoOrani] = useState<number>(0);

  const [kaydetTiklandimi, setKaydetTiklandimi] = useState(false);

  const [hesaplaTiklandimi, setHesaplaTiklandimi] = useState(false);

  const [openCartAlert, setOpenCartAlert] = useState(false);

  const handleHesapla = async () => {
    try {
      const result = await createDavaKarsiliklariHesaplanmis(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        iskontoOrani
      );
      if (result) {
        setHesaplaTiklandimi(false);
        enqueueSnackbar("Dava Karşılıkları Hesaplandı", {
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
        enqueueSnackbar("Dava Karşılıkları Hesaplanamadı", {
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

  const fetchIskontoOrani = async () => {
    try {
      const iskontoOraniVerisi = await getIskontoOrani(user.token || "");

      if (iskontoOraniVerisi) {
        setIskontoOrani(iskontoOraniVerisi);
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchIskontoOrani();
  }, []);

  return (
    <PageContainer
      title="Dava Karşılıkları"
      description="this is Dava Karşılıkları"
    >
      <Breadcrumb title="Dava Karşılıkları" items={BCrumb} />
      <Grid container>
        <Grid item xs={12} lg={12}>
          <TabContext value={tip}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              <Tab label="Veri Yükleme" value="VeriYukleme" />
              <Tab label="Hesaplama" value="Hesaplama" />
            </TabList>
            <Divider />
            <TabPanel value="VeriYukleme" sx={{ paddingX: 0 }}>
              <Grid container>
                {" "}
                <Grid
                  item
                  xs={12}
                  lg={12}
                  sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}
                >
                  <Button
                    type="button"
                    size="medium"
                    disabled={kaydetTiklandimi || hesaplaTiklandimi}
                    variant="outlined"
                    color="primary"
                    sx={{ ml: 2 }}
                    onClick={() => {
                      setKaydetTiklandimi(true);
                    }}
                  >
                    Kaydet
                  </Button>
                </Grid>
                <Grid item xs={12} lg={12}>
                  <DavaKarsiliklariVeriYukleme
                    kaydetTiklandimi={kaydetTiklandimi}
                    setKaydetTiklandimi={setKaydetTiklandimi}
                  />
                </Grid>
              </Grid>
            </TabPanel>
            <TabPanel value="Hesaplama" sx={{ paddingX: 0 }}>
              <Grid container>
                <Grid
                  item
                  xs={12}
                  lg={12}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    mb: 2,
                  }}
                >
                  <CustomFormLabel
                    htmlFor="iskonto"
                    sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                  >
                    <Typography variant="subtitle1">İskonto Oranı:</Typography>
                  </CustomFormLabel>
                  <CustomTextField
                    id="iskonto"
                    type="number"
                    value={iskontoOrani}
                    onChange={(e: any) => setIskontoOrani(e.target.value)}
                  />
                  <Button
                    type="button"
                    size="medium"
                    disabled={hesaplaTiklandimi}
                    variant="outlined"
                    color="primary"
                    sx={{ ml: 2, height: "100%" }}
                    onClick={() => {
                      setHesaplaTiklandimi(true);
                      handleHesapla();
                    }}
                  >
                    Hesapla
                  </Button>
                </Grid>
                <Grid item xs={12} lg={12} mb={2}>
                  <DavaKarsiliklariCard hesaplaTiklandimi={hesaplaTiklandimi} />
                </Grid>
                <Grid item xs={12} lg={12}>
                  <DavaKarsiliklariHesaplama
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
            </TabPanel>
          </TabContext>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
