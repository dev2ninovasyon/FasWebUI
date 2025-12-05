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
        to: "/Kys/UstYonetimVeLiderlik",
        title: "Üst Yönetim ve Liderlik Yapısı",
    },
    {
        to: "/Kys/UstYonetimVeLiderlik/SorumluluklarinVerilmesi",
        title: "3.2 Sorumlulukların Verilmesi",
    },
];

const Page: React.FC = () => {
    return (
        <PageContainer
            title="3.2 Sorumlulukların Verilmesi"
            description="Sorumlulukların Verilmesi Belgesi"
        >
            <Breadcrumb title="3.2 Sorumlulukların Verilmesi" items={BCrumb} />

            <Box sx={{ mt: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, color: "#1976d2", fontWeight: 600 }}>
                    3.2 SORUMLULUKLARIN VERİLMESİ
                </Typography>

                <KysBelgeEditor formKodu="KysSorumluluklarinVerilmesi" />
            </Box>
        </PageContainer>
    );
};

export default Page;
