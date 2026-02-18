"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import dynamic from "next/dynamic";

import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
const KysEditor = dynamic(() => import("@/app/(Uygulama)/components/Kys/KysEditor"), {
    ssr: false,
});


const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/IzlemeVeDuzeltme", title: "9. İzleme ve Düzeltme Süreci" },
    { to: "/Kys/IzlemeVeDuzeltme/MusteriSikayetKaydi", title: "9.5 Müşteri Şikâyet Kaydı" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="9.5 Müşteri Şikâyet Kaydı" description="Müşteri Şikâyet Kaydı">
            <Breadcrumb title="9.5 Müşteri Şikâyet Kaydı" items={BCrumb}>
        <EkBelgeYukleButton formKodu="KysMusteriSikayetKaydi" />
      </Breadcrumb>
            <Box sx={{ mt: 3 }}>

                <KysEditor formKodu="KysMusteriSikayetKaydi" alanAdi="9.5 Müşteri Şikâyet Kaydı" />
            </Box>
        </PageContainer>
    );
};

export default Page;
