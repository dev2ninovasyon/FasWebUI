"use client";

import React, { useEffect, useState } from "react";
import { Box, Button, Grid, useMediaQuery } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import DonusumFisleri from "@/app/(Uygulama)/Veri/DonusumFisleriVeriYukleme/DonusumFisleri";
import { getGenelHesapPlani } from "@/api/Veri/Mizan";

interface Veri {
  id: number;
  kod: string;
  adi: string;
  paraBirimi: string;
}

const DonusumFisleriVeriYuklemeTab: React.FC = () => {
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));
  const user = useSelector((state: AppState) => state.userReducer);

  const [fetchedData, setFetchedData] = useState<Veri[]>([]);
  const [kaydetTiklandimi, setKaydetTiklandimi] = useState(false);

  const fetchData = async () => {
    try {
      const genelHesapPlaniVerileri = await getGenelHesapPlani(
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
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid
        sx={{
          display: "flex",
          flexDirection: smDown ? "column" : "row",
          alignItems: "center",
          justifyContent: "flex-end",
          mb: 2,
          gap: 1,
        }}
        size={{
          xs: 12,
          lg: 12
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
            disabled={kaydetTiklandimi}
            variant="outlined"
            color="primary"
            onClick={() => {
              setKaydetTiklandimi(true);
            }}
          >
            Kaydet
          </Button>
        </Box>
      </Grid>
      <Grid
        size={{
          xs: 12,
          lg: 12
        }}
      >
        <DonusumFisleri
          genelHesapPlaniListesi={fetchedData}
          kaydetTiklandimi={kaydetTiklandimi}
          setKaydetTiklandimi={setKaydetTiklandimi}
        />
      </Grid>
    </Grid>
  );
};

export default DonusumFisleriVeriYuklemeTab;
