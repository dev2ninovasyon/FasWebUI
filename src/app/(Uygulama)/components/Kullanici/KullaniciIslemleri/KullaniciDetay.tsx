import { Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getKullaniciById } from "@/api/Kullanici/KullaniciIslemleri";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

const KullaniciDetay = () => {
  const [personelAdi, setPersonelAdi] = useState("");
  const [unvani, setUnvani] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [gsm, setGsm] = useState("");
  const [personelDosyaArsivId, setPersonelDosyaArsivId] = useState("");
  const [aktifPasif, setAktifPasif] = useState(true);

  const user = useSelector((state: AppState) => state.userReducer);

  const pathname = usePathname();
  const segments = pathname.split("/");
  const idIndex = segments.indexOf("KullaniciDetay") + 1;
  const pathId = segments[idIndex];

  const fetchData = async () => {
    try {
      const result = await getKullaniciById(user.token || "", pathId);
      setPersonelAdi(result.personelAdi);
      setUnvani(result.unvani);
      setEmail(result.email);
      setTel(result.tel);
      setGsm(result.gsm);
      setPersonelDosyaArsivId(result.personelDosyaArsivId);
      setAktifPasif(result.aktifPasif);
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
          <Typography textAlign="left" variant="h6">
            {personelAdi}
          </Typography>
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
          <Typography textAlign="left" variant="h6">
            {unvani}
          </Typography>
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
          <Typography textAlign="left" variant="h6">
            {email}
          </Typography>
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
          <Typography textAlign="left" variant="h6">
            {tel}
          </Typography>
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
          <Typography textAlign="left" variant="h6">
            {gsm}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="personelDosyaArsivId"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Personel Dosya Arşiv Id
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <Typography textAlign="left" variant="h6">
            {personelDosyaArsivId}
          </Typography>
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
          <Typography textAlign="left" variant="h6">
            {aktifPasif ? "Aktif" : "Pasif"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={3}></Grid>
      </Grid>
    </div>
  );
};

export default KullaniciDetay;
