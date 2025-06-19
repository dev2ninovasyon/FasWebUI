"use client";
import {
  getMaddiDogrulama,
  getUygulananDenetimProsedurleri,
} from "@/api/MaddiDogrulama/MaddiDogrulama";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Grid } from "@mui/material";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Mutabakat from "./Mutabakat";
const YorumEditor = dynamic(
  () => import("@/app/(Uygulama)/components/Editor/YorumEditor"),
  {
    ssr: false,
  }
);
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
      title: "Mutabakatlar (VUK)",
    },
  ];

  function normalizeString(str: string): string {
    const turkishChars: { [key: string]: string } = {
      ç: "c",
      ğ: "g",
      ı: "i",
      İ: "i",
      ö: "o",
      ş: "s",
      ü: "u",
      Ç: "C",
      Ğ: "G",
      Ö: "O",
      Ş: "S",
      Ü: "U",
    };

    return str.replace(
      /[çğıöşüÇĞÖŞÜıİ]/g,
      (match) => turkishChars[match] || match
    );
  }

  const fetchData = async () => {
    try {
      const maddiDogrulama = await getMaddiDogrulama(
        user.token || "",
        user.denetimTuru || ""
      );

      maddiDogrulama.forEach((veri: any) => {
        if (
          normalizeString(veri.name.replaceAll(" ", "").toLowerCase()) ==
          normalizeString(parentName.replaceAll(" ", "").toLowerCase())
        ) {
          setDip(veri.name);
        }
      });
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const fetchData2 = async () => {
    try {
      const uygulananDentimProsedurleri = await getUygulananDenetimProsedurleri(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        dip || "",
        user.tfrsmi || false
      );

      uygulananDentimProsedurleri.forEach((veri: any) => {
        if (
          normalizeString(veri.dipnotAdi.replaceAll(" ", "").toLowerCase()) ==
          normalizeString(parentName.replaceAll(" ", "").toLowerCase())
        ) {
          setDipnotNo(veri.dipnotNo);
        }
      });
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  useEffect(() => {
    if (parentName && parentName.length > 0) {
      fetchData();
    }
  }, [parentName]);

  useEffect(() => {
    if (dip) {
      fetchData2();
    }
  }, [dip]);

  return (
    <PageContainer
      title={`${dip} | Mutabakatlar (VUK)`}
      description="this is Mutabakatlar (VUK)"
    >
      <Breadcrumb
        title="Mutabakatlar (VUK)"
        subtitle={`${dip}`}
        items={BCrumb}
      ></Breadcrumb>
      <Grid container>
        <Grid item xs={12} sm={12} lg={12} mb={3}>
          <YorumEditor></YorumEditor>
        </Grid>
        <Grid item xs={12} sm={12} lg={12}>
          {dipnotNo != "" ? <Mutabakat dipnot={dipnotNo} /> : <></>}
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
