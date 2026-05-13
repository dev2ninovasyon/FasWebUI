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
  fetchedData?: any[]; // New prop for data drilling
  handleBirlestirilmisMizan?: () => Promise<void>;
  mizanBaslangicTarihi?: any;
  setMizanBaslangicTarihi?: (date: any) => void;
  mizanBitisTarihi?: any;
  setMizanBitisTarihi?: (date: any) => void;
}

const MizanCard: React.FC<Props> = ({
  type,
  mizanOlusturTiklandimi,
  setMizanOlusturTiklandimi,
  fetchedData: propFetchedData,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [borcTutari, setBorcTutari] = useState(0);
  const [alacakTutari, setAlacakTutari] = useState(0);

  const calculateTotals = (mizanVerileri: any[]) => {
    let totalBorcTutari = 0;
    let totalAlacakTutari = 0;

    mizanVerileri.forEach((veri: any) => {
      // Support both array format [kebirKodu, detayKodu, ..., borcTutari, alacakTutari]
      // and object format {detayKodu, borcTutari, alacakTutari}
      const detayKodu = Array.isArray(veri) ? veri[1] : veri.detayKodu;
      const borcTutari = Array.isArray(veri) ? veri[4] : veri.borcTutari;
      const alacakTutari = Array.isArray(veri) ? veri[5] : veri.alacakTutari;

      if (
        detayKodu &&
        detayKodu.toString().length === 3 &&
        parseInt(detayKodu) < 700
      ) {
        totalBorcTutari += borcTutari || 0;
        totalAlacakTutari += alacakTutari || 0;
      }
    });

    setBorcTutari(totalBorcTutari);
    setAlacakTutari(totalAlacakTutari);
  };

  const fetchData = async () => {
    try {
      const mizanVerileri = await getMizanVerileri(user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        type
      );

      calculateTotals(mizanVerileri);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    if (propFetchedData && propFetchedData.length > 0) {
      calculateTotals(propFetchedData);
    } else {
      fetchData();
    }
  }, [propFetchedData]);

  useEffect(() => {
    if (!mizanOlusturTiklandimi) {
      if (!propFetchedData || propFetchedData.length === 0) {
        fetchData();
      }
    } else {
      setAlacakTutari(0);
      setBorcTutari(0);
    }
  }, [mizanOlusturTiklandimi, propFetchedData]);

  return (
    <Box sx={{ height: "100%" }}>
      <MizanCardTable borc={borcTutari} alacak={alacakTutari} />
    </Box>
  );
};

export default MizanCard;

