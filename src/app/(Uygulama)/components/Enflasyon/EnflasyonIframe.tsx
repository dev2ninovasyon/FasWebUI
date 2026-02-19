"use client";

import React, { useState } from "react";
import { CircularProgress, Box } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { ENFLASYON_BASE_URL } from "@/config/enflasyonConfig";
import { generateSignature } from "@/utils/crypto";

interface Props {
    url: string;
}

const EnflasyonIframe: React.FC<Props> = ({ url }) => {
    const [isLoading, setIsLoading] = useState(true);
    const user = useSelector((state: AppState) => state.userReducer);

    if (!user || !user.kullaniciAdi) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

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
    const src = `${ENFLASYON_BASE_URL}${url}${separator}${authParams}`;

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
            <iframe
                onLoad={() => setIsLoading(false)}
                src={src}
                style={{
                    background: "transparent",
                    border: "0px",
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                    display: "block"
                }}
            ></iframe>
        </Box>
    );
};

export default EnflasyonIframe;
