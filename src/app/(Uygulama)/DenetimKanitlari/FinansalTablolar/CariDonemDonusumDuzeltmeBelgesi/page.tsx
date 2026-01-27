"use client";

import { useState } from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box, Grid } from "@mui/material";
import CariDonemDonusumDuzeltmeBelgesi from "@/app/(Uygulama)/components/DenetimKanitlari/DonusumMizanKontrol/CariDonemDonusumDuzeltmeBelgesi";
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
    to: "/DenetimKanitlari/FinansalTablolar/CariDonemDonusumDuzeltmeBelgesi",
    title: "Cari Dönem Dönüşüm Düzeltme Belgesi",
  },
];


const CariDonemDonusumDuzeltmeBelgesiPage = () => {
  const [gorevliId, setGorevliId] = useState<number | null>(null);

  const handleSetSelectedGorevliId = (selectedId: number) => {
    setGorevliId(selectedId);
  };
  return (
    <PageContainer
      title="Cari Dönem Dönüşüm Düzeltme Belgesi"
      description="Cari dönem dönüşüm düzeltme belgesi listesi"
    >
      <Breadcrumb
        title="Cari Dönem Dönüşüm Düzeltme Belgesi"
        items={BCrumb}
      />
      <Grid container spacing={2} mt={1}>
        <Grid size={12}>
          <CariDonemDonusumDuzeltmeBelgesi />
            </Grid>
      </Grid>
    </PageContainer>
  );
};

export default CariDonemDonusumDuzeltmeBelgesiPage;
