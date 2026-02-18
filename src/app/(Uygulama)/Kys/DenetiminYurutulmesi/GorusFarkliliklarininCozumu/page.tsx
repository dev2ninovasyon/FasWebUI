"use client";

import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import dynamic from "next/dynamic";
import { Box, Typography } from "@mui/material";

import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
const KysEditor = dynamic(() => import("@/app/(Uygulama)/components/Kys/KysEditor"), { ssr: false });

const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/DenetiminYurutulmesi", title: "6. Denetimin Yürütülmesi" },
    { to: "/Kys/DenetiminYurutulmesi/GorusFarkliliklarininCozumu", title: "6.5 Görüş Farklılıklarının Çözüme Kavuşturulması" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="6.5 Görüş Farklılıklarının Çözüme Kavuşturulması" description="Görüş Farklılıklarının Çözüme Kavuşturulması">
            <Breadcrumb title="6.5 Görüş Farklılıklarının Çözüme Kavuşturulması" items={BCrumb}>
        <EkBelgeYukleButton formKodu="KysGorusFarkliliklarininCozumu" />
      </Breadcrumb>
            <Box sx={{ mt: 3 }}>
                <KysEditor
                    formKodu="KysGorusFarkliliklarininCozumu"
                    alanAdi="6.5 Görüş Farklılıklarının Çözüme Kavuşturulması"
                />
            </Box>
        </PageContainer>
    );
};

export default Page;
