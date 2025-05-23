import { Button, Grid, Typography } from "@mui/material";
import React from "react";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextAreaAutoSize from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextAreaAutoSize";

interface Props {
  tespitAciklama: string;
  setTespitAciklama: (str: string) => void;
  setSecilenlereTespitAciklamaKaydetTiklandimi: (bool: boolean) => void;
}

const TespitAciklamaForm: React.FC<Props> = ({
  tespitAciklama,
  setTespitAciklama,
  setSecilenlereTespitAciklamaKaydetTiklandimi,
}) => {
  return (
    <div>
      <Grid container spacing={3}>
        <Grid
          item
          xs={12}
          sm={3.25}
          lg={3.25}
          display="flex"
          alignItems="center"
        ></Grid>
        <Grid
          item
          xs={12}
          sm={3.25}
          lg={3.25}
          display="flex"
          alignItems="center"
        ></Grid>
        <Grid item xs={12} sm={3.5} lg={3.5} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="tespitAciklama"
            sx={{
              mt: 0,
              mb: { xs: "-10px", sm: 0 },
              mr: 2,
              whiteSpace: "nowrap",
            }}
          >
            <Typography variant="subtitle1">Tespit Açıklama:</Typography>
          </CustomFormLabel>
          <CustomTextAreaAutoSize
            id="tespitAciklama"
            value={tespitAciklama}
            fullWidth
            onChange={(e: any) => setTespitAciklama(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={2} lg={2}>
          <Button
            size="medium"
            variant="outlined"
            color="primary"
            onClick={() => setSecilenlereTespitAciklamaKaydetTiklandimi(true)}
            sx={{ width: "100%", height: "44px", whiteSpace: "nowrap" }}
          >
            <Typography variant="subtitle1">
              Seçilenlere Tespit Açıklama Kaydet
            </Typography>
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default TespitAciklamaForm;
