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
    { to: "/Kys/IzlemeVeDuzeltme/SistemDegerlendirmesi", title: "9.4 Sistem Değerlendirmesi" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="9.4 Sistem Değerlendirmesi" description="Sistem Değerlendirmesi">
            <Breadcrumb title="9.4 Sistem Değerlendirmesi" items={BCrumb}>
        <EkBelgeYukleButton formKodu="KysSistemDegerlendirmesi" />
      </Breadcrumb>
            <Box sx={{ mt: 3 }}>

                <KysEditor formKodu="KysSistemDegerlendirmesi" alanAdi="9.4 Sistem Değerlendirmesi" />
            </Box>
        </PageContainer>
    );
};

export default Page;
