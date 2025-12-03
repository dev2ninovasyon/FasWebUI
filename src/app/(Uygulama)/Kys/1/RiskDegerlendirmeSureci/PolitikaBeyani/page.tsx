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
        to: "/Kys/1/RiskDegerlendirmeSureci",
        title: "Risk Değerlendirme Süreci",
    },
    {
        to: "/Kys/1/RiskDegerlendirmeSureci/PolitikaBeyani",
        title: "2.1 Risk Değerlendirme Süreci Politikası Beyanı",
    },
];

const Page: React.FC = () => {
    return (
        <PageContainer
            title="2.1 Risk Değerlendirme Süreci Politikası Beyanı"
            description="Risk Değerlendirme Süreci Politikası Beyanı Belgesi"
        >
            <Breadcrumb title="2.1 Risk Değerlendirme Süreci Politikası Beyanı" items={BCrumb} />

            <Box sx={{ mt: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, color: "#1976d2", fontWeight: 600 }}>
                    2.1 RİSK DEĞERLENDİRME SÜRECİ POLİTİKASI BEYANI
                </Typography>

                <KysBelgeEditor formKodu="KysRiskDegerlendirmePolitikasi" />
            </Box>
        </PageContainer>
    );
};

export default Page;
