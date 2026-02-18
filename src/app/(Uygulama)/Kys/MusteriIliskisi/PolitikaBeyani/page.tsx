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
    { to: "/Kys/MusteriIliskisi/PolitikaBeyani", title: "5.1 Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Ettirilmesi Politikası Beyanı" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="5.1 Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Ettirilmesi Politikası Beyanı" description="Müşteri İlişkisi Politikası Beyanı">
            <Breadcrumb title="5.1 Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Ettirilmesi Politikası Beyanı" items={BCrumb}>
        <EkBelgeYukleButton formKodu="KysMusteriIliskisiPolitikasi" />
      </Breadcrumb>
            <Box sx={{ mt: 3 }}>

                <KysCalismaKagidi formKodu="KysMusteriIliskisiPolitikasi" alanAdi="5.1 Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Ettirilmesi Politikası Beyanı" />
            </Box>
        </PageContainer>
    );
};

export default Page;
