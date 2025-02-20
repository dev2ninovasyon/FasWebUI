import { Grid, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import {
  getSirketYonetimKadrosuById,
  updateSirketYonetimKadrosu,
} from "@/api/Musteri/MusteriIslemleri";

const SirketYonetimKadrosuDuzenleForm = () => {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const idIndex = segments.indexOf("SirketYonetimKadrosuDuzenle") + 1;
  const pathId = segments[idIndex];
  const id = pathId;

  const [uyeAdiSoyadi, setUyeAdiSoyadi] = useState("");
  const [uyeUnvani, setUnvani] = useState("");

  const router = useRouter();
  const user = useSelector((state: AppState) => state.userReducer);

  const handleButtonClick = async () => {
    const updatedSirketYonetimKadrosu = {
      uyeAdiSoyadi,
      uyeUnvani,
    };
    try {
      const result = await updateSirketYonetimKadrosu(
        user.token || "",
        id,
        updatedSirketYonetimKadrosu
      );
      if (result) {
        router.push("/Musteri/SirketYonetimKadrosu");
      } else {
        console.error("Şirket Yönetim Kadrosu düzenleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const sirketYonetimKadrosuVerileri = await getSirketYonetimKadrosuById(
        user.token || "",
        pathId
      );
      setUyeAdiSoyadi(sirketYonetimKadrosuVerileri.uyeAdiSoyadi);
      setUnvani(sirketYonetimKadrosuVerileri.uyeUnvani);
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
            htmlFor="uyeAdiSoyadi"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Üye Adı Soyadı
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="uyeAdiSoyadi"
            value={uyeAdiSoyadi}
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
            value={uyeUnvani}
            fullWidth
            onChange={(e: any) => setUnvani(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3}></Grid>
        <Grid item xs={12} sm={9}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleButtonClick}
          >
            Şirket Yönetim Kadrosu Düzenle
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default SirketYonetimKadrosuDuzenleForm;
