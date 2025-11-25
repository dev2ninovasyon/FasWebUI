"use client";

import { useState } from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box, Grid } from "@mui/material";
import GecmisDonemDonusumDuzeltmeBelgesi from "@/app/(Uygulama)/components/DenetimKanitlari/DonusumMizanKontrol/GecmisDonemDonusumDuzeltmeBelgesi";
import BelgeKontrolCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard";

const BCrumb = [
  {
    to: "/DenetimKanitlari",
    title: "Denetim Kanıtları",
  },
  {
    to: "/DenetimKanitlari/FinansalTablolar",
    title: "Finansal Tablolar",
  },
  {
    to: "/DenetimKanitlari/FinansalTablolar/GecmisDonemDonusumDuzeltmeBelgesi",
    title: "Geçmiş Dönem Dönüşüm Düzeltme Belgesi",
  },
];

const GecmisDonemDonusumDuzeltmeBelgesiPage = () => {
  const [gorevliId, setGorevliId] = useState<number | null>(null);

  const handleSetSelectedGorevliId = (selectedId: number) => {
    setGorevliId(selectedId);
  };
  return (
    <PageContainer
      title="Geçmiş Dönem Dönüşüm Düzeltme Belgesi"
      description="Geçmiş Dönem Dönüşüm Düzeltme Belgesi"
    >
      <Breadcrumb
        title="Geçmiş Dönem Dönüşüm Düzeltme Belgesi"
        items={BCrumb}
      />
      <Grid container spacing={2} mt={1}>
        <Grid item xs={12}>
          <GecmisDonemDonusumDuzeltmeBelgesi />
            </Grid>
      </Grid>
    </PageContainer>
  );
};

export default GecmisDonemDonusumDuzeltmeBelgesiPage;
