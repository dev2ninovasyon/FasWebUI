"use client";

import { Button, Grid, Typography } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import KrediDetayVeriYukleme from "./KrediDetayVeriYukleme";
import { useState } from "react";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const segments = pathname.split("/");
  const idIndex = segments.indexOf("KrediDetaylari") + 1;
  const pathKrediNo = parseInt(segments[idIndex]);

  const [kaydetTiklandimi, setKaydetTiklandimi] = useState(false);

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
            {pathKrediNo} Numaralı Kredi Detayları
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
