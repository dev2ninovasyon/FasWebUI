"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";

const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/1", title: "KYS-1" },
    { to: "/Kys/1/UstYonetimVeLiderlik", title: "Üst Yönetim ve Liderlik Yapısı" },
    { to: "/Kys/1/UstYonetimVeLiderlik/UstYonetimPolitikasi", title: "3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı" },
];

const Page: React.FC = () => {
    return (
        <PageContainer
            title="3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı"
            description="Üst Yönetim ve Liderlik Yapısı Politikası Beyanı Belgesi"
        >
            <Breadcrumb title="3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı" items={BCrumb} />

            <Box sx={{ mt: 3 }}>


                <KysCalismaKagidi formKodu="KysUstYonetimPolitikasi" alanAdi="3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı" />
            </Box>
        </PageContainer>
    );
};

export default Page;
