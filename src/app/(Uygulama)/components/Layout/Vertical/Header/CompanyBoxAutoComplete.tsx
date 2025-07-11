import React, { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  getDenetlenenByDenetciId,
  getDenetlenenByRol,
} from "@/api/Musteri/MusteriIslemleri";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";

interface CompanyBoxProps {
  onSelectId: (selectedCompanyId: number) => void;
  onSelectAdi: (selectedCompanyAdi: string) => void;
  onSelectDenetimTuru: (selectedDenetimTuru: string) => void;
  onSelectBobimi: (selectedBobimi: boolean) => void;
  onSelectTfrsmi: (selectedTfrsmi: boolean) => void;
  onSelectEnflasyonmu: (selectedEnflasyonmu: boolean) => void;
  onSelectKonsolidemi: (selectedKonsolidemi: boolean) => void;
}

interface Company {
  denetlenenId: number;
  firmaAdi?: string;
  denetimTuru?: string;
  bobimi?: boolean;
  tfrsmi?: boolean;
  enflasyonmu?: boolean;
  konsolidemi?: boolean;
  label?: string;
}

const CompanyBoxAutocomplete: React.FC<CompanyBoxProps> = ({
  onSelectId,
  onSelectAdi,
  onSelectDenetimTuru,
  onSelectBobimi,
  onSelectTfrsmi,
  onSelectEnflasyonmu,
  onSelectKonsolidemi,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [rows, setRows] = useState<Company[]>([]);

  const fetchData = async () => {
    try {
      if (user.yetki == "DenetciAdmin") {
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
          enflasyonmu: musteri.enflasyonMu,
          konsolidemi: musteri.konsolide,
          label: musteri.firmaAdi,
        }));
        setRows(newRows);
      } else {
        const musteriVerileri = await getDenetlenenByRol(
          user.token || "",
          user.denetciId || 0,
          user.id || 0
        );
        const newRows = musteriVerileri.map((musteri: any) => ({
          denetlenenId: musteri.id,
          firmaAdi: musteri.firmaAdi,
          denetimTuru: musteri.denetimTuru,
          bobimi: musteri.bobi,
          tfrsmi: musteri.tfrs,
          enflasyonmu: musteri.enflasyonMu,
          konsolidemi: musteri.konsolide,
          label: musteri.firmaAdi,
        }));
        setRows(newRows);
      }
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
      noOptionsText="Bulunamadı"
      fullWidth
      onChange={(event, value) => {
        onSelectId(value?.denetlenenId || 0);
        onSelectAdi(value?.firmaAdi || "");
        onSelectDenetimTuru(value?.denetimTuru || "");
        onSelectBobimi(value?.bobimi || false);
        onSelectTfrsmi(value?.tfrsmi || false);
        onSelectEnflasyonmu(value?.enflasyonmu || false);
        onSelectKonsolidemi(value?.konsolidemi || false);
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
