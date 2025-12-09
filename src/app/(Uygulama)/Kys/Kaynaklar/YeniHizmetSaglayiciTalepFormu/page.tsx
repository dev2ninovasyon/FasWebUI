"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";


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

                <KysCalismaKagidi formKodu="KysYeniHizmetSaglayiciTalepFormu" alanAdi="7.9 Yeni Hizmet Sağlayıcı Talep Formu" />
            </Box>
        </PageContainer>
    );
};

export default Page;
