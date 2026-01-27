"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Paper } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getKysBelgelerEditorText } from "@/api/Kys/KysBelgelerEditorApi";
import "@/app/(Uygulama)/components/Editor/custom.css";

interface KysEditorShowProps {
    formKodu: string;
    alanAdi?: string;
}

const KysEditorShow: React.FC<KysEditorShowProps> = ({ formKodu, alanAdi }) => {
    const user = useSelector((state: AppState) => state.userReducer);
    const customizer = useSelector((state: AppState) => state.customizer);
    const [editorData, setEditorData] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStyles = async () => {
            if (customizer.activeMode === "dark") {
                await import("@/app/(Uygulama)/components/Editor/custom.css");
            } else {
                await import("@/app/(Uygulama)/components/Editor/light.css");
            }
        };
        loadStyles();
    }, [customizer.activeMode]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await getKysBelgelerEditorText(
                user.token || "",
                formKodu,
                user.denetlenenId || 0,
                user.yil || 0
            );

            if (Array.isArray(result) && result.length > 0) {
                setEditorData(result[0].metin || "");
            } else if (result && result.metin) {
                setEditorData(result.metin);
            }
        } catch (error) {
            console.error("Veri getirme hatası:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [formKodu]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    return (
        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 1, bgcolor: "background.paper" }}>
            <div className="ck-content" dangerouslySetInnerHTML={{ __html: editorData }} />
            {!editorData && (
                <Typography variant="body2" color="textSecondary">
                    İçerik bulunamadı.
                </Typography>
            )}
        </Paper>
    );
};

export default KysEditorShow;
