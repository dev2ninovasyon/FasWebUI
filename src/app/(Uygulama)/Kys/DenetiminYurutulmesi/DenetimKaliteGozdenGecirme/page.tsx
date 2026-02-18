"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysCalismaKagidiUcSutunlu from "@/app/(Uygulama)/components/Kys/KysCalismaKagidiUcSutunlu";

import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/DenetiminYurutulmesi", title: "6. Denetimin Yürütülmesi" },
    { to: "/Kys/DenetiminYurutulmesi/DenetimKaliteGozdenGecirme", title: "6.6 Denetimin Kalitesinin Gözden Geçirilmesi Formu" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="6.6 Denetimin Kalitesinin Gözden Geçirilmesi Formu" description="Denetimin Kalitesinin Gözden Geçirilmesi Formu">
            <Breadcrumb title="6.6 Denetimin Kalitesinin Gözden Geçirilmesi Formu" items={BCrumb}>
        <EkBelgeYukleButton formKodu="KysDenetimKaliteGozdenGecirme" />
      </Breadcrumb>
            <Box sx={{ mt: 3 }}>

                <KysCalismaKagidiUcSutunlu formKodu="KysDenetimKaliteGozdenGecirme" alanAdi="6.6 Denetimin Kalitesinin Gözden Geçirilmesi Formu" />
            </Box>
        </PageContainer>
    );
};

export default Page;
