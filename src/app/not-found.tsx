import { Box, Button, Container, Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      textAlign="center"
      justifyContent="center"
    >
      <Container maxWidth="md">
        <Image
          priority
          src={"/images/backgrounds/errorimg.svg"}
          alt="404"
          width={500}
          height={500}
          style={{ width: "100%", maxWidth: "500px", maxHeight: "500px" }}
        />
        <Typography align="center" variant="h1" mb={4}>
          Hay Aksi!!!
        </Typography>
        <Typography align="center" variant="h4" mb={4}>
          Aradığınız sayfa bulunamadı.{" "}
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
      </Container>
    </Box>
  );
}
