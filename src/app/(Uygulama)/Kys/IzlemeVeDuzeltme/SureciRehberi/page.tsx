"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";


const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/IzlemeVeDuzeltme", title: "9. İzleme ve Düzeltme Süreci" },
    { to: "/Kys/IzlemeVeDuzeltme/SureciRehberi", title: "9.1 İzleme ve Düzeltme Süreci Rehberi" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="9.1 İzleme ve Düzeltme Süreci Rehberi" description="İzleme ve Düzeltme Süreci Rehberi">
            <Breadcrumb title="9.1 İzleme ve Düzeltme Süreci Rehberi" items={BCrumb} />
            <Box sx={{ mt: 3 }}>

                <KysCalismaKagidi formKodu="KysIzlemeVeDuzeltmeSureciRehberi" alanAdi="9.1 İzleme ve Düzeltme Süreci Rehberi" />
            </Box>
        </PageContainer>
    );
};

export default Page;
