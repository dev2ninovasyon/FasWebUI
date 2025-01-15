"use client";
import UygulananDentimProsedurleri from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/UygulananDenetimProsedurleri";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Button, Grid, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useState } from "react";
const YorumEditor = dynamic(
  () => import("@/app/(Uygulama)/components/Editor/YorumEditor"),
  {
    ssr: false,
  }
);
const Page = () => {
  const formatWithSpaces = (str: string) => {
    return str.replace(/([A-Z])/g, " $1").trim();
  };
  const pathname = usePathname();
  const segments = pathname.split("/");
  const parentNameIndex = segments.indexOf("MaddiDogrulamaProsedurleri") + 1;
  const parentName = segments[parentNameIndex];
  const childName = segments[parentNameIndex + 1];

  const parentNameWithSpaces = formatWithSpaces(segments[parentNameIndex]);
  const childNameWithSpaces = formatWithSpaces(segments[parentNameIndex + 1]);

  // Bileşen için gerekli state'ler
  const [isClickedVarsayılanaDon, setIsClickedVarsayılanaDon] = useState(false);

  const [dip, setDip] = useState(parentNameWithSpaces);
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
      title: "Mutabakatlar (VUK)",
    },
  ];

  return (
    <PageContainer
      title={`${dip} | Mutabakatlar (VUK)`}
      description="this is Mutabakatlar (VUK)"
    >
      <Breadcrumb
        title={`${dip} `}
        subtitle="Mutabakatlar (VUK)"
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
              md={3.8}
              lg={3.8}
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
              xs={5.8}
              md={3.8}
              lg={3.8}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            ></Grid>
            <Grid
              item
              xs={5.8}
              md={3.8}
              lg={3.8}
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
                onClick={() => setIsClickedVarsayılanaDon(true)}
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
      <YorumEditor></YorumEditor>
    </PageContainer>
  );
};

export default Page;
