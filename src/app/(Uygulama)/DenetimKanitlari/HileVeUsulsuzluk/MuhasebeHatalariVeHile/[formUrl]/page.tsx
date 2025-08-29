"use client";
import { getHile } from "@/api/MaddiDogrulama/MaddiDogrulama";
import HileCalismaKagitlariBelge from "@/app/(Uygulama)/components/CalismaKagitlari/HileCalismaKagitlariBelge";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Button, Grid, Typography } from "@mui/material";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Orneklem from "./Orneklem";
import BelgeKontrolCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCard";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const pathname = usePathname();
  const segments = pathname.split("/");
  const formUrlIndex = segments.indexOf("MuhasebeHatalariVeHile") + 1;
  const formUrl = segments[formUrlIndex];

  const [isClickedVarsayilanaDon, setIsClickedVarsayilanaDon] = useState(false);

  const [dip, setDip] = useState("");
  const [dipnotNo, setDipnotNo] = useState<string>("");
  const [tamamlanan, setTamamlanan] = useState(0);
  const [toplam, setToplam] = useState(0);

  const [tersMi, setTersMi] = useState(false);

  const controller = dipnotNo;

  const BCrumb = [
    {
      to: "/DenetimKanitlari",
      title: "Denetim Kanıtları",
    },
    {
      to: "/DenetimKanitlari/HileVeUsulsuzluk",
      title: "Hile Ve Usulsüzlük",
    },
    {
      to: "/DenetimKanitlari/HileVeUsulsuzluk/MuhasebeHatalariVeHile",
      title: "Muhasebe Hataları Ve Hileye İlişkin Çalışmalar",
    },
    {
      to: `/DenetimKanitlari/HileVeUsulsuzluk/MuhasebeHatalariVeHile/${formUrl}`,
      title: `${dip}`,
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

    return str.replace(
      /[çğıöşüÇĞÖŞÜıİ]/g,
      (match) => turkishChars[match] || match
    );
  }

  const fetchData = async () => {
    try {
      const hile = await getHile(user.token || "", user.denetimTuru || "");
      hile.forEach((veri: any) => {
        if (
          normalizeString(veri.url.replaceAll(" ", "").toLowerCase()).includes(
            normalizeString(formUrl.replaceAll(" ", "").toLowerCase())
          )
        ) {
          setDip(veri.name);
          const [sol, sag] = veri.code.split("/");
          if (user.bobimi && sol) {
            setDipnotNo(sol);
          } else if (user.tfrsmi && sag) {
            setDipnotNo(sag);
          } else {
            setTersMi(true);
            if (user.bobimi) {
              setDipnotNo(sag);
            }
            if (user.tfrsmi) {
              setDipnotNo(sol);
            }
          }
        }
      });
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  useEffect(() => {
    if (formUrl && formUrl.length > 0) {
      fetchData();
    }
  }, [formUrl]);

  return (
    <PageContainer
      title={`${dip} | Muhasebe Hataları Ve Hile`}
      description="this is Muhasebe Hataları Ve Hile"
    >
      <Breadcrumb title={dip} items={BCrumb}>
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
      <Grid container>
        <Grid item xs={12} sm={12} lg={12} mb={3}>
          <HileCalismaKagitlariBelge
            url={formUrl}
            controller="HileCalismaKagitlari"
            isClickedVarsayilanaDon={isClickedVarsayilanaDon}
            setIsClickedVarsayilanaDon={setIsClickedVarsayilanaDon}
            setTamamlanan={setTamamlanan}
            setToplam={setToplam}
          />
        </Grid>
        <Grid
          item
          sx={{
            width: "95%",
            margin: "0 auto",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          {dipnotNo != "" ? (
            <Orneklem dipnot={dipnotNo} tersMi={tersMi} />
          ) : (
            <></>
          )}
        </Grid>
        <Grid item xs={12} sm={12} lg={12}>
          {(user.rol?.includes("KaliteKontrolSorumluDenetci") ||
            user.rol?.includes("SorumluDenetci") ||
            user.rol?.includes("Denetci") ||
            user.rol?.includes("DenetciYardimcisi")) && (
            <Grid
              container
              sx={{
                width: "95%",
                margin: "0 auto",
                justifyContent: "space-between",
              }}
            >
              <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
                <BelgeKontrolCard
                  hazirlayan="Denetçi - Yardımcı Denetçi"
                  controller={controller}
                ></BelgeKontrolCard>
              </Grid>
              <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
                <BelgeKontrolCard
                  onaylayan="Sorumlu Denetçi"
                  controller={controller}
                ></BelgeKontrolCard>
              </Grid>
              <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
                <BelgeKontrolCard
                  kaliteKontrol="Kalite Kontrol Sorumlu Denetçi"
                  controller={controller}
                ></BelgeKontrolCard>
              </Grid>
            </Grid>
          )}
          <Grid
            container
            sx={{
              width: "95%",
              margin: "0 auto",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Grid item xs={12} lg={12} mt={5}>
              <IslemlerCard controller={"HileCalismaKagitlari"} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
