"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import dynamic from "next/dynamic";
import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
const KysEditor = dynamic(() => import("@/app/(Uygulama)/components/Kys/KysEditor"), { ssr: false });


const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/Kaynaklar", title: "7. Kaynaklar" },
    { to: "/Kys/Kaynaklar/IdariCalisanPerformansi", title: "7.6 İdari Çalışanların Performansının Gözden Geçirilmesi" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="7.6 İdari Çalışanların Performansının Gözden Geçirilmesi" description="İdari Çalışanların Performansının Gözden Geçirilmesi">
            <Breadcrumb title="7.6 İdari Çalışanların Performansının Gözden Geçirilmesi" items={BCrumb}>
        <EkBelgeYukleButton formKodu="KysIdariCalisanPerformansi" />
      </Breadcrumb>
            <Box sx={{ mt: 3 }}>
                <KysEditor
                    formKodu="KysIdariCalisanPerformansi"
                    alanAdi="7.6 İdari Çalışanların Performansının Gözden Geçirilmesi"
                />
            </Box>
        </PageContainer>
    );
};

export default Page;
