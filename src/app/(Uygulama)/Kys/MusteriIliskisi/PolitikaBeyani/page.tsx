"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysBelgeEditor from "@/app/(Uygulama)/components/Kys/KysBelgeEditor";

const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/MusteriIliskisi", title: "5. Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Ettirilmesi" },
    { to: "/Kys/MusteriIliskisi/PolitikaBeyani", title: "5.1 Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Ettirilmesi Politikası Beyanı" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="5.1 Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Ettirilmesi Politikası Beyanı" description="Müşteri İlişkisi Politikası Beyanı">
            <Breadcrumb title="5.1 Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Ettirilmesi Politikası Beyanı" items={BCrumb} />
            <Box sx={{ mt: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, color: "#1976d2", fontWeight: 600 }}>
                    5.1 MÜŞTERİ İLİŞKİSİNİN VE BELİRLİ BİR SÖZLEŞMENİN KABULÜ VE DEVAM ETTİRİLMESİ POLİTİKASI BEYANI
                </Typography>
                <KysBelgeEditor formKodu="KysMusteriIliskisiPolitikasi" />
            </Box>
        </PageContainer>
    );
};

export default Page;
