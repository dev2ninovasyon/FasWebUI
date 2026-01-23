import React, { useEffect, useState } from "react";
import {
    fetchAmortismanKontrolleri,
    saveAmortismanKontrolSatir,
    AmortismanKontrolleriResponseDto,
} from "@/api/CalismaKagitlari/AmortismanKontrolleri";
import { useSnackbar } from "notistack";
import { CircularProgress, Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider, useTheme } from "@mui/material";

interface Props {
    token: string;
    denetlenenId: number;
    yil: number;
    dipnotNo: string;
}

const AmortismanKontrolleri: React.FC<Props> = ({
    token,
    denetlenenId,
    yil,
    dipnotNo,
}) => {
    const theme = useTheme();
    const [data, setData] = useState<AmortismanKontrolleriResponseDto | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await fetchAmortismanKontrolleri(token, denetlenenId, yil, dipnotNo);
            // Backend returns { success: true, data: { ... }, message: ... }
            if (result && result.success && result.data) {
                setData(result.data);
            } else {
                enqueueSnackbar(result.message || "Veri alınamadı", { variant: "error" });
            }
        } catch (error) {
            console.error("Fetch error:", error);
            enqueueSnackbar("Bir hata oluştu", { variant: "error" });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [denetlenenId, yil, dipnotNo]);

    const handleSaveSatir = async (hesapKodu: string, value: string, id: number) => {
        const numValue = parseFloat(value.replace(",", "."));
        if (isNaN(numValue)) return;

        const result = await saveAmortismanKontrolSatir(token, {
            id: id || 0,
            hesapKodu: hesapKodu,
            tahminiAmortismanGideri: numValue,
            denetlenenId,
            yil,
        });

        if (result.success) {
            enqueueSnackbar("Kaydedildi", { variant: "success" });
            fetchDataSilently();
        } else {
            enqueueSnackbar("Kaydetme başarısız", { variant: "error" });
        }
    };

    const fetchDataSilently = async () => {
        try {
            const result = await fetchAmortismanKontrolleri(token, denetlenenId, yil, dipnotNo);
            if (result?.success && result.data) {
                setData(result.data);
            }
        } catch (error) {
            console.error("Silent fetch error:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <CircularProgress />
            </div>
        );
    }

    if (!data) {
        return <div>Veri bulunamadı.</div>;
    }

    // Filter Accounts (257 or 268 based on DipnotNo)
    const targetKebir = dipnotNo === "16" ? 268 : 257;

    // Group DonusumMizan by DetayKodu
    const groupedAccounts = data.donusumMizanBobi
        .filter((x: any) => x.kebirKodu === targetKebir && x.detayKodu.length > 3)
        .reduce((acc: any, curr: any) => {
            if (!acc[curr.detayKodu]) {
                acc[curr.detayKodu] = {
                    detayKodu: curr.detayKodu,
                    hesapAdi: curr.hesapAdi,
                    cari: 0,
                    onceki: 0,
                };
            }
            if (curr.yil === yil) acc[curr.detayKodu].cari = curr.bakiye;
            if (curr.yil === yil - 1) acc[curr.detayKodu].onceki = curr.bakiye;
            return acc;
        }, {});

    const accountList = Object.values(groupedAccounts).sort((a: any, b: any) => a.detayKodu.localeCompare(b.detayKodu));

    // Mapping for Detail Cards
    const getAssetCodes = (accDeprCode: string) => {
        const map: { [key: string]: string[] } = {
            "257.02": ["251"],
            "257.03": ["252"],
            "257.04": ["253"],
            "257.05": ["254"],
            "257.06": ["255"],
            "257.07": ["256"],
            "268.01": ["260"],
            "268.02": ["261"],
            "268.03": ["262"],
            "268.04": ["263"],
            "268.05": ["264"],
            "268.06": ["265"],
            "268.07": ["267"],
            "268.08": ["266"],
        };
        return map[accDeprCode] || [];
    };

    // Common Header Style
    const headerStyle = {
        backgroundColor: theme.palette.primary.main,
        "& th": {
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
            verticalAlign: "middle",
            borderRight: "1px solid rgba(255,255,255,0.2)",
        },
        "& th:last-child": {
            borderRight: "none",
        }
    };

    // Zebra Striping Style
    const rowStyle = {
        "&:nth-of-type(even)": {
            backgroundColor: "#f8f9fa", // Light gray/blue for even rows
        },
        "&:hover": {
            backgroundColor: "#f0f0f0",
        },
    };

    return (
        <div className="p-4 space-y-8">
            {/* Table 1: Hesap Bakiyeleri */}
            <Card>
                <CardContent>
                    <TableContainer component={Paper} elevation={0} className="border">
                        <Table size="small">
                            <TableHead sx={headerStyle}>
                                <TableRow>
                                    <TableCell>Hesap No</TableCell>
                                    <TableCell>Hesap Açıklaması</TableCell>
                                    <TableCell>Açılış Bakiyesi</TableCell>
                                    <TableCell>Girişler</TableCell>
                                    <TableCell>Çıkışlar</TableCell>
                                    <TableCell>Kapanış Bakiyesi</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {accountList.map((row: any) => {
                                    const diff = row.cari - row.onceki;
                                    const giris = diff > 0 ? diff : 0; // Increase (Credit for 257)
                                    const cikis = diff < 0 ? Math.abs(diff) : 0; // Decrease (Debit for 257)

                                    return (
                                        <TableRow key={row.detayKodu} sx={rowStyle}>
                                            <TableCell align="center">{row.detayKodu}</TableCell>
                                            <TableCell>{row.hesapAdi}</TableCell>
                                            <TableCell align="right">{row.onceki.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell align="right">{giris.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell align="right">{cikis.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell align="right">{row.cari.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Table 2: Amortisman Kontrolleri */}
            <Card>
                <CardContent>
                    <TableContainer component={Paper} elevation={0} className="border">
                        <Table size="small">
                            <TableHead sx={headerStyle}>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Hesap No</TableCell>
                                    <TableCell>Hesap Açıklaması</TableCell>
                                    <TableCell>Önceki Dönem<br />Amort. Gideri</TableCell>
                                    <TableCell>Cari Dönem<br />Amort. Gideri</TableCell>
                                    <TableCell>Cari Dönem Tahmini<br />Amort. Gideri</TableCell>
                                    <TableCell>Fark</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {accountList.map((row: any, index: number) => {
                                    const kontrolKayit = data.amortismanKontrolKayitlari.find((k) => k.hesapNo === row.detayKodu);

                                    const oncekiDonem = row.onceki;
                                    const cariDonem = row.cari;
                                    const cariDonemGider = cariDonem - oncekiDonem; // Net Change
                                    const tahmini = kontrolKayit?.cariDonemTahminiAmortismanGideri || 0;
                                    const fark = cariDonemGider - tahmini;

                                    return (
                                        <TableRow key={row.detayKodu} sx={rowStyle}>
                                            <TableCell align="center">{index + 1}</TableCell>
                                            <TableCell align="center">{row.detayKodu}</TableCell>
                                            <TableCell>{row.hesapAdi}</TableCell>
                                            <TableCell align="right">{oncekiDonem.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell align="right">{cariDonemGider.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell align="right">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    inputMode="decimal"
                                                    defaultValue={tahmini}
                                                    onBlur={(e) => handleSaveSatir(row.detayKodu, e.target.value, kontrolKayit?.id || 0)}
                                                    className="w-full p-1 text-right border rounded bg-white focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </TableCell>
                                            <TableCell align="right" className="font-bold">
                                                {fark.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Table 3: Hesap Detayları */}
            <div className="space-y-4">
                {accountList.map((row: any) => {
                    if (row.detayKodu === "257.00") return null;

                    const assetCodes = getAssetCodes(row.detayKodu);
                    const details = data.amortismanHesaplamaKayitlari.filter((h: any) =>
                        assetCodes.some(code => h.detayHesapKodu?.startsWith(code))
                    );

                    const girisToplami = details.reduce((sum: number, item: any) => sum + (item.girisTutari || 0), 0);
                    const bobiTfrsToplami = details.reduce((sum: number, item: any) => sum + (item.bobiTfrsCariYilAmortisman || 0), 0);
                    const faydaliOmurAvg = details.length > 0
                        ? Math.round(details.reduce((sum: number, item: any) => sum + (item.bobiTfrsFaydaliOmur || 0), 0) / details.length)
                        : 0;

                    const cariDonemGider = row.cari - row.onceki;

                    return (
                        <Card key={row.detayKodu} className="bg-gray-50 border">
                            <CardContent>
                                <div className="p-2 rounded mb-2 font-bold text-white" style={{ backgroundColor: "#4B49AC", textAlign: "center" }}>
                                    {row.detayKodu} {row.hesapAdi}
                                </div>
                                <Table size="small">
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Cari Dönemde Amortismana Tabi {row.hesapAdi} Tutarı</TableCell>
                                            <TableCell align="right" className="font-bold">{girisToplami.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Ortalama Kullanım Ömrü (YIL)</TableCell>
                                            <TableCell align="right" className="font-bold">{faydaliOmurAvg}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Cari Dönemde Beklenen Amortisman Tutarı</TableCell>
                                            <TableCell align="right" className="font-bold">{cariDonemGider.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Cari Dönemde Hesaplanan Amortisman Tutarı</TableCell>
                                            <TableCell align="right" className="font-bold">{bobiTfrsToplami.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                        </TableRow>
                                        <TableRow className="bg-gray-100">
                                            <TableCell className="font-bold">TOPLAM</TableCell>
                                            <TableCell align="right" className="font-bold text-lg">{row.cari.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default AmortismanKontrolleri;
