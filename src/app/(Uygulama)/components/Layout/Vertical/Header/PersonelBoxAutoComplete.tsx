import React, { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getKullaniciByDenetlenenYilRol } from "@/api/Kullanici/KullaniciIslemleri";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";

interface PerosnelBoxProps {
  initialValue?: string;
  tip: string;
  disabled?: boolean;
  onSelectId: (selectedPerosnelId: number) => void;
  onSelectAdi: (selectedPersonelAdi: string) => void;
}

interface Perosnel {
  id: number;
  personelAdi?: string;
  label?: string;
}

const PerosnelBoxAutocomplete: React.FC<PerosnelBoxProps> = ({
  initialValue,
  tip,
  disabled,
  onSelectId,
  onSelectAdi,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [rows, setRows] = useState<Perosnel[]>([]);

  const fetchData = async () => {
    try {
      const personelVerileri = await getKullaniciByDenetlenenYilRol(
        user.token || "",
        user.denetlenenId || 0,
        user.yil || 0,
        tip || ""
      );
      const newRows = personelVerileri.map((musteri: any) => ({
        id: musteri.id,
        personelAdi: musteri.personelAdi,
        label: musteri.personelAdi,
      }));
      setRows(newRows);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [selectedOption, setSelectedOption] = useState<Perosnel | null>(null);

  useEffect(() => {
    // Find the option that matches the initialValue
    const matchedOption = rows.find((row) => row.label === initialValue);
    setSelectedOption(matchedOption || null);
  }, [initialValue, rows]);

  useEffect(() => {
    if (rows.length === 1) {
      const onlyOption = rows[0];
      setSelectedOption(onlyOption);
      onSelectId(onlyOption.id);
      onSelectAdi(onlyOption.personelAdi || "");
    }
  }, [rows]);
  return (
    <Autocomplete
      id="personel-box"
      options={rows}
      noOptionsText="Bulunamadı"
      fullWidth
      disabled={disabled}
      value={selectedOption}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      onChange={(event, value) => {
        setSelectedOption(value);
        onSelectId(value?.id || 0);
        onSelectAdi(value?.personelAdi || "");
      }}
      renderInput={(params) => (
        <CustomTextField
          {...params}
          placeholder="Personel Seçiniz"
          aria-label="Personel Seçiniz"
        />
      )}
    />
  );
};

export default PerosnelBoxAutocomplete;
