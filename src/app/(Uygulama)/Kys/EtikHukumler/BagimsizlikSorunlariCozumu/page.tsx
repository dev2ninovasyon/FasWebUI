"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysBelgeEditor from "@/app/(Uygulama)/components/Kys/KysBelgeEditor";

const BCrumb = [
    {
        to: "/Kys",
        title: "KYS",
    },
    {
        to: "/Kys/EtikHukumler",
        title: "Etik Hükümler",
    },
    {
        to: "/Kys/EtikHukumler/BagimsizlikSorunlariCozumu",
        title: "4.3 Bağımsızlıkla İlgili Sorunları Çözüme Kavuşturma Formu",
    },
];

const Page: React.FC = () => {
    return (
        <PageContainer
            title="4.3 Bağımsızlıkla İlgili Sorunları Çözüme Kavuşturma Formu"
            description="Bağımsızlıkla İlgili Sorunları Çözüme Kavuşturma Formu Belgesi"
        >
            <Breadcrumb title="4.3 Bağımsızlıkla İlgili Sorunları Çözüme Kavuşturma Formu" items={BCrumb} />

            <Box sx={{ mt: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, color: "#1976d2", fontWeight: 600 }}>
                    4.3 BAĞIMSIZLIKLA İLGİLİ SORUNLARI ÇÖZÜME KAVUŞTURMA FORMU
                </Typography>

                <KysBelgeEditor formKodu="KysBagimsizlikSorunlariCozumu" />
            </Box>
        </PageContainer>
    );
};

export default Page;
