import React, { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getKullaniciByDenetciId } from "@/api/Kullanici/KullaniciIslemleri";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";

interface KullaniciBoxProps {
  initialValue?: string;

  onSelect: (selectedKullanici: string) => void;
  onSelectId: (selectedKullaniciId: number) => void;
}

interface Kullanici {
  id: number;
  personelAdi?: string;
  label?: string;
}

const KullaniciBoxAutocomplete: React.FC<KullaniciBoxProps> = ({
  initialValue,
  onSelect,
  onSelectId,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [rows, setRows] = useState<Kullanici[]>([]);

  const fetchData = async () => {
    try {
      const kullaniciVerileri = await getKullaniciByDenetciId(
        user.token || "",
        user.denetciId || 0
      );
      const newRows = kullaniciVerileri.map((veri: any) => ({
        id: veri.id,
        personelAdi: veri.personelAdi,
        label: veri.personelAdi,
      }));
      setRows(newRows);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [selectedOption, setSelectedOption] = useState<Kullanici | null>(null);

  useEffect(() => {
    // Find the option that matches the initialValue
    const matchedOption = rows.find((row) => row.label === initialValue);
    setSelectedOption(matchedOption || null);
  }, [initialValue]);

  return (
    <Autocomplete
      id="kullanici-box"
      options={rows}
      fullWidth
      value={selectedOption}
      onChange={(event, value) => {
        setSelectedOption(value);
        onSelect(value?.personelAdi || "");
        onSelectId(value?.id || 0);
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

export default KullaniciBoxAutocomplete;
