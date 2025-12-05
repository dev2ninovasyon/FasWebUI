"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysBelgeEditor from "@/app/(Uygulama)/components/Kys/KysBelgeEditor";

const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/Kaynaklar", title: "7. Kaynaklar" },
    { to: "/Kys/Kaynaklar/YeniHizmetSaglayiciTalepFormu", title: "7.9 Yeni Hizmet Sağlayıcı Talep Formu" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="7.9 Yeni Hizmet Sağlayıcı Talep Formu" description="Yeni Hizmet Sağlayıcı Talep Formu">
            <Breadcrumb title="7.9 Yeni Hizmet Sağlayıcı Talep Formu" items={BCrumb} />
            <Box sx={{ mt: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, color: "#1976d2", fontWeight: 600 }}>
                    7.9 YENİ HİZMET SAĞLAYICI TALEP FORMU
                </Typography>
                <KysBelgeEditor formKodu="KysYeniHizmetSaglayiciTalepFormu" />
            </Box>
        </PageContainer>
    );
};

export default Page;
