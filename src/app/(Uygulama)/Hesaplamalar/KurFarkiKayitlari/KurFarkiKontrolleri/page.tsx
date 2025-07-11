"use client";

import React, { useEffect, useState } from "react";
import { Divider, Grid, Tab, Typography, useTheme } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import KurFarkiKontrolleriForm from "@/app/(Uygulama)/components/Hesaplamalar/KurFarkiKayitlari/KurFarkiKontrolleriForm";
import KurFarkiKontrolleriOzet from "./KurFarkiKontrolleriOzet";
import {
  getKurFarkiKontrolleriFisler,
  getKurFarkiKontrolleriOzet,
} from "@/api/Hesaplamalar/Hesaplamalar";
import KurFarkiKontrolleriFis from "./KurFarkiKontrolleriFis";

const BCrumb = [
  {
    to: "/Hesaplamalar",
    title: "Hesaplamalar",
  },
  {
    to: "/Hesaplamalar/KurFarkiKayitlari",
    title: "Kur Farkı Kayıtları",
  },
  {
    to: "/Hesaplamalar/KurFarkiKayitlari/KurFarkiKontrolleri",
    title: "Kur Farkı Kontrolleri",
  },
];
interface Veri {
  detayKodu: string;
  hesapAdi: string;
  borctutari: number;
  alacakTutari: number;
}

interface VeriFis {
  id: number;
  fisNo: number;
  fisTarihi: string;
  detayKodu: string;
  hesapAdi: string;
  aciklama: string;
  borc: number;
  alacak: number;
}

