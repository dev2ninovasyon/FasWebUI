"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";

const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/1", title: "KYS-1" },
    { to: "/Kys/1/BilgiVeIletisim", title: "Bilgi ve İletişim" },
    { to: "/Kys/1/BilgiVeIletisim/BilgiVeIletisimPolitikasi", title: "8.1 Bilgi ve İletişim Politikası Beyanı" },
];

const Page: React.FC = () => {
    return (
        <PageContainer
            title="8.1 Bilgi ve İletişim Politikası Beyanı"
            description="Bilgi ve İletişim Politikası Beyanı Belgesi"
        >
            <Breadcrumb title="8.1 Bilgi ve İletişim Politikası Beyanı" items={BCrumb} />

            <Box sx={{ mt: 3 }}>


                <KysCalismaKagidi formKodu="KysBilgiVeIletisimPolitikasi" alanAdi="8.1 Bilgi ve İletişim Politikası Beyanı" />
            </Box>
        </PageContainer>
    );
};

export default Page;
