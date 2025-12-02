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
    { to: "/Kys/1/IzlemeVeDuzeltme/SureciRehberi", title: "9.1 İzleme ve Düzeltme Süreci Rehberi" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="9.1 İzleme ve Düzeltme Süreci Rehberi" description="İzleme ve Düzeltme Süreci Rehberi">
            <Breadcrumb title="9.1 İzleme ve Düzeltme Süreci Rehberi" items={BCrumb} />
            <Box sx={{ mt: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, color: "#1976d2", fontWeight: 600 }}>
                    9.1 İZLEME VE DÜZELTME SÜRECİ REHBERİ
                </Typography>
                <KysBelgeEditor formKodu="KysIzlemeVeDuzeltmeSureciRehberi" />
            </Box>
        </PageContainer>
    );
};

export default Page;
