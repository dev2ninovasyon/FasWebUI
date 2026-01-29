"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
    Stepper,
    Step,
    StepLabel,
    Grid,
    Breadcrumbs,
    Link,
    IconButton,
    useTheme,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { IconLayoutGrid } from "@tabler/icons-react";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
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
import ReportHeader from "./header";
import ReportFooter from "./footer";
import FormOnayBolumu from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/FormOnayBolumu";
import { getFormHazirlayanOnaylayanByDenetciDenetlenenYilFormKodu } from "@/api/CalismaKagitlari/CalismaKagitlari";
import { getKullaniciById, getKullaniciByDenetlenenYilRol } from "@/api/Kullanici/KullaniciIslemleri";
import { getHareketsizTicariAlacaklarByDenetlenen } from "@/api/CalismaKagitlari/HareketsizTicariAlacaklar"

// Component Imports
import Onemlilik from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/Onemlilik";
import Orneklem from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/Orneklem";
import Mutabakat from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/Mutabakat";
import ReeskontTestleri from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/ReeskontTestleri";
import SupheliAlacakTestleri from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/SupheliAlacakTestleri";
import HareketsizStoklar from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/HareketsizStoklar";
import HareketsizTicariAlacaklar from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/HareketsizTicariAlacaklar";
import HasilatDonemsellikTesti from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/HasilatDonemsellikTesti";
import StokDonemsellikTesti from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/StokDonemsellikTesti";
import EnvanterKontrolleri from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/EnvanterKontrolleri";
import DegerlemeveDegerDusukluguKontrolleri from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/DegerlemeveDegerDusukluguKontrolleri";
import DonusumKayitlariKontrol from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/DonusumKayitlariKontrol";
import MaliyetKontrolleri from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/MaliyetKontrolleri";
import KidemTazminatiCalismasi from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/KidemTazminatiCalismasi";
import VarlikVeAmortismanOzetTablo from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/VarlikVeAmortismanOzetTablo";
import CekSenetTablosu from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/CekSenetTablosu";
import FaturaTestleriTablo from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/FaturaTestleri";
import AmortismanKontrolleri from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/AmortismanKontrolleri";
import KrediCalismasi from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/KrediCalismasi";
import SozlesmeTestleri from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/SozlesmeTestleri";
import StoklarNetGerceklesebilirDeger from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/StoklarNetGerceklesebilirDeger";
import HesaplaraIliskinUygulananDenetimTestleri from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/HesaplaraIliskinUygulananDenetimTestleri";
import SonrakiDonemTestleri from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/SonrakiDonemTestleri";
import YabanciParaTestleri from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/YabanciParaTestleri";
import RiskTespiti from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/RiskTespiti";
import DavaKarsiliklariCalismasi from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/DavaKarsiliklariCalismasi";
import UygulananDenetimProsedurleri from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/UygulananDenetimProsedurleri";
import UygulananDenetimTeknikleri from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/UygulananDenetimTeknikleri";
import MaddiDogrulamaYorumComponent from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaYorumComponent";


interface DenetimDosyaBelgeleriDto {
    id: number;
    name: string;
    children?: DenetimDosyaBelgeleriDto[];
}

interface DetailData {
    documentId: number;
    documentName: string;
    data: any[];
    type: string;
    childName?: string;
    parentName?: string;
    dipnotNo?: string;
    title?: string;
}

