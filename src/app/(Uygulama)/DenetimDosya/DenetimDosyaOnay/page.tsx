"use client";
import React from "react";
import { Grid } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import DenetimDosyaOnayTable from "./DenetimDosyaOnayTable";
import BelgeKontrolCardTopluOnay from "./BelgeKontrolCardTopluOnay";

const BCrumb = [
  { to: "/DenetimDosya", title: "Denetim Dosya" },
  { to: "/DenetimDosya/DenetimDosyaOnay", title: "Denetim Dosya Onay" },
];

const Page = () => {
  const [refreshKey, setRefreshKey] = React.useState(0);
  const fetchData = React.useCallback(() => setRefreshKey((k) => k + 1), []);

  // âœ… Seçilen kimlikler burada tutulacak:
  const [hazirlayanId, setHazirlayanId] = React.useState<number | undefined>();
  const [onaylayanId, setOnaylayanId] = React.useState<number | undefined>();
  const [kaliteKontrolId, setKaliteKontrolId] = React.useState<number | undefined>();

  const controller = "DenetimDosyaOnay";

  const handleChangeSelectedId = React.useCallback(
    (role: "hazirlayan" | "onaylayan" | "kaliteKontrol", id?: number) => {
      if (role === "hazirlayan") setHazirlayanId(id);
      else if (role === "onaylayan") setOnaylayanId(id);
      else setKaliteKontrolId(id);
      // DEBUG
      console.log("CARD->PAGE:", role, id);
    },
    []
  );

  return (
    <PageContainer title="Denetim Dosya Yazdır" description="this is Denetim Dosya Yazdır">
      <Breadcrumb title="Denetim Dosya Onay" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid size={12}>
          <Grid container spacing={3}>
            <Grid
              size={{
                xs: 12,
                md: 4,
                lg: 4
              }}>
              <BelgeKontrolCardTopluOnay
                fetch={fetchData}
                hazirlayan="Denetçi - Yardımcı Denetçi"
                controller={controller}
                onChangeSelectedId={handleChangeSelectedId}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 4,
                lg: 4
              }}>
              <BelgeKontrolCardTopluOnay
                fetch={fetchData}
                onaylayan="Sorumlu Denetçi"
                controller={controller}
                onChangeSelectedId={handleChangeSelectedId}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 4,
                lg: 4
              }}>
              <BelgeKontrolCardTopluOnay
                fetch={fetchData}
                kaliteKontrol="Kalite Kontrol Sorumlu Denetçi"
                controller={controller}
                onChangeSelectedId={handleChangeSelectedId}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid size={12}>
          {/* âœ… IDâ€™ler tabloya prop olarak gidiyor */}
          <DenetimDosyaOnayTable
            hazirlayanId={hazirlayanId}
            onaylayanId={onaylayanId}
            kaliteKontrolId={kaliteKontrolId}
            refreshKey={refreshKey}
            
          />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
