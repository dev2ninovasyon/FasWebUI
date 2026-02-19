import React from "react";
import { Button } from "@mui/material";
import { IconDatabase } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const MusteriImportOldButton = () => {
  const router = useRouter();

  const handleRouteClick = () => {
    router.push("/Musteri/MusteriIslemleri/ImportFromOld");
  };

  return (
    <Button color="secondary" onClick={() => handleRouteClick()} startIcon={<IconDatabase width={18} />}>
      Müşterileri Taşı
    </Button>
  );
};

export default MusteriImportOldButton;
