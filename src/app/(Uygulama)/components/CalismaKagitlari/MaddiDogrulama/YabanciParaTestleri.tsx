import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Grid,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Snackbar,
    Alert,
    TextField,
    Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { IconDeviceFloppy, IconPencil } from "@tabler/icons-react";

import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import { getYabanciParaTestleriByDenetlenen, updateYabanciParaTestleriRow, YabanciParaTestleriRow } from "@/api/CalismaKagitlari/YabanciParaTestleri";


interface CalismaKagidiProps {
    controller: string;
    dipnotAdi: string;
    dipnotNo: string;
    modelAdi: string;
    setDip: (str: string) => void;
}

const fmt = (n: any) =>
    Number(n ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function normalizeString(str: string): string {
    const turkishChars: { [key: string]: string } = {
        ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
        Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u",
    };
    let normalized = (str ?? "").replace(/[çğıöşüÇĞÖŞÜıİ]/g, (m) => turkishChars[m] || m);
    normalized = normalized.replace(/\s+/g, "");
    return normalized.toLowerCase();
}

const YabanciParaTestleri: React.FC<CalismaKagidiProps> = ({
    controller,
    dipnotAdi,
    dipnotNo,
    modelAdi,
    setDip,
}) => {
    const theme = useTheme();
    const user = useSelector((state: AppState) => state.userReducer);

    // Colors from reference image approx
    const HEADER_GRAY = theme.palette.mode === 'dark' ? theme.palette.grey[800] : "#F1F2F4";
    const ZEBRA_ROW = theme.palette.mode === 'dark' ? theme.palette.action.hover : "#F9FAFB";
    const BG_PAPER = theme.palette.background.paper;

    const [veriler, setVeriler] = useState<YabanciParaTestleriRow[]>([]);
    const [savingRowId, setSavingRowId] = useState<number | null>(null);

    // Local state for inputs to allow smooth typing
    const [editValues, setEditValues] = useState<Record<number, string>>({});

    // Snackbar State
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const fetchData = async () => {
        console.log("Fetching YabanciParaTestleri with:", { controller, dipnotNo, modelAdi, denetlenenId: user.denetlenenId });
        const res = await getYabanciParaTestleriByDenetlenen(
            controller,
            user.token || "",
            user.denetciId || 0,
            user.denetlenenId || 0,
            user.yil || 0,
            dipnotNo,
            modelAdi
        );

        if (!res) {
            console.log("YabanciParaTestleri res is null");
            setVeriler([]);
            return;
        }

        const rawList = Array.isArray(res) ? res : (res.data ?? []);
        console.log("YabanciParaTestleri rawList:", rawList);

        const list: YabanciParaTestleriRow[] = rawList.map((x: any) => ({
            id: x.id,
            dipnotNo: x.dipnotNo,
            baslik: x.baslik,
            hesapAdi: x.hesapAdi ?? "",
            kebirKodu: String(x.kebirKodu ?? ""),
            detayKodu: String(x.detayKodu ?? ""),

            // Updated mapping based on backend entity
            mizanBakiye: x.mizanBakiye,
            hesaplananBakiye: x.hesaplananBakiye,
            degisimTl: x.degisimTl, // Mizan Farkı

            onemlilik: String(x.onemlilik ?? "0"),
            dipnot: x.dipnot ?? "",
            paraBirimi: x.paraBirimi ?? "",
            denetlenen: x.denetlenen,
            modelAdi: x.modelAdi,
            dovizBakiye: x.dovizBakiye,
            kur: x.kur
        }));

        console.log("YabanciParaTestleri mapped list:", list);

        const titleRow = list.find((r: any) => normalizeString(r.hesapAdi) === normalizeString(dipnotAdi));
        if (titleRow?.hesapAdi) setDip(titleRow.hesapAdi);

        setVeriler(list);
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const anaHesaplar = useMemo(() => {
        return veriler.filter(x => x.kebirKodu === x.detayKodu).sort((a, b) => a.kebirKodu.localeCompare(b.kebirKodu));
    }, [veriler]);

    const altHesaplar = useMemo(() => {
        return veriler.filter(x => x.kebirKodu !== x.detayKodu).sort((a, b) => a.detayKodu.localeCompare(b.detayKodu));
    }, [veriler]);

    const groupedAlt = useMemo(() => {
        const groups: Record<string, YabanciParaTestleriRow[]> = {};
        altHesaplar.forEach(row => {
            if (!groups[row.kebirKodu]) groups[row.kebirKodu] = [];
            groups[row.kebirKodu].push(row);
        });
        return groups;
    }, [altHesaplar]);

    const handleInputChange = (id: number, val: string) => {
        setEditValues(prev => ({ ...prev, [id]: val }));
    };

    const handleSaveRow = async (row: YabanciParaTestleriRow, value?: string) => {
        const valStr = value !== undefined ? value : editValues[row.id];
        if (valStr === undefined) return; // No change

        // Parse input string to number (handling Turkish locale: 1.234,56 -> 1234.56)
        const normalizedVal = valStr.replace(/\./g, "").replace(",", ".");
        const valNum = parseFloat(normalizedVal);

        setSavingRowId(row.id);
        try {
            const updatedRow = { ...row, dovizBakiye: isNaN(valNum) ? 0 : valNum };

            // Optimistic update
            setVeriler(prev => prev.map(x => x.id === row.id ? updatedRow : x));

            await updateYabanciParaTestleriRow(controller, user.token || "", row.id, updatedRow);
            showSnackbar("Kayıt başarıyla güncellendi.", "success");

            // Clear edit value to show formatted number from state
            setEditValues(prev => {
                const copy = { ...prev };
                delete copy[row.id];
                return copy;
            });

        } catch (err) {
            console.error(err);
            showSnackbar("Güncelleme sırasında bir hata oluştu.", "error");
        } finally {
            setSavingRowId(null);
        }
    };

    const renderDetailTable = (kebirKodu: string) => {
        const rows = groupedAlt[kebirKodu] || [];
        // If no rows for this group, skip
        if (rows.length === 0) return null;

        const parentRow = anaHesaplar.find(x => x.kebirKodu === kebirKodu);
        // If parent row exists, use its name, otherwise just use the code
        const title = parentRow
            ? `${parentRow.kebirKodu} - ${parentRow.hesapAdi}`
            : `${kebirKodu} - Detaylar`;

        return (
            <Box mb={4} key={kebirKodu}>
                <Box sx={{ backgroundColor: HEADER_GRAY, px: 2, py: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700}>
                        {title}
                    </Typography>
                </Box>
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#e0e0e0'}` }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                                <TableCell sx={{ fontWeight: 700, textAlign: "center", color: 'white' }}>
                                    Hesap No
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, textAlign: "left", color: 'white' }}>
                                    Hesap Açıklaması
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, textAlign: "center", width: 160, color: 'white' }}>
                                    Döviz Bakiye
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, textAlign: "center", width: 90, color: 'white' }}>
                                    Para Birimi
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, textAlign: "center", width: 90, color: 'white' }}>
                                    Kur
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, textAlign: "center", width: 170, color: 'white' }}>
                                    Hesaplanan Bakiye
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, textAlign: "center", width: 150, color: 'white' }}>
                                    Mizan Bakiyesi
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, textAlign: "center", width: 120, color: 'white' }}>
                                    Mizan Farkı
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row, idx) => {
                                const dovizBakiye = row.dovizBakiye ?? 0;
                                const kur = row.kur ?? 0;
                                // Use backend provided values if available, otherwise calculate
                                const hesaplanan = row.hesaplananBakiye ?? (dovizBakiye * kur);
                                const mizan = row.mizanBakiye ?? 0;
                                const fark = row.degisimTl ?? (hesaplanan - mizan);

                                const isEditing = editValues[row.id] !== undefined;
                                const displayValue = isEditing ? editValues[row.id] : fmt(dovizBakiye);

                                return (
                                    <TableRow key={row.id} sx={{ backgroundColor: idx % 2 === 0 ? BG_PAPER : ZEBRA_ROW }}>
                                        <TableCell align="center">{row.detayKodu}</TableCell>
                                        <TableCell>{row.hesapAdi}</TableCell>
                                        <TableCell align="center">
                                            <TextField
                                                size="small"
                                                value={displayValue}
                                                onChange={(e) => handleInputChange(row.id, e.target.value)}
                                                onBlur={() => handleSaveRow(row)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleSaveRow(row);
                                                    }
                                                }}
                                                onFocus={() => {
                                                    if (!isEditing) {
                                                        handleInputChange(row.id, dovizBakiye.toString().replace(".", ","));
                                                    }
                                                }}
                                                variant="outlined"
                                                sx={{
                                                    "& .MuiInputBase-input": { textAlign: "right", padding: "4px 8px", fontSize: '0.875rem', color: theme.palette.mode === 'dark' ? '#fff' : '#000' },
                                                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : "#fff"
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">{row.paraBirimi}</TableCell>
                                        <TableCell align="right">{fmt(kur)}</TableCell>
                                        <TableCell align="right">{fmt(hesaplanan)}</TableCell>
                                        <TableCell align="right">{fmt(mizan)}</TableCell>
                                        <TableCell align="right" sx={{ color: fark !== 0 ? "error.main" : "inherit", fontWeight: fark !== 0 ? 700 : 400 }}>
                                            {fmt(fark)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    };

    // Get all unique kebir codes from groupedAlt to ensure we render everything
    const allKebirCodes = Object.keys(groupedAlt).sort();

    return (
        <Grid container>
            <Grid item xs={12}>
                <Box px={3} pt={3} pb={5} sx={{ width: "100%", margin: "0 auto" }}>
                    {allKebirCodes.map(kebirKodu => renderDetailTable(kebirKodu))}
                    {allKebirCodes.length === 0 && (
                        <Box mt={2}>
                            <Alert severity="info">
                                Görüntülenecek veri bulunamadı. Lütfen ilgili dipnot için VUK mizanında yabancı para bakiyesi olan hesaplar olduğundan emin olun.
                            </Alert>
                            <Box mt={2} p={2} sx={{ backgroundColor: theme.palette.action.selected, borderRadius: 1, fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                <Typography variant="caption" display="block" fontWeight="bold">DEBUG BİLGİSİ (Ekran Görüntüsü Alınız):</Typography>
                                <div>Dipnot No: {dipnotNo}</div>
                                <div>Yıl: {user.yil}</div>
                                <div>Denetlenen ID: {user.denetlenenId}</div>
                                <div>Denetçi ID: {user.denetciId}</div>
                                <div>Model Adı: {modelAdi}</div>
                                <div>Controller: {controller}</div>
                                <div>Veri Sayısı: {veriler.length}</div>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Grid>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} variant="filled" sx={{ width: "100%", color: "white" }} elevation={6}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Grid>
    );
};

export default YabanciParaTestleri;
