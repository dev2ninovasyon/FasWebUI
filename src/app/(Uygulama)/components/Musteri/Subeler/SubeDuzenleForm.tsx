import { Grid, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import { getSubelerById, updateSubeler } from "@/api/Musteri/MusteriIslemleri";

const SubeDuzenleForm = () => {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const idIndex = segments.indexOf("SubeDuzenle") + 1;
  const pathId = segments[idIndex];
  const id = pathId;

  const [unvan, setUnvan] = useState("");
  const [subeAdi, setSubeAdi] = useState("");
  const [adres, setAdres] = useState("");

  const router = useRouter();
  const user = useSelector((state: AppState) => state.userReducer);

  const handleButtonClick = async () => {
    const updatedSubeler = {
      unvan,
      subeAdi,
      adres,
    };
    try {
      const result = await updateSubeler(user.token || "", id, updatedSubeler);
      if (result) {
        router.push("/Musteri/Subeler");
      } else {
        console.error("Şube düzenleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const subelerVerileri = await getSubelerById(user.token || "", pathId);
      setUnvan(subelerVerileri.unvan);
      setSubeAdi(subelerVerileri.subeAdi);
      setAdres(subelerVerileri.adres);
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
            htmlFor="unvan"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Ünvan
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="unvan"
            value={unvan}
            fullWidth
            onChange={(e: any) => setUnvan(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="subeAdi"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Şube Adı
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="subeAdi"
            value={subeAdi}
            fullWidth
            onChange={(e: any) => setSubeAdi(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="adres"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Adres
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="adres"
            value={adres}
            fullWidth
            onChange={(e: any) => setAdres(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3}></Grid>
        <Grid item xs={12} sm={9}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleButtonClick}
          >
            Şube Düzenle
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default SubeDuzenleForm;
