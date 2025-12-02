import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";
import { Box, Typography } from "@mui/material";

const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/1", title: "KYS-1" },
    { to: "/Kys/1/DenetiminYurutulmesi", title: "6. Denetimin Yürütülmesi" },
    { to: "/Kys/1/DenetiminYurutulmesi/GorusFarkliliklarininCozumu", title: "6.5 Görüş Farklılıklarının Çözüme Kavuşturulması" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="6.5 Görüş Farklılıklarının Çözüme Kavuşturulması" description="Görüş Farklılıklarının Çözüme Kavuşturulması">
            <Breadcrumb title="6.5 Görüş Farklılıklarının Çözüme Kavuşturulması" items={BCrumb} />
            <Box sx={{ mt: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, color: "#1976d2", fontWeight: 600 }}>
                    6.5 GÖRÜŞ FARKLILIKLARININ ÇÖZÜME KAVUŞTURULMASI
                </Typography>
                <KysCalismaKagidi formKodu="KysGorusFarkliliklarininCozumu" alanAdi="6.5 Görüş Farklılıklarının Çözüme Kavuşturulması" />
            </Box>
        </PageContainer>
    );
};

export default Page;
