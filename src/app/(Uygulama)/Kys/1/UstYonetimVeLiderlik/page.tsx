"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
    {
        to: "/Kys",
        title: "KYS",
    },
    {
        to: "/Kys/1",
        title: "KYS-1",
    },
    {
        to: "/Kys/1/UstYonetimVeLiderlik",
        title: "Üst Yönetim ve Liderlik Yapısı",
    },
];

const Page = () => {
    return (
        <PageContainer
            title="3. Üst Yönetim ve Liderlik Yapısı"
            description="Üst Yönetim ve Liderlik Yapısı"
        >
            <Breadcrumb title="Üst Yönetim ve Liderlik Yapısı" items={BCrumb} />
            <Box>
                <TopCards title="3. Üst Yönetim ve Liderlik Yapısı" />
            </Box>
        </PageContainer>
    );
};

export default Page;
