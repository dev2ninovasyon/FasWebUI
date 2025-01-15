import { Box, Button, Typography, useMediaQuery } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

export default function Forbidden() {
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  return (
    <Box
      display="flex"
      flexDirection="column"
      textAlign="center"
      justifyContent="center"
      alignItems="center"
    >
      <Image
        priority
        src={"/images/backgrounds/forbiddenimg.png"}
        alt="403"
        width={500}
        height={300}
        style={{
          marginTop: "8%",
          width: smDown ? "100%" : "auto",
          height: smDown ? "auto" : "100%",
          maxHeight: "500px",
        }}
      />
      <Typography align="center" variant="h1" mb={4}>
        Hay Aksi!!!
      </Typography>
      <Typography align="center" variant="h4" mb={4}>
        Bu sayfaya giriş izniniz bulunmamaktadır.{" "}
      </Typography>
      <Button
        color="primary"
        variant="contained"
        component={Link}
        href="/Anasayfa"
        disableElevation
      >
        Anasayfaya Dön
      </Button>
    </Box>
  );
}
