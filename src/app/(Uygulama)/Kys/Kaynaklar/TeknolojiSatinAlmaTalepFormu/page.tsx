"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import dynamic from "next/dynamic";
const KysEditor = dynamic(() => import("@/app/(Uygulama)/components/Kys/KysEditor"), { ssr: false });


const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/Kaynaklar", title: "7. Kaynaklar" },
    { to: "/Kys/Kaynaklar/TeknolojiSatinAlmaTalepFormu", title: "7.8 Teknoloji Satın Alma Talep Formu" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="7.8 Teknoloji Satın Alma Talep Formu" description="Teknoloji Satın Alma Talep Formu">
            <Breadcrumb title="7.8 Teknoloji Satın Alma Talep Formu" items={BCrumb} />
            <Box sx={{ mt: 3 }}>

                <KysEditor formKodu="KysTeknolojiSatinAlmaTalepFormu" alanAdi="7.8 Teknoloji Satın Alma Talep Formu" />
            </Box>
        </PageContainer>
    );
};

export default Page;
