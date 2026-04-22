import { Alert, Grid, Button, useTheme } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { createGorevAtamalari } from "@/api/Sozlesme/DenetimKadrosuAtama";
import UnvanBoxAutocomplete from "./AutoCompleteBox/UnvanBoxAutoComplete";
import KullaniciBoxAutocomplete from "./AutoCompleteBox/KullaniciBoxAutoComplete";
import { enqueueSnackbar } from "notistack";
import AsilYedekBoxAutocomplete from "./AutoCompleteBox/AsilYedekBoxAutoComplete";
import AktifPasifBoxAutocomplete from "./AutoCompleteBox/AktifPasifYedekBoxAutoComplete";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";

const DenetimKadrosuEkleForm = () => {
  const [kullaniciAdi, setKullaniciAdi] = useState("");
  const [unvanAdi, setUnvanAdi] = useState("");
  const [asilYedek, setAsilYedek] = useState("");
  const [calismaSaati, setCalismaSaati] = useState<any>(0);
  const [saatBasiUcreti, setSaatBasiUcreti] = useState<any>(0);
  const [denetimUcreti, setDenetimUcreti] = useState<any>(0);
  const [aktifPasif, setAktifPasif] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const [kullaniciId, setKullaniciId] = useState(0);
  const [unvanId, setUnvanId] = useState(0);
  const [rolId, setRoleId] = useState(0);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    const calculated = (Number(calismaSaati) || 0) * (Number(saatBasiUcreti) || 0);
    setDenetimUcreti(Number(calculated.toFixed(2)));
  }, [calismaSaati, saatBasiUcreti]);

  const denetciId = user.denetciId;
  const denetlenenId = user.denetlenenId;
  const yil = user.yil;

  const showWarning = (message: string) => {
    setFormError(message);
    enqueueSnackbar(message, {
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
  };

  const handleButtonClick = async () => {
    setFormError(null);

    if (!kullaniciId) {
      showWarning("Lütfen personel seçin.");
      return;
    }

    if (!unvanId) {
      showWarning("Lütfen ünvan seçin.");
      return;
    }

    if (!asilYedek) {
      showWarning("Lütfen Asil / Yedek seçin.");
      return;
    }

    if (!Number.isInteger(Number(calismaSaati))) {
      showWarning("Çalışma Saati tam sayı olmalıdır.");
      return;
    }

    const createdGorevAtamalari = {
      denetciId,
      denetlenenId,
      yil,
      kullaniciId,
      unvanId,
      asilYedek,
      calismaSaati: Number.parseInt(String(calismaSaati), 10),
      saatBasiUcreti: Number(saatBasiUcreti),
      denetimUcreti: Number(denetimUcreti),
      aktifPasif,
    };

    try {
      const result = await createGorevAtamalari(createdGorevAtamalari);
      if (result == true) {
        router.push("/Sozlesme/DenetimKadrosuAtama");
      } else {
        showWarning(result?.message || "Görev ataması kaydedilemedi.");
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
      showWarning("Görev ataması kaydedilemedi.");
    }
  };

  return (
    <div>
      {formError && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {formError}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid
          display="flex"
          alignItems="center"
          size={{
            xs: 12,
            sm: 3
          }}>
          <CustomFormLabel
            htmlFor="kullaniciAdi"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Personel Adı
          </CustomFormLabel>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 9
          }}>
          <KullaniciBoxAutocomplete
            onSelectAdi={(selectedKullaniciAdi) =>
              setKullaniciAdi(selectedKullaniciAdi)
            }
            onSelectId={(selectedKullaniciId) =>
              setKullaniciId(selectedKullaniciId)
            }
          />
        </Grid>
        <Grid
          display="flex"
          alignItems="center"
          size={{
            xs: 12,
            sm: 3
          }}>
          <CustomFormLabel
            htmlFor="unvanAdi"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Ünvanı
          </CustomFormLabel>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 9
          }}>
          <UnvanBoxAutocomplete
            onSelect={(selectedUnvanAdi) => setUnvanAdi(selectedUnvanAdi)}
            onSelectId={(selectedUnvanId) => {
              setUnvanId(selectedUnvanId);
              setRoleId(selectedUnvanId);
            }}
          />
        </Grid>
        <Grid
          display="flex"
          alignItems="center"
          size={{
            xs: 12,
            sm: 3
          }}>
          <CustomFormLabel
            htmlFor="asilYedek"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Asil / Yedek
          </CustomFormLabel>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 9
          }}>
          <AsilYedekBoxAutocomplete
            onSelect={(selectedAsilYedek) => setAsilYedek(selectedAsilYedek)}
          />
        </Grid>
        <Grid
          display="flex"
          alignItems="center"
          size={{
            xs: 12,
            sm: 3
          }}>
          <CustomFormLabel
            htmlFor="calismaSaati"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Çalışma Saati
          </CustomFormLabel>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 9
          }}>
          <CustomTextField
            id="calismaSaati"
            type="number"
            value={calismaSaati}
            fullWidth
            inputProps={{ step: "1", min: "0", pattern: "[0-9]*" }}
            onChange={(e: any) => {
              const value = e.target.value;
              if (value === "" || /^\d*$/.test(value)) {
                setCalismaSaati(value);
              }
            }}
            onBlur={() => {
              setCalismaSaati(
                calismaSaati === "" ? "0" : String(Number.parseInt(String(calismaSaati), 10) || 0)
              );
            }}
          />
        </Grid>
        <Grid
          display="flex"
          alignItems="center"
          size={{
            xs: 12,
            sm: 3
          }}>
          <CustomFormLabel
            htmlFor="saatBasiUcreti"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Saat Başı Ücreti
          </CustomFormLabel>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 9
          }}>
          <CustomTextField
            id="saatBasiUcreti"
            type="number"
            value={saatBasiUcreti}
            fullWidth
            inputProps={{ step: "0.01", pattern: "[0-9]*[.,]?[0-9]*" }}
            onChange={(e: any) => {
              const value = e.target.value;
              if (value === "" || /^\d*[.,]?\d*$/.test(value)) {
                setSaatBasiUcreti(value.replace(",", "."));
              }
            }}
            onBlur={() => {
              setSaatBasiUcreti(Number(saatBasiUcreti).toFixed(2));
            }}
          />
        </Grid>
        <Grid
          display="flex"
          alignItems="center"
          size={{
            xs: 12,
            sm: 3
          }}>
          <CustomFormLabel
            htmlFor="denetimUcreti"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Denetim Ücreti
          </CustomFormLabel>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 9
          }}>
          <CustomTextField
            id="denetimUcreti"
            type="number"
            value={denetimUcreti}
            fullWidth
            inputProps={{ step: "0.01", readOnly: true }}
            onChange={(e: any) => {
              const value = e.target.value;
              if (value === "" || /^\d*[.,]?\d*$/.test(value)) {
                setDenetimUcreti(value.replace(",", "."));
              }
            }}
            onBlur={() => {
              setDenetimUcreti(Number(denetimUcreti).toFixed(2));
            }}
          />
        </Grid>
        <Grid
          display="flex"
          alignItems="center"
          size={{
            xs: 12,
            sm: 3
          }}>
          <CustomFormLabel
            htmlFor="aktifPasif"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Durum
          </CustomFormLabel>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 9
          }}>
          <AktifPasifBoxAutocomplete
            onSelect={(selectedAktifPasif) =>
              selectedAktifPasif == "Aktif"
                ? setAktifPasif(true)
                : setAktifPasif(false)
            }
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 3
          }}></Grid>
        <Grid
          size={{
            xs: 12,
            sm: 9
          }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              handleButtonClick();
            }}
          >
            Görev Ataması Ekle
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default DenetimKadrosuEkleForm;
