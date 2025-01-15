import { Button, Grid, Typography } from "@mui/material";
import React from "react";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextAreaAutoSize from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextAreaAutoSize";

interface Props {
  hesapNo: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  setHesapNo: (str: string) => void;
  setBaslangicTarihi: (str: string) => void;
  setBitisTarihi: (str: string) => void;
  setVerileriGetirTiklandimi: (bool: boolean) => void;
}

const EDefterIncelemeForm: React.FC<Props> = ({
  hesapNo,
  baslangicTarihi,
  bitisTarihi,
  setHesapNo,
  setBaslangicTarihi,
  setBitisTarihi,
  setVerileriGetirTiklandimi,
}) => {
  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={3.5} lg={3.5} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="baslangicTarihi"
            sx={{
              mt: 0,
              mb: { xs: "-10px", sm: 0 },
              mr: 2,
              whiteSpace: "nowrap",
            }}
          >
            <Typography variant="subtitle1">Başlangıç Tarihi:</Typography>
          </CustomFormLabel>
          <CustomTextField
            id="baslangicTarihi"
            type="date"
            value={baslangicTarihi}
            fullWidth
            onChange={(e: any) => setBaslangicTarihi(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3.5} lg={3.5} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="bitisTarihi"
            sx={{
              mt: 0,
              mb: { xs: "-10px", sm: 0 },
              mr: 2,
              whiteSpace: "nowrap",
            }}
          >
            <Typography variant="subtitle1">Bitiş Tarihi:</Typography>
          </CustomFormLabel>
          <CustomTextField
            id="bitisTarihi"
            type="date"
            value={bitisTarihi}
            fullWidth
            onChange={(e: any) => setBitisTarihi(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3.5} lg={3.5} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="hesapNo"
            sx={{
              mt: 0,
              mb: { xs: "-10px", sm: 0 },
              mr: 2,
              whiteSpace: "nowrap",
            }}
          >
            <Typography variant="subtitle1">Hesap No:</Typography>
          </CustomFormLabel>
          <CustomTextAreaAutoSize
            id="hesapNo"
            value={hesapNo}
            fullWidth
            placeholder="örn. 500"
            onChange={(e: any) => setHesapNo(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={1.5} lg={1.5}>
          <Button
            size="medium"
            variant="outlined"
            color="primary"
            onClick={() => setVerileriGetirTiklandimi(true)}
            sx={{ width: "100%", height: "44px", whiteSpace: "nowrap" }}
          >
            <Typography variant="subtitle1">Verileri Getir</Typography>
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default EDefterIncelemeForm;
