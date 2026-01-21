"use client";
import React, { useEffect, useState, useMemo } from "react";
import RiskTespiti from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/RiskTespiti";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { usePathname } from "next/navigation";
import MaddiDogrulamaYorumComponent from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaYorumComponent";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getMaddiDogrulama } from "@/api/MaddiDogrulama/MaddiDogrulama";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const pathname = usePathname();
  const segments = pathname.split("/");
  const parentNameIndex = segments.indexOf("MaddiDogrulamaProsedurleri") + 1;
  const parentName = segments[parentNameIndex];
  const childName = segments[parentNameIndex + 1];

  const [dip, setDip] = useState("");

  const currentPath = pathname;
  const basePath = useMemo(() => {
    if (!pathname) return "";
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length <= 1) return "/";
    return "/" + parts.slice(0, -1).join("/");
  }, [pathname]);

  function normalizeString(str: string): string {
    const turkishChars: { [key: string]: string } = {
      ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
      Ç: "C", Ğ: "G", İ: "I", Ö: "O", Ş: "S", Ü: "U",
    };
    let normalized = str.replace(/[çğıöşüÇĞÖŞÜıİ]/g, (match) => turkishChars[match] || match);
    normalized = normalized.replace(/\s+/g, "");
    return normalized.toLowerCase();
  }

  const fetchDipTitle = async () => {
    try {
      const maddiDogrulama = await getMaddiDogrulama(
        user.token || "", user.denetimTuru || "", user.denetlenenId || 0, user.yil || 0
      );
      const found = maddiDogrulama?.find((veri: any) => normalizeString(veri?.name || "") === normalizeString(parentName));
      if (found?.name) setDip(found.name);
    } catch (error) {
      console.error("fetchDipTitle error:", error);
    }
  };

  useEffect(() => {
    if (parentName) {
      fetchDipTitle();
    }
  }, [parentName, user.token]);

  const BCrumbList = useMemo(() => {
    return [
      { to: "/DenetimKanitlari", title: "Denetim Kanıtları" },
      { to: "/DenetimKanitlari/MaddiDogrulamaProsedurleri", title: "Maddi Doğrulama Prosedürleri" },
      { to: basePath || "/DenetimKanitlari/MaddiDogrulamaProsedurleri", title: dip || parentName },
      { to: currentPath, title: "Risk Tespiti" },
    ];
  }, [basePath, currentPath, dip, parentName]);

  return (
    <PageContainer
      title={`${dip} | Risk Tespiti`}
      description="Risk Tespiti"
    >
      <Breadcrumb
        title=""
        subtitle="Risk Tespiti"
        items={BCrumbList}
      ></Breadcrumb>
      <RiskTespiti
        controller="FinansalTablolarDenetimRiskiBelirleme"
        dipnotAdi={parentName} // dipnotAdi olarak dinamik parentId'yi gönderiyoruz
        setDip={setDip}
      />
      <MaddiDogrulamaYorumComponent parentName={parentName} childName={childName} />
    </PageContainer>
  );
};

export default Page;
