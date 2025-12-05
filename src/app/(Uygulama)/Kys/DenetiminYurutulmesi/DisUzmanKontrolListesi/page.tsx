import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";
import { Box, Typography } from "@mui/material";

const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/DenetiminYurutulmesi", title: "6. Denetimin Yürütülmesi" },
    { to: "/Kys/DenetiminYurutulmesi/DisUzmanKontrolListesi", title: "6.4 Dış Uzmanların Kullanılmasına İlişkin Kontrol Listesi" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="6.4 Dış Uzmanların Kullanılmasına İlişkin Kontrol Listesi" description="Dış Uzmanların Kullanılmasına İlişkin Kontrol Listesi">
            <Breadcrumb title="6.4 Dış Uzmanların Kullanılmasına İlişkin Kontrol Listesi" items={BCrumb} />
            <Box sx={{ mt: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, color: "#1976d2", fontWeight: 600 }}>
                    6.4 DIŞ UZMANLARIN KULLANILMASINA İLİŞKİN KONTROL LİSTESİ
                </Typography>
                <KysCalismaKagidi formKodu="KysDisUzmanKontrolListesi" alanAdi="6.4 Dış Uzmanların Kullanılmasına İlişkin Kontrol Listesi" />
            </Box>
        </PageContainer>
    );
};

export default Page;
