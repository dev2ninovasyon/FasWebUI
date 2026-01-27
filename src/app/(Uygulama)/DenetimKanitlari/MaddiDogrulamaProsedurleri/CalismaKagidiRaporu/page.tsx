"use client";

import React, { useEffect, useState, useCallback } from "react";
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
import { getMaddiDogrulama, getUygulananDenetimProsedurleri, getDipnotNoByDipnotAdi } from "@/api/MaddiDogrulama/MaddiDogrulama";
import {
    getMutabakatByDipnot,
    getOnemlilikByDipnot,
    getOrneklemByDipnot,
} from "@/api/DenetimKanitlari/DenetimKanitlari";
import { getCalismaKagidiVerileriByDenetciDenetlenenYil, getCalismaKagidiVerileriByDenetciDenetlenenYilDipnotNo } from "@/api/CalismaKagitlari/CalismaKagitlari";
import { getYabanciParaTestleriByDenetlenen } from "@/api/CalismaKagitlari/YabanciParaTestleri";
import { fetchAmortismanKontrolleri } from "@/api/CalismaKagitlari/AmortismanKontrolleri";
import { getEnvanterKontrolleri } from "@/api/CalismaKagitlari/EnvanterKontrolleri";
import { getMaliyetKontrolleri } from "@/api/CalismaKagitlari/MaliyetKontrolleri";
import { getDonusumKayitlari } from "@/api/CalismaKagitlari/DonusumKayitlariKontrol";
import FormOnayBolumu from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/FormOnayBolumu";
import PrintIcon from "@mui/icons-material/Print";
import { getSozlesmeTestleri } from "@/api/CalismaKagitlari/SozlesmeTestleri";
import { getSonrakiDonemTestleri } from "@/api/CalismaKagitlari/SonrakiDonemTestleri";
import { getStokDonemsellikTesti } from "@/api/CalismaKagitlari/StokDonemsellikTesti";
import { getStoklarNetGerceklesebilirDeger } from "@/api/CalismaKagitlari/StoklarNetGerceklesebilirDeger";
import { getHareketsizStoklarByDenetlenen } from "@/api/CalismaKagitlari/HareketsizStoklar";
import { getReeskontTestleri } from "@/api/CalismaKagitlari/ReeskontTestleri";

interface DenetimDosyaBelgeleriDto {
    id: number;
    name: string;
    children?: DenetimDosyaBelgeleriDto[];
}

interface DetailData {
    documentId: number;
    documentName: string;
    data: any;
    type: "Mutabakat" | "Onemlilik" | "Orneklem" | "Risk" | "Prosedur" | "Teknik"
    | "YabanciPara" | "Amortisman" | "Envanter" | "Maliyet" | "Donusum"
    | "SozlesmeTestleri" | "SonrakiDonemTestleri" | "StokDonemsellikTesti"
    | "StoklarNetGerceklesebilirDegerleri" | "HareketsizStoklar"
    | "ReeskontTestleri"
    | "Other";
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

    const stripHtml = (html: any) => {
        if (typeof html !== 'string') return html?.toString() || "";
        return html.replace(/<[^>]*>?/gm, '');
    };

