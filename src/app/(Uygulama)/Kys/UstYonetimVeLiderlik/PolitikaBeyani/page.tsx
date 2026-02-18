"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";


import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/UstYonetimVeLiderlik", title: "3. Üst Yönetim ve Liderlik Yapısı" },
    { to: "/Kys/UstYonetimVeLiderlik/PolitikaBeyani", title: "3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı" },
];

const Page: React.FC = () => {
    return (
        <PageContainer
            title="3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı"
            description="Üst Yönetim ve Liderlik Yapısı Politikası Beyanı Belgesi"
        >
            <Breadcrumb title="3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı" items={BCrumb}>
        <EkBelgeYukleButton formKodu="KysUstYonetimPolitikasi" />
      </Breadcrumb>

            <Box sx={{ mt: 3 }}>
                <KysCalismaKagidi formKodu="KysUstYonetimPolitikasi" alanAdi="3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı" />
            </Box>
        </PageContainer>
    );
};

export default Page;
