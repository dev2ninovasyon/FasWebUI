"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { getDipnotNoByDipnotAdi } from "@/api/MaddiDogrulama/MaddiDogrulama";
import SonrakiDonemTestleri from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/SonrakiDonemTestleri";
import MaddiDogrulamaYorumComponent from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaYorumComponent";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import { IconPlus, IconTrash } from "@tabler/icons-react";

const Page = () => {
    const pathname = usePathname();
    const segments = pathname.split("/");
    const parentNameIndex = segments.indexOf("MaddiDogrulamaProsedurleri") + 1;
    const parentName = segments[parentNameIndex];

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
                    setDip("21");
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
        { title: "Sonraki Dönem Testleri" },
    ];

    const childRef = React.useRef<any>(null);

    return (
        <PageContainer title="Sonraki Dönem Testleri" description="Sonraki Dönem Testleri">
            <Breadcrumb title="Sonraki Dönem Testleri" items={BCrumbList}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        startIcon={<IconPlus size="18" />}
                        onClick={() => childRef.current?.handleSatirEkle()}
                    >
                        Yeni Satır Ekle
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        fullWidth
                        startIcon={<IconTrash size="18" />}
                        onClick={() => childRef.current?.handleSeciliSatirlariSil()}
                    >
                        Seçili Satırları Sil
                    </Button>
                </Box>
            </Breadcrumb>

            {isSearching ? (
                <Box sx={{ p: 5, textAlign: 'center' }}>
                    <CircularProgress size={24} sx={{ mb: 2 }} />
                    <Typography color="textSecondary">Dipnot bilgisi sorgulanıyor...</Typography>
                </Box>
            ) : dip ? (
                <>
                    <SonrakiDonemTestleri
                        ref={childRef}
                        parentName={parentName}
                        childName="SonrakiDonemTestleri"
                        dipnotNo={dip}
                    />
                    <Box mt={3}>
                        <MaddiDogrulamaYorumComponent
                            parentName={parentName}
                            childName="SonrakiDonemTestleri"
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
