"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Alert, Box, CircularProgress } from "@mui/material";

interface ImportControlComponentProps {
  tableKey: string;
}

type LazyModule = { default: React.ComponentType<any> };
type Loader = () => Promise<LazyModule>;

const loaderMap: Record<string, Loader> = {
  DonusumMizan: () => import("@/app/(Uygulama)/DenetimKanitlari/MizanKontrol/DonusumMizanKontrol/page"),
  Amortisman: () => import("@/app/(Uygulama)/Hesaplamalar/Amortisman/page"),
  CekSenetReeskont: () => import("@/app/(Uygulama)/Hesaplamalar/CekSenetReeskont/page"),
  DavaKarsiliklari: () => import("@/app/(Uygulama)/Hesaplamalar/DavaKarsiliklari/page"),
  KidemTazminati: () => import("@/app/(Uygulama)/Hesaplamalar/KidemTazminatiBobi/page"),
  KrediHesaplama: () => import("@/app/(Uygulama)/Hesaplamalar/KrediHesaplama/page"),
  Yaslandirma: () => import("@/app/(Uygulama)/Hesaplamalar/Yaslandirma/page"),
  ErtelenmisVergiHesabi: () => import("@/app/(Uygulama)/Hesaplamalar/ErtelenmisVergiHesabi/VergiVarlikKontrol"),
  EnflasyonDonusumMizan: () => import("@/app/(Uygulama)/components/Enflasyon/EnflasyonDonusumMizanKontrol/EnflasyonDonusumMizanKontrol"),
};

export default function ImportControlComponent({ tableKey }: ImportControlComponentProps) {
  const [component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loader = useMemo(() => loaderMap[tableKey], [tableKey]);

  useEffect(() => {
    let active = true;

    if (!loader) {
      setComponent(null);
      setError("Bu tablo için kontrol bileşeni bulunamadı.");
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError(null);
    setComponent(null);

    loader()
      .then((module) => {
        if (!active) return;
        setComponent(() => module.default);
      })
      .catch((e: any) => {
        if (!active) return;
        setError(e?.message || "Kontrol bileşeni yüklenemedi.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loader]);

  if (loading) {
    return (
      <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="warning">{error}</Alert>;
  }

  if (!component) {
    return <Alert severity="info">Kontrol bileşeni hazırlanıyor...</Alert>;
  }

  const LoadedComponent = component;
  return (
    <Box sx={{ maxHeight: "75vh", overflow: "auto", pr: 0.5 }}>
      <LoadedComponent />
    </Box>
  );
}
