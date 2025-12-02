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
    { to: "/Kys/1/MusteriIliskisi/YeniMusteriFormu", title: "5.3 Yeni Müşteri Formu" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="5.3 Yeni Müşteri Formu" description="Yeni Müşteri Formu">
            <Breadcrumb title="5.3 Yeni Müşteri Formu" items={BCrumb} />
            <Box sx={{ mt: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, color: "#1976d2", fontWeight: 600 }}>
                    5.3 YENİ MÜŞTERİ FORMU
                </Typography>
                <KysBelgeEditor formKodu="KysYeniMusteriFormu" />
            </Box>
        </PageContainer>
    );
};

export default Page;
