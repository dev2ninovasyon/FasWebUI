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
    { to: "/Kys/1/Kaynaklar/IsTanimlari", title: "7.2 İş Tanımları" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="7.2 İş Tanımları" description="İş Tanımları">
            <Breadcrumb title="7.2 İş Tanımları" items={BCrumb} />
            <Box sx={{ mt: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, color: "#1976d2", fontWeight: 600 }}>
                    7.2 İŞ TANIMLARI
                </Typography>
                <KysBelgeEditor formKodu="KysIsTanimlari" />
            </Box>
        </PageContainer>
    );
};

export default Page;
