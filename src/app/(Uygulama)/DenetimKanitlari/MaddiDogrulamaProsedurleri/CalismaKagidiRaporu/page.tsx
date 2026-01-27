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
import ReportHeader from "./header";
import ReportFooter from "./footer";

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
            // Add other types here if they also fetch data directly
            else if (normalizedItemName.includes("reeskonttestleri")) { type = "ReeskontTestleri"; }
            else if (normalizedItemName.includes("suphelialacaktestleri")) { type = "SupheliAlacakTestleri"; }
            else if (normalizedItemName.includes("hareketsizstoklar")) { type = "HareketsizStoklar"; }
            else if (normalizedItemName.includes("hareketsizticari")) { type = "HareketsizTicariAlacaklar"; }
            else if (normalizedItemName.includes("hasilatdonemselliktesti")) { type = "HasilatDonemsellikTesti"; }
            else if (normalizedItemName.includes("stokdonemselliktesti")) { type = "StokDonemsellikTesti"; }
            else if (normalizedItemName.includes("envanterkontrolleri")) { type = "EnvanterKontrolleri"; }
            else if (normalizedItemName.includes("degerlemevedeger")) { type = "DegerlemeveDegerDusukluguKontrolleri"; }
            else if (normalizedItemName.includes("donusumkayitlari")) { type = "DonusumKayitlariKontrol"; }
            else if (normalizedItemName.includes("maliyetkontrolleri")) { type = "MaliyetKontrolleri"; }
            else if (normalizedItemName.includes("kidemtazminati")) { type = "KidemTazminatiCalismasi"; }
            else if (normalizedItemName.includes("varlikveamortisman")) { type = "VarlikVeAmortismanOzetTablo"; }
            else if (normalizedItemName.includes("ceksenettablosu")) { type = "CekSenetTablosu"; }
            else if (normalizedItemName.includes("faturatestleri")) { type = "FaturaTestleri"; }
            else if (normalizedItemName.includes("amortismankontrolleri")) { type = "AmortismanKontrolleri"; }
            else if (normalizedItemName.includes("kredicalismasi")) { type = "KrediCalismasi"; }
            else if (normalizedItemName.includes("sozlesmetestleri")) { type = "SozlesmeTestleri"; }
            else if (normalizedItemName.includes("stoklarnetgerceklesebilirdeger")) { type = "StoklarNetGerceklesebilirDeger"; }
            else if (normalizedItemName.includes("hesaplara")) { type = "HesaplaraIliskinUygulananDenetimTestleri"; }
            else if (normalizedItemName.includes("sonrakidonemtestleri")) { type = "SonrakiDonemTestleri"; }
            else if (normalizedItemName.includes("yabanciparatestleri")) { type = "YabanciParaTestleri"; }
            else if (normalizedItemName.includes("risktespiti")) { type = "RiskTespiti"; }
            else if (normalizedItemName.includes("davakarsiliklari")) { type = "DavaKarsiliklariCalismasi"; }
            else if (normalizedItemName.includes("uygulanandenetimprosedurleri")) { type = "UygulananDenetimProsedurleri"; }
            else if (normalizedItemName.includes("uygulanandenetimteknikleri")) { type = "UygulananDenetimTeknikleri"; }
            else if (normalizedItemName.includes("maddidogrulamayorum")) { type = "MaddiDogrulamaYorumComponent"; }


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
        // If the component is expected to fetch its own data, we don't pass detail.data
        // Instead, we pass the necessary props for it to fetch data (like dipnotNo, parentName, childName)
        // For components that were previously rendered directly from `detail.data`, we can still pass `data` prop.
        // The `isReport` prop is added to all.

        // For components that need `dipnotNo`, we extract it from the `detail` object or use the one from `fetchData` scope.
        // For this report, `dipnotNo` is determined once in `fetchData` and passed to `fetchDetailData`.
        // We need to ensure `dipnotNo` is available here.
        // Since `fetchDetailData` already determines `dipnotNo` and `type`, we can pass it.
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
                    controller={currentChildName}
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
                    controller={currentChildName}
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
                    controller={currentChildName}
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
                return <YabanciParaTestleri
                    controller={currentChildName}
                    dipnotAdi={currentTitle}
                    dipnotNo={currentDipnotNo}
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
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "primary.main" }}>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Risk Alanı</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Tam Olma</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Doğruluk</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Var Olma</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Değerleme</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Dönem.</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Geçer.</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Sunum</TableCell>
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
            case "Prosedur": // Keep existing Prosedur rendering if no dedicated component
                if (!detail.data || detail.data.length === 0) return <Typography variant="body2" color="textSecondary">Veri yok</Typography>;
                return (
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "primary.main" }}>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Kategori</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Konu</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Açıklama</TableCell>
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
            case "Teknik": // Keep existing Teknik rendering if no dedicated component
                if (!detail.data || detail.data.length === 0) return <Typography variant="body2" color="textSecondary">Veri yok</Typography>;
                return (
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "primary.main" }}>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Başlık</TableCell>
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

            <Box id="printable-area" sx={{ bgcolor: "white", p: 4 }}>
                <ReportHeader
                    denetlenenId={user.denetlenenId || 0}
                    yil={user.yil || 0}
                    denetciName={""}
                    denetlenenName={""}
                    reportName={`${parentName} - Detaylı Çalışma Kağıdı Raporu`}
                />

                {reportData.map((detail, index) => (
                    <Box key={index} mb={5} sx={{ breakInside: "avoid", pageBreakAfter: "always" }}>
                        <Typography variant="h6" gutterBottom sx={{
                            bgcolor: "#2C3E50",
                            color: "white",
                            p: 1.5,
                            borderRadius: 1,
                            mb: 3,
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                        }}>
                            {detail.documentName}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                            {renderContent(detail)}
                        </Box>
                    </Box>
                ))}

                {reportData.length === 0 && (
                    <Typography align="center" sx={{ py: 10, bgcolor: "#f9f9f9", borderRadius: 2 }}>
                        Bu grupta belge bulunamadı.
                    </Typography>
                )}

                <ReportFooter />
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
