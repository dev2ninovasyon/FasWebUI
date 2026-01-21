"use client";

import React, { useEffect, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { getDipnotNoByDipnotAdi, getMaddiDogrulama } from "@/api/MaddiDogrulama/MaddiDogrulama";
import HasilatDonemsellikTesti from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/HasilatDonemsellikTesti";
import MaddiDogrulamaYorumComponent from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaYorumComponent";
import { Box, Typography, CircularProgress } from "@mui/material";

const Page = () => {
    const pathname = usePathname();
    const segments = pathname.split("/");
    const parentNameIndex = segments.indexOf("MaddiDogrulamaProsedurleri") + 1;
    const parentName = segments[parentNameIndex];
    const childName = segments[parentNameIndex + 1];

    const user = useSelector((state: AppState) => state.userReducer);
    const [dip, setDip] = useState<string>("");
    const [dipnotNo, setDipnotNo] = useState<string>("");
    const [isSearching, setIsSearching] = useState<boolean>(true);

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
            { to: currentPath, title: "Hasılat Dönemsellik Testi" },
        ];
    }, [basePath, currentPath, dip, parentName]);

    useEffect(() => {
        if (parentName) {
            fetchDipTitle();
        }
        const fetchData = async () => {
            if (!user.token || !user.denetlenenId) return;

            try {
                setIsSearching(true);
                const result = await getDipnotNoByDipnotAdi(
                    user.token,
                    user.denetciId || 0,
                    user.denetlenenId || 0,
                    user.yil || 0,
                    parentName,
                    user.denetimTuru === "Tfrs"
                );

                if (result) {
                    setDipnotNo(result);
                } else {
                    console.warn("Dipnot bulunamadı, varsayılan '01' kullanılıyor.");
                    setDipnotNo("01");
                }
            } catch (error) {
                console.error("DipnotNo çekme hatası:", error);
            } finally {
                setIsSearching(false);
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parentName, user.token, user.denetlenenId, user.yil, user.denetimTuru]);



    return (
        <PageContainer title="Hasılat Dönemsellik Testi" description="Hasılat Dönemsellik Testi">
            <Breadcrumb title="" subtitle="Hasılat Dönemsellik Testi" items={BCrumbList} />

            {isSearching ? (
                <Box sx={{ p: 5, textAlign: 'center' }}>
                    <CircularProgress size={24} sx={{ mb: 2 }} />
                    <Typography color="textSecondary">Dipnot bilgisi sorgulanıyor...</Typography>
                </Box>
            ) : dipnotNo ? (
                <>
                    <HasilatDonemsellikTesti
                        parentName={parentName}
                        childName="HasilatDonemsellikTesti"
                        dipnotNo={dipnotNo}
                    />
                    <Box mt={3}>
                        <MaddiDogrulamaYorumComponent
                            parentName={parentName}
                            childName={childName}
                        />
                    </Box>
                </>
            ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="error">Dipnot numarası alınamadığı için tablo yüklenemedi.</Typography>
                </Box>
            )}
        </PageContainer>
    );
};

export default Page;
