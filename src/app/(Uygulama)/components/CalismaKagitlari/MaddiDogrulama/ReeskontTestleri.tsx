"use client";

import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Grid,
} from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getReeskontTestleri, ReeskontTestleriData } from "@/api/CalismaKagitlari/ReeskontTestleri";

interface Props {
    dipnotNo: string;
    modelAdi: string;
}

const ReeskontTestleri: React.FC<Props> = ({ dipnotNo, modelAdi }) => {
    const [data, setData] = useState<ReeskontTestleriData | null>(null);
    const [loading, setLoading] = useState(true);

    const user = useSelector((state: AppState) => state.userReducer);

    useEffect(() => {
        const fetchData = async () => {
            if (user.token && user.denetciId !== undefined && user.yil !== undefined && user.denetlenenId !== undefined) {
                try {
                    const result = await getReeskontTestleri(
                        "ReeskontTestleri",
                        user.token,
                        user.denetciId,
                        user.yil,
                        user.denetlenenId,
                        dipnotNo,
                        modelAdi
                    );
                    if (result) {
                        setData(result);
                    }
                } catch (error) {
                    console.error("Hata:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchData();
    }, [user, dipnotNo, modelAdi]);

    const fmt = (n: any) =>
        Number(n ?? 0).toLocaleString("tr-TR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const currencies = ["TL", "USD", "EUR", "GBP"];

    const mergedRows = currencies.map((curr) => {
        const readyRow = (data?.degerlerKayitlari || []).find(
            (item) => (item.paraBirimi || "").trim().toUpperCase() === curr
        );

        return {
            paraBirimi: curr,
            alinanNominal: Number(readyRow?.alinanNominalDeger || 0),
            alinanIcIskonto: Number(readyRow?.alinanIcIskonto || 0),
            alinanNetBugunku: Number(readyRow?.alinanNetBugunkuDeger || 0),
            verilenNominal: Number(readyRow?.verilenNominalDeger || 0),
            verilenIcIskonto: Number(readyRow?.verilenIcIskonto || 0),
            verilenNetBugunku: Number(readyRow?.verilenNetBugunkuDeger || 0),
        };
    });

    const totalRow = {
        paraBirimi: "Toplam",
        alinanNominal: mergedRows.reduce((s, r) => s + r.alinanNominal, 0),
        verilenNominal: mergedRows.reduce((s, r) => s + r.verilenNominal, 0),
        alinanIcIskonto: mergedRows.reduce((s, r) => s + r.alinanIcIskonto, 0),
        verilenIcIskonto: mergedRows.reduce((s, r) => s + r.verilenIcIskonto, 0),
        alinanNetBugunku: mergedRows.reduce((s, r) => s + r.alinanNetBugunku, 0),
        verilenNetBugunku: mergedRows.reduce((s, r) => s + r.verilenNetBugunku, 0),
    };

    const tableHeaderStyle = {
        backgroundColor: "#2196f3",
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        border: "1px solid #e0e0e0",
        verticalAlign: "middle"
    };

    const tableCellStyle = {
        textAlign: "right",
        border: "1px solid #e0e0e0",
    };

    const firstColStyle = {
        textAlign: "left",
        fontWeight: "bold",
        border: "1px solid #e0e0e0",
        backgroundColor: "#f9f9f9"
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                {data?.dipnotAdi || modelAdi} - Reeskont Testleri
            </Typography>

            {loading && <Typography sx={{ mb: 2 }}>Veriler yükleniyor...</Typography>}

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="h6" align="center" sx={{ mb: 1, fontWeight: "bold" }}>
                        Reeskont Hesaplama
                    </Typography>
                    <TableContainer component={Paper} elevation={0}>
                        <Table size="small" sx={{ border: "1px solid #e0e0e0" }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell rowSpan={2} sx={tableHeaderStyle}>Para Birimi</TableCell>
                                    <TableCell colSpan={2} sx={tableHeaderStyle}>Nominal Değer</TableCell>
                                    <TableCell colSpan={2} sx={tableHeaderStyle}>İç İskonto Reeskont Tutarı</TableCell>
                                    <TableCell colSpan={2} sx={tableHeaderStyle}>Net Bugünkü Değer Reeskont Tutarı</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={tableHeaderStyle}>Alınan</TableCell>
                                    <TableCell sx={tableHeaderStyle}>Verilen</TableCell>
                                    <TableCell sx={tableHeaderStyle}>Alınan</TableCell>
                                    <TableCell sx={tableHeaderStyle}>Verilen</TableCell>
                                    <TableCell sx={tableHeaderStyle}>Alınan</TableCell>
                                    <TableCell sx={tableHeaderStyle}>Verilen</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {mergedRows.map((row, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell sx={firstColStyle}>{row.paraBirimi}</TableCell>
                                        <TableCell sx={tableCellStyle}>{fmt(row.alinanNominal)}</TableCell>
                                        <TableCell sx={tableCellStyle}>{fmt(row.verilenNominal)}</TableCell>
                                        <TableCell sx={tableCellStyle}>{fmt(row.alinanIcIskonto)}</TableCell>
                                        <TableCell sx={tableCellStyle}>{fmt(row.verilenIcIskonto)}</TableCell>
                                        <TableCell sx={tableCellStyle}>{fmt(row.alinanNetBugunku)}</TableCell>
                                        <TableCell sx={tableCellStyle}>{fmt(row.verilenNetBugunku)}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                    <TableCell sx={firstColStyle}>{totalRow.paraBirimi}</TableCell>
                                    <TableCell sx={{ ...tableCellStyle, fontWeight: "bold" }}>{fmt(totalRow.alinanNominal)}</TableCell>
                                    <TableCell sx={{ ...tableCellStyle, fontWeight: "bold" }}>{fmt(totalRow.verilenNominal)}</TableCell>
                                    <TableCell sx={{ ...tableCellStyle, fontWeight: "bold" }}>{fmt(totalRow.alinanIcIskonto)}</TableCell>
                                    <TableCell sx={{ ...tableCellStyle, fontWeight: "bold" }}>{fmt(totalRow.verilenIcIskonto)}</TableCell>
                                    <TableCell sx={{ ...tableCellStyle, fontWeight: "bold" }}>{fmt(totalRow.alinanNetBugunku)}</TableCell>
                                    <TableCell sx={{ ...tableCellStyle, fontWeight: "bold" }}>{fmt(totalRow.verilenNetBugunku)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="h6" align="center" sx={{ mb: 1, mt: 2, fontWeight: "bold" }}>
                        Reeskont Düzeltme Farkları
                    </Typography>
                    <TableContainer component={Paper} elevation={0}>
                        <Table size="small" sx={{ border: "1px solid #e0e0e0" }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell rowSpan={2} sx={tableHeaderStyle}>Düzeltme Farkları</TableCell>
                                    <TableCell rowSpan={2} sx={tableHeaderStyle}>Ayrılan Reeskont (VUK)</TableCell>
                                    <TableCell colSpan={2} sx={tableHeaderStyle}>BOBİ Hesaplanan</TableCell>
                                    <TableCell colSpan={2} sx={tableHeaderStyle}>BOBİ Fark</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={tableHeaderStyle}>İç iskonto</TableCell>
                                    <TableCell sx={tableHeaderStyle}>Net Bugünkü değer</TableCell>
                                    <TableCell sx={tableHeaderStyle}>İç iskonto</TableCell>
                                    <TableCell sx={tableHeaderStyle}>Net Bugünkü değer</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(data?.farklarKayitlari || []).map((row, index) => {
                                    const isTotal = row.duzeltmeFarklari === "Toplam";
                                    return (
                                        <TableRow key={index} sx={isTotal ? { backgroundColor: "#f5f5f5" } : {}}>
                                            <TableCell sx={{
                                                ...tableCellStyle,
                                                textAlign: "left",
                                                fontWeight: "bold",
                                                backgroundColor: isTotal ? "transparent" : "#f9f9f9"
                                            }}>
                                                {row.duzeltmeFarklari}
                                            </TableCell>
                                            <TableCell sx={{ ...tableCellStyle, fontWeight: isTotal ? "bold" : "normal" }}>{fmt(row.ayrilanVuk)}</TableCell>
                                            <TableCell sx={{ ...tableCellStyle, fontWeight: isTotal ? "bold" : "normal" }}>{fmt(row.hesaplananIcIskonto)}</TableCell>
                                            <TableCell sx={{ ...tableCellStyle, fontWeight: isTotal ? "bold" : "normal" }}>{fmt(row.hesaplananNetBugunkuDeger)}</TableCell>
                                            <TableCell sx={{ ...tableCellStyle, fontWeight: isTotal ? "bold" : "normal" }}>{fmt(row.farkIcIskonto)}</TableCell>
                                            <TableCell sx={{ ...tableCellStyle, fontWeight: isTotal ? "bold" : "normal" }}>{fmt(row.farkNetBugunkuDeger)}</TableCell>
                                        </TableRow>
                                    );
                                })}
                                {(!data || data.farklarKayitlari?.length === 0) && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={6} sx={tableCellStyle}>Kayıt bulunamadı.</TableCell>
                                    </TableRow>
                                )}

                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="h6" align="center" sx={{ mb: 1, mt: 2, fontWeight: "bold" }}>
                        Reeskont Hesaplamada Kullanılan Değerler
                    </Typography>
                    <TableContainer component={Paper} elevation={0}>
                        <Table size="small" sx={{ border: "1px solid #e0e0e0" }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={tableHeaderStyle}>Vadeye Kalan Gün</TableCell>
                                    <TableCell sx={tableHeaderStyle}>USD LIBOR</TableCell>
                                    <TableCell sx={tableHeaderStyle}>USD Kur</TableCell>
                                    <TableCell sx={tableHeaderStyle}>EURO LIBOR</TableCell>
                                    <TableCell sx={tableHeaderStyle}>EURO Kur</TableCell>
                                    <TableCell sx={tableHeaderStyle}>GBP LIBOR</TableCell>
                                    <TableCell sx={tableHeaderStyle}>GBP Kur</TableCell>
                                    <TableCell sx={tableHeaderStyle}>TL REESKONT ORANI</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(data?.referansTablosuListesi || []).map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell sx={{ ...tableCellStyle, fontWeight: "bold", textAlign: "center" }}>{row.vadeyeKalanGun}</TableCell>
                                        <TableCell sx={tableCellStyle}>{fmt(row.usdLibor)}</TableCell>
                                        <TableCell sx={tableCellStyle}>{fmt(row.usdKur)}</TableCell>
                                        <TableCell sx={tableCellStyle}>{fmt(row.eurLibor)}</TableCell>
                                        <TableCell sx={tableCellStyle}>{fmt(row.eurKur)}</TableCell>
                                        <TableCell sx={tableCellStyle}>{fmt(row.gbpLibor)}</TableCell>
                                        <TableCell sx={tableCellStyle}>{fmt(row.gbpdKur)}</TableCell>
                                        <TableCell sx={tableCellStyle}>{fmt(row.tcmb)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ReeskontTestleri;