"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CircularProgress, Box, Alert, Typography, Button } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { ENFLASYON_BASE_URL } from "@/config/enflasyonConfig";
import { generateSignature } from "@/utils/crypto";

interface Props {
  url: string;
}

const EnflasyonIframe: React.FC<Props> = ({ url }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const user = useSelector((state: AppState) => state.userReducer);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event?.data?.type === "fas-enflasyon-refresh") {
        setRetryKey((k) => k + 1);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const iframeSrc = useMemo(() => {
    if (!user || !user.kullaniciAdi) return "";

    const signature = generateSignature(
      user.kullaniciAdi || "",
      (user.denetciId || 0).toString(),
      (user.id || 0).toString(),
      (user.denetlenenId || 0).toString(),
      (user.yil || 0).toString()
    );

    const authParams = new URLSearchParams({
      username: user.kullaniciAdi || "",
      denetciId: (user.denetciId || 0).toString(),
      kullaniciId: (user.id || 0).toString(),
      denetlenenId: (user.denetlenenId || 0).toString(),
      yil: (user.yil || 0).toString(),
      signature,
    });

    const separator = url.includes("?") ? "&" : "?";
    return `${ENFLASYON_BASE_URL}${url}${separator}${authParams.toString()}`;
  }, [user, url, retryKey]);

  useEffect(() => {
    if (iframeSrc) {
      setIsLoading(true);
      setServerError(null);
    }
  }, [iframeSrc]);

  if (!user || !user.kullaniciAdi) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (serverError) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", gap: 2, p: 4 }}>
        <Alert severity="error" sx={{ width: "100%", maxWidth: 600 }}>
          <Typography variant="body1">{serverError}</Typography>
        </Alert>
        <Button variant="outlined" color="error" onClick={() => setRetryKey((k) => k + 1)}>
          Tekrar Dene
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", position: "relative", overflow: "hidden" }}>
      {isLoading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1,
            background: "transparent",
          }}
        >
          <CircularProgress />
        </Box>
      )}

      <iframe
        src={iframeSrc}
        style={{
          background: "transparent",
          border: "0px",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          display: "block",
        }}
        onLoad={() => {
          setIsLoading(false);
          setServerError(null);
        }}
        onError={() => {
          setIsLoading(false);
          setServerError("Enflasyon sayfasi yuklenemedi. Lütfen tekrar deneyin.");
        }}
      />
    </Box>
  );
};

export default EnflasyonIframe;
