"use client";

import React, { useState, useRef, useEffect } from "react";
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
  const [iframeSrcDoc, setIframeSrcDoc] = useState<string>("");
  const [iframeDirectSrc, setIframeDirectSrc] = useState<string>("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
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

  useEffect(() => {
    if (!user || !user.kullaniciAdi) return;

    const buildAuthUrl = () => {
      const signature = generateSignature(
        user.kullaniciAdi || "",
        (user.denetciId || 0).toString(),
        (user.id || 0).toString(),
        (user.denetlenenId || 0).toString(),
        (user.yil || 0).toString()
      );

      const encodedSignature = encodeURIComponent(signature);
      const authParams = `username=${encodeURIComponent(user.kullaniciAdi || "")}&denetciId=${encodeURIComponent((user.denetciId || 0).toString())}&kullaniciId=${encodeURIComponent((user.id || 0).toString())}&denetlenenId=${encodeURIComponent((user.denetlenenId || 0).toString())}&yil=${encodeURIComponent((user.yil || 0).toString())}&signature=${encodedSignature}`;

      const separator = url.includes("?") ? "&" : "?";
      return {
        fullUrl: `${ENFLASYON_BASE_URL}${url}${separator}${authParams}`,
        authParams,
      };
    };

    const loadPageWithJQuery = async () => {
      setServerError(null);
      setIsLoading(true);
      setIframeSrcDoc("");
      setIframeDirectSrc("");

      const { fullUrl, authParams } = buildAuthUrl();
      try {
        const response = await fetch(fullUrl, {
          credentials: "include",
          method: "GET",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        let html = await response.text();

        const baseTag = `<base href="${ENFLASYON_BASE_URL}/">`;
        const authScript = `<script>
window.FasAuthParams = "?${authParams}";
try {
  var originalPush = history.pushState;
  var originalReplace = history.replaceState;
  history.pushState = function() {
    try { return originalPush.apply(history, arguments); } catch(e) {}
  };
  history.replaceState = function() {
    try { return originalReplace.apply(history, arguments); } catch(e) {}
  };
} catch(e) {}
</script>`;

        const vendorsRegex = /<script[^>]+vendors\.bundle\.js[^>]*><\/script>/i;
        const vendorsMatch = html.match(vendorsRegex);
        let injections = `${baseTag}\n${authScript}`;

        if (vendorsMatch) {
          html = html.replace(vendorsMatch[0], "");
          injections += `\n${vendorsMatch[0]}`;
        } else {
          injections += "\n<script src=\"https://code.jquery.com/jquery-3.6.0.min.js\"></script>";
        }

        if (html.includes("<head")) {
          html = html.replace(/<head[^>]*>/, `$&\n${injections}`);
        } else if (html.includes("</head>")) {
          html = html.replace("</head>", `${injections}\n</head>`);
        } else {
          html = `<head>${injections}</head>${html}`;
        }

        setIframeSrcDoc(html);
      } catch (error: any) {
        // Fallback: srcdoc fetch başarısızsa doğrudan iframe src ile aç.
        setIframeDirectSrc(fullUrl);

        const msg: string = error?.message || "";
        const isConnectionError =
          msg.includes("Failed to fetch") ||
          msg.includes("NetworkError") ||
          msg.includes("fetch failed") ||
          msg.includes("Load failed");

        setServerError(
          isConnectionError
            ? "On yukleme basarisiz oldu. Sayfa dogrudan acilmaya calisiliyor."
            : null
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPageWithJQuery();
  }, [user?.kullaniciAdi, user?.denetciId, user?.id, user?.denetlenenId, user?.yil, url, retryKey]);

  if (!user || !user.kullaniciAdi) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (serverError && !iframeDirectSrc) {
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

      {iframeSrcDoc && (
        <iframe
          ref={iframeRef}
          srcDoc={iframeSrcDoc}
          style={{
            background: "transparent",
            border: "0px",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            display: "block",
          }}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      )}

      {!iframeSrcDoc && iframeDirectSrc && (
        <iframe
          ref={iframeRef}
          src={iframeDirectSrc}
          style={{
            background: "transparent",
            border: "0px",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            display: "block",
          }}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          onLoad={() => setServerError(null)}
        />
      )}
    </Box>
  );
};

export default EnflasyonIframe;
