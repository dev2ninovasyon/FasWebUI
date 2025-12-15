"use client";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { usePathname } from "next/navigation";
import { useState } from "react";
import MaddiDogrulamaYorumComponent from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaYorumComponent";
import HesaplaraIliskinUygulananDenetimTestleri from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/HesaplaraIliskinUygulananDenetimTestleri";
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
      title: "Hesaplara İlişkin Uygulanan Denetim Testleri",
    },
  ];
  console.log(segments)
  return (
    <PageContainer
      title={`${dip} | Hesaplara İlişkin Uygulanan Denetim Testleri`}
      description="this is Hesaplara İlişkin Uygulanan Denetim Testleri"
    >
      <Breadcrumb
        title={"Hesaplara İlişkin Uygulanan Denetim Testleri"}
        subtitle={`${dip}`}
        items={BCrumb}
      ></Breadcrumb>
      <HesaplaraIliskinUygulananDenetimTestleri
        controller="HesaplaraIliskinUygulananDenetimTestleri"
        dipnotAdi={parentName}
        dipnotNo={parentName}   // dipnotNo artık parentName (örn: "FinansalVarlikveYatirimlar")
        modelAdi={parentName}   // modelAdi de parentName
        setDip={setDip}
      />
      <MaddiDogrulamaYorumComponent parentName={parentName} childName={childName} />
    </PageContainer>
  );
};

export default Page;
