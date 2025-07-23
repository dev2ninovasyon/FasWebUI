import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Button, CardHeader, Grid } from "@mui/material";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import PersonelBoxAutocomplete from "@/app/(Uygulama)/components/Layout/Vertical/Header/PersonelBoxAutoComplete";

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
  const user = useSelector((state: AppState) => state.userReducer);

  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [selectedAdi, setSelectedAdi] = React.useState<string | null>(null);

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
              title={<Typography variant="h5">Hazırlayan:</Typography>}
            ></CardHeader>
          )}
          {onaylayan && (
            <CardHeader
              title={<Typography variant="h5">Onaylayan:</Typography>}
            ></CardHeader>
          )}
          {kaliteKontrol && (
            <CardHeader
              title={<Typography variant="h5">Kalite Kontrol:</Typography>}
            ></CardHeader>
          )}

          <CardContent sx={{ bgcolor: "primary.light" }}>
            <CustomFormLabel htmlFor="name" sx={{ mt: 0 }}>
              Personel
            </CustomFormLabel>
            <PersonelBoxAutocomplete
              initialValue={
                hazirlayan
                  ? user.rol &&
                    (user.rol.at(-1) == "Denetci" ||
                      user.rol.at(-1) == "DenetciYardimcisi")
                    ? user.kullaniciAdi
                    : undefined
                  : onaylayan
                  ? user.rol && user.rol.at(-1) == "SorumluDenetci"
                    ? user.kullaniciAdi
                    : undefined
                  : kaliteKontrol
                  ? user.rol && user.rol.at(-1) == "KaliteKontrolSorumluDenetci"
                    ? user.kullaniciAdi
                    : undefined
                  : undefined
              }
              tip={
                hazirlayan
                  ? "Hazırlayan"
                  : onaylayan
                  ? "Onaylayan"
                  : kaliteKontrol
                  ? "Kalite Kontrol"
                  : ""
              }
              disabled={
                hazirlayan
                  ? user.rol &&
                    (user.rol.at(-1) == "Denetci" ||
                      user.rol.at(-1) == "DenetciYardimcisi")
                    ? false
                    : true
                  : onaylayan
                  ? user.rol && user.rol.at(-1) == "SorumluDenetci"
                    ? false
                    : true
                  : kaliteKontrol
                  ? user.rol && user.rol.at(-1) == "KaliteKontrolSorumluDenetci"
                    ? false
                    : true
                  : true
              }
              onSelectId={(selectedId) => setSelectedId(selectedId)}
              onSelectAdi={(selectedAdi) => setSelectedAdi(selectedAdi)}
            />

            <CustomFormLabel htmlFor="date">Tarih</CustomFormLabel>
            <CustomTextField
              id="date"
              type="date"
              variant="outlined"
              disabled={
                hazirlayan
                  ? user.rol &&
                    (user.rol.at(-1) == "Denetci" ||
                      user.rol.at(-1) == "DenetciYardimcisi")
                    ? false
                    : true
                  : onaylayan
                  ? user.rol && user.rol.at(-1) == "SorumluDenetci"
                    ? false
                    : true
                  : kaliteKontrol
                  ? user.rol && user.rol.at(-1) == "KaliteKontrolSorumluDenetci"
                    ? false
                    : true
                  : true
              }
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />

            <Button
              size="medium"
              variant="outlined"
              color="primary"
              disabled={
                hazirlayan
                  ? user.rol &&
                    (user.rol.at(-1) == "Denetci" ||
                      user.rol.at(-1) == "DenetciYardimcisi")
                    ? false
                    : true
                  : onaylayan
                  ? user.rol && user.rol.at(-1) == "SorumluDenetci"
                    ? false
                    : true
                  : kaliteKontrol
                  ? user.rol && user.rol.at(-1) == "KaliteKontrolSorumluDenetci"
                    ? false
                    : true
                  : true
              }
              sx={{ width: "100%", mt: 5 }}
            >
              Onayla
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default BelgeKontrolCard;
