import React from "react";
import { Button, Stack } from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const MusteriEkleButton = () => {
  const router = useRouter();

  const handleRouteClick = () => {
    router.push("/Musteri/MusteriIslemleri/MusteriEkle");
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
          Müşteri Ekle
        </Button>
      </Stack>
    </>
  );
};

export default MusteriEkleButton;
