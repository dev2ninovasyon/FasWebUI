"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import { useState } from "react";
import FinansalTablolarDenetimRiskiBelirlemeBelge from "@/app/(Uygulama)/components/CalismaKagitlari/FinansalTablolarDenetimRiskiBelirlemeBelge";
import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton"
const BCrumb = [
  {
    to: "/PlanVeProgram",
    title: "Plan ve Program",
  },
  {
    to: "/PlanVeProgram/FinansalTablolarDenetimRiskiBelirleme",
    title: "Finansal Tablolar Denetim Riski Belirleme",
  },
];

const Page = () => {
  const [isClickedVarsayilanaDon, setIsClickedVarsayilanaDon] = useState(false);

  const [tamamlanan, setTamamlanan] = useState(0);
  const [toplam, setToplam] = useState(0);

  const controller = "FinansalTablolarDenetimRiskiBelirleme";

  return (
    <>
      <Breadcrumb
        title="Finansal Tablolar Denetim Riski Belirleme"
        items={BCrumb}
      >
        <Box sx={{ width: "100%", px: { xs: 1, md: 0 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
            sx={{ width: "100%" }}
          >
            <Typography
              variant="body1"
              sx={{
                textAlign: { xs: "left", sm: "right" },
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {tamamlanan}/{toplam} Tamamlandı
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
                <EkBelgeYukleButton
                  formKodu={controller}
                  fullWidth={false}
                  text="Belge Yükle"
                />
              </Box>

              <Button
                size="medium"
                variant="outlined"
                color="primary"
                disabled={isClickedVarsayilanaDon}
                onClick={() => setIsClickedVarsayilanaDon(true)}
                sx={{ width: { xs: "100%", sm: "auto" }, minWidth: { sm: 160 } }}
              >
                <Typography variant="body1" sx={{ overflowWrap: "break-word", wordWrap: "break-word" }}>
                  {isClickedVarsayilanaDon ? "Varsayılan Yükleniyor..." : "Varsayılana Dön"}
                </Typography>
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Breadcrumb>
      <PageContainer
        title="Finansal Tablolar Denetim Riski Belirleme"
        description="this is Finansal Tablolar Denetim Riski Belirleme"
      >
        <Box sx={{ width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
          <FinansalTablolarDenetimRiskiBelirlemeBelge
            controller={controller}
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
