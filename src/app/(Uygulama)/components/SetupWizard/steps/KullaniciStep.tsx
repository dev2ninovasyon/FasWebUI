"use client";

import { Box, Button, Typography, IconButton, Divider, List, ListItem, ListItemText, ListItemSecondaryAction, Paper, Grid, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Menu, MenuItem, ListItemIcon, Chip, Snackbar, Alert, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import { IconArrowLeft, IconArrowRight, IconTrash, IconPlus, IconDotsVertical, IconEdit, IconEye } from "@tabler/icons-react";
import CustomFormLabel from "../../Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "../../Forms/ThemeElements/CustomTextField";
import UnvanBoxAutocomplete from "../../Sozlesme/DenetimKadrosuAtama/AutoCompleteBox/UnvanBoxAutoComplete";
import { IconLock, IconLockOpen } from "@tabler/icons-react";
import { InputAdornment } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getKullaniciByDenetciId, createKullanici, updateKullanici, deleteKullaniciById } from "@/api/Kullanici/KullaniciIslemleri";

interface KullaniciStepProps {
    data?: any[];
    onDataChange: (data: any[]) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function KullaniciStep({
    data,
    onDataChange,
    onNext,
    onBack,
}: KullaniciStepProps) {
    const [kullanicilar, setKullanicilar] = useState<any[]>(data || []);
    const [showForm, setShowForm] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    // Snackbar State
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const user = useSelector((state: AppState) => state.userReducer);
    const open = Boolean(anchorEl);

    const fetchData = async () => {
        if (user.token && user.denetciId) {
            try {
                const result = await getKullaniciByDenetciId(user.token, user.denetciId);
                if (result) {
                    setKullanicilar(result);
                    onDataChange(result);
                }
            } catch (error) {
                console.log("Kullanıcılar getirilemedi:", error);
                showSnackbar("Kullanıcılar yüklenirken bir hata oluştu", "error");
            }
        }
    };

    useEffect(() => {
        if (!data || data.length === 0) {
            fetchData();
        }
    }, []);

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, index: number, id: number) => {
        setAnchorEl(event.currentTarget);
        setSelectedIndex(index);
        setSelectedId(id);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedIndex(null);
        setSelectedId(null);
    };

    const handleAddKullanici = async (kullanici: any) => {
        if (!user.token || !user.denetciId) return;

        try {
            let success = false;
            if (editingIndex !== null && editingId !== null) {
                // Update
                const updatedKullanici = { ...kullanici, denetciId: user.denetciId, id: editingId };
                success = await updateKullanici(user.token, editingId, updatedKullanici);
                if (success) {
                    showSnackbar("Kullanıcı başarıyla güncellendi", "success");
                }
            } else {
                // Create
                const newKullanici = { ...kullanici, denetciId: user.denetciId, aktifPasif: true };
                success = await createKullanici(user.token, newKullanici);
                if (success) {
                    showSnackbar("Kullanıcı başarıyla eklendi", "success");
                }
            }

            if (success) {
                await fetchData();
                setShowForm(false);
                setEditingIndex(null);
                setEditingId(null);
                setSelectedId(null);
            } else {
                showSnackbar("İşlem başarısız oldu", "error");
            }
        } catch (error) {
            console.log("İşlem sırasında hata:", error);
            showSnackbar("Bir hata oluştu", "error");
        }
    };

    const handleRemoveKullanici = async () => {
        if (selectedId !== null && user.token) {
            try {
                const success = await deleteKullaniciById(user.token, selectedId);
                if (success) {
                    showSnackbar("Kullanıcı başarıyla silindi", "success");
                    await fetchData();
                } else {
                    showSnackbar("Silme işlemi başarısız", "error");
                }
            } catch (error) {
                console.log("Silme hatası:", error);
                showSnackbar("Silme işlemi sırasında hata oluştu", "error");
            }
        }
        handleMenuClose();
    };

    const handleEditKullanici = () => {
        if (selectedIndex !== null && selectedId !== null) {
            setEditingIndex(selectedIndex);
            setEditingId(selectedId);
            setShowForm(true);
        }
        handleMenuClose();
    };

    const handleDetailKullanici = () => {
        if (selectedIndex !== null) {
            setEditingIndex(selectedIndex);
            setShowForm(true);
        }
        handleMenuClose();
    };

