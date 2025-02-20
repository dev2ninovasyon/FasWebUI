import React from "react";
import { Button } from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const IliskiliTarafTanimlaButton = () => {
  const router = useRouter();

  const handleRouteClick = () => {
    router.push("/Musteri/IliskiliTaraflar/IliskiliTarafTanimla");
  };

  return (
    <Button
      color="primary"
      onClick={() => handleRouteClick()}
      startIcon={<IconPlus width={18} />}
      sx={{ marginRight: 3 }}
    >
      İlişkili Taraf Tanımla
    </Button>
  );
};

export default IliskiliTarafTanimlaButton;
