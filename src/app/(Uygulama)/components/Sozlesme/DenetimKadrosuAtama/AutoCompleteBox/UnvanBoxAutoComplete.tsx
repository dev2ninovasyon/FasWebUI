import React, { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getAllUnvanlar } from "@/api/Sozlesme/DenetimKadrosuAtama";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";

interface UnvanBoxProps {
  initialValue?: string;

  onSelect: (selectedUnvan: string) => void;
  onSelectId: (selectedUnvanId: number) => void;
}

interface Unvan {
  id: number;
  unvanAdi?: string;
  label?: string;
}

const UnvanBoxAutocomplete: React.FC<UnvanBoxProps> = ({
  initialValue,
  onSelect,
  onSelectId,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [rows, setRows] = useState<Unvan[]>([]);

  const fetchData = async () => {
    try {
      const unvanVerileri = await getAllUnvanlar(user.token || "");

      const newRows = unvanVerileri.map((veri: any) => ({
        id: veri.id,
        unvanAdi: veri.adi,
        label: veri.adi,
      }));
      setRows(newRows);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [selectedOption, setSelectedOption] = useState<Unvan | null>(null);

  useEffect(() => {
    // Find the option that matches the initialValue
    const matchedOption = rows.find((row) => row.label === initialValue);
    setSelectedOption(matchedOption || null);
  }, [initialValue]);

  return (
    <Autocomplete
      id="unvan-box"
      options={rows}
      fullWidth
      value={selectedOption}
      onChange={(event, value) => {
        setSelectedOption(value);
        onSelect(value?.unvanAdi || "");
        onSelectId(value?.id || 0);
      }}
      renderInput={(params) => (
        <CustomTextField
          {...params}
          placeholder="Ünvan Seçiniz"
          aria-label="Ünvan Seçiniz"
        />
      )}
    />
  );
};

export default UnvanBoxAutocomplete;
