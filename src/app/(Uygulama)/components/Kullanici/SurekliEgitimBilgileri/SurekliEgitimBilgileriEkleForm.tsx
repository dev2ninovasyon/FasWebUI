import { Grid, Button } from "@mui/material";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import { createSurekliEgitimBilgileri } from "@/api/Kullanici/SurekliEgitimBilgileri";
import KullaniciBoxAutocomplete from "@/app/(Uygulama)/components/Sozlesme/DenetimKadrosuAtama/AutoCompleteBox/KullaniciBoxAutoComplete";

const SurekliEgitimBilgileriEkleForm = () => {
  const [personelId, setPersonelId] = useState(0);
  const [personelAdi, setPersonelAdi] = useState("");
  const [sertifikaAdi, setSertifikaAdi] = useState("");
  const [egitimBaslangicTarihi, setEgitimBaslangicTarihi] = useState("");
  const [egitimBitisTarihi, setEgitimBitisTarihi] = useState("");
  const [egitimSaati, setEgitimSaati] = useState(0);
  const [eldeEdilenKredi, setEldeEdilenKredi] = useState(0);
  const [egitimTuru, setEgitimTuru] = useState("");

  const router = useRouter();
  const user = useSelector((state: AppState) => state.userReducer);

  const denetciId = user.denetciId;

  const handleButtonClick = async () => {
    const createdSurekliEgitimBilgileri = {
      denetciId,
      personelId,
      personelAdi,
      sertifikaAdi,
      egitimBaslangicTarihi,
      egitimBitisTarihi,
      egitimSaati,
      eldeEdilenKredi,
      egitimTuru,
    };

    try {
      const result = await createSurekliEgitimBilgileri(
        user.token || "",
        createdSurekliEgitimBilgileri
      );
      if (result) {
        router.push("/Kullanici/SurekliEgitimBilgileri");
      } else {
        console.error("Sürekli Eğitim Bilgileri ekleme başarısız");
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
            htmlFor="personelAdi"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Personel Adı
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <KullaniciBoxAutocomplete
            initialValue={personelAdi}
            onSelect={(selectedPersonelAdi) =>
              setPersonelAdi(selectedPersonelAdi)
            }
            onSelectId={(selectedPersonelId) =>
              setPersonelId(selectedPersonelId)
            }
          />
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
          <CustomTextField
            id="sertifikaAdi"
            fullWidth
            onChange={(e: any) => setSertifikaAdi(e.target.value)}
          />
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
          <CustomTextField
            id="egitimBaslangicTarihi"
            type="date"
            fullWidth
            onChange={(e: any) => setEgitimBaslangicTarihi(e.target.value)}
          />
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
          <CustomTextField
            id="egitimBitisTarihi"
            type="date"
            fullWidth
            onChange={(e: any) => setEgitimBitisTarihi(e.target.value)}
          />
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
          <CustomTextField
            id="egitimSaati"
            fullWidth
            onChange={(e: any) => setEgitimSaati(e.target.value)}
          />
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
          <CustomTextField
            id="eldeEdilenKredi"
            fullWidth
            onChange={(e: any) => setEldeEdilenKredi(e.target.value)}
          />
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
          <CustomTextField
            id="egitimTuru"
            fullWidth
            onChange={(e: any) => setEgitimTuru(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3}></Grid>
        <Grid item xs={12} sm={9}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleButtonClick}
          >
            Sürekli Eğitim Bilgileri Ekle
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default SurekliEgitimBilgileriEkleForm;
