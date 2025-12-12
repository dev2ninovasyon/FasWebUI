"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";


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


                <KysCalismaKagidi formKodu="KysSorumluluklarinVerilmesi" alanAdi="3.2 Sorumlulukların Verilmesi" />
            </Box>
        </PageContainer>
    );
};

export default Page;
