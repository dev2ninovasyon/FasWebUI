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
    { to: "/Kys/MusteriIliskisi/DevamEdenMusteriKontrolListesi", title: "5.6 Devam Eden Müşteri İçin Kontrol Listesi" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="5.6 Devam Eden Müşteri İçin Kontrol Listesi" description="Devam Eden Müşteri İçin Kontrol Listesi">
            <Breadcrumb title="5.6 Devam Eden Müşteri İçin Kontrol Listesi" items={BCrumb}>
        <EkBelgeYukleButton formKodu="KysDevamEdenMusteriKontrolListesi" />
      </Breadcrumb>
            <Box sx={{ mt: 3 }}>

                <KysCalismaKagidi formKodu="KysDevamEdenMusteriKontrolListesi" alanAdi="5.6 Devam Eden Müşteri İçin Kontrol Listesi" />
            </Box>
        </PageContainer>
    );
};

export default Page;
