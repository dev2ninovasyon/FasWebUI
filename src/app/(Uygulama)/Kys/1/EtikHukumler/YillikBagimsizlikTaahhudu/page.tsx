"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box } from "@mui/material";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";

const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/1", title: "KYS-1" },
    { to: "/Kys/1/EtikHukumler", title: "Etik Hükümler" },
    { to: "/Kys/1/EtikHukumler/YillikBagimsizlikTaahhudu", title: "4.2 Yıllık Bağımsızlık Taahhüdü" },
];

const Page: React.FC = () => {
    return (
        <PageContainer
            title="4.2 Yıllık Bağımsızlık Taahhüdü"
            description="Yıllık Bağımsızlık Taahhüdü Belgesi"
        >
            <Breadcrumb title="4.2 Yıllık Bağımsızlık Taahhüdü" items={BCrumb} />

            <Box sx={{ mt: 3 }}>


                <KysCalismaKagidi formKodu="YillikBagimsizlikTaahhudu" alanAdi="4.2 Yıllık Bağımsızlık Taahhüdü" />
            </Box>
        </PageContainer>
    );
};

export default Page;
