"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";


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


                <KysCalismaKagidi formKodu="KysBagimsizlikSorunlariCozumu" alanAdi="4.3 Bağımsızlıkla İlgili Sorunları Çözüme Kavuşturma Formu" />
            </Box>
        </PageContainer>
    );
};

export default Page;
