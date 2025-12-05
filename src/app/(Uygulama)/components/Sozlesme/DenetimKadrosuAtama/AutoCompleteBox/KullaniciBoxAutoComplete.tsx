import React, { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getKullaniciByDenetciId } from "@/api/Kullanici/KullaniciIslemleri";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";

interface KullaniciBoxProps {
  initialValue?: string;

  onSelectId: (selectedKullaniciId: number) => void;
  onSelectAdi: (selectedKullanici: string) => void;
  onEmptyUsers?: () => void;
}

interface Kullanici {
  id: number;
  personelAdi?: string;
  label?: string;
}

const KullaniciBoxAutocomplete: React.FC<KullaniciBoxProps> = ({
  initialValue,
  onSelectId,
  onSelectAdi,
  onEmptyUsers,
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

      // Trigger callback if no users found
      if (newRows.length === 0 && onEmptyUsers) {
        onEmptyUsers();
      }
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
  }, [initialValue, rows]);

  return (
    <Autocomplete
      id="kullanici-box"
      options={rows}
      noOptionsText="Bulunamadı"
      fullWidth
      value={selectedOption}
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

export default KullaniciBoxAutocomplete;
