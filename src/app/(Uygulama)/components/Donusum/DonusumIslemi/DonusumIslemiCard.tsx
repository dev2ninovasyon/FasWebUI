import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import DonusumIslemiCardTable from "./DonusumIslemiCardTable";
import { getDonusumMizan } from "@/api/Donusum/Donusum";

interface Props {
  donusumIslemiYapTiklandiMi: boolean;
  setDonusumIslemiYapTiklandiMi: (bool: boolean) => void;
}

const DonusumIslemiCard: React.FC<Props> = ({
  donusumIslemiYapTiklandiMi,
  setDonusumIslemiYapTiklandiMi,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [aktifBorcTutari, setAktifBorcTutari] = useState(0);
  const [aktifAlacakTutari, setAktifAlacakTutari] = useState(0);

  const [pasifBorcTutari, setPasifBorcTutari] = useState(0);
  const [pasifAlacakTutari, setPasifAlacakTutari] = useState(0);

  const [altiliBorcTutari, setAltiliBorcTutari] = useState(0);
  const [altiliAlacakTutari, setAltiliAlacakTutari] = useState(0);

  const fetchData = async () => {
    try {
      const donusumMizanVerileri = await getDonusumMizan(
        user.token || "",
        user.denetlenenId || 0,
        user.yil || 0
      );

      let totalAktifBorcTutari = 0;
      let totalAktifAlacakTutari = 0;
      let totalPasifBorcTutari = 0;
      let totalPasifAlacakTutari = 0;
      let totalAltiliBorcTutari = 0;
      let totalAltiliAlacakTutari = 0;
      donusumMizanVerileri.forEach((veri: any) => {
        if (
          veri.detayKodu.length === 3 &&
          (veri.detayKodu.startsWith("1") || veri.detayKodu.startsWith("2"))
        ) {
          totalAktifBorcTutari += veri.borcBakiye || 0;
          totalAktifAlacakTutari += veri.alacakBakiye || 0;
        }
        if (
          veri.detayKodu.length === 3 &&
          (veri.detayKodu.startsWith("3") ||
            veri.detayKodu.startsWith("4") ||
            veri.detayKodu.startsWith("5"))
        ) {
          totalPasifBorcTutari += veri.borcBakiye || 0;
          totalPasifAlacakTutari += veri.alacakBakiye || 0;
        }
        if (veri.detayKodu.length === 3 && veri.detayKodu.startsWith("6")) {
          totalAltiliBorcTutari += veri.borcBakiye || 0;
          totalAltiliAlacakTutari += veri.alacakBakiye || 0;
        }
      });

      setAktifBorcTutari(totalAktifBorcTutari);
      setAktifAlacakTutari(totalAktifAlacakTutari);

      setPasifBorcTutari(totalPasifBorcTutari);
      setPasifAlacakTutari(totalPasifAlacakTutari);

      setAltiliBorcTutari(totalAltiliBorcTutari);
      setAltiliAlacakTutari(totalAltiliAlacakTutari);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!donusumIslemiYapTiklandiMi) {
      fetchData();
    } else {
      setAktifBorcTutari(0);
      setAktifAlacakTutari(0);
      setPasifBorcTutari(0);
      setPasifAlacakTutari(0);
      setAltiliBorcTutari(0);
      setAltiliAlacakTutari(0);
    }
  }, [donusumIslemiYapTiklandiMi]);

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <DonusumIslemiCardTable
        aktifBorcTutari={aktifBorcTutari}
        aktifAlacakTutari={aktifAlacakTutari}
        pasifBorcTutari={pasifBorcTutari}
        pasifAlacakTutari={pasifAlacakTutari}
        altiliBorcTutari={altiliBorcTutari}
        altiliAlacakTutari={altiliAlacakTutari}
      />
    </Box>
  );
};

export default DonusumIslemiCard;
