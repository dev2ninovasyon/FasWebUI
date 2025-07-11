import { Grid, Button, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  getGorevAtamalariById,
  updateGorevAtamalari,
} from "@/api/Sozlesme/DenetimKadrosuAtama";
import { enqueueSnackbar } from "notistack";
import KullaniciBoxAutocomplete from "./AutoCompleteBox/KullaniciBoxAutoComplete";
import UnvanBoxAutocomplete from "./AutoCompleteBox/UnvanBoxAutoComplete";
import AsilYedekBoxAutocomplete from "./AutoCompleteBox/AsilYedekBoxAutoComplete";
import AktifPasifBoxAutocomplete from "./AutoCompleteBox/AktifPasifYedekBoxAutoComplete";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";

const DenetimKadrosuDuzenleForm = () => {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const idIndex = segments.indexOf("GorevAtamasiDuzenle") + 1;
  const pathId = segments[idIndex];
  const id = pathId;

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const router = useRouter();

  const [kullaniciAdi, setKullaniciAdi] = useState("");
  const [unvanAdi, setUnvanAdi] = useState("");
  const [asilYedek, setAsilYedek] = useState("");
  const [calismaSaati, setCalismaSaati] = useState(0);
  const [saatBasiUcreti, setSaatBasiUcreti] = useState(0);
  const [denetimUcreti, setDenetimUcreti] = useState(0);
  const [aktifPasif, setAktifPasif] = useState(true);

  const [kullaniciId, setKullaniciId] = useState(0);
  const [unvanId, setUnvanId] = useState(0);

  const handleButtonClick = async () => {
    const updatedGorevAtamalari = {
      kullaniciId,
      unvanId,
      asilYedek,
      calismaSaati,
      saatBasiUcreti,
      denetimUcreti,
      aktifPasif,
    };
    try {
      const result = await updateGorevAtamalari(
        user.token || "",
        id,
        updatedGorevAtamalari
      );
      if (result == true) {
        router.push("/Sozlesme/DenetimKadrosuAtama");
      } else {
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
      const görevAtamalariVerileri = await getGorevAtamalariById(
        user.token || "",
        pathId
      );
      setKullaniciId(görevAtamalariVerileri.kullaniciId);
      setKullaniciAdi(görevAtamalariVerileri.kullaniciAdi);
      setUnvanId(görevAtamalariVerileri.unvanId);
      setUnvanAdi(görevAtamalariVerileri.unvanAdi);
      setAsilYedek(görevAtamalariVerileri.asilYedek);
      setCalismaSaati(görevAtamalariVerileri.calismaSaati);
      setSaatBasiUcreti(görevAtamalariVerileri.saatBasiUcreti);
      setDenetimUcreti(görevAtamalariVerileri.denetimUcreti);
      setAktifPasif(görevAtamalariVerileri.aktifPasif);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
            initialValue={kullaniciAdi}
            onSelectAdi={(selectedKullaniciAdi) =>
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
            initialValue={unvanAdi}
            onSelect={(selectedUnvanAdi) => setUnvanAdi(selectedUnvanAdi)}
            onSelectId={(selectedUnvanId) => setUnvanId(selectedUnvanId)}
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
            initialValue={asilYedek}
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
            value={calismaSaati}
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
            Saat Başı Ücreti
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="saatBasiUcreti"
            type="number"
            value={saatBasiUcreti}
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
            value={denetimUcreti}
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
            initialValue={aktifPasif ? "Aktif" : "Pasif"}
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
            onClick={handleButtonClick}
          >
            Görev Ataması Düzenle
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};
export default DenetimKadrosuDuzenleForm;
