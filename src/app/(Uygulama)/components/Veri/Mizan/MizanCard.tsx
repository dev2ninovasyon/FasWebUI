import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import { getMizanVerileri } from "@/api/Veri/Mizan";
import MizanCardTable from "./MizanCardTable";

interface Props {
  type: string;
  mizanOlusturTiklandimi: boolean;
  setMizanOlusturTiklandimi: (bool: boolean) => void;
}

const MizanCard: React.FC<Props> = ({
  type,
  mizanOlusturTiklandimi,
  setMizanOlusturTiklandimi,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [borcTutari, setBorcTutari] = useState(0);
  const [alacakTutari, setAlacakTutari] = useState(0);

  const fetchData = async () => {
    try {
      const mizanVerileri = await getMizanVerileri(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        type
      );

      let totalBorcTutari = 0;
      let totalAlacakTutari = 0;

      mizanVerileri.forEach((veri: any) => {
        if (veri.detayKodu.length === 3) {
          totalBorcTutari += veri.borcTutari || 0;
        }
        if (veri.detayKodu.length === 3) {
          totalAlacakTutari += veri.alacakTutari || 0;
        }
      });

      setBorcTutari(totalBorcTutari);
      setAlacakTutari(totalAlacakTutari);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!mizanOlusturTiklandimi) {
      fetchData();
    } else {
      setAlacakTutari(0);
      setBorcTutari(0);
    }
  }, [mizanOlusturTiklandimi]);

  return (
    <Box sx={{ height: "100%" }}>
      <MizanCardTable borc={borcTutari} alacak={alacakTutari} />
    </Box>
  );
};

export default MizanCard;
