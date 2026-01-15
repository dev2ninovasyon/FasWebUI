"use client";

import React from "react";
import { usePathname } from "next/navigation";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import StoklarNetGerceklesebilirDeger from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/StoklarNetGerceklesebilirDeger";
import MaddiDogrulamaYorumComponent from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaYorumComponent";
import { Box, Button } from "@mui/material";
import { IconRefresh } from "@tabler/icons-react";

const Page = () => {
    const pathname = usePathname();
    const segments = pathname.split("/");
    const parentNameIndex = segments.indexOf("MaddiDogrulamaProsedurleri") + 1;
    const parentName = segments[parentNameIndex];

    const BCrumbList = [
        { title: "Denetim Kanıtları", to: "/DenetimKanitlari" },
        { title: "Maddi Doğrulama Prosedürleri", to: "/DenetimKanitlari/MaddiDogrulamaProsedurleri" },
        { title: "Stoklar Net Gerçekleşebilir Değer" },
    ];

    const childRef = React.useRef<any>(null);

    return (
        <PageContainer title="Stoklar Net Gerçekleşebilir Değer" description="Stoklar Net Gerçekleşebilir Değer">
            <Breadcrumb title="Stoklar Net Gerçekleşebilir Değer" items={BCrumbList}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<IconRefresh size="18" />}
                    onClick={() => childRef.current?.handleOlustur()}
                >
                    Verileri Getir
                </Button>
            </Breadcrumb>

            <StoklarNetGerceklesebilirDeger
                ref={childRef}
                parentName={parentName}
                childName="StoklarNetGerceklesebilirDeger"
            />
            <Box mt={3}>
                <MaddiDogrulamaYorumComponent
                    parentName={parentName}
                    childName="StoklarNetGerceklesebilirDeger"
                />
            </Box>
        </PageContainer>
    );
};

export default Page;
