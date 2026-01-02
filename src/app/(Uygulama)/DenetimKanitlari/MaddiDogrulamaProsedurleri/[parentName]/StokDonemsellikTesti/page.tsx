"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { getDipnotNoByDipnotAdi } from "@/api/MaddiDogrulama/MaddiDogrulama";
import StokDonemsellikTesti from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/StokDonemsellikTesti";
import MaddiDogrulamaYorumComponent from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaYorumComponent";

const Page = () => {
    const pathname = usePathname();
    const segments = pathname.split("/");
    const parentNameIndex = segments.indexOf("MaddiDogrulamaProsedurleri") + 1;
    const parentName = segments[parentNameIndex];
    const childName = segments[parentNameIndex + 1];

    const user = useSelector((state: AppState) => state.userReducer);
    const [dip, setDip] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dipnotNo = await getDipnotNoByDipnotAdi(
                    user.token || "",
                    user.denetciId || 0,
                    user.denetlenenId || 0,
                    user.yil || 0,
                    "Stok Dönemsellik Testi",
                    user.denetimTuru === "Tfrs"
                );
                if (dipnotNo) {
                    setDip(dipnotNo);
                }
            } catch (error) {
                console.error("DipnotNo çekme hatası:", error);
            }
        };
        fetchData();
    }, [user.token, user.denetciId, user.denetlenenId, user.yil, user.denetimTuru]);

    const BCrumbList = [
        { title: "Denetim Kanıtları", to: "/DenetimKanitlari" },
        { title: "Maddi Doğrulama Prosedürleri", to: "/DenetimKanitlari/MaddiDogrulamaProsedurleri" },
        { title: dip || "Stok Dönemsellik Testi" },
    ];

    return (
        <PageContainer title="Stok Dönemsellik Testi" description="Stok Dönemsellik Testi">
            <Breadcrumb title={dip || "Stok Dönemsellik Testi"} items={BCrumbList} />
            <StokDonemsellikTesti
                parentName={parentName}
                childName={childName}
                dipnotNo={dip}
            />
            <MaddiDogrulamaYorumComponent parentName={parentName} childName={childName} />
        </PageContainer>
    );
};

export default Page;
