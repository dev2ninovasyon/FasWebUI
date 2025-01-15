import { Grid, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getDenetlenenById,
  updateDenetlenen,
} from "@/api/Musteri/MusteriIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";

const MusteriDuzenleForm = () => {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const idIndex = segments.indexOf("MusteriDuzenle") + 1;
  const pathId = segments[idIndex];
  const id = pathId;

  const [firmaAdi, setFirmaAdi] = useState("");
  const [yetkili, setYetkili] = useState("");
  const [tel, setTel] = useState("");
  const [adres, setAdres] = useState("");
  const [email, setEmail] = useState("");
  const [webAdresi, setWebAdresi] = useState("");
  const [ticaretSicilNo, setTicaretSicilNo] = useState("");
  const [vergiDairesi, setVergiDairesi] = useState("");
  const [sektor1Id, setSektor1Id] = useState(0);
  const [sektor2Id, setSektor2Id] = useState(0);
  const [sektor3Id, setSektor3Id] = useState(0);

  const router = useRouter();
  const user = useSelector((state: AppState) => state.userReducer);

  const handleButtonClick = async () => {
    const updatedMusteri = {
      firmaAdi,
      yetkili,
      tel,
      adres,
      email,
      webAdresi,
      ticaretSicilNo,
      vergiDairesi,
      sektor1Id,
      sektor2Id,
      sektor3Id,
    };
    try {
      const result = await updateDenetlenen(
        user.token || "",
        id,
        updatedMusteri
      );
      if (result) {
        router.push("/Musteri/MusteriIslemleri");
      } else {
        console.error("Müşteri düzenleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const musteriVerileri = await getDenetlenenById(user.token || "", pathId);
      setFirmaAdi(musteriVerileri.firmaAdi);
      setYetkili(musteriVerileri.yetkili);
      setTel(musteriVerileri.tel);
      setAdres(musteriVerileri.adres);
      setEmail(musteriVerileri.email);
      setWebAdresi(musteriVerileri.webAdresi);
      setTicaretSicilNo(musteriVerileri.ticaretSicilNo);
      setVergiDairesi(musteriVerileri.vergiDairesi);
      setSektor1Id(musteriVerileri.sektor1Id);
      setSektor2Id(musteriVerileri.sektor2Id);
      setSektor3Id(musteriVerileri.sektor3Id);
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
        {/* 1 */}
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="firmaAdi"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Firma Adı
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="firmaAdi"
            value={firmaAdi}
            fullWidth
            onChange={(e: any) => setFirmaAdi(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="yetkili"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Yetkili
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="yetkili"
            value={yetkili}
            fullWidth
            onChange={(e: any) => setYetkili(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="tel"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Tel
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="tel"
            value={tel}
            fullWidth
            onChange={(e: any) => setTel(e.target.value)}
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
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="email"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Email
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="email"
            value={email}
            fullWidth
            onChange={(e: any) => setEmail(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="webAdresi"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Web Adresi
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="webAdresi"
            value={webAdresi}
            fullWidth
            onChange={(e: any) => setWebAdresi(e.target.value)}
          />
        </Grid>{" "}
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="ticaretSicilNo"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Ticaret Sicil No
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="ticaretSicilNo"
            value={ticaretSicilNo}
            fullWidth
            onChange={(e: any) => setTicaretSicilNo(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="vergiDairesi"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Vergi Dairesi
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="vergiDairesi"
            value={vergiDairesi}
            fullWidth
            onChange={(e: any) => setVergiDairesi(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="sektor1Id"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Sektör 1 Id
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="sektor1Id"
            value={sektor1Id}
            fullWidth
            onChange={(e: any) => setSektor1Id(e.target.value)}
          />
        </Grid>{" "}
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="sektor2Id"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Sektör 2 Id
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="sektor2Id"
            value={sektor2Id}
            fullWidth
            onChange={(e: any) => setSektor2Id(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="sektor3Id"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Sektör 3 Id
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomTextField
            id="sektor3Id"
            value={sektor3Id}
            fullWidth
            onChange={(e: any) => setSektor3Id(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3}></Grid>
        <Grid item xs={12} sm={9}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleButtonClick}
          >
            Müşteri Düzenle
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default MusteriDuzenleForm;
