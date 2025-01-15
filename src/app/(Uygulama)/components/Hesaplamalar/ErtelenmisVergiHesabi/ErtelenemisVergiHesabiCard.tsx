import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import ErtelenmisVergiHesabiCardTable from "./ErtelenmisVergiHesabiCardTable";
import { getVergiVarligiVeYukumluluguOzet } from "@/api/Hesaplamalar/Hesaplamalar";

interface CardProps {
  hesaplaTiklandimi: boolean;
}

const ErtelenmisVergiHesabiCard: React.FC<CardProps> = ({
  hesaplaTiklandimi,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [geciciNetToplam, setGeciciNetToplam] = useState(0);
  const [ertelenenNetToplam, setErtelenenNetToplam] = useState(0);

  const [geciciPozitif, setGeciciPozitif] = useState(0);
  const [ertelenenPozitif, setErtelenenPozitif] = useState(0);

  const [geciciNegatif, setGeciciNegatif] = useState(0);
  const [ertelenenNegatif, setErtelenenNegatif] = useState(0);

  const fetchData = async () => {
    try {
      const vergiVarlikVeYukumlulukleriOzetVerileri =
        await getVergiVarligiVeYukumluluguOzet(
          user.token || "",
          user.denetciId || 0,
          user.yil || 0,
          user.denetlenenId || 0
        );

      if (vergiVarlikVeYukumlulukleriOzetVerileri) {
        setGeciciNetToplam(
          vergiVarlikVeYukumlulukleriOzetVerileri.geciciNetToplam
        );
        setErtelenenNetToplam(
          vergiVarlikVeYukumlulukleriOzetVerileri.ertelenenNetToplam
        );

        setGeciciPozitif(vergiVarlikVeYukumlulukleriOzetVerileri.geciciPozitif);
        setErtelenenPozitif(
          vergiVarlikVeYukumlulukleriOzetVerileri.ertelenenPozitif
        );

        setGeciciNegatif(vergiVarlikVeYukumlulukleriOzetVerileri.geciciNegatif);
        setErtelenenNegatif(
          vergiVarlikVeYukumlulukleriOzetVerileri.ertelenenNegatif
        );
      }
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
      setGeciciNetToplam(0);
      setErtelenenNetToplam(0);
      setGeciciPozitif(0);
      setErtelenenPozitif(0);
      setGeciciNegatif(0);
      setErtelenenNegatif(0);
    }
  }, [hesaplaTiklandimi]);

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <ErtelenmisVergiHesabiCardTable
        geciciNetToplam={geciciNetToplam}
        ertelenenNetToplam={ertelenenNetToplam}
        geciciPozitif={geciciPozitif}
        ertelenenPozitif={ertelenenPozitif}
        geciciNegatif={geciciNegatif}
        ertelenenNegatif={ertelenenNegatif}
      />
    </Box>
  );
};

export default ErtelenmisVergiHesabiCard;
