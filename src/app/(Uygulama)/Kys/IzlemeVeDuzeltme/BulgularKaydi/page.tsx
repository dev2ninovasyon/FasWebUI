"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysBelgeEditor from "@/app/(Uygulama)/components/Kys/KysBelgeEditor";

const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/IzlemeVeDuzeltme", title: "9. İzleme ve Düzeltme Süreci" },
    { to: "/Kys/IzlemeVeDuzeltme/BulgularKaydi", title: "9.6 Bulgular Kaydı" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="9.6 Bulgular Kaydı" description="Bulgular Kaydı">
            <Breadcrumb title="9.6 Bulgular Kaydı" items={BCrumb} />
            <Box sx={{ mt: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, color: "#1976d2", fontWeight: 600 }}>
                    9.6 BULGULAR KAYDI
                </Typography>
                <KysBelgeEditor formKodu="KysBulgularKaydi" />
            </Box>
        </PageContainer>
    );
};

export default Page;
