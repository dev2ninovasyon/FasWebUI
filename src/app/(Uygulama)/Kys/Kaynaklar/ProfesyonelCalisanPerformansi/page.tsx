"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysEditor from "@/app/(Uygulama)/components/Kys/KysEditor";


const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/Kaynaklar", title: "7. Kaynaklar" },
    { to: "/Kys/Kaynaklar/ProfesyonelCalisanPerformansi", title: "7.5 Profesyonel Çalışanların Performansının Gözden Geçirilmesi" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="7.5 Profesyonel Çalışanların Performansının Gözden Geçirilmesi" description="Profesyonel Çalışanların Performansının Gözden Geçirilmesi">
            <Breadcrumb title="7.5 Profesyonel Çalışanların Performansının Gözden Geçirilmesi" items={BCrumb} />
            <Box sx={{ mt: 3 }}>

                <KysEditor formKodu="KysProfesyonelCalisanPerformansi" alanAdi="7.5 Profesyonel Çalışanların Performansının Gözden Geçirilmesi" />
            </Box>
        </PageContainer>
    );
};

export default Page;
