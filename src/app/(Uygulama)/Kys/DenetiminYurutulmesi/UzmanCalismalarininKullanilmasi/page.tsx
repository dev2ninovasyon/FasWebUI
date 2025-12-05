import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";
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
                <Typography variant="h4" sx={{ mb: 3, color: "#1976d2", fontWeight: 600 }}>
                    6.3 UZMAN ÇALIŞMALARININ KULLANILMASI
                </Typography>
                <KysCalismaKagidi formKodu="KysUzmanCalismalarininKullanilmasi" alanAdi="6.3 Uzman Çalışmalarının Kullanılması" />
            </Box>
        </PageContainer>
    );
};

export default Page;
