"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysEditor from "@/app/(Uygulama)/components/Kys/KysEditor";


const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/Kaynaklar", title: "7. Kaynaklar" },
    { to: "/Kys/Kaynaklar/YeniCalisanOryantasyonKontrolListesi", title: "7.4 Yeni Çalışan Oryantasyon Kontrol Listesi" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="7.4 Yeni Çalışan Oryantasyon Kontrol Listesi" description="Yeni Çalışan Oryantasyon Kontrol Listesi">
            <Breadcrumb title="7.4 Yeni Çalışan Oryantasyon Kontrol Listesi" items={BCrumb} />
            <Box sx={{ mt: 3 }}>

                <KysEditor formKodu="KysYeniCalisanOryantasyonKontrolListesi" alanAdi="7.4 Yeni Çalışan Oryantasyon Kontrol Listesi" />
            </Box>
        </PageContainer>
    );
};

export default Page;
