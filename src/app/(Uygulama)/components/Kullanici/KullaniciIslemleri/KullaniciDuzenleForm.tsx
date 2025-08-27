import { Grid, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getKullaniciById,
  updateKullanici,
} from "@/api/Kullanici/KullaniciIslemleri";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import AktifPasifBoxAutocomplete from "@/app/(Uygulama)/components/Sozlesme/DenetimKadrosuAtama/AutoCompleteBox/AktifPasifYedekBoxAutoComplete";
import UnvanBoxAutocomplete from "@/app/(Uygulama)/components/Sozlesme/DenetimKadrosuAtama/AutoCompleteBox/UnvanBoxAutoComplete";

const KullaniciDuzenleForm = () => {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const idIndex = segments.indexOf("KullaniciDuzenle") + 1;
  const pathId = segments[idIndex];

  const id = pathId;
  const [unvani, setUnvani] = useState("");
  const [unvanId, setUnvanId] = useState(0);
  const [personelAdi, setPersonelAdi] = useState("");
  const [tel, setTel] = useState("");
  const [gsm, setGsm] = useState("");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [aktifPasif, setAktifPasif] = useState(true);

  const user = useSelector((state: AppState) => state.userReducer);
  const router = useRouter();

  const handleButtonClick = async () => {
    const updatedKullanici = {
      unvani,
      personelAdi,
      tel,
      gsm,
      email,
      sifre,
      aktifPasif,
    };
    try {
      const result = await updateKullanici(
        user.token || "",
        id,
        updatedKullanici
      );
      if (result) {
        router.push("/Kullanici/KullaniciIslemleri");
      } else {
        console.error("Kullanıcı düzenleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const kullaniciVerileri = await getKullaniciById(
        user.token || "",
        pathId
      );
      setUnvani(kullaniciVerileri.unvani);
      setPersonelAdi(kullaniciVerileri.personelAdi);
      setTel(kullaniciVerileri.tel);
      setGsm(kullaniciVerileri.gsm);
      setEmail(kullaniciVerileri.email);
      setSifre(kullaniciVerileri.sifre);
      setAktifPasif(kullaniciVerileri.aktifPasif);
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
            htmlFor="personelAdi"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Personel Adı
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="personelAdi"
            value={personelAdi}
            fullWidth
            onChange={(e: any) => setPersonelAdi(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="unvani"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Ünvanı
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <UnvanBoxAutocomplete
            initialValue={unvani}
            onSelect={(selectedUnvanAdi) => setUnvani(selectedUnvanAdi)}
            onSelectId={(selectedUnvanId) => setUnvanId(selectedUnvanId)}
          />
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="email"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Email
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="email"
            value={email}
            fullWidth
            onChange={(e: any) => setEmail(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="tel"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Tel
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="tel"
            value={tel}
            fullWidth
            onChange={(e: any) => setTel(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="gsm"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Gsm
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="gsm"
            value={gsm}
            fullWidth
            onChange={(e: any) => setGsm(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="sifre"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Sifre
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="sifre"
            value={sifre}
            fullWidth
            onChange={(e: any) => setSifre(e.target.value)}
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
            Kullanıcı Düzenle
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default KullaniciDuzenleForm;
