"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";


import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/Kaynaklar", title: "7. Kaynaklar" },
    { to: "/Kys/Kaynaklar/PolitikaBeyani", title: "7.1 Kaynaklar Politikası Beyanı" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="7.1 Kaynaklar Politikası Beyanı" description="Kaynaklar Politikası Beyanı">
            <Breadcrumb title="7.1 Kaynaklar Politikası Beyanı" items={BCrumb}>
        <EkBelgeYukleButton formKodu="KysKaynaklarPolitikasi" />
      </Breadcrumb>
            <Box sx={{ mt: 3 }}>
                <KysCalismaKagidi formKodu="KysKaynaklarPolitikasi" alanAdi="7.1 Kaynaklar Politikası Beyanı" />
            </Box>
        </PageContainer>
    );
};

export default Page;
