"use client";
import {
    getMaddiDogrulama,
    getDipnotNoByDipnotAdi,
} from "@/api/MaddiDogrulama/MaddiDogrulama";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import MaddiDogrulamaYorumComponent from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaYorumComponent";

import HareketsizStoklar from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/HareketsizStoklar";
import { Box, Typography, Button } from "@mui/material";

const Page = () => {
    const user = useSelector((state: AppState) => state.userReducer);

    const pathname = usePathname();
    const segments = pathname.split("/");
    const parentNameIndex = segments.indexOf("MaddiDogrulamaProsedurleri") + 1;
    const parentName = segments[parentNameIndex];
    const childName = segments[parentNameIndex + 1];

    const [dip, setDip] = useState("");
    const [dipnotNo, setDipnotNo] = useState<string>("");
    const [isClickedHesapla, setIsClickedHesapla] = useState(false);

    const currentPath = pathname;
    const basePath = useMemo(() => {
        if (!pathname) return "";
        const parts = pathname.split("/").filter(Boolean);
        if (parts.length <= 1) return "/";
        return "/" + parts.slice(0, -1).join("/");
    }, [pathname]);

    function normalizeString(str: string): string {
        const turkishChars: { [key: string]: string } = {
            ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
            Ç: "C", Ğ: "G", İ: "I", Ö: "O", Ş: "S", Ü: "U",
        };
        let normalized = str.replace(/[çğıöşüÇĞÖŞÜıİ]/g, (match) => turkishChars[match] || match);
        normalized = normalized.replace(/\s+/g, "");
        return normalized.toLowerCase();
    }

    const fetchDipTitle = async () => {
        try {
            const maddiDogrulama = await getMaddiDogrulama(
                user.token || "", user.denetimTuru || "", user.denetlenenId || 0, user.yil || 0
            );
            const found = maddiDogrulama?.find((veri: any) => normalizeString(veri?.name || "") === normalizeString(parentName));
            if (found?.name) setDip(found.name);
        } catch (error) {
            console.error("fetchDipTitle error:", error);
        }
    };

    const BCrumbList = useMemo(() => {
        return [
            { to: "/DenetimKanitlari", title: "Denetim Kanıtları" },
            { to: "/DenetimKanitlari/MaddiDogrulamaProsedurleri", title: "Maddi Doğrulama Prosedürleri" },
            { to: basePath || "/DenetimKanitlari/MaddiDogrulamaProsedurleri", title: dip || parentName },
            { to: currentPath, title: "Hareketsiz Stoklar Çalışması" },
        ];
    }, [basePath, currentPath, dip, parentName]);

    const fetchData2 = async () => {
        try {
            const dipnotNo = await getDipnotNoByDipnotAdi(
                user.token || "",
                user.denetciId || 0,
                user.denetlenenId || 0,
                user.yil || 0,
                parentName,
                user.denetimTuru === "Tfrs"
            );

            setDipnotNo(dipnotNo);
        } catch (error) {
            console.error("An error occurred:", error);
        }
    };

    useEffect(() => {
        if (parentName && parentName.length > 0) {
            fetchDipTitle();
            fetchData2();
        }
    }, [parentName, user.token]);

    return (
        <PageContainer
            title={`${dip} | Hareketsiz Stoklar Çalışması`}
            description="Hareketsiz Stoklar Çalışması"
        >
            <Breadcrumb
                title=""
                subtitle="Hareketsiz Stoklar Çalışması"
                items={BCrumbList}
            >
                <Button
                    size="medium"
                    variant="outlined"
                    color="primary"
                    disabled={isClickedHesapla}
                    onClick={() => setIsClickedHesapla(true)}
                    sx={{ width: "200px", textTransform: "none" }}
                >
                    <Typography
                        variant="body1"
                        sx={{ overflowWrap: "break-word", wordWrap: "break-word" }}
                    >
                        Hesapla
                    </Typography>
                </Button>
            </Breadcrumb>

            {dipnotNo === "15-01" || dipnotNo === "15-02" || dipnotNo === "15-03" ? (
                <HareketsizStoklar
                    controller="DonusumKayitlariKontrol"
                    dipnotAdi={parentName}
                    dipnotNo={dipnotNo}
                    modelAdi={parentName}
                    setDip={setDip}
                    isClickedHesapla={isClickedHesapla}
                    setIsClickedHesapla={setIsClickedHesapla}
                />
            ) : dipnotNo !== "" ? (
                <Box sx={{ p: 3, textAlign: "center", border: "1px dashed #ccc", borderRadius: 2, my: 2 }}>
                    <Typography variant="h6" color="error">
                        Bu çalışma kağıdı sadece "Stoklar (15-01, 15-02, 15-03)" için kullanılabilir.
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Mevcut Dipnot No: {dipnotNo}
                    </Typography>
                </Box>
            ) : null}

            <MaddiDogrulamaYorumComponent parentName={parentName} childName={childName} />
        </PageContainer>
    );
};

export default Page;
