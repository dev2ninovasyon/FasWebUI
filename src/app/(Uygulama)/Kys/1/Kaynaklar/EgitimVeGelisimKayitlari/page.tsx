"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysBelgeEditor from "@/app/(Uygulama)/components/Kys/KysBelgeEditor";

const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/1", title: "KYS-1" },
    { to: "/Kys/1/Kaynaklar", title: "Kaynaklar" },
    { to: "/Kys/1/Kaynaklar/EgitimVeGelisimKayitlari", title: "7.7 Eğitim ve Gelişim Kayıtları" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="7.7 Eğitim ve Gelişim Kayıtları" description="Eğitim ve Gelişim Kayıtları">
            <Breadcrumb title="7.7 Eğitim ve Gelişim Kayıtları" items={BCrumb} />
            <Box sx={{ mt: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, color: "#1976d2", fontWeight: 600 }}>
                    7.7 EĞİTİM VE GELİŞİM KAYITLARI
                </Typography>
                <KysBelgeEditor formKodu="KysEgitimVeGelisimKayitlari" />
            </Box>
        </PageContainer>
    );
};

export default Page;
