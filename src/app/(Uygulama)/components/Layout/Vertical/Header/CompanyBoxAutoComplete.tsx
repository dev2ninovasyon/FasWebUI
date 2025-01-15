import React, { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getDenetlenenByDenetciId } from "@/api/Musteri/MusteriIslemleri";
import CustomTextField from "../../../Forms/ThemeElements/CustomTextField";

interface CompanyBoxProps {
  onSelect: (selectedCompany: string) => void;
  onSelectId: (selectedCompanyId: number) => void;
  onSelectTfrsmi: (selectedTfrsmi: boolean) => void;
  onSelectBobimi: (selectedBobimi: boolean) => void;
}

interface Company {
  denetlenenId: number;
  firmaAdi?: string;
  bobimi?: boolean;
  tfrsmi?: boolean;
  label?: string;
}

const CompanyBoxAutocomplete: React.FC<CompanyBoxProps> = ({
  onSelect,
  onSelectId,
  onSelectTfrsmi,
  onSelectBobimi,
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
        tfrsmi: musteri.tfrs,
        bobimi: musteri.bobi,
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
        onSelect(value?.firmaAdi || "");
        onSelectId(value?.denetlenenId || 0);
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
