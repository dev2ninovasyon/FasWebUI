"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";

const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/1", title: "KYS-1" },
    { to: "/Kys/1/MusteriIliskisi", title: "Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Ettirilmesi" },
    { to: "/Kys/1/MusteriIliskisi/MusteriIliskisiPolitikasi", title: "5.1 Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Etmesi Politikası" },
];

const Page: React.FC = () => {
    return (
        <PageContainer
            title="5.1 Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Etmesi Politikası"
            description="Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Etmesi Politikası Belgesi"
        >
            <Breadcrumb title="5.1 Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Etmesi Politikası" items={BCrumb} />

            <Box sx={{ mt: 3 }}>


                <KysCalismaKagidi formKodu="KysMusteriIliskisiPolitikasi" alanAdi="5.1 Müşteri İlişkisinin ve Belirli Bir Sözleşmenin Kabulü ve Devam Etmesi Politikası" />
            </Box>
        </PageContainer>
    );
};

export default Page;
