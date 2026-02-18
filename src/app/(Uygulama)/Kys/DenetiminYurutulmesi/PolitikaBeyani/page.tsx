"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";

import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/DenetiminYurutulmesi", title: "6. Denetimin Yürütülmesi" },
    { to: "/Kys/DenetiminYurutulmesi/PolitikaBeyani", title: "6.1 Denetimin Yürütülmesi Politikası Beyanı" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="6.1 Denetimin Yürütülmesi Politikası Beyanı" description="Denetimin Yürütülmesi Politikası Beyanı">
            <Breadcrumb title="6.1 Denetimin Yürütülmesi Politikası Beyanı" items={BCrumb}>
        <EkBelgeYukleButton formKodu="KysDenetiminYurutulmesiPolitikasi" />
      </Breadcrumb>
            <Box sx={{ mt: 3 }}>

                <KysCalismaKagidi formKodu="KysDenetiminYurutulmesiPolitikasi" alanAdi="6.1 Denetimin Yürütülmesi Politikası Beyanı" />
            </Box>
        </PageContainer>
    );
};

export default Page;
