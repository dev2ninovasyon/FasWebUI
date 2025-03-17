import React from "react";
import { Button, Stack } from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const SurekliEgitimBilgileriEkleButton = () => {
  const router = useRouter();

  const handleRouteClick = () => {
    router.push("/Kullanici/SurekliEgitimBilgileri/SurekliEgitimBilgileriEkle");
  };

  return (
    <>
      <Stack
        spacing={1}
        direction="row"
        justifyContent="start"
        marginBottom={4}
      >
        <Button
          color="primary"
          onClick={() => handleRouteClick()}
          startIcon={<IconPlus width={18} />}
        >
          Sürekli Eğitim Bilgileri Ekle
        </Button>
      </Stack>
    </>
  );
};

export default SurekliEgitimBilgileriEkleButton;
