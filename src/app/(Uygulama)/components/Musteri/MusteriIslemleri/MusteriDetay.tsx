import { Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getDenetlenenById } from "@/api/Musteri/MusteriIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";

const MusteriDetay = () => {
  const [firmaAdi, setFirmaAdi] = useState("");
  const [yetkili, setYetkili] = useState("");
  const [tel, setTel] = useState("");
  const [adres, setAdres] = useState("");
  const [email, setEmail] = useState("");
  const [webAdresi, setWebAdresi] = useState("");
  const [ticaretSicilNo, setTicaretSicilNo] = useState("");
  const [vergiDairesi, setVergiDairesi] = useState("");
  const [vergiNo, setVergiNo] = useState("");
  const [konsolideMi, setKonsolideMi] = useState("Hayır");
  const [konsolideTipi, setKonsolideTipi] = useState("Ana Şirket");
  const [konsolideBagliSirketAdi, setKonsolideBagliSirketAdi] = useState("");
  const [sektor1Id, setSktor1Id] = useState(0);
  const [sektor2Id, setSektor2Id] = useState(0);
  const [sektor3Id, setSektor3Id] = useState(0);

  const pathname = usePathname();
  const segments = pathname.split("/");
  const idIndex = segments.indexOf("MusteriDetay") + 1;
  const pathId = segments[idIndex];

  const user = useSelector((state: AppState) => state.userReducer);

  const fetchData = async () => {
    try {
      const result = await getDenetlenenById(user.token || "", pathId);
      setFirmaAdi(result.firmaAdi);
      setYetkili(result.yetkili);
      setTel(result.tel);
      setAdres(result.adres);
      setEmail(result.email);
      setWebAdresi(result.webAdresi);
      setTicaretSicilNo(result.ticaretSicilNo);
      setVergiDairesi(result.vergiDairesi);
      setVergiNo(result.vergiNo);
      setKonsolideMi(result.konsolide ? "Evet" : "Hayır");
      setKonsolideTipi(
        result.konsolideAnaSirketmi
          ? "Ana Şirket"
          : result.konsolideAltSirketmi
          ? "Alt Şirket"
          : result.konsolideYavruSirketmi
          ? "Yavru Şirket"
          : "Ana Şirket"
      );
      setSktor1Id(result.sektor1Id);
      setSektor2Id(result.sektor2Id);
      setSektor3Id(result.sektor3Id);

      if (result.konsolideBagliSirketId != 0) {
        const result2 = await getDenetlenenById(
          user.token || "",
          result.konsolideBagliSirketId
        );

        setKonsolideBagliSirketAdi(result2.firmaAdi);
      }
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
            htmlFor="firmaAdi"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Firma Adı
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <Typography textAlign="left" variant="h6">
            {firmaAdi}
          </Typography>
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
          <Typography textAlign="left" variant="h6">
            {yetkili}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="tel"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Telefon
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <Typography textAlign="left" variant="h6">
            {tel}
          </Typography>
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
          <Typography textAlign="left" variant="h6">
            {adres}
          </Typography>
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
          <Typography textAlign="left" variant="h6">
            {email}
          </Typography>
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
          <Typography textAlign="left" variant="h6">
            {webAdresi}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="ticaretSicilNo"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Ticaret Sicil No
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <Typography textAlign="left" variant="h6">
            {ticaretSicilNo}
          </Typography>
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
          <Typography textAlign="left" variant="h6">
            {vergiDairesi}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="vergiNo"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Vergi No
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <Typography textAlign="left" variant="h6">
            {vergiNo}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="konsolideMi"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Konsolide Mi
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <Typography textAlign="left" variant="h6">
            {konsolideMi}
          </Typography>
        </Grid>
        {konsolideMi === "Evet" && (
          <>
            <Grid item xs={12} sm={3} display="flex" alignItems="center">
              <CustomFormLabel
                htmlFor="konsolideTipi"
                sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
              >
                Konsolide Tipi
              </CustomFormLabel>
            </Grid>
            <Grid item xs={12} sm={9}>
              <Typography textAlign="left" variant="h6">
                {konsolideTipi}
              </Typography>
            </Grid>
          </>
        )}
        {konsolideMi === "Evet" &&
          (konsolideTipi == "Alt Şirket" ||
            konsolideTipi == "Yavru Şirket") && (
            <>
              <Grid item xs={12} sm={3} display="flex" alignItems="center">
                <CustomFormLabel
                  htmlFor="konsolideBagliSirketAdi"
                  sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
                >
                  Konsolide Bağlı Olduğu Şirket
                </CustomFormLabel>
              </Grid>
              <Grid item xs={12} sm={9}>
                <Typography textAlign="left" variant="h6">
                  {konsolideBagliSirketAdi}
                </Typography>
              </Grid>
            </>
          )}

        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="sektor1Id"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Sektör 1 Id
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <Typography textAlign="left" variant="h6">
            {sektor1Id}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="sektor2Id"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Sektör 2 Id
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <Typography textAlign="left" variant="h6">
            {sektor2Id}
          </Typography>
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
          <Typography textAlign="left" variant="h6">
            {sektor3Id}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={3}></Grid>
      </Grid>
    </div>
  );
};

export default MusteriDetay;
