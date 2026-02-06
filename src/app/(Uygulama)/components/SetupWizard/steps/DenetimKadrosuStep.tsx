"use client";

import {
    Box,
    Button,
    Grid,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    deleteGorevAtamalariById,
    getGorevAtamalariByDenetlenenIdYil,
    createGorevAtamalari,
} from "@/api/Sozlesme/DenetimKadrosuAtama";
import {
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconPlus,
    IconArrowLeft,
    IconArrowRight,
    IconCheck,
} from "@tabler/icons-react";
import BlankCard from "@/app/(Uygulama)/components/Layout/Shared/BlankCard/BlankCard";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import { enqueueSnackbar } from "notistack";

// Autocomplete components
import KullaniciBoxAutocomplete from "@/app/(Uygulama)/components/Sozlesme/DenetimKadrosuAtama/AutoCompleteBox/KullaniciBoxAutoComplete";
import UnvanBoxAutocomplete from "@/app/(Uygulama)/components/Sozlesme/DenetimKadrosuAtama/AutoCompleteBox/UnvanBoxAutoComplete";
import AsilYedekBoxAutocomplete from "@/app/(Uygulama)/components/Sozlesme/DenetimKadrosuAtama/AutoCompleteBox/AsilYedekBoxAutoComplete";
import AktifPasifBoxAutocomplete from "@/app/(Uygulama)/components/Sozlesme/DenetimKadrosuAtama/AutoCompleteBox/AktifPasifYedekBoxAutoComplete";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";

interface DenetimKadrosuStepProps {
    data?: any;
    sirket?: any;
    onDataChange: (data: any) => void;
    onComplete: () => void;
    onBack: () => void;
}

