"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";

const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/DenetiminYurutulmesi", title: "6. Denetimin Yürütülmesi" },
    { to: "/Kys/DenetiminYurutulmesi/DenetimKaliteGozdenGecirme", title: "6.6 Denetimin Kalitesinin Gözden Geçirilmesi Formu" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="6.6 Denetimin Kalitesinin Gözden Geçirilmesi Formu" description="Denetimin Kalitesinin Gözden Geçirilmesi Formu">
            <Breadcrumb title="6.6 Denetimin Kalitesinin Gözden Geçirilmesi Formu" items={BCrumb} />
            <Box sx={{ mt: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, color: "#1976d2", fontWeight: 600 }}>
                    6.6 DENETİMİN KALİTESİNİN GÖZDEN GEÇİRİLMESİ FORMU
                </Typography>
                <KysCalismaKagidi formKodu="KysDenetimKaliteGozdenGecirme" alanAdi="6.6 Denetimin Kalitesinin Gözden Geçirilmesi Formu" />
            </Box>
        </PageContainer>
    );
};

export default Page;
