import { Grid, Button, MenuItem } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  createDenetlenen,
  getDenetlenenKonsolideAnaSirketByDenetciId,
  getSektorKodlari,
} from "@/api/Musteri/MusteriIslemleri";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import CustomSelect from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSelect";

interface Veri {
  id: number;
  firmaAdi: string;
}

interface Veri2 {
  id: number;
  adi: string;
  kirilim: number;
  parentId: number | null;
}

const MusteriEkleForm = () => {
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
  const [konsolideBagliSirketId, setKonsolideBagliSirketId] = useState(0);
  const [sektor1Id, setSektor1Id] = useState(0);
  const [sektor2Id, setSektor2Id] = useState(0);
  const [sektor3Id, setSektor3Id] = useState(0);

  const [sektor1List, setSektor1List] = useState<Veri2[]>([]);
  const [sektor2List, setSektor2List] = useState<Veri2[]>([]);
  const [sektor3List, setSektor3List] = useState<Veri2[]>([]);

  const router = useRouter();
  const user = useSelector((state: AppState) => state.userReducer);
  const denetciId = user.denetciId;

  const [rows, setRows] = useState<Veri[]>([]);

  const handleButtonClick = async () => {
    const createdMusteri = {
      denetciId,
      firmaAdi,
      yetkili,
      tel,
      adres,
      email,
      webAdresi,
      ticaretSicilNo,
      vergiDairesi,
      vergiNo,
      konsolideMi,
      konsolideTipi,
      konsolideBagliSirketId,
      sektor1Id,
      sektor2Id,
      sektor3Id,
    };
    try {
      const result = await createDenetlenen(user.token || "", createdMusteri);
      if (result) {
        router.push("/Musteri/MusteriIslemleri");
      } else {
        console.error("Müşteri ekleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const handleSelectSektor = async (id: number) => {
    try {
      const sektor3 = sektor3List.find((s3) => s3.id === id);
      if (!sektor3) return;

      setSektor3Id(id);

      const sektor2 = sektor2List.find((s2) => s2.id === sektor3?.parentId);
      if (!sektor2) return;

      setSektor2Id(sektor2.id);

      const sektor1 = sektor1List.find((s1) => s1.id === sektor2?.parentId);
      if (!sektor1) return;

      setSektor1Id(sektor1.id);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const konsolideAnaSirketVerileri =
        await getDenetlenenKonsolideAnaSirketByDenetciId(
          user.token || "",
          user.denetciId || 0
        );
      const newRows = konsolideAnaSirketVerileri.map((musteri: any) => ({
        id: musteri.id,
        firmaAdi: musteri.firmaAdi,
      }));
      setRows(newRows);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData2 = async () => {
    try {
      const sektorKodVerileri = await getSektorKodlari(user.token || "");

      const newRows = sektorKodVerileri.map((kod: any) => ({
        id: kod.id,
        adi: kod.adi,
        kirilim: kod.kirilim,
        parentId: kod.parentId ?? null,
      }));

      if (newRows.length > 0) {
        setSektor1List(newRows.filter((item: Veri2) => item.kirilim === 1));
        setSektor2List(newRows.filter((item: Veri2) => item.kirilim === 2));
        setSektor3List(newRows.filter((item: Veri2) => item.kirilim === 3));
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchData2();
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
          <CustomTextField
            id="firmaAdi"
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
            fullWidth
            onChange={(e: any) => setYetkili(e.target.value)}
          />
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
          <CustomTextField
            id="tel"
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
            fullWidth
            onChange={(e: any) => setWebAdresi(e.target.value)}
          />
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
          <CustomTextField
            id="ticaretSicilNo"
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
            fullWidth
            onChange={(e: any) => setVergiDairesi(e.target.value)}
          />
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
          <CustomTextField
            id="vergiNo"
            fullWidth
            onChange={(e: any) => setVergiNo(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="kosolideMi"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Konsolide Mi
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomSelect
            labelId="konsolideMi"
            id="konsolideMi"
            size="small"
            value={konsolideMi}
            fullWidth
            onChange={(e: any) => {
              setKonsolideMi(e.target.value);
            }}
            sx={{
              minWidth: 120,
              "& .MuiSelect-select": {
                height: "28px",
                display: "flex",
                alignItems: "center",
              },
            }}
          >
            <MenuItem value={"Evet"}>Evet</MenuItem>
            <MenuItem value={"Hayır"}>Hayır</MenuItem>
          </CustomSelect>
        </Grid>
        {konsolideMi === "Evet" && (
          <>
            <Grid item xs={12} sm={3} display="flex" alignItems="center">
              <CustomFormLabel
                htmlFor="kosolideTipi"
                sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
              >
                Konsolide Tipi
              </CustomFormLabel>
            </Grid>
            <Grid item xs={12} sm={9}>
              <CustomSelect
                labelId="konsolideTipi"
                id="konsolideTipi"
                size="small"
                value={konsolideTipi}
                fullWidth
                onChange={(e: any) => {
                  setKonsolideTipi(e.target.value);
                }}
                sx={{
                  minWidth: 120,
                  "& .MuiSelect-select": {
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                  },
                }}
              >
                <MenuItem value={"Ana Şirket"}>Ana Şirket</MenuItem>
                <MenuItem value={"Alt Şirket"}>Alt Şirket</MenuItem>
                <MenuItem value={"Yavru Şirket"}>Yavru Şirket</MenuItem>
              </CustomSelect>
            </Grid>
          </>
        )}
        {konsolideMi === "Evet" &&
          (konsolideTipi == "Alt Şirket" ||
            konsolideTipi == "Yavru Şirket") && (
            <>
              <Grid item xs={12} sm={3} display="flex" alignItems="center">
                <CustomFormLabel
                  htmlFor="konsolideBagliSirketId"
                  sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
                >
                  Konsolide Bağlı Olduğu Şirket
                </CustomFormLabel>
              </Grid>
              <Grid item xs={12} sm={9}>
                <CustomSelect
                  labelId="konsolideBagliSirketId"
                  id="konsolideBagliSirketId"
                  size="small"
                  value={konsolideBagliSirketId}
                  fullWidth
                  onChange={(e: any) => {
                    setKonsolideBagliSirketId(e.target.value);
                  }}
                  sx={{
                    minWidth: 120,
                    "& .MuiSelect-select": {
                      height: "28px",
                      display: "flex",
                      alignItems: "center",
                    },
                  }}
                >
                  <MenuItem key={0} value={0}></MenuItem>
                  {rows.map((row: Veri) => (
                    <MenuItem key={row.id} value={row.id}>
                      {row.firmaAdi}
                    </MenuItem>
                  ))}
                </CustomSelect>
              </Grid>
            </>
          )}
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="sektor1Id"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Sektör 1
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomSelect
            labelId="sektor1Id"
            id="sektor1Id"
            size="small"
            value={sektor1Id}
            fullWidth
            disabled
            onChange={(e: any) => {
              setSektor1Id(e.target.value);
            }}
            sx={{
              minWidth: 120,
              "& .MuiSelect-select": {
                height: "28px",
                display: "flex",
                alignItems: "center",
              },
            }}
          >
            <MenuItem value={0}></MenuItem>
            {sektor1List.map((sektor: Veri2) => (
              <MenuItem key={sektor.id} value={sektor.id}>
                {sektor.adi}
              </MenuItem>
            ))}
          </CustomSelect>
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="sektor2Id"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Sektör 2
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomSelect
            labelId="sektor2Id"
            id="sektor2Id"
            size="small"
            value={sektor2Id}
            fullWidth
            disabled
            onChange={(e: any) => {
              setSektor2Id(e.target.value);
            }}
            sx={{
              minWidth: 120,
              "& .MuiSelect-select": {
                height: "28px",
                display: "flex",
                alignItems: "center",
              },
            }}
          >
            <MenuItem value={0}></MenuItem>
            {sektor2List.map((sektor: Veri2) => (
              <MenuItem key={sektor.id} value={sektor.id}>
                {sektor.adi}
              </MenuItem>
            ))}
          </CustomSelect>
        </Grid>
        <Grid item xs={12} sm={3} display="flex" alignItems="center">
          <CustomFormLabel
            htmlFor="sektor3Id"
            sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
          >
            Sektör 3
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <CustomSelect
            labelId="sektor3Id"
            id="sektor3Id"
            size="small"
            value={sektor3Id}
            fullWidth
            onChange={(e: any) => {
              handleSelectSektor(e.target.value);
            }}
            sx={{
              minWidth: 120,
              "& .MuiSelect-select": {
                height: "28px",
                display: "flex",
                alignItems: "center",
              },
            }}
          >
            <MenuItem value={0}>
              <em>Seçiniz</em>
            </MenuItem>
            {sektor3List.map((sektor: Veri2) => (
              <MenuItem key={sektor.id} value={sektor.id}>
                {sektor.adi}
              </MenuItem>
            ))}
          </CustomSelect>
        </Grid>
        <Grid item xs={12} sm={3}></Grid>
        <Grid item xs={12} sm={9}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleButtonClick}
          >
            Müşteri Ekle
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default MusteriEkleForm;
