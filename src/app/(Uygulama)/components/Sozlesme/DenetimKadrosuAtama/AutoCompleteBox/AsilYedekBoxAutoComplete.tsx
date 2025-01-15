import React, { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";

interface AsilYedekBoxProps {
  initialValue?: string;

  onSelect: (selectedAsilYedek: string) => void;
}

interface AsilYedek {
  label?: string;
}

const AsilYedekBoxAutocomplete: React.FC<AsilYedekBoxProps> = ({
  initialValue,
  onSelect,
}) => {
  const rows = [{ label: "Asil" }, { label: "Yedek" }];

  const [selectedOption, setSelectedOption] = useState<AsilYedek | null>(null);

  useEffect(() => {
    // Find the option that matches the initialValue
    const matchedOption = rows.find((row) => row.label === initialValue);
    setSelectedOption(matchedOption || null);
  }, [initialValue]);

  return (
    <Autocomplete
      id="asilYedek-box"
      options={rows}
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

export default AsilYedekBoxAutocomplete;
