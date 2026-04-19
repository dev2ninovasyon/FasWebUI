"use client";

import { useState } from "react";
import { Box, Button, Chip, CircularProgress, Stack } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import BilgiIslemMuhasebeTable from "@/app/(Uygulama)/components/CalismaKagitlari/BilgiIslemMuhasebeTableHandson";
import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";

const BCrumb = [
  { to: "/PlanVeProgram", title: "Plan ve Program" },
  { to: "/PlanVeProgram/BilgiIslemMuhasebe", title: "Bilgi İşlem ve Muhasebe Sistemi" },
];

const btnSx = { fontSize: "0.72rem", py: 0.4, px: 1.2 };

const Page = () => {
  const [isClickedVarsayilanaDon, setIsClickedVarsayilanaDon] = useState(false);
  const [tamamlanan, setTamamlanan] = useState(0);
  const [toplam, setToplam] = useState(0);
  const [saveRequestVersion, setSaveRequestVersion] = useState(0);
  const [tableState, setTableState] = useState({
    isDirty: false,
    saving: false,
    loading: false,
    recordCount: 0,
    hayirCount: 0,
    kritikCount: 0,
  });

  const controller = "BilgiIslemMuhasebe";

  return (
    <>
      <Breadcrumb title="Bilgi İşlem ve Muhasebe Sistemi" items={BCrumb}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={1.5}
          sx={{
            width: "99%",
            margin: "0 auto",
            alignItems: { xs: "stretch", lg: "center" },
            justifyContent: "space-between",
          }}
        >
          <Stack spacing={0.75}>
            <Chip
              variant="outlined"
              label={`${tamamlanan}/${toplam}`}
              sx={{ width: "fit-content" }}
            />
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ alignItems: { xs: "stretch", sm: "center" } }}
          >
            <EkBelgeYukleButton
              formKodu={controller}
              fullWidth={false}
              text="Belge Yükle"
            />
            <Button
              size="small"
              variant="outlined"
              color="primary"
              sx={btnSx}
              disabled={isClickedVarsayilanaDon || tableState.loading}
              onClick={() => setIsClickedVarsayilanaDon(true)}
            >
              {isClickedVarsayilanaDon ? "Sıfırlanıyor..." : "Varsayılana Dön"}
            </Button>
          </Stack>
        </Stack>
      </Breadcrumb>

      <PageContainer
        title="Bilgi İşlem ve Muhasebe Sistemi"
        description="Bilgi işlem ve muhasebe sistemine ilişkin değerlendirme belgesi"
      >
        <Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
            <Button
              size="small"
              variant={tableState.isDirty ? "contained" : "outlined"}
              color="primary"
              sx={btnSx}
              disabled={!tableState.isDirty || tableState.saving || tableState.loading}
              onClick={() => setSaveRequestVersion((prev) => prev + 1)}
              startIcon={
                tableState.saving ? <CircularProgress size={14} color="inherit" /> : undefined
              }
            >
              {tableState.saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </Button>
          </Box>

          <BilgiIslemMuhasebeTable
            isClickedVarsayilanaDon={isClickedVarsayilanaDon}
            setIsClickedVarsayilanaDon={setIsClickedVarsayilanaDon}
            setTamamlanan={setTamamlanan}
            setToplam={setToplam}
            saveRequestVersion={saveRequestVersion}
            onStateChange={setTableState}
          />
        </Box>
      </PageContainer>
    </>
  );
};

export default Page;
