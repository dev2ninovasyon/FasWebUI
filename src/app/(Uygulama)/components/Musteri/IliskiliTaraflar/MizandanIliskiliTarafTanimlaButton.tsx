import React from "react";
import { Button } from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const MizandanIliskiliTarafTanimlaButton = () => {
  const router = useRouter();

  const handleRouteClick = () => {
    router.push("/Musteri/IliskiliTaraflar/MizandanIliskiliTarafTanimla");
  };

  return (
    <Button
      color="primary"
      onClick={() => handleRouteClick()}
      startIcon={<IconPlus width={18} />}
    >
      Mizandan İlişkili Taraf Tanımla
    </Button>
  );
};

export default MizandanIliskiliTarafTanimlaButton;
