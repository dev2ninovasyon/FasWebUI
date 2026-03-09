"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { url } from "@/api/apiBase";
import { readStoredAuthTokens } from "@/utils/authSession";
import { LOGOUT_REASON_KEY } from "@/utils/sessionConfig";

export default function Maintenance() {
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));
  const user = useSelector((state: AppState) => state.userReducer);
  const [isCheckingHealth, setIsCheckingHealth] = useState(true);
  const [isApiReachable, setIsApiReachable] = useState(false);
  const [hasTokenIssue, setHasTokenIssue] = useState(true);
  const isFasAdmin =
    user?.yetki === "FasAdmin" || user?.rol?.includes("FasAdmin") || false;

  useEffect(() => {
    // Bakım sayfasındayken eski logout nedenlerini temizle ki 
    // giriş ekranına gidince "oturrumunuz sonlandırıldı" uyarısı çıkmasın.
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(LOGOUT_REASON_KEY);
    }
  }, []);
  const canGoHome = isApiReachable && !hasTokenIssue;

  const checkStatus = async () => {
    if (typeof window === "undefined") return;

    setIsCheckingHealth(true);

    const { accessToken, refreshToken } = readStoredAuthTokens();
    setHasTokenIssue(!accessToken && !refreshToken && !user?.token);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 6000);

    try {
      const safeUrl = url || "http://localhost:5000/api";
      const baseUrl = safeUrl.endsWith("/") ? safeUrl.slice(0, -1) : safeUrl;
      const fetchUrl = `${baseUrl}/Health`;
      const healthResponse = await fetch(
        fetchUrl,
        {
          method: "GET",
          signal: controller.signal,
        }
      );
      setIsApiReachable(healthResponse.ok);
    } catch (err) {
      console.error("Health check error:", err);
      setIsApiReachable(false);
    } finally {
      window.clearTimeout(timeoutId);
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleLoginClick = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(LOGOUT_REASON_KEY);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      textAlign="center"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5",
      }}
    >
      <Image
        priority
        src={"/images/backgrounds/maintenance2.svg"}
        alt="404"
        width={500}
        height={300}
        style={{
          marginTop: "8%",
          width: smDown ? "100%" : "auto",
          height: smDown ? "auto" : "100%",
          maxHeight: "500px",
        }}
      />
      <Typography align="center" variant="h1" mb={4}>
        Bakim Modu!!!
      </Typography>
      <Typography align="center" variant="h4" mb={4}>
        Web Sitesi Bakim Asamasindadir.
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        {!isCheckingHealth && isApiReachable && (
          <Button
            color="primary"
            variant="contained"
            component={Link}
            href={hasTokenIssue ? "/" : "/Anasayfa"}
            onClick={handleLoginClick}
            disableElevation
          >
            {hasTokenIssue ? "Giriş Ekranına Git" : "Anasayfaya Dön"}
          </Button>
        )}
        {isCheckingHealth && (
          <Button variant="outlined" disabled>
            <CircularProgress size={16} sx={{ mr: 1 }} />
            Durum Kontrol Ediliyor
          </Button>
        )}
        {isFasAdmin && (
          <Button
            color="secondary"
            variant="outlined"
            component={Link}
            href="/DigerIslemler/SistemLoglari"
            disableElevation
          >
            Log Ekranini Ac
          </Button>
        )}
        {!isCheckingHealth && !isApiReachable && (
          <Button variant="outlined" color="warning" onClick={checkStatus}>
            Yeniden Kontrol Et
          </Button>
        )}
      </Stack>
      {!isCheckingHealth && !isApiReachable && (
        <Typography align="center" variant="body2" mt={2} color="error.main">
          Sisteme şu an ulaşılamıyor. Lütfen daha sonra tekrar deneyin.
        </Typography>
      )}
      {!isCheckingHealth && isApiReachable && hasTokenIssue && (
        <Typography align="center" variant="body2" mt={2} color="info.main">
          Sistem aktif. Giriş yaparak devam edebilirsiniz.
        </Typography>
      )}
    </Box>
  );
}
