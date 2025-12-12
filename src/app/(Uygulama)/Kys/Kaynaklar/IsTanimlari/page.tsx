"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";


const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/Kaynaklar", title: "7. Kaynaklar" },
    { to: "/Kys/Kaynaklar/IsTanimlari", title: "7.2 İş Tanımları" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="7.2 İş Tanımları" description="İş Tanımları">
            <Breadcrumb title="7.2 İş Tanımları" items={BCrumb} />
            <Box sx={{ mt: 3 }}>

                <KysCalismaKagidi formKodu="KysIsTanimlari" alanAdi="7.2 İş Tanımları" />
            </Box>
        </PageContainer>
    );
};

export default Page;