    const fetchDetailData = async (
        item: DenetimDosyaBelgeleriDto,
        pName: string,
        dipnotNo: string
    ): Promise<DetailData> => {
        let data: any = [];
        let type: DetailData["type"] = "Other";

        const itemName = item.name;
        const toRows = (x: any) => (Array.isArray(x) ? x : Array.isArray(x?.data) ? x.data : Array.isArray(x?.result) ? x.result : []);
        const normalizedItemName = normalizeString(itemName);

        try {
            if (normalizedItemName.includes("mutabakat")) {
                type = "Mutabakat";
                const param = dipnotNo || pName;
                data = await getMutabakatByDipnot(
                    user.token || "",
                    user.denetciId || 0,
                    user.yil || 0,
                    user.denetlenenId || 0,
                    param
                );
            } else if (normalizedItemName.includes("onemlilik")) {
                type = "Onemlilik";
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
            } else if (normalizedItemName.includes("yabanciparatestleri")) {
                type = "YabanciPara";
                if (dipnotNo) {
                    data = await getYabanciParaTestleriByDenetlenen(
                        "YabanciParaTestleri",
                        user.token || "",
                        user.denetciId || 0,
                        user.yil || 0,
                        user.denetlenenId || 0,
                        dipnotNo,
                        pName
                    );
                }
            } else if (normalizedItemName.includes("amortismankontrolleri")) {
                type = "Amortisman";
                if (dipnotNo) {
                    const res = await fetchAmortismanKontrolleri(
                        user.token || "",
                        user.denetlenenId || 0,
                        user.yil || 0,
                        dipnotNo
                    );
                    if (res && res.success) {
                        data = res.data;
                    }
                }
            } else if (normalizedItemName.includes("envanterkontrolleri")) {
                type = "Envanter";
                if (dipnotNo) {
                    data = await getEnvanterKontrolleri(
                        user.denetlenenId || 0,
                        user.yil || 0,
                        dipnotNo
                    );
                }
            } else if (normalizedItemName.includes("maliyetkontrolleri")) {
                type = "Maliyet";
                if (dipnotNo) {
                    data = await getMaliyetKontrolleri(
                        user.denetlenenId || 0,
                        user.yil || 0,
                        dipnotNo
                    );
                }
            } else if (normalizedItemName.includes("donusumkayitlarikontrol")) {
                type = "Donusum";
                if (dipnotNo) {
                    const res = await getDonusumKayitlari(
                        "DonusumKayitlariKontrol",
                        user.token || "",
                        user.denetciId || 0,
                        user.denetlenenId || 0,
                        user.yil || 0,
                        dipnotNo
                    );
                    if (res) {
                        data = res;
                    }
                }
            }
            else if (normalizedItemName.includes("sonrakidonemtestleri")) {
                type = "SonrakiDonemTestleri";
                if (dipnotNo) {
                    data = await getSonrakiDonemTestleri(
                        user.denetlenenId || 0,
                        user.yil || 0,
                        dipnotNo
                    );
                }
            }
            else if (normalizedItemName.includes("sozlesmetestleri")) {
                type = "SozlesmeTestleri";
                if (dipnotNo) {
                    data = await getSozlesmeTestleri(
                        user.token || "",
                        user.denetciId || 0,
                        user.yil || 0,
                        user.denetlenenId || 0,
                        dipnotNo
                    );
                }
            }
            else if (normalizedItemName.includes("stokdonemselliktesti")) {
                type = "StokDonemsellikTesti";
                if (dipnotNo) {
                    data = await getStokDonemsellikTesti(
                        user.token || "",
                        user.denetlenenId || 0,
                    );
                }
            }
            else if (normalizedItemName.includes("stoklarnetgerceklesebilirdegerleri")) {
                type = "StoklarNetGerceklesebilirDegerleri";
                if (dipnotNo) {
                    data = await getStoklarNetGerceklesebilirDeger(
                        user.denetlenenId || 0,
                        user.yil || 0
                    );
                }
            }
            else if (normalizedItemName.includes("hareketsizstoklar")) {
                type = "HareketsizStoklar";
                if (dipnotNo) {
                    data = await getHareketsizStoklarByDenetlenen(
                        "HareketsizStoklar",
                        user.token || "",
                        user.denetciId || 0,
                        user.denetlenenId || 0,
                        user.yil || 0,
                    );
                }
            }
            else if (normalizedItemName.includes("reeskonttestleri")) {
                type = "ReeskontTestleri";
                if (dipnotNo) {
                    data = await getReeskontTestleri(
                        "ReeskontTestleri",
                        user.token || "",
                        user.denetciId || 0,
                        user.yil || 0,
                        user.denetlenenId || 0,
                        dipnotNo,
                        pName
                    );
                }
            }

        } catch (err) {
            console.warn(`Failed to fetch details for ${item.name}`, err);
        }
        const normalizedData =
            type === "Amortisman" || type === "Donusum"
                ? data
                : toRows(data);

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

                let dipnotNo = "";
                try {
                    const result = await getDipnotNoByDipnotAdi(
                        user.token || "",
                        user.denetciId || 0,
                        user.denetlenenId || 0,
                        user.yil || 0,
                        parentName,
                        user.denetimTuru === "Tfrs"
                    );
                    dipnotNo = result || "";
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
        const rows = Array.isArray(detail.data) ? detail.data : [];
        if (
            detail.type !== "Amortisman" &&
            detail.type !== "Donusum" &&
            rows.length === 0
        ) {
            return (
                <Typography variant="body2" color="textSecondary">
                    Veri yok
                </Typography>
            );
        }
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
                            {rows.map((row: any, i: number) => (
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
                            {rows.map((row: any, i: number) => (
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
                            {rows.map((row: any, i: number) => (
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
            case "Prosedur": {
                const groups = (detail.data ?? []).reduce((acc: Record<string, any[]>, row: any) => {
                    const key = row?.kategori ?? "Diğer";
                    (acc[key] ||= []).push(row);
                    return acc;
                }, {});

                const orderedCategories = Object.keys(groups).sort((a, b) => a.localeCompare(b, "tr"));

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
                            {orderedCategories.map((cat) => {
                                const rows = groups[cat];
                                return rows.map((row: any, i: number) => (
                                    <TableRow key={`${cat}-${row.id ?? i}`}>
                                        {/* 2) Kategori hücresini sadece ilk satırda bas ve rowSpan ver */}
                                        {i === 0 && (
                                            <TableCell
                                                rowSpan={rows.length}
                                                sx={{ verticalAlign: "top", fontWeight: 600, width: 260 }}
                                            >
                                                {cat}
                                            </TableCell>
                                        )}

                                        <TableCell>{stripHtml(row.konu)}</TableCell>
                                        <TableCell>{stripHtml(row.aciklama)}</TableCell>
                                    </TableRow>
                                ));
                            })}
                        </TableBody>
                    </Table>
                );
            }
            case "Teknik":
                return (
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                                <TableCell>Başlık</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row: any, i: number) => (
                                <TableRow key={row.id || i}>
                                    <TableCell>{stripHtml(row.baslik)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                );
            case "YabanciPara":
                return (
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                                <TableCell>Kebir</TableCell>
                                <TableCell>Detay</TableCell>
                                <TableCell>Hesap Adı</TableCell>
                                <TableCell align="right">Mizan Bakiye</TableCell>
                                <TableCell align="right">Hesaplanan</TableCell>
                                <TableCell align="right">Fark</TableCell>
                                <TableCell>Para Birimi</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row: any, i: number) => (
                                <TableRow key={row.id || i}>
                                    <TableCell>{row.kebirKodu}</TableCell>
                                    <TableCell>{row.detayKodu}</TableCell>
                                    <TableCell>{stripHtml(row.hesapAdi)}</TableCell>
                                    <TableCell align="right">{row.mizanBakiye?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell align="right">{row.hesaplananBakiye?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell align="right">{row.degisimTl?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell>{row.paraBirimi}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                );
            case "Amortisman":
                return (
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>Hesap Bakiyeleri</Typography>
                        <Table size="small" sx={{ mb: 3 }}>
                            <TableHead>
                                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                                    <TableCell>Hesap No</TableCell>
                                    <TableCell>Hesap Açıklaması</TableCell>
                                    <TableCell align="right">Açılış</TableCell>
                                    <TableCell align="right">Kapanış</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {detail.data.donusumMizanBobi?.filter((x: any) => x.detayKodu.length > 3).map((row: any, i: number) => (
                                    <TableRow key={i}>
                                        <TableCell>{row.detayKodu}</TableCell>
                                        <TableCell>{row.hesapAdi}</TableCell>
                                        <TableCell align="right">{row.bakiye?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                        <TableCell align="right">{row.bakiye?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Typography variant="subtitle2" gutterBottom>Kontrol Kayıtları</Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                                    <TableCell>Hesap No</TableCell>
                                    <TableCell align="right">Cari Dönem Gider</TableCell>
                                    <TableCell align="right">Tahmini Gider</TableCell>
                                    <TableCell align="right">Fark</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {detail.data.amortismanKontrolKayitlari?.map((row: any, i: number) => (
                                    <TableRow key={i}>
                                        <TableCell>{row.hesapNo}</TableCell>
                                        <TableCell align="right">{row.cariDonemAmortismanGideri?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                        <TableCell align="right">{row.cariDonemTahminiAmortismanGideri?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                        <TableCell align="right">{(row.cariDonemAmortismanGideri - row.cariDonemTahminiAmortismanGideri)?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                );
            case "Envanter":
                return (
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>Envanter-Mizan Karşılaştırması</Typography>
                        <Table size="small" sx={{ mb: 3 }}>
                            <TableHead>
                                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                                    <TableCell>Stok Kodu</TableCell>
                                    <TableCell>Stok Adı</TableCell>
                                    <TableCell align="right">Miktar</TableCell>
                                    <TableCell align="right">Tutar</TableCell>
                                    <TableCell align="right">Fark</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {detail.data.envanterMizanList?.map((row: any, i: number) => (
                                    <TableRow key={i} sx={{ fontWeight: row.isBold ? 'bold' : 'normal' }}>
                                        <TableCell>{row.stokKodu}</TableCell>
                                        <TableCell>{row.stokAdi}</TableCell>
                                        <TableCell align="right">{row.bakiyeMiktar?.toLocaleString("tr-TR")}</TableCell>
                                        <TableCell align="right">{row.kalanTutar?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                        <TableCell align="right">{row.fark?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                );
            case "Maliyet":
                return (
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                                <TableCell>Hesap No</TableCell>
                                <TableCell>Hesap Açıklaması</TableCell>
                                <TableCell align="right">Önceki Dönem</TableCell>
                                <TableCell align="right">Cari Dönem</TableCell>
                                <TableCell align="right">Değişim (%)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row: any, i: number) => (
                                <TableRow key={i} sx={{ fontWeight: row.isBold ? 'bold' : 'normal' }}>
                                    <TableCell>{row.hesapNo}</TableCell>
                                    <TableCell>{row.hesapAciklamasi}</TableCell>
                                    <TableCell align="right">{row.oncekiDonemBakiye?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell align="right">{row.cariDonemBakiye?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell align="right">{row.degisimYuzde?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}%</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                );
            case "Donusum":
                return (
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>Ana Hesaplar</Typography>
                        <Table size="small" sx={{ mb: 3 }}>
                            <TableHead>
                                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                                    <TableCell>Hesap No</TableCell>
                                    <TableCell align="right">VUK Bakiye</TableCell>
                                    <TableCell align="right">Dönüşüm Bakiye</TableCell>
                                    <TableCell align="right">Fark</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {detail.data.kayitlar?.filter((row: any) => (row.vukBakiye ?? 0) !== 0 || (row.donusumBakiye ?? 0) !== 0 || (row.fark ?? 0) !== 0).map((row: any, i: number) => (
                                    <TableRow key={i}>
                                        <TableCell>{row.kebirKodu}</TableCell>
                                        <TableCell align="right">{row.vukBakiye?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                        <TableCell align="right">{row.donusumBakiye?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                        <TableCell align="right">{row.fark?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Typography variant="subtitle2" gutterBottom>Dönüşüm Fişleri</Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                                    <TableCell>Hesap No</TableCell>
                                    <TableCell>Hesap Adı</TableCell>
                                    <TableCell align="right">Borç</TableCell>
                                    <TableCell align="right">Alacak</TableCell>
                                    <TableCell>Açıklama</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {detail.data.donusumFisler?.filter((row: any) => (row.borc ?? 0) !== 0 || (row.alacak ?? 0) !== 0).map((row: any, i: number) => (
                                    <TableRow key={i}>
                                        <TableCell>{row.hesapKodu}</TableCell>
                                        <TableCell>{stripHtml(row.hesapAdi)}</TableCell>
                                        <TableCell align="right">{row.borc?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                        <TableCell align="right">{row.alacak?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                        <TableCell>{stripHtml(row.aciklama)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                );
            case "SozlesmeTestleri":
                return (
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                                <TableCell>Hesap No</TableCell>
                                <TableCell>Hesap Açıklaması</TableCell>
                                <TableCell align="right">Mizan Bakiye</TableCell>
                                <TableCell align="right">Sözleşmedeki Bakiye</TableCell>
                                <TableCell align="right">Fark</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row: any, i: number) => (
                                <TableRow key={row.id || i}>
                                    <TableCell>{row.hesapNo ?? row.kebirKodu}</TableCell>
                                    <TableCell>{stripHtml(row.hesapAciklamasi ?? row.hesapAdi)}</TableCell>
                                    <TableCell align="right">{row.mizanBakiye?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell align="right">{row.sozlesmeBakiye?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell align="right">{row.fark?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                );

            case "ReeskontTestleri":
                return (
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                                <TableCell>Hesap No</TableCell>
                                <TableCell>Hesap Adı</TableCell>
                                <TableCell align="right">Mizan Bakiye</TableCell>
                                <TableCell align="right">Hesaplanan</TableCell>
                                <TableCell align="right">Fark</TableCell>
                                <TableCell>Not</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row: any, i: number) => (
                                <TableRow key={row.id || i}>
                                    <TableCell>{row.hesapNo ?? row.kebirKodu ?? row.detayKodu}</TableCell>
                                    <TableCell>{stripHtml(row.hesapAdi ?? row.hesapAciklamasi)}</TableCell>
                                    <TableCell align="right">{(row.mizanBakiye ?? row.bakiye)?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell align="right">{(row.hesaplananBakiye ?? row.hesaplanan)?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell align="right">{(row.fark ?? row.degisim)?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell>{stripHtml(row.aciklama ?? row.not)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                );

            case "SonrakiDonemTestleri":
                return (
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                                <TableCell>Hesap No</TableCell>
                                <TableCell>Hesap Adı</TableCell>
                                <TableCell align="right">Tarih</TableCell>
                                <TableCell align="right">Tutar</TableCell>
                                <TableCell>Açıklama</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row: any, i: number) => (
                                <TableRow key={row.id || i}>
                                    <TableCell>{row.hesapNo ?? row.kebirKodu ?? row.detayKodu}</TableCell>
                                    <TableCell>{stripHtml(row.hesapAdi ?? row.hesapAciklamasi)}</TableCell>
                                    <TableCell align="right">
                                        {(row.tarih ?? row.belgeTarihi ?? row.faturaTarihi)?.toString()?.split("T")[0]}
                                    </TableCell>
                                    <TableCell align="right">
                                        {(row.tutar ?? row.toplam ?? row.bedel)?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell>{stripHtml(row.aciklama ?? row.belgeNo ?? row.not)}</TableCell>
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

                <Box mt={8} mb={4}>
                    <FormOnayBolumu
                        controller={parentName || ""}
                        showKaliteKontrol={true}
                    />
                </Box>
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
