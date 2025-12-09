import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";
import { Box, Typography } from "@mui/material";

const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/DenetiminYurutulmesi", title: "6. Denetimin Yürütülmesi" },
    { to: "/Kys/DenetiminYurutulmesi/CalismaKontrolFormu", title: "6.2 Çalışma Kontrol Formu" },
];

const Page: React.FC = () => {
    return (
        <PageContainer title="6.2 Çalışma Kontrol Formu" description="Çalışma Kontrol Formu">
            <Breadcrumb title="6.2 Çalışma Kontrol Formu" items={BCrumb} />
            <Box sx={{ mt: 3 }}>
                <KysCalismaKagidi formKodu="KysCalismaKontrolFormu" alanAdi="6.2 Çalışma Kontrol Formu" />
            </Box>
        </PageContainer>
    );
};

export default Page;
