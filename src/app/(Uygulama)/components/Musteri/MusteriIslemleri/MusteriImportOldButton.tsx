import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { IconDatabase } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { checkDenetciExistsInOldDb } from "@/api/Musteri/MusteriIslemleri";

const MusteriImportOldButton = () => {
  const router = useRouter();
  const [showButton, setShowButton] = useState<boolean>(false);

  useEffect(() => {
    const checkVisibility = async () => {
      const exists = await checkDenetciExistsInOldDb();
      setShowButton(exists);
    };
    checkVisibility();
  }, []);

  const handleRouteClick = () => {
    router.push("/Musteri/MusteriIslemleri/ImportFromOld");
  };

  if (!showButton) return null;

  return (
    <Button color="secondary" onClick={() => handleRouteClick()} startIcon={<IconDatabase width={18} />}>
      Müşteri Taşı
    </Button>
  );
};

export default MusteriImportOldButton;
