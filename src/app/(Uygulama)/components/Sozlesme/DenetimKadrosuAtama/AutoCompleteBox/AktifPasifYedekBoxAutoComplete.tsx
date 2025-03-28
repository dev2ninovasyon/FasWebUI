import React, { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";

interface AktifPasifBoxProps {
  initialValue?: string;

  onSelect: (selectedAktifPasif: string) => void;
}

interface AktifPasif {
  label?: string;
}

const AktifPasifBoxAutocomplete: React.FC<AktifPasifBoxProps> = ({
  initialValue,
  onSelect,
}) => {
  const rows = [{ label: "Aktif" }, { label: "Pasif" }];

  const [selectedOption, setSelectedOption] = useState<AktifPasif | null>(null);

  useEffect(() => {
    // Find the option that matches the initialValue
    const matchedOption = rows.find((row) => row.label === initialValue);
    setSelectedOption(matchedOption || null);
  }, [initialValue]);

  return (
    <Autocomplete
      id="aktifPasif-box"
      options={rows}
      noOptionsText="Bulunamadı"
      fullWidth
      value={selectedOption}
      isOptionEqualToValue={(option, value) => option.label === value.label}
      onChange={(event, value) => {
        setSelectedOption(value);
        onSelect(value?.label || "");
      }}
      renderInput={(params) => (
        <CustomTextField {...params} placeholder="" aria-label="" />
      )}
    />
  );
};

export default AktifPasifBoxAutocomplete;