const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [fetchedDataOzet, setFetchedDataOzet] = useState<Veri[]>([]);
  const [fetchedDataFis, setFetchedDataFis] = useState<VeriFis[]>([]);

  const [hesapNo, setHesapNo] = useState("");
  const [baslangicTarihi, setBaslangicTarihi] = useState(`${user.yil}-01-01`);
  const [bitisTarihi, setBitisTarihi] = useState(`${user.yil}-12-31`);

  const [tip, setTip] = useState("646 Kambiyo Kârları");
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTip(newValue);
    setFetchedDataOzet([]);
    setFetchedDataFis([]);
  };

  const [verileriGetirTiklandimi, setVerileriGetirTiklandimi] = useState(false);

  const [openCartAlert, setOpenCartAlert] = useState(false);

  const handleVerileriGetir = async () => {
    try {
      if (tip == "646 Kambiyo Kârları") {
        const result = await getKurFarkiKontrolleriOzet(
          user.token || "",
          user.denetciId || 0,
          user.yil || 0,
          user.denetlenenId || 0,
          646,
          hesapNo,
          baslangicTarihi,
          bitisTarihi
        );

        const rowsAll: any = [];
        result.forEach((veri: any) => {
          const newRow: any = [
            veri.kebirKodu,
            veri.hesapAdi,
            veri.borcTutari,
            veri.alacakTutari,
          ];
          rowsAll.push(newRow);
        });
        rowsAll.sort((a: any, b: any) => (a[0] > b[0] ? 1 : -1));

        setFetchedDataOzet(rowsAll);

        const resultFis = await getKurFarkiKontrolleriFisler(
          user.token || "",
          user.denetciId || 0,
          user.yil || 0,
          user.denetlenenId || 0,
          646,
          hesapNo,
          baslangicTarihi,
          bitisTarihi
        );

        const rowsAllFis: any = [];
        resultFis.forEach((veri: any) => {
          const newRow: any = [
            veri.id,
            veri.yevmiyeNo,
            veri.yevmiyeTarih.split("T")[0].split("-").reverse().join("."),
            veri.detayKodu,
            veri.hesapAdi,
            veri.aciklama,
            veri.borc,
            veri.alacak,
          ];
          rowsAllFis.push(newRow);
        });
        rowsAllFis.sort((a: any, b: any) => (a[1] > b[1] ? 1 : -1));

        setFetchedDataFis(rowsAllFis);

        setVerileriGetirTiklandimi(false);
      }
      if (tip == "656 Kambiyo Zararları") {
        const result = await getKurFarkiKontrolleriOzet(
          user.token || "",
          user.denetciId || 0,
          user.yil || 0,
          user.denetlenenId || 0,
          656,
          hesapNo,
          baslangicTarihi,
          bitisTarihi
        );

        const rowsAll: any = [];
        result.forEach((veri: any) => {
          const newRow: any = [
            veri.kebirKodu,
            veri.hesapAdi,
            veri.borcTutari,
            veri.alacakTutari,
          ];
          rowsAll.push(newRow);
        });
        rowsAll.sort((a: any, b: any) => (a[0] > b[0] ? 1 : -1));

        setFetchedDataOzet(rowsAll);

        const resultFis = await getKurFarkiKontrolleriFisler(
          user.token || "",
          user.denetciId || 0,
          user.yil || 0,
          user.denetlenenId || 0,
          656,
          hesapNo,
          baslangicTarihi,
          bitisTarihi
        );

        const rowsAllFis: any = [];
        resultFis.forEach((veri: any) => {
          const newRow: any = [
            veri.id,
            veri.yevmiyeNo,
            veri.yevmiyeTarih.split("T")[0].split("-").reverse().join("."),
            veri.detayKodu,
            veri.hesapAdi,
            veri.aciklama,
            veri.borc,
            veri.alacak,
          ];
          rowsAllFis.push(newRow);
        });
        rowsAllFis.sort((a: any, b: any) => (a[1] > b[1] ? 1 : -1));

        setFetchedDataFis(rowsAllFis);

        setVerileriGetirTiklandimi(false);
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    if (verileriGetirTiklandimi) {
      setOpenCartAlert(true);
      handleVerileriGetir();
    } else {
      setOpenCartAlert(false);
    }
  }, [verileriGetirTiklandimi]);

  return (
    <PageContainer
      title="Kur Farkı Kontrolleri"
      description="this is Kur Farkı Kontrolleri"
    >
      <Breadcrumb title="Kur Farkı Kontrolleri" items={BCrumb} />
      <Grid container>
        <Grid item xs={12} lg={12}>
          <TabContext value={tip}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              <Tab label="646 Kambiyo Kârları" value="646 Kambiyo Kârları" />
              <Tab
                label="656 Kambiyo Zararları"
                value="656 Kambiyo Zararları"
              />
            </TabList>
            <Divider />
            <TabPanel value="646 Kambiyo Kârları" sx={{ paddingX: 0 }}>
              <Grid container>
                <Grid item xs={12} lg={12} mb={3}>
                  <KurFarkiKontrolleriForm
                    hesapNo={hesapNo}
                    baslangicTarihi={baslangicTarihi}
                    bitisTarihi={bitisTarihi}
                    setHesapNo={setHesapNo}
                    setBaslangicTarihi={setBaslangicTarihi}
                    setBitisTarihi={setBitisTarihi}
                    setVerileriGetirTiklandimi={setVerileriGetirTiklandimi}
                  />
                </Grid>
                <Grid item xs={12} lg={12} mb={3}>
                  <KurFarkiKontrolleriOzet data={fetchedDataOzet} />
                </Grid>
                <Grid
                  item
                  xs={12}
                  lg={12}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  <Typography
                    variant="h6"
                    paddingRight={"16px"}
                    paddingY={"16px"}
                  >
                    Fiş Listesi
                  </Typography>
                </Grid>
                <Grid item xs={12} lg={12}>
                  <KurFarkiKontrolleriFis data={fetchedDataFis} />
                </Grid>
              </Grid>
            </TabPanel>
            <TabPanel value="656 Kambiyo Zararları" sx={{ paddingX: 0 }}>
              <Grid container>
                <Grid item xs={12} lg={12} mb={3}>
                  <KurFarkiKontrolleriForm
                    hesapNo={hesapNo}
                    baslangicTarihi={baslangicTarihi}
                    bitisTarihi={bitisTarihi}
                    setHesapNo={setHesapNo}
                    setBaslangicTarihi={setBaslangicTarihi}
                    setBitisTarihi={setBitisTarihi}
                    setVerileriGetirTiklandimi={setVerileriGetirTiklandimi}
                  />
                </Grid>
                <Grid item xs={12} lg={12} mb={3}>
                  <KurFarkiKontrolleriOzet data={fetchedDataOzet} />
                </Grid>
                <Grid
                  item
                  xs={12}
                  lg={12}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  <Typography
                    variant="h6"
                    paddingRight={"16px"}
                    paddingY={"16px"}
                  >
                    Fiş Listesi
                  </Typography>
                </Grid>
                <Grid item xs={12} lg={12}>
                  <KurFarkiKontrolleriFis data={fetchedDataFis} />
                </Grid>
              </Grid>
            </TabPanel>
          </TabContext>
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
