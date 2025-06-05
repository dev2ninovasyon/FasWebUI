"use client";

import { Box, Button, Grid, Typography, useMediaQuery } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import KrediDetayVeriYukleme from "./KrediDetayVeriYukleme";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getKrediHesaplamaVerileriByDenetciDenetlenenYilId } from "@/api/Veri/KrediHesaplama";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getBaglantiBilgileriByTip } from "@/api/BaglantiBilgileri/BaglantiBilgileri";

const BCrumb = [
  {
    to: "/Hesaplamalar",
    title: "Hesaplamalar",
  },
  {
    to: "/Hesaplamalar/Kredi",
    title: "Kredi",
  },
  {
    to: "/Hesaplamalar/Kredi/KrediDetaylari",
    title: "Kredi Detayları",
  },
];

interface Veri {
  id: number;
  link: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  tip: string;
}

const Page = () => {
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const user = useSelector((state: AppState) => state.userReducer);

  const pathname = usePathname();
  const segments = pathname.split("/");
  const idIndex = segments.indexOf("KrediDetaylari") + 1;
  const pathId = parseInt(segments[idIndex]);

  const controller = "Kredi";

  const [fetchedData, setFetchedData] = useState<Veri | null>(null);

  const [krediNo, setKrediNo] = useState(0);

  const [kaydetTiklandimi, setKaydetTiklandimi] = useState(false);

  const [sonKaydedilmeTarihi, setSonKaydedilmeTarihi] = useState("");

  const fetchData = async () => {
    try {
      const krediHesaplamaVerisi =
        await getKrediHesaplamaVerileriByDenetciDenetlenenYilId(
          user.token || "",
          user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0,
          pathId || 0
        );

      setKrediNo(krediHesaplamaVerisi.alinanKrediNumarasi);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchDataBaglantibilgileri = async () => {
    try {
      const baglantiBilgisi = await getBaglantiBilgileriByTip(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.id || 0,
        user.yil || 0,
        controller
      );
      if (baglantiBilgisi != undefined) {
        // Tarihleri "DD.MM.YYYY HH:mm" formatında ayarla
        const formatDateTime = (dateTimeStr?: string) => {
          if (!dateTimeStr) return "";
          const date = new Date(dateTimeStr);
          const pad = (n: number) => n.toString().padStart(2, "0");
          return `${pad(date.getDate())}.${pad(
            date.getMonth() + 1
          )}.${date.getFullYear()} ${pad(date.getHours())}:${pad(
            date.getMinutes()
          )}`;
        };

        const newRow: Veri = {
          id: baglantiBilgisi.id,
          link: baglantiBilgisi.link,
          baslangicTarihi: formatDateTime(baglantiBilgisi.baslangicTarihi),
          bitisTarihi: formatDateTime(baglantiBilgisi.bitisTarihi),
          tip: baglantiBilgisi.tip,
        };
        setFetchedData(newRow);
      } else {
        setFetchedData(null);
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchDataBaglantibilgileri();
  }, []);

  return (
    <PageContainer
      title="Kredi Detayları"
      description="this is Kredi Detayları"
    >
      <Breadcrumb
        title={`${krediNo} Numaralı Kredi Detayları`}
        items={BCrumb}
      />

      <Grid container marginTop={3}>
        <Grid
          item
          xs={12}
          lg={12}
          sx={{
            display: "flex",
            flexDirection: smDown ? "column" : "row",
            alignItems: "center",
            justifyContent: "flex-end",
            mb: 2,
            gap: 1,
          }}
        >
          {sonKaydedilmeTarihi && (
            <Typography
              variant="body2"
              textAlign={"center"}
              sx={{ mb: smDown ? 1 : 0 }}
            >
              Son Kaydedilme: {sonKaydedilmeTarihi}
            </Typography>
          )}
          <Box flex={1}></Box>
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
              disabled={kaydetTiklandimi || !fetchedData == null}
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
        <Grid item xs={12} lg={12}>
          <KrediDetayVeriYukleme
            kaydetTiklandimi={kaydetTiklandimi}
            setKaydetTiklandimi={setKaydetTiklandimi}
            setSonKaydedilmeTarihi={setSonKaydedilmeTarihi}
          />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
