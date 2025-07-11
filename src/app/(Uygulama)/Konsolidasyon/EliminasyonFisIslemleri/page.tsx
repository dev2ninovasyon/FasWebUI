"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import CustomSelect from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSelect";
import FisGirisi from "@/app/(Uygulama)/components/Donusum/FisGirisi/FisGirisi";
import FisGirisiKontrol from "@/app/(Uygulama)/components/Donusum/FisGirisi/FisGirisiKontrol";
import { useRouter } from "next/navigation";
import SonGirilenFisler from "@/app/(Uygulama)/components/Donusum/FisGirisi/SonGirilenFisler";
import HazirFisListesi from "@/app/(Uygulama)/Donusum/HazirFisler/HazirFisListesi";
import { IconX } from "@tabler/icons-react";
import { getGenelHesapPlani } from "@/api/Veri/Mizan";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import GenelHesapPlani from "@/app/(Uygulama)/components/Donusum/FisGirisi/GenelHesapPlani";
import ProtectedPage from "@/app/ProtectedPage";

const BCrumb = [
  {
    to: "/Konsolidasyon",
    title: "Konsolidasyon",
  },
  {
    to: "/Konsolidasyon/EliminasyonFisIslemleri",
    title: "Eliminasyon Fiş İşlemleri",
  },
];

interface Veri {
  id: number;
  kod: string;
  adi: string;
  paraBirimi: string;
}

const Page: React.FC = () => {
  const router = useRouter();

  const user = useSelector((state: AppState) => state.userReducer);

  const [fetchedData, setFetchedData] = useState<Veri[]>([]);

  const [fisType, setFisType] = useState("Düzeltme");
  const [filterValue, setFilterValue] = useState("");

  const [kod, setKod] = useState("");
  const [ad, setAd] = useState("");

  const [hazirFislerTiklandimi, setHazirFislerTiklandimi] = useState(false);

  const [isOpenPopUp1, setIsPopUpOpen1] = useState(false);
  const [isOpenPopUp2, setIsPopUpOpen2] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFisType(event.target.value);
  };

  const handleFilterChange = (value: string) => {
    setFilterValue(value);
  };

  const handleClose1 = () => {
    setIsPopUpOpen1(false);
    setHazirFislerTiklandimi(true);
  };

  const handleClose2 = () => {
    setIsPopUpOpen2(false);
  };

  const fetchData = async () => {
    try {
      const genelHesapPlaniVerileri = await getGenelHesapPlani(
        user.token || "",
        user.denetimTuru || ""
      );

      const rowsAll: Veri[] = [];

      genelHesapPlaniVerileri.forEach((veri: any) => {
        rowsAll.push({
          id: veri.id,
          kod: veri.kod.replace("-", "."),
          adi: veri.adi,
          paraBirimi: veri.paraBirimi,
        });
      });

      rowsAll.sort((a: any, b: any) => (a[0] > b[0] ? -1 : 1));

      setFetchedData(rowsAll);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ProtectedPage allowed={user?.konsolidemi || false}>
      <PageContainer
        title="Eliminasyon Fiş İşlemleri"
        description="this is Eliminasyon Fiş İşlemleri"
      >
        <Breadcrumb title="Eliminasyon Fiş İşlemleri" items={BCrumb} />
        <Grid container>
          <Grid item xs={12} lg={12} mb={2}>
            <FisGirisiKontrol
              filterValue={filterValue}
              setKod={setKod}
              setAd={setAd}
            />
          </Grid>
          <Grid item xs={12} lg={12} my={1}>
            <Stack
              direction={{ xs: "column", lg: "row" }}
              alignItems={"center"}
              justifyContent={"start"}
            >
              <Box display={"flex"} alignItems={"center"}>
                <Typography
                  variant="h6"
                  paddingRight={"16px"}
                  paddingY={"16px"}
                >
                  Fiş Tipi:
                </Typography>
                <CustomSelect
                  labelId="fis"
                  id="fis"
                  size="small"
                  value={fisType}
                  onChange={handleChange}
                  sx={{
                    height: "32px",
                    minWidth: "120px",
                    marginRight: "16px",
                  }}
                >
                  <MenuItem value={"Açılış"}>Açılış</MenuItem>
                  <MenuItem value={"Düzeltme"}>Düzeltme</MenuItem>
                  <MenuItem value={"Sınıflama"}>Sınıflama</MenuItem>
                  <MenuItem value={"Transfer"}>Transfer</MenuItem>
                </CustomSelect>
              </Box>
              <Box sx={{ flex: 1 }}></Box>
              <Box display={"flex"} alignItems={"center"}>
                <Button
                  size="medium"
                  variant="outlined"
                  color="primary"
                  onClick={() => setIsPopUpOpen2(true)}
                >
                  Genel Hesap Planı
                </Button>
                <Button
                  size="medium"
                  variant="outlined"
                  color="primary"
                  onClick={() => setIsPopUpOpen1(true)}
                  sx={{ ml: 2 }}
                >
                  Hazır Fişler
                </Button>
                <Button
                  size="medium"
                  variant="outlined"
                  color="primary"
                  onClick={() => router.push("/Donusum/FisListesi")}
                  sx={{ ml: 2 }}
                >
                  Fiş Listesi
                </Button>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} lg={12} mb={3}>
            <FisGirisi
              kod={kod}
              ad={ad}
              fisType={fisType}
              hazirFislerTiklandimi={hazirFislerTiklandimi}
              genelHesapPlaniListesi={fetchedData}
              handleFilterChange={handleFilterChange}
              setHazirFislerTiklandimi={setHazirFislerTiklandimi}
            />
          </Grid>
          <Grid item xs={12} lg={12}>
            <Typography variant="h6" paddingRight={"16px"} paddingY={"16px"}>
              Son Girilen Fişler
            </Typography>
          </Grid>
          <Grid item xs={12} lg={12}>
            <SonGirilenFisler
              hazirFislerTiklandimi={hazirFislerTiklandimi}
              setHazirFislerTiklandimi={setHazirFislerTiklandimi}
            />
          </Grid>
          {isOpenPopUp1 && (
            <Dialog maxWidth={"md"} open={isOpenPopUp1} onClose={handleClose1}>
              <DialogContent className="testdialog">
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent={"space-between"}
                  alignItems="center"
                >
                  <Typography variant="h5">Hazır Fişler</Typography>
                  <IconButton size="small" onClick={handleClose1}>
                    <IconX size="18" />
                  </IconButton>
                </Stack>
              </DialogContent>
              <DialogContent>
                <HazirFisListesi />
              </DialogContent>
            </Dialog>
          )}
          {isOpenPopUp2 && (
            <Dialog maxWidth={"md"} open={isOpenPopUp2} onClose={handleClose2}>
              <DialogContent className="testdialog">
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent={"space-between"}
                  alignItems="center"
                >
                  <Typography variant="h5">Genel Hesap Planı</Typography>
                  <IconButton size="small" onClick={handleClose2}>
                    <IconX size="18" />
                  </IconButton>
                </Stack>
              </DialogContent>
              <DialogContent>
                <GenelHesapPlani data={fetchedData} />
              </DialogContent>
            </Dialog>
          )}
        </Grid>
      </PageContainer>
    </ProtectedPage>
  );
};

export default Page;
