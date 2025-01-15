import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import DavaKarsiliklariCardTable from "./DavaKarsiliklariCardTable";
import { getDavaKarsiliklariHesaplanmis } from "@/api/Hesaplamalar/Hesaplamalar";

interface Props {
  hesaplaTiklandimi: boolean;
}

interface Veri {
  hesaplananToplamAyrilacakDavaKarsiliklariSayisi: number;
  hesaplananToplamAyrilacakDavaKarsiliklariTutari: number;
  hesaplananToplamKosulluDavaAlacaklariSayisi: number;
  hesaplananToplamKosulluDavaAlacaklariTutari: number;
  hesaplananToplamKosulluDavaBorclariSayisi: number;
  hesaplananToplamKosulluDavaBorclariTutari: number;
  uzmanGorusuGerektirenlerSayisi: number;
  uzmanGorusuGerektirenlerTutari: number;
}

const DavaKarsiliklariCard: React.FC<Props> = ({ hesaplaTiklandimi }) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [davaKarsiliklariVerileri, setDavaKarsiliklariVerileri] =
    useState<Veri>({
      hesaplananToplamAyrilacakDavaKarsiliklariSayisi: 0,
      hesaplananToplamAyrilacakDavaKarsiliklariTutari: 0,
      hesaplananToplamKosulluDavaAlacaklariSayisi: 0,
      hesaplananToplamKosulluDavaAlacaklariTutari: 0,
      hesaplananToplamKosulluDavaBorclariSayisi: 0,
      hesaplananToplamKosulluDavaBorclariTutari: 0,
      uzmanGorusuGerektirenlerSayisi: 0,
      uzmanGorusuGerektirenlerTutari: 0,
    });

  const fetchData = async () => {
    try {
      const davaKarsiliklariVerileri = await getDavaKarsiliklariHesaplanmis(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );
      setDavaKarsiliklariVerileri(davaKarsiliklariVerileri);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!hesaplaTiklandimi) {
      fetchData();
    } else {
      setDavaKarsiliklariVerileri({
        hesaplananToplamAyrilacakDavaKarsiliklariSayisi: 0,
        hesaplananToplamAyrilacakDavaKarsiliklariTutari: 0,
        hesaplananToplamKosulluDavaAlacaklariSayisi: 0,
        hesaplananToplamKosulluDavaAlacaklariTutari: 0,
        hesaplananToplamKosulluDavaBorclariSayisi: 0,
        hesaplananToplamKosulluDavaBorclariTutari: 0,
        uzmanGorusuGerektirenlerSayisi: 0,
        uzmanGorusuGerektirenlerTutari: 0,
      });
    }
  }, [hesaplaTiklandimi]);

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <DavaKarsiliklariCardTable
        davaKarsiliklariVerileri={davaKarsiliklariVerileri}
      />
    </Box>
  );
};

export default DavaKarsiliklariCard;
