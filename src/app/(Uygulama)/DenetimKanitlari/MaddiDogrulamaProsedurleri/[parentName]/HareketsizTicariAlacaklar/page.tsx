"use client";
import {
    getMaddiDogrulama,
    getDipnotNoByDipnotAdi,
} from "@/api/MaddiDogrulama/MaddiDogrulama";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import MaddiDogrulamaYorumComponent from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaYorumComponent";

import HareketsizTicariAlacaklar from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/HareketsizTicariAlacaklar";

const Page = () => {
    const user = useSelector((state: AppState) => state.userReducer);

    const pathname = usePathname();
    const segments = pathname.split("/");
    const parentNameIndex = segments.indexOf("MaddiDogrulamaProsedurleri") + 1;
    const parentName = segments[parentNameIndex];
    const childName = segments[parentNameIndex + 1];

    const [dip, setDip] = useState("");
    const [dipnotNo, setDipnotNo] = useState<string>("");

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
            title: `${dip}`,
        },
        {
            to: `/DenetimKanitlari/MaddiDogrulamaProsedurleri/${parentName}/${childName}`,
            title: "Hareketsiz Ticari Alacaklar Çalışması",
        },
    ];

    function normalizeString(str: string): string {
        const turkishChars: { [key: string]: string } = {
            ç: "c",
            ğ: "g",
            ı: "i",
            ö: "o",
            ş: "s",
            ü: "u",
            Ç: "C",
            Ğ: "G",
            İ: "I",
            Ö: "O",
            Ş: "S",
            Ü: "U",
        };

        // Türkçe karakterleri değiştir
        let normalized = str.replace(
            /[çğıöşüÇĞÖŞÜıİ]/g,
            (match) => turkishChars[match] || match
        );

        // Tüm boşluk, tab, satır başı/sonu karakterlerini sil
        normalized = normalized.replace(/\s+/g, "");

        // Küçük harfe çevir
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

            maddiDogrulama.forEach((veri: any) => {
                if (normalizeString(veri.name) == normalizeString(parentName)) {
                    setDip(veri.name);
                }
            });
        } catch (error) {
            console.error("An error occurred:", error);
        }
    };

    const fetchData2 = async () => {
        try {
            const dipnotNo = await getDipnotNoByDipnotAdi(
                user.token || "",
                user.denetciId || 0,
                user.denetlenenId || 0,
                user.yil || 0,
                parentName,
                user.denetimTuru === "Tfrs"
            );

            console.log("dipnotNo", dipnotNo);
            setDipnotNo(dipnotNo);
        } catch (error) {
            console.error("An error occurred:", error);
        }
    };

    useEffect(() => {
        if (parentName && parentName.length > 0) {
            fetchData();
            fetchData2();
        }
    }, [parentName]);

    return (
        <PageContainer
            title={`${dip} | Hareketsiz Ticari Alacaklar Çalışması`}
            description="Hareketsiz Ticari Alacaklar Çalışması"
        >
            <Breadcrumb
                title={"Hareketsiz Ticari Alacaklar Çalışması"}
                subtitle={`${dip}`}
                items={BCrumb}
            ></Breadcrumb>

            {dipnotNo != "" ? (
                <HareketsizTicariAlacaklar
                    controller="HareketsizTicariAlacaklar"
                    dipnotAdi={parentName}
                    dipnotNo={dipnotNo}
                    modelAdi={parentName}
                    setDip={setDip}
                />
            ) : (
                <></>
            )}

            <MaddiDogrulamaYorumComponent parentName={parentName} childName={childName} />
        </PageContainer>
    );
};

export default Page;
