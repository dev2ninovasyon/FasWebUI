"use client";

import { useState } from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box, Grid } from "@mui/material";
import OncekiDonemDonusumDuzeltmeBelgesi from "@/app/(Uygulama)/components/DenetimKanitlari/DonusumMizanKontrol/OncekiDonemDonusumDuzeltmeBelgesi";
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
    to: "/DenetimKanitlari/FinansalTablolar/OncekiDonemDonusumDuzeltmeBelgesi",
    title: "Önceki Dönem Dönüşüm Düzeltme Belgesi",
  },
];

const OncekiDonemDonusumDuzeltmeBelgesiPage = () => {
  const [gorevliId, setGorevliId] = useState<number | null>(null);

  const handleSetSelectedGorevliId = (selectedId: number) => {
    setGorevliId(selectedId);
  };
  return (
    <PageContainer
      title="Önceki Dönem Dönüşüm Düzeltme Belgesi"
      description="Önceki dönem dönüşüm düzeltme belgesi listesi"
    >
      <Breadcrumb
        title="Önceki Dönem Dönüşüm Düzeltme Belgesi"
        items={BCrumb}
      />
      <Grid container spacing={2} mt={1}>
        <Grid size={12}>
          <OncekiDonemDonusumDuzeltmeBelgesi />
            </Grid>
      </Grid>
    </PageContainer>
  );
};

export default OncekiDonemDonusumDuzeltmeBelgesiPage;
