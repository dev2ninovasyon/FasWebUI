"use client";

import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    useTheme,
} from "@mui/material";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    getDavaKarsiliklariData,
    updateDavaKarsiliklari,
    varsayilanaDonDavaKarsiliklari,
    DavaKarsiliklariSatir,
    DavaKarsiliklariSummary
} from "@/api/CalismaKagitlari/DavaKarsiliklariCalismasi";
import { enqueueSnackbar } from "notistack";
import "@/utils/languages/handsontable.tr-TR";

registerAllModules();

const fmt = (n: any) =>
    Number(n ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface Props {
    dipnotNo: string;
    isClickedVarsayilanaDon?: boolean;
    setIsClickedVarsayilanaDon?: (val: boolean) => void;
    isReport?: boolean;
}

const DavaKarsiliklariCalismasi = ({ dipnotNo, isClickedVarsayilanaDon, setIsClickedVarsayilanaDon, isReport }: Props) => {
    const theme = useTheme();
    const user = useSelector((state: AppState) => state.userReducer);
    const customizer = useSelector((state: AppState) => state.customizer);

    const [data, setData] = useState<DavaKarsiliklariSatir[]>([]);
    const [summary, setSummary] = useState<DavaKarsiliklariSummary | null>(null);
    const [loading, setLoading] = useState(false);

    // Görseldeki Ana Başlık Kutusu Rengi (Açık Mavi/Gri Tonu)
    const TITLE_BOX_COLOR = "#B4C7E7";
    const TITLE_TEXT_COLOR = "#2C3E50"; // Başlık içindeki koyu yazı rengi

    const fetchData = async () => {
        if (!user.token) return;
        setLoading(true);
        try {
            const result = await getDavaKarsiliklariData(user.token, user.denetciId || 0, user.yil || 0, user.denetlenenId || 0);
            setData(result.liste || []);
            setSummary(result.ozet || null);
        } catch (error) {
            enqueueSnackbar("Veriler yüklenirken hata oluştu!", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [user.denetlenenId, user.yil, user.token, user.denetciId]);

    useEffect(() => {
        if (isClickedVarsayilanaDon && setIsClickedVarsayilanaDon) {
            const handleVarsayilanaDon = async () => {
                try {
                    setLoading(true);
                    await varsayilanaDonDavaKarsiliklari(user.token || "", user.denetciId || 0, user.yil || 0, user.denetlenenId || 0);
                    enqueueSnackbar("Veriler başarıyla getirildi.", { variant: "success" });
                    await fetchData();
                } catch (error) {
                    enqueueSnackbar("İşlem sırasında bir hata oluştu!", { variant: "error" });
                } finally {
                    setIsClickedVarsayilanaDon(false);
                    setLoading(false);
                }
            };
            handleVarsayilanaDon();
        }
    }, [isClickedVarsayilanaDon]);

    const handleAfterChange = async (changes: any, source: string) => {
        if (!changes || !user.token || source === "loadData") return;

        let hasChange = false;
        const updatedData = [...data];

        for (const [row, prop, oldValue, newValue] of changes) {
            if (oldValue === newValue) continue;

            // Ensure the row exists in updatedData (for new rows)
            if (!updatedData[row]) {
                updatedData[row] = {
                    id: 0,
                    denetciId: user.denetciId || 0,
                    denetlenenId: user.denetlenenId || 0,
                    yil: user.yil || 0,
                    aleyhteDavacininLehteDavalininUnvani: "",
                    aleyhteLehte: "",
                    davaKonusu: "",
                    davaYili: user.yil || 0,
                    mahkemeAsamasi: "",
                    varsaYerelMahkemeKarari: "",
                    durusmaAsamasi: "",
                    muhtemelDeger: 0,
                    aleyhteKaybetmeLehteKazanmaIhtimali: "",
                    ongorulenSonuclanmaSuresi: "",
                    denetcininVardigiSonuc: "",
                    sonucunTutari: 0
                };
            }

            updatedData[row] = { ...updatedData[row], [prop]: newValue };
            hasChange = true;
        }

        if (hasChange) {
            try {
                // Filter out empty rows before sending
                const filteredData = updatedData.filter(row => row && row.aleyhteDavacininLehteDavalininUnvani);
                await updateDavaKarsiliklari(user.token, filteredData);
                setData(updatedData);
                enqueueSnackbar("Güncellendi", { variant: "success" });
                const refresh = await getDavaKarsiliklariData(user.token, user.denetciId || 0, user.yil || 0, user.denetlenenId || 0);
                setSummary(refresh.ozet);
            } catch (error) {
                enqueueSnackbar("Hata oluştu!", { variant: "error" });
            }
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

    if (isReport && !loading && data.length === 0) return null;

    return (
        <Box sx={{ width: "100%", p: 0 }}>
            <Typography variant="h6" sx={{ color: "#2C3E50", fontWeight: "bold", mb: 3 }}>
                Dava Karşılıkları Çalışması
            </Typography>
            {/* Arka plansız Düz Metin Başlık */}
            <Typography variant="h5" fontWeight={700} mb={2} sx={{ color: TITLE_TEXT_COLOR }}>
                Dava Karşılıkları Özeti
            </Typography>

            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: "8px", border: `1px solid ${TITLE_BOX_COLOR}`, mb: 5 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                            <TableCell sx={{ borderRight: `1px solid rgba(255,255,255,0.2)`, width: "120px" }}></TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, color: "white", borderRight: `1px solid rgba(255,255,255,0.2)` }}>Hesaplanan Toplam Ayrılacak Dava Karşılıkları</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, color: "white", borderRight: `1px solid rgba(255,255,255,0.2)` }}>Hesaplanan Toplam Koşullu Dava Borçları</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, color: "white", borderRight: `1px solid rgba(255,255,255,0.2)` }}>Hesaplanan Toplam Koşullu Dava Alacakları</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, color: "white" }}>Uzman Görüşü Gerektirenler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, backgroundColor: theme.palette.primary.main, color: "white", textAlign: 'center' }}>Sayısı</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>{summary?.hesaplananToplamAyrilacakDavaKarsiliklariSayisi || 0}</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>{summary?.hesaplananToplamKosulluDavaBorclariSayisi || 0}</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>{summary?.hesaplananToplamKosulluDavaAlacaklariSayisi || 0}</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>{summary?.uzmanGorusuGerektirenlerSayisi || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, backgroundColor: theme.palette.primary.main, color: "white", textAlign: 'center' }}>Tutarı</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>{fmt(summary?.hesaplananToplamAyrilacakDavaKarsiliklariTutari)}</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>{fmt(summary?.hesaplananToplamKosulluDavaBorclariTutari)}</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>{fmt(summary?.hesaplananToplamKosulluDavaAlacaklariTutari)}</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>{fmt(summary?.uzmanGorusuGerektirenlerTutari)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Arka plansız Düz Metin Başlık */}
            <Typography variant="h5" fontWeight={700} mb={2} sx={{ color: TITLE_TEXT_COLOR }}>
                Dava Detayı Listesi
            </Typography>

            <Box sx={{
                border: `1px solid ${TITLE_BOX_COLOR}`,
                borderRadius: "8px",
                overflow: "hidden",
                "& .handsontable th": {
                    backgroundColor: `${theme.palette.primary.main} !important`,
                    color: `white !important`,
                    fontWeight: "bold",
                    padding: "8px 4px !important",
                    fontSize: "13px",
                    border: `1px solid rgba(255,255,255,0.2) !important`,
                    whiteSpace: "normal",
                    lineHeight: "1.2 !important",
                    verticalAlign: "middle !important",
                    height: "45px !important"
                }
            }}>
                <HotTable
                    data={data}
                    afterChange={handleAfterChange}
                    autoColumnSize={true}
                    manualColumnResize={true}
                    colHeaders={[
                        "SN",
                        "Aleyhte Davacının / Lehte Davalının Unvanı",
                        "Aleyhte / Lehte",
                        "Dava Konusu",
                        "Dava Yılı",
                        "Mahkeme Aşaması",
                        "Varsa, Yerel Mahkeme Kararı",
                        "Duruşma Aşaması",
                        "Muhtemel Değeri"
                    ]}
                    columns={[
                        { data: "id", readOnly: true, width: 40 },
                        { data: "aleyhteDavacininLehteDavalininUnvani", width: 220 },
                        { data: "aleyhteLehte", type: "dropdown", source: ["Aleyhte", "Lehte"], width: 100 },
                        { data: "davaKonusu", width: 150 },
                        { data: "davaYili", type: "numeric", width: 80 },
                        { data: "mahkemeAsamasi", width: 150 },
                        { data: "varsaYerelMahkemeKarari", width: 200 },
                        { data: "durusmaAsamasi", width: 150 },
                        { data: "muhtemelDeger", type: "numeric", numericFormat: { pattern: "0,0.00" }, width: 120 }
                    ]}
                    stretchH="all"
                    height="auto"
                    minRows={10}
                    contextMenu={isReport ? false : true}
                    dropdownMenu={!isReport}
                    filters={!isReport}
                    columnSorting={!isReport}
                    language="tr-TR"
                    licenseKey="non-commercial-and-evaluation"
                    className={customizer.activeMode === "dark" ? "htDark" : ""}
                    fixedColumnsLeft={1}
                />

                {data.length === 0 && (
                    <Box sx={{
                        p: 1.5,
                        textAlign: 'center',
                        backgroundColor: theme.palette.action.hover,
                        borderTop: `1px solid ${theme.palette.divider}`
                    }}>
                        <Typography variant="body2" color="textSecondary">
                            Görüntülenecek veri bulunmamaktadır. Sağ tıklayarak satır ekleyebilirsiniz.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default DavaKarsiliklariCalismasi;
