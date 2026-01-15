"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { getDipnotNoByDipnotAdi } from "@/api/MaddiDogrulama/MaddiDogrulama";
import HasilatDonemsellikTesti from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/HasilatDonemsellikTesti";
import MaddiDogrulamaYorumComponent from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaYorumComponent";
import { Box, Typography, CircularProgress } from "@mui/material";

const Page = () => {
    const pathname = usePathname();
    const segments = pathname.split("/");
    const parentNameIndex = segments.indexOf("MaddiDogrulamaProsedurleri") + 1;
    const parentName = segments[parentNameIndex];
    const childName = segments[parentNameIndex + 1];

    const user = useSelector((state: AppState) => state.userReducer);
    const [dip, setDip] = useState<string>("");
    const [isSearching, setIsSearching] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user.token || !user.denetlenenId) return;

            try {
                setIsSearching(true);
                const dipnotNo = await getDipnotNoByDipnotAdi(
                    user.token,
                    user.denetciId || 0,
                    user.denetlenenId || 0,
                    user.yil || 0,
                    parentName,
                    user.denetimTuru === "Tfrs"
                );

                if (dipnotNo) {
                    setDip(dipnotNo);
                } else {
                    console.warn("Dipnot bulunamadı, varsayılan '01' kullanılıyor.");
                    setDip("01");
                }
            } catch (error) {
                console.error("DipnotNo çekme hatası:", error);
            } finally {
                setIsSearching(false);
            }
        };
        fetchData();
    }, [user.token, user.denetlenenId, user.yil, user.denetimTuru]);

    const BCrumbList = [
        { title: "Denetim Kanıtları", to: "/DenetimKanitlari" },
        { title: "Maddi Doğrulama Prosedürleri", to: "/DenetimKanitlari/MaddiDogrulamaProsedurleri" },
        { title: "Hasılat Dönemsellik Testi" },
    ];

    return (
        <PageContainer title="Hasılat Dönemsellik Testi" description="Hasılat Dönemsellik Testi">
            <Breadcrumb title="Hasılat Dönemsellik Testi" items={BCrumbList} />

            {isSearching ? (
                <Box sx={{ p: 5, textAlign: 'center' }}>
                    <CircularProgress size={24} sx={{ mb: 2 }} />
                    <Typography color="textSecondary">Dipnot bilgisi sorgulanıyor...</Typography>
                </Box>
            ) : dip ? (
                <>
                    <HasilatDonemsellikTesti
                        parentName={parentName}
                        childName="HasilatDonemsellikTesti"
                        dipnotNo={dip}
                    />
                    <Box mt={3}>
                        <MaddiDogrulamaYorumComponent
                            parentName={parentName}
                            childName="HasilatDonemsellikTesti"
                        />
                    </Box>
                </>
            ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="error">Dipnot numarası alınamadığı için tablo yüklenemedi.</Typography>
                </Box>
            )}
        </PageContainer>
    );
};

export default Page;
