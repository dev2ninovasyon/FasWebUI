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

export default function Maintenance() {
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));
  const user = useSelector((state: AppState) => state.userReducer);
  const [isCheckingHealth, setIsCheckingHealth] = useState(true);
  const [isApiReachable, setIsApiReachable] = useState(false);
  const [hasTokenIssue, setHasTokenIssue] = useState(true);
  const isFasAdmin =
    user?.yetki === "FasAdmin" || user?.rol?.includes("FasAdmin") || false;
  const canGoHome = isApiReachable && !hasTokenIssue;

  const checkStatus = async () => {
    if (typeof window === "undefined") return;

    setIsCheckingHealth(true);

    const { accessToken, refreshToken } = readStoredAuthTokens();
    setHasTokenIssue(!accessToken && !refreshToken && !user?.token);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 6000);

    try {
      const healthResponse = await fetch(
        url.endsWith("/") ? url.slice(0, -1) : url,
        {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        }
      );
      setIsApiReachable(healthResponse.status > 0);
    } catch {
      setIsApiReachable(false);
    } finally {
      window.clearTimeout(timeoutId);
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [user?.token]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      textAlign="center"
      justifyContent="center"
      alignItems="center"
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
        {!isCheckingHealth && canGoHome && (
          <Button
            color="primary"
            variant="contained"
            component={Link}
            href="/Anasayfa"
            disableElevation
          >
            Anasayfaya Don
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
        {!isCheckingHealth && !canGoHome && (
          <Button variant="outlined" color="warning" onClick={checkStatus}>
            Yeniden Kontrol Et
          </Button>
        )}
      </Stack>
      {!isCheckingHealth && !canGoHome && (
        <Typography align="center" variant="body2" mt={2} color="warning.main">
          API ulasilabilir degil veya oturum token bilgisi bulunamadi.
        </Typography>
      )}
    </Box>
  );
}
