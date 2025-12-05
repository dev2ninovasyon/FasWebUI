import { Grid, Button, MenuItem, Box, Snackbar, Alert, CircularProgress } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    createDenetlenen,
    updateDenetlenen,
    getDenetlenenKonsolideAnaSirketByDenetciId,
    getSektorKodlari,
} from "@/api/Musteri/MusteriIslemleri";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import CustomSelect from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSelect";
import { FloatingButtonMusteriIslemleri } from "@/app/(Uygulama)/components/CalismaKagitlari/FloatingButtonMusteriIslemleri";
import Autocomplete from "@mui/material/Autocomplete";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";

interface Veri {
    id: number;
    firmaAdi: string;
}
interface Veri2 {
    id: number;
    adi: string;
    kirilim: number;
    parentId: number | null;
}

interface MusteriStepProps {
    data?: any;
    onDataChange: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function MusteriStep({
    data,
    onDataChange,
    onNext,
    onBack,
}: MusteriStepProps) {
    const [firmaAdi, setFirmaAdi] = useState(data?.unvan || "");
    const [yetkili, setYetkili] = useState(data?.yetkili || "");
    const [tel, setTel] = useState(data?.telefon || "");
    const [adres, setAdres] = useState(data?.adres || "");
    const [email, setEmail] = useState(data?.email || "");
    const [webAdresi, setWebAdresi] = useState(data?.webAdresi || "");
    const [ticaretSicilNo, setTicaretSicilNo] = useState(data?.ticaretSicilNo || "");
    const [vergiDairesi, setVergiDairesi] = useState(data?.vergiDairesi || "");
    const [vergiNo, setVergiNo] = useState(data?.vergiNo || "");
    const [konsolideMi, setKonsolideMi] = useState(data?.konsolideMi || "Hayır");
    const [konsolideTipi, setKonsolideTipi] = useState(data?.konsolideTipi || "Ana Şirket");
    const [konsolideBagliSirketId, setKonsolideBagliSirketId] = useState(data?.konsolideBagliSirketId || 0);
    const [sektor1Id, setSektor1Id] = useState(data?.sektor1Id || 0);
    const [sektor2Id, setSektor2Id] = useState(data?.sektor2Id || 0);
    const [sektor3Id, setSektor3Id] = useState(data?.sektor3Id || 0);

    const [sektor1List, setSektor1List] = useState<Veri2[]>([]);
    const [sektor2List, setSektor2List] = useState<Veri2[]>([]);
    const [sektor3List, setSektor3List] = useState<Veri2[]>([]);

    const [isHovered, setIsHovered] = useState(false);
    const [control, setControl] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const textFieldRef = useRef<HTMLInputElement | null>(null);

    const user = useSelector((state: AppState) => state.userReducer);
    const denetciId = user.denetciId;
    const [rows, setRows] = useState<Veri[]>([]);

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleAiClear = () => {
        setFirmaAdi("");
        setYetkili("");
        setTel("");
        setAdres("");
        setEmail("");
        setTicaretSicilNo("");
        setVergiDairesi("");
    };

    // TR duyarlı, geniş destekli "normalize + diakritik temizleme"
    const trFold = (s: string) =>
        (s || "")
            .toLocaleLowerCase("tr")     // İ/ı kuralları için TR lower
            .normalize("NFD")            // harf + kombine işaretlerine ayır
            .replace(/[\u0300-\u036f]/g, "") // kombine işaretlerini sil (geniş uyumlu)
            .replace(/ı/g, "i");         // TR eşleştirme toleransı (I→ı→i)

    const filterOptions = (opts: Veri2[], params: any) => {
        const q = trFold(params.inputValue);
        return opts.filter((o) => trFold(o.adi).includes(q) || `${o.id}`.includes(q));
    };

    const handleAiJson = (aiData: any) => {
        if (!aiData || aiData.hata) return;

        setFirmaAdi(aiData.sirketAdi ?? "");
        setTel(aiData?.iletisim?.telefon ?? "");
        setEmail(aiData?.iletisim?.eposta ?? "");
        setAdres(aiData?.iletisim?.adres ?? "");
        setVergiDairesi(aiData?.vergiDairesi ?? "");
        setVergiNo(aiData?.vergiNo ?? "");
        setTicaretSicilNo(aiData?.ticaretSicilNo ?? "");

        showSnackbar("Web sitesinden şirket bilgileri çekildi.", "success");
    };

    const handleControl = () => setControl(true);

    const handleButtonClick = async () => {
        const createdMusteri = {
            denetciId,
            firmaAdi,
            yetkili,
            tel,
            adres,
            email,
            webAdresi,
            ticaretSicilNo,
            vergiDairesi,
            vergiNo,
            konsolideMi,
            konsolideTipi,
            konsolideBagliSirketId,
            sektor1Id,
            sektor2Id,
            sektor3Id,
        };

        setLoading(true);
        try {
            let success = false;
            let savedData: any = createdMusteri;

            if (data?.id) {
                success = await updateDenetlenen(user.token!, data.id, createdMusteri) as any;
                savedData = { ...createdMusteri, id: data.id };
            } else {
                const result: any = await createDenetlenen(user.token!, createdMusteri);
                success = !!result;
                if (result && result.id) {
                    savedData = { ...createdMusteri, id: result.id };
                }
            }

            if (success) {
                showSnackbar("Müşteri başarıyla kaydedildi", "success");
                onDataChange(savedData);
                setTimeout(() => onNext(), 500);
            } else {
                showSnackbar("Müşteri kaydedilemedi. Lütfen tekrar deneyin.", "error");
            }
        } catch (error) {
            console.error("Müşteri kaydetme hatası:", error);
            showSnackbar("Bir hata oluştu. Lütfen tekrar deneyin.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSektor = async (id: number) => {
        try {
            const sektor3 = sektor3List.find((s3) => s3.id === id);
            if (!sektor3) return;
            setSektor3Id(id);

            const sektor2 = sektor2List.find((s2) => s2.id === sektor3?.parentId);
            if (!sektor2) return;
            setSektor2Id(sektor2.id);

            const sektor1 = sektor1List.find((s1) => s1.id === sektor2?.parentId);
            if (!sektor1) return;
            setSektor1Id(sektor1.id);
        } catch (error) {
            console.error("Bir hata oluştu:", error);
        }
    };

    const fetchData = async () => {
        try {
            const konsolideAnaSirketVerileri =
                await getDenetlenenKonsolideAnaSirketByDenetciId(
                    user.token || "",
                    user.denetciId || 0
                );
            const newRows = konsolideAnaSirketVerileri.map((musteri: any) => ({
                id: musteri.id,
                firmaAdi: musteri.firmaAdi,
            }));
            setRows(newRows);
        } catch (error) {
            console.error("Bir hata oluştu:", error);
        }
    };

    const fetchData2 = async () => {
        try {
            const sektorKodVerileri = await getSektorKodlari(user.token || "");
            const newRows = sektorKodVerileri.map((kod: any) => ({
                id: kod.id,
                adi: kod.adi,
                kirilim: kod.kirilim,
                parentId: kod.parentId ?? null,
            }));
            if (newRows.length > 0) {
                setSektor1List(newRows.filter((item: Veri2) => item.kirilim === 1));
                setSektor2List(newRows.filter((item: Veri2) => item.kirilim === 2));
                setSektor3List(newRows.filter((item: Veri2) => item.kirilim === 3));
            }
        } catch (error) {
            console.error("Bir hata oluştu:", error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchData2();
    }, []);

    useEffect(() => {
        if (isHovered && textFieldRef.current) textFieldRef.current.focus();
        else if (!isHovered && textFieldRef.current) textFieldRef.current.blur();
    }, [isHovered]);

    return (
        <Box>
            <Grid container spacing={2}>
                {/* Web Adresi */}
                <Grid item xs={12} sm={3} display="flex" alignItems="center">
                    <CustomFormLabel htmlFor="webAdresi" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                        Web Adresi
                    </CustomFormLabel>
                </Grid>
                <Grid item xs={12} sm={9}>
                    <CustomTextField
                        id="webAdresi"
                        fullWidth
                        value={webAdresi}
                        onChange={(e: any) => setWebAdresi(e.target.value)}
                        inputRef={textFieldRef}
                    />
                </Grid>

                {/* Firma Adı */}
                <Grid item xs={12} sm={3} display="flex" alignItems="center">
                    <CustomFormLabel htmlFor="firmaAdi" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                        Firma Adı
                    </CustomFormLabel>
                </Grid>
                <Grid item xs={12} sm={9}>
                    <CustomTextField
                        id="firmaAdi"
                        fullWidth
                        value={firmaAdi}
                        onChange={(e: any) => setFirmaAdi(e.target.value)}
                    />
                </Grid>

                {/* Yetkili */}
                <Grid item xs={12} sm={3} display="flex" alignItems="center">
                    <CustomFormLabel htmlFor="yetkili" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                        Yetkili
                    </CustomFormLabel>
                </Grid>
                <Grid item xs={12} sm={9}>
                    <CustomTextField
                        id="yetkili"
                        fullWidth
                        value={yetkili}
                        onChange={(e: any) => setYetkili(e.target.value)}
                    />
                </Grid>

                {/* Telefon */}
                <Grid item xs={12} sm={3} display="flex" alignItems="center">
                    <CustomFormLabel htmlFor="tel" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                        Telefon
                    </CustomFormLabel>
                </Grid>
                <Grid item xs={12} sm={9}>
                    <CustomTextField id="tel" fullWidth value={tel} onChange={(e: any) => setTel(e.target.value)} />
                </Grid>

                {/* Adres */}
                <Grid item xs={12} sm={3} display="flex" alignItems="center">
                    <CustomFormLabel htmlFor="adres" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                        Adres
                    </CustomFormLabel>
                </Grid>
                <Grid item xs={12} sm={9}>
                    <CustomTextField id="adres" fullWidth value={adres} onChange={(e: any) => setAdres(e.target.value)} />
                </Grid>

                {/* Email */}
                <Grid item xs={12} sm={3} display="flex" alignItems="center">
                    <CustomFormLabel htmlFor="email" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                        Email
                    </CustomFormLabel>
                </Grid>
                <Grid item xs={12} sm={9}>
                    <CustomTextField id="email" fullWidth value={email} onChange={(e: any) => setEmail(e.target.value)} />
                </Grid>

                {/* Ticaret Sicil No */}
                <Grid item xs={12} sm={3} display="flex" alignItems="center">
                    <CustomFormLabel htmlFor="ticaretSicilNo" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                        Ticaret Sicil No
                    </CustomFormLabel>
                </Grid>
                <Grid item xs={12} sm={9}>
                    <CustomTextField
                        id="ticaretSicilNo"
                        fullWidth
                        value={ticaretSicilNo}
                        onChange={(e: any) => setTicaretSicilNo(e.target.value)}
                    />
                </Grid>

                {/* Vergi Dairesi */}
                <Grid item xs={12} sm={3} display="flex" alignItems="center">
                    <CustomFormLabel htmlFor="vergiDairesi" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                        Vergi Dairesi
                    </CustomFormLabel>
                </Grid>
                <Grid item xs={12} sm={9}>
                    <CustomTextField
                        id="vergiDairesi"
                        fullWidth
                        value={vergiDairesi}
                        onChange={(e: any) => setVergiDairesi(e.target.value)}
                    />
                </Grid>

                {/* Vergi No */}
                <Grid item xs={12} sm={3} display="flex" alignItems="center">
                    <CustomFormLabel htmlFor="vergiNo" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                        Vergi No
                    </CustomFormLabel>
                </Grid>
                <Grid item xs={12} sm={9}>
                    <CustomTextField id="vergiNo" fullWidth value={vergiNo} onChange={(e: any) => setVergiNo(e.target.value)} />
                </Grid>

                {/* Konsolide Mi */}
                <Grid item xs={12} sm={3} display="flex" alignItems="center">
                    <CustomFormLabel htmlFor="konsolideMi" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                        Konsolide Mi
                    </CustomFormLabel>
                </Grid>
                <Grid item xs={12} sm={9}>
                    <CustomSelect
                        labelId="konsolideMi"
                        id="konsolideMi"
                        size="small"
                        value={konsolideMi}
                        fullWidth
                        onChange={(e: any) => setKonsolideMi(e.target.value)}
                        sx={{
                            minWidth: 120,
                            "& .MuiSelect-select": { height: "28px", display: "flex", alignItems: "center" },
                        }}
                    >
                        <MenuItem value={"Evet"}>Evet</MenuItem>
                        <MenuItem value={"Hayır"}>Hayır</MenuItem>
                    </CustomSelect>
                </Grid>

                {/* Konsolide Tipi - Evet ise */}
                {konsolideMi === "Evet" && (
                    <>
                        <Grid item xs={12} sm={3} display="flex" alignItems="center">
                            <CustomFormLabel htmlFor="konsolideTipi" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                                Konsolide Tipi
                            </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12} sm={9}>
                            <CustomSelect
                                labelId="konsolideTipi"
                                id="konsolideTipi"
                                size="small"
                                value={konsolideTipi}
                                fullWidth
                                onChange={(e: any) => setKonsolideTipi(e.target.value)}
                                sx={{ minWidth: 120, "& .MuiSelect-select": { height: "28px", display: "flex", alignItems: "center" } }}
                            >
                                <MenuItem value={"Ana Şirket"}>Ana Şirket</MenuItem>
                                <MenuItem value={"Alt Şirket"}>Alt Şirket</MenuItem>
                                <MenuItem value={"Yavru Şirket"}>Yavru Şirket</MenuItem>
                            </CustomSelect>
                        </Grid>
                    </>
                )}

                {/* Konsolide bağlı şirket - alt/yavru ise */}
                {konsolideMi === "Evet" &&
                    (konsolideTipi == "Alt Şirket" || konsolideTipi == "Yavru Şirket") && (
                        <>
                            <Grid item xs={12} sm={3} display="flex" alignItems="center">
                                <CustomFormLabel htmlFor="konsolideBagliSirketId" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                                    Konsolide Bağlı Olduğu Şirket
                                </CustomFormLabel>
                            </Grid>
                            <Grid item xs={12} sm={9}>
                                <CustomSelect
                                    labelId="konsolideBagliSirketId"
                                    id="konsolideBagliSirketId"
                                    size="small"
                                    value={konsolideBagliSirketId}
                                    fullWidth
                                    onChange={(e: any) => setKonsolideBagliSirketId(e.target.value)}
                                    sx={{ minWidth: 120, "& .MuiSelect-select": { height: "28px", display: "flex", alignItems: "center" } }}
                                >
                                    <MenuItem key={0} value={0}></MenuItem>
                                    {rows.map((row: Veri) => (
                                        <MenuItem key={row.id} value={row.id}>{row.firmaAdi}</MenuItem>
                                    ))}
                                </CustomSelect>
                            </Grid>
                        </>
                    )}

                {/* Sektörler */}
                <Grid item xs={12} sm={3} display="flex" alignItems="center">
                    <CustomFormLabel htmlFor="sektor1Id" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                        Sektör 1
                    </CustomFormLabel>
                </Grid>
                <Grid item xs={12} sm={9}>
                    <CustomSelect
                        labelId="sektor1Id"
                        id="sektor1Id"
                        size="small"
                        value={sektor1Id}
                        fullWidth
                        disabled
                        onChange={(e: any) => setSektor1Id(e.target.value)}
                        sx={{ minWidth: 120, "& .MuiSelect-select": { height: "28px", display: "flex", alignItems: "center" } }}
                    >
                        <MenuItem value={0}></MenuItem>
                        {sektor1List.map((sektor: Veri2) => (
                            <MenuItem key={sektor.id} value={sektor.id}>{sektor.adi}</MenuItem>
                        ))}
                    </CustomSelect>
                </Grid>

                <Grid item xs={12} sm={3} display="flex" alignItems="center">
                    <CustomFormLabel htmlFor="sektor2Id" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                        Sektör 2
                    </CustomFormLabel>
                </Grid>
                <Grid item xs={12} sm={9}>
                    <CustomSelect
                        labelId="sektor2Id"
                        id="sektor2Id"
                        size="small"
                        value={sektor2Id}
                        fullWidth
                        disabled
                        onChange={(e: any) => setSektor2Id(e.target.value)}
                        sx={{ minWidth: 120, "& .MuiSelect-select": { height: "28px", display: "flex", alignItems: "center" } }}
                    >
                        <MenuItem value={0}></MenuItem>
                        {sektor2List.map((sektor: Veri2) => (
                            <MenuItem key={sektor.id} value={sektor.id}>{sektor.adi}</MenuItem>
                        ))}
                    </CustomSelect>
                </Grid>

                <Grid item xs={12} sm={3} display="flex" alignItems="center">
                    <CustomFormLabel htmlFor="sektor3Id" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                        Sektör 3
                    </CustomFormLabel>
                </Grid>
                <Grid item xs={12} sm={9}>
                    <Autocomplete<Veri2>
                        options={sektor3List}
                        value={sektor3List.find((x) => x.id === sektor3Id) || null}
                        onChange={(_, val) => {
                            const id = val?.id ?? 0;
                            if (id) handleSelectSektor(id);
                            else { setSektor1Id(0); setSektor2Id(0); setSektor3Id(0); }
                        }}
                        getOptionLabel={(o) => o?.adi ?? ""}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        filterOptions={filterOptions}
                        noOptionsText="Sonuç yok"
                        renderInput={(params) => (
                            <CustomTextField {...params} label="Sektör ara & seç" placeholder="Yazın…" fullWidth />
                        )}
                    />
                </Grid>

                {/* Butonlar */}
                <Grid item xs={12} sm={3}></Grid>
                <Grid item xs={12} sm={9}>
                    <Box sx={{ display: "flex", flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={onBack}
                            startIcon={<IconArrowLeft />}
                            sx={{ width: { xs: '100%', sm: 'auto' }, order: { xs: 2, sm: 1 } }}
                            disabled={loading}
                        >
                            Geri
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleButtonClick}
                            endIcon={loading ? null : <IconArrowRight />}
                            sx={{ width: { xs: '100%', sm: 'auto' }, order: { xs: 1, sm: 2 } }}
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                        >
                            {loading ? "Kaydediliyor..." : "Kaydet ve İleri"}
                        </Button>
                    </Box>
                </Grid>

                {/* AI Butonu */}
                <FloatingButtonMusteriIslemleri
                    control={control}
                    text={webAdresi}
                    isHovered={isHovered}
                    setIsHovered={setIsHovered}
                    handleClick={() => setControl(true)}
                    onJson={handleAiJson}
                    onClear={handleAiClear}
                />
            </Grid>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};
