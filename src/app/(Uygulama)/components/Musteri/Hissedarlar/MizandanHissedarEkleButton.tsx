import React from "react";
import { Button, Stack } from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import { getMizandanHissedarlarByDenetlenenIdYil } from "@/api/Musteri/MusteriIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

interface Props {
  setIsClickedMizandanHissedarEkle: (bool: boolean) => void;
}

const MizandanHissedarEkleButton: React.FC<Props> = ({
  setIsClickedMizandanHissedarEkle,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const handleButtonClick = async () => {
    try {
      const result = await getMizandanHissedarlarByDenetlenenIdYil(
        user.token || "",
        user.denetlenenId || 0,
        user.yil || 0
      );
      if (result) {
        setIsClickedMizandanHissedarEkle(true);
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  return (
    <Button
      color="primary"
      onClick={() => handleButtonClick()}
      startIcon={<IconPlus width={18} />}
    >
      Mizandan Hissedar Ekle
    </Button>
  );
};

export default MizandanHissedarEkleButton;
