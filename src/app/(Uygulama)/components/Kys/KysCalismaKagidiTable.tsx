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
} from "@mui/material";
import { IconX } from "@tabler/icons-react";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import {
    getKysBelgeler,
    createKysBelge,
    updateKysBelge,
    deleteKysBelge,
} from "@/api/Kys/KysBelgelerApi";
import CalismaKagidiCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/CalismaKagidiCard";

interface Veri {
    id: number;
    islem: string;
    tespit: string;
    cozum?: string; // 3. field: Çözüldü
    formKodu: string;
    denetlenenId?: number;
    yil?: number;
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
    const [selectedIslem, setSelectedIslem] = useState("");
    const [selectedTespit, setSelectedTespit] = useState("");
    const [selectedCozum, setSelectedCozum] = useState("");

    const [isNew, setIsNew] = useState(false);
    const [isPopUpOpen, setIsPopUpOpen] = useState(false);

    const fetchData = async () => {
        try {
            const result = await getKysBelgeler(
                user.token || "",
                formKodu,
                user.denetlenenId || 0,
                user.yil || 0
            );
            setVeriler(result);
        } catch (error) {
            console.error("Veri getirme hatası:", error);
        }
    };

    const handleCreate = async (islem: string, tespit: string, cozum: string) => {
        const newData = {
            formKodu: formKodu,
            islem: islem,
            tespit: tespit,
            cozum: cozum,
            denetlenenId: user.denetlenenId,
            yil: user.yil,
            belgeAdi: alanAdi,
        };
        try {
            await createKysBelge(user.token || "", newData);
            fetchData();
            handleClosePopUp();
        } catch (error) {
            console.error("Ekleme hatası:", error);
        }
    };

    const handleUpdate = async (islem: string, tespit: string, cozum: string) => {
        const updateData = {
            islem: islem,
            tespit: tespit,
            cozum: cozum,
        };
        try {
            await updateKysBelge(user.token || "", selectedId, updateData);
            fetchData();
            handleClosePopUp();
        } catch (error) {
            console.error("Güncelleme hatası:", error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteKysBelge(user.token || "", selectedId);
            fetchData();
            handleClosePopUp();
        } catch (error) {
            console.error("Silme hatası:", error);
        }
    };

    const handleRowClick = (veri: Veri) => {
        setSelectedId(veri.id);
        setSelectedIslem(veri.islem || "");
        setSelectedTespit(veri.tespit || "");
        setSelectedCozum(veri.cozum || "");
        setIsNew(false);
        setIsPopUpOpen(true);
    };

    const handleNew = () => {
        setSelectedId(0);
        setSelectedIslem("");
        setSelectedTespit("");
        setSelectedCozum("");
        setIsNew(true);
        setIsPopUpOpen(true);
    };

    const handleClosePopUp = () => {
        setIsPopUpOpen(false);
    };

    useEffect(() => {
        fetchData();
    }, [formKodu]);

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
                            item
                            xs={12}
                            lg={12}
                            mt="20px"
                            onClick={() => handleRowClick(veri)}
                        >
                            <CalismaKagidiCard
                                title={`${index + 1}. ${veri.islem}`}
                                standartMi={true}
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
                        item
                        xs={12}
                        lg={1.5}
                        my={2}
                        sx={{
                            display: "flex",
                            justifyContent: "end",
                        }}
                    >
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
                    islem={selectedIslem}
                    tespit={selectedTespit}
                    cozum={selectedCozum}
                    alanAdi={alanAdi}
                    isPopUpOpen={isPopUpOpen}
                    isNew={isNew}
                    handleClose={handleClosePopUp}
                    handleCreate={handleCreate}
                    handleDelete={handleDelete}
                    handleUpdate={handleUpdate}
                />
            )}
        </>
    );
};

export default KysCalismaKagidiTable;

interface PopUpProps {
    islem: string;
    tespit: string;
    cozum: string;
    alanAdi: string;
    isPopUpOpen: boolean;
    isNew: boolean;

    handleClose: () => void;
    handleCreate: (islem: string, tespit: string, cozum: string) => void;
    handleDelete: () => void;
    handleUpdate: (islem: string, tespit: string, cozum: string) => void;
}

const PopUpComponent: React.FC<PopUpProps> = ({
    islem,
    tespit,
    cozum,
    alanAdi,
    isPopUpOpen,
    isNew,
    handleClose,
    handleCreate,
    handleDelete,
    handleUpdate,
}) => {
    const [localIslem, setLocalIslem] = useState(islem);
    const [localTespit, setLocalTespit] = useState(tespit);
    const [localCozum, setLocalCozum] = useState(cozum);

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
                    <IconButton size="small" onClick={handleClose}>
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
                        value={localIslem}
                        onChange={(e: any) => setLocalIslem(e.target.value)}
                    />

                    <Typography variant="subtitle1" p={1} mt={2}>
                        Yorum / Nasıl yapıldı?
                    </Typography>
                    <CustomTextField
                        multiline
                        rows={3}
                        fullWidth
                        value={localTespit}
                        onChange={(e: any) => setLocalTespit(e.target.value)}
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
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
                <Button
                    variant="outlined"
                    color="success"
                    onClick={() =>
                        isNew
                            ? handleCreate(localIslem, localTespit, localCozum)
                            : handleUpdate(localIslem, localTespit, localCozum)
                    }
                    sx={{ width: "20%" }}
                >
                    Kaydet
                </Button>
                {!isNew && (
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleDelete}
                        sx={{ width: "20%" }}
                    >
                        Sil
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};
