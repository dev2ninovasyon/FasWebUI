"use client";
import {
  getMaddiDogrulama,
  getUygulananDenetimProsedurleri,
} from "@/api/MaddiDogrulama/MaddiDogrulama";
import UygulananDentimProsedurleri from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/UygulananDenetimProsedurleri";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Button, Grid, Typography } from "@mui/material";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const pathname = usePathname();
  const segments = pathname.split("/");
  const parentNameIndex = segments.indexOf("MaddiDogrulamaProsedurleri") + 1;
  const parentName = segments[parentNameIndex];
  const childName = segments[parentNameIndex + 1];

  const [isClickedVarsayilanaDon, setIsClickedVarsayilanaDon] = useState(false);

  const [dip, setDip] = useState("");
  const [dipnotNo, setDipnotNo] = useState<string>("");
  const [tamamlanan, setTamamlanan] = useState(0);
  const [toplam, setToplam] = useState(0);

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
      title: "Uygulanan Denetim Prosedürleri",
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
      const uygulananDentimProsedurleri = await getUygulananDenetimProsedurleri(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        dip || "",
        user.tfrsmi || false
      );

      uygulananDentimProsedurleri.forEach((veri: any) => {
        if (normalizeString(veri.dipnotAdi) == normalizeString(parentName)) {
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
      title={`${dip} | Uygulanan Denetim Prosedürleri`}
      description="this is Uygulanan Denetim Prosedürleri"
    >
      <Breadcrumb
        title={"Uygulanan Denetim Prosedürleri"}
        subtitle={`${dip}`}
        items={BCrumb}
      >
        <>
          <Grid
            container
            sx={{
              width: "95%",
              height: "100%",
              margin: "0 auto",
              justifyContent: "space-between",
            }}
          >
            <Grid
              item
              xs={12}
              md={4}
              lg={4}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  overflowWrap: "break-word",
                  wordWrap: "break-word",
                  textAlign: "center",
                }}
              >
                {tamamlanan}/{toplam} Tamamlandı
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              lg={6}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Button
                size="medium"
                variant="outlined"
                color="primary"
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
        </>
      </Breadcrumb>
      <UygulananDentimProsedurleri
        controller="UygulananDentimProsedurleri"
        isClickedVarsayilanaDon={isClickedVarsayilanaDon}
        alanAdi1="Kategori"
        alanAdi2="Konu"
        alanAdi3="Açıklama"
        setIsClickedVarsayilanaDon={setIsClickedVarsayilanaDon}
        setTamamlanan={setTamamlanan}
        setToplam={setToplam}
        dipnotAdi={parentName} // dipnotAdi olarak dinamik parentId'yi gönderiyoruz
        setDip={setDip}
      />
    </PageContainer>
  );
};

export default Page;
