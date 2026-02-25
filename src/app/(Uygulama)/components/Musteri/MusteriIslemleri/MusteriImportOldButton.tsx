import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { IconDatabase } from "@tabler/icons-react";
import { checkDenetciExistsInOldDb } from "@/api/Musteri/MusteriIslemleri";
import { useRouter } from "next/navigation";

interface Props {
  onImportCompleted?: () => void;
}

const MusteriImportOldButton = (_props: Props) => {
  const [showButton, setShowButton] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const checkVisibility = async () => {
      const exists = await checkDenetciExistsInOldDb();
      setShowButton(exists);
    };
    checkVisibility();
  }, []);

  if (!showButton) return null;

  return (
    <Button
      color="secondary"
      onClick={() => router.push("/Musteri/MusteriIslemleri/ImportFromOld")}
      startIcon={<IconDatabase width={18} />}
    >
      Müşteri Taşı
    </Button>
  );
};

export default MusteriImportOldButton;
