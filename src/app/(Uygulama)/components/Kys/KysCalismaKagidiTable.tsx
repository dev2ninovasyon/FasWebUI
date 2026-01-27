"use client";
import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Divider,
    Grid,
    IconButton,
    Stack,
    Typography,
    Snackbar,
    Alert,
    CircularProgress,
} from "@mui/material";
import { IconX } from "@tabler/icons-react";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import {
    getMusteriBirakmaFormu,
    createMusteriBirakmaFormu,
    updateMusteriBirakmaFormu,
    deleteMusteriBirakmaFormu,
} from "@/api/Kys/MusteriBirakmaFormuApi";
import CalismaKagidiCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/CalismaKagidiCard";

interface Veri {
    id: number;
    konu: string;
    yorum: string;
    cozum?: string;
    denetlenenId?: number;
    yil?: number;
    standartMi?: boolean;
}

interface KysCalismaKagidiTableProps {
    formKodu: string;
    alanAdi: string;
}

const KysCalismaKagidiTable: React.FC<KysCalismaKagidiTableProps> = ({
    formKodu,
    alanAdi,
}) => {
    const user = useSelector((state: AppState) => state.userReducer);

    const [veriler, setVeriler] = useState<Veri[]>([]);
    const [selectedId, setSelectedId] = useState(0);
    const [selectedKonu, setSelectedKonu] = useState("");
    const [selectedYorum, setSelectedYorum] = useState("");
    const [selectedCozum, setSelectedCozum] = useState("");

    const [isNew, setIsNew] = useState(false);
    const [isPopUpOpen, setIsPopUpOpen] = useState(false);

    // Loading states
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Snackbar states
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const fetchData = async () => {
        try {
            const result = await getMusteriBirakmaFormu(
                user.token || "",
                user.denetlenenId || 0,
                user.yil || 0
            );
            setVeriler(result);
        } catch (error) {
            console.log("Veri getirme hatası:", error);
        }
    };

    const handleCreate = async (konu: string, yorum: string, cozum: string) => {
        setSaving(true);
        const newData = {
            konu: konu,
            yorum: yorum,
            cozum: cozum,
            denetlenenId: user.denetlenenId,
            yil: user.yil,
            standartMi: false,
        };
        try {
            await createMusteriBirakmaFormu(user.token || "", newData);
            await fetchData();
            setSaving(false);
            handleClosePopUp();
            showSnackbar("Kayıt başarıyla oluşturuldu.", "success");
        } catch (error) {
            console.log("Ekleme hatası:", error);
            setSaving(false);
            showSnackbar("Kayıt oluşturulurken bir hata oluştu.", "error");
        }
    };

    const handleUpdate = async (konu: string, yorum: string, cozum: string) => {
        setSaving(true);
        const updateData = {
            konu: konu,
            yorum: yorum,
            cozum: cozum,
            standartMi: false,
        };
        try {
            await updateMusteriBirakmaFormu(user.token || "", selectedId, updateData);
            await fetchData();
            setSaving(false);
            handleClosePopUp();
            showSnackbar("Kayıt başarıyla güncellendi.", "success");
        } catch (error) {
            console.log("Güncelleme hatası:", error);
            setSaving(false);
            showSnackbar("Kayıt güncellenirken bir hata oluştu. Kayıt bulunamamış olabilir.", "error");
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteMusteriBirakmaFormu(user.token || "", selectedId);
            await fetchData();
            setDeleting(false);
            handleClosePopUp();
            showSnackbar("Kayıt başarıyla silindi.", "success");
        } catch (error) {
            console.log("Silme hatası:", error);
            setDeleting(false);
            showSnackbar("Kayıt silinirken bir hata oluştu.", "error");
        }
    };

    const handleRowClick = (veri: Veri) => {
        setSelectedId(veri.id);
        setSelectedKonu(veri.konu || "");
        setSelectedYorum(veri.yorum || "");
        setSelectedCozum(veri.cozum || "");
        setIsNew(false);
        setIsPopUpOpen(true);
    };

    const handleNew = () => {
        setSelectedId(0);
        setSelectedKonu("");
        setSelectedYorum("");
        setSelectedCozum("");
        setIsNew(true);
        setIsPopUpOpen(true);
    };

    const handleClosePopUp = () => {
        setIsPopUpOpen(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
            <Grid container>
                <Grid
                    container
                    sx={{
                        width: "95%",
                        margin: "0 auto",
                        justifyContent: "center",
                    }}
                >
                    {veriler.map((veri, index) => (
                        <Grid
                            key={index}
                            mt="20px"
                            onClick={() => handleRowClick(veri)}
                            size={{
                                xs: 12,
                                lg: 12
                            }}>
                            <CalismaKagidiCard
                                title={`${index + 1}. ${veri.konu}`}
                                standartMi={veri.standartMi}
                            />
                        </Grid>
                    ))}
                </Grid>
                <Grid
                    container
                    sx={{
                        width: "95%",
                        margin: "0 auto",
                        justifyContent: "end",
                    }}
                >
                    <Grid
                        my={2}
                        sx={{
                            display: "flex",
                            justifyContent: "end",
                        }}
                        size={{
                            xs: 12,
                            lg: 1.5
                        }}>
                        <Button
                            size="medium"
                            variant="outlined"
                            color="primary"
                            onClick={handleNew}
                            sx={{
                                width: "100%",
                            }}
                        >
                            <Typography
                                variant="body1"
                                sx={{
                                    overflowWrap: "break-word",
                                    wordWrap: "break-word",
                                }}
                            >
                                Yeni İşlem Ekle
                            </Typography>
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
            {isPopUpOpen && (
                <PopUpComponent
                    konu={selectedKonu}
                    yorum={selectedYorum}
                    cozum={selectedCozum}
                    alanAdi={alanAdi}
                    isPopUpOpen={isPopUpOpen}
                    isNew={isNew}
                    saving={saving}
                    deleting={deleting}
                    handleClose={handleClosePopUp}
                    handleCreate={handleCreate}
                    handleDelete={handleDelete}
                    handleUpdate={handleUpdate}
                />
            )}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    sx={{ width: "100%" }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default KysCalismaKagidiTable;

interface PopUpProps {
    konu: string;
    yorum: string;
    cozum: string;
    alanAdi: string;
    isPopUpOpen: boolean;
    isNew: boolean;
    saving: boolean;
    deleting: boolean;

    handleClose: () => void;
    handleCreate: (konu: string, yorum: string, cozum: string) => void;
    handleDelete: () => void;
    handleUpdate: (konu: string, yorum: string, cozum: string) => void;
}

const PopUpComponent: React.FC<PopUpProps> = ({
    konu,
    yorum,
    cozum,
    alanAdi,
    isPopUpOpen,
    isNew,
    saving,
    deleting,
    handleClose,
    handleCreate,
    handleDelete,
    handleUpdate,
}) => {
    const [localKonu, setLocalKonu] = useState(konu);
    const [localYorum, setLocalYorum] = useState(yorum);
    const [localCozum, setLocalCozum] = useState(cozum);

    const AnyLoading = saving || deleting;

    return (
        <Dialog fullWidth maxWidth={"md"} open={isPopUpOpen} onClose={handleClose}>
            <DialogContent sx={{ overflow: "visible" }}>
                <Stack
                    direction="row"
                    spacing={2}
                    justifyContent={"space-between"}
                    alignItems="center"
                >
                    <Typography variant="h4" py={1} px={3}>
                        {isNew ? "Yeni Ekle" : "Düzenle"}
                    </Typography>
                    <IconButton size="small" onClick={handleClose} disabled={AnyLoading}>
                        <IconX size="18" />
                    </IconButton>
                </Stack>
            </DialogContent>
            <Divider />
            <DialogContent>
                <Box px={3} pt={1}>
                    <Typography variant="h5" p={1}>
                        {alanAdi}
                    </Typography>

                    <Typography variant="subtitle1" p={1}>
                        Konu
                    </Typography>
                    <CustomTextField
                        multiline
                        rows={2}
                        fullWidth
                        value={localKonu}
                        onChange={(e: any) => setLocalKonu(e.target.value)}
                        disabled={AnyLoading}
                    />

                    <Typography variant="subtitle1" p={1} mt={2}>
                        Yorum / Nasıl yapıldı?
                    </Typography>
                    <CustomTextField
                        multiline
                        rows={3}
                        fullWidth
                        value={localYorum}
                        onChange={(e: any) => setLocalYorum(e.target.value)}
                        disabled={AnyLoading}
                    />

                    <Typography variant="subtitle1" p={1} mt={2}>
                        Çözüldü
                    </Typography>
                    <CustomTextField
                        multiline
                        rows={3}
                        fullWidth
                        value={localCozum}
                        onChange={(e: any) => setLocalCozum(e.target.value)}
                        disabled={AnyLoading}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ justifyContent: "center", mb: "15px", px: 3, alignItems: "center" }}>
                <Box display="flex" justifyContent="center" gap={2}>
                    <Button
                        variant="outlined"
                        color="success"
                        onClick={() =>
                            isNew
                                ? handleCreate(localKonu, localYorum, localCozum)
                                : handleUpdate(localKonu, localYorum, localCozum)
                        }
                        sx={{ width: "120px" }}
                        disabled={AnyLoading}
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {saving ? "Kaydediliyor..." : "Kaydet"}
                    </Button>
                    {!isNew && (
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleDelete}
                            sx={{ width: "120px" }}
                            disabled={AnyLoading}
                            startIcon={deleting ? <CircularProgress size={20} color="inherit" /> : null}
                        >
                            {deleting ? "Siliniyor..." : "Sil"}
                        </Button>
                    )}
                </Box>
            </DialogActions>
        </Dialog>
    );
};
