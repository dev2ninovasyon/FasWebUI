"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Box, Checkbox, FormControlLabel, FormGroup, Typography, Paper, CircularProgress } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import dynamic from "next/dynamic";
import { getKysBelge, updateKysBelgeChecklist, KysBelgeVeri, ChecklistItem } from "@/api/Kys/KysBelge";
import "@/app/(Uygulama)/components/Editor/lexical.css";

const CustomEditorWVeri = dynamic(
    () => import("@/app/(Uygulama)/components/Editor/CustomEditorWVeri"),
    { ssr: false }
);

interface KysBelgeEditorProps {
    formKodu: string;
    baslik?: string;
    readOnly?: boolean;
}

const KysBelgeEditor: React.FC<KysBelgeEditorProps> = ({ formKodu, baslik, readOnly = false }) => {
    const user = useSelector((state: AppState) => state.userReducer);
    const customizer = useSelector((state: AppState) => state.customizer);
    const [belgeVeri, setBelgeVeri] = useState<KysBelgeVeri | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!user.token || !user.denetciId || !user.denetlenenId || !user.yil) return;

        setLoading(true);
        const data = await getKysBelge(
            formKodu,
            user.denetciId,
            user.denetlenenId,
            user.yil
        );
        setBelgeVeri(data);
        setLoading(false);
    }, [user.denetciId, user.denetlenenId, user.yil, formKodu]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleChecklistChange = async (index: number, checked: boolean) => {
        if (!belgeVeri) return;

        const newList = [...belgeVeri.kontrolListesi];
        newList[index] = { ...newList[index], checked };

        setBelgeVeri({ ...belgeVeri, kontrolListesi: newList });

        await updateKysBelgeChecklist(belgeVeri.id, newList);
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!belgeVeri) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">Belge yüklenemedi.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: "100%", p: 2 }}>
            {baslik && (
                <Typography variant="h4" mb={2} textAlign="center">
                    {baslik}
                </Typography>
            )}

            {readOnly ? (
                <Box
                    className="lexical-editor-container"
                    data-mode={customizer.activeMode === "dark" ? "dark" : "light"}
                    sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 1, bgcolor: "background.paper" }}
                >
                    <div
                        className="lexical-editor-input"
                        dangerouslySetInnerHTML={{ __html: belgeVeri.icerik }}
                    />
                </Box>
            ) : (
                <CustomEditorWVeri
                    controller="KysBelge"
                    veri={{ id: belgeVeri.id, metin: belgeVeri.icerik }}
                />
            )}

            <Paper sx={{ mt: 3, p: 3, border: "1px solid #e0e0e0" }} elevation={0}>
                <Typography variant="h6" mb={2} sx={{ fontWeight: 600 }}>
                    Kontrol Listesi / Kayıtlar:
                </Typography>
                <FormGroup row sx={{ gap: 2 }}>
                    {belgeVeri.kontrolListesi.map((item, index) => (
                        <FormControlLabel
                            key={index}
                            control={
                                <Checkbox
                                    checked={item.checked}
                                    onChange={(e) => handleChecklistChange(index, e.target.checked)}
                                    disabled={readOnly}
                                />
                            }
                            label={item.label}
                            sx={{
                                mr: 3,
                                '& .MuiFormControlLabel-label': {
                                    fontSize: '0.95rem'
                                }
                            }}
                        />
                    ))}
                </FormGroup>
            </Paper>
        </Box>
    );
};

export default KysBelgeEditor;

