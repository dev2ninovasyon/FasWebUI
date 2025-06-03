import { Button, Grid, MenuItem, Typography } from "@mui/material";
import React from "react";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import CustomSelect from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSelect";

interface Props {
  grupKodu: string;
  hesapAdi: string;
  setGrupKodu: (num: string) => void;
  setHesapAdi: (num: string) => void;
  setVerileriGetirTiklandimi: (bool: boolean) => void;
  setKaydetTiklandimi: (bool: boolean) => void;
}

const MutabakatForm: React.FC<Props> = ({
  grupKodu,
  hesapAdi,
  setGrupKodu,
  setHesapAdi,
  setVerileriGetirTiklandimi,
  setKaydetTiklandimi,
}) => {
  return (
    <div>
      <Grid container spacing={3}>
        <Grid
          item
          xs={12}
          sm={2}
          lg={2}
          display="flex"
          alignItems="center"
        ></Grid>
        <Grid item xs={12} sm={3.5} lg={3.5} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="grupKodu"
            sx={{
              mt: 0,
              mb: { xs: "-10px", sm: 0 },
              mr: 2,
              whiteSpace: "nowrap",
            }}
          >
            <Typography variant="subtitle1">Gruplar:</Typography>
          </CustomFormLabel>
          <CustomSelect
            labelId="grupKodu"
            id="guvenilirlikDuzeyi"
            size="small"
            value={grupKodu}
            fullWidth
            onChange={(e: any) => {
              setGrupKodu(e.target.value);
            }}
            height="36px "
            sx={{ minWidth: 120 }}
          >
            <MenuItem value={"Hepsi"}>Hepsi</MenuItem>
            <MenuItem value={"Banka"}>Banka</MenuItem>
            <MenuItem value={"TicariAlacaklar"}>Ticari Alacaklar</MenuItem>
            <MenuItem value={"DigerAlacaklar"}>Diğer Alacaklar</MenuItem>
            <MenuItem value={"VerilenAvanslar"}>Verilen Avanslar</MenuItem>
            <MenuItem value={"MaliBorclar"}>Mali Borçlar</MenuItem>
            <MenuItem value={"TicariBorclar"}>Ticari Borçlar</MenuItem>
            <MenuItem value={"DigerBorclar"}>Diğer Borçlar</MenuItem>
            <MenuItem value={"AlinanAvanslar"}>Alınan Avanslar</MenuItem>
          </CustomSelect>
        </Grid>
        <Grid item xs={12} sm={3.5} lg={3.5} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="hesapAdi"
            sx={{
              mt: 0,
              mb: { xs: "-10px", sm: 0 },
              mr: 2,
              whiteSpace: "nowrap",
            }}
          >
            <Typography variant="subtitle1">Hesap Adı:</Typography>
          </CustomFormLabel>
          <CustomTextField
            id="hesapAdi"
            value={hesapAdi}
            fullWidth
            InputProps={{
              sx: {
                height: "38px", // tüm input'un yüksekliğini ayarlar
              },
            }}
            onChange={(e: any) => setHesapAdi(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={1.5} lg={1.5}>
          <Button
            size="medium"
            variant="outlined"
            color="primary"
            onClick={() => {
              setVerileriGetirTiklandimi(true);
            }}
            sx={{ width: "100%", whiteSpace: "nowrap" }}
          >
            <Typography variant="subtitle1">Verileri Getir</Typography>
          </Button>
        </Grid>
        <Grid item xs={12} sm={1.5} lg={1.5}>
          <Button
            size="medium"
            variant="outlined"
            color="primary"
            onClick={() => {
              setKaydetTiklandimi(true);
            }}
            sx={{ width: "100%", whiteSpace: "nowrap" }}
          >
            <Typography variant="subtitle1">Kaydet</Typography>
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default MutabakatForm;
