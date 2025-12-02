"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysBelgeEditor from "@/app/(Uygulama)/components/Kys/KysBelgeEditor";

const BCrumb = [
    {
        to: "/Kys",
        title: "KYS",
    },
    {
        to: "/Kys/1",
        title: "KYS-1",
    },
    {
        to: "/Kys/1/UstYonetimVeLiderlik",
        title: "Üst Yönetim ve Liderlik Yapısı",
    },
    {
        to: "/Kys/1/UstYonetimVeLiderlik/PolitikaBeyani",
        title: "3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı",
    },
];

const Page: React.FC = () => {
    return (
        <PageContainer
            title="3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı"
            description="Üst Yönetim ve Liderlik Yapısı Politikası Beyanı Belgesi"
        >
            <Breadcrumb title="3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı" items={BCrumb} />

            <Box sx={{ mt: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, color: "#1976d2", fontWeight: 600 }}>
                    3.1 ÜST YÖNETİM VE LİDERLİK YAPISI POLİTİKASI BEYANI
                </Typography>

                <KysBelgeEditor formKodu="KysUstYonetimPolitikasi" />
            </Box>
        </PageContainer>
    );
};

export default Page;
