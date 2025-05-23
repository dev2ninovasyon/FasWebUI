import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";

const years = [
  { label: "2025", year: 2025 },
  { label: "2024", year: 2024 },
  { label: "2023", year: 2023 },
  { label: "2022", year: 2022 },
  { label: "2021", year: 2021 },
  { label: "2020", year: 2020 },
  { label: "2019", year: 2019 },
  { label: "2018", year: 2018 },
];
interface YearBoxProps {
  onSelect: (selectedYear: string) => void;
  onSelectYear: (selectedYear: number) => void;
}

const YearBoxAutocomplete: React.FC<YearBoxProps> = ({
  onSelect,
  onSelectYear,
}) => (
  <Autocomplete
    id="year-box"
    options={years}
    noOptionsText="Bulunamadı"
    fullWidth
    onChange={(event, value) => {
      onSelect(value?.label || "");
      onSelectYear(value?.year || 0);
    }}
    renderInput={(params) => (
      <CustomTextField
        {...params}
        placeholder="Yıl Seçiniz"
        aria-label="Yıl Seçiniz"
      />
    )}
  />
);

export default YearBoxAutocomplete;
