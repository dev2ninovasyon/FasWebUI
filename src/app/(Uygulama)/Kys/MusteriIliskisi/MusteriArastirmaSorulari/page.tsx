"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";


import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/MusteriIliskisi", title: "5. Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Ettirilmesi" },
    { to: "/Kys/MusteriIliskisi/MusteriArastirmaSorulari", title: "5.2 Müşteri Araştırma Soruları" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="5.2 Müşteri Araştırma Soruları" description="Müşteri Araştırma Soruları">
            <Breadcrumb title="5.2 Müşteri Araştırma Soruları" items={BCrumb}>
        <EkBelgeYukleButton formKodu="KysMusteriArastirmaSorulari" />
      </Breadcrumb>
            <Box sx={{ mt: 3 }}>

                <KysCalismaKagidi formKodu="KysMusteriArastirmaSorulari" alanAdi="5.2 Müşteri Araştırma Soruları" />
            </Box>
        </PageContainer>
    );
};

export default Page;
