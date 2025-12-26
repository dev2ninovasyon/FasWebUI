"use client";

import React, { useEffect, useState } from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import { usePathname } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import SozlesmeTestleri from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/SozlesmeTestleri";
import MaddiDogrulamaYorumComponent from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaYorumComponent";
import { getMaddiDogrulama, getDipnotNoByDipnotAdi } from "@/api/MaddiDogrulama/MaddiDogrulama";

const SozlesmeTestleriPage = () => {
    const user = useSelector((state: AppState) => state.userReducer);
    const pathname = usePathname();
    const [dipnotNo, setDipnotNo] = useState<string>("");
    const [isClickedVarsayilanaDon, setIsClickedVarsayilanaDon] = useState(false);

    const segments = pathname.split("/");
    const parentNameIndex = segments.indexOf("MaddiDogrulamaProsedurleri") + 1;
    const parentName = segments[parentNameIndex];
    const childName = segments[parentNameIndex + 1];

    const [dip, setDip] = useState("");

    function normalizeString(str: string): string {
        const turkishChars: { [key: string]: string } = {
            ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
            Ç: "C", Ğ: "G", İ: "I", Ö: "O", Ş: "S", Ü: "U",
        };
        let normalized = str.replace(/[çğıöşüÇĞÖŞÜıİ]/g, (match) => turkishChars[match] || match);
        normalized = normalized.replace(/\s+/g, "");
        return normalized.toLowerCase();
    }

    const fetchData = async () => {
        try {
            const maddiDogrulama = await getMaddiDogrulama(
                user.token || "",
                user.denetimTuru || "",
                user.denetlenenId || 0,
                user.yil || 0
            );

            if (maddiDogrulama && Array.isArray(maddiDogrulama)) {
                maddiDogrulama.forEach((veri: any) => {
                    if (normalizeString(veri.name) == normalizeString(parentName)) {
                        setDip(veri.name);
                    }
                });
            }
        } catch (error) {
            console.error("An error occurred while fetching dipnot name:", error);
        }
    };

    const fetchData2 = async () => {
        try {
            const result = await getDipnotNoByDipnotAdi(
                user.token || "",
                user.denetciId || 0,
                user.denetlenenId || 0,
                user.yil || 0,
                parentName,
                user.denetimTuru === "Tfrs"
            );
            setDipnotNo(result);
        } catch (error) {
            console.error("An error occurred:", error);
        }
    };

    useEffect(() => {
        if (parentName) {
            fetchData();
            fetchData2();
        }
    }, [parentName, user.token]);

    const BCrumb = [
        { to: "/DenetimKanitlari", title: "Denetim Kanıtları" },
        { to: "/DenetimKanitlari/MaddiDogrulamaProsedurleri", title: "Maddi Doğrulama Prosedürleri" },
        { to: `/DenetimKanitlari/MaddiDogrulamaProsedurleri/${parentName}/${childName}`, title: `${dip}` },
        { title: "Sözleşme Testleri" },
    ];

    return (
        <PageContainer title={`${dip} | Sözleşme Testleri`} description="Sözleşme Testleri">
            <Breadcrumb title={"Sözleşme Testleri"} subtitle={`${dip}`} items={BCrumb}>
                <Grid container justifyContent="center" alignItems="center" sx={{ mt: 1 }}>
                    <Grid item xs={12} md={6} lg={4}></Grid>

                    <Grid
                        item
                        xs={12}
                        md={6}
                        lg={6}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center", // İlk koddaki buton merkezleme
                        }}
                    >
                        <Button
                            size="medium"
                            variant="outlined"
                            color="primary"
                            disabled={isClickedVarsayilanaDon}
                            onClick={() => setIsClickedVarsayilanaDon(true)}
                            sx={{ width: "100%" }}
                        >
                            <Typography
                                variant="body1"
                                sx={{ overflowWrap: "break-word", wordWrap: "break-word" }}
                            >
                                Varsayılana Dön
                            </Typography>
                        </Button>
                    </Grid>
                </Grid>
            </Breadcrumb>

            <SozlesmeTestleri
                isClickedVarsayilanaDon={isClickedVarsayilanaDon}
                setIsClickedVarsayilanaDon={setIsClickedVarsayilanaDon}
                dipnotNo={dipnotNo}
                modelAdi={childName}
            />

            <MaddiDogrulamaYorumComponent parentName={parentName} childName={childName} />
        </PageContainer>
    );
};

export default SozlesmeTestleriPage;