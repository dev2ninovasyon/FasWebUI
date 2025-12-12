import React, { useEffect, useMemo, useState } from "react";
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
    Stack,
    MenuItem,
    IconButton,
    Button,
} from "@mui/material";
import { IconDeviceFloppy } from "@tabler/icons-react";

import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";

import CustomSelect from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSelect";
import {
    getHesapTestleriByDenetlenen,
    updateHesapTestRow,
    type HesapTestRow,
} from "@/api/CalismaKagitlari/HesaplaraIliskinUygulananDenetimTestleri";

interface CalismaKagidiProps {
    controller: string;  // "HesaplaraIliskinUygulananDenetimTestleri"
    dipnotAdi: string;   // ekranda filtrelemek istediğin dipnot adı (ör: "Nakit ve Nakit Benzerleri")
    dipnotNo: string;    // backend query param (ör: "1", "A.1", "10" vs)
    modelAdi: string;    // backend query param (ör: "TFRS", "BOBI" veya senin mantığın)
    setDip: (str: string) => void;
}

const fmt = (n: any) => Number(n ?? 0).toLocaleString("tr-TR");

const HEADER_BLUE = "#3AA0F3";
const HEADER_GRAY = "#C9CBD6";
const ROW_ALT = "#F7F7FA";

function normalizeString(str: string): string {
    const turkishChars: { [key: string]: string } = {
        ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
        Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u",
    };
    let normalized = (str ?? "").replace(/[çğıöşüÇĞÖŞÜıİ]/g, (m) => turkishChars[m] || m);
    normalized = normalized.replace(/\s+/g, "");
    return normalized.toLowerCase();
}

const kebirOrder = ["100", "102"];

