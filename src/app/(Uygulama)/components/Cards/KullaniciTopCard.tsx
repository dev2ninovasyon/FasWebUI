import Image from "next/image";
import { Box, CardContent, Grid, Typography } from "@mui/material";
import icon2 from "public/images/svgs/icon-user-male.svg";
import icon3 from "public/images/svgs/icon-briefcase.svg";
import icon4 from "public/images/svgs/icon-mailbox.svg";
import icon5 from "public/images/svgs/icon-favorites.svg";
import icon6 from "public/images/svgs/icon-speech-bubble.svg";
import Link from "next/link";

const KullaniciTopCards = [
  {
    icon: icon2,
    title: "Kullanıcı İşlemleri",
    digits: "50",
    bgcolor: "primary",
    href: "/Kullanici/KullaniciIslemleri",
  },
  {
    icon: icon3,
    title: "Kullanıcı Sözleşme Saatleri",
    digits: "3,650",
    bgcolor: "warning",
    href: "/Kullanici/KullaniciSozlesmeSaatleri",
  },
  {
    icon: icon4,
    title: "Denetçi Yıllık Taahütname",
    digits: "356",
    bgcolor: "secondary",
    href: "/Kullanici/DenetciYillikTaahutname",
  },
  {
    icon: icon5,
    title: "Sürekli Eğitim Belge ve Bilgileri",
    digits: "696",
    bgcolor: "error",
    href: "/Kullanici/SurekliEgitimBelgeVeBilgileri",
  },
  {
    icon: icon6,
    title: "Denetçi Puantaj Belgesi",
    digits: "$96k",
    bgcolor: "success",
    href: "/Kullanici/DenetciPuantajBelgesi",
  },
];

const KullaniciTopCard = () => {
  return (
    <Grid container spacing={3} mt={1}>
      {KullaniciTopCards.map((topcard, i) => (
        <Grid item xs={12} sm={4} lg={3} key={i}>
          <Link href={topcard.href}>
            <Box bgcolor={topcard.bgcolor + ".light"} textAlign="center">
              <CardContent style={{ height: "180px" }}>
                <Image
                  src={topcard.icon}
                  alt={"topcard.icon"}
                  width="50"
                  height="50"
                />

                <Typography
                  color={topcard.bgcolor + ".main"}
                  mt={1}
                  variant="subtitle1"
                  fontWeight={600}
                >
                  {topcard.title}
                </Typography>

                <Typography
                  color={topcard.bgcolor + ".main"}
                  variant="h4"
                  fontWeight={600}
                >
                  {topcard.digits}
                </Typography>
              </CardContent>
            </Box>
          </Link>
        </Grid>
      ))}
    </Grid>
  );
};

export default KullaniciTopCard;
