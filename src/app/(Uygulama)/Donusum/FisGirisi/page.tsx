"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React, { useState } from "react";
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
import FisGirisi from "./FisGirisi";
import FisGirisiKontrol from "./FisGirisiKontrol";
import { useRouter } from "next/navigation";
import SonGirilenFisler from "./SonGirilenFisler";
import HazirFisListesi from "@/app/(Uygulama)/Donusum/HazirFisler/HazirFisListesi";
import { IconX } from "@tabler/icons-react";

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

const Page: React.FC = () => {
  const router = useRouter();

  const [fisType, setFisType] = useState("Düzeltme");
  const [filterValue, setFilterValue] = useState("");

  const [kod, setKod] = useState("");
  const [ad, setAd] = useState("");
  const [bakiye, setBakiye] = useState<number[]>([]);

  const [hazirFislerTiklandimi, setHazirFislerTiklandimi] = useState(false);
  const [isOpenPopUp, setIsPopUpOpen] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFisType(event.target.value);
  };

  const handleFilterChange = (value: string) => {
    setFilterValue(value);
  };

  const handleClose = () => {
    setIsPopUpOpen(false);
    setHazirFislerTiklandimi(true);
  };

  return (
    <PageContainer title="Fiş Girişi" description="this is Fiş Girişi">
      <Breadcrumb title="Fiş Girişi" items={BCrumb} />
      <Grid container>
        <Grid item xs={12} lg={12} mb={2}>
          <FisGirisiKontrol
            filterValue={filterValue}
            setBakiye={setBakiye}
            setKod={setKod}
            setAd={setAd}
          />
        </Grid>

        <Grid item xs={12} lg={12}>
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"start"}
          >
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
              <MenuItem value={"Düzeltme"}>Düzeltme</MenuItem>
              <MenuItem value={"Sınıflama"}>Sınıflama</MenuItem>
              <MenuItem value={"Açılış"}>Açılış</MenuItem>
            </CustomSelect>

            <Box sx={{ flex: 1 }}></Box>
            <Button
              size="medium"
              variant="outlined"
              color="primary"
              onClick={() => setIsPopUpOpen(true)}
            >
              Hazır Fişler
            </Button>
            <Button
              size="medium"
              variant="outlined"
              color="primary"
              onClick={() => router.push("/Donusum/FisListesi")}
              sx={{ ml: { lg: 2 } }}
            >
              Fiş Listesi
            </Button>
          </Stack>
          {isOpenPopUp && (
            <Dialog
              maxWidth={"lg"}
              open={isOpenPopUp}
              onClose={handleClose}
              disablePortal
            >
              <DialogContent className="testdialog">
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent={"space-between"}
                  alignItems="center"
                >
                  <Typography variant="h5">Hazır Fişler</Typography>
                  <IconButton size="small" onClick={handleClose}>
                    <IconX size="18" />
                  </IconButton>
                </Stack>
              </DialogContent>
              <DialogContent>
                <HazirFisListesi />
              </DialogContent>
            </Dialog>
          )}
        </Grid>

        <Grid item xs={12} lg={12} mb={3}>
          <FisGirisi
            kod={kod}
            ad={ad}
            bakiye={bakiye}
            fisType={fisType}
            hazirFislerTiklandimi={hazirFislerTiklandimi}
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
      </Grid>
    </PageContainer>
  );
};

export default Page;
