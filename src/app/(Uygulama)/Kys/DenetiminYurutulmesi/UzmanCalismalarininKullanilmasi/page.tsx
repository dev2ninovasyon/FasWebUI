import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import KysCalismaKagidiUcSutunlu from "@/app/(Uygulama)/components/Kys/KysCalismaKagidiUcSutunlu";
import { Box, Typography } from "@mui/material";

const BCrumb = [
    {
        to: "/Kys",
        title: "KYS",
    },
    {
        to: "/Kys/DenetiminYurutulmesi",
        title: "6. Denetimin Yürütülmesi",
    },
    {
        to: "/Kys/DenetiminYurutulmesi/UzmanCalismalarininKullanilmasi",
        title: "6.3 Uzman Çalışmalarının Kullanılması",
    },
];

const Page: React.FC = () => {
    return (
        <PageContainer
            title="6.3 Uzman Çalışmalarının Kullanılması"
            description="Uzman Çalışmalarının Kullanılması"
        >
            <Breadcrumb title="6.3 Uzman Çalışmalarının Kullanılması" items={BCrumb} />
            <Box sx={{ mt: 3 }}>
                <KysCalismaKagidiUcSutunlu
                    formKodu="KysUzmanCalismalarininKullanilmasi"
                    alanAdi="6.3 Uzman Çalışmalarının Kullanılması"
                    baslikKonu="Konu"
                    baslikYorum="Ad"
                    baslikCozum="İletişim ayrıntıları"
                />
            </Box>
        </PageContainer>
    );
};

export default Page;
