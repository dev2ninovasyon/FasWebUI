"use client";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { usePathname } from "next/navigation";
import { useState } from "react";
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

  return (
    <PageContainer
      title={`${dip} | Hesaplara İlişkin Uygulanan Denetim Testleri`}
      description="this is Hesaplara İlişkin Uygulanan Denetim Testleri"
    >
      <Breadcrumb
        title={"Uygulanan"}
        subtitle={`${dip}`}
        items={BCrumb}
      ></Breadcrumb>
      <HesaplaraIliskinUygulananDenetimTestleri
        controller="HesaplaraIliskinUygulananDenetimTestleriController"
        dipnotAdi={parentName} // dipnotAdi olarak dinamik parentId'yi gönderiyoruz
        setDip={setDip}
      />
    </PageContainer>
  );
};

export default Page;
