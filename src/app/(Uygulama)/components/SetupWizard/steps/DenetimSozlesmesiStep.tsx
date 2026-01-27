"use client";

import dynamic from "next/dynamic";
import {
    Button,
    Fab,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    Box,
    CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import { useEffect, useState } from "react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    getCalismaKagidiVerileriByDenetciDenetlenenYil,
} from "@/api/CalismaKagitlari/CalismaKagitlari";
import { IconExclamationMark, IconArrowLeft, IconCheck } from "@tabler/icons-react";
import { getGorevAtamalariByDenetlenenIdYil } from "@/api/Sozlesme/DenetimKadrosuAtama";

const CustomEditorWVeri = dynamic(
    () => import("@/app/(Uygulama)/components/Editor/CustomEditorWVeri"),
    { ssr: false }
);

interface Veri {
    id: number;
    metin: string;
}

interface DenetimSozlesmesiStepProps {
    data?: any;
    sirket?: any;
    onDataChange: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function DenetimSozlesmesiStep({
    data,
    sirket,
    onDataChange,
    onNext,
    onBack,
}: DenetimSozlesmesiStepProps) {
    const user = useSelector((state: AppState) => state.userReducer);
    const theme = useTheme();

    const [sozlesmeTarihi, setSozlesmeTarihi] = useState<string>("");
    const [tempSozlesmeTarihi, setTempSozlesmeTarihi] = useState("");
    const [veriler, setVeriler] = useState<Veri[]>([]);
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const controller = "DenetimSozlesmesi";

    const fetchData = async () => {
        if (!sirket?.id) return;
        try {
            setLoading(true);
            const sozlesmeVerileri = await getCalismaKagidiVerileriByDenetciDenetlenenYil(
                controller,
                user.token || "",
                user.denetciId || 0,
                sirket.id,
                user.yil || 0
            );

            if (sozlesmeVerileri?.length > 0) {
                const date = sozlesmeVerileri[0].sozlesmeTarihi?.split("T")[0] || "";
                setTempSozlesmeTarihi(date);
                setSozlesmeTarihi(date);

                const newVeri = sozlesmeVerileri.map((veri: any) => ({
                    id: veri.id,
                    metin: veri.metin,
                }));
                setVeriler(newVeri);
            }
        } catch (error) {
            console.error("Sözleşme verileri çekilirken hata:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeamData = async () => {
        if (!sirket?.id) return;
        try {
            const teamData = await getGorevAtamalariByDenetlenenIdYil(
                user.token || "",
                sirket.id,
                user.yil || 0
            );
            setRows(teamData || []);
        } catch (error) {
            console.error("Ekip verileri çekilirken hata:", error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchTeamData();
    }, [sirket?.id, user.yil]);

    const handleComplete = () => {
        onDataChange({
            sozlesmeTarihi,
            veriler,
        });
        onNext();
    };

    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                    <Typography variant="h5">Bağımsız Denetim Sözleşmesi</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        <strong>{sirket?.firmaAdi || "Şirket"}</strong> için denetim sözleşmesini hazırlayın. Sözleşme tarihi ve içeriği otomatik şablon üzerinden oluşturulacaktır.
                    </Typography>
                    <Typography variant="caption" color="primary.main" sx={{ display: "block", mb: 2, fontStyle: "italic" }}>
                        * Sözleşme metnini ve tarihini daha sonra 'Denetim Sözleşmesi' menüsünden dilediğiniz zaman yeniden düzenleyebilirsiniz.
                    </Typography>
                </Box>
            </Box>
            <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: "divider", mb: 2 }}>
                <Grid container spacing={3}>
                    <Grid display="flex" alignItems="center" justifyContent="center" size={12}>
                        <CustomFormLabel htmlFor="sozlesmeTarihi" sx={{ mt: 0, mb: 0, mr: 2 }}>
                            Sözleşme Tarihi:
                        </CustomFormLabel>
                        <CustomTextField
                            id="sozlesmeTarihi"
                            type="date"
                            value={tempSozlesmeTarihi}
                            onChange={(e: any) => setTempSozlesmeTarihi(e.target.value)}
                            onBlur={() => setSozlesmeTarihi(tempSozlesmeTarihi)}
                            size="small"
                        />
                        <Tooltip title="Sözleşme Tarihi Girmeyi Unutmayınız">
                            <Fab color="warning" size="small" sx={{ ml: 2, minHeight: 32, width: 32, height: 32 }}>
                                <IconExclamationMark size={18} />
                            </Fab>
                        </Tooltip>
                    </Grid>

                    {loading ? (
                        <Grid textAlign="center" size={12}>
                            <CircularProgress />
                        </Grid>
                    ) : (
                        <>
                            {sozlesmeTarihi && veriler.length > 0 && (
                                <Grid size={12}>
                                    <CustomEditorWVeri
                                        controller={controller}
                                        veri={veriler[0]}
                                        sozlesmeTarihi={sozlesmeTarihi}
                                    />
                                </Grid>
                            )}

                            {/* Team Tables Replicated from page.tsx */}
                            {rows.filter((row: any) => row.asilYedek === "Asil").length > 0 && (
                                <Grid size={12}>
                                    <Typography variant="h6" textAlign="center" mb={1}>Bağımsız Denetim Ekibi</Typography>
                                    <TableContainer component={Paper} variant="outlined" sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : "primary.light" }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="center">Adı Soyadı</TableCell>
                                                    <TableCell align="center">Ünvan</TableCell>
                                                    <TableCell align="center">Saat / Ücret</TableCell>
                                                    <TableCell align="center">Denetim Ücreti</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {rows.filter((row: any) => row.asilYedek === "Asil").map((row, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell align="center" sx={{ border: "none" }}>{row.kullaniciAdi}</TableCell>
                                                        <TableCell align="center" sx={{ border: "none" }}>{row.unvanAdi}</TableCell>
                                                        <TableCell align="center" sx={{ border: "none" }}>{row.calismaSaati} / {row.saatBasiUcreti}</TableCell>
                                                        <TableCell align="center" sx={{ border: "none" }}>{row.denetimUcreti}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            )}

                            {rows.filter((row: any) => row.asilYedek === "Yedek").length > 0 && (
                                <Grid size={12}>
                                    <Typography variant="h6" textAlign="center" mb={1}>Yedek Bağımsız Denetçiler</Typography>
                                    <TableContainer component={Paper} variant="outlined" sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : "primary.light" }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="center">Adı Soyadı</TableCell>
                                                    <TableCell align="center">Ünvan</TableCell>
                                                    <TableCell align="center">Saat / Ücret</TableCell>
                                                    <TableCell align="center">Denetim Ücreti</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {rows.filter((row: any) => row.asilYedek === "Yedek").map((row, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell align="center" sx={{ border: "none" }}>{row.kullaniciAdi}</TableCell>
                                                        <TableCell align="center" sx={{ border: "none" }}>{row.unvanAdi}</TableCell>
                                                        <TableCell align="center" sx={{ border: "none" }}>{row.calismaSaati} / {row.saatBasiUcreti}</TableCell>
                                                        <TableCell align="center" sx={{ border: "none" }}>{row.denetimUcreti}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            )}

                            {sozlesmeTarihi && veriler.length > 1 && (
                                <Grid size={12}>
                                    <CustomEditorWVeri
                                        controller={controller}
                                        veri={veriler[1]}
                                        sozlesmeTarihi={sozlesmeTarihi}
                                    />
                                </Grid>
                            )}
                        </>
                    )}
                </Grid>
            </Paper>
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
                <Button variant="outlined" onClick={onBack} startIcon={<IconArrowLeft />}>Geri</Button>
                <Button
                    variant="contained"
                    color="success"
                    onClick={handleComplete}
                    endIcon={<IconCheck />}
                    disabled={loading || !sozlesmeTarihi}
                >
                    Kurulumu Tamamla
                </Button>
            </Box>
        </Box>
    );
}
