"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import {
  getMaddiDogrulama,
  getDipnotNoByDipnotAdi,
} from "@/api/MaddiDogrulama/MaddiDogrulama";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

import MaddiDogrulamaYorumComponent from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaYorumComponent";
import YabanciParaTestleri from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/YabanciParaTestleri";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const pathname = usePathname();

  const segments = useMemo(() => pathname.split("/").filter(Boolean), [pathname]);

  const parentNameIndex = segments.indexOf("MaddiDogrulamaProsedurleri") + 1;
  const parentName = segments[parentNameIndex] || "";
  const childName = segments[parentNameIndex + 1] || "";

  const [dip, setDip] = useState("");
  const [dipnotNo, setDipnotNo] = useState<string>("");

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

    let normalized = str.replace(
      /[çğıöşüÇĞÖŞÜıİ]/g,
      (match) => turkishChars[match] || match
    );

    normalized = normalized.replace(/\s+/g, "");
    return normalized.toLowerCase();
  }

  const fetchDipTitle = async () => {
    try {
      const maddiDogrulama = await getMaddiDogrulama(
        user.token || "",
        user.denetimTuru || "",
        user.denetlenenId || 0,
        user.yil || 0
      );

      const found = maddiDogrulama?.find(
        (veri: any) =>
          normalizeString(veri?.name || "") === normalizeString(parentName)
      );

      if (found?.name) setDip(found.name);
    } catch (error) {
      console.error("fetchDipTitle error:", error);
    }
  };

  const fetchDipnotNo = async () => {
    try {
      const result = await getDipnotNoByDipnotAdi(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        parentName,
        user.denetimTuru === "Tfrs"
      );

      setDipnotNo(result || "");
    } catch (error) {
      console.error("fetchDipnotNo error:", error);
    }
  };

  useEffect(() => {
    if (parentName) {
      fetchDipTitle();
      fetchDipnotNo();
    }
  }, [parentName]);

  const currentPath = pathname;

  const basePath = useMemo(() => {
    if (!pathname) return "";
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length <= 1) return "/";
    return "/" + parts.slice(0, -1).join("/");
  }, [pathname]);

  const BCrumb = useMemo(() => {
    return [
      { to: "/DenetimKanitlari", title: "Denetim Kanıtları" },
      {
        to: "/DenetimKanitlari/MaddiDogrulamaProsedurleri",
        title: "Maddi Doğrulama Prosedürleri",
      },

      { to: basePath || "/DenetimKanitlari/MaddiDogrulamaProsedurleri", title: dip || parentName },

      { to: currentPath, title: "Yabancı Para Testleri" },
    ];
  }, [basePath, currentPath, dip, parentName]);

  return (
    <PageContainer
      title={`${dip || parentName} | Yabancı Para Testleri`}
      description="this is Yabancı Para Testleri"
    >
      <Breadcrumb title="" subtitle="Yabancı Para Testleri" items={BCrumb} />

      {dipnotNo !== "" ? (
        <YabanciParaTestleri
          controller="YabanciParaTestleri"
          dipnotAdi={parentName}
          dipnotNo={dipnotNo}
          modelAdi={parentName}
          setDip={setDip}
        />
      ) : null}

      <MaddiDogrulamaYorumComponent parentName={parentName} childName={childName} />
    </PageContainer>
  );
};

export default Page;
