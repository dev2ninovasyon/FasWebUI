"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";

const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/MusteriIliskisi", title: "5. Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Ettirilmesi" },
    { to: "/Kys/MusteriIliskisi/YeniMusteriKabulKontrolListesi", title: "5.5 Yeni Müşteri Kabulü İçin Kontrol Listesi" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="5.5 Yeni Müşteri Kabulü İçin Kontrol Listesi" description="Yeni Müşteri Kabulü İçin Kontrol Listesi">
            <Breadcrumb title="5.5 Yeni Müşteri Kabulü İçin Kontrol Listesi" items={BCrumb} />
            <Box sx={{ mt: 3 }}>

                <KysCalismaKagidi formKodu="KysYeniMusteriKabulKontrolListesi" alanAdi="5.5 Yeni Müşteri Kabulü İçin Kontrol Listesi" />
            </Box>
        </PageContainer>
    );
};

export default Page;
