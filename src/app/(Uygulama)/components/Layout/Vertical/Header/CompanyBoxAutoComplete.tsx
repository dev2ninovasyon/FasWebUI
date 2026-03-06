import React, { useEffect, useMemo, useRef, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  getDenetlenenByDenetciIdForSelection,
  getDenetlenenByRolForSelection,
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
  currentId?: number;
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
  currentId,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const [rows, setRows] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastFetchKeyRef = useRef("");

  const fetchKey = useMemo(
    () => [user.id || 0, user.denetciId || 0, user.yetki || ""].join(":"),
    [user.id, user.denetciId, user.yetki]
  );

  const fetchData = async () => {
    setIsLoading(true);

    try {
      if (user.yetki === "DenetciAdmin") {
        const musteriVerileri = await getDenetlenenByDenetciIdForSelection(user.denetciId || 0);

        if (Array.isArray(musteriVerileri)) {
          setRows(
            musteriVerileri.map((musteri: any) => ({
              denetlenenId: musteri.id,
              firmaAdi: musteri.firmaAdi,
              denetimTuru: musteri.denetimTuru,
              bobimi: musteri.bobi,
              tfrsmi: musteri.tfrs,
              enflasyonmu: musteri.enflasyonMu,
              konsolidemi: musteri.konsolide,
              label: musteri.firmaAdi,
            }))
          );
          return;
        }
      } else {
        const musteriVerileri = await getDenetlenenByRolForSelection(
          user.denetciId || 0,
          user.id || 0
        );

        if (Array.isArray(musteriVerileri)) {
          setRows(
            musteriVerileri.map((musteri: any) => ({
              denetlenenId: musteri.id,
              firmaAdi: musteri.firmaAdi,
              denetimTuru: musteri.denetimTuru,
              bobimi: musteri.bobi,
              tfrsmi: musteri.tfrs,
              enflasyonmu: musteri.enflasyonMu,
              konsolidemi: musteri.konsolide,
              label: musteri.firmaAdi,
            }))
          );
          return;
        }
      }

      setRows([]);
    } catch (error) {
      console.log("CompanyBox fetchData hatası:", error);
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user.denetciId || !user.yetki || (user.yetki !== "DenetciAdmin" && !user.id)) {
      lastFetchKeyRef.current = "";
      setRows([]);
      return;
    }

    if (lastFetchKeyRef.current === fetchKey) {
      return;
    }

    lastFetchKeyRef.current = fetchKey;
    void fetchData();
  }, [fetchKey, user.token]);

  useEffect(() => {
    if (!currentId || rows.length === 0) {
      return;
    }

    const selectedCompany = rows.find((row) => row.denetlenenId === currentId);
    if (!selectedCompany) {
      return;
    }

    onSelectId(selectedCompany.denetlenenId);
    onSelectAdi(selectedCompany.firmaAdi || "");
    onSelectDenetimTuru(selectedCompany.denetimTuru || "");
    onSelectBobimi(selectedCompany.bobimi || false);
    onSelectTfrsmi(selectedCompany.tfrsmi || false);
    onSelectEnflasyonmu(selectedCompany.enflasyonmu || false);
    onSelectKonsolidemi(selectedCompany.konsolidemi || false);
  }, [
    currentId,
    onSelectAdi,
    onSelectBobimi,
    onSelectDenetimTuru,
    onSelectEnflasyonmu,
    onSelectId,
    onSelectKonsolidemi,
    onSelectTfrsmi,
    rows,
  ]);

  const selectedValue = rows.find((row) => row.denetlenenId === currentId) || null;

  return (
    <Autocomplete
      id="company-box"
      options={rows}
      value={selectedValue}
      loading={isLoading}
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
