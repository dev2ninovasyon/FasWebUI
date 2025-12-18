"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box } from "@mui/material";
import KysEditor from "@/app/(Uygulama)/components/Kys/KysEditor";


const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/Kaynaklar", title: "7. Kaynaklar" },
    { to: "/Kys/Kaynaklar/EgitimVeGelisimKayitlari", title: "7.7 Eğitim ve Gelişim Kayıtları" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="7.7 Eğitim ve Gelişim Kayıtları" description="Eğitim ve Gelişim Kayıtları">
            <Breadcrumb title="7.7 Eğitim ve Gelişim Kayıtları" items={BCrumb} />
            <Box sx={{ mt: 3 }}>
                <KysEditor
                    formKodu="KysEgitimVeGelisimKayitlari"
                    alanAdi="7.7 Eğitim ve Gelişim Kayıtları"
                />
            </Box>
        </PageContainer>
    );
};

export default Page;
