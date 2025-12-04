"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";

const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/1", title: "KYS-1" },
    { to: "/Kys/1/DenetiminYurutulmesi", title: "Denetimin Yürütülmesi" },
    { to: "/Kys/1/DenetiminYurutulmesi/DenetiminYurutulmesiPolitikasi", title: "6.1 Denetimin Yürütülmesi Politikası Beyanı" },
];

const Page: React.FC = () => {
    return (
        <PageContainer
            title="6.1 Denetimin Yürütülmesi Politikası Beyanı"
            description="Denetimin Yürütülmesi Politikası Beyanı Belgesi"
        >
            <Breadcrumb title="6.1 Denetimin Yürütülmesi Politikası Beyanı" items={BCrumb} />

            <Box sx={{ mt: 3 }}>


                <KysCalismaKagidi formKodu="KysDenetiminYurutulmesiPolitikasi" alanAdi="6.1 Denetimin Yürütülmesi Politikası Beyanı" />
            </Box>
        </PageContainer>
    );
};

export default Page;
