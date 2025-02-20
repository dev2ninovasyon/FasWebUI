import { Grid, Button } from "@mui/material";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import { createIliskiliTaraflar } from "@/api/Musteri/MusteriIslemleri";

const IliskiliTarafTanimlaForm = () => {
  const [adi, setAdi] = useState("");

  const router = useRouter();
  const user = useSelector((state: AppState) => state.userReducer);
  const denetlenenId = user.denetlenenId;
  const yil = user.yil;

  const handleButtonClick = async () => {
    const createdIliskiliTaraflar = {
      denetlenenId,
      yil,
      adi,
    };
    try {
      const result = await createIliskiliTaraflar(
        user.token || "",
        createdIliskiliTaraflar
      );
      if (result) {
        router.push("/Musteri/IliskiliTaraflar");
      } else {
        console.error("İlişkili Taraf Tanımlama başarısız");
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
            htmlFor="adi"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Adı
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="adi"
            fullWidth
            onChange={(e: any) => setAdi(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3}></Grid>
        <Grid item xs={12} sm={9}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleButtonClick}
          >
            İlişkili Taraf Tanımla
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default IliskiliTarafTanimlaForm;