const SignatureTable = ({ data, denetlenen, yil }: { data: any, denetlenen: string, yil: number }) => {
    const theme = useTheme();
    const formatDate = (dateStr: string) => dateStr ? new Date(dateStr).toLocaleDateString("tr-TR") : "";

    const h = data?.hazirlayan;
    const o = data?.onaylayan;
    const k = data?.kalite;

    const tableStyle: React.CSSProperties = {
        width: "100%",
        borderCollapse: "collapse",
        marginBottom: "20px",
        border: `1px solid ${theme.palette.divider}`,
        fontSize: "12px",
        fontFamily: "Arial, sans-serif",
        color: theme.palette.text.primary,
    };

    const cellStyle: React.CSSProperties = {
        border: `1px solid ${theme.palette.divider}`,
        padding: "5px",
    };

    const headerCellStyle: React.CSSProperties = {
        ...cellStyle,
        fontWeight: "bold",
        backgroundColor: theme.palette.action.hover,
    };

    return (
        <table style={tableStyle} className="report-table">
            <tbody>
                <tr>
                    <td style={{ ...cellStyle, fontWeight: "bold", width: "200px" }}>Denetlenen Şirketin Unvanı</td>
                    <td style={{ ...cellStyle, width: "10px" }}>:</td>
                    <td style={cellStyle} colSpan={2}>{denetlenen}</td>
                </tr>
                <tr>
                    <td style={{ ...cellStyle, fontWeight: "bold" }}>Denetim Dönemi</td>
                    <td style={cellStyle}>:</td>
                    <td style={cellStyle} colSpan={2}>{yil}</td>
                </tr>
                {/* HAZIRLAYAN */}
                <tr>
                    <td style={headerCellStyle} colSpan={4}>HAZIRLAYAN</td>
                </tr>
                <tr>
                    <td style={cellStyle}>Unvanı</td>
                    <td style={cellStyle}>:</td>
                    <td style={cellStyle} colSpan={2}>{h?.unvan}</td>
                </tr>
                <tr>
                    <td style={cellStyle}>Adı Soyadı</td>
                    <td style={cellStyle}>:</td>
                    <td style={cellStyle} colSpan={2}>{h?.adSoyad}</td>
                </tr>
                <tr>
                    <td style={cellStyle}>Tarih</td>
                    <td style={cellStyle}>:</td>
                    <td style={cellStyle}>{formatDate(h?.tarih)}</td>
                    <td style={{ ...cellStyle, textAlign: "right" }}>İMZA: __________________</td>
                </tr>
                {/* ONAYLAYAN */}
                <tr>
                    <td style={headerCellStyle} colSpan={4}>ONAYLAYAN</td>
                </tr>
                <tr>
                    <td style={cellStyle}>Unvanı</td>
                    <td style={cellStyle}>:</td>
                    <td style={cellStyle} colSpan={2}>{o?.unvan}</td>
                </tr>
                <tr>
                    <td style={cellStyle}>Adı Soyadı</td>
                    <td style={cellStyle}>:</td>
                    <td style={cellStyle} colSpan={2}>{o?.adSoyad}</td>
                </tr>
                <tr>
                    <td style={cellStyle}>Tarih</td>
                    <td style={cellStyle}>:</td>
                    <td style={cellStyle}>{formatDate(o?.tarih)}</td>
                    <td style={{ ...cellStyle, textAlign: "right" }}>İMZA: __________________</td>
                </tr>
                {/* KALİTE KONTROL */}
                <tr>
                    <td style={headerCellStyle} colSpan={4}>KALİTE KONTROL</td>
                </tr>
                <tr>
                    <td style={cellStyle}>Unvanı</td>
                    <td style={cellStyle}>:</td>
                    <td style={cellStyle} colSpan={2}>{k?.unvan}</td>
                </tr>
                <tr>
                    <td style={cellStyle}>Adı Soyadı</td>
                    <td style={cellStyle}>:</td>
                    <td style={cellStyle} colSpan={2}>{k?.adSoyad}</td>
                </tr>
                <tr>
                    <td style={cellStyle}>Tarih</td>
                    <td style={cellStyle}>:</td>
                    <td style={cellStyle}>{formatDate(k?.tarih)}</td>
                    <td style={{ ...cellStyle, textAlign: "right" }}>İMZA: __________________</td>
                </tr>
            </tbody>
        </table>
    );
};

const steps = ["Görüş Düzenleme", "Bağımsız Denetçi Raporu"];

const removeTurkishChars = (str: string | undefined | null) => {
    if (!str) return "";
    return str
        .replace(/\s/g, "")
        .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
        .replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ç/g, "c")
        .replace(/İ/g, "I").replace(/Ö/g, "O").replace(/Ü/g, "U")
        .replace(/Ş/g, "S").replace(/Ğ/g, "G").replace(/Ç/g, "C");
};

