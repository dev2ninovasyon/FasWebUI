"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getMaddiDogrulama, getUygulananDenetimProsedurleri } from "@/api/MaddiDogrulama/MaddiDogrulama";
import {
    getMutabakatByDipnot,
    getOnemlilikByDipnot,
    getOrneklemByDipnot,
} from "@/api/DenetimKanitlari/DenetimKanitlari";
import { getCalismaKagidiVerileriByDenetciDenetlenenYil, getCalismaKagidiVerileriByDenetciDenetlenenYilDipnotNo } from "@/api/CalismaKagitlari/CalismaKagitlari";
import PrintIcon from "@mui/icons-material/Print";

interface DenetimDosyaBelgeleriDto {
    id: number;
    name: string;
    children?: DenetimDosyaBelgeleriDto[];
}

interface DetailData {
    documentId: number;
    documentName: string;
    data: any[];
    type: "Mutabakat" | "Onemlilik" | "Orneklem" | "Risk" | "Prosedur" | "Teknik" | "Other";
}

const CalismaKagidiRaporu = () => {
    const searchParams = useSearchParams();
    const parentName = searchParams.get("parentName");

    const user = useSelector((state: AppState) => state.userReducer);
    const [reportData, setReportData] = useState<DetailData[]>([]);
    const [loading, setLoading] = useState(true);

    function normalizeString(str: string): string {
        const turkishChars: { [key: string]: string } = {
            ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
            Ç: "C", Ğ: "G", İ: "I", Ö: "O", Ş: "S", Ü: "U",
        };
        let normalized = str.replace(/[çğıöşüÇĞÖŞÜıİ]/g, (match) => turkishChars[match] || match);
        normalized = normalized.replace(/\s+/g, "");
        return normalized.toLowerCase();
    }

    const stripHtml = (html: string) => {
        if (!html) return "";
        return html.replace(/<[^>]*>?/gm, '');
    };

    const fetchDetailData = async (
        item: DenetimDosyaBelgeleriDto,
        pName: string,
        dipnotNo: string
    ): Promise<DetailData> => {
        let data: any[] = [];
        let type: DetailData["type"] = "Other";

        const itemName = item.name;
        const normalizedItemName = normalizeString(itemName);

        try {
            if (normalizedItemName.includes("mutabakat")) {
                type = "Mutabakat";
                data = await getMutabakatByDipnot(
                    user.token || "",
                    user.denetciId || 0,
                    user.yil || 0,
                    user.denetlenenId || 0,
                    pName
                );
            } else if (normalizedItemName.includes("onemlilik")) {
                type = "Onemlilik";
                // Uses dipnotNo if available, otherwise fallback to pName (though logic suggests dipnotNo is required)
                const param = dipnotNo || pName;
                data = await getOnemlilikByDipnot(
                    user.token || "",
                    user.denetciId || 0,
                    user.denetlenenId || 0,
                    user.yil || 0,
                    param
                );
            } else if (normalizedItemName.includes("orneklem")) {
                type = "Orneklem";
                const param = dipnotNo || pName;
                data = await getOrneklemByDipnot(
                    user.token || "",
                    user.denetciId || 0,
                    user.denetlenenId || 0,
                    user.yil || 0,
                    param
                );
            } else if (normalizedItemName.includes("risktespiti") || normalizedItemName === "risk") {
                type = "Risk";
                const allRiskData = await getCalismaKagidiVerileriByDenetciDenetlenenYil(
                    "FinansalTablolarDenetimRiskiBelirleme",
                    user.token || "",
                    user.denetciId || 0,
                    user.denetlenenId || 0,
                    user.yil || 0
                );
                data = allRiskData.filter((r: any) => normalizeString(r.finansalTabloHesaplar) === normalizeString(pName));

            } else if (
                normalizedItemName.includes("uygulanandenetimprosedurleri") ||
                normalizedItemName.includes("hesaplarailiskin")
            ) {
                type = "Prosedur";
                const allProcs = await getUygulananDenetimProsedurleri(
                    user.token || "",
                    user.denetciId || 0,
                    user.denetlenenId || 0,
                    user.yil || 0,
                    pName,
                    user.tfrsmi || false
                );
                data = allProcs;

            } else if (normalizedItemName.includes("uygulanandenetimteknikleri")) {
                type = "Teknik";
                try {
                    // Requires dipnotNo
                    if (dipnotNo) {
                        data = await getCalismaKagidiVerileriByDenetciDenetlenenYilDipnotNo(
                            "UygulananDenetimTeknikleri",
                            user.token || "",
                            user.denetciId || 0,
                            user.denetlenenId || 0,
                            user.yil || 0,
                            dipnotNo
                        );
                    }
                } catch (e) { console.log("Teknik fetch error", e) }
            }

        } catch (err) {
            console.warn(`Failed to fetch details for ${item.name}`, err);
        }

        return {
            documentId: item.id,
            documentName: item.name,
            data,
            type,
        };
    };

    const fetchData = async () => {
        try {
            if (!user.token) return;
            const allData: DenetimDosyaBelgeleriDto[] = await getMaddiDogrulama(
                user.token,
                user.denetimTuru || "",
                user.denetlenenId || 0,
                user.yil || 0
            );

            if (allData && parentName) {
                const group = allData.find(
                    (item: DenetimDosyaBelgeleriDto) => item.name === parentName
                );

                // Need to find the exact dipnotNo from procedures first
                let dipnotNo = "";
                try {
                    const allProcs = await getUygulananDenetimProsedurleri(
                        user.token || "",
                        user.denetciId || 0,
                        user.denetlenenId || 0,
                        user.yil || 0,
                        parentName, // Use parent name to search
                        user.tfrsmi || false
                    );

                    // Logic from OnemlilikCalismasi/page.tsx to find dipnotNo
                    const foundProc = allProcs.find((p: any) => normalizeString(p.dipnotAdi) === normalizeString(parentName));
                    if (foundProc) {
                        dipnotNo = foundProc.dipnotNo;
                    }
                } catch (e) {
                    console.log("Failed to fetch dipnotNo", e);
                }


                let finalDetails: DetailData[] = [];

                if (group && group.children) {
                    finalDetails = await Promise.all(
                        group.children.map((child) =>
                            fetchDetailData(child, parentName, dipnotNo)
                        )
                    );
                }

                // Force check for Onemlilik and Orneklem if not present
                const hasOnemlilik = finalDetails.some(d => d.type === "Onemlilik");
                const hasOrneklem = finalDetails.some(d => d.type === "Orneklem");

                if (!hasOnemlilik && dipnotNo) {
                    try {
                        const onemlilikData = await getOnemlilikByDipnot(
                            user.token || "",
                            user.denetciId || 0,
                            user.denetlenenId || 0,
                            user.yil || 0,
                            dipnotNo
                        );
                        if (onemlilikData && onemlilikData.length > 0) {
                            finalDetails.push({
                                documentId: 9991,
                                documentName: "Önemlilik Çalışması",
                                data: onemlilikData,
                                type: "Onemlilik"
                            });
                        }
                    } catch (e) { console.log("Force fetch onemlilik failed", e) }
                }

                if (!hasOrneklem && dipnotNo) {
                    try {
                        const orneklemData = await getOrneklemByDipnot(
                            user.token || "",
                            user.denetciId || 0,
                            user.denetlenenId || 0,
                            user.yil || 0,
                            dipnotNo
                        );
                        if (orneklemData && orneklemData.length > 0) {
                            finalDetails.push({
                                documentId: 9992,
                                documentName: "Örneklem Çalışması",
                                data: orneklemData,
                                type: "Orneklem"
                            });
                        }
                    } catch (e) { console.log("Force fetch orneklem failed", e) }
                }

                setReportData(finalDetails);
            }
        } catch (error) {
            console.error("Error fetching report data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user, parentName]);

    const handlePrint = () => {
        window.print();
    };

    const renderContent = (detail: DetailData) => {
        if (!detail.data || detail.data.length === 0) return <Typography variant="body2" color="textSecondary">Veri yok</Typography>;

        switch (detail.type) {
            case "Mutabakat":
                return (
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                                <TableCell>Kebir</TableCell>
                                <TableCell>Detay</TableCell>
                                <TableCell>Hesap Adı</TableCell>
                                <TableCell align="right">B/A Toplam</TableCell>
                                <TableCell align="right">Bakiye</TableCell>
                                <TableCell align="right">OrtBakiye</TableCell>
                                <TableCell align="right">Fark</TableCell>
                                <TableCell>Yarg./Rast.</TableCell>
                                <TableCell>Gelen Yanıt</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {detail.data.map((row: any, i: number) => (
                                <TableRow key={row.id || i}>
                                    <TableCell>{row.kebirKodu}</TableCell>
                                    <TableCell>{row.detayKodu}</TableCell>
                                    <TableCell>{stripHtml(row.hesapAdi)}</TableCell>
                                    <TableCell align="right">{(row.borc + row.alacak)?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell align="right">{row.bakiye?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell align="right">{row.ortalamaBakiyeSecilen?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell align="right">{row.fark?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell>{row.yargisalRastgeleSecilen}</TableCell>
                                    <TableCell>{stripHtml(row.gelenYanit)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                );
            case "Onemlilik":
                return (
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                                <TableCell>Kebir</TableCell>
                                <TableCell>Hesap Adı</TableCell>
                                <TableCell align="right">Tutar</TableCell>
                                <TableCell align="right">Mizan Payı</TableCell>
                                <TableCell align="right">Genel Önem.</TableCell>
                                <TableCell>Tespit</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {detail.data.map((row: any, i: number) => (
                                <TableRow key={row.id || i}>
                                    <TableCell>{row.kebirKodu}</TableCell>
                                    <TableCell>{stripHtml(row.hesapAdi)}</TableCell>
                                    <TableCell align="right">{row.borcAlacakToplami?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell align="right">{row.borcAlacakToplamiMizanIcindekiPayi?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell align="right">{row.kabulEdilebilirYanlislikDuzeyi?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell>{stripHtml(row.tespit)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                );
            case "Orneklem":
                return (
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                                <TableCell>Kebir</TableCell>
                                <TableCell>Hesap Adı</TableCell>
                                <TableCell align="right">Borç</TableCell>
                                <TableCell align="right">B.Fiş N.</TableCell>
                                <TableCell align="right">Alacak</TableCell>
                                <TableCell align="right">A.Fiş N.</TableCell>
                                <TableCell align="right">Bakiye</TableCell>
                                <TableCell align="right">Örn.Say</TableCell>
                                <TableCell>Gelen</TableCell>
                                <TableCell>Güvenilirlik</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {detail.data.map((row: any, i: number) => (
                                <TableRow key={row.id || i}>
                                    <TableCell>{row.kebirKodu}</TableCell>
                                    <TableCell>{stripHtml(row.hesapAdi)}</TableCell>
                                    <TableCell align="right">{row.borc?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell align="right">{row.borcIslemSayisi?.toLocaleString("tr-TR")}</TableCell>
                                    <TableCell align="right">{row.alacak?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell align="right">{row.alacakIslemSayisi?.toLocaleString("tr-TR")}</TableCell>
                                    <TableCell align="right">{row.kalanBakiye?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell align="right">{row.orneklemSayisi}</TableCell>
                                    <TableCell>{stripHtml(row.listelemeTuru)}</TableCell>
                                    <TableCell>{stripHtml(row.guvenilirlikDuzeyi)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                );
            case "Risk":
                return (
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                                <TableCell>Risk Alanı</TableCell>
                                <TableCell>Tam Olma</TableCell>
                                <TableCell>Doğruluk</TableCell>
                                <TableCell>Var Olma</TableCell>
                                <TableCell>Değerleme</TableCell>
                                <TableCell>Dönem.</TableCell>
                                <TableCell>Geçer.</TableCell>
                                <TableCell>Sunum</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {detail.data.map((row: any, i: number) => {
                                const level = (val: string) => val === "3" ? "Yüksek" : val === "2" ? "Orta" : val === "1" ? "Önemsiz" : "Yok";
                                return (
                                    <TableRow key={row.id || i}>
                                        <TableCell>{row.finansalTabloHesaplar}</TableCell>
                                        <TableCell>{level(row.tamOlma)}</TableCell>
                                        <TableCell>{level(row.dogruluk)}</TableCell>
                                        <TableCell>{level(row.varOlma)}</TableCell>
                                        <TableCell>{level(row.degerleme)}</TableCell>
                                        <TableCell>{level(row.donemsellik)}</TableCell>
                                        <TableCell>{level(row.gecerlilik)}</TableCell>
                                        <TableCell>{level(row.sunumVeAciklama)}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                );
            case "Prosedur":
                return (
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                                <TableCell>Kategori</TableCell>
                                <TableCell>Konu</TableCell>
                                <TableCell>Açıklama</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {detail.data.map((row: any, i: number) => (
                                <TableRow key={row.id || i}>
                                    <TableCell>{row.kategori}</TableCell>
                                    <TableCell>{stripHtml(row.konu)}</TableCell>
                                    <TableCell>{stripHtml(row.aciklama)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                );
            case "Teknik":
                return (
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                                <TableCell>Başlık</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {detail.data.map((row: any, i: number) => (
                                <TableRow key={row.id || i}>
                                    <TableCell>{stripHtml(row.baslik)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                );
            default:
                return <Typography variant="caption">Detay gösterimi desteklenmiyor.</Typography>;
        }
    };

    if (loading) return <Box p={3}>Yükleniyor...</Box>;

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} className="no-print">
                <Typography variant="h4">{parentName} - Çalışma Kağıdı</Typography>
                <Button
                    variant="contained"
                    startIcon={<PrintIcon />}
                    onClick={handlePrint}
                >
                    Yazdır
                </Button>
            </Box>

            <Box id="printable-area">
                <Typography variant="h5" align="center" gutterBottom sx={{ display: 'none', '@media print': { display: 'block' }, mb: 4 }}>
                    {parentName} - Detaylı Çalışma Kağıdı
                </Typography>

                {reportData.map((detail, index) => (
                    <Box key={index} mb={5} sx={{ breakInside: "avoid" }}>
                        <Typography variant="h6" gutterBottom sx={{ borderBottom: "1px solid #ccc", pb: 1, mb: 2 }}>
                            {detail.documentName}
                        </Typography>

                        <TableContainer component={Paper} elevation={1} variant="outlined">
                            {renderContent(detail)}
                        </TableContainer>
                    </Box>
                ))}

                {reportData.length === 0 && (
                    <Typography>Bu grupta belge bulunamadı.</Typography>
                )}
            </Box>
            <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: white;
            color: black;
          }
          @page {
            margin: 1cm;
          }
          tr {
            break-inside: avoid;
          }
        }
      `}</style>
        </Box>
    );
};

export default CalismaKagidiRaporu;
