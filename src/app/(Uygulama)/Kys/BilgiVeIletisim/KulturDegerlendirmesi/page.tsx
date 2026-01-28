"use client";

import dynamic from "next/dynamic";
import { Box } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
const KysEditor = dynamic(() => import("@/app/(Uygulama)/components/Kys/KysEditor"), { ssr: false });

const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/BilgiVeIletisim", title: "8. Bilgi ve İletişim" },
    { to: "/Kys/BilgiVeIletisim/KulturDegerlendirmesi", title: "8.2 Kültür Değerlendirmesi – Kalite" },
];

const Page: React.FC = () => {
    return (
        <PageContainer
            title="8.2 Kültür Değerlendirmesi – Kalite"
            description="8.2 Kültür Değerlendirmesi – Kalite"
        >
            <Breadcrumb title="8.2 Kültür Değerlendirmesi – Kalite" items={BCrumb} />
            <Box sx={{ mt: 3 }}>
                <KysEditor
                    formKodu="KysBilgiVeIletisimKulturDegerlendirmesi"
                    alanAdi="8.2 Kültür Değerlendirmesi – Kalite"
                />
            </Box>
        </PageContainer>
    );
};

export default Page;
