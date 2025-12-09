"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";


const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/IzlemeVeDuzeltme", title: "9. İzleme ve Düzeltme Süreci" },
    { to: "/Kys/IzlemeVeDuzeltme/EksiklikDegerlendirme", title: "9.7 Eksiklik Değerlendirme Çalışma Sayfası" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="9.7 Eksiklik Değerlendirme Çalışma Sayfası" description="Eksiklik Değerlendirme Çalışma Sayfası">
            <Breadcrumb title="9.7 Eksiklik Değerlendirme Çalışma Sayfası" items={BCrumb} />
            <Box sx={{ mt: 3 }}>

                <KysCalismaKagidi formKodu="KysEksiklikDegerlendirme" alanAdi="9.7 Eksiklik Değerlendirme Çalışma Sayfası" />
            </Box>
        </PageContainer>
    );
};

export default Page;
