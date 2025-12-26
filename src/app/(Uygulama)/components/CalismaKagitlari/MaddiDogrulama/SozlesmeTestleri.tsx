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
    TextField,
    Snackbar,
    Alert,
    Grid
} from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    getSozlesmeTestleri,
    updateSozlesmeTestleri,
    SozlesmeTestleriData,
    varsayilanaDon
} from "@/api/CalismaKagitlari/SozlesmeTestleri";

interface Props {
    dipnotNo: string;
    modelAdi: string
    isClickedVarsayilanaDon: boolean;
    setIsClickedVarsayilanaDon: (deger: boolean) => void;
}

const SozlesmeTestleri: React.FC<Props> = ({ dipnotNo, modelAdi, isClickedVarsayilanaDon, setIsClickedVarsayilanaDon }) => {
    const [veriler, setVeriler] = useState<SozlesmeTestleriData[]>([]);
    const [loading, setLoading] = useState(true);
    const user = useSelector((state: AppState) => state.userReducer);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error",
    });

    const fetchData = async () => {
        if (user.token && user.denetciId && user.yil && user.denetlenenId) {
            setLoading(true);
            try {
                const result = await getSozlesmeTestleri(user.token, user.denetciId, user.yil, user.denetlenenId, dipnotNo);
                setVeriler(result || []);
            } catch (error) {
                showSnackbar("Veriler yüklenirken bir hata oluştu.", "error");
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, [user.denetciId, user.yil, user.denetlenenId, dipnotNo]);

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleInputChange = async (id: number, value: string) => {
        let cleanValue = value.replace(/\./g, "").replace(",", ".");
        const numericValue = parseFloat(cleanValue) || 0;

        const currentItem = veriler.find(v => v.id === id);
        if (!currentItem) return;

        // Sadece değer değiştiyse işlem yap
        if (currentItem.sozlesmedekiBakiye === numericValue) return;

        const updatedItem = {
            ...currentItem,
            sozlesmedekiBakiye: numericValue,
            fark: (currentItem.mizanBakiye || 0) - numericValue
        };

        // Optimistic update (Arayüzü hemen güncelle)
        setVeriler((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));

        if (user.token) {
            try {
                await updateSozlesmeTestleri(user.token, id, updatedItem);
                // Başarılı kayıtta kullanıcıyı rahatsız etme (Sessiz kaydet)
            } catch (error) {
                showSnackbar("Kaydetme sırasında bir hata oluştu.", "error");
            }
        }
    };

    const fmt = (n: any) =>
        Number(n ?? 0).toLocaleString("tr-TR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    // Stil Tanımlamaları
    const tableHeaderStyle = {
        backgroundColor: "#2196f3",
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        border: "1px solid #e0e0e0",
        fontSize: "0.85rem",
        padding: "10px 5px",
        whiteSpace: "nowrap"
    };

    const tableCellStyle = {
        textAlign: "right",
        border: "1px solid #e0e0e0",
        fontSize: "0.85rem",
        padding: "8px"
    };

    const firstColStyle = {
        textAlign: "center",
        fontWeight: "bold",
        border: "1px solid #e0e0e0",
        backgroundColor: "#f5f5f5",
        fontSize: "0.85rem",
        width: "80px"
    };

    const handleReset = async () => {
        if (user.token && user.denetciId && user.yil && user.denetlenenId) {
            setLoading(true);
            try {
                await varsayilanaDon(user.token, user.denetciId, user.yil, user.denetlenenId, dipnotNo);
                showSnackbar("Veriler varsayılana döndürüldü.", "success");
                await fetchData();
            } catch (error) {
                showSnackbar("İşlem sırasında bir hata oluştu.", "error");
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (isClickedVarsayilanaDon) {
            handleReset();
            setIsClickedVarsayilanaDon(false);
        }
    }, [isClickedVarsayilanaDon]);

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: "600", color: "#333" }}>
                    Sözleşme Testleri
                </Typography>
            </Box>

            <Grid container>
                <Grid item xs={12}>
                    <TableContainer component={Paper} elevation={3} sx={{ borderRadius: "8px", overflow: "hidden" }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={tableHeaderStyle}>Hesap No</TableCell>
                                    <TableCell sx={{ ...tableHeaderStyle, textAlign: "left" }}>Hesap Açıklaması</TableCell>
                                    <TableCell sx={tableHeaderStyle}>Mizan Bakiye</TableCell>
                                    <TableCell sx={tableHeaderStyle}>Sözleşmedeki Bakiye</TableCell>
                                    <TableCell sx={tableHeaderStyle}>Fark</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {veriler.map((row) => (
                                    <TableRow key={row.id} hover>
                                        {/* Hesap No */}
                                        <TableCell sx={firstColStyle}>
                                            {row.detayKodu}
                                        </TableCell>

                                        {/* Hesap Açıklaması */}
                                        <TableCell sx={{ ...tableCellStyle, textAlign: "left", fontWeight: "500", minWidth: "250px" }}>
                                            {row.detayHesapAdi || row.hesapAdi}
                                        </TableCell>

                                        {/* Mizan Bakiye */}
                                        <TableCell sx={tableCellStyle}>
                                            {fmt(row.mizanBakiye)}
                                        </TableCell>

                                        {/* Sözleşmedeki Bakiye (Input) */}
                                        <TableCell sx={{ ...tableCellStyle, p: 0.5, textAlign: "center" }}>
                                            <TextField
                                                size="small"
                                                type="text"
                                                defaultValue={row.sozlesmedekiBakiye}
                                                onBlur={(e) => handleInputChange(row.id, e.target.value)}
                                                inputProps={{ step: "0.01" }}
                                                variant="outlined"
                                                sx={{
                                                    width: "140px",
                                                    "& .MuiOutlinedInput-input": {
                                                        textAlign: "right",
                                                        padding: "6px 10px",
                                                        fontSize: "0.85rem",
                                                        backgroundColor: "white",
                                                        "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
                                                            "-webkit-appearance": "none",
                                                            margin: 0,
                                                        },
                                                        "&[type=number]": {
                                                            "-moz-appearance": "textfield",
                                                        }
                                                    },
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: "4px"
                                                    }
                                                }}
                                            />
                                        </TableCell>

                                        {/* Fark */}
                                        <TableCell sx={{ ...tableCellStyle, fontWeight: "bold", color: row.fark !== 0 ? "#d32f2f" : "inherit" }}>
                                            {fmt(row.fark)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {veriler.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ textAlign: "center", py: 4, color: "#999" }}>
                                            Gösterilecek kayıt bulunamadı.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: "8px" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SozlesmeTestleri;