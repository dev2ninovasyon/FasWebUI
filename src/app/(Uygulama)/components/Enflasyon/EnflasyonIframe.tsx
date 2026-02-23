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
    const [serverError, setServerError] = useState<string | null>(null);
    const [retryKey, setRetryKey] = useState(0);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const user = useSelector((state: AppState) => state.userReducer);

    useEffect(() => {
        if (!user || !user.kullaniciAdi) return;

        const loadPageWithJQuery = async () => {
            setServerError(null);
            setIsLoading(true);
            setIframeSrcDoc("");
            try {
                const signature = generateSignature(
                    user.kullaniciAdi || "",
                    (user.denetciId || 0).toString(),
                    (user.id || 0).toString(),
                    (user.denetlenenId || 0).toString(),
                    (user.yil || 0).toString()
                );

                const encodedSignature = encodeURIComponent(signature);
                const authParams = `username=${encodeURIComponent(user.kullaniciAdi || "")}&denetciId=${encodeURIComponent((user.denetciId || 0).toString())}&kullaniciId=${encodeURIComponent((user.id || 0).toString())}&denetlenenId=${encodeURIComponent((user.denetlenenId || 0).toString())}&yil=${encodeURIComponent((user.yil || 0).toString())}&signature=${encodedSignature}`;

                const separator = url.includes('?') ? '&' : '?';
                const fullUrl = `${ENFLASYON_BASE_URL}${url}${separator}${authParams}`;

                console.log("📥 [EnflasyonIframe] HTML fetch başlıyor:", fullUrl);

                // HTML'yi fetch et
                const response = await fetch(fullUrl, {
                    credentials: 'include',
                    method: 'GET',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                let html = await response.text();
                console.log("✅ [EnflasyonIframe] HTML alındı, optimizasyonlar yapılıyor...");

                // <base> tag'ini ekle
                const baseTag = `<base href="${ENFLASYON_BASE_URL}/">`;
                const authScript = `<script>
                    window.FasAuthParams = "?${authParams}";
                    try {
                        var originalPush = history.pushState;
                        var originalReplace = history.replaceState;
                        history.pushState = function() {
                            try { return originalPush.apply(history, arguments); } catch(e) { console.warn("prevented pushState error"); }
                        };
                        history.replaceState = function() {
                            try { return originalReplace.apply(history, arguments); } catch(e) { console.warn("prevented replaceState error"); }
                        };
                    } catch(e) {}
                </script>`;

                // Mevcut vendors.bundle.js'i bul ve başa taşı (jQuery içinde olduğu için)
                const vendorsRegex = /<script[^>]+vendors\.bundle\.js[^>]*><\/script>/i;
                const vendorsMatch = html.match(vendorsRegex);
                let injections = baseTag + "\n" + authScript;

                if (vendorsMatch) {
                    html = html.replace(vendorsMatch[0], ""); // Alttaki orijinali kaldır
                    injections += `\n${vendorsMatch[0]}`; // Başa ekle
                } else {
                    // Bulunamazsa (garanti olsun diye) CDN ekle
                    injections += `\n<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>`;
                }

                if (html.includes('<head')) {
                    html = html.replace(/<head[^>]*>/, `$&\n${injections}`);
                } else if (html.includes('</head>')) {
                    html = html.replace('</head>', `${injections}\n</head>`);
                } else {
                    html = `<head>${injections}</head>${html}`;
                }

                console.log("✅ [EnflasyonIframe] Scriptler optimize edildi");

                // srcdoc ile iFrame'e set et
                setIframeSrcDoc(html);
                setIsLoading(false);

            } catch (error: any) {
                console.error("❌ [EnflasyonIframe] Hata:", error);
                const msg: string = error?.message || "";
                const isConnectionError =
                    msg.includes("Failed to fetch") ||
                    msg.includes("NetworkError") ||
                    msg.includes("fetch failed") ||
                    msg.includes("Load failed");
                setServerError(
                    isConnectionError
                        ? "Enflasyon modülüne şu an ulaşılamıyor. Lütfen daha sonra tekrar deneyin."
                        : "Enflasyon modülü yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
                );
                setIsLoading(false);
            }
        };

        loadPageWithJQuery();
    }, [user?.kullaniciAdi, url, retryKey]);

    // User yüklenmemiş ise loading göster  
    if (!user || !user.kullaniciAdi) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (serverError) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 2, p: 4 }}>
                <Alert severity="error" sx={{ width: '100%', maxWidth: 600 }}>
                    <Typography variant="body1">{serverError}</Typography>
                </Alert>
                <Button variant="outlined" color="error" onClick={() => setRetryKey(k => k + 1)}>
                    Tekrar Dene
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ height: "100%", position: "relative", overflow: "hidden" }}>
            {isLoading && (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    width: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 1,
                    background: 'transparent'
                }}>
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
                        display: "block"
                    }}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                ></iframe>
            )}
        </Box>
    );
};

export default EnflasyonIframe;
