"use client";

import React, { useRef, useState } from "react";
import { Button, Card, CardContent, CircularProgress, Grid, Tooltip, Box, Stack, Typography } from "@mui/material";
import { IconEye, IconFileTypeDoc, IconFileTypeXls, IconRotate } from "@tabler/icons-react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import OnemlilikExcelStepper, { OnemlilikExcelStepperRef } from "./OnemlilikExcelStepper";
import BelgeKontrolCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

const BCrumb = [
  { to: "/PlanVeProgram", title: "Plan Ve Program" },
  { to: "/PlanVeProgram/DenetimPlanindaOnemlilik", title: "Denetim Planında Önemlilik" },
  { to: "/PlanVeProgram/DenetimPlanindaOnemlilik/OnemlilikVeOrneklem", title: "Önemlilik Ve Örneklem" },
];

const controller = "OnemlilikVeOrneklem";

type PageActionLoading = null | "reset" | "preview" | "word" | "excel";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const stepperRef = useRef<OnemlilikExcelStepperRef>(null);
  const [actionLoading, setActionLoading] = useState<PageActionLoading>(null);

  const runAction = async (key: Exclude<PageActionLoading, null>, action?: () => Promise<void>) => {
    if (!action || actionLoading) return;
    setActionLoading(key);
    try {
      await action();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <PageContainer title="Önemlilik Seviyesi Belirleme ve Değerlendirme" description="Denetim Planı Önemlilik Ve Örneklem">
      <Breadcrumb title="Önemlilik Seviyesi Belirleme ve Değerlendirme" items={BCrumb}>
        <Grid container spacing={1} justifyContent="flex-end" alignItems="center">
          <Grid size="auto">
            <Tooltip title="Tüm manuel oranları silerek programın varsayılan matris hesaplamasına geri döner." arrow>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={actionLoading === "reset" ? <CircularProgress size={16} color="inherit" /> : <IconRotate size={18} />}
                onClick={() => runAction("reset", stepperRef.current?.handleReset)}
                sx={{ textTransform: "none", fontWeight: 700 }}
                disabled={actionLoading !== null}
              >
                {actionLoading === "reset" ? "Yükleniyor..." : "Program Varsayılanlarına Dön"}
              </Button>
            </Tooltip>
          </Grid>
          <Grid size="auto">
            <EkBelgeYukleButton formKodu={controller} />
          </Grid>
        </Grid>
      </Breadcrumb>

      <Box sx={{ mt: 1 }}>
        {/* Ana İçerik Section */}
        <Box sx={{ mb: 2 }}>
          <OnemlilikExcelStepper ref={stepperRef} />
        </Box>

        {/* İmza Bölümü */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ p: 0.5, bgcolor: "#dbeafe", borderRadius: 2 }}>
              <BelgeKontrolCard fetch={() => {}} hazirlayan="Denetçi - Yardımcı Denetçi" controller={controller} />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ p: 0.5, bgcolor: "#dbeafe", borderRadius: 2 }}>
              <BelgeKontrolCard fetch={() => {}} onaylayan="Sorumlu Denetçi" controller={controller} />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ p: 0.5, bgcolor: "#dbeafe", borderRadius: 2 }}>
              <BelgeKontrolCard fetch={() => {}} kaliteKontrol="Kalite Kontrol Sorumlu Denetçi" controller={controller} />
            </Box>
          </Grid>
        </Grid>

        {/* Export Bölümü - Bottom Blue Row */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              startIcon={actionLoading === "preview" ? <CircularProgress size={16} color="inherit" /> : <IconEye width={18} />}
              onClick={() => runAction("preview", stepperRef.current?.handleOpenPreview)}
              disabled={actionLoading !== null}
              sx={{ bgcolor: "#dbeafe", fontWeight: 700, borderRadius: 1, py: 1.2, borderColor: "#bfdbfe", color: "#1e3a8a", "&:hover": { bgcolor: "#bfdbfe" } }}
            >
              {actionLoading === "preview" ? "Hazırlanıyor..." : "PDF ÖNİZLEME"}
            </Button>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              startIcon={actionLoading === "word" ? <CircularProgress size={16} color="inherit" /> : <IconFileTypeDoc width={18} />}
              onClick={() => runAction("word", stepperRef.current?.handleWordDownload)}
              disabled={actionLoading !== null}
              sx={{ bgcolor: "#dbeafe", fontWeight: 700, borderRadius: 1, py: 1.2, borderColor: "#bfdbfe", color: "#1e3a8a", "&:hover": { bgcolor: "#bfdbfe" } }}
            >
              {actionLoading === "word" ? "Hazırlanıyor..." : "WORD İNDİR"}
            </Button>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              startIcon={actionLoading === "excel" ? <CircularProgress size={16} color="inherit" /> : <IconFileTypeXls width={18} />}
              onClick={() => runAction("excel", stepperRef.current?.handleExcelDownload)}
              disabled={actionLoading !== null}
              sx={{ bgcolor: "#dbeafe", fontWeight: 700, borderRadius: 1, py: 1.2, borderColor: "#bfdbfe", color: "#1e3a8a", "&:hover": { bgcolor: "#bfdbfe" } }}
            >
              {actionLoading === "excel" ? "Hazırlanıyor..." : "EXCEL'E AKTAR"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Page;
