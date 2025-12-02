"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysBelgeEditor from "@/app/(Uygulama)/components/Kys/KysBelgeEditor";

const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/1", title: "KYS-1" },
    { to: "/Kys/1/MusteriIliskisi", title: "Müşteri İlişkisinin Kabulü ve Devam Ettirilmesi" },
    { to: "/Kys/1/MusteriIliskisi/DevamEdenMusteriKontrolListesi", title: "5.6 Devam Eden Müşteri İçin Kontrol Listesi" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="5.6 Devam Eden Müşteri İçin Kontrol Listesi" description="Devam Eden Müşteri İçin Kontrol Listesi">
            <Breadcrumb title="5.6 Devam Eden Müşteri İçin Kontrol Listesi" items={BCrumb} />
            <Box sx={{ mt: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, color: "#1976d2", fontWeight: 600 }}>
                    5.6 DEVAM EDEN MÜŞTERİ İÇİN KONTROL LİSTESİ
                </Typography>
                <KysBelgeEditor formKodu="KysDevamEdenMusteriKontrolListesi" />
            </Box>
        </PageContainer>
    );
};

export default Page;