export default function DenetimKadrosuStep({
    data,
    sirket,
    onDataChange,
    onComplete,
    onBack,
}: DenetimKadrosuStepProps) {
    const user = useSelector((state: AppState) => state.userReducer);
    const customizer = useSelector((state: AppState) => state.customizer);

    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Table Action Menu State
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const openMenu = Boolean(anchorEl);

    // Dialog State
    const [openDialog, setOpenDialog] = useState(false);
    const [savingMember, setSavingMember] = useState(false);

    // Form State for Adding Member
    const [kullaniciId, setKullaniciId] = useState(0);
    const [unvanId, setUnvanId] = useState(0);
    const [asilYedek, setAsilYedek] = useState("");
    const [calismaSaati, setCalismaSaati] = useState<any>(0);
    const [saatBasiUcreti, setSaatBasiUcreti] = useState<any>(0);
    const [denetimUcreti, setDenetimUcreti] = useState<any>(0);
    const [aktifPasif, setAktifPasif] = useState(true);

    const fetchData = async () => {
        if (!sirket?.id) return;
        try {
            setLoading(true);
            const res = await getGorevAtamalariByDenetlenenIdYil(sirket.id,
                user.yil || new Date().getFullYear()
            );
            setRows(res || []);
        } catch (error) {
            console.log("Kadrosu verileri çekilirken hata:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [sirket?.id, user.yil]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, id: number) => {
        setAnchorEl(event.currentTarget);
        setSelectedId(id);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedId(null);
    };

    const handleDelete = async () => {
        if (!selectedId) return;
        try {
            const result = await deleteGorevAtamalariById(selectedId);
            if (result) {
                enqueueSnackbar("Görev ataması silindi", { variant: "success" });
                fetchData();
            }
        } catch (error) {
            console.log("Silme hatası:", error);
        } finally {
            handleMenuClose();
        }
    };

    const handleAddMember = async () => {
        if (kullaniciId === 0 || unvanId === 0 || asilYedek === "") {
            enqueueSnackbar("Lütfen tüm zorunlu alanları doldurun.", { variant: "warning" });
            return;
        }

        if (!sirket?.id) {
            enqueueSnackbar("Şirket bilgisi bulunamadı. Lütfen adımları kontrol edin.", { variant: "error" });
            return;
        }

        const payload = {
            denetciId: user.denetciId,
            denetlenenId: sirket.id,
            yil: user.yil,
            kullaniciId,
            unvanId,
            asilYedek,
            calismaSaati: Number(calismaSaati),
            saatBasiUcreti: Number(saatBasiUcreti),
            denetimUcreti: Number(denetimUcreti),
            aktifPasif,
        };

        try {
            setSavingMember(true);
            const result = await createGorevAtamalari(payload);
            if (result === true) {
                enqueueSnackbar("Personel başarıyla atandı", { variant: "success" });
                setOpenDialog(false);
                resetForm();
                fetchData();
            } else {
                enqueueSnackbar("Atama yapılamadı.", { variant: "error" });
            }
        } catch (error) {
            console.log("Atama hatası:", error);
        } finally {
            setSavingMember(false);
        }
    };

    const resetForm = () => {
        setKullaniciId(0);
        setUnvanId(0);
        setAsilYedek("");
        setCalismaSaati(0);
        setSaatBasiUcreti(0);
        setDenetimUcreti(0);
        setAktifPasif(true);
    };

    const handleComplete = () => {
        if (rows.length === 0) {
            enqueueSnackbar("Lütfen en az bir personel atayın.", { variant: "warning" });
            return;
        }
        onComplete();
    };

    return (
        <Box sx={{ width: "100%" }}>
            <ParentCard title={`${sirket?.firmaAdi || "Şirket"} Denetim Kadrosu (${user.yil})`}>
                <Box>
                    <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                Denetim ekibi üyelerini seçin ve rollerini (Asil/Yedek) belirleyin. Kullanıcı adımında eklediğiniz personelleri burada görevlendirebilirsiniz.
                            </Typography>
                            <Typography variant="caption" color="primary.main" sx={{ display: "block", mb: 2, fontStyle: "italic" }}>
                                * Denetim kadrosunu daha sonra 'Denetim Kadrosu Atama' menüsünden güncelleyebilirsiniz.
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<IconPlus size={18} />}
                            onClick={() => setOpenDialog(true)}
                        >
                            Ekip Üyesi Ekle
                        </Button>
                    </Box>

                    <BlankCard>
                        <TableContainer>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><Typography variant="h6">Personel Adı</Typography></TableCell>
                                        <TableCell align="center"><Typography variant="h6">Ünvan</Typography></TableCell>
                                        <TableCell align="center"><Typography variant="h6">Asil / Yedek</Typography></TableCell>
                                        <TableCell align="center"><Typography variant="h6">Saat / Ücret</Typography></TableCell>
                                        <TableCell align="center"><Typography variant="h6">Durum</Typography></TableCell>
                                        <TableCell sx={{ width: 50 }}></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                                <CircularProgress size={24} />
                                            </TableCell>
                                        </TableRow>
                                    ) : rows.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                                <Typography color="textSecondary">Henüz atanmış personel bulunmamaktadır.</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        rows.map((row) => (
                                            <TableRow key={row.id} hover>
                                                <TableCell><Typography variant="subtitle1" fontWeight={600}>{row.kullaniciAdi}</Typography></TableCell>
                                                <TableCell align="center"><Typography variant="body2">{row.unvanAdi}</Typography></TableCell>
                                                <TableCell align="center"><Typography variant="body2">{row.asilYedek}</Typography></TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="body2">{row.calismaSaati} Saat / {row.saatBasiUcreti} â‚º</Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={row.aktifPasif ? "Aktif" : "Pasif"}
                                                        size="small"
                                                        color={row.aktifPasif ? "success" : "default"}
                                                        variant="filled"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton onClick={(e) => handleMenuOpen(e, row.id)}>
                                                        <IconDotsVertical size={18} />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </BlankCard>

                    {/* Action Menu */}
                    <Menu anchorEl={anchorEl} open={openMenu} onClose={handleMenuClose}>
                        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
                            <ListItemIcon><IconTrash size={18} style={{ color: "inherit" }} /></ListItemIcon>
                            Sil
                        </MenuItem>
                    </Menu>
                </Box>
            </ParentCard>
            {/* Add Member Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>Yeni Ekip Üyesi Atama</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <CustomFormLabel>Personel Seçimi *</CustomFormLabel>
                            <KullaniciBoxAutocomplete
                                onSelectAdi={() => { }}
                                onSelectId={(id) => setKullaniciId(id)}
                            />
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 6
                            }}>
                            <CustomFormLabel>Ünvanı *</CustomFormLabel>
                            <UnvanBoxAutocomplete
                                onSelect={() => { }}
                                onSelectId={(id) => setUnvanId(id)}
                            />
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 6
                            }}>
                            <CustomFormLabel>Asil / Yedek *</CustomFormLabel>
                            <AsilYedekBoxAutocomplete onSelect={(val) => setAsilYedek(val)} />
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 4
                            }}>
                            <CustomFormLabel>Çalışma Saati</CustomFormLabel>
                            <CustomTextField
                                type="number"
                                fullWidth
                                size="small"
                                value={calismaSaati}
                                onChange={(e: any) => setCalismaSaati(e.target.value)}
                            />
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 4
                            }}>
                            <CustomFormLabel>Saat Ücreti</CustomFormLabel>
                            <CustomTextField
                                type="number"
                                fullWidth
                                size="small"
                                value={saatBasiUcreti}
                                onChange={(e: any) => setSaatBasiUcreti(e.target.value)}
                            />
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 4
                            }}>
                            <CustomFormLabel>Durum</CustomFormLabel>
                            <AktifPasifBoxAutocomplete
                                onSelect={(val) => setAktifPasif(val === "Aktif")}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenDialog(false)} disabled={savingMember}>İptal</Button>
                    <Button
                        onClick={handleAddMember}
                        variant="contained"
                        disabled={savingMember}
                        startIcon={savingMember ? <CircularProgress size={16} /> : <IconCheck size={18} />}
                    >
                        Kaydet ve Ekle
                    </Button>
                </DialogActions>
            </Dialog>
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                <Button variant="outlined" onClick={onBack} startIcon={<IconArrowLeft />}>Geri</Button>
                <Button variant="contained" color="primary" onClick={handleComplete} endIcon={<IconArrowRight />}>
                    Devam Et
                </Button>
            </Box>
        </Box>
    );
}

