"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getKysBelge, KysBelgeVeri } from "@/api/Kys/KysBelge";
import { IconCheck, IconMinus } from "@tabler/icons-react";
import "@/app/(Uygulama)/components/Editor/lexical.css";

interface KysBelgeShowProps {
    formKodu: string;
}

const KysBelgeShow: React.FC<KysBelgeShowProps> = ({ formKodu }) => {
    const user = useSelector((state: AppState) => state.userReducer);
    const customizer = useSelector((state: AppState) => state.customizer);
    const [belgeVeri, setBelgeVeri] = useState<KysBelgeVeri | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!user.token || !user.denetciId || !user.denetlenenId || !user.yil) return;

        setLoading(true);
        const data = await getKysBelge(
            user.token,
            formKodu,
            user.denetciId,
            user.denetlenenId,
            user.yil
        );
        setBelgeVeri(data);
        setLoading(false);
    }, [user.token, user.denetciId, user.denetlenenId, user.yil, formKodu]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (!belgeVeri) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="textSecondary">Belge yüklenemedi.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: "100%" }}>
            {belgeVeri.icerik && (
                <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid #e0e0e0", borderRadius: 1, bgcolor: "background.paper" }}>
                    <Box
                        className="lexical-editor-container"
                        data-mode={customizer.activeMode === "dark" ? "dark" : "light"}
                        sx={{ border: "none !important" }}
                    >
                        <div
                            className="lexical-editor-input"
                            dangerouslySetInnerHTML={{ __html: belgeVeri.icerik }}
                        />
                    </Box>
                </Paper>
            )}

            <Typography variant="h6" mb={1} sx={{ fontWeight: 600 }}>
                Kontrol Listesi / Kayıtlar
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                <Table size="small">
                    <TableHead sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#333' : '#f5f5f5' }}>
                        <TableRow>
                            <TableCell width="50px" sx={{ fontWeight: 600 }}>Durum</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Açıklama</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {belgeVeri.kontrolListesi.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell align="center">
                                    {item.checked ? (
                                        <IconCheck size={20} color="green" />
                                    ) : (
                                        <IconMinus size={20} color="gray" />
                                    )}
                                </TableCell>
                                <TableCell>{item.label}</TableCell>
                            </TableRow>
                        ))}
                        {belgeVeri.kontrolListesi.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={2} align="center">
                                    <Typography variant="body2" color="textSecondary">Kayıt bulunamadı.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default KysBelgeShow;
