"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysBelgeEditor from "@/app/(Uygulama)/components/Kys/KysBelgeEditor";

const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/1", title: "KYS-1" },
    { to: "/Kys/1/IzlemeVeDuzeltme", title: "İzleme ve Düzeltme Süreci" },
    { to: "/Kys/1/IzlemeVeDuzeltme/PolitikaBeyani", title: "9.2 İzleme ve Düzeltme Süreci Politikası Beyanı" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="9.2 İzleme ve Düzeltme Süreci Politikası Beyanı" description="İzleme ve Düzeltme Süreci Politikası Beyanı">
            <Breadcrumb title="9.2 İzleme ve Düzeltme Süreci Politikası Beyanı" items={BCrumb} />
            <Box sx={{ mt: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, color: "#1976d2", fontWeight: 600 }}>
                    9.2 İZLEME VE DÜZELTME SÜRECİ POLİTİKASI BEYANI
                </Typography>
                <KysBelgeEditor formKodu="KysIzlemeVeDuzeltmePolitikasi" />
            </Box>
        </PageContainer>
    );
};

export default Page;
