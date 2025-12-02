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
    { to: "/Kys/1/Kaynaklar/IdariCalisanPerformansi", title: "7.6 İdari Çalışanların Performansının Gözden Geçirilmesi" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="7.6 İdari Çalışanların Performansının Gözden Geçirilmesi" description="İdari Çalışanların Performansının Gözden Geçirilmesi">
            <Breadcrumb title="7.6 İdari Çalışanların Performansının Gözden Geçirilmesi" items={BCrumb} />
            <Box sx={{ mt: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, color: "#1976d2", fontWeight: 600 }}>
                    7.6 İDARİ ÇALIŞANLARIN PERFORMANSININ GÖZDEN GEÇİRİLMESİ
                </Typography>
                <KysBelgeEditor formKodu="KysIdariCalisanPerformansi" />
            </Box>
        </PageContainer>
    );
};

export default Page;
