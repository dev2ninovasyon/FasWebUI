"use client";

import React, { useRef, useState } from "react";
import { Button, Card, CardContent, CircularProgress, Grid, Tooltip } from "@mui/material";
import { IconEye, IconFileTypeDoc, IconFileTypeXls, IconRotate } from "@tabler/icons-react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
import BelgeKontrolCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import OnemlilikExcelStepper, { OnemlilikExcelStepperRef } from "./OnemlilikExcelStepper";

const BCrumb = [
  { to: "/DenetimKanitlari", title: "Denetim Kanıtları" },
  { to: "/DenetimKanitlari/Onemlilik", title: "Önemlilik" },
  {
    to: "/DenetimKanitlari/Onemlilik/OnemlilikSeviyesiBelirlemeVeDegerlendirme",
    title: "Önemlilik Seviyesi Belirleme ve Değerlendirme",
  },
];

const controller = "OnemlilikSeviyesiKayitlari";

type PageActionLoading = null | "reset" | "preview" | "word" | "excel";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const stepperRef = useRef<OnemlilikExcelStepperRef>(null);
  const [actionLoading, setActionLoading] = useState<PageActionLoading>(null);

  const runAction = async (key: Exclude<PageActionLoading, null>, action?: () => Promise<void>) => {
    if (!action || actionLoading) {
      return;
    }

    setActionLoading(key);
    try {
      await action();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <PageContainer
      title="Önemlilik Seviyesi Belirleme ve Değerlendirme"
      description="Önemlilik Seviyesi Belirleme ve Değerlendirme"
    >
      <Breadcrumb title="Önemlilik Seviyesi Belirleme ve Değerlendirme" items={BCrumb}>
        <Grid container spacing={1} justifyContent="flex-end" alignItems="center">
          <Grid>
            <Tooltip title="Tüm manuel oranları silerek programın varsayılan matris hesaplamasına geri döner." arrow>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={
                  actionLoading === "reset" ? <CircularProgress size={16} color="inherit" /> : <IconRotate size={18} />
                }
                onClick={() => runAction("reset", stepperRef.current?.handleReset)}
                sx={{ textTransform: "none" }}
                disabled={actionLoading !== null}
              >
                {actionLoading === "reset" ? "Yükleniyor..." : "Program Varsayılanlarına Dön"}
              </Button>
            </Tooltip>
          </Grid>
          <Grid>
            <EkBelgeYukleButton formKodu={controller} />
          </Grid>
        </Grid>
      </Breadcrumb>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <OnemlilikExcelStepper ref={stepperRef} />
        </Grid>

        {(user.rol?.includes("KaliteKontrolSorumluDenetci") ||
          user.rol?.includes("SorumluDenetci") ||
          user.rol?.includes("Denetci") ||
          user.rol?.includes("DenetciYardimcisi")) && (
          <>
            <Grid size={{ xs: 12, md: 4 }}>
              <BelgeKontrolCard fetch={() => {}} hazirlayan="Denetçi - Yardımcı Denetçi" controller={controller} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <BelgeKontrolCard fetch={() => {}} onaylayan="Sorumlu Denetçi" controller={controller} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <BelgeKontrolCard fetch={() => {}} kaliteKontrol="Kalite Kontrol Sorumlu Denetçi" controller={controller} />
            </Grid>
          </>
        )}

        <Grid size={{ xs: 12 }}>
          <Card sx={{ bgcolor: "primary.light" }}>
            <CardContent>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Button
                    size="medium"
                    variant="outlined"
                    color="primary"
                    startIcon={
                      actionLoading === "preview" ? <CircularProgress size={16} color="inherit" /> : <IconEye width={18} />
                    }
                    onClick={() => runAction("preview", stepperRef.current?.handleOpenPreview)}
                    sx={{ width: "100%" }}
                    disabled={actionLoading !== null}
                  >
                    {actionLoading === "preview" ? "Hazırlanıyor..." : "PDF Önizleme"}
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Button
                    size="medium"
                    variant="outlined"
                    color="primary"
                    startIcon={
                      actionLoading === "word" ? <CircularProgress size={16} color="inherit" /> : <IconFileTypeDoc width={18} />
                    }
                    onClick={() => runAction("word", stepperRef.current?.handleWordDownload)}
                    sx={{ width: "100%" }}
                    disabled={actionLoading !== null}
                  >
                    {actionLoading === "word" ? "Hazırlanıyor..." : "Word İndir"}
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Button
                    size="medium"
                    variant="outlined"
                    color="primary"
                    startIcon={
                      actionLoading === "excel" ? <CircularProgress size={16} color="inherit" /> : <IconFileTypeXls width={18} />
                    }
                    onClick={() => runAction("excel", stepperRef.current?.handleExcelDownload)}
                    sx={{ width: "100%" }}
                    disabled={actionLoading !== null}
                  >
                    {actionLoading === "excel" ? "Hazırlanıyor..." : "Excel'e Aktar"}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
