"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysBelgeEditor from "@/app/(Uygulama)/components/Kys/KysBelgeEditor";

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
                <Typography variant="h4" sx={{ mb: 3, color: "#1976d2", fontWeight: 600 }}>
                    7.4 YENİ ÇALIŞAN ORYANTASYON KONTROL LİSTESİ
                </Typography>
                <KysBelgeEditor formKodu="KysYeniCalisanOryantasyonKontrolListesi" />
            </Box>
        </PageContainer>
    );
};

export default Page;
