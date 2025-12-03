"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";

const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/1", title: "KYS-1" },
    { to: "/Kys/1/DenetiminYurutulmesi", title: "6. Denetimin Yürütülmesi" },
    { to: "/Kys/1/DenetiminYurutulmesi/PolitikaBeyani", title: "6.1 Denetimin Yürütülmesi Politikası Beyanı" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="6.1 Denetimin Yürütülmesi Politikası Beyanı" description="Denetimin Yürütülmesi Politikası Beyanı">
            <Breadcrumb title="6.1 Denetimin Yürütülmesi Politikası Beyanı" items={BCrumb} />
            <Box sx={{ mt: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, color: "#1976d2", fontWeight: 600 }}>
                    6.1 DENETİMİN YÜRÜTÜLMESİ POLİTİKASI BEYANI
                </Typography>
                <KysCalismaKagidi formKodu="KysDenetiminYurutulmesiPolitikasi" alanAdi="6.1 Denetimin Yürütülmesi Politikası Beyanı" />
            </Box>
        </PageContainer>
    );
};

export default Page;