const CalismaKagidiRaporu = () => {
    const searchParams = useSearchParams();
    const parentName = searchParams.get("parentName");
    const router = useRouter();

    const user = useSelector((state: AppState) => state.userReducer);
    const theme = useTheme();
    const [reportData, setReportData] = useState<DetailData[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeStep, setActiveStep] = useState(0);
    const [signatureData, setSignatureData] = useState<any>(null);

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
                    dipnotNo
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
                    dipnotNo
                );
            } else if (normalizedItemName.includes("orneklem")) {
                type = "Orneklem";
                const param = dipnotNo || pName;
                data = await getOrneklemByDipnot(
                    user.token || "",
                    user.denetciId || 0,
                    user.denetlenenId || 0,
                    user.yil || 0,
                    dipnotNo
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
            else if (normalizedItemName.includes("reeskonttestleri")) {
                type = "ReeskontTestleri";
            }
            else if (normalizedItemName.includes("suphelialacaktestleri")) {
                type = "SupheliAlacakTestleri";
            }
            else if (normalizedItemName.includes("hareketsizstoklar")) {
                type = "HareketsizStoklar";
            }
            else if (normalizedItemName.includes("hareketsizticari")) {
                type = "HareketsizTicariAlacaklar";
            }
            else if (normalizedItemName.includes("hasilatdonemselliktesti")) {
                type = "HasilatDonemsellikTesti";
            }
            else if (normalizedItemName.includes("stokdonemselliktesti")) {
                type = "StokDonemsellikTesti";
            }
            else if (normalizedItemName.includes("envanterkontrolleri")) {
                type = "EnvanterKontrolleri";
            }
            else if (normalizedItemName.includes("degerlemevedeger")) {
                type = "DegerlemeveDegerDusukluguKontrolleri";
            }
            else if (normalizedItemName.includes("donusumkayitlari")) {
                type = "DonusumKayitlariKontrol";

            }
            else if (normalizedItemName.includes("maliyetkontrolleri")) {
                type = "MaliyetKontrolleri";
            }
            else if (normalizedItemName.includes("kidemtazminati")) {
                type = "KidemTazminatiCalismasi";
            }
            else if (normalizedItemName.includes("varlikveamortisman")) {
                type = "VarlikVeAmortismanOzetTablo";
            }
            else if (normalizedItemName.includes("ceksenettablosu")) {
                type = "CeksenetTablosu";
            }
            else if (normalizedItemName.includes("faturatestleri")) {
                type = "FaturaTestleri";
            }
            else if (normalizedItemName.includes("amortismankontrolleri")) {
                type = "AmortismanKontrolleri";
            }
            else if (normalizedItemName.includes("kredicalismasi")) {
                type = "KrediCalismasi";
            }
            else if (normalizedItemName.includes("sozlesmetestleri")) {
                type = "SozlesmeTestleri";
            }
            else if (normalizedItemName.includes("stoklarnetgerceklesebilirdeger")) {
                type = "StoklarNetGerceklesebilirDeger";
            }
            else if (normalizedItemName.includes("hesaplara")) {
                type = "HesaplaraIliskinUygulananDenetimTestleri";
                data = [];
            }
            else if (normalizedItemName.includes("sonrakidonemtestleri")) {
                type = "SonrakiDonemTestleri";
            }
            else if (normalizedItemName.includes("yabanciparatestleri")) {
                type = "YabanciParaTestleri";
                data = [];
            }
            else if (normalizedItemName.includes("davakarsiliklari")) {
                type = "DavaKarsiliklariCalismasi";
            }
            else if (normalizedItemName.includes("maddidogrulamayorum")) {
                type = "MaddiDogrulamaYorumComponent";
            }


        } catch (err) {
            console.warn(`Failed to fetch details for ${item.name}`, err);
        }

        return {
            documentId: item.id,
            documentName: item.name,
            data,
            type,
            childName: itemName,
            parentName: pName,
            dipnotNo: dipnotNo,
            title: itemName,
        };
    };

    const fetchSignatureData = async () => {
        if (!user.token || !parentName) return;

        const formKodu = decodeURIComponent(parentName);

        try {
            const formData = await getFormHazirlayanOnaylayanByDenetciDenetlenenYilFormKodu(
                user.token,
                user.denetciId || 0,
                user.denetlenenId || 0,
                user.yil || 0,
                formKodu
            );

            // Fallback people from roles
            const [fallbackHazirlayanlar, fallbackOnaylayanlar, fallbackKaliteler] = await Promise.all([
                getKullaniciByDenetlenenYilRol(user.token, user.denetlenenId || 0, user.yil || 0, "Hazırlayan"),
                getKullaniciByDenetlenenYilRol(user.token, user.denetlenenId || 0, user.yil || 0, "Onaylayan"),
                getKullaniciByDenetlenenYilRol(user.token, user.denetlenenId || 0, user.yil || 0, "Kalite Kontrol"),
            ]);

            // Fetch task assignments for specific preparer fallback
            const gorevAtamalari = await getCalismaKagidiVerileriByDenetciDenetlenenYil(
                "MaddiDogrulukGorevAtamalari",
                user.token,
                user.denetciId || 0,
                user.denetlenenId || 0,
                user.yil || 0
            );

            const matchingGorev = gorevAtamalari?.find(
                (g: any) => normalizeString(g?.maddiDogruluk ?? "") === normalizeString(formKodu)
            );

            let assignedHazirlayan = null;
            if (matchingGorev?.gorevliId) {
                assignedHazirlayan = await getKullaniciById(user.token, matchingGorev.gorevliId);
            }

            const [hazirlayan, onaylayan, kalite] = await Promise.all([
                formData?.hazirlayanId ? getKullaniciById(user.token, formData.hazirlayanId) : Promise.resolve(assignedHazirlayan || (fallbackHazirlayanlar?.[0] || null)),
                formData?.onaylayanId ? getKullaniciById(user.token, formData.onaylayanId) : Promise.resolve(fallbackOnaylayanlar?.[0] || null),
                formData?.kontrolEdenId ? getKullaniciById(user.token, formData.kontrolEdenId) : Promise.resolve(fallbackKaliteler?.[0] || null),
            ]);

            setSignatureData({
                hazirlayan: hazirlayan ? {
                    adSoyad: hazirlayan.personelAdi,
                    unvan: hazirlayan.unvan,
                    tarih: formData?.hazirlanmaTarihi || matchingGorev?.bitisTarihi
                } : null,
                onaylayan: onaylayan ? {
                    adSoyad: onaylayan.personelAdi,
                    unvan: onaylayan.unvan,
                    tarih: formData?.onaylanmaTarihi
                } : null,
                kalite: kalite ? {
                    adSoyad: kalite.personelAdi,
                    unvan: kalite.unvan,
                    tarih: formData?.kontrolTarihi
                } : null,
            });
        } catch (e) {
            console.log("fetchSignatureData error:", e);
        }
    };

    const handleGenerateReport = async () => {
        setLoading(true);
        try {
            await fetchSignatureData();

            await fetchData();

            setActiveStep(1);
        } finally {
            setLoading(false);
        }
    };
    const handleNext = () => {
        setActiveStep((s) => Math.min(s + 1, steps.length - 1));
    };

    const handleBack = () => {
        setActiveStep((s) => Math.max(s - 1, 0));
    };

    const handleStepClick = (index: number) => {
        setActiveStep(index);
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
                        console.log("Eşleşen Dipnot No:", dipnotNo); // Tarayıcı konsolunda (F12) bunu kontrol edin
                    } else {
                        console.warn("DİKKAT: Dipnot eşleşmesi sağlanamadı! ParentName:", parentName);
                    }
                } catch (e) {
                    console.log("Failed to fetch dipnotNo", e);
                }


                let finalDetails: DetailData[] = [];

                if (group && group.children) {
                    const details = await Promise.all(
                        group.children.map((child) =>
                            fetchDetailData(child, parentName, dipnotNo)
                        )
                    );
                    finalDetails = details.filter(d => {
                        if (d.type === "YabanciParaTestleri") return true;
                        if (d.type === "DonusumKayitlariKontrol") return true;
                        if (d.type === "HesaplaraIliskinUygulananDenetimTestleri") return true;
                        if (d.type === "ReeskontTestleri") return true;
                        if (d.type === "SupheliAlacakTestleri") return true;
                        if (d.type === "CekSenetTablosu") return true;
                        if (d.type === "FaturaTestleri") return true;
                        if (d.type === "SonrakiDonemTestleri") return true;
                        if (d.type === "StoklarNetGerceklesebilirDeger") return true;
                        if (d.type === "HareketsizStoklar") return true;
                        if (d.type === "HareketsizTicariAlacaklar") return true;
                        if (d.type === "StokDonemsellikTesti") return true;
                        if (d.type === "HasilatDonemsellikTesti") return true;
                        if (d.type === "EnvanterKontrolleri") return true;
                        if (d.type === "MaliyetKontrolleri") return true;
                        if (d.type === "KidemTazminatiCalismasi") return true;
                        if (d.type === "MaddiDogrulamaYorumComponent") return true;
                        if (d.type === "Risk") return true;
                        if (d.type === "Prosedur") return true;
                        if (d.type === "Teknik") return true;
                        if (d.type === "Mutabakat") return true;
                        if (d.data === null || d.data === undefined) return false;
                        if (Array.isArray(d.data)) return d.data.length > 0;
                        return true;
                    });
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
                                type: "Onemlilik",
                                parentName: parentName,
                                dipnotNo: dipnotNo,
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
                                type: "Orneklem",
                                parentName: parentName,
                                dipnotNo: dipnotNo,
                            });
                        }
                    } catch (e) { console.log("Force fetch orneklem failed", e) }
                }

                setReportData(finalDetails);
            }
        } catch (error) {
            console.log("Error fetching report data:", error);
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
        const currentDipnotNo = detail.dipnotNo || (detail.data && detail.data.length > 0 && detail.data[0].dipnotNo ? detail.data[0].dipnotNo : "");
        const currentParentName = detail.parentName || parentName || "";
        const currentChildName = detail.childName || "";
        const currentTitle = decodeURIComponent(detail.title || "");

        switch (detail.type) {
            case "Mutabakat":
                return <Mutabakat dipnot={currentDipnotNo} isReport={true} />;
            case "Onemlilik":
                return <Onemlilik dipnot={currentDipnotNo} isReport={true} />;
            case "Orneklem":
                return <Orneklem dipnot={currentDipnotNo} isReport={true} />;
            case "ReeskontTestleri":
                return <ReeskontTestleri dipnotNo={currentDipnotNo} modelAdi={currentParentName} isReport={true} />;
            case "SupheliAlacakTestleri":
                return <SupheliAlacakTestleri
                    dipnotNo={currentDipnotNo}
                    modelAdi={currentParentName}
                    isClickedVarsayilanaDon={false}
                    setIsClickedVarsayilanaDon={() => { }}
                    isReport={true}
                />;
            case "HareketsizStoklar":
                return <HareketsizStoklar
                    controller={currentChildName}
                    dipnotAdi={currentTitle}
                    dipnotNo={currentDipnotNo}
                    modelAdi={currentParentName}
                    setDip={() => { }}
                    isReport={true}
                />;
            case "HareketsizTicariAlacaklar":
                return <HareketsizTicariAlacaklar
                    controller="DonusumKayitlariKontrol"
                    dipnotAdi={currentTitle}
                    dipnotNo={currentDipnotNo}
                    modelAdi={currentParentName}
                    setDip={() => { }}
                    isReport={true}
                />;
            case "HasilatDonemsellikTesti":
                return <HasilatDonemsellikTesti
                    parentName={currentParentName}
                    childName={currentChildName}
                    dipnotNo={currentDipnotNo}
                    isReport={true}
                />;
            case "StokDonemsellikTesti":
                return <StokDonemsellikTesti
                    parentName={currentParentName}
                    childName={currentChildName}
                    dipnotNo={currentDipnotNo}
                    isReport={true}
                />;
            case "EnvanterKontrolleri":
                return <EnvanterKontrolleri
                    parentName={currentParentName}
                    childName={currentChildName}
                    dipnotNo={currentDipnotNo}
                    isReport={true}
                />;
            case "DegerlemeveDegerDusukluguKontrolleri":
                return <DegerlemeveDegerDusukluguKontrolleri
                    parentName={currentParentName}
                    childName={currentChildName}
                    dipnotNo={currentDipnotNo}
                    isReport={true}
                />;

            case "DonusumKayitlariKontrol":
                return <DonusumKayitlariKontrol
                    controller="DonusumKayitlariKontrol"
                    dipnotNo={currentDipnotNo}
                    isReport={true}
                />;
            case "MaliyetKontrolleri":
                return <MaliyetKontrolleri
                    parentName={currentParentName}
                    childName={currentChildName}
                    dipnotNo={currentDipnotNo}
                    isReport={true}
                />;
            case "KidemTazminatiCalismasi":
                return <KidemTazminatiCalismasi
                    parentName={currentParentName}
                    childName={currentChildName}
                    dipnotNo={currentDipnotNo}
                    isReport={true}
                />;
            case "VarlikVeAmortismanOzetTablo":
                return <VarlikVeAmortismanOzetTablo
                    parentName={currentParentName}
                    childName={currentChildName}
                    dipnotNo={currentDipnotNo}
                    isReport={true}
                />;
            case "CekSenetTablosu":
                return <CekSenetTablosu
                    dipnotNo={currentDipnotNo}
                    isReport={true}
                />;
            case "FaturaTestleri":
                return <FaturaTestleriTablo
                    dipnotNo={currentDipnotNo}
                    isReport={true}
                />;
            case "AmortismanKontrolleri":
                return <AmortismanKontrolleri
                    token={user.token || ""}
                    denetlenenId={user.denetlenenId || 0}
                    yil={user.yil || 0}
                    dipnotNo={currentDipnotNo}
                    isReport={true}
                />;
            case "KrediCalismasi":
                return <KrediCalismasi
                    parentName={currentParentName}
                    childName={currentChildName}
                    dipnotNo={currentDipnotNo}
                    isReport={true}
                />;
            case "SozlesmeTestleri":
                return <SozlesmeTestleri
                    dipnotNo={currentDipnotNo}
                    modelAdi={currentParentName}
                    isClickedVarsayilanaDon={false}
                    setIsClickedVarsayilanaDon={() => { }}
                    isReport={true}
                />;
            case "StoklarNetGerceklesebilirDeger":
                return <StoklarNetGerceklesebilirDeger
                    parentName={currentParentName}
                    childName={currentChildName}
                    isReport={true}
                />;
            case "HesaplaraIliskinUygulananDenetimTestleri":
                return <HesaplaraIliskinUygulananDenetimTestleri
                    controller="HesaplaraIliskinUygulananDenetimTestleri"
                    dipnotAdi={currentTitle}
                    dipnotNo={currentDipnotNo}
                    modelAdi={currentParentName}
                    setDip={() => { }}
                    isReport={true}
                />;
            case "SonrakiDonemTestleri":
                return <SonrakiDonemTestleri
                    parentName={currentParentName}
                    childName={currentChildName}
                    dipnotNo={currentDipnotNo}
                    isReport={true}
                />;
            case "YabanciParaTestleri":
                console.log("DEBUG - Rapor Parametreleri:", {
                    dipnotNo: currentDipnotNo,
                    parent: currentParentName
                });
                return <YabanciParaTestleri
                    controller="YabanciParaTestleri"
                    dipnotNo={currentDipnotNo}
                    dipnotAdi={currentTitle}
                    modelAdi={currentParentName}
                    setDip={() => { }}
                    isReport={true}
                />;
            case "RiskTespiti":
                return <RiskTespiti
                    controller={currentChildName}
                    dipnotAdi={currentTitle}
                    setDip={() => { }}
                    isReport={true}
                />;
            case "DavaKarsiliklariCalismasi":
                return <DavaKarsiliklariCalismasi
                    dipnotNo={currentDipnotNo}
                    isReport={true}
                />;
            case "UygulananDenetimProsedurleri":
                return <UygulananDenetimProsedurleri
                    controller={currentChildName}
                    alanAdi1=""
                    alanAdi2=""
                    alanAdi3=""
                    isClickedVarsayilanaDon={false}
                    setIsClickedVarsayilanaDon={() => { }}
                    setTamamlanan={() => { }}
                    setToplam={() => { }}
                    dipnotAdi={currentTitle}
                    setDip={() => { }}
                    isReport={true}
                />;
            case "UygulananDenetimTeknikleri":
                return <UygulananDenetimTeknikleri
                    controller={currentChildName}
                    isClickedVarsayilanaDon={false}
                    setIsClickedVarsayilanaDon={() => { }}
                    setTamamlanan={() => { }}
                    setToplam={() => { }}
                    dipnotNo={currentDipnotNo}
                    isReport={true}
                />;
            case "MaddiDogrulamaYorumComponent":
                return <MaddiDogrulamaYorumComponent
                    parentName={currentParentName}
                    childName={currentChildName}
                    isReport={true}
                />;
            case "Risk": // Keep existing Risk rendering if no dedicated component
                if (!detail.data || detail.data.length === 0) return <Typography variant="body2" color="textSecondary">Veri yok</Typography>;
                return (
                    <Box>
                        <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: "bold", mb: 2 }}>
                            {detail.documentName}
                        </Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
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
                    </Box>
                );
            case "Prosedur":
                if (!detail.data || detail.data.length === 0) return <Typography variant="body2" color="textSecondary">Veri yok</Typography>;

                // Group by category
                const groupedData: { [key: string]: any[] } = {};
                detail.data.forEach((row: any) => {
                    const cat = row.kategori || "Diğer";
                    if (!groupedData[cat]) groupedData[cat] = [];
                    groupedData[cat].push(row);
                });

                return (
                    <Box>
                        <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: "bold", mb: 2 }}>
                            {detail.documentName}
                        </Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: theme.palette.background.paper }}>
                                    <TableCell sx={{ color: theme.palette.text.primary, fontWeight: "bold" }}>Kategori</TableCell>
                                    <TableCell sx={{ color: theme.palette.text.primary, fontWeight: "bold" }}>Konu</TableCell>
                                    <TableCell sx={{ color: theme.palette.text.primary, fontWeight: "bold" }}>Açıklama</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.keys(groupedData).map((category) => (
                                    groupedData[category].map((row: any, index: number) => (
                                        <TableRow key={row.id || `${category}-${index}`}>
                                            {index === 0 && (
                                                <TableCell rowSpan={groupedData[category].length} sx={{ verticalAlign: 'top', fontWeight: 'bold' }}>
                                                    {category}
                                                </TableCell>
                                            )}
                                            <TableCell>{stripHtml(row.konu)}</TableCell>
                                            <TableCell>{stripHtml(row.aciklama)}</TableCell>
                                        </TableRow>
                                    ))
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                );
            case "Teknik": // Keep existing Teknik rendering if no dedicated component
                if (!detail.data || detail.data.length === 0) return <Typography variant="body2" color="textSecondary">Veri yok</Typography>;
                return (
                    <Box>
                        <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: "bold", mb: 2 }}>
                            {detail.documentName}
                        </Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
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
                    </Box>
                );
            default:
                return <Typography variant="caption">Detay gösterimi desteklenmiyor.</Typography>;
        }
    };

    if (loading) return <Box p={3}>Çalışma Kağıdı Oluşturuluyor...</Box>;

    return (
        <Box p={3}>
            <Box className="no-print" sx={{ mb: 3 }}>
                <Breadcrumb
                    title={`${parentName} - Çalışma Kağıdı`}
                    items={[
                        {
                            to: "/DenetimKanitlari/MaddiDogrulamaProsedurleri",
                            title: "Maddi Doğrulama Prosedürleri",
                        },
                        {
                            to: `/DenetimKanitlari/MaddiDogrulamaProsedurleri/${removeTurkishChars(parentName)}?title=${encodeURIComponent(parentName || "")}`,
                            title: parentName || "",
                        },
                    ]}
                >
                    <IconButton
                        color="primary"
                        onClick={() => router.push(`/DenetimKanitlari/MaddiDogrulamaProsedurleri/${removeTurkishChars(parentName)}?title=${encodeURIComponent(parentName || "")}`)}
                        sx={{
                            backgroundColor: "primary.light",
                            borderRadius: "8px",
                            "&:hover": {
                                backgroundColor: "primary.main",
                                color: "white",
                            },
                        }}
                    >
                        <IconLayoutGrid size={20} />
                    </IconButton>
                </Breadcrumb>
            </Box>

            <Box className="no-print" sx={{ mb: 4, mt: 2 }}>
                <Stepper
                    activeStep={activeStep}
                    sx={{
                        flexWrap: { xs: "wrap", sm: "nowrap" },
                        width: "100%",
                        justifyContent: "center",
                    }}>
                    {steps.map((label, index) => (
                        <Step key={label}>
                            <StepLabel onClick={() => handleStepClick(index)} sx={{ cursor: "pointer" }}>
                                {label}
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>

            {activeStep === 0 && (
                <Box>
                    <FormOnayBolumu
                        controller={parentName || ""}
                        showHazirlayan={true}
                        showOnaylayan={true}
                        showKaliteKontrol={true}
                    />
                </Box>
            )}

            {activeStep === 1 && (
                <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} className="no-print">
                        <Typography variant="h4">{parentName} - Çalışma Kağıdı</Typography>
                        <Box>
                            <Button
                                variant="contained"
                                startIcon={<PrintIcon />}
                                onClick={handlePrint}
                            >
                                Yazdır
                            </Button>
                        </Box>
                    </Box>

                    <Box id="printable-area" sx={{ bgcolor: theme.palette.background.paper, p: 4 }}>
                        <ReportHeader
                            denetlenenId={user.denetlenenId || 0}
                            yil={user.yil || 0}
                            denetciName={""}
                            denetlenenName={""}
                            reportName={`${parentName} - Çalışma Kağıdı `}
                        />

                        <SignatureTable
                            data={signatureData}
                            denetlenen={user.denetlenenFirmaAdi || ""}
                            yil={user.yil || 0}
                        />

                        {reportData.map((detail, index) => (
                            <Box key={index} mb={3} sx={{ breakInside: "avoid", pageBreakAfter: "always" }}>
                                <Typography variant="h6" gutterBottom sx={{
                                    bgcolor: theme.palette.background.paper,
                                    color: theme.palette.text.primary,
                                    p: 1.5,
                                    borderRadius: 1,
                                    mb: 3,
                                    boxShadow: theme.palette.mode === 'dark' ? "0 2px 4px rgba(255,255,255,0.1)" : "0 2px 4px rgba(0,0,0,0.1)"
                                }}>
                                    {/* {detail.documentName} */}
                                </Typography>

                                <Box sx={{ mb: 2 }}>
                                    {renderContent(detail)}
                                </Box>
                            </Box>
                        ))}

                        {reportData.length === 0 && (
                            <Typography align="center" sx={{ py: 10, bgcolor: theme.palette.action.hover, borderRadius: 2 }}>
                                Bu grupta belge bulunamadı.
                            </Typography>
                        )}

                        <ReportFooter />
                    </Box>
                </Box>
            )}

            <Box display="flex" justifyContent="space-between" mt={3} className="no-print">
                <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    variant="outlined"
                    sx={{
                        width: 110,
                        fontSize: 13,
                        px: 0.25,
                        py: 0.25,
                        minHeight: 30,
                        lineHeight: 1,
                    }}
                >
                    Önceki
                </Button>


                <Button
                    disabled={activeStep === steps.length - 1}
                    variant="outlined"
                    size="large"
                    onClick={handleGenerateReport}
                    sx={{
                        width: 130,
                        fontSize: 13,
                        px: 0.25,
                        py: 0.25,
                        minHeight: 30,
                        lineHeight: 1,
                    }}
                >
                    Raporu Oluştur
                </Button>
            </Box>

            <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            visibility: hidden;
            height: auto !important;
            overflow: visible !important;
          }
          #printable-area {
            visibility: visible !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto !important;
            overflow: visible !important;
            background: white !important;
            color: black !important;
          }
          #printable-area * {
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
            color: black !important;
            background-color: transparent !important;
            border-color: black !important;
          }
          .report-table, .report-table td, .report-table th {
            border: 1px solid black !important;
            color: black !important;
          }
          table {
            width: 100% !important;
            table-layout: auto !important;
          }
          .MuiTableContainer-root {
            overflow: visible !important;
            height: auto !important;
            width: 100% !important;
          }
          .handsontable {
            height: auto !important;
            overflow: visible !important;
          }
          .ht_master, .ht_clone_left, .ht_clone_top, .ht_clone_bottom, .ht_clone_top_left_corner {
            overflow: visible !important;
          }
          .wtHolder {
            height: auto !important;
            width: 100% !important;
            overflow: visible !important;
          }
          @page {
            margin: 1cm;
            size: auto;
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