const HesaplaraIliskinUygulananDenetimTestleri: React.FC<CalismaKagidiProps> = ({
    controller,
    dipnotAdi,
    dipnotNo,
    modelAdi,
    setDip,
}) => {
    const user = useSelector((state: AppState) => state.userReducer);

    const [veriler, setVeriler] = useState<HesapTestRow[]>([]);
    const [savingRowId, setSavingRowId] = useState<number | null>(null);
    const [savingKebir, setSavingKebir] = useState<string | null>(null);

    const fetchData = async () => {
        const res = await getHesapTestleriByDenetlenen(
            controller,
            user.token || "",
            user.denetciId || 0,
            user.denetlenenId || 0,
            user.yil || 0,
            dipnotNo,
            modelAdi
        );

        // 1) null geldiyse
        if (!res) {
            setVeriler([]);
            return;
        }

        // 2) API bazen direkt array, bazen { data: [...] } döndürür
        const rawList = Array.isArray(res) ? res : (res.data ?? []);

        const list = rawList.map((x: any) => ({
            ...x,
            kebirKodu: String(x.kebirKodu ?? ""),
            detayKodu: String(x.detayKodu ?? ""),
            onemlilik: String(x.onemlilik ?? "0"),
            paraBirimi: x.paraBirimi ?? "TL",
            dipnot: x.dipnot ?? "",
            hesapAdi: x.hesapAdi ?? "",
        }));

        const filtered = list.filter(
            (r: any) => normalizeString(r.hesapAdi) === normalizeString(dipnotAdi)
        );

        if (filtered[0]?.hesapAdi) setDip(filtered[0].hesapAdi);

        setVeriler(filtered);

    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const groupedByKebir = useMemo(() => {
        const base = veriler.reduce((acc: Record<string, HesapTestRow[]>, v) => {
            acc[v.kebirKodu] = acc[v.kebirKodu] || [];
            acc[v.kebirKodu].push(v);
            return acc;
        }, {});

        Object.keys(base).forEach((k) => {
            base[k] = [...base[k]].sort((a, b) =>
                String(a.detayKodu).localeCompare(String(b.detayKodu), "tr")
            );
        });

        return base;
    }, [veriler]);

    const kebirSummary = useMemo(() => {
        const rows = kebirOrder
            .filter((k) => groupedByKebir[k]?.length)
            .map((k) => {
                const list = groupedByKebir[k];
                const onceki = list.reduce((s, x) => s + Number(x.oncekiDonemBakiye ?? 0), 0);
                const cari = list.reduce((s, x) => s + Number(x.cariDonemBakiye ?? 0), 0);
                const degisimTl = list.reduce((s, x) => s + Number(x.degisimTl ?? 0), 0);
                const degisimYuzde = onceki !== 0 ? ((cari - onceki) / onceki) * 100 : 0;

                const hesapAciklama = k === "100" ? "Kasa" : k === "102" ? "Bankalar" : (list?.[0]?.hesapAdi || "");
                return { kebirKodu: k, hesapAciklama, onceki, cari, degisimTl, degisimYuzde };
            });

        const totalOnceki = rows.reduce((s, r) => s + r.onceki, 0);
        const totalCari = rows.reduce((s, r) => s + r.cari, 0);
        const totalDegisim = rows.reduce((s, r) => s + r.degisimTl, 0);
        const totalDegisimYuzde = totalOnceki !== 0 ? ((totalCari - totalOnceki) / totalOnceki) * 100 : 0;

        return { rows, totalOnceki, totalCari, totalDegisim, totalDegisimYuzde };
    }, [groupedByKebir]);

    const setRowOnemlilik = (id: number, onemlilik: string) => {
        setVeriler((prev) => prev.map((x) => (x.id === id ? { ...x, onemlilik } : x)));
    };

    const setKebirOnemlilikAll = (kebirKodu: string, onemlilik: string) => {
        setVeriler((prev) =>
            prev.map((x) => (x.kebirKodu === kebirKodu ? { ...x, onemlilik } : x))
        );
    };

    const saveRow = async (row: HesapTestRow) => {
        try {
            setSavingRowId(row.id);
            await updateHesapTestRow(controller, user.token || "", row.id, row);
            await fetchData();
        } finally {
            setSavingRowId(null);
        }
    };

    const saveKebir = async (kebirKodu: string) => {
        const rows = groupedByKebir[kebirKodu] || [];
        if (!rows.length) return;

        try {
            setSavingKebir(kebirKodu);
            await Promise.all(
                rows.map((row) => updateHesapTestRow(controller, user.token || "", row.id, row))
            );
            await fetchData();
        } finally {
            setSavingKebir(null);
        }
    };

    const renderDetayTable = (kebirKodu: string, title: string) => {
        const detaylar = groupedByKebir[kebirKodu] || [];
        if (!detaylar.length) return null;

        const totalOnceki = detaylar.reduce((s, x) => s + Number(x.oncekiDonemBakiye ?? 0), 0);
        const totalCari = detaylar.reduce((s, x) => s + Number(x.cariDonemBakiye ?? 0), 0);
        const totalDegisim = detaylar.reduce((s, x) => s + Number(x.degisimTl ?? 0), 0);
        const totalDegisimYuzde = totalOnceki !== 0 ? ((totalCari - totalOnceki) / totalOnceki) * 100 : 0;

        return (
            <Box sx={{ mb: 3 }}>
                <Box sx={{ backgroundColor: HEADER_BLUE, color: "white", px: 1.2, py: 0.8, fontWeight: 800 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        {title}
                    </Typography>
                </Box>

                <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: HEADER_GRAY }}>
                                <TableCell sx={{ fontWeight: 800 }}>Hesap No</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Hesap Açıklaması</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800 }}>Önceki Dönem Bakiye</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800 }}>Cari Dönem Bakiye</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800 }}>Değişim TL</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800 }}>Değişim %</TableCell>

                                <TableCell sx={{ width: 320 }} />
                                <TableCell sx={{ width: 76 }} />
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {detaylar.map((row, idx) => (
                                <TableRow key={row.id} sx={{ backgroundColor: idx % 2 === 0 ? ROW_ALT : "white" }}>
                                    <TableCell sx={{ fontWeight: 700 }}>{row.detayKodu}</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>{row.baslik || row.hesapAdi}</TableCell>

                                    <TableCell align="right">{fmt(row.oncekiDonemBakiye)}</TableCell>
                                    <TableCell align="right">{fmt(row.cariDonemBakiye)}</TableCell>
                                    <TableCell align="right">{fmt(row.degisimTl)}</TableCell>
                                    <TableCell align="right">% {Number(row.degisimYuzde ?? 0).toFixed(2)}</TableCell>

                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            {idx === 0 && (
                                                <CustomSelect
                                                    size="small"
                                                    value=""
                                                    displayEmpty
                                                    onChange={(e: any) => setKebirOnemlilikAll(kebirKodu, e.target.value)}
                                                    sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 170 }}
                                                >
                                                    <MenuItem value="" disabled>Tümü için Önemlilik</MenuItem>
                                                    <MenuItem value="0">Yok</MenuItem>
                                                    <MenuItem value="1">Önemsiz</MenuItem>
                                                    <MenuItem value="2">Orta</MenuItem>
                                                    <MenuItem value="3">Yüksek</MenuItem>
                                                </CustomSelect>
                                            )}

                                            <CustomSelect
                                                size="small"
                                                value={row.onemlilik}
                                                onChange={(e: any) => setRowOnemlilik(row.id, e.target.value)}
                                                sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 170 }}
                                            >
                                                <MenuItem value="0">Önemlilik Seçiniz</MenuItem>
                                                <MenuItem value="1">Önemsiz</MenuItem>
                                                <MenuItem value="2">Orta</MenuItem>
                                                <MenuItem value="3">Yüksek</MenuItem>
                                            </CustomSelect>

                                            {idx === 0 && (
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    disabled={savingKebir === kebirKodu}
                                                    onClick={() => saveKebir(kebirKodu)}
                                                    sx={{ fontWeight: 800, borderRadius: 1, px: 2 }}
                                                >
                                                    Hepsini Kaydet
                                                </Button>
                                            )}
                                        </Stack>
                                    </TableCell>

                                    <TableCell align="center">
                                        <IconButton
                                            onClick={() => saveRow(row)}
                                            disabled={savingRowId === row.id}
                                            sx={{
                                                backgroundColor: "#27AE60",
                                                color: "white",
                                                "&:hover": { backgroundColor: "#1E8449" },
                                                width: 44,
                                                height: 44,
                                                borderRadius: "50%",
                                            }}
                                        >
                                            <IconDeviceFloppy size={18} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}

                            <TableRow sx={{ backgroundColor: "white" }}>
                                <TableCell colSpan={2} sx={{ fontWeight: 900 }}>Toplam</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 900 }}>{fmt(totalOnceki)}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 900 }}>{fmt(totalCari)}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 900 }}>{fmt(totalDegisim)}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 900 }}>% {Number(totalDegisimYuzde).toFixed(2)}</TableCell>
                                <TableCell colSpan={2} />
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    };

    return (
        <Grid container>
            <Grid item xs={12}>
                <Box px={3} pt={3} sx={{ width: "95%", margin: "0 auto" }}>
                    {/* ANA HESAPLAR */}
                    <TableContainer component={Paper} sx={{ mb: 3, borderRadius: 0 }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: HEADER_BLUE }}>
                                    <TableCell colSpan={6} sx={{ color: "white", fontWeight: 900, py: 1 }}>
                                        Ana Hesaplar
                                    </TableCell>
                                </TableRow>

                                <TableRow sx={{ backgroundColor: HEADER_GRAY }}>
                                    <TableCell sx={{ fontWeight: 800 }}>Hesap No</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>Hesap Açıklaması</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800 }}>Önceki Dönem Bakiye</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800 }}>Cari Dönem Bakiye</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800 }}>Değişim TL</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800 }}>Değişim %</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {kebirSummary.rows.map((r, i) => (
                                    <TableRow key={r.kebirKodu} sx={{ backgroundColor: i % 2 === 0 ? ROW_ALT : "white" }}>
                                        <TableCell sx={{ fontWeight: 700 }}>{r.kebirKodu}</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>{r.hesapAciklama}</TableCell>
                                        <TableCell align="right">{fmt(r.onceki)}</TableCell>
                                        <TableCell align="right">{fmt(r.cari)}</TableCell>
                                        <TableCell align="right">{fmt(r.degisimTl)}</TableCell>
                                        <TableCell align="right">% {Number(r.degisimYuzde).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}

                                <TableRow>
                                    <TableCell colSpan={2} sx={{ fontWeight: 900 }}>Toplam</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 900 }}>{fmt(kebirSummary.totalOnceki)}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 900 }}>{fmt(kebirSummary.totalCari)}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 900 }}>{fmt(kebirSummary.totalDegisim)}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 900 }}>% {Number(kebirSummary.totalDegisimYuzde).toFixed(2)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* 100 - Kasa */}
                    {renderDetayTable("100", "100 - Kasa")}

                    {/* 102 - Bankalar */}
                    {renderDetayTable("102", "102 - Bankalar")}
                </Box>
            </Grid>
        </Grid>
    );
};

export default HesaplaraIliskinUygulananDenetimTestleri;
