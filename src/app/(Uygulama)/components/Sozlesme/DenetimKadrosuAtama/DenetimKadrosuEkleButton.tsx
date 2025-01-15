import React from "react";
import { Button, Stack } from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const DenetimKadrosuEkleButton = () => {
  const router = useRouter();

  const handleRouteClick = () => {
    router.push("/Sozlesme/DenetimKadrosuAtama/GorevAtamasiEkle");
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
          Görev Ataması Ekle
        </Button>
      </Stack>
    </>
  );
};

export default DenetimKadrosuEkleButton;
