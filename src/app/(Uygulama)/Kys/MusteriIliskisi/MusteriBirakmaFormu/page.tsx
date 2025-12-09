"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";


const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/MusteriIliskisi", title: "5. Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Ettirilmesi" },
    { to: "/Kys/MusteriIliskisi/MusteriBirakmaFormu", title: "5.7 Müşteri Bırakma Formu" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="5.7 Müşteri Bırakma Formu" description="Müşteri Bırakma Formu">
            <Breadcrumb title="5.7 Müşteri Bırakma Formu" items={BCrumb} />
            <Box sx={{ mt: 3 }}>

                <KysCalismaKagidi formKodu="KysMusteriBirakmaFormu" alanAdi="5.7 Müşteri Bırakma Formu" />
            </Box>
        </PageContainer>
    );
};

export default Page;
