import { Grid, Typography } from "@mui/material";
import React, { useState } from "react";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CompanyBoxAutocomplete from "@/app/(Uygulama)/components/Layout/Vertical/Header/CompanyBoxAutoComplete";
import YearBoxAutocomplete from "@/app/(Uygulama)/components/Layout/Vertical/Header/YearBoxAutoComplete";

interface Props {
  kaynakId: number;
  hedefId: number;
  kaynakYil: number;
  hedefYil: number;
  kaynakDenetimTuru: string;
  setKaynakId: (deger: number) => void;
  setHedefId: (deger: number) => void;
  setKaynakYil: (deger: number) => void;
  setHedefYil: (deger: number) => void;
  setKaynakDenetimTuru: (str: string) => void;

  setVerileriAktarTiklandimi: (bool: boolean) => void;
}

const DenetimDosyaTransferForm: React.FC<Props> = ({
  kaynakId,
  hedefId,
  kaynakYil,
  hedefYil,
  kaynakDenetimTuru,
  setKaynakId,
  setHedefId,
  setKaynakYil,
  setHedefYil,
  setKaynakDenetimTuru,

  setVerileriAktarTiklandimi,
}) => {
  const [kaynakAdi, setKaynakAdi] = useState("");
  const [kaynakBobimi, setKaynakBobimi] = useState(false);
  const [kaynakTfrsmi, setKaynakTfrsmi] = useState(false);
  const [kaynakEnflasyonmu, setKaynakEnflasyonmu] = useState(false);
  const [kaynakKonsolidemi, setKaynakKonsolidemi] = useState(false);
  const [kaynakYear, setKaynakYear] = useState("");
  const [kaynakYilStr, setKaynakYilStr] = useState("");

  const [hedefAdi, setHedefAdi] = useState("");
  const [hedefDenetimTuru, setHedefDenetimTuru] = useState("");
  const [hedefBobimi, setHedefBobimi] = useState(false);
  const [hedefTfrsmi, setHedefTfrsmi] = useState(false);
  const [hedefEnflasyonmu, setHedefEnflasyonmu] = useState(false);
  const [hedefKonsolidemi, setHedefKonsolidemi] = useState(false);
  const [hedefYear, setHedefYear] = useState("");
  const [hedefYilStr, setHedefYilStr] = useState("");

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4} lg={4} display="flex">
          <CustomFormLabel
            htmlFor="kaynakId"
            sx={{
              mt: 0,
              mb: { xs: "-10px", sm: 0 },
              mr: 2,
              whiteSpace: "nowrap",
            }}
          >
            <Typography variant="subtitle1">Kaynak Firma:</Typography>
          </CustomFormLabel>
          <CompanyBoxAutocomplete
            onSelectId={(selectedId) => setKaynakId(selectedId)}
            onSelectAdi={(selectedAdi) => setKaynakAdi(selectedAdi)}
            onSelectDenetimTuru={(selectedDenetimTuru) =>
              setKaynakDenetimTuru(selectedDenetimTuru)
            }
            onSelectBobimi={(selectedBobimi) => setKaynakBobimi(selectedBobimi)}
            onSelectTfrsmi={(selectedTfrsmi) => setKaynakTfrsmi(selectedTfrsmi)}
            onSelectEnflasyonmu={(selectedEnflasyonmu) =>
              setKaynakEnflasyonmu(selectedEnflasyonmu)
            }
            onSelectKonsolidemi={(selectedKonsolidemi) =>
              setKaynakKonsolidemi(selectedKonsolidemi)
            }
          />
        </Grid>
        <Grid item xs={12} sm={4} lg={4} display="flex">
          <CustomFormLabel
            htmlFor="hedefId"
            sx={{
              mt: 0,
              mb: { xs: "-10px", sm: 0 },
              mr: 2,
              whiteSpace: "nowrap",
            }}
          >
            <Typography variant="subtitle1">Hedef Firma:</Typography>
          </CustomFormLabel>
          <CompanyBoxAutocomplete
            onSelectId={(selectedId) => setHedefId(selectedId)}
            onSelectAdi={(selectedAdi) => setHedefAdi(selectedAdi)}
            onSelectDenetimTuru={(selectedDenetimTuru) =>
              setHedefDenetimTuru(selectedDenetimTuru)
            }
            onSelectBobimi={(selectedBobimi) => setHedefBobimi(selectedBobimi)}
            onSelectTfrsmi={(selectedTfrsmi) => setHedefTfrsmi(selectedTfrsmi)}
            onSelectEnflasyonmu={(selectedEnflasyonmu) =>
              setHedefEnflasyonmu(selectedEnflasyonmu)
            }
            onSelectKonsolidemi={(selectedKonsolidemi) =>
              setHedefKonsolidemi(selectedKonsolidemi)
            }
          />
        </Grid>
        <Grid item xs={12} sm={2} lg={2} display="flex">
          <CustomFormLabel
            //htmlFor="kaynakYil"
            sx={{
              mt: 0,
              mb: { xs: "-10px", sm: 0 },
              mr: 2,
              whiteSpace: "nowrap",
            }}
          >
            <Typography variant="subtitle1">Kaynak Yıl:</Typography>
          </CustomFormLabel>
          <YearBoxAutocomplete
            onSelect={(selectedYear) => setKaynakYilStr(selectedYear)}
            onSelectYear={(selectedYear) => setKaynakYil(selectedYear)}
            selectedDenetlenenId={kaynakId}
          />
        </Grid>
        <Grid item xs={12} sm={2} lg={2} display="flex">
          <CustomFormLabel
            //htmlFor="hedefYil"
            sx={{
              mt: 0,
              mb: { xs: "-10px", sm: 0 },
              mr: 2,
              whiteSpace: "nowrap",
            }}
          >
            <Typography variant="subtitle1">Hedef Yıl:</Typography>
          </CustomFormLabel>
          <YearBoxAutocomplete
            onSelect={(selectedYear) => setHedefYilStr(selectedYear)}
            onSelectYear={(selectedYear) => setHedefYil(selectedYear)}
            selectedDenetlenenId={hedefId}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default DenetimDosyaTransferForm;
