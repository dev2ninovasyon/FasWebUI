"use client";
import RiskTespiti from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/RiskTespiti";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Page = () => {
  const pathname = usePathname();
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
      title: `${dip}`,
    },
    {
      to: `/DenetimKanitlari/MaddiDogrulamaProsedurleri/${parentName}/${childName}`,
      title: "Risk Tespiti",
    },
  ];

  return (
    <PageContainer
      title={`${dip} | Risk Tespiti`}
      description="this is Risk Tespiti"
    >
      <Breadcrumb
        title={"Risk Tespiti"}
        subtitle={`${dip}`}
        items={BCrumb}
      ></Breadcrumb>
      <RiskTespiti
        controller="FinansalTablolarDenetimRiskiBelirleme"
        dipnotAdi={parentName} // dipnotAdi olarak dinamik parentId'yi gönderiyoruz
        setDip={setDip}
      />
    </PageContainer>
  );
};

export default Page;
