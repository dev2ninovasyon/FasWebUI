"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Fab,
  Grid,
  IconButton,
  Stack,
  Tab,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "react-redux";
import { getIliskiliTarafSiniflamaHesaplar } from "@/api/Hesaplamalar/Hesaplamalar";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import IliskiliTarafSiniflama from "./IliskiliTarafSiniflama";
import { IconPlus, IconX } from "@tabler/icons-react";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";

const BCrumb = [
  {
    to: "/Hesaplamalar",
    title: "Hesaplamalar",
  },
  {
    to: "/Hesaplamalar/IliskiliTarafSiniflama",
    title: "İlişkili Taraf Sınıflama",
  },
];

const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [showDrawer, setShowDrawer] = React.useState(false);
  const handleDrawerClose = () => {
    setShowDrawer(false);
  };
  const [kebirKodu, setKebirKodu] = useState<number>(0);

  const [tip, setTip] = useState("120");

  const [hesaplar, setHesaplar] = useState<number[]>([120]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTip(newValue);
  };

  const handleEkle = async () => {
    let h = hesaplar;
    h.push(kebirKodu);
    setHesaplar(h);
    handleDrawerClose();
  };

  const fetchData = async () => {
    try {
      const hesapVerileri = await getIliskiliTarafSiniflamaHesaplar(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );
      setTip(hesapVerileri[0].toString());
      setHesaplar(hesapVerileri);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <PageContainer
      title="İlişkili Taraf Sınıflama"
      description="this is İlişkili Taraf Sınıflama"
    >
      <Breadcrumb title="İlişkili Taraf Sınıflama" items={BCrumb} />
      <Grid container>
        <Grid item xs={12} lg={12} position={"relative"}>
          <TabContext value={tip}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              {hesaplar.map((hesap, index) => (
                <Tab
                  key={index}
                  label={hesap.toString()}
                  value={hesap.toString()}
                />
              ))}
            </TabList>
            <Grid
              item
              xs={12}
              lg={12}
              sx={{
                position: "absolute",
                top: 9,
                right: 9,
              }}
            >
              <Tooltip title="Hesap Ekle">
                <Fab
                  color="info"
                  size="small"
                  onClick={() => setShowDrawer(true)}
                >
                  <IconPlus width={18.25} height={18.25} />
                </Fab>
              </Tooltip>
            </Grid>
            <Divider />
            {hesaplar.map((hesap, index) => (
              <TabPanel
                key={index}
                value={hesap.toString()}
                sx={{ paddingX: 0 }}
              >
                <Grid container>
                  <Grid item xs={12} lg={12}>
                    <IliskiliTarafSiniflama hesap={hesap} />
                  </Grid>
                </Grid>
              </TabPanel>
            ))}
          </TabContext>
        </Grid>
      </Grid>
      <Dialog
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        maxWidth={"sm"}
        fullWidth
      >
        <DialogContent className="testdialog" sx={{ overflow: "visible" }}>
          <Stack
            direction="row"
            spacing={2}
            justifyContent={"space-between"}
            alignItems="center"
          >
            <Typography variant="h5" p={1}>
              Hesap Ekle
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
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Grid item xs={12} lg={6}>
                <CustomFormLabel
                  htmlFor="kebirKodu"
                  sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                >
                  <Typography variant="h6" p={1}>
                    Kebir Kodu
                  </Typography>
                </CustomFormLabel>
              </Grid>
              <Grid item xs={12} lg={6}>
                <CustomTextField
                  id="kebirKodu"
                  type="number"
                  fullWidth
                  value={kebirKodu}
                  onChange={(e: any) => setKebirKodu(parseInt(e.target.value))}
                />
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
          <Button
            variant="outlined"
            color="success"
            onClick={() => handleEkle()}
            sx={{ width: "20%" }}
          >
            Ekle
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
