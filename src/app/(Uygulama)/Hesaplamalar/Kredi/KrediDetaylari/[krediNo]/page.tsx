"use client";

import { Button, Grid, Typography } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import KrediDetayVeriYukleme from "./KrediDetayVeriYukleme";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getKrediHesaplamaVerileriByDenetciDenetlenenYilId } from "@/api/Veri/KrediHesaplama";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

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

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const pathname = usePathname();
  const segments = pathname.split("/");
  const idIndex = segments.indexOf("KrediDetaylari") + 1;
  const pathId = parseInt(segments[idIndex]);

  const [krediNo, setKrediNo] = useState(0);

  const [kaydetTiklandimi, setKaydetTiklandimi] = useState(false);

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

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <PageContainer
      title="Kredi Detayları"
      description="this is Kredi Detayları"
    >
      <Breadcrumb title="Kredi Detayları" items={BCrumb} />

      <Grid container marginTop={3}>
        <Grid
          item
          xs={12}
          lg={12}
          sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
        >
          <Typography variant="h6" px={1}>
            {krediNo} Numaralı Kredi Detayları
          </Typography>
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
          <KrediDetayVeriYukleme
            kaydetTiklandimi={kaydetTiklandimi}
            setKaydetTiklandimi={setKaydetTiklandimi}
          />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
