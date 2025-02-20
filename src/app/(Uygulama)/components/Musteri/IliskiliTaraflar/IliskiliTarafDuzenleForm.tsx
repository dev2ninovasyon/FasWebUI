import { Grid, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import {
  getIliskiliTaraflarById,
  updateIliskiliTaraflar,
} from "@/api/Musteri/MusteriIslemleri";

const IliskiliTarafDuzenleForm = () => {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const idIndex = segments.indexOf("IliskiliTarafDuzenle") + 1;
  const pathId = segments[idIndex];
  const id = pathId;

  const [adi, setAdi] = useState("");

  const router = useRouter();
  const user = useSelector((state: AppState) => state.userReducer);

  const handleButtonClick = async () => {
    const updatedIliskiliTaraflar = {
      adi,
    };
    try {
      const result = await updateIliskiliTaraflar(
        user.token || "",
        id,
        updatedIliskiliTaraflar
      );
      if (result) {
        router.push("/Musteri/IliskiliTaraflar");
      } else {
        console.error("İlişkili Taraf düzenleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const iliskiliTaraflarVerileri = await getIliskiliTaraflarById(
        user.token || "",
        pathId
      );
      setAdi(iliskiliTaraflarVerileri.adi);
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
            htmlFor="adi"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Adı
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="adi"
            value={adi}
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
            İlişkili Taraf Düzenle
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default IliskiliTarafDuzenleForm;
