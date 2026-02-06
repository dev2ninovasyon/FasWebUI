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
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
// LoadingButton import removed
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { IconLayoutGrid, IconFileTypeDocx, IconFileTypePdf, IconArchive, IconEye, IconDownload, IconChevronDown } from "@tabler/icons-react";
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
import { getLogo } from "@/api/Denetci/Denetci";

import axios from "axios";
import { enqueueSnackbar } from "notistack";
import jsPDF from "jspdf";
import Script from "next/script";
import { base64FontBold, base64FontRegular } from "@/app/(Uygulama)/components/Rapor/BagimsizDenetciRaporu/Roboto";
import { Card, CardContent, Divider, Stack } from "@mui/material";
import { url } from "@/api/apiBase";

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
    reference?: string;
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

const steps = ["Onay", "Çalışma Kağıdı"];

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
    const [logo, setLogo] = useState<string | null>(null);
    const [referansNo, setReferansNo] = useState<string>("");

    const [downloadMenuAnchor, setDownloadMenuAnchor] = useState<null | HTMLElement>(null);
    const isDownloadMenuOpen = Boolean(downloadMenuAnchor);

    const handleDownloadClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setDownloadMenuAnchor(event.currentTarget);
    };
    const handleDownloadClose = () => {
        setDownloadMenuAnchor(null);
    };

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
                data = await getMutabakatByDipnot(user.denetciId || 0,
                    user.yil || 0,
                    user.denetlenenId || 0,
                    dipnotNo
                );
            } else if (normalizedItemName.includes("onemlilik")) {
                type = "Onemlilik";
                // Uses dipnotNo if available, otherwise fallback to pName (though logic suggests dipnotNo is required)
                const param = dipnotNo || pName;
                data = await getOnemlilikByDipnot(user.denetciId || 0,
                    user.denetlenenId || 0,
                    user.yil || 0,
                    dipnotNo
                );
            } else if (normalizedItemName.includes("orneklem")) {
                type = "Orneklem";
                const param = dipnotNo || pName;
                data = await getOrneklemByDipnot(user.denetciId || 0,
                    user.denetlenenId || 0,
                    user.yil || 0,
                    dipnotNo
                );
            } else if (normalizedItemName.includes("risktespiti") || normalizedItemName === "risk") {
                type = "Risk";
                const allRiskData = await getCalismaKagidiVerileriByDenetciDenetlenenYil(
                    "FinansalTablolarDenetimRiskiBelirleme",
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
                const allProcs = await getUygulananDenetimProsedurleri(user.denetciId || 0,
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
        if (!parentName) return;

        const formKodu = decodeURIComponent(parentName);

        try {
            const formData = await getFormHazirlayanOnaylayanByDenetciDenetlenenYilFormKodu(
                user.denetciId || 0,
                user.denetlenenId || 0,
                user.yil || 0,
                formKodu
            );

            // Fallback people from roles
            const [fallbackHazirlayanlar, fallbackOnaylayanlar, fallbackKaliteler] = await Promise.all([
                getKullaniciByDenetlenenYilRol(user.denetlenenId || 0, user.yil || 0, "Hazırlayan"),
                getKullaniciByDenetlenenYilRol(user.denetlenenId || 0, user.yil || 0, "Onaylayan"),
                getKullaniciByDenetlenenYilRol(user.denetlenenId || 0, user.yil || 0, "Kalite Kontrol"),
            ]);

            // Fetch task assignments for specific preparer fallback
            const gorevAtamalari = await getCalismaKagidiVerileriByDenetciDenetlenenYil(
                "MaddiDogrulukGorevAtamalari",
                user.denetciId || 0,
                user.denetlenenId || 0,
                user.yil || 0 // Explicitly 4 arguments
            );

            const matchingGorev = gorevAtamalari?.find(
                (g: any) => normalizeString(g?.maddiDogruluk ?? "") === normalizeString(formKodu)
            );

            let assignedHazirlayan = null;
            if (matchingGorev?.gorevliId) {
                assignedHazirlayan = await getKullaniciById(matchingGorev.gorevliId);
            }

            const [hazirlayan, onaylayan, kalite] = await Promise.all([
                formData?.hazirlayanId ? getKullaniciById(formData.hazirlayanId) : Promise.resolve(assignedHazirlayan || (fallbackHazirlayanlar?.[0] || null)),
                formData?.onaylayanId ? getKullaniciById(formData.onaylayanId) : Promise.resolve(fallbackOnaylayanlar?.[0] || null),
                formData?.kontrolEdenId ? getKullaniciById(formData.kontrolEdenId) : Promise.resolve(fallbackKaliteler?.[0] || null),
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

    const fetchLogo = async () => {
        try {
            const logoData = await getLogo(user.token || "", user.denetciId || 0);
            if (logoData) {
                if (typeof logoData === "string") {
                    setLogo(logoData);
                } else if (logoData.logoBase64) {
                    setLogo(logoData.logoBase64);
                } else if (logoData.logo) {
                    setLogo(logoData.logo);
                } else if (logoData.image) {
                    setLogo(logoData.image);
                } else {
                    if (logoData.toString().startsWith("data:image")) {
                        setLogo(logoData.toString());
                    }
                }
            }
        } catch (error) {
            console.log("Logo getirilemedi:", error);
        }
    };

    useEffect(() => {
        fetchLogo();
    }, []);


    const handleGenerateReport = async () => {
        setLoading(true);
        try {
            await fetchSignatureData();
            await fetchLogo();
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
            const allData: DenetimDosyaBelgeleriDto[] = await getMaddiDogrulama(
                user.denetimTuru || "",
                user.denetlenenId || 0,
                user.yil || 0
            );

            if (allData && parentName) {
                const group = allData.find(
                    (item: DenetimDosyaBelgeleriDto) => item.name === parentName
                );

                // Fetch reference number from the matched group
                if (group && group.reference) {
                    setReferansNo(group.reference);
                } else {
                    // Fallback to generated format if not found
                    setReferansNo(`CW-${user.denetlenenId}-${user.yil}`);
                }

                // Need to find the exact dipnotNo from procedures first
                let dipnotNo = "";
                try {
                    const allProcs = await getUygulananDenetimProsedurleri(user.denetciId || 0,
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
                        const onemlilikData = await getOnemlilikByDipnot(user.denetciId || 0,
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
                        const orneklemData = await getOrneklemByDipnot(user.denetciId || 0,
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

    async function createPDF() {
        const reportElement = document.querySelector("#printable-area") as HTMLElement;
        if (!reportElement) return;

        const pdf = new jsPDF({
            orientation: "p",
            unit: "px",
            format: "a4",
        });

        pdf.addFileToVFS("Roboto-Regular.ttf", base64FontRegular);
        pdf.addFileToVFS("Roboto-Bold.ttf", base64FontBold);
        pdf.addFont("Roboto-Regular.ttf", "Roboto", "normal");
        pdf.addFont("Roboto-Bold.ttf", "Roboto", "bold");

        pdf.setFont("Roboto", "normal");

        pdf.html(reportElement, {
            callback: function (pdf) {
                pdf.save(`FAS-Calisma-Kagidi-${parentName}.pdf`);
            },
            width: reportElement.offsetWidth,
            windowWidth: reportElement.offsetWidth,
            html2canvas: {
                scale: 0.46,
                useCORS: true,
            },
            margin: [50, 40, 50, 40],
            autoPaging: "text",
        });
    }

    async function createWord() {
        const reportElement = document.querySelector("#printable-area");
        if (!reportElement) return;

        const clonedElement = reportElement.cloneNode(true) as Element;
        clonedElement.querySelectorAll("img").forEach((img) => img.remove());

        const htmlContent = clonedElement.outerHTML;

        const wordDocument = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>FAS Çalışma Kağıdı</title>
        <style>
          body { font-family: 'Roboto', sans-serif; font-size: 12px; }
          .report-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .report-table th, .report-table td { border: 1px solid #ddd; padding: 5px; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>`;

        const blob = new Blob(["\ufeff", wordDocument], {
            type: "application/msword",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `FAS-Calisma-Kagidi-${parentName}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async function handleArchiveWord() {
        try {
            const reportElement = document.querySelector("#printable-area") as HTMLElement | null;
            if (!reportElement) {
                enqueueSnackbar("#printable-area elementi bulunamadı.", { variant: "warning" });
                return;
            }

            const clonedElement = reportElement.cloneNode(true) as HTMLElement;
            clonedElement.querySelectorAll("table").forEach(tbl => {
                tbl.style.width = "100%";
                tbl.style.borderCollapse = "collapse";
            });
            clonedElement.querySelectorAll("th, td").forEach(cell => {
                const h = cell as HTMLElement;
                h.style.padding = "3pt";
                h.style.border = "0.5pt solid #555555";
            });

            const htmlContent = clonedElement.outerHTML;

            const wordDocument = `
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>FAS Çalışma Kağıdı</title>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

            if (!(window as any).htmlDocx || typeof (window as any).htmlDocx.asBlob !== "function") {
                enqueueSnackbar("DOCX kütüphanesi yüklenemedi.", { variant: "error" });
                return;
            }

            const fileBlob = (window as any).htmlDocx.asBlob(wordDocument);

            const formData = new FormData();
            formData.append("html", htmlContent);
            formData.append("denetciId", String(user.denetciId ?? 0));
            formData.append("yil", String(user.yil ?? 0));
            formData.append("denetlenenId", String(user.denetlenenId ?? 0));
            formData.append("title", `${parentName} - Calisma Kagidi`);
            formData.append("modelAdi", "CalismaKagidi");
            formData.append("save", "true");

            await axios.post(`${url}/ArsivIslemleri/WordDosyasiArsiveKaydet`, formData);

            enqueueSnackbar("Çalışma kağıdı arşive kaydedildi.", { variant: "success" });
        } catch (error) {
            console.log("Arşive kaydetme hatası:", error);
            enqueueSnackbar("Arşive kaydedilirken hata oluştu.", { variant: "error" });
        }
    }

    const renderContent = (detail: DetailData) => {

        const currentDipnotNo = detail.dipnotNo || (detail.data && detail.data.length > 0 && detail.data[0].dipnotNo ? detail.data[0].dipnotNo : "");
        const currentParentName = detail.parentName || parentName || "";
        const currentTitle = decodeURIComponent(detail.title || "");

        const withComment = (component: React.ReactNode, fixedChildName: string) => (
            <Box>
                {component}

                <MaddiDogrulamaYorumComponent
                    parentName={currentParentName}
                    childName={fixedChildName}
                    isReport={true}
                />
            </Box>
        );

        switch (detail.type) {
            case "Mutabakat":
                return withComment(<Mutabakat dipnot={currentDipnotNo} isReport={true} />, "Mutabakat");

            case "Onemlilik":
                return withComment(<Onemlilik dipnot={currentDipnotNo} isReport={true} />, "Onemlilik");

            case "Orneklem":
                return withComment(<Orneklem dipnot={currentDipnotNo} isReport={true} />, "Orneklem");

            case "ReeskontTestleri":
                return withComment(<ReeskontTestleri dipnotNo={currentDipnotNo} modelAdi={currentParentName} isReport={true} />, "ReeskontTestleri");

            case "SupheliAlacakTestleri":
                return withComment(<SupheliAlacakTestleri
                    dipnotNo={currentDipnotNo}
                    modelAdi={currentParentName}
                    isReport={true}
                    isClickedVarsayilanaDon={false}
                    setIsClickedVarsayilanaDon={() => { }}
                />, "SupheliAlacakTestleri");

            case "HareketsizStoklar":
                return withComment(<HareketsizStoklar
                    controller="HareketsizStoklar"
                    dipnotAdi={currentTitle}
                    dipnotNo={currentDipnotNo}
                    modelAdi={currentParentName}
                    setDip={() => { }}
                    isReport={true}
                />, "HareketsizStoklar");

            case "HareketsizTicariAlacaklar":
                return withComment(<HareketsizTicariAlacaklar
                    controller="HareketsizTicariAlacaklar"
                    dipnotAdi={currentTitle}
                    dipnotNo={currentDipnotNo}
                    modelAdi={currentParentName}
                    setDip={() => { }}
                    isReport={true}
                />, "HareketsizTicariAlacaklar");

            case "HasilatDonemsellikTesti":
                return withComment(<HasilatDonemsellikTesti parentName={currentParentName} childName="HasilatDonemsellikTesti" dipnotNo={currentDipnotNo} isReport={true} />, "HasilatDonemsellikTesti");

            case "StokDonemsellikTesti":
                return withComment(<StokDonemsellikTesti parentName={currentParentName} childName="StokDonemsellikTesti" dipnotNo={currentDipnotNo} isReport={true} />, "StokDonemsellikTesti");

            case "EnvanterKontrolleri":
                return withComment(<EnvanterKontrolleri parentName={currentParentName} childName="EnvanterKontrolleri" dipnotNo={currentDipnotNo} isReport={true} />, "EnvanterKontrolleri");

            case "DegerlemeveDegerDusukluguKontrolleri":
                return withComment(<DegerlemeveDegerDusukluguKontrolleri parentName={currentParentName} childName="DegerlemeveDegerDusukluguKontrolleri" dipnotNo={currentDipnotNo} isReport={true} />, "DegerlemeveDegerDusukluguKontrolleri");

            case "DonusumKayitlariKontrol":
                return withComment(<DonusumKayitlariKontrol controller="DonusumKayitlariKontrol" dipnotNo={currentDipnotNo} isReport={true} />, "DonusumKayitlariKontrol");

            case "MaliyetKontrolleri":
                return withComment(<MaliyetKontrolleri parentName={currentParentName} childName="MaliyetKontrolleri" dipnotNo={currentDipnotNo} isReport={true} />, "MaliyetKontrolleri");

            case "KidemTazminatiCalismasi":
                return withComment(<KidemTazminatiCalismasi parentName={currentParentName} childName="KidemTazminatiCalismasi" dipnotNo={currentDipnotNo} isReport={true} />, "KidemTazminatiCalismasi");

            case "VarlikVeAmortismanOzetTablo":
                return withComment(<VarlikVeAmortismanOzetTablo parentName={currentParentName} childName="VarlikVeAmortismanOzetTablo" dipnotNo={currentDipnotNo} isReport={true} />, "VarlikVeAmortismanOzetTablo");

            case "CekSenetTablosu":
                return withComment(<CekSenetTablosu dipnotNo={currentDipnotNo} isReport={true} />, "CekSenetTablosu");

            case "FaturaTestleri":
                return withComment(<FaturaTestleriTablo dipnotNo={currentDipnotNo} isReport={true} />, "FaturaTestleri");

            case "AmortismanKontrolleri":
                return withComment(<AmortismanKontrolleri denetlenenId={user.denetlenenId || 0} yil={user.yil || 0} dipnotNo={currentDipnotNo} isReport={true} />, "AmortismanKontrolleri");

            case "KrediCalismasi":
                return withComment(<KrediCalismasi parentName={currentParentName} childName="KrediCalismasi" dipnotNo={currentDipnotNo} isReport={true} />, "KrediCalismasi");

            case "SozlesmeTestleri":
                return withComment(<SozlesmeTestleri dipnotNo={currentDipnotNo} modelAdi={currentParentName} isReport={true} isClickedVarsayilanaDon={false} setIsClickedVarsayilanaDon={() => { }} />, "SozlesmeTestleri");

            case "StoklarNetGerceklesebilirDeger":
                return withComment(<StoklarNetGerceklesebilirDeger parentName={currentParentName} childName="StoklarNetGerceklesebilirDeger" isReport={true} />, "StoklarNetGerceklesebilirDeger");

            case "HesaplaraIliskinUygulananDenetimTestleri":
                return withComment(<HesaplaraIliskinUygulananDenetimTestleri controller="HesaplaraIliskinUygulananDenetimTestleri" dipnotAdi={currentTitle} dipnotNo={currentDipnotNo} modelAdi={currentParentName} setDip={() => { }} isReport={true} />, "HesaplaraIliskinUygulananDenetimTestleri");

            case "SonrakiDonemTestleri":
                return withComment(<SonrakiDonemTestleri parentName={currentParentName} childName="SonrakiDonemTestleri" dipnotNo={currentDipnotNo} isReport={true} />, "SonrakiDonemTestleri");

            case "YabanciParaTestleri":
                return withComment(<YabanciParaTestleri
                    controller="YabanciParaTestleri"
                    dipnotNo={currentDipnotNo}
                    dipnotAdi={currentTitle}
                    modelAdi={currentParentName}
                    setDip={() => { }}
                    isReport={true}
                />, "YabanciParaTestleri");

            case "RiskTespiti":
                return withComment(<RiskTespiti controller="RiskTespiti" dipnotAdi={currentTitle} setDip={() => { }} isReport={true} />, "RiskTespiti");

            case "DavaKarsiliklariCalismasi":
                return withComment(<DavaKarsiliklariCalismasi dipnotNo={currentDipnotNo} isReport={true} />, "DavaKarsiliklariCalismasi");

            case "UygulananDenetimProsedurleri":
                return withComment(<UygulananDenetimProsedurleri
                    controller="UygulananDenetimProsedurleri"
                    isReport={true}
                    isClickedVarsayilanaDon={false}
                    setIsClickedVarsayilanaDon={() => { }}
                    setTamamlanan={() => { }}
                    setToplam={() => { }}
                    dipnotAdi={currentTitle}
                    setDip={() => { }}
                    alanAdi1="" alanAdi2="" alanAdi3=""
                />, "UygulananDenetimProsedurleri");

            case "UygulananDenetimTeknikleri":
                return withComment(<UygulananDenetimTeknikleri
                    controller="UygulananDenetimTeknikleri"
                    dipnotNo={currentDipnotNo}
                    isReport={true}
                    isClickedVarsayilanaDon={false}
                    setIsClickedVarsayilanaDon={() => { }}
                    setTamamlanan={() => { }}
                    setToplam={() => { }}
                />, "UygulananDenetimTeknikleri");

            case "MaddiDogrulamaYorumComponent":
                return withComment(<MaddiDogrulamaYorumComponent
                    parentName={currentParentName || ""}
                    childName="Genel Yorum"
                    isReport={true}
                />, "MaddiDogrulamaYorumComponent");

            case "Risk":
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
                                                <TableCell rowSpan={groupedData[category].length}
                                                    sx={{ verticalAlign: 'top', fontWeight: 'bold', textAlign: 'left' }}>
                                                    {category}
                                                </TableCell>
                                            )}
                                            <TableCell sx={{ textAlign: "justify", textJustify: "inter-word" }}>{stripHtml(row.konu)}</TableCell>
                                            <TableCell sx={{ textAlign: "justify", textJustify: "inter-word" }}>{stripHtml(row.aciklama)}</TableCell>
                                        </TableRow>
                                    ))
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                );

            case "Teknik":
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
            <Script
                src="/libs/html-docx.js"
                strategy="afterInteractive"
            />
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
                    </Box>

                    <Card sx={{ width: "100%", bgcolor: "primary.light", mb: 3 }} className="no-print">
                        <CardContent sx={{ bgcolor: "primary.light" }}>
                            <Grid
                                container
                                sx={{
                                    width: "100%",
                                    margin: "0 auto",
                                    justifyContent: "space-between",
                                    gap: 1,
                                }}
                            >
                                <Grid
                                    sx={{ display: "flex", justifyContent: "center" }}
                                    size={{
                                        xs: 12,
                                        lg: 3.75
                                    }}>
                                    <Button
                                        size="medium"
                                        variant="outlined"
                                        color="primary"
                                        startIcon={<IconEye width={18} />}
                                        onClick={handlePrint}
                                        sx={{ width: "100%" }}
                                    >
                                        Önizle
                                    </Button>
                                </Grid>

                                <Grid
                                    sx={{ display: "flex", justifyContent: "center" }}
                                    size={{
                                        xs: 12,
                                        lg: 3.75
                                    }}>
                                    <Button
                                        size="medium"
                                        variant="outlined"
                                        color="primary"
                                        startIcon={<IconDownload width={18} />}
                                        endIcon={<IconChevronDown width={18} />}
                                        onClick={handleDownloadClick}
                                        sx={{ width: "100%" }}
                                    >
                                        İndir
                                    </Button>
                                    <Menu
                                        anchorEl={downloadMenuAnchor}
                                        open={isDownloadMenuOpen}
                                        onClose={handleDownloadClose}
                                        anchorOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'center',
                                        }}
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'center',
                                        }}
                                    >
                                        <MenuItem onClick={() => { createPDF(); handleDownloadClose(); }}>
                                            <ListItemIcon>
                                                <IconFileTypePdf width={18} />
                                            </ListItemIcon>
                                            <ListItemText>Pdf</ListItemText>
                                        </MenuItem>
                                        <MenuItem onClick={() => { createWord(); handleDownloadClose(); }}>
                                            <ListItemIcon>
                                                <IconFileTypeDocx width={18} />
                                            </ListItemIcon>
                                            <ListItemText>Word</ListItemText>
                                        </MenuItem>
                                    </Menu>
                                </Grid>

                                <Grid
                                    sx={{ display: "flex", justifyContent: "center" }}
                                    size={{
                                        xs: 12,
                                        lg: 3.75
                                    }}>
                                    <Button
                                        size="medium"
                                        variant="outlined"
                                        color="primary"
                                        startIcon={<IconArchive width={18} />}
                                        onClick={handleArchiveWord}
                                        sx={{ width: "100%" }}
                                    >
                                        Arşive Kaydet
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    <Box id="printable-area" sx={{ bgcolor: theme.palette.background.paper, p: 4 }}>
                        <ReportHeader
                            denetlenenId={user.denetlenenId || 0}
                            yil={user.yil || 0}
                            denetciName={""}
                            denetlenenName={""}

                            reportName={`${parentName} - Çalışma Kağıdı `}
                            logo={logo}
                            referansNo={referansNo}
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
            .no-print,
            header, 
            footer, 
            nav, 
            aside, 
            .MuiDrawer-root,
            .MuiAppBar-root,
            .left-sidebar,
            .topbar,
            .breadcrumb,
            .MuiBreadcrumbs-root,
            h4:not(#printable-area *),
            h5:not(#printable-area *),
            .antigravity-message { 
                display: none !important; 
            }
            
            .MuiBox-root:empty {
                display: none !important;
            }

          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
            visibility: hidden;
          }
          #printable-area {
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            background: white !important;
            color: black !important;
            display: block !important;
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
          .MuiTableCell-root {
            text-align: justify;
            text-justify: inter-word;
          }
          @page {
            size: A4;
            margin: 2cm 1.5cm;
          }
          tr {
            break-inside: avoid;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
        </Box>
    );
};

export default CalismaKagidiRaporu;

