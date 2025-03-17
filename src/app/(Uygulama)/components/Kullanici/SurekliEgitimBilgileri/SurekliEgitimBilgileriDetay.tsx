import { Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getSurekliEgitimBilgileriById } from "@/api/Kullanici/SurekliEgitimBilgileri";

const SurekliEgitimBilgileriDetay = () => {
  const [personelId, setPersonelId] = useState(0);
  const [personelAdi, setPersonelAdi] = useState("");
  const [sertifikaAdi, setSertifikaAdi] = useState("");
  const [egitimBaslangicTarihi, setEgitimBaslangicTarihi] = useState("");
  const [egitimBitisTarihi, setEgitimBitisTarihi] = useState("");
  const [egitimSaati, setEgitimSaati] = useState(0);
  const [eldeEdilenKredi, setEldeEdilenKredi] = useState(0);
  const [egitimTuru, setEgitimTuru] = useState("");

  const user = useSelector((state: AppState) => state.userReducer);

  const pathname = usePathname();
  const segments = pathname.split("/");
  const idIndex = segments.indexOf("SurekliEgitimBilgileriDetay") + 1;
  const pathId = segments[idIndex];

  const fetchData = async () => {
    try {
      const surekliEgitimBilgileriVerileri =
        await getSurekliEgitimBilgileriById(user.token || "", pathId);
      setPersonelId(surekliEgitimBilgileriVerileri.personelId);
      setPersonelAdi(surekliEgitimBilgileriVerileri.personelAdi);
      setSertifikaAdi(surekliEgitimBilgileriVerileri.sertifikaAdi);
      setEgitimBaslangicTarihi(
        surekliEgitimBilgileriVerileri.egitimBaslangicTarihi
          .split("T")[0]
          .split("-")
          .reverse()
          .join(".")
      );
      setEgitimBitisTarihi(
        surekliEgitimBilgileriVerileri.egitimBitisTarihi
          .split("T")[0]
          .split("-")
          .reverse()
          .join(".")
      );
      setEgitimSaati(surekliEgitimBilgileriVerileri.egitimSaati);
      setEldeEdilenKredi(surekliEgitimBilgileriVerileri.eldeEdilenKredi);
      setEgitimTuru(surekliEgitimBilgileriVerileri.egitimTuru);
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
            htmlFor="sertifikaAdi"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Sertifika Adı
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <Typography textAlign="left" variant="h6">
            {sertifikaAdi}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="egitimBaslangicTarihi"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Eğitim Başlangıç Tarihi
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <Typography textAlign="left" variant="h6">
            {egitimBaslangicTarihi}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="egitimBitisTarihi"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Eğitim Bitiş Tarihi
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <Typography textAlign="left" variant="h6">
            {egitimBitisTarihi}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="egitimSaati"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Eğitim Saati
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <Typography textAlign="left" variant="h6">
            {egitimSaati}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="eldeEdilenKredi"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Elde Edilen Kredi
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <Typography textAlign="left" variant="h6">
            {eldeEdilenKredi}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="egitimTuru"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Eğitim Türü
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <Typography textAlign="left" variant="h6">
            {egitimTuru}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={3}></Grid>
      </Grid>
    </div>
  );
};

export default SurekliEgitimBilgileriDetay;
