"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { getDipnotNoByDipnotAdi } from "@/api/MaddiDogrulama/MaddiDogrulama";
import DavaKarsiliklariCalismasi from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/DavaKarsiliklariCalismasi";
import MaddiDogrulamaYorumComponent from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaYorumComponent";
import { Box, CircularProgress } from "@mui/material";

const Page = () => {
    const pathname = usePathname();
    const segments = pathname.split("/");
    const parentName = segments[segments.indexOf("MaddiDogrulamaProsedurleri") + 1];

    const user = useSelector((state: AppState) => state.userReducer);
    const [dip, setDip] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchDipnot = async () => {
            if (!user.token || !user.denetlenenId) return;
            try {
                const dipnotNo = await getDipnotNoByDipnotAdi(
                    user.token, user.denetciId || 0, user.denetlenenId || 0, user.yil || 0, parentName, user.denetimTuru === "Tfrs"
                );
                setDip(dipnotNo || "23");
            } catch (error) { setDip("23"); } finally { setLoading(false); }
        };
        fetchDipnot();
    }, [user, parentName]);

    const BCrumbList = [
        { title: "Denetim Kanıtları", to: "/DenetimKanitlari" },
        { title: "Maddi Doğrulama Prosedürleri", to: "/DenetimKanitlari/MaddiDogrulamaProsedurleri" },
        { title: "Dava Karşılıkları Çalışması" },
    ];

    return (
        <PageContainer title="Dava Karşılıkları Çalışması" description="Dava Karşılıkları">
            <Breadcrumb title="Kısa ve Uzun Vadeli Karşılıklar / Dava Karşılıkları Çalışması" items={BCrumbList} />
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
            ) : (
                <>
                    <DavaKarsiliklariCalismasi dipnotNo={dip} />
                    <Box mt={3}>
                        <MaddiDogrulamaYorumComponent parentName={parentName} childName="DavaKarsiliklari" />
                    </Box>
                </>
            )}
        </PageContainer>
    );
};

export default Page;