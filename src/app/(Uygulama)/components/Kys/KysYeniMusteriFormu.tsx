import React, { useEffect, useState } from "react";
import {
    Box,
    Paper,
    Typography,
    Grid,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    CircularProgress,
    Divider,
    SnackbarContent
} from "@mui/material";
import { IconPlus, IconTrash, IconDeviceFloppy } from "@tabler/icons-react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    getYeniMusteriFormu,
    saveYeniMusteriFormu,
    YeniMusteriFormuDto,
    OrtakDto,
    YonetimKuruluDto,
    SubeDto,
    GrupSirketiDto
} from "@/api/Kys/KysYeniMusteriFormuApi";
import { enqueueSnackbar, SnackbarProvider } from "notistack";
const KysYeniMusteriFormu: React.FC = () => {
    const user = useSelector((state: AppState) => state.userReducer);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<YeniMusteriFormuDto | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (user.token && user.denetlenenId && user.yil) {
                setLoading(true);
                const data = await getYeniMusteriFormu(user.token, user.denetlenenId, user.yil);
                if (data) {
                    setFormData(data);
                } else {
                    // Fallback or empty init if API fails or returns null
                    setFormData({
                        id: 0,
                        denetlenenId: user.denetlenenId,
                        yil: user.yil,
                        unvan: "",
                        vergiDairesi: "",
                        vergiNo: "",
                        adres: "",
                        telefon: "",
                        eposta: "",
                        webSitesi: "",
                        faaliyetKonusu: "",
                        sermaye: 0,
                        ortaklar: [],
                        yonetimKurulu: [],
                        subeler: [],
                        grupSirketleri: [],
                        hazirlayanAdSoyad: user.kullaniciAdi || "",
                        hazirlamaTarihi: new Date().toISOString(),
                        onaylayanAdSoyad: "",
                        onaylamaTarihi: undefined
                    });
                }
                setLoading(false);
            }
        };
        fetchData();
    }, [user.token, user.denetlenenId, user.yil]);

    const handleSave = async () => {
        if (!formData || !user.token) return;
        setSaving(true);
        const success = await saveYeniMusteriFormu(user.token, formData);
        if (success) {
            enqueueSnackbar("Form başarıyla kaydedildi.");
        } else {
            enqueueSnackbar("Form kaydedilirken bir hata oluştu.");
        }
        setSaving(false);
    };

    const handleChange = (field: keyof YeniMusteriFormuDto, value: any) => {
        if (!formData) return;
        setFormData({ ...formData, [field]: value });
    };

    // --- Helper for Dynamic Tables ---
    const renderTable = <T extends object>(
        title: string,
        data: T[],
        columns: { label: string; field: keyof T; width?: string }[],
        onUpdate: (newData: T[]) => void,
        newItem: T
    ) => {
        const handleItemChange = (index: number, field: keyof T, value: any) => {
            const newData = [...data];
            newData[index] = { ...newData[index], [field]: value };
            onUpdate(newData);
        };

        const handleDelete = (index: number) => {
            const newData = data.filter((_, i) => i !== index);
            onUpdate(newData);
        };

        const handleAdd = () => {
            onUpdate([...data, newItem]);
        };

        return (
            <Box mt={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6" color="primary">{title}</Typography>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<IconPlus size={18} />}
                        onClick={handleAdd}
                    >
                        Ekle
                    </Button>
                </Box>
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                            <TableRow>
                                {columns.map((col) => (
                                    <TableCell key={col.label} width={col.width}>{col.label}</TableCell>
                                ))}
                                <TableCell width="50px"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={columns.length + 1} align="center">
                                        <Typography variant="body2" color="textSecondary">Kayıt yok</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                            {data.map((row, index) => (
                                <TableRow key={index}>
                                    {columns.map((col) => (
                                        <TableCell key={col.label}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                variant="standard"
                                                InputProps={{ disableUnderline: true }}
                                                value={(row as any)[col.field] || ""}
                                                onChange={(e) => handleItemChange(index, col.field, e.target.value)}
                                            />
                                        </TableCell>
                                    ))}
                                    <TableCell>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(index)}>
                                            <IconTrash size={18} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    };

    if (loading) {
        return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
    }

    if (!formData) {
        return <Typography color="error">Veri yüklenemedi.</Typography>;
    }

    return (
        <Paper elevation={0} sx={{ p: 4, border: "1px solid #e0e0e0" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="600" color="#1976d2">
                    5.3 YENİ MÜŞTERİ FORMU
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<IconDeviceFloppy />}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? "Kaydediliyor..." : "Kaydet"}
                </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* 1. Müşteri Bilgileri */}
            <Typography variant="h6" color="primary" mb={2}>1. Müşteri Bilgileri</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Ticari Unvan"
                        value={formData.unvan}
                        onChange={(e) => handleChange("unvan", e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Vergi Dairesi"
                        value={formData.vergiDairesi}
                        onChange={(e) => handleChange("vergiDairesi", e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Vergi No"
                        value={formData.vergiNo}
                        onChange={(e) => handleChange("vergiNo", e.target.value)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Adres"
                        multiline
                        rows={2}
                        value={formData.adres}
                        onChange={(e) => handleChange("adres", e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label="Telefon"
                        value={formData.telefon}
                        onChange={(e) => handleChange("telefon", e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label="E-Posta"
                        value={formData.eposta}
                        onChange={(e) => handleChange("eposta", e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label="Web Sitesi"
                        value={formData.webSitesi}
                        onChange={(e) => handleChange("webSitesi", e.target.value)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Faaliyet Konusu"
                        multiline
                        rows={2}
                        value={formData.faaliyetKonusu}
                        onChange={(e) => handleChange("faaliyetKonusu", e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Sermaye"
                        type="number"
                        value={formData.sermaye}
                        onChange={(e) => handleChange("sermaye", parseFloat(e.target.value))}
                    />
                </Grid>
            </Grid>

            {/* 2. Ortaklık Yapısı */}
            {renderTable<OrtakDto>(
                "2. Ortaklık Yapısı",
                formData.ortaklar,
                [
                    { label: "Ad Soyad / Unvan", field: "adSoyad" },
                    { label: "Pay Oranı (%)", field: "payOrani", width: "150px" },
                    { label: "Pay Tutari", field: "payTutari", width: "150px" }
                ],
                (newData) => handleChange("ortaklar", newData),
                { adSoyad: "", payOrani: 0, payTutari: 0 }
            )}

            {/* 3. Yönetim Kurulu */}
            {renderTable<YonetimKuruluDto>(
                "3. Yönetim Kurulu",
                formData.yonetimKurulu,
                [
                    { label: "Ad Soyad", field: "adSoyad" },
                    { label: "Görevi", field: "gorevi", width: "200px" }
                ],
                (newData) => handleChange("yonetimKurulu", newData),
                { adSoyad: "", gorevi: "" }
            )}

            {/* 4. Şubeler */}
            {renderTable<SubeDto>(
                "4. Şubeler",
                formData.subeler,
                [
                    { label: "Şube Adı", field: "ad", width: "30%" },
                    { label: "Adres", field: "adres" }
                ],
                (newData) => handleChange("subeler", newData),
                { ad: "", adres: "" }
            )}

            {/* 5. Grup Şirketleri */}
            {renderTable<GrupSirketiDto>(
                "5. Grup Şirketleri",
                formData.grupSirketleri,
                [
                    { label: "Şirket Adı", field: "ad" },
                    { label: "İlişki Türü", field: "iliski", width: "200px" }
                ],
                (newData) => handleChange("grupSirketleri", newData),
                { ad: "", iliski: "" }
            )}

            <Box mt={4} p={2} bgcolor="#f9f9f9" borderRadius={1} border="1px solid #eee">
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Hazırlayan"
                            value={formData.hazirlayanAdSoyad}
                            onChange={(e) => handleChange("hazirlayanAdSoyad", e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Onaylayan"
                            value={formData.onaylayanAdSoyad}
                            onChange={(e) => handleChange("onaylayanAdSoyad", e.target.value)}
                        />
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    );
};

export default KysYeniMusteriFormu;
