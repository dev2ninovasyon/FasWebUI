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
    { to: "/Kys/Belgelendirme/BelgelendirmePolitikasi", title: "1.1 Belgelendirme Politikası Beyanı" },
];

const Page: React.FC = () => {
    return (
        <PageContainer
            title="1.1 Belgelendirme Politikası Beyanı"
            description="Belgelendirme Politikası Beyanı Belgesi"
        >
            <Breadcrumb title="1.1 Belgelendirme Politikası Beyanı" items={BCrumb}>
        <EkBelgeYukleButton formKodu="KysBelgelendirmePolitikasi" />
      </Breadcrumb>

            <Box sx={{ mt: 3 }}>


                <KysCalismaKagidi formKodu="KysBelgelendirmePolitikasi" alanAdi="1.1 Belgelendirme Politikası Beyanı" />
            </Box>
        </PageContainer>
    );
};

export default Page;
