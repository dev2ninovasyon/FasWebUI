"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React, { useEffect, useState } from "react";
import { Button, Grid } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "react-redux";
import DonusumFisleri from "./DonusumFisleri";
import { getGenelHesapPlani } from "@/api/Veri/Mizan";

const BCrumb = [
  {
    to: "/Veri",
    title: "Veri",
  },
  {
    to: "/Veri/DonusumFisleriVeriYukleme",
    title: "Dönüşüm Fişleri Veri Yükleme",
  },
];

interface Veri {
  id: number;
  kod: string;
  adi: string;
  paraBirimi: string;
}

const Page: React.FC = () => {
  const customizer = useSelector((state: AppState) => state.customizer);

  const user = useSelector((state: AppState) => state.userReducer);

  const [fetchedData, setFetchedData] = useState<Veri[]>([]);

  const [kaydetTiklandimi, setKaydetTiklandimi] = useState(false);

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
    <PageContainer
      title="Dönüşüm Fişleri Veri Yükleme"
      description="this is Dönüşüm Fişleri Veri Yükleme"
    >
      <Breadcrumb title="Dönüşüm Fişleri Veri Yükleme" items={BCrumb} />
      <Grid container>
        <Grid
          item
          xs={12}
          lg={12}
          sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}
        >
          <Button
            type="button"
            size="medium"
            disabled={kaydetTiklandimi}
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
          <DonusumFisleri
            genelHesapPlaniListesi={fetchedData}
            kaydetTiklandimi={kaydetTiklandimi}
            setKaydetTiklandimi={setKaydetTiklandimi}
          />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
