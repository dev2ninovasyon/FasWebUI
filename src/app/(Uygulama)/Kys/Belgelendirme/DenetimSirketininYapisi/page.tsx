"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";

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
            <Breadcrumb title="1.3 Denetim Şirketinin Yapısı" items={BCrumb} />

            <Box sx={{ mt: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, color: "#1976d2", fontWeight: 600 }}>
                    1.3 DENETİM ŞİRKETİNİN YAPISI
                </Typography>
                <KysCalismaKagidi formKodu="KysDenetimSirketininYapisi" alanAdi="1.1 Belgelendirme Politikası Beyanı" />
            </Box>
        </PageContainer>
    );
};

export default Page;
