"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysBelgeEditor from "@/app/(Uygulama)/components/Kys/KysBelgeEditor";

const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/1", title: "KYS-1" },
    { to: "/Kys/1/MusteriIliskisi", title: "Müşteri İlişkisinin Kabulü ve Devam Ettirilmesi" },
    { to: "/Kys/1/MusteriIliskisi/EtikMektubu", title: "5.4 Etik Mektubu" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="5.4 Etik Mektubu" description="Etik Mektubu">
            <Breadcrumb title="5.4 Etik Mektubu" items={BCrumb} />
            <Box sx={{ mt: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, color: "#1976d2", fontWeight: 600 }}>
                    5.4 ETİK MEKTUBU
                </Typography>
                <KysBelgeEditor formKodu="KysEtikMektubu" />
            </Box>
        </PageContainer>
    );
};

export default Page;
