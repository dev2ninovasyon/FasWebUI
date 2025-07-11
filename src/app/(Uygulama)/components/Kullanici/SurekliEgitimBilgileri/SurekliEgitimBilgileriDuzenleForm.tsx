import { Grid, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  getSurekliEgitimBilgileriById,
  updateSurekliEgitimBilgileri,
} from "@/api/Kullanici/SurekliEgitimBilgileri";
import KullaniciBoxAutocomplete from "@/app/(Uygulama)/components/Sozlesme/DenetimKadrosuAtama/AutoCompleteBox/KullaniciBoxAutoComplete";

const SurekliEgitimBilgileriDuzenleForm = () => {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const idIndex = segments.indexOf("SurekliEgitimBilgileriDuzenle") + 1;
  const pathId = segments[idIndex];

  const id = pathId;
  const [personelId, setPersonelId] = useState(0);
  const [personelAdi, setPersonelAdi] = useState("");
  const [sertifikaAdi, setSertifikaAdi] = useState("");
  const [egitimBaslangicTarihi, setEgitimBaslangicTarihi] = useState("");
  const [egitimBitisTarihi, setEgitimBitisTarihi] = useState("");
  const [egitimSaati, setEgitimSaati] = useState(0);
  const [eldeEdilenKredi, setEldeEdilenKredi] = useState(0);
  const [egitimTuru, setEgitimTuru] = useState("");

  const user = useSelector((state: AppState) => state.userReducer);
  const router = useRouter();

  const handleButtonClick = async () => {
    const updatedSurekliEgitimBilgileri = {
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
      const result = await updateSurekliEgitimBilgileri(
        user.token || "",
        id,
        updatedSurekliEgitimBilgileri
      );
      if (result) {
        router.push("/Kullanici/SurekliEgitimBilgileri");
      } else {
        console.error("Sürekli Eğitim Bilgileri düzenleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const surekliEgitimBilgileriVerileri =
        await getSurekliEgitimBilgileriById(user.token || "", pathId);
      setPersonelId(surekliEgitimBilgileriVerileri.personelId);
      setPersonelAdi(surekliEgitimBilgileriVerileri.personelAdi);
      setSertifikaAdi(surekliEgitimBilgileriVerileri.sertifikaAdi);
      setEgitimBaslangicTarihi(
        surekliEgitimBilgileriVerileri.egitimBaslangicTarihi.split("T")[0]
      );
      setEgitimBitisTarihi(
        surekliEgitimBilgileriVerileri.egitimBitisTarihi.split("T")[0]
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
          <KullaniciBoxAutocomplete
            initialValue={personelAdi}
            onSelectAdi={(selectedPersonelAdi) =>
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
            value={sertifikaAdi}
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
            value={egitimBaslangicTarihi}
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
            value={egitimBitisTarihi}
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
            value={egitimSaati}
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
            value={eldeEdilenKredi}
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
            value={egitimTuru}
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
            Sürekli Eğitim Bilgileri Düzenle
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default SurekliEgitimBilgileriDuzenleForm;
