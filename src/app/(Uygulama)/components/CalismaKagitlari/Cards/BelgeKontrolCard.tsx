import React, { useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Button, CardHeader, Grid, useTheme } from "@mui/material";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import PersonelBoxAutocomplete from "@/app/(Uygulama)/components/Layout/Vertical/Header/PersonelBoxAutoComplete";
import {
  getFormHazirlayanOnaylayanByDenetciDenetlenenYilFormKodu,
  updateFormHazirlayanOnaylayan,
} from "@/api/CalismaKagitlari/CalismaKagitlari";
import { enqueueSnackbar } from "notistack";
import { setFormHazirlayanOnaylayan } from "@/store/user/UserSlice";

interface CardProps {
  hazirlayan?: string;
  onaylayan?: string;
  kaliteKontrol?: string;
  controller: string;
}

interface Veri {
  id?: number;
  hazirlayanId?: number;
  onaylayanId?: number;
  kontrolEdenId?: number;
  hazirlanmaTarihi?: string;
  onaylanmaTarihi?: string;
  kontrolTarihi?: string;
}

const BelgeKontrolCard: React.FC<CardProps> = ({
  hazirlayan,
  onaylayan,
  kaliteKontrol,
  controller,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const dispatch = useDispatch();

  const [id, setId] = React.useState<number | undefined>(undefined);

  const [selectedId, setSelectedId] = React.useState<number | undefined>(
    undefined
  );
  const [selectedAdi, setSelectedAdi] = React.useState<string | undefined>(
    undefined
  );
  const [selectedDate, setSelectedDate] = React.useState<string | undefined>(
    undefined
  );

  const [hazirlayanId, setHazirlayanId] = React.useState<number | undefined>(
    undefined
  );
  const [onaylayanId, setOnaylayanId] = React.useState<number | undefined>(
    undefined
  );
  const [kontrolEdenId, setKontrolEdenId] = React.useState<number | undefined>(
    undefined
  );

  const [hazirlayanTarih, setHazirlayanTarih] = React.useState<
    string | undefined
  >(undefined);
  const [onaylayanTarih, setOnaylayanTarih] = React.useState<
    string | undefined
  >(undefined);
  const [kontrolEdenTarih, setKontrolEdenTarih] = React.useState<
    string | undefined
  >(undefined);

  const [isClickedUpdate, setIsClickedUpdate] = React.useState<boolean>(false);

  const handleOnayla = async () => {
    if (!selectedDate) {
      enqueueSnackbar("Tarih Seçmelisiniz", {
        variant: "warning",
        autoHideDuration: 5000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.warning.dark
              : theme.palette.warning.main,
        },
      });
      return;
    }
    let updatedFormHazirlayanOnaylayanVerisi: Veri = {
      hazirlayanId: hazirlayanId,
      onaylayanId: onaylayanId,
      kontrolEdenId: kontrolEdenId,
      hazirlanmaTarihi: hazirlayanTarih,
      onaylanmaTarihi: onaylayanTarih,
      kontrolTarihi: kontrolEdenTarih,
    };

    if (hazirlayan) {
      updatedFormHazirlayanOnaylayanVerisi.hazirlayanId = selectedId;
      updatedFormHazirlayanOnaylayanVerisi.hazirlanmaTarihi = selectedDate;
    }
    if (onaylayan) {
      updatedFormHazirlayanOnaylayanVerisi.onaylayanId = selectedId;
      updatedFormHazirlayanOnaylayanVerisi.onaylanmaTarihi = selectedDate;
    }
    if (kaliteKontrol) {
      updatedFormHazirlayanOnaylayanVerisi.kontrolEdenId = selectedId;
      updatedFormHazirlayanOnaylayanVerisi.kontrolTarihi = selectedDate;
    }

    setIsClickedUpdate(true);
    try {
      const result = await updateFormHazirlayanOnaylayan(
        user.token || "",
        id,
        updatedFormHazirlayanOnaylayanVerisi,
        false
      );
      if (result == true) {
        setIsClickedUpdate(false);
        enqueueSnackbar("Onaylandı", {
          variant: "success",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.success.light
                : theme.palette.success.main,
            maxWidth: "720px",
          },
        });
      } else {
        setIsClickedUpdate(false);
        enqueueSnackbar(result && result.message, {
          variant: "warning",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.warning.dark
                : theme.palette.warning.main,
            maxWidth: "720px",
          },
        });
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const handleOnayiKaldir = async () => {
    let updatedFormHazirlayanOnaylayanVerisi: Veri = {
      hazirlayanId: hazirlayanId,
      onaylayanId: onaylayanId,
      kontrolEdenId: kontrolEdenId,
      hazirlanmaTarihi: hazirlayanTarih,
      onaylanmaTarihi: onaylayanTarih,
      kontrolTarihi: kontrolEdenTarih,
    };

    if (hazirlayan) {
      updatedFormHazirlayanOnaylayanVerisi.hazirlayanId = undefined;
      updatedFormHazirlayanOnaylayanVerisi.hazirlanmaTarihi = undefined;
    }
    if (onaylayan) {
      updatedFormHazirlayanOnaylayanVerisi.onaylayanId = undefined;
      updatedFormHazirlayanOnaylayanVerisi.onaylanmaTarihi = undefined;
    }
    if (kaliteKontrol) {
      updatedFormHazirlayanOnaylayanVerisi.kontrolEdenId = undefined;
      updatedFormHazirlayanOnaylayanVerisi.kontrolTarihi = undefined;
    }

    setIsClickedUpdate(true);
    try {
      const result = await updateFormHazirlayanOnaylayan(
        user.token || "",
        id,
        updatedFormHazirlayanOnaylayanVerisi,
        true
      );
      if (result == true) {
        setIsClickedUpdate(false);
        dispatch(setFormHazirlayanOnaylayan(true));
        enqueueSnackbar("Onay Kaldırıldı", {
          variant: "success",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.success.light
                : theme.palette.success.main,
            maxWidth: "720px",
          },
        });
      } else {
        setIsClickedUpdate(false);
        dispatch(setFormHazirlayanOnaylayan(true));
        enqueueSnackbar(result && result.message, {
          variant: "warning",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.warning.dark
                : theme.palette.warning.main,
            maxWidth: "720px",
          },
        });
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const formHazirlayanOnaylayanVerileri =
        await getFormHazirlayanOnaylayanByDenetciDenetlenenYilFormKodu(
          user.token || "",
          user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0,
          controller
        );

      setId(formHazirlayanOnaylayanVerileri.id);

      if (formHazirlayanOnaylayanVerileri.hazirlayanId) {
        setHazirlayanId(formHazirlayanOnaylayanVerileri.hazirlayanId);
        setHazirlayanTarih(
          formHazirlayanOnaylayanVerileri?.hazirlanmaTarihi?.split("T")[0] ||
            undefined
        );
      } else {
        if (hazirlayan) {
          if (
            user.rol &&
            (user.rol.at(-1) == "Denetci" ||
              user.rol.at(-1) == "DenetciYardimcisi")
          ) {
            setSelectedId(user.id);
          } else {
            setSelectedId(undefined);
            setHazirlayanId(undefined);
            setHazirlayanTarih(undefined);
          }
        }
      }
      if (formHazirlayanOnaylayanVerileri.onaylayanId) {
        setOnaylayanId(formHazirlayanOnaylayanVerileri.onaylayanId);
        setOnaylayanTarih(
          formHazirlayanOnaylayanVerileri?.onaylanmaTarihi?.split("T")[0] ||
            undefined
        );
      } else {
        if (onaylayan) {
          if (user.rol && user.rol.at(-1) == "SorumluDenetci") {
            setSelectedId(user.id);
          } else {
            setSelectedId(undefined);
            setOnaylayanId(undefined);
            setOnaylayanTarih(undefined);
          }
        }
      }
      if (formHazirlayanOnaylayanVerileri.kontrolEdenId) {
        setKontrolEdenId(formHazirlayanOnaylayanVerileri.kontrolEdenId);
        setKontrolEdenTarih(
          formHazirlayanOnaylayanVerileri?.kontrolTarihi?.split("T")[0] ||
            undefined
        );
      } else {
        if (kaliteKontrol) {
          if (user.rol && user.rol.at(-1) == "KaliteKontrolSorumluDenetci") {
            setSelectedId(user.id);
          } else {
            setSelectedId(undefined);
            setKontrolEdenId(undefined);
            setKontrolEdenTarih(undefined);
          }
        }
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!isClickedUpdate) {
      fetchData();
    } else {
      setSelectedDate(undefined);
      setHazirlayanId(undefined);
      setOnaylayanId(undefined);
      setKontrolEdenId(undefined);
      setHazirlayanTarih(undefined);
      setOnaylayanTarih(undefined);
      setKontrolEdenTarih(undefined);
    }
  }, [isClickedUpdate]);

  useEffect(() => {
    if (user.formHazirlayanOnaylayan) {
      fetchData();
      dispatch(setFormHazirlayanOnaylayan(false));
    }
  }, [user.formHazirlayanOnaylayan]);

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
                  ? hazirlayanId
                    ? hazirlayanId
                    : user.rol &&
                      (user.rol.at(-1) == "Denetci" ||
                        user.rol.at(-1) == "DenetciYardimcisi")
                    ? user.kullaniciAdi
                    : undefined
                  : onaylayan
                  ? onaylayanId
                    ? onaylayanId
                    : user.rol && user.rol.at(-1) == "SorumluDenetci"
                    ? user.kullaniciAdi
                    : undefined
                  : kaliteKontrol
                  ? kontrolEdenId
                    ? kontrolEdenId
                    : user.rol &&
                      user.rol.at(-1) == "KaliteKontrolSorumluDenetci"
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
                (hazirlayan
                  ? hazirlayanId
                    ? hazirlayanId == user.id
                      ? false
                      : true
                    : user.rol &&
                      (user.rol.at(-1) == "Denetci" ||
                        user.rol.at(-1) == "DenetciYardimcisi")
                    ? false
                    : true
                  : onaylayan
                  ? onaylayanId
                    ? onaylayanId == user.id
                      ? false
                      : true
                    : user.rol && user.rol.at(-1) == "SorumluDenetci"
                    ? false
                    : true
                  : kaliteKontrol
                  ? kontrolEdenId
                    ? kontrolEdenId == user.id
                      ? false
                      : true
                    : user.rol &&
                      user.rol.at(-1) == "KaliteKontrolSorumluDenetci"
                    ? false
                    : true
                  : true) ||
                (hazirlayan && hazirlayanId ? true : false) ||
                (onaylayan && onaylayanId ? true : false) ||
                (kaliteKontrol && kontrolEdenId ? true : false)
              }
              onSelectId={(selectedId) => setSelectedId(selectedId)}
              onSelectAdi={(selectedAdi) => setSelectedAdi(selectedAdi)}
            />

            <CustomFormLabel htmlFor="date">Tarih</CustomFormLabel>
            <CustomTextField
              id="date"
              type="date"
              variant="outlined"
              value={
                hazirlayan
                  ? hazirlayanTarih ?? ""
                  : onaylayan
                  ? onaylayanTarih ?? ""
                  : kaliteKontrol
                  ? kontrolEdenTarih ?? ""
                  : ""
              }
              onChange={(e: any) => {
                const newValue = e.target.value;

                if (hazirlayan) {
                  setHazirlayanTarih(newValue);
                } else if (onaylayan) {
                  setOnaylayanTarih(newValue);
                } else if (kaliteKontrol) {
                  setKontrolEdenTarih(newValue);
                }
                setSelectedDate(newValue);
              }}
              disabled={
                (hazirlayan
                  ? hazirlayanId
                    ? hazirlayanId == user.id
                      ? false
                      : true
                    : user.rol &&
                      (user.rol.at(-1) == "Denetci" ||
                        user.rol.at(-1) == "DenetciYardimcisi")
                    ? false
                    : true
                  : onaylayan
                  ? onaylayanId
                    ? onaylayanId == user.id
                      ? false
                      : true
                    : user.rol && user.rol.at(-1) == "SorumluDenetci"
                    ? false
                    : true
                  : kaliteKontrol
                  ? kontrolEdenId
                    ? kontrolEdenId == user.id
                      ? false
                      : true
                    : user.rol &&
                      user.rol.at(-1) == "KaliteKontrolSorumluDenetci"
                    ? false
                    : true
                  : true) ||
                (hazirlayan && hazirlayanId ? true : false) ||
                (onaylayan && onaylayanId ? true : false) ||
                (kaliteKontrol && kontrolEdenId ? true : false)
              }
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />

            {(hazirlayan && hazirlayanId ? true : false) ||
            (onaylayan && onaylayanId ? true : false) ||
            (kaliteKontrol && kontrolEdenId ? true : false) ? (
              <Button
                size="medium"
                variant="outlined"
                color="error"
                disabled={
                  hazirlayan
                    ? hazirlayanId
                      ? hazirlayanId == user.id
                        ? false
                        : true
                      : user.rol &&
                        (user.rol.at(-1) == "Denetci" ||
                          user.rol.at(-1) == "DenetciYardimcisi")
                      ? false
                      : true
                    : onaylayan
                    ? onaylayanId
                      ? onaylayanId == user.id
                        ? false
                        : true
                      : user.rol && user.rol.at(-1) == "SorumluDenetci"
                      ? false
                      : true
                    : kaliteKontrol
                    ? kontrolEdenId
                      ? kontrolEdenId == user.id
                        ? false
                        : true
                      : user.rol &&
                        user.rol.at(-1) == "KaliteKontrolSorumluDenetci"
                      ? false
                      : true
                    : true
                }
                onClick={() => {
                  handleOnayiKaldir();
                }}
                sx={{ width: "100%", mt: 5 }}
              >
                Onayı Kaldır
              </Button>
            ) : (
              <Button
                size="medium"
                variant="outlined"
                color="primary"
                disabled={
                  hazirlayan
                    ? hazirlayanId
                      ? hazirlayanId == user.id
                        ? false
                        : true
                      : user.rol &&
                        (user.rol.at(-1) == "Denetci" ||
                          user.rol.at(-1) == "DenetciYardimcisi")
                      ? false
                      : true
                    : onaylayan
                    ? onaylayanId
                      ? onaylayanId == user.id
                        ? false
                        : true
                      : user.rol && user.rol.at(-1) == "SorumluDenetci"
                      ? false
                      : true
                    : kaliteKontrol
                    ? kontrolEdenId
                      ? kontrolEdenId == user.id
                        ? false
                        : true
                      : user.rol &&
                        user.rol.at(-1) == "KaliteKontrolSorumluDenetci"
                      ? false
                      : true
                    : true
                }
                onClick={() => {
                  handleOnayla();
                }}
                sx={{ width: "100%", mt: 5 }}
              >
                Onayla
              </Button>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default BelgeKontrolCard;
