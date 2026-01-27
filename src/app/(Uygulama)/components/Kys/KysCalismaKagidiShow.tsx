"use client";
import React, { useEffect, useState } from "react";
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    CircularProgress,
} from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import { getKysBelgeler } from "@/api/Kys/KysBelgelerApi";

interface Veri {
    id: number;
    islem: string;
    tespit: string;
    formKodu: string;
}

interface KysCalismaKagidiShowProps {
    formKodu: string;
    alanAdi: string;
}

const KysCalismaKagidiShow: React.FC<KysCalismaKagidiShowProps> = ({
    formKodu,
    alanAdi,
}) => {
    const user = useSelector((state: AppState) => state.userReducer);
    const [veriler, setVeriler] = useState<Veri[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await getKysBelgeler(
                user.token || "",
                formKodu,
                user.denetlenenId || 0,
                user.yil || 0
            );
            setVeriler(result);
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

    if (veriler.length === 0) {
        return (
            <Box p={2}>
                <Typography variant="body2" color="textSecondary">
                    Kaydedilmiş veri bulunamadı.
                </Typography>
            </Box>
        );
    }

    return (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
            <Table size="small">
                <TableHead sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#333' : '#f5f5f5' }}>
                    <TableRow>
                        <TableCell width="50px" sx={{ fontWeight: 600 }}>No</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>İşlem / Soru</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Tespit / Açıklama</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {veriler.map((row, index) => (
                        <TableRow key={row.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{row.islem}</TableCell>
                            <TableCell>{row.tespit}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default KysCalismaKagidiShow;
