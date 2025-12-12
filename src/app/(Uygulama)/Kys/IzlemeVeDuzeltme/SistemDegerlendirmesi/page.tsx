"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";


const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/IzlemeVeDuzeltme", title: "9. İzleme ve Düzeltme Süreci" },
    { to: "/Kys/IzlemeVeDuzeltme/SistemDegerlendirmesi", title: "9.4 Sistem Değerlendirmesi" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="9.4 Sistem Değerlendirmesi" description="Sistem Değerlendirmesi">
            <Breadcrumb title="9.4 Sistem Değerlendirmesi" items={BCrumb} />
            <Box sx={{ mt: 3 }}>

                <KysCalismaKagidi formKodu="KysSistemDegerlendirmesi" alanAdi="9.4 Sistem Değerlendirmesi" />
            </Box>
        </PageContainer>
    );
};

export default Page;
