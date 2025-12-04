"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";

const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/1", title: "KYS-1" },
    { to: "/Kys/1/IzlemeVeDuzeltme", title: "İzleme ve Düzeltme" },
    { to: "/Kys/1/IzlemeVeDuzeltme/MusteriSikayetKaydi", title: "9.5 Müşteri Şikâyet Kaydı" },
];

const Page: React.FC = () => {
    return (
        <PageContainer
            title="9.5 Müşteri Şikâyet Kaydı"
            description="Müşteri Şikâyet Kaydı Belgesi"
        >
            <Breadcrumb title="9.5 Müşteri Şikâyet Kaydı" items={BCrumb} />

            <Box sx={{ mt: 3 }}>


                <KysCalismaKagidi formKodu="KysMusteriSikayetKaydi" alanAdi="9.5 Müşteri Şikâyet Kaydı" />
            </Box>
        </PageContainer>
    );
};

export default Page;
