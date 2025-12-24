"use client";

import React, { useState } from "react";
import { Box } from "@mui/material";
import { usePathname } from "next/navigation";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import RiskTespiti from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/RiskTespiti";
import ReeskontTestleri from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/ReeskontTestleri";
import MaddiDogrulamaYorumComponent from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaYorumComponent";

interface Props {
    searchParams: {
        dipnotNo: string;
    };
}

const ReeskontTestleriPage = ({ searchParams }: Props) => {
    const pathname = usePathname();
    const { dipnotNo } = searchParams;

    // URL segmentlerinden hiyerarşiyi çözüyoruz
    const segments = pathname.split("/");
    const parentNameIndex = segments.indexOf("MaddiDogrulamaProsedurleri") + 1;
    const parentName = segments[parentNameIndex];
    const childName = segments[parentNameIndex + 1];

    const [dip, setDip] = useState("");

    const BCrumb = [
        {
            to: "/DenetimKanitlari",
            title: "Denetim Kanıtları",
        },
        {
            to: "/DenetimKanitlari/MaddiDogrulamaProsedurleri",
            title: "Maddi Doğrulama Prosedürleri",
        },
        {
            to: `/DenetimKanitlari/MaddiDogrulamaProsedurleri/${parentName}/${childName}`,
            title: `${dip || "Yükleniyor..."}`,
        },
        {
            title: "Reeskont Testleri",
        },
    ];

    return (
        <PageContainer
            title={`${dip} | Reeskont Testleri`}
            description="Reeskont Testleri Çalışması"
        >
            <Breadcrumb
                title={"Reeskont Testleri"}
                subtitle={`${dip}`}
                items={BCrumb}
            />

            <Box sx={{ mb: 3 }}>
                <ReeskontTestleri
                    dipnotNo={dipnotNo || "05-01"}
                    modelAdi={parentName}
                />
            </Box>

            <MaddiDogrulamaYorumComponent
                parentName={parentName}
                childName={childName}
            />
        </PageContainer>
    );
};

export default ReeskontTestleriPage;