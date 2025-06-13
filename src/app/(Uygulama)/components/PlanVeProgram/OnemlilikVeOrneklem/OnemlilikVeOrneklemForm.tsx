import { Button, Grid, MenuItem, Typography } from "@mui/material";
import React from "react";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import CustomSelect from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSelect";

interface Props {
  guvenilirlikDuzeyi: number;
  hataPayi: number;
  setGuvenilirlikDuzeyi: (num: number) => void;
  setHataPayi: (num: number) => void;
  setHesaplaTiklandimi: (bool: boolean) => void;
  handleHesapla: () => void;
}

const OnemlilikVeOrneklemForm: React.FC<Props> = ({
  guvenilirlikDuzeyi,
  hataPayi,
  setGuvenilirlikDuzeyi,
  setHataPayi,
  setHesaplaTiklandimi,
  handleHesapla,
}) => {
  return (
    <div>
      <Grid container spacing={3}>
        <Grid
          item
          xs={12}
          sm={3.5}
          lg={3.5}
          display="flex"
          alignItems="center"
        ></Grid>
        <Grid item xs={12} sm={3.5} lg={3.5} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="guvenilirlikDuzeyi"
            sx={{
              mt: 0,
              mb: { xs: "-10px", sm: 0 },
              mr: 2,
              whiteSpace: "nowrap",
            }}
          >
            <Typography variant="subtitle1">Güvenilirlik Düzeyi:</Typography>
          </CustomFormLabel>
          <CustomSelect
            labelId="guvenilirlikDuzeyi"
            id="guvenilirlikDuzeyi"
            size="small"
            value={guvenilirlikDuzeyi}
            fullWidth
            onChange={(e: any) => {
              setGuvenilirlikDuzeyi(e.target.value);
              setHataPayi(100 - e.target.value);
            }}
            height="36px "
            sx={{ minWidth: 120 }}
          >
            <MenuItem value={80}>80</MenuItem>
            <MenuItem value={85}>85</MenuItem>
            <MenuItem value={90}>90</MenuItem>
            <MenuItem value={91}>91</MenuItem>
            <MenuItem value={92}>92</MenuItem>
            <MenuItem value={93}>93</MenuItem>
            <MenuItem value={94}>94</MenuItem>
            <MenuItem value={95}>95</MenuItem>
            <MenuItem value={96}>96</MenuItem>
            <MenuItem value={97}>97</MenuItem>
            <MenuItem value={98}>98</MenuItem>
            <MenuItem value={99}>99</MenuItem>
          </CustomSelect>
        </Grid>
        <Grid item xs={12} sm={3.5} lg={3.5} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="hataPayi"
            sx={{
              mt: 0,
              mb: { xs: "-10px", sm: 0 },
              mr: 2,
              whiteSpace: "nowrap",
            }}
          >
            <Typography variant="subtitle1">Hata Payı:</Typography>
          </CustomFormLabel>
          <CustomTextField
            id="hataPayi"
            type="number"
            value={hataPayi}
            fullWidth
            InputProps={{
              sx: {
                height: "38px", // tüm input'un yüksekliğini ayarlar
              },
            }}
            onChange={(e: any) => setHataPayi(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={1.5} lg={1.5}>
          <Button
            size="medium"
            variant="outlined"
            color="primary"
            onClick={() => {
              setHesaplaTiklandimi(true);
              handleHesapla();
            }}
            sx={{ width: "100%", whiteSpace: "nowrap" }}
          >
            <Typography variant="subtitle1">Hesapla</Typography>
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default OnemlilikVeOrneklemForm;
