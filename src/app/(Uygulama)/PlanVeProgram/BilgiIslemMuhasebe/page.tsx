"use client";

import { useState } from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import BilgiIslemMuhasebeTable from "@/app/(Uygulama)/components/CalismaKagitlari/BilgiIslemMuhasebeTableHandson";
import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";

const BCrumb = [
  {
    to: "/PlanVeProgram",
    title: "Plan ve Program",
  },
  {
    to: "/PlanVeProgram/BilgiIslemMuhasebe",
    title: "Bilgi İşlem ve Muhasebe Sistemi",
  },
];

const Page = () => {
  const [isClickedVarsayilanaDon, setIsClickedVarsayilanaDon] = useState(false);
  const [tamamlanan, setTamamlanan] = useState(0);
  const [toplam, setToplam] = useState(0);

  const controller = "BilgiIslemMuhasebe";

  return (
    <>
      <Breadcrumb title="Bilgi İşlem ve Muhasebe Sistemi" items={BCrumb}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={1.5}
          sx={{
            width: "95%",
            margin: "0 auto",
            alignItems: { xs: "stretch", lg: "center" },
            justifyContent: "space-between",
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              Excel şablonuna dayalı değerlendirme soruları ve aksiyon metinleri
            </Typography>
            <Chip
              color={tamamlanan === toplam && toplam > 0 ? "success" : "primary"}
              label={`${tamamlanan}/${toplam} soru değerlendirildi`}
              sx={{ width: "fit-content" }}
            />
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ alignItems: { xs: "stretch", sm: "center" } }}
          >
            <EkBelgeYukleButton
              formKodu={controller}
              fullWidth={false}
              text="Belge Yükle"
            />
            <Button
              size="medium"
              variant="outlined"
              color="primary"
              disabled={isClickedVarsayilanaDon}
              onClick={() => setIsClickedVarsayilanaDon(true)}
            >
              Varsayılana Dön
            </Button>
          </Stack>
        </Stack>
      </Breadcrumb>

      <PageContainer
        title="Bilgi İşlem ve Muhasebe Sistemi"
        description="Bilgi işlem ve muhasebe sistemine ilişkin değerlendirme belgesi"
      >
        <Box>
          <BilgiIslemMuhasebeTable
            isClickedVarsayilanaDon={isClickedVarsayilanaDon}
            setIsClickedVarsayilanaDon={setIsClickedVarsayilanaDon}
            setTamamlanan={setTamamlanan}
            setToplam={setToplam}
          />
        </Box>
      </PageContainer>
    </>
  );
};

export default Page;
