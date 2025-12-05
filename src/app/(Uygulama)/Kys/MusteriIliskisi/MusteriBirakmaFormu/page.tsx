"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysBelgeEditor from "@/app/(Uygulama)/components/Kys/KysBelgeEditor";

const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/MusteriIliskisi", title: "5. Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Ettirilmesi" },
    { to: "/Kys/MusteriIliskisi/MusteriBirakmaFormu", title: "5.7 Müşteri Bırakma Formu" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="5.7 Müşteri Bırakma Formu" description="Müşteri Bırakma Formu">
            <Breadcrumb title="5.7 Müşteri Bırakma Formu" items={BCrumb} />
            <Box sx={{ mt: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, color: "#1976d2", fontWeight: 600 }}>
                    5.7 MÜŞTERİ BIRAKMA FORMU
                </Typography>
                <KysBelgeEditor formKodu="KysMusteriBirakmaFormu" />
            </Box>
        </PageContainer>
    );
};

export default Page;
