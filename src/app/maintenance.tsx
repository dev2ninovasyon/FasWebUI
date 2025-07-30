import { Box, Typography, Button, useMediaQuery } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

export default function Maintenance() {
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
        src={"/images/backgrounds/maintenance2.svg"}
        alt="404"
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
        Bakım Modu!!!
      </Typography>
      <Typography align="center" variant="h4" mb={4}>
        Web Sitesi Bakım Aşamasındadır. Daha sonra kontrol et!
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
