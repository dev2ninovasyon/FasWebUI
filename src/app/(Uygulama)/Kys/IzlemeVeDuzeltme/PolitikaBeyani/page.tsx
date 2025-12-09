"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";


const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/IzlemeVeDuzeltme", title: "9. İzleme ve Düzeltme Süreci" },
    { to: "/Kys/IzlemeVeDuzeltme/PolitikaBeyani", title: "9.2 İzleme ve Düzeltme Süreci Politikası Beyanı" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="9.2 İzleme ve Düzeltme Süreci Politikası Beyanı" description="İzleme ve Düzeltme Süreci Politikası Beyanı">
            <Breadcrumb title="9.2 İzleme ve Düzeltme Süreci Politikası Beyanı" items={BCrumb} />
            <Box sx={{ mt: 3 }}>
                <KysCalismaKagidi formKodu="KysIzlemeVeDuzeltmePolitikasi" alanAdi="9.2 İzleme ve Düzeltme Süreci Politikası Beyanı" />
            </Box>
        </PageContainer>
    );
};

export default Page;
