import { Box, Button, CircularProgress, Grid, Typography } from "@mui/material";
import React from "react";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextAreaAutoSize from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextAreaAutoSize";

interface Props {
  hesapNo: string;
  yevmiyeFisNo: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  loading?: boolean;
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
  loading,
  setHesapNo,
  setYevmiyeFisNo,
  setBaslangicTarihi,
  setBitisTarihi,

  setFisleriGosterTiklandimi,
}) => {
  return (
    <div>
      <Grid container spacing={3}>
        <Grid
          display="flex"
          size={{
            xs: 12,
            sm: 2,
            lg: 2,
          }}
        >
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
        <Grid
          display="flex"
          size={{
            xs: 12,
            sm: 2,
            lg: 2,
          }}
        >
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
        <Grid
          display="flex"
          size={{
            xs: 12,
            sm: 2.5,
            lg: 2.5,
          }}
        >
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
        <Grid
          display="flex"
          size={{
            xs: 12,
            sm: 4,
            lg: 4,
          }}
        >
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
          <Box sx={{ width: "100%", position: "relative" }}>
            <CustomTextAreaAutoSize
              id="yevmiyeFisNo"
              value={yevmiyeFisNo}
              fullWidth
              placeholder={
                loading
                  ? "Standart fişler tespit ediliyor..."
                  : "Yevmiye / Fiş numaraları"
              }
              onChange={(e: any) => setYevmiyeFisNo(e.target.value)}
              disabled={loading}
            />
            {loading && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 8,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <CircularProgress size={20} />
              </Box>
            )}
          </Box>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 1.5,
            lg: 1.5
          }}>
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
