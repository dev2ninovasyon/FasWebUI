"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";


const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/Kaynaklar", title: "7. Kaynaklar" },
    { to: "/Kys/Kaynaklar/AdayGorusmeKontrolListesi", title: "7.3 Aday Görüşme ve Değerlendirme Kontrol Listesi" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="7.3 Aday Görüşme ve Değerlendirme Kontrol Listesi" description="Aday Görüşme ve Değerlendirme Kontrol Listesi">
            <Breadcrumb title="7.3 Aday Görüşme ve Değerlendirme Kontrol Listesi" items={BCrumb} />
            <Box sx={{ mt: 3 }}>

                <KysCalismaKagidi formKodu="KysAdayGorusmeKontrolListesi" alanAdi="7.3 Aday Görüşme ve Değerlendirme Kontrol Listesi" />
            </Box>
        </PageContainer>
    );
};

export default Page;
