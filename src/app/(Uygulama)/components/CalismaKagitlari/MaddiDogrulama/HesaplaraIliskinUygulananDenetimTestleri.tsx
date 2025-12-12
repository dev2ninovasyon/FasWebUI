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
    Divider,
} from "@mui/material";
import dynamic from "next/dynamic";
import { IconDeviceFloppy } from "@tabler/icons-react";

import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";

import {
    getCalismaKagidiVerileriByDenetciDenetlenenYil,
    updateCalismaKagidiVerisi,
} from "@/api/CalismaKagitlari/CalismaKagitlari";

import CustomSelect from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSelect";

const UstEditor = dynamic(
    () => import("@/app/(Uygulama)/components/Editor/YorumEditor"),
    { ssr: false }
);

const YorumEditor = dynamic(
    () => import("@/app/(Uygulama)/components/Editor/YorumEditor"),
    { ssr: false }
);

interface Veri {
    id: number;
    dipnotNo?: string | null;
    baslik?: string | null;

    hesapAdi: string;
    kebirKodu: string;
    detayKodu: string;

    oncekiDonemBakiye?: number | null;
    cariDonemBakiye?: number | null;
    degisimTl?: number | null;
    degisimYuzde?: number | null;

    onemlilik: string; // "0","1","2","3"
    dipnot: string;
    paraBirimi: string;
}

interface Props {
    controller: string;
    dipnotAdi: string;
    setDip: (str: string) => void;
}

function normalizeString(str: string): string {
    const map: Record<string, string> = {
        ç: "c",
        ğ: "g",
        ı: "i",
        ö: "o",
        ş: "s",
        ü: "u",
        Ç: "C",
        Ğ: "G",
        İ: "I",
        Ö: "O",
        Ş: "S",
        Ü: "U",
    };
    return str
        .replace(/[çğıöşüÇĞÖŞÜıİ]/g, (m) => map[m] || m)
        .replace(/\s+/g, "")
        .toLowerCase();
}

const ONEMLILIK_OPTIONS = [
    { value: "0", label: "Yok" },
    { value: "1", label: "Önemsiz" },
    { value: "2", label: "Orta" },
    { value: "3", label: "Yüksek" },
];

