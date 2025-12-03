"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";

const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/1", title: "KYS-1" },
    { to: "/Kys/1/IzlemeVeDuzeltme", title: "İzleme ve Düzeltme" },
    { to: "/Kys/1/IzlemeVeDuzeltme/IzlemeVeDuzeltmePolitikasi", title: "9.2 İzleme ve Düzeltme Süreci Politikası Beyanı" },
];

const Page: React.FC = () => {
    return (
        <PageContainer
            title="9.2 İzleme ve Düzeltme Süreci Politikası Beyanı"
            description="İzleme ve Düzeltme Süreci Politikası Beyanı Belgesi"
        >
            <Breadcrumb title="9.2 İzleme ve Düzeltme Süreci Politikası Beyanı" items={BCrumb} />

            <Box sx={{ mt: 3 }}>


                <KysCalismaKagidi formKodu="KysIzlemeVeDuzeltmePolitikasi" alanAdi="9.2 İzleme ve Düzeltme Süreci Politikası Beyanı" />
            </Box>
        </PageContainer>
    );
};

export default Page;
