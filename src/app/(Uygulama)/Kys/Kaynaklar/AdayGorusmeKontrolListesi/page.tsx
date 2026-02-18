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
    { to: "/Kys/Kaynaklar/AdayGorusmeKontrolListesi", title: "7.3 Aday Görüşme ve Değerlendirme Kontrol Listesi" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="7.3 Aday Görüşme ve Değerlendirme Kontrol Listesi" description="Aday Görüşme ve Değerlendirme Kontrol Listesi">
            <Breadcrumb title="7.3 Aday Görüşme ve Değerlendirme Kontrol Listesi" items={BCrumb}>
        <EkBelgeYukleButton formKodu="KysAdayGorusmeKontrolListesi" />
      </Breadcrumb>
            <Box sx={{ mt: 3 }}>
                <KysEditor
                    formKodu="KysAdayGorusmeKontrolListesi"
                    alanAdi="7.3 Aday Görüşme ve Değerlendirme Kontrol Listesi"
                />
            </Box>
        </PageContainer>
    );
};

export default Page;
