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
import GenelHesapPlani from "@/app/(Uygulama)/components/Donusum/FisGirisi/GenelHesapPlani";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getGenelHesapPlani } from "@/api/Veri/Mizan";

const BCrumb = [
  {
    to: "/Donusum",
    title: "Dönüşüm",
  },
  {
    to: "/Donusum/FisGirisi",
    title: "Fiş Girişi",
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
  const [transferSignal, setTransferSignal] = useState(0);

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
    if (!user.denetimTuru) return;
    try {
      const genelHesapPlaniVerileri = await getGenelHesapPlani(user.denetimTuru);

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
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.denetimTuru]);

  return (
    <PageContainer title="Fiş Girişi" description="this is Fiş Girişi">
      <Breadcrumb title="Fiş Girişi" items={BCrumb} />
      <Grid container sx={{ overflow: "hidden", minWidth: 0 }}>
        <Grid
          mb={2}
          size={{
            xs: 12,
            lg: 12
          }}>
          <FisGirisiKontrol
            filterValue={filterValue}
            setKod={setKod}
            setAd={setAd}
            highlightedKod={kod}
            onTransfer={(kod) => {
              setTransferSignal((prev) => prev + 1);
              setFilterValue("");
              setKod(kod);
            }}
          />
        </Grid>
        <Grid
          my={1}
          size={{
            xs: 12,
            lg: 12
          }}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            alignItems={"center"}
            justifyContent={"start"}
          >
            <Box display={"flex"} alignItems={"center"}>
              <Typography variant="h6" paddingRight={"16px"} paddingY={"16px"}>
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
        <Grid
          mb={3}
          size={{
            xs: 12,
            lg: 12
          }}>
          <FisGirisi
            konsolidasyonMu={false}
            kod={kod}
            ad={ad}
            fisType={fisType}
            hazirFislerTiklandimi={hazirFislerTiklandimi}
            transferSignal={transferSignal}
            genelHesapPlaniListesi={fetchedData}
            handleFilterChange={handleFilterChange}
            setHazirFislerTiklandimi={setHazirFislerTiklandimi}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            lg: 12
          }}>
          <Typography variant="h6" paddingRight={"16px"} paddingY={"16px"}>
            Son Girilen Fişler
          </Typography>
        </Grid>
        <Grid
          size={{
            xs: 12,
            lg: 12
          }}>
          <SonGirilenFisler
            konsolidasyonMu={false}
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
              <HazirFisListesi konsolidasyonMu={false} />
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
  );
};

export default Page;

