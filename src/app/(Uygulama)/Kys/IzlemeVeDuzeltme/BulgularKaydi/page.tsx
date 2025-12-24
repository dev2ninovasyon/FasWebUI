"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import dynamic from "next/dynamic";

const KysEditor = dynamic(() => import("@/app/(Uygulama)/components/Kys/KysEditor"), {
    ssr: false,
});


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

                <KysEditor formKodu="KysBulgularKaydi" alanAdi="9.6 Bulgular Kaydı" />
            </Box>
        </PageContainer>
    );
};

export default Page;
