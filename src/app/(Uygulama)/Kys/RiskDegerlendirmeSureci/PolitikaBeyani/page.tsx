"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";


const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/RiskDegerlendirmeSureci", title: "2. Risk Değerlendirme Süreci" },
    { to: "/Kys/RiskDegerlendirmeSureci/PolitikaBeyani", title: "2.1 Risk Değerlendirme Süreci Politikası Beyanı" },
];

const Page: React.FC = () => {
    return (
        <PageContainer
            title="2.1 Risk Değerlendirme Süreci Politikası Beyanı"
            description="Risk Değerlendirme Süreci Politikası Beyanı Belgesi"
        >
            <Breadcrumb title="2.1 Risk Değerlendirme Süreci Politikası Beyanı" items={BCrumb} />

            <Box sx={{ mt: 3 }}>


                <KysCalismaKagidi formKodu="KysRiskDegerlendirmePolitikasi" alanAdi="2.1 Risk Değerlendirme Süreci Politikası Beyanı" />
            </Box>
        </PageContainer>
    );
};

export default Page;
