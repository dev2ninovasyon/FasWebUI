"use client";

"use client";

import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { usePathname } from "next/navigation";
import CekSenetTablosu from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/CekSenetTablosu";
import { getDipnotNoByDipnotAdi } from "@/api/MaddiDogrulama/MaddiDogrulama";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import MaddiDogrulamaYorumComponent from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaYorumComponent";

const Page = () => {
    const pathname = usePathname();
    const segments = pathname.split("/");
    const parentNameIndex = segments.indexOf("MaddiDogrulamaProsedurleri") + 1;
    const parentName = segments[parentNameIndex];
    const childName = segments[parentNameIndex + 1];

    const user = useSelector((state: AppState) => state.userReducer);
    const [dip, setDip] = useState<string>("");

    const BCrumbList = [
        { to: "/", title: "Ana Sayfa" },
        { to: "/DenetimKanitlari/MaddiDogrulamaProsedurleri", title: "Maddi Doğrulama Prosedürleri" },
        { to: `/DenetimKanitlari/MaddiDogrulamaProsedurleri/${parentName}`, title: parentName },
        { title: "Çek Senet Tablosu" },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dipnotNo = await getDipnotNoByDipnotAdi(
                    user.token || "",
                    user.denetciId || 0,
                    user.denetlenenId || 0,
                    user.yil || 0,
                    "Çek Senet Tablosu",
                    user.denetimTuru === "Tfrs"
                );
                if (dipnotNo) {
                    setDip(dipnotNo);
                }
            } catch (error) {
                console.error("Error fetching maddi dogrulama:", error);
            }
        };
        fetchData();
    }, [user.token, user.denetciId, user.yil, user.denetlenenId, user.denetimTuru]);

    return (
        <PageContainer title="Çek Senet Tablosu" description="Çek Senet Tablosu">
            <Breadcrumb title={dip || "Çek Senet Tablosu"} items={BCrumbList} />
            <Box>
                <CekSenetTablosu dipnotNo={dip} />
            </Box>
            <MaddiDogrulamaYorumComponent parentName={parentName} childName={childName} />
        </PageContainer>
    );
};

export default Page;
