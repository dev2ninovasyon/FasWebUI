import React, { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getDenetlenenByDenetciId } from "@/api/Musteri/MusteriIslemleri";
import CustomTextField from "../../../Forms/ThemeElements/CustomTextField";

interface CompanyBoxProps {
  onSelectId: (selectedCompanyId: number) => void;
  onSelectAdi: (selectedCompanyAdi: string) => void;
  onSelectDenetimTuru: (selectedDenetimTuru: string) => void;
  onSelectBobimi: (selectedBobimi: boolean) => void;
  onSelectTfrsmi: (selectedTfrsmi: boolean) => void;
}

interface Company {
  denetlenenId: number;
  firmaAdi?: string;
  denetimTuru?: string;
  bobimi?: boolean;
  tfrsmi?: boolean;
  label?: string;
}

const CompanyBoxAutocomplete: React.FC<CompanyBoxProps> = ({
  onSelectId,
  onSelectAdi,
  onSelectDenetimTuru,
  onSelectBobimi,
  onSelectTfrsmi,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [rows, setRows] = useState<Company[]>([]);

  const fetchData = async () => {
    try {
      const musteriVerileri = await getDenetlenenByDenetciId(
        user.token || "",
        user.denetciId || 0
      );
      const newRows = musteriVerileri.map((musteri: any) => ({
        denetlenenId: musteri.id,
        firmaAdi: musteri.firmaAdi,
        denetimTuru: musteri.denetimTuru,
        bobimi: musteri.bobi,
        tfrsmi: musteri.tfrs,
        label: musteri.firmaAdi,
      }));
      setRows(newRows);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Autocomplete
      id="company-box"
      options={rows}
      fullWidth
      onChange={(event, value) => {
        onSelectId(value?.denetlenenId || 0);
        onSelectAdi(value?.firmaAdi || "");
        onSelectDenetimTuru(value?.denetimTuru || "");
        onSelectBobimi(value?.bobimi || false);
        onSelectTfrsmi(value?.tfrsmi || false);
      }}
      renderInput={(params) => (
        <CustomTextField
          {...params}
          placeholder="Şirket Seçiniz"
          aria-label="Şirket Seçiniz"
        />
      )}
    />
  );
};

export default CompanyBoxAutocomplete;
