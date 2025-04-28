"use client";

import { Grid } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import FisDetaylari from "./FisDetaylari";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useEffect, useState } from "react";
import { getGenelHesapPlani } from "@/api/Veri/Mizan";

const BCrumb = [
  {
    to: "/Donusum",
    title: "Dönüşüm",
  },
  {
    to: "/Donusum/FisListesi",
    title: "Fiş Listesi",
  },
  {
    to: "/Donusum/FisListesi/FisDetaylari",
    title: "Fiş Detayları",
  },
];

interface Veri {
  id: number;
  kod: string;
  adi: string;
  paraBirimi: string;
}

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [fetchedData, setFetchedData] = useState<Veri[]>([]);

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
    <PageContainer title="Fiş Detayları" description="this is Fiş Detayları">
      <Breadcrumb title="Fiş Detayları" items={BCrumb} />

      <Grid container marginTop={3}>
        <Grid item xs={12} lg={12}>
          <FisDetaylari genelHesapPlaniListesi={fetchedData} />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
