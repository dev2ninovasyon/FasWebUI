"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box } from "@mui/material";
import dynamic from "next/dynamic";
const KysEditor = dynamic(() => import("@/app/(Uygulama)/components/Kys/KysEditor"), { ssr: false });

const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/MusteriIliskisi", title: "5. Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Ettirilmesi" },
    { to: "/Kys/MusteriIliskisi/YeniMusteriFormu", title: "5.3 Yeni Müşteri Formu" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="5.3 Yeni Müşteri Formu" description="Yeni Müşteri Formu">
            <Breadcrumb title="5.3 Yeni Müşteri Formu" items={BCrumb} />
            <Box sx={{ mt: 3 }}>
                <KysEditor formKodu="KysYeniMusteriFormu" alanAdi="5.3 Yeni Müşteri Formu" />
            </Box>
        </PageContainer>
    );
};

export default Page;
