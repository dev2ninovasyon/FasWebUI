"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";

const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/1", title: "KYS-1" },
    { to: "/Kys/1/EtikHukumler", title: "Etik Hükümler" },
    { to: "/Kys/1/EtikHukumler/EtikHukumlerPolitikaBeyani", title: "4.1 Etik Hükümler Politikası Beyanı" },
];

const Page: React.FC = () => {
    return (
        <PageContainer
            title="4.1 Etik Hükümler Politikası Beyanı"
            description="Etik Hükümler Politikası Beyanı Belgesi"
        >
            <Breadcrumb title="4.1 Etik Hükümler Politikası Beyanı" items={BCrumb} />

            <Box sx={{ mt: 3 }}>


                <KysCalismaKagidi formKodu="EtikHukumlerPolitikaBeyani" alanAdi="4.1 Etik Hükümler Politikası Beyanı" />
            </Box>
        </PageContainer>
    );
};

export default Page;
