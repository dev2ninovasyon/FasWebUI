import { Grid, Button } from "@mui/material";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createKullanici } from "@/api/Kullanici/KullaniciIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import UnvanBoxAutocomplete from "@/app/(Uygulama)/components/Sozlesme/DenetimKadrosuAtama/AutoCompleteBox/UnvanBoxAutoComplete";

const KullaniciEkleForm = () => {
  const [bdScilNo, setBdSicilNo] = useState("");
  const [unvani, setUnvani] = useState("");
  const [unvanId, setUnvanId] = useState(0);
  const [personelAdi, setPersonelAdi] = useState("");
  const [tel, setTel] = useState("");
  const [gsm, setGsm] = useState("");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [personelDosyaArsivId, setPersonelDosyaArsivId] = useState("");
  const [aktifPasif, setAktifPasif] = useState(true);

  const router = useRouter();
  const user = useSelector((state: AppState) => state.userReducer);

  const denetciId = user.denetciId;

  const handleButtonClick = async () => {
    const createdKullanici = {
      denetciId,
      bdScilNo,
      unvani,
      personelAdi,
      tel,
      gsm,
      email,
      sifre,
      personelDosyaArsivId,
      aktifPasif,
    };
    try {
      const result = await createKullanici(user.token || "", createdKullanici);
      if (result) {
        router.push("/Kullanici/KullaniciIslemleri");
      } else {
        console.error("Kullanıcı ekleme başarısız");
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
            htmlFor="bd-sicilNo"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            B. D. Sicil No
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="bd-sicilNo"
            fullWidth
            onChange={(e: any) => setBdSicilNo(e.target.value)}
          />
        </Grid>
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
            fullWidth
            onChange={(e: any) => setGsm(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="sifre"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Şifre
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="sifre"
            fullWidth
            onChange={(e: any) => setSifre(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={3}></Grid>
        <Grid item xs={12} sm={9}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleButtonClick}
          >
            Kullanıcı Ekle
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default KullaniciEkleForm;
