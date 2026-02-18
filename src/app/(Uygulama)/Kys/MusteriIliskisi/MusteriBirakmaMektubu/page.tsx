"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box } from "@mui/material";
import dynamic from "next/dynamic";
import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
const KysEditor = dynamic(() => import("@/app/(Uygulama)/components/Kys/KysEditor"), { ssr: false });


const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/MusteriIliskisi", title: "5. Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Ettirilmesi" },
    { to: "/Kys/MusteriIliskisi/MusteriBirakmaMektubu", title: "5.8 Müşteri Bırakma Mektubu" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="5.8 Müşteri Bırakma Mektubu" description="Müşteri Bırakma Mektubu">
            <Breadcrumb title="5.8 Müşteri Bırakma Mektubu" items={BCrumb}>
        <EkBelgeYukleButton formKodu="KysMusteriBirakmaMektubu" />
      </Breadcrumb>
            <Box sx={{ mt: 3 }}>
                <KysEditor formKodu="KysMusteriBirakmaMektubu" alanAdi="5.8 Müşteri Bırakma Mektubu" />
            </Box>
        </PageContainer>
    );
};

export default Page;
