"use client";

import {
    Box,
    Button,
    Grid,
    MenuItem,
    Tooltip,
    Fab,
    useTheme,
    useMediaQuery,
    CircularProgress,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    getDenetlenenById,
    updateDenetlenenDenetimTuru,
    TeklifHesapla,
} from "@/api/Musteri/MusteriIslemleri";
import { getDenetciOdemeBilgileri } from "@/api/Denetci/Denetci";
import {
    setBobimi,
    setDenetimTuru,
    setEnflasyonmu,
    setTfrsmi,
} from "@/store/user/UserSlice";
import CustomSelect from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSelect";
import { enqueueSnackbar } from "notistack";
import { IconExclamationMark, IconArrowLeft } from "@tabler/icons-react";

interface MusteriKabulStepProps {
    data?: any;
    sirket?: any;
    onDataChange: (data: any) => void;
    onComplete: () => void;
    onBack: () => void;
}

export default function MusteriKabulStep({
    data,
    sirket,
    onDataChange,
    onComplete,
    onBack,
}: MusteriKabulStepProps) {
    const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));
    const user = useSelector((state: AppState) => state.userReducer);
    const customizer = useSelector((state: AppState) => state.customizer);
    const theme = useTheme();
    const dispatch = useDispatch();

    const [tur, setTur] = useState(data?.tur || "Seçiniz");
    const [enflasyon, setEnflasyon] = useState(data?.enflasyon || "Hayır");
    const [yil, setYil] = useState<number>(data?.yil || new Date().getFullYear());

    const [kabulEdildimi, setKabulEdildimi] = useState(false);
    const [loading, setLoading] = useState(false);

    const [odemeBilgileriBobi, setOdemeBilgileriBobi] = useState(false);
    const [odemeBilgileriTfrs, setOdemeBilgileriTfrs] = useState(false);
    const [odemeBilgileriKumi, setOdemeBilgileriKumi] = useState(false);
    const [odemeBilgileriEnflasyon, setOdemeBilgileriEnflasyon] = useState(false);

    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];

    const fetchData = async () => {
        if (!sirket?.id) return;
        try {
            const denetlenenVerileri = await getDenetlenenById(
                user.token || "",
                sirket.id
            );
            if (denetlenenVerileri && denetlenenVerileri.denetimTuru) {
                setKabulEdildimi(true);
                setTur(denetlenenVerileri.denetimTuru);
                setEnflasyon(denetlenenVerileri.enflasyonMu ? "Evet" : "Hayır");
            }
        } catch (error) {
            console.error("Veri çekme hatası:", error);
        }
    };

    const fetchOdemeBilgileri = async () => {
        try {
            const response = await getDenetciOdemeBilgileri(
                user.token || "",
                user.denetciId || 0
            );
            if (response) {
                setOdemeBilgileriBobi(response.bobiModulu);
                setOdemeBilgileriTfrs(response.tfrsModulu);
                setOdemeBilgileriKumi(response.kumiModulu);
                setOdemeBilgileriEnflasyon(response.enflasyonModulu);
            }
        } catch (error) {
            console.error("Ödeme bilgileri hatası:", error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchOdemeBilgileri();
    }, [sirket?.id]);

    const handleDenetimeKabulEt = async () => {
        if (tur === "Seçiniz") {
            enqueueSnackbar("Denetim Türü Seçiniz", { variant: "warning" });
            return;
        }

        try {
            setLoading(true);
            const result = await updateDenetlenenDenetimTuru(
                user.token || "",
                sirket.id,
                tur,
                enflasyon
            );

            if (result === true) {
                // Run specific logic from page.tsx
                if (tur === "Bobi" || tur === "BobiBüyük") {
                    await dispatch(setBobimi(true));
                    await dispatch(setTfrsmi(false));
                }
                if (tur === "Tfrs" || tur === "TfrsDönemsel") {
                    await dispatch(setBobimi(false));
                    await dispatch(setTfrsmi(true));
                }
                await dispatch(setDenetimTuru(tur));
                await dispatch(setEnflasyonmu(enflasyon === "Evet"));


                enqueueSnackbar("Denetime Kabul Edildi", { variant: "success" });

                onDataChange({ tur, enflasyon, yil });

                setTimeout(() => {
                    onComplete();
                }, 500);
            } else {
                enqueueSnackbar((result as any)?.message || "Bir hata oluştu", { variant: "error" });
            }
        } catch (error) {
            console.error("Kabul işlemi hatası:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ width: "100%", p: 2 }}>
            <Typography variant="h5" sx={{ mb: 1 }}>Müşteri Kabul</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                <strong>{sirket?.firmaAdi || "Şirket"}</strong> için denetim türü (BOBİ, TFRS vb.) ve denetim yılını belirleyin. Bu seçimler hazırlayacağınız raporların formatını belirleyecektir.
            </Typography>
            <Typography variant="caption" color="primary.main" sx={{ display: "block", mb: 3, fontStyle: "italic" }}>
                * Denetim türü ve yıl tercihlerini daha sonra 'Müşteri İşlemleri {">"} Müşteri Detay' sayfasından değiştirebilirsiniz.
            </Typography>
            <Grid container spacing={2}>
                <Grid
                    sx={{
                        display: "flex",
                        flexDirection: smDown ? "column" : "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1.5,
                    }}
                    size={12}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            flexDirection: smDown ? "column" : "row",
                            gap: 1.5,
                            width: "100%",
                        }}
                    >
                        {/* Denetim Türü */}
                        <CustomSelect
                            labelId="tur"
                            id="tur"
                            size="small"
                            value={tur}
                            onChange={(e: any) => setTur(e.target.value)}
                            height={"36px"}
                            sx={{ flexGrow: 1 }}
                        >
                            <MenuItem value={"Seçiniz"}>Denetim Türü: Seçiniz</MenuItem>
                            {odemeBilgileriBobi && (
                                <MenuItem value={"Bobi"}>Denetim Türü: Bobi</MenuItem>
                            )}
                            {odemeBilgileriBobi && (
                                <MenuItem value={"BobiBüyük"}>
                                    Denetim Türü: Bobi Büyük
                                </MenuItem>
                            )}
                            {odemeBilgileriTfrs && (
                                <MenuItem value={"Tfrs"}>Denetim Türü: Tfrs</MenuItem>
                            )}
                            {odemeBilgileriTfrs && (
                                <MenuItem value={"TfrsDönemsel"}>
                                    Denetim Türü: Tfrs Dönemsel
                                </MenuItem>
                            )}
                            {odemeBilgileriKumi && (
                                <MenuItem value={"Kumi"}>Denetim Türü: Kümi</MenuItem>
                            )}
                            <MenuItem value={"ÖzelDenetim"}>
                                Denetim Türü: Özel Denetim
                            </MenuItem>
                        </CustomSelect>

                        {/* Enflasyon Düzeltmesi */}
                        {odemeBilgileriEnflasyon && (
                            <CustomSelect
                                labelId="enflasyon"
                                id="enflasyon"
                                size="small"
                                value={enflasyon}
                                onChange={(e: any) => setEnflasyon(e.target.value)}
                                height={"36px"}
                                sx={{ flexGrow: 1 }}
                            >
                                <MenuItem value={"Evet"}>
                                    Enflasyon Düzeltmesi: Evet
                                </MenuItem>
                                <MenuItem value={"Hayır"}>
                                    Enflasyon Düzeltmesi: Hayır
                                </MenuItem>
                            </CustomSelect>
                        )}

                        {/* Yıl Seçimi */}
                        <CustomSelect
                            labelId="yil"
                            id="yil"
                            size="small"
                            value={yil}
                            onChange={(e: any) => setYil(Number(e.target.value))}
                            height={"36px"}
                            sx={{ flexGrow: 1 }}
                        >
                            {years.map((y) => (
                                <MenuItem key={y} value={y}>Denetim Yılı: {y}</MenuItem>
                            ))}
                        </CustomSelect>

                        {/* Action Buttons */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                flexShrink: 0,
                            }}
                        >
                            {kabulEdildimi && (
                                <Tooltip title="Bu Firma Zaten Denetime Kabul Edildi">
                                    <Fab color="warning" size="small" sx={{ width: 36, height: 36, minHeight: 36 }}>
                                        <IconExclamationMark width={18} height={18} />
                                    </Fab>
                                </Tooltip>
                            )}
                            <Button
                                type="button"
                                size="medium"
                                disabled={loading}
                                variant="outlined"
                                color="primary"
                                onClick={handleDenetimeKabulEt}
                                sx={{ whiteSpace: "nowrap", height: "36px" }}
                            >
                                {loading ? <CircularProgress size={20} /> : "Denetime Kabul Et"}
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-start" }}>
                <Button
                    variant="text"
                    color="inherit"
                    onClick={onBack}
                    startIcon={<IconArrowLeft />}
                    disabled={loading}
                >
                    Geri Dön
                </Button>
            </Box>
        </Box>
    );
}
