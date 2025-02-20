import { Grid, Button } from "@mui/material";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { createSirketYonetimKadrosu } from "@/api/Musteri/MusteriIslemleri";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";

const SirketYonetimKadrosuEkleForm = () => {
  const [uyeAdiSoyadi, setUyeAdiSoyadi] = useState("");
  const [uyeUnvani, setUyeUnvani] = useState("");

  const router = useRouter();
  const user = useSelector((state: AppState) => state.userReducer);
  const denetlenenId = user.denetlenenId;

  const handleButtonClick = async () => {
    const createdSirketYonetimKadrosu = {
      denetlenenId,
      uyeAdiSoyadi,
      uyeUnvani,
    };
    try {
      const result = await createSirketYonetimKadrosu(
        user.token || "",
        createdSirketYonetimKadrosu
      );
      if (result) {
        router.push("/Musteri/SirketYonetimKadrosu");
      } else {
        console.error("Şirket Yönetim Kadrosu ekleme başarısız");
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
            htmlFor="uyeAdiSoyadi"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Üye Adı Soyadı
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="uyeAdiSoyadi"
            fullWidth
            onChange={(e: any) => setUyeAdiSoyadi(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="uyeUnvani"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Üye Ünvanı
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="uyeUnvani"
            fullWidth
            onChange={(e: any) => setUyeUnvani(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3}></Grid>
        <Grid item xs={12} sm={9}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleButtonClick}
          >
            Şirket Yönetim Kadrosu Ekle
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default SirketYonetimKadrosuEkleForm;
