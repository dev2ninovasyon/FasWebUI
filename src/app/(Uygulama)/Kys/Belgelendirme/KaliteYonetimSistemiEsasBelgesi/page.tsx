"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";

import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/Belgelendirme", title: "1. Belgelendirme" },
    { to: "/Kys/Belgelendirme/KaliteYonetimSistemiEsasBelgesi", title: "1.2 Kalite Yönetim Sistemi 'Esas' Belgesi" },
];

const Page: React.FC = () => {
    return (
        <PageContainer
            title="1.2 Kalite Yönetim Sistemi 'Esas' Belgesi"
            description="Kalite Yönetim Sistemi Esas Belgesi"
        >
            <Breadcrumb title="1.2 Kalite Yönetim Sistemi 'Esas' Belgesi" items={BCrumb}>
        <EkBelgeYukleButton formKodu="KysKaliteYonetimSistemiEsasBelgesi" />
      </Breadcrumb>

            <Box sx={{ mt: 3 }}>

                <KysCalismaKagidi formKodu="KysKaliteYonetimSistemiEsasBelgesi" alanAdi="1.1 Belgelendirme Politikası Beyanı" />
            </Box>
        </PageContainer>
    );
};

export default Page;
