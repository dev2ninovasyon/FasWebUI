import { Grid, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import {
  getHissedarlarById,
  updateHissedarlar,
} from "@/api/Musteri/MusteriIslemleri";

const HissedarDuzenleForm = () => {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const idIndex = segments.indexOf("HissedarDuzenle") + 1;
  const pathId = segments[idIndex];
  const id = pathId;

  const [hissedarAdi, setHissedarAdi] = useState("");
  const [hisseTutari, setHisseTutari] = useState(0);
  const [paySayisi, setPaySayisi] = useState(0);
  const [hisseOrani, setHisseOrani] = useState(0);

  const router = useRouter();
  const user = useSelector((state: AppState) => state.userReducer);

  const handleButtonClick = async () => {
    const updatedSubeler = {
      hissedarAdi,
      hisseTutari,
      paySayisi,
      hisseOrani,
    };
    try {
      const result = await updateHissedarlar(
        user.token || "",
        id,
        updatedSubeler
      );
      if (result) {
        router.push("/Musteri/Hissedarlar");
      } else {
        console.error("Hissedar düzenleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const hissedarlarVerileri = await getHissedarlarById(
        user.token || "",
        pathId
      );
      setHissedarAdi(hissedarlarVerileri.hissedarAdi);
      setHisseTutari(hissedarlarVerileri.hisseTutari);
      setPaySayisi(hissedarlarVerileri.paySayisi);
      setHisseOrani(hissedarlarVerileri.hisseOrani);
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
            htmlFor="hissedarAdi"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Hissedar Adı
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="hissedarAdi"
            value={hissedarAdi}
            fullWidth
            onChange={(e: any) => setHissedarAdi(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="hisseTutari"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Hisse Tutarı
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="hisseTutari"
            type="number"
            value={hisseTutari}
            fullWidth
            onChange={(e: any) => setHisseTutari(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="paySayisi"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Pay Sayısı
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="paySayisi"
            type="number"
            value={paySayisi}
            fullWidth
            onChange={(e: any) => setPaySayisi(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="hisseOrani"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Hisse Oranı
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="hisseOrani"
            type="number"
            value={hisseOrani}
            fullWidth
            onChange={(e: any) => setHisseOrani(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3}></Grid>
        <Grid item xs={12} sm={9}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleButtonClick}
          >
            Hissedar Düzenle
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default HissedarDuzenleForm;
