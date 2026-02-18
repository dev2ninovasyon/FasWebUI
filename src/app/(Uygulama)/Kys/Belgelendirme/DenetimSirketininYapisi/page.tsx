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
    { to: "/Kys/Belgelendirme/DenetimSirketininYapisi", title: "1.3 Denetim Şirketinin Yapısı" },
];

const Page: React.FC = () => {
    return (
        <PageContainer
            title="1.3 Denetim Şirketinin Yapısı"
            description="Denetim Şirketinin YapısıBelgesi"
        >
            <Breadcrumb title="1.3 Denetim Şirketinin Yapısı" items={BCrumb}>
        <EkBelgeYukleButton formKodu="KysDenetimSirketininYapisi" />
      </Breadcrumb>

            <Box sx={{ mt: 3 }}>

                <KysCalismaKagidi formKodu="KysDenetimSirketininYapisi" alanAdi="1.3 Denetim Şirketinin Yapısı" />
            </Box>
        </PageContainer>
    );
};

export default Page;
