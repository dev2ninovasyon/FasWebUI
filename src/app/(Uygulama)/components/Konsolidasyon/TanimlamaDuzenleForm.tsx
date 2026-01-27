import { Grid, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import {
  getTanimlamalarById,
  updateTanimlamalar,
} from "@/api/Konsolidasyon/Konsolidasyon";

const TanimlamaDuzenleForm = () => {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const idIndex = segments.indexOf("TanimlamaDuzenle") + 1;
  const pathId = segments[idIndex];
  const id = pathId;

  const [firmaAdi, setFirmaAdi] = useState("");
  const [yil, setYil] = useState(0);
  const [bagliIstirakOrani, setBagliIstirakOrani] = useState("");

  const router = useRouter();
  const user = useSelector((state: AppState) => state.userReducer);

  const handleButtonClick = async () => {
    const updatedTanimlamalar = {
      firmaAdi,
      yil,
      bagliIstirakOrani,
    };
    try {
      const result = await updateTanimlamalar(
        user.token || "",
        id,
        updatedTanimlamalar
      );
      if (result) {
        router.push("/Konsolidasyon/Tanimlamalar");
      } else {
        console.log("Tanımlama düzenleme başarısız");
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const tanimlamalarVerileri = await getTanimlamalarById(
        user.token || "",
        pathId
      );
      setFirmaAdi(tanimlamalarVerileri.firmaAdi);
      setYil(tanimlamalarVerileri.yil);
      setBagliIstirakOrani(tanimlamalarVerileri.bagliIstirakOrani);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <Grid container spacing={3}>
        <Grid
          display="flex"
          alignItems="center"
          size={{
            xs: 12,
            sm: 3
          }}>
          <CustomFormLabel
            htmlFor="firmaAdi"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Firma Adı
          </CustomFormLabel>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 9
          }}>
          <CustomTextField
            id="firmaAdi"
            value={firmaAdi}
            fullWidth
            disabled
            onChange={(e: any) => setFirmaAdi(e.target.value)}
          />
        </Grid>
        <Grid
          display="flex"
          alignItems="center"
          size={{
            xs: 12,
            sm: 3
          }}>
          <CustomFormLabel
            htmlFor="yil"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Yıl
          </CustomFormLabel>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 9
          }}>
          <CustomTextField
            id="yil"
            value={yil}
            fullWidth
            disabled
            onChange={(e: any) => setYil(e.target.value)}
          />
        </Grid>
        <Grid
          display="flex"
          alignItems="center"
          size={{
            xs: 12,
            sm: 3
          }}>
          <CustomFormLabel
            htmlFor="bagliIstirakOrani"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Bağlı İştirak Oranı
          </CustomFormLabel>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 9
          }}>
          <CustomTextField
            id="bagliIstirakOrani"
            value={bagliIstirakOrani}
            fullWidth
            onChange={(e: any) => setBagliIstirakOrani(e.target.value)}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 3
          }}></Grid>
        <Grid
          size={{
            xs: 12,
            sm: 9
          }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleButtonClick}
          >
            Tanımlama Düzenle
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default TanimlamaDuzenleForm;
