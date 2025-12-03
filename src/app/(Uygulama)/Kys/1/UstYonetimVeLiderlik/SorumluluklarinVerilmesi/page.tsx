"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box } from "@mui/material";
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
        to: "/Kys/1/UstYonetimVeLiderlik/SorumluluklarinVerilmesi",
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


                <KysBelgeEditor formKodu="KysSorumluluklarinVerilmesi" />
            </Box>
        </PageContainer>
    );
};

export default Page;