export default function HesaplaraIliskinUygulananDenetimTestleri_3Tablo({
    controller,
    dipnotAdi,
    setDip,
}: Props) {
    const user = useSelector((state: AppState) => state.userReducer);

    const [rows, setRows] = useState<Veri[]>([]);
    const [savingRowId, setSavingRowId] = useState<number | null>(null);
    const [savingKebir, setSavingKebir] = useState<string | null>(null);

    const fmt = (n: any) => Number(n ?? 0).toLocaleString("tr-TR");

    const fetchData = async () => {
        const list = await getCalismaKagidiVerileriByDenetciDenetlenenYil(
            controller || "",
            user.token || "",
            user.denetciId || 0,
            user.denetlenenId || 0,
            user.yil || 0
        );

        const filtered: Veri[] = [];

        for (const veri of list) {
            const r: Veri = {
                id: veri.id,

                dipnotNo: veri.dipnotNo ?? "",
                baslik: veri.baslik ?? "",

                hesapAdi: veri.hesapAdi ?? "",
                kebirKodu: veri.kebirKodu ?? "",
                detayKodu: veri.detayKodu ?? "",

                oncekiDonemBakiye: Number(veri.oncekiDonemBakiye ?? 0),
                cariDonemBakiye: Number(veri.cariDonemBakiye ?? 0),
                degisimTl: Number(veri.degisimTl ?? 0),
                degisimYuzde: Number(veri.degisimYuzde ?? 0),

                onemlilik: String(veri.onemlilik ?? "0"),
                dipnot: veri.dipnot ?? "",
                paraBirimi: veri.paraBirimi ?? "TL",
            };

            if (normalizeString(r.hesapAdi) === normalizeString(dipnotAdi)) {
                filtered.push(r);
                setDip(r.hesapAdi);
            }
        }

        setRows(filtered);
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // kebir => detay list
    const groupedByKebir = useMemo(() => {
        const g: Record<string, Veri[]> = {};
        for (const r of rows) (g[r.kebirKodu] ||= []).push(r);

        // kebir sıralı, detaylar sıralı
        const orderedKeys = Object.keys(g).sort((a, b) => a.localeCompare(b, "tr"));
        const ordered: Record<string, Veri[]> = {};
        for (const k of orderedKeys) {
            ordered[k] = g[k].slice().sort((x, y) => x.detayKodu.localeCompare(y.detayKodu, "tr"));
        }
        return ordered;
    }, [rows]);

    // SADECE 2 DETAY TABLO (toplam 3 tablo: 1 özet + 2 detay)
    const kebirKeysToShow = useMemo(() => {
        const all = Object.keys(groupedByKebir);
        return all.slice(0, 2);
    }, [groupedByKebir]);

    // Ana Hesaplar özet (ilk tablo)
    const anaHesapSummary = useMemo(() => {
        const g: Record<string, any> = {};
        for (const r of rows) {
            if (!g[r.kebirKodu]) {
                g[r.kebirKodu] = {
                    kebirKodu: r.kebirKodu,
                    hesapAdi: r.hesapAdi,
                    onceki: 0,
                    cari: 0,
                    degisimTl: 0,
                };
            }
            g[r.kebirKodu].onceki += Number(r.oncekiDonemBakiye ?? 0);
            g[r.kebirKodu].cari += Number(r.cariDonemBakiye ?? 0);
            g[r.kebirKodu].degisimTl += Number(r.degisimTl ?? 0);
        }

        const arr = Object.values(g)
            .sort((a: any, b: any) => String(a.kebirKodu).localeCompare(String(b.kebirKodu), "tr"))
            .map((x: any) => ({
                ...x,
                degisimYuzde: x.onceki !== 0 ? ((x.cari - x.onceki) / x.onceki) * 100 : 0,
            }));

        const totalOnceki = arr.reduce((s: number, x: any) => s + x.onceki, 0);
        const totalCari = arr.reduce((s: number, x: any) => s + x.cari, 0);
        const totalDegisim = arr.reduce((s: number, x: any) => s + x.degisimTl, 0);
        const totalDegisimYuzde = totalOnceki !== 0 ? ((totalCari - totalOnceki) / totalOnceki) * 100 : 0;

        return { arr, totalOnceki, totalCari, totalDegisim, totalDegisimYuzde };
    }, [rows]);

    const setRowOnemlilik = (id: number, onemlilik: string) => {
        setRows((prev) => prev.map((x) => (x.id === id ? { ...x, onemlilik } : x)));
    };

    const setKebirOnemlilikAll = (kebirKodu: string, onemlilik: string) => {
        setRows((prev) => prev.map((x) => (x.kebirKodu === kebirKodu ? { ...x, onemlilik } : x)));
    };

    const saveRow = async (row: Veri) => {
        try {
            setSavingRowId(row.id);
            await updateCalismaKagidiVerisi(controller || "", user.token || "", row.id, row);
            await fetchData();
        } finally {
            setSavingRowId(null);
        }
    };

    const saveKebir = async (kebirKodu: string) => {
        const list = groupedByKebir[kebirKodu] || [];
        if (!list.length) return;

        try {
            setSavingKebir(kebirKodu);
            await Promise.all(
                list.map((r) => updateCalismaKagidiVerisi(controller || "", user.token || "", r.id, r))
            );
            await fetchData();
        } finally {
            setSavingKebir(null);
        }
    };

    return (
        <Grid container>
            <Grid item xs={12}>
                <Box sx={{ width: "95%", margin: "0 auto", pt: 2 }}>
                    {/* Üstte geniş editör alanı */}
                    <Paper variant="outlined" sx={{ mb: 2 }}>
                        <Box sx={{ p: 1 }}>
                            <UstEditor />
                        </Box>
                    </Paper>

                    {/* 1) Ana Hesaplar (1. tablo) */}
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                        Ana Hesaplar
                    </Typography>

                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#dfe6ef" }}>
                                    <TableCell sx={{ fontWeight: 700 }}>Hesap No</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Hesap Açıklaması</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                                        Önceki Dönem Bakiye
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                                        Cari Dönem Bakiye
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                                        Değişim TL
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                                        Değişim %
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {anaHesapSummary.arr.map((r: any) => (
                                    <TableRow key={r.kebirKodu}>
                                        <TableCell>{r.kebirKodu}</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>{r.hesapAdi}</TableCell>
                                        <TableCell align="right">{fmt(r.onceki)}</TableCell>
                                        <TableCell align="right">{fmt(r.cari)}</TableCell>
                                        <TableCell align="right">{fmt(r.degisimTl)}</TableCell>
                                        <TableCell align="right">% {Number(r.degisimYuzde ?? 0).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}

                                <TableRow sx={{ backgroundColor: "#f4f6f8" }}>
                                    <TableCell colSpan={2} sx={{ fontWeight: 800 }}>
                                        Toplam
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800 }}>
                                        {fmt(anaHesapSummary.totalOnceki)}
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800 }}>
                                        {fmt(anaHesapSummary.totalCari)}
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800 }}>
                                        {fmt(anaHesapSummary.totalDegisim)}
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800 }}>
                                        % {Number(anaHesapSummary.totalDegisimYuzde).toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* 2) ve 3) Detay tabloları (SADECE 2 adet) */}
                    {kebirKeysToShow.map((kebirKodu) => {
                        const detaylar = groupedByKebir[kebirKodu];
                        const kebirTitle = `${kebirKodu} - ${detaylar?.[0]?.hesapAdi ?? ""}`;

                        const totalOnceki = detaylar.reduce((s, x) => s + Number(x.oncekiDonemBakiye ?? 0), 0);
                        const totalCari = detaylar.reduce((s, x) => s + Number(x.cariDonemBakiye ?? 0), 0);
                        const totalDegisim = detaylar.reduce((s, x) => s + Number(x.degisimTl ?? 0), 0);
                        const totalDegisimYuzde =
                            totalOnceki !== 0 ? ((totalCari - totalOnceki) / totalOnceki) * 100 : 0;

                        return (
                            <Box key={kebirKodu} sx={{ mb: 3 }}>
                                {/* Mavi başlık + sağ kontroller */}
                                <Box
                                    sx={{
                                        backgroundColor: "#1e90ff",
                                        color: "white",
                                        px: 2,
                                        py: 1,
                                        borderTopLeftRadius: 2,
                                        borderTopRightRadius: 2,
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
                                        <Typography sx={{ fontWeight: 800 }}>{kebirTitle}</Typography>

                                        <Stack direction="row" alignItems="center" gap={2}>
                                            <CustomSelect
                                                value=""
                                                displayEmpty
                                                size="small"
                                                onChange={(e: any) => setKebirOnemlilikAll(kebirKodu, e.target.value)}
                                                sx={{
                                                    backgroundColor: "white",
                                                    borderRadius: 1,
                                                    minWidth: 300,
                                                }}
                                            >
                                                <MenuItem value="" disabled>
                                                    Tümü İçin Önemlilik Seçiniz
                                                </MenuItem>
                                                {ONEMLILIK_OPTIONS.map((o) => (
                                                    <MenuItem key={o.value} value={o.value}>
                                                        {o.label}
                                                    </MenuItem>
                                                ))}
                                            </CustomSelect>

                                            <Button
                                                variant="contained"
                                                sx={{
                                                    backgroundColor: "#2ecc71",
                                                    fontWeight: 800,
                                                    "&:hover": { backgroundColor: "#27ae60" },
                                                }}
                                                disabled={savingKebir === kebirKodu}
                                                onClick={() => saveKebir(kebirKodu)}
                                            >
                                                Hepsini Kaydet
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </Box>

                                <TableContainer
                                    component={Paper}
                                    variant="outlined"
                                    sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
                                >
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: "#dfe6ef" }}>
                                                <TableCell sx={{ fontWeight: 700 }}>Hesap No</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Hesap Açıklaması</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>
                                                    Önceki Dönem Bakiye
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>
                                                    Cari Dönem Bakiye
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>
                                                    Değişim TL
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>
                                                    Değişim %
                                                </TableCell>
                                                <TableCell sx={{ width: 280 }} />
                                                <TableCell sx={{ width: 64 }} />
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {detaylar.map((r) => (
                                                <TableRow key={r.id}>
                                                    <TableCell>{r.detayKodu}</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>{r.baslik || r.paraBirimi}</TableCell>
                                                    <TableCell align="right">{fmt(r.oncekiDonemBakiye)}</TableCell>
                                                    <TableCell align="right">{fmt(r.cariDonemBakiye)}</TableCell>
                                                    <TableCell align="right">{fmt(r.degisimTl)}</TableCell>
                                                    <TableCell align="right">% {Number(r.degisimYuzde ?? 0).toFixed(2)}</TableCell>

                                                    <TableCell>
                                                        <CustomSelect
                                                            fullWidth
                                                            displayEmpty
                                                            value={r.onemlilik ?? ""}
                                                            onChange={(e: any) => setRowOnemlilik(r.id, e.target.value)}
                                                        >
                                                            <MenuItem value="" disabled>
                                                                Önemlilik Seçiniz
                                                            </MenuItem>
                                                            {ONEMLILIK_OPTIONS.map((o) => (
                                                                <MenuItem key={o.value} value={o.value}>
                                                                    {o.label}
                                                                </MenuItem>
                                                            ))}
                                                        </CustomSelect>
                                                    </TableCell>

                                                    <TableCell>
                                                        <IconButton
                                                            onClick={() => saveRow(r)}
                                                            disabled={savingRowId === r.id}
                                                            sx={{
                                                                backgroundColor: "#2ecc71",
                                                                color: "white",
                                                                "&:hover": { backgroundColor: "#27ae60" },
                                                                width: 40,
                                                                height: 40,
                                                            }}
                                                        >
                                                            <IconDeviceFloppy size={18} />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}

                                            <TableRow sx={{ backgroundColor: "#f4f6f8" }}>
                                                <TableCell colSpan={2} sx={{ fontWeight: 800 }}>
                                                    Toplam
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 800 }}>
                                                    {fmt(totalOnceki)}
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 800 }}>
                                                    {fmt(totalCari)}
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 800 }}>
                                                    {fmt(totalDegisim)}
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 800 }}>
                                                    % {Number(totalDegisimYuzde).toFixed(2)}
                                                </TableCell>
                                                <TableCell colSpan={2} />
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        );
                    })}

                    {/* Yorum en altta */}
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                        Yorum
                    </Typography>
                    <Paper variant="outlined">
                        <Box sx={{ p: 1 }}>
                            <YorumEditor />
                        </Box>
                    </Paper>

                    <Box sx={{ height: 24 }} />
                </Box>
            </Grid>
        </Grid>
    );
}
