import { Button, Grid, Typography } from "@mui/material";
import React from "react";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextAreaAutoSize from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextAreaAutoSize";

interface Props {
  hesapNo: string;
  yevmiyeFisNo: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  setHesapNo: (str: string) => void;
  setYevmiyeFisNo: (str: string) => void;
  setBaslangicTarihi: (str: string) => void;
  setBitisTarihi: (str: string) => void;

  setFisleriGosterTiklandimi: (bool: boolean) => void;
}

const HaricFisListesiForm: React.FC<Props> = ({
  hesapNo,
  yevmiyeFisNo,
  baslangicTarihi,
  bitisTarihi,
  setHesapNo,
  setYevmiyeFisNo,
  setBaslangicTarihi,
  setBitisTarihi,

  setFisleriGosterTiklandimi,
}) => {
  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={2} lg={2} display="flex">
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
        <Grid item xs={12} sm={2} lg={2} display="flex">
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
        <Grid item xs={12} sm={2.5} lg={2.5} display="flex">
          <CustomFormLabel
            //htmlFor="hesapNo"
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
        <Grid item xs={12} sm={4} lg={4} display="flex">
          <CustomFormLabel
            //htmlFor="YevmiyeFisNo"
            sx={{
              mt: 0,
              mb: { xs: "-10px", sm: 0 },
              mr: 2,
              whiteSpace: "nowrap",
            }}
          >
            <Typography variant="subtitle1">Yevmiye / Fiş No:</Typography>
          </CustomFormLabel>
          <CustomTextAreaAutoSize
            id="yevmiyeFisNo"
            value={yevmiyeFisNo}
            fullWidth
            placeholder="Yükleniyor..."
            onChange={(e: any) => setYevmiyeFisNo(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={1.5} lg={1.5}>
          <Button
            size="medium"
            variant="outlined"
            color="primary"
            onClick={() => setFisleriGosterTiklandimi(true)}
            sx={{ width: "100%", height: "44px", whiteSpace: "nowrap" }}
          >
            Fişleri Göster
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default HaricFisListesiForm;
