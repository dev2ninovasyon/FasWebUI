import Image from "next/image";
import { Box, CardContent, Grid, Typography } from "@mui/material";
import Link from "next/link";
import { getHile } from "@/api/MaddiDogrulama/MaddiDogrulama";
import { useSelector } from "react-redux";
import { AppState } from "@/store/store";
import { useEffect, useState } from "react";

interface Veri {
  icon: any;
  title: string;
  bgcolor: string;
  href: string;
}

const MuhasebeHatalariVeHileTopCard = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  function randomIcon() {
    var icons = ["/images/svgs/denetim-kanitlari/hile-ve-usulsuzluk.svg"];
    var randomIndex = Math.floor(Math.random() * icons.length);
    return icons[randomIndex];
  }

  function randomColor() {
    var colors = [
      /*"primary",*/
      /*"warning",*/
      /*"secondary",*/
      "error",
      "success",
      "info",
    ];
    var randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }

  const [muhasebeHatlariVeHileTopCards, setMuhasebeHatalariVeHileTopCars] =
    useState<Veri[]>([]);

  const fetchData = async () => {
    try {
      const data = await getHile(user.token || "", user.denetimTuru || "");

      // Her karta icon, bgcolor ekle
      const enriched = data.map((item: any, index: number) => ({
        icon: randomIcon(),
        title: item.name,
        bgcolor: randomColor(),
        href: `${item.url.replace(/\s/g, "")}`,
      }));

      setMuhasebeHatalariVeHileTopCars(enriched);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <Grid container spacing={3} mt={1}>
      {muhasebeHatlariVeHileTopCards.map((topcard, i) => (
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

                {/*<Typography
                  color={topcard.bgcolor + ".main"}
                  variant="h4"
                  fontWeight={600}
                >
                  {topcard.digits}
                </Typography>*/}
              </CardContent>
            </Box>
          </Link>
        </Grid>
      ))}
    </Grid>
  );
};

export default MuhasebeHatalariVeHileTopCard;