    const handleNext = () => {
        if (kullanicilar.length === 0) {
            showSnackbar("En az bir kullanıcı eklemelisiniz", "error");
            return;
        }
        onNext();
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Kullanıcı Ekleme
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Sisteme giriş yapacak kullanıcıları ekleyin. En az bir kullanıcı eklemeniz gerekmektedir. Burada eklediğiniz kullanıcıları bir sonraki adımlarda denetim kadrosunda görevlendirebilirsiniz.
            </Typography>
            <Typography variant="caption" color="primary.main" sx={{ display: "block", mb: 3, fontStyle: "italic" }}>
                * Bu kullanıcıları daha sonra 'Müşteri İşlemleri {">"} Kullanıcı İşlemleri' menüsünden düzenleyebilir veya silebilirsiniz.
            </Typography>

            {!showForm ? (
                <>
                    {/* Yeni Kullanıcı Ekle Butonu */}
                    <Button
                        variant="outlined"
                        startIcon={<IconPlus />}
                        onClick={() => {
                            setEditingIndex(null);
                            setEditingId(null);
                            setSelectedId(null);
                            setShowForm(true);
                        }}
                        fullWidth
                        sx={{ mb: 3 }}
                    >
                        Yeni Kullanıcı Ekle
                    </Button>

                    {/* Kullanıcı Listesi Tablosu */}
                    {kullanicilar.length > 0 && (
                        <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: "divider", overflow: "hidden" }}>
                            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                                <Typography variant="h6">
                                    Eklenen Kullanıcılar ({kullanicilar.length})
                                </Typography>
                            </Box>
                            <TableContainer sx={{ maxHeight: '40vh', overflowX: 'auto' }}>
                                <Table aria-label="simple table" size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><Typography variant="subtitle2" fontWeight={600}>Personel Adı</Typography></TableCell>
                                            <TableCell><Typography variant="subtitle2" fontWeight={600}>Ünvan</Typography></TableCell>
                                            <TableCell><Typography variant="subtitle2" fontWeight={600}>Email</Typography></TableCell>
                                            <TableCell><Typography variant="subtitle2" fontWeight={600}>Telefon</Typography></TableCell>
                                            <TableCell><Typography variant="subtitle2" fontWeight={600}>Gsm</Typography></TableCell>
                                            <TableCell align="center"><Typography variant="subtitle2" fontWeight={600}>Durum</Typography></TableCell>
                                            <TableCell align="center"><Typography variant="subtitle2" fontWeight={600}></Typography></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {kullanicilar.map((kullanici, index) => (
                                            <TableRow key={index} hover>
                                                <TableCell>
                                                    <Typography variant="body2">{kullanici.personelAdi || "-"}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="textSecondary">{kullanici.unvani || "-"}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="textSecondary">{kullanici.email || "-"}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="textSecondary">{kullanici.tel || "-"}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="textSecondary">{kullanici.gsm || "-"}</Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={kullanici.aktifPasif !== false ? "Aktif" : "Pasif"}
                                                        size="small"
                                                        color={kullanici.aktifPasif !== false ? "success" : "error"}
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        onClick={(e) => handleMenuClick(e, index, kullanici.id)}
                                                        size="small"
                                                    >
                                                        <IconDotsVertical size={18} />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Menu
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleMenuClose}
                            >
                                <MenuItem onClick={handleEditKullanici}>
                                    <ListItemIcon>
                                        <IconEdit size={18} />
                                    </ListItemIcon>
                                    Düzenle
                                </MenuItem>
                                <MenuItem onClick={handleDetailKullanici}>
                                    <ListItemIcon>
                                        <IconEye size={18} />
                                    </ListItemIcon>
                                    Detay
                                </MenuItem>
                                <MenuItem onClick={handleRemoveKullanici} sx={{ color: "error.main" }}>
                                    <ListItemIcon sx={{ color: "error.main" }}>
                                        <IconTrash size={18} />
                                    </ListItemIcon>
                                    Sil
                                </MenuItem>
                            </Menu>
                        </Paper>
                    )}

                    {/* Navigation Buttons */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                        <Button
                            variant="outlined"
                            onClick={onBack}
                            startIcon={<IconArrowLeft />}
                        >
                            Geri
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            endIcon={<IconArrowRight />}
                            disabled={kullanicilar.length === 0}
                        >
                            İleri
                        </Button>
                    </Box>
                </>
            ) : (
                <>
                    {/* Kullanıcı Ekleme Formu */}
                    <KullaniciEkleFormWrapper
                        initialData={editingIndex !== null ? kullanicilar[editingIndex] : null}
                        onSave={handleAddKullanici}
                        onCancel={() => setShowForm(false)}
                        onError={(msg) => showSnackbar(msg, "error")}
                    />
                </>
            )}

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}

// Kullanıcı Ekleme Form Wrapper
function KullaniciEkleFormWrapper({ onSave, onCancel, initialData, onError }: { onSave: (data: any) => void; onCancel: () => void; initialData?: any; onError: (message: string) => void }) {
    const [bdSicilNo, setBdSicilNo] = useState(initialData?.bdSicilNo || "");
    const [unvani, setUnvani] = useState(initialData?.unvani || "");
    const [unvanId, setUnvanId] = useState(initialData?.unvanId || 0);
    const [personelAdi, setPersonelAdi] = useState(initialData?.personelAdi || "");
    const [tel, setTel] = useState(initialData?.tel || "");
    const [gsm, setGsm] = useState(initialData?.gsm || "");
    const [email, setEmail] = useState(initialData?.email || "");
    const [sifre, setSifre] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Error states
    const [personelAdiError, setPersonelAdiError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [sifreError, setSifreError] = useState("");
    const [telError, setTelError] = useState("");
    const [gsmError, setGsmError] = useState("");

    // Update form when initialData changes
    useEffect(() => {
        if (initialData) {
            setBdSicilNo(initialData.bdSicilNo || "");
            setUnvani(initialData.unvani || "");
            setUnvanId(initialData.unvanId || 0);
            setPersonelAdi(initialData.personelAdi || "");
            setTel(initialData.tel || "");
            setGsm(initialData.gsm || "");
            setEmail(initialData.email || "");
        } else {
            setBdSicilNo("");
            setUnvani("");
            setUnvanId(0);
            setPersonelAdi("");
            setTel("");
            setGsm("");
            setEmail("");
        }
        setSifre("");
        setPersonelAdiError("");
        setEmailError("");
        setSifreError("");
        setTelError("");
        setGsmError("");
    }, [initialData]);

    const handleSave = async () => {
        // Reset errors
        setPersonelAdiError("");
        setEmailError("");
        setSifreError("");
        setTelError("");
        setGsmError("");

        // Validate required fields
        const missingFields: string[] = [];
        let firstErrorField: string | null = null;

        if (!personelAdi) {
            setPersonelAdiError("Personel Adı zorunludur.");
            missingFields.push("Personel Adı");
            if (!firstErrorField) firstErrorField = "personelAdi";
        }
        if (!email) {
            setEmailError("Email zorunludur.");
            missingFields.push("Email");
            if (!firstErrorField) firstErrorField = "email";
        }
        if (!initialData && !sifre) {
            setSifreError("Şifre zorunludur.");
            missingFields.push("Şifre");
            if (!firstErrorField) firstErrorField = "sifre";
        }

        if (missingFields.length > 0) {
            onError(`Lütfen zorunlu alanları doldurun: ${missingFields.join(", ")}`);
            if (firstErrorField) {
                const element = document.getElementById(firstErrorField);
                element?.focus();
            }
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            setEmailError("Geçerli bir email girin.");
            onError("Lütfen geçerli bir email adresi girin");
            const element = document.getElementById("email");
            element?.focus();
            return;
        }

        // Validate tel format (11 digits, only digits count)
        const telDigits = tel.replace(/\D/g, "");
        if (tel && telDigits.length !== 11) {
            setTelError("Tel 11 haneli olmalıdır.");
            onError("Telefon numarası 11 haneli olmalıdır");
            const element = document.getElementById("tel");
            element?.focus();
            return;
        }

        // Validate gsm format (11 digits, only digits count)
        const gsmDigits = gsm.replace(/\D/g, "");
        if (gsm && gsmDigits.length !== 11) {
            setGsmError("Gsm 11 haneli olmalıdır.");
            onError("GSM numarası 11 haneli olmalıdır");
            const element = document.getElementById("gsm");
            element?.focus();
            return;
        }

        setLoading(true);
        try {
            await onSave({
                ...initialData,
                bdSicilNo,
                unvani,
                unvanId,
                personelAdi,
                tel: tel.replace(/\D/g, ""), // Sadece rakamları al (+90, boşluk vb. kaldır)
                gsm: gsm.replace(/\D/g, ""), // Sadece rakamları al (+90, boşluk vb. kaldır)
                email,
                sifre: sifre || initialData?.sifre,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, border: 1, borderColor: "divider" }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                {initialData ? "Kullanıcı Düzenle" : "Yeni Kullanıcı Bilgileri"}
            </Typography>
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                <Grid
                    size={{
                        xs: 12,
                        sm: 6
                    }}>
                    <CustomFormLabel htmlFor="bd-sicilNo" sx={{ mt: 0, mb: 1 }}>
                        B. D. Sicil No
                    </CustomFormLabel>
                    <CustomTextField
                        id="bd-sicilNo"
                        fullWidth
                        value={bdSicilNo}
                        onChange={(e: any) => setBdSicilNo(e.target.value)}
                        size="small"
                    />
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        sm: 6
                    }}>
                    <CustomFormLabel htmlFor="personelAdi" sx={{ mt: 0, mb: 1 }}>
                        Personel Adı *
                    </CustomFormLabel>
                    <CustomTextField
                        id="personelAdi"
                        fullWidth
                        value={personelAdi}
                        placeholder={personelAdiError || ""}
                        onChange={(e: any) => {
                            setPersonelAdi(e.target.value);
                            if (e.target.value) setPersonelAdiError("");
                        }}
                        onFocus={() => {
                            if (personelAdiError) setPersonelAdiError("");
                        }}
                        size="small"
                        error={!!personelAdiError}
                    />
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        sm: 6
                    }}>
                    <CustomFormLabel htmlFor="unvani" sx={{ mt: 0, mb: 1 }}>
                        Ünvanı
                    </CustomFormLabel>
                    <UnvanBoxAutocomplete
                        initialValue={unvani}
                        onSelect={(selectedUnvanAdi) => setUnvani(selectedUnvanAdi)}
                        onSelectId={(selectedUnvanId) => setUnvanId(selectedUnvanId)}
                    />
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        sm: 6
                    }}>
                    <CustomFormLabel htmlFor="email" sx={{ mt: 0, mb: 1 }}>
                        Email *
                    </CustomFormLabel>
                    <CustomTextField
                        id="email"
                        fullWidth
                        value={email}
                        placeholder={emailError || ""}
                        onChange={(e: any) => {
                            setEmail(e.target.value);
                            if (e.target.value) setEmailError("");
                        }}
                        onFocus={() => {
                            if (emailError) setEmailError("");
                        }}
                        size="small"
                        error={!!emailError}
                    />
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        sm: 6
                    }}>
                    <CustomFormLabel htmlFor="tel" sx={{ mt: 0, mb: 1 }}>
                        Tel
                    </CustomFormLabel>
                    <CustomTextField
                        id="tel"
                        fullWidth
                        value={tel}
                        placeholder={telError || ""}
                        onChange={(e: any) => {
                            setTel(e.target.value);
                            if (e.target.value) setTelError("");
                        }}
                        onFocus={() => {
                            if (telError) setTelError("");
                        }}
                        size="small"
                        error={!!telError}
                    />
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        sm: 6
                    }}>
                    <CustomFormLabel htmlFor="gsm" sx={{ mt: 0, mb: 1 }}>
                        Gsm
                    </CustomFormLabel>
                    <CustomTextField
                        id="gsm"
                        fullWidth
                        value={gsm}
                        placeholder={gsmError || ""}
                        onChange={(e: any) => {
                            setGsm(e.target.value);
                            if (e.target.value) setGsmError("");
                        }}
                        onFocus={() => {
                            if (gsmError) setGsmError("");
                        }}
                        size="small"
                        error={!!gsmError}
                    />
                </Grid>

                {!initialData && (
                    <Grid
                        size={{
                            xs: 12,
                            sm: 12
                        }}>
                        <CustomFormLabel htmlFor="sifre" sx={{ mt: 0, mb: 1 }}>
                            Şifre *
                        </CustomFormLabel>
                        <form autoComplete="off">
                            <CustomTextField
                                id="sifre"
                                type={showPassword ? "text" : "password"}
                                fullWidth
                                value={sifre}
                                placeholder={sifreError || ""}
                                onChange={(e: any) => {
                                    setSifre(e.target.value);
                                    if (e.target.value) setSifreError("");
                                }}
                                onFocus={() => {
                                    if (sifreError) setSifreError("");
                                }}
                                size="small"
                                error={!!sifreError}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                size="small"
                                            >
                                                {showPassword ? <IconLockOpen size={20} /> : <IconLock size={20} />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </form>
                    </Grid>
                )}

                <Grid sx={{ mt: 1 }} size={12}>
                    <Box sx={{ display: "flex", flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: "flex-end" }}>
                        <Button
                            variant="outlined"
                            onClick={onCancel}
                            size="small"
                            disabled={loading}
                            sx={{ width: { xs: '100%', sm: 'auto' }, order: { xs: 2, sm: 1 } }}
                        >
                            İptal
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSave}
                            size="small"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                            sx={{ width: { xs: '100%', sm: 'auto' }, order: { xs: 1, sm: 2 } }}
                        >
                            {loading ? "İşleniyor..." : (initialData ? "Güncelle" : "Kullanıcı Ekle")}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
}
