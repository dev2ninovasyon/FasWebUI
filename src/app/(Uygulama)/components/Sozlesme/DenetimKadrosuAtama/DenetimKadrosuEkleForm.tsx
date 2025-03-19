import { Grid, Button, useTheme } from "@mui/material";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  createGorevAtamalari,
  createRole,
} from "@/api/Sozlesme/DenetimKadrosuAtama";
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
  const [calismaSaati, setCalismaSaati] = useState(0);
  const [saatBasiUcreti, setSaatBasiUcreti] = useState(0);
  const [denetimUcreti, setDenetimUcreti] = useState(0);
  const [aktifPasif, setAktifPasif] = useState(true);

  const [kullaniciId, setKullaniciId] = useState(0);
  const [unvanId, setUnvanId] = useState(0);
  const [rolId, setRoleId] = useState(0);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const router = useRouter();

  const denetciId = user.denetciId;
  const denetlenenId = user.denetlenenId;
  const yil = user.yil;

  const handleButtonClick = async () => {
    const createdGorevAtamalari = {
      denetciId,
      denetlenenId,
      yil,
      kullaniciId,
      unvanId,
      asilYedek,
      calismaSaati,
      saatBasiUcreti,
      denetimUcreti,
      aktifPasif,
    };
    const createdRole = {
      rolId,
      denetlenenId,
      kullaniciId,
      yil,
    };
    try {
      const result = await createGorevAtamalari(
        user.token || "",
        createdGorevAtamalari
      );
      const resultRole = await createRole(user.token || "", createdRole);
      if (result && resultRole) {
        router.push("/Sozlesme/DenetimKadrosuAtama");
      } else {
        console.error("Görev Atamaları ekleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="kullaniciAdi"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Personel Adı
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <KullaniciBoxAutocomplete
            onSelect={(selectedKullaniciAdi) =>
              setKullaniciAdi(selectedKullaniciAdi)
            }
            onSelectId={(selectedKullaniciId) =>
              setKullaniciId(selectedKullaniciId)
            }
          />
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="unvanAdi"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Ünvanı
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <UnvanBoxAutocomplete
            onSelect={(selectedUnvanAdi) => setUnvanAdi(selectedUnvanAdi)}
            onSelectId={(selectedUnvanId) => {
              setUnvanId(selectedUnvanId);
              setRoleId(selectedUnvanId);
            }}
          />
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="asilYedek"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Asil / Yedek
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <AsilYedekBoxAutocomplete
            onSelect={(selectedAsilYedek) => setAsilYedek(selectedAsilYedek)}
          />
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="calismaSaati"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Çalışma Saati
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="calismaSaati"
            type="number"
            fullWidth
            inputProps={{ step: "1", pattern: "[0-9]*" }}
            onChange={(e: any) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                // Regex to allow only digits
                setCalismaSaati(value);
              } else {
                enqueueSnackbar("Hatalı Sayı Girişi. Tam Sayı Girmelisiniz.", {
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
            }}
          />
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="saatBasiUcreti"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Saat Başı Ücret
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="saatBasiUcreti"
            type="number"
            fullWidth
            inputProps={{ step: "1", pattern: "[0-9]*.[0-9]*" }}
            onChange={(e: any) => {
              const value = e.target.value;
              if (/^[0-9]+(\.[0-9]+)?$/.test(value)) {
                // Regex to allow numbers
                setSaatBasiUcreti(value);
              } else {
                enqueueSnackbar(
                  "Hatalı Sayı Girişi. Ondalıklı Sayı Girmelisiniz.",
                  {
                    variant: "warning",
                    autoHideDuration: 5000,
                    style: {
                      backgroundColor:
                        customizer.activeMode === "dark"
                          ? theme.palette.warning.dark
                          : theme.palette.warning.main,
                      maxWidth: "720px",
                    },
                  }
                );
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="denetimUcreti"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Denetim Ücreti
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="denetimUcreti"
            type="number"
            fullWidth
            inputProps={{ step: "1", pattern: "[0-9]*.[0-9]*" }}
            onChange={(e: any) => {
              const value = e.target.value;
              if (/^[0-9]+(\.[0-9]+)?$/.test(value)) {
                // Regex to allow only numbers
                setDenetimUcreti(value);
              } else {
                enqueueSnackbar(
                  "Hatalı Sayı Girişi. Ondalıklı Sayı Girmelisiniz.",
                  {
                    variant: "warning",
                    autoHideDuration: 5000,
                    style: {
                      backgroundColor:
                        customizer.activeMode === "dark"
                          ? theme.palette.warning.dark
                          : theme.palette.warning.main,
                      maxWidth: "720px",
                    },
                  }
                );
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="aktifPasif"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Durum
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <AktifPasifBoxAutocomplete
            onSelect={(selectedAktifPasif) =>
              selectedAktifPasif == "Aktif"
                ? setAktifPasif(true)
                : setAktifPasif(false)
            }
          />
        </Grid>
        <Grid item xs={12} sm={3}></Grid>
        <Grid item xs={12} sm={9}>
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
