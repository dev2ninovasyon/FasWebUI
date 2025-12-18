import React, { useEffect, useState } from "react";
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
import { IconDeviceFloppy } from "@tabler/icons-react";

import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";

import {
    getHareketsizTicariAlacaklarByDenetlenen,
    updateHareketsizTicariAlacaklarRow,
    type HareketsizTicariAlacaklarRow,
} from "../../../../../api/CalismaKagitlari/HareketsizTicariAlacaklar";

interface Props {
    controller: string;
    dipnotAdi: string;
    dipnotNo: string;
    modelAdi: string;
    setDip: (str: string) => void;
}

const fmt = (n: any) =>
    Number(n ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const HareketsizTicariAlacaklar: React.FC<Props> = ({
    controller,
    dipnotAdi,
    dipnotNo,
    modelAdi,
    setDip,
}) => {
    const theme = useTheme();
    const user = useSelector((state: AppState) => state.userReducer);

    const HEADER_GRAY = theme.palette.mode === 'dark' ? theme.palette.grey[800] : "#F1F2F4";
    const ZEBRA_ROW = theme.palette.mode === 'dark' ? theme.palette.action.hover : "#F9FAFB";
    const BG_PAPER = theme.palette.background.paper;

    const [veriler, setVeriler] = useState<HareketsizTicariAlacaklarRow[]>([]);
    const [savingRowId, setSavingRowId] = useState<number | null>(null);
    const [editValues, setEditValues] = useState<Record<number, Partial<HareketsizTicariAlacaklarRow>>>({});

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
    };

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const fetchData = async () => {
        try {
            const res = await getHareketsizTicariAlacaklarByDenetlenen(
                controller,
                user.token || "",
                user.denetciId || 0,
                user.denetlenenId || 0,
                user.yil || 0
            );

            if (res && Array.isArray(res)) {
                setVeriler(res);
            } else {
                setVeriler([]);
            }
        } catch (error) {
            console.error("Veri çekme hatası:", error);
            setVeriler([]);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleInputChange = (id: number, field: keyof HareketsizTicariAlacaklarRow, val: string) => {
        setEditValues(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: val
            }
        }));
    };

    const handleSaveRow = async (row: HareketsizTicariAlacaklarRow) => {
        const changes = editValues[row.id];
        if (!changes) return;

        // Convert string inputs to numbers where necessary
        const payload: Partial<HareketsizTicariAlacaklarRow> = { ...changes };
        if (changes.borcTutari !== undefined) payload.borcTutari = parseFloat(String(changes.borcTutari).replace(",", "."));
        if (changes.alacakTutari !== undefined) payload.alacakTutari = parseFloat(String(changes.alacakTutari).replace(",", "."));
        if (changes.netBakiye !== undefined) payload.netBakiye = parseFloat(String(changes.netBakiye).replace(",", "."));

        setSavingRowId(row.id);
        try {
            const updatedRow = { ...row, ...payload };
            setVeriler(prev => prev.map(x => x.id === row.id ? updatedRow : x));

            await updateHareketsizTicariAlacaklarRow(controller, user.token || "", row.id, payload);
            showSnackbar("Kayıt başarıyla güncellendi.", "success");

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

    return (
        <Grid container>
            <Grid item xs={12}>
                <Box px={3} pt={3} pb={5} sx={{ width: "100%", margin: "0 auto" }}>
                    <Box sx={{ backgroundColor: theme.palette.primary.main, px: 2, py: 1, mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight={700} color="white">
                            Hareketsiz Ticari Alacaklar
                        </Typography>
                    </Box>
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: HEADER_GRAY }}>
                                    <TableCell sx={{ fontWeight: 800, textAlign: "center" }}>Kebir Kodu</TableCell>
                                    <TableCell sx={{ fontWeight: 800, textAlign: "center" }}>Detay Kodu</TableCell>
                                    <TableCell sx={{ fontWeight: 800, textAlign: "center" }}>Hesap Adı</TableCell>
                                    <TableCell sx={{ fontWeight: 800, textAlign: "center" }}>Borç Tutarı</TableCell>
                                    <TableCell sx={{ fontWeight: 800, textAlign: "center" }}>Alacak Tutarı</TableCell>
                                    <TableCell sx={{ fontWeight: 800, textAlign: "center" }}>Net Bakiye</TableCell>
                                    <TableCell sx={{ fontWeight: 800, textAlign: "center" }}>Para Birimi</TableCell>
                                    <TableCell sx={{ width: 70, textAlign: "center" }} />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {veriler.map((row, idx) => {
                                    const isEditing = !!editValues[row.id];
                                    const changes = editValues[row.id] || {};

                                    const borc = changes.borcTutari !== undefined ? changes.borcTutari : row.borcTutari;
                                    const alacak = changes.alacakTutari !== undefined ? changes.alacakTutari : row.alacakTutari;
                                    const net = changes.netBakiye !== undefined ? changes.netBakiye : row.netBakiye;

                                    return (
                                        <TableRow key={row.id} sx={{ backgroundColor: idx % 2 === 0 ? BG_PAPER : ZEBRA_ROW }}>
                                            <TableCell align="center">{row.kebirKodu}</TableCell>
                                            <TableCell align="center">{row.detayKodu}</TableCell>
                                            <TableCell>{row.hesapAdi}</TableCell>
                                            <TableCell align="right">
                                                <TextField
                                                    size="small"
                                                    value={borc}
                                                    onChange={(e) => handleInputChange(row.id, 'borcTutari', e.target.value)}
                                                    variant="standard"
                                                    InputProps={{ disableUnderline: true }}
                                                    sx={{ "& .MuiInputBase-input": { textAlign: "right" } }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <TextField
                                                    size="small"
                                                    value={alacak}
                                                    onChange={(e) => handleInputChange(row.id, 'alacakTutari', e.target.value)}
                                                    variant="standard"
                                                    InputProps={{ disableUnderline: true }}
                                                    sx={{ "& .MuiInputBase-input": { textAlign: "right" } }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <TextField
                                                    size="small"
                                                    value={net}
                                                    onChange={(e) => handleInputChange(row.id, 'netBakiye', e.target.value)}
                                                    variant="standard"
                                                    InputProps={{ disableUnderline: true }}
                                                    sx={{ "& .MuiInputBase-input": { textAlign: "right" } }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">{row.paraBirimi}</TableCell>
                                            <TableCell align="center">
                                                {isEditing && (
                                                    <Tooltip title="Kaydet">
                                                        <IconButton
                                                            color="primary"
                                                            onClick={() => handleSaveRow(row)}
                                                            disabled={savingRowId === row.id}
                                                            size="small"
                                                            sx={{ color: theme.palette.success.main }}
                                                        >
                                                            <IconDeviceFloppy size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {veriler.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                            Veri bulunamadı.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
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

export default HareketsizTicariAlacaklar;
