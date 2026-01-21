"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import MaddiDogrulamaListe from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaListe";
import { getMaddiDogrulama } from "@/api/MaddiDogrulama/MaddiDogrulama";
import { Box } from "@mui/material";

const Page = ({ params }: { params: { parentName: string } }) => {
    const { parentName } = params;
    const user = useSelector((state: AppState) => state.userReducer);
    const [dip, setDip] = useState<string>("");

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

    useEffect(() => {
        if (parentName) {
            fetchDipTitle();
        }
    }, [parentName, user.token]);

    const BCrumbList = useMemo(() => {
        return [
            { to: "/DenetimKanitlari", title: "Denetim Kanıtları" },
            { to: "/DenetimKanitlari/MaddiDogrulamaProsedurleri", title: "Maddi Doğrulama Prosedürleri" },
            { title: dip || parentName },
        ];
    }, [dip, parentName]);

    return (
        <PageContainer title={dip || parentName} description={dip || parentName}>
            <Breadcrumb title={dip || parentName} items={BCrumbList} />
            <Box>
                <MaddiDogrulamaListe parentName={parentName} />
            </Box>
        </PageContainer>
    );
};

export default Page;
