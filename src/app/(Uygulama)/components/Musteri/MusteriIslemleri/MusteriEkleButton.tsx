import React from "react";
import { Button } from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const MusteriEkleButton = () => {
  const router = useRouter();

  const handleRouteClick = () => {
    router.push("/Musteri/MusteriIslemleri/MusteriEkle");
  };

  return (
    <Button
      color="primary"
      onClick={() => handleRouteClick()}
      startIcon={<IconPlus width={18} />}
    >
      Müşteri Ekle
    </Button>
  );
};

export default MusteriEkleButton;
