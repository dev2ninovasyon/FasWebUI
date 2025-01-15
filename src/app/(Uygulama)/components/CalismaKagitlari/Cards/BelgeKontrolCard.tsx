import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Button, CardHeader, Grid, IconButton } from "@mui/material";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";

interface CardProps {
  hazirlayan?: string;
  onaylayan?: string;
  kaliteKontrol?: string;
}

const BelgeKontrolCard: React.FC<CardProps> = ({
  hazirlayan,
  onaylayan,
  kaliteKontrol,
}) => {
  return (
    <Grid container>
      <Grid item xs={12} lg={12}>
        <Card
          sx={{
            width: "100%",
            bgcolor: "primary.light",
            overflowWrap: "break-word",
            wordWrap: "break-word",
          }}
        >
          {hazirlayan && (
            <CardHeader
              title={
                <Typography variant="h5">
                  Hazırlayan:
                  <br />
                  {hazirlayan}
                </Typography>
              }
            ></CardHeader>
          )}
          {onaylayan && (
            <CardHeader
              title={
                <Typography variant="h5">
                  Onaylayan:
                  <br />
                  {onaylayan}
                </Typography>
              }
            ></CardHeader>
          )}

          {kaliteKontrol && (
            <CardHeader
              title={
                <Typography variant="h5">
                  Kalite Kontrol:
                  <br />
                  {kaliteKontrol}
                </Typography>
              }
            ></CardHeader>
          )}

          <CardContent sx={{ bgcolor: "primary.light" }}>
            <CustomFormLabel htmlFor="date">Hazırlanma Tarihi</CustomFormLabel>
            <CustomTextField
              id="date"
              type="date"
              variant="outlined"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
            <Grid
              container
              sx={{
                width: "100%",
                margin: "0 auto",
                justifyContent: "center",
              }}
            >
              <Grid item xs={12} lg={12} mt={5}>
                <Button
                  size="medium"
                  variant="outlined"
                  color="primary"
                  sx={{ width: "100%" }}
                >
                  Onayla
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default BelgeKontrolCard;
