"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Button, CircularProgress, Grid, Skeleton, Tooltip } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
import MusteriTanima from "./MusteriTanima";
import FileUploadIcon from "@mui/icons-material/FileUpload";

const cardSkeleton = () => <Skeleton variant="rounded" height={180} />;

const BelgeKontrolCard = dynamic(
  () => import("@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard"),
  { loading: cardSkeleton }
);
const IslemlerCardHtml = dynamic(
  () => import("@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCardHtml"),
  { loading: cardSkeleton }
);

const BCrumb = [
  { to: "/Musteri", title: "Musteri" },
  { to: "/Musteri/MusteriTanima", title: "Musteri Tanima" },
];

const controller = "MusteriTanima";
const breadcrumbButtonSx = {
  minWidth: 132,
  height: 48,
  textTransform: "none",
  textAlign: "center",
  whiteSpace: "nowrap",
};

const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const [showSecondaryContent, setShowSecondaryContent] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const htmlBuilderRef = useRef<(() => Promise<string>) | undefined>(undefined);
  const saveHandlerRef = useRef<(() => Promise<boolean>) | undefined>(undefined);
  const pdfUploadHandlerRef = useRef<((file: File) => Promise<void>) | undefined>(undefined);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSecondaryContent(true);
    }, 250);

    return () => window.clearTimeout(timer);
  }, []);

  const handleBreadcrumbPdfChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !pdfUploadHandlerRef.current) {
      if (event.target) event.target.value = "";
      return;
    }

    setPdfUploading(true);
    try {
      await pdfUploadHandlerRef.current(file);
    } finally {
      setPdfUploading(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  return (
    <PageContainer title="Musteri Tanima" description="Musteri Tanima Belgesi">
      <Breadcrumb title="Musteri Tanima" items={BCrumb}>
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          style={{ display: "none" }}
          onChange={handleBreadcrumbPdfChange}
        />
        <Tooltip title="Müşteri Tanıma alanını doldurmak için Kurumlar Vergisi Beyannamesi PDF'i yükleyin.">
          <span>
            <Button
              variant="outlined"
              startIcon={pdfUploading ? <CircularProgress size={18} /> : <FileUploadIcon />}
              disabled={pdfUploading || !pdfUploadHandlerRef.current}
              onClick={() => pdfInputRef.current?.click()}
              sx={breadcrumbButtonSx}
            >
              {pdfUploading ? "İşleniyor" : "PDF Yükle"}
            </Button>
          </span>
        </Tooltip>
        <EkBelgeYukleButton
          formKodu="MusteriTanima"
          text="Belge Yükle"
          fullWidth={false}
          sx={breadcrumbButtonSx}
        />
      </Breadcrumb>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <MusteriTanima
            onRegisterHtmlBuilder={(handler) => {
              htmlBuilderRef.current = handler;
            }}
            onRegisterSaveHandler={(handler) => {
              saveHandlerRef.current = handler;
            }}
            onRegisterPdfUploadHandler={(handler) => {
              pdfUploadHandlerRef.current = handler;
            }}
          />
        </Grid>

        {showSecondaryContent &&
          (user.rol?.includes("KaliteKontrolSorumluDenetci") ||
            user.rol?.includes("SorumluDenetci") ||
            user.rol?.includes("Denetci") ||
            user.rol?.includes("DenetciYardimcisi")) && (
          <>
            <Grid size={{ xs: 12, md: 4 }}>
              <BelgeKontrolCard fetch={() => {}} hazirlayan="Denetci - Yardimci Denetci" controller={controller} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <BelgeKontrolCard fetch={() => {}} onaylayan="Sorumlu Denetci" controller={controller} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <BelgeKontrolCard fetch={() => {}} kaliteKontrol="Kalite Kontrol Sorumlu Denetci" controller={controller} />
            </Grid>
          </>
        )}

        {showSecondaryContent && (
          <Grid size={{ xs: 12 }}>
            <IslemlerCardHtml
              controller={controller}
              buildHtmlAsync={async () => htmlBuilderRef.current?.() ?? ""}
              onBeforeAction={async () => saveHandlerRef.current?.() ?? true}
            />
          </Grid>
        )}
      </Grid>
    </PageContainer>
  );
};

export default Page;
