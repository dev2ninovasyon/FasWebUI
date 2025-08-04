import React, { useEffect, useState } from "react";
import {
  Box,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import CalismaKagidiCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/CalismaKagidiCard";
import { Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import { IconX } from "@tabler/icons-react";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import {
  getCalismaKagidiVerileriByDenetciDenetlenenYil,
  updateCalismaKagidiVerisi,
} from "@/api/CalismaKagitlari/CalismaKagitlari";
import dynamic from "next/dynamic";
import CustomSelect from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSelect";

const YorumEditor = dynamic(
  () => import("@/app/(Uygulama)/components/Editor/YorumEditor"),
  {
    ssr: false,
  }
);

interface Veri {
  id: number;
  dipnotNo: string;
  finansalTabloHesaplar: string;
  cari: boolean;
  onceki: boolean;
  gecmis: boolean;
  tamOlma: string;
  dogruluk: string;
  varOlma: string;
  degerleme: string;
  donemsellik: string;
  gecerlilik: string;
  sunumVeAciklama: string;
  onemsizRisk: boolean;
  ciddiRisk: boolean;
  referans: boolean;
  kontrollerinEtkinligininTestEdilmesi: boolean;
  analitikProsedurler: boolean;
  detayTestler: boolean;
  genelDenetimYaklasimi: boolean;
  standartMi: boolean;
}

interface CalismaKagidiProps {
  controller: string;
  dipnotAdi: string; // Ek olarak dipnotAdi prop'u eklendi
  setDip: (str: string) => void;
}

const RiskTespiti: React.FC<CalismaKagidiProps> = ({
  controller,
  dipnotAdi,
  setDip,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [selectedId, setSelectedId] = useState(0);
  const [selectedDipnotNo, setSelectedDipnotNo] = useState("0");
  const [selectedFinansalTabloHesaplar, setSelectedFinansalTabloHesaplar] =
    useState("");
  const [selectedCari, setSelectedCari] = useState(false);
  const [selectedOnceki, setSelectedOnceki] = useState(false);
  const [selectedGecmis, setSelectedGecmis] = useState(false);
  const [selectedTamOlma, setSelectedTamOlma] = useState("0");
  const [selectedDogruluk, setSelectedDogruluk] = useState("0");
  const [selectedVarOlma, setSelectedVarOlma] = useState("0");
  const [selectedDegerleme, setSelectedDegerleme] = useState("0");
  const [selectedDonemsellik, setSelectedDonemsellik] = useState("0");
  const [selectedGecerlilik, setSelectedGecerlilik] = useState("0");
  const [selectedSunumVeAciklama, setSelectedSunumVeAciklama] = useState("0");
  const [selectedOnemsizRisk, setSelectedOnemsizRisk] = useState(false);
  const [selectedCiddiRisk, setSelectedCiddiRisk] = useState(false);
  const [selectedReferans, setSelectedReferans] = useState(false);
  const [
    selectedKontrollerinEtkinligininTestEdilmesi,
    setSelectedKontrollerinEtkinligininTestEdilmesi,
  ] = useState(false);
  const [selectedAnalitikProsedurler, setSelectedAnalitikProsedurler] =
    useState(false);
  const [selectedDetayTestler, setSelectedDetayTestler] = useState(false);
  const [selectedGenelDenetimYaklasimi, setSelectedGenelDenetimYaklasimi] =
    useState(false);
  const [selectedStandartMi, setSelectedStandartMi] = useState(true);

  const [veriler, setVeriler] = useState<Veri[]>([]);

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);

  function normalizeString(str: string): string {
    const turkishChars: { [key: string]: string } = {
      ç: "c",
      ğ: "g",
      ı: "i",
      ö: "o",
      ş: "s",
      ü: "u",
      Ç: "C",
      Ğ: "G",
      İ: "I",
      Ö: "O",
      Ş: "S",
      Ü: "U",
    };

    return str.replace(
      /[çğıöşüÇĞÖŞÜıİ]/g,
      (match) => turkishChars[match] || match
    );
  }

  const handleUpdate = async (
    dipnotNo: string,
    finansalTabloHesaplar: string,
    cari: boolean,
    onceki: boolean,
    gecmis: boolean,
    tamOlma: string,
    dogruluk: string,
    varOlma: string,
    degerleme: string,
    donemsellik: string,
    gecerlilik: string,
    sunumVeAciklama: string,
    onemsizRisk: boolean,
    ciddiRisk: boolean,
    referans: boolean,
    kontrollerinEtkinligininTestEdilmesi: boolean,
    analitikProsedurler: boolean,
    detayTestler: boolean,
    genelDenetimYaklasimi: boolean
  ) => {
    const updatedCalismaKagidiVerisi = veriler.find(
      (veri) => veri.id === selectedId
    );
    if (updatedCalismaKagidiVerisi) {
      updatedCalismaKagidiVerisi.dipnotNo = dipnotNo;
      updatedCalismaKagidiVerisi.finansalTabloHesaplar = finansalTabloHesaplar;
      updatedCalismaKagidiVerisi.cari = cari;
      updatedCalismaKagidiVerisi.onceki = onceki;
      updatedCalismaKagidiVerisi.gecmis = gecmis;
      updatedCalismaKagidiVerisi.tamOlma = tamOlma;
      updatedCalismaKagidiVerisi.dogruluk = dogruluk;
      updatedCalismaKagidiVerisi.varOlma = varOlma;
      updatedCalismaKagidiVerisi.degerleme = degerleme;
      updatedCalismaKagidiVerisi.donemsellik = donemsellik;
      updatedCalismaKagidiVerisi.gecerlilik = gecerlilik;
      updatedCalismaKagidiVerisi.sunumVeAciklama = sunumVeAciklama;
      updatedCalismaKagidiVerisi.onemsizRisk = onemsizRisk;
      updatedCalismaKagidiVerisi.ciddiRisk = ciddiRisk;
      updatedCalismaKagidiVerisi.referans = referans;
      updatedCalismaKagidiVerisi.kontrollerinEtkinligininTestEdilmesi =
        kontrollerinEtkinligininTestEdilmesi;
      updatedCalismaKagidiVerisi.analitikProsedurler = analitikProsedurler;
      updatedCalismaKagidiVerisi.detayTestler = detayTestler;
      updatedCalismaKagidiVerisi.genelDenetimYaklasimi = genelDenetimYaklasimi;

      try {
        const result = await updateCalismaKagidiVerisi(
          controller || "",
          user.token || "",
          selectedId,
          updatedCalismaKagidiVerisi
        );
        if (result) {
          fetchData();
          handleClosePopUp();
        } else {
          console.error("Çalışma Kağıdı Verisi düzenleme başarısız");
        }
      } catch (error) {
        console.error("Bir hata oluştu:", error);
      }
    }
  };

  const fetchData = async () => {
    try {
      const calismaKagidiVerileri =
        await getCalismaKagidiVerileriByDenetciDenetlenenYil(
          controller || "",
          user.token || "",
          user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0
        );

      const rowsAll: any = [];
      calismaKagidiVerileri.forEach((veri: any) => {
        const newRow: Veri = {
          id: veri.id,
          dipnotNo: veri.dipnotNo,
          finansalTabloHesaplar: veri.finansalTabloHesaplar,
          cari: veri.cari,
          onceki: veri.onceki,
          gecmis: veri.gecmis,
          tamOlma: veri.tamOlma,
          dogruluk: veri.dogruluk,
          varOlma: veri.varOlma,
          degerleme: veri.degerleme,
          donemsellik: veri.donemsellik,
          gecerlilik: veri.gecerlilik,
          sunumVeAciklama: veri.sunumVeAciklama,
          onemsizRisk: veri.onemsizRisk,
          ciddiRisk: veri.ciddiRisk,
          referans: veri.referans,
          kontrollerinEtkinligininTestEdilmesi:
            veri.kontrollerinEtkinligininTestEdilmesi,
          analitikProsedurler: veri.analitikProsedurler,
          detayTestler: veri.detayTestler,
          genelDenetimYaklasimi: veri.genelDenetimYaklasimi,
          standartMi: veri.standartmi,
        };

        if (
          normalizeString(
            newRow.finansalTabloHesaplar.replaceAll(" ", "").toLowerCase()
          ) == normalizeString(dipnotAdi.replaceAll(" ", "").toLowerCase())
        ) {
          rowsAll.push(newRow);
          setDip(newRow.finansalTabloHesaplar);
        }
      });
      setVeriler(rowsAll);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const handleCardClick = (veri: any) => {
    setSelectedId(veri.id);
    setSelectedDipnotNo(veri.dipnotNo);
    setSelectedFinansalTabloHesaplar(veri.finansalTabloHesaplar);
    setSelectedCari(veri.cari);
    setSelectedOnceki(veri.onceki);
    setSelectedGecmis(veri.gecmis);
    setSelectedTamOlma(veri.tamOlma);
    setSelectedDogruluk(veri.dogruluk);
    setSelectedVarOlma(veri.varOlma);
    setSelectedDegerleme(veri.degerleme);
    setSelectedDonemsellik(veri.donemsellik);
    setSelectedGecerlilik(veri.gecerlilik);
    setSelectedSunumVeAciklama(veri.sunumVeAciklama);
    setSelectedOnemsizRisk(veri.onemsizRisk);
    setSelectedCiddiRisk(veri.ciddiRisk);
    setSelectedReferans(veri.referans);
    setSelectedKontrollerinEtkinligininTestEdilmesi(
      veri.kontrollerinEtkinligininTestEdilmesi
    );
    setSelectedAnalitikProsedurler(veri.analitikProsedurler);
    setSelectedDetayTestler(veri.detayTestler);
    setSelectedGenelDenetimYaklasimi(veri.genelDenetimYaklasimi);
    setSelectedStandartMi(veri.genelDenetimYaklasimi);
    setIsPopUpOpen(true);
  };

  const handleClosePopUp = () => {
    setIsPopUpOpen(false);
  };

  const handleSetSelectedTamOlma = async (value: string) => {
    setSelectedTamOlma(value);
  };

  const handleSetSelectedDogruluk = async (value: string) => {
    setSelectedDogruluk(value);
  };

  const handleSetSelectedVarOlma = async (value: string) => {
    setSelectedVarOlma(value);
  };

  const handleSetSelectedDegerleme = async (value: string) => {
    setSelectedDegerleme(value);
  };

  const handleSetSelectedDonemsellik = async (value: string) => {
    setSelectedDonemsellik(value);
  };

  const handleSetSelectedGecerlilik = async (value: string) => {
    setSelectedGecerlilik(value);
  };

  const handleSetSelectedSunumVeAciklama = async (value: string) => {
    setSelectedSunumVeAciklama(value);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Grid container>
        <Grid item xs={12} lg={12}>
          <Grid
            container
            sx={{
              width: "95%",
              margin: "0 auto",
              justifyContent: "center",
            }}
          >
            {veriler.map((veri, index) => (
              <Grid
                key={index}
                item
                xs={12}
                lg={12}
                my="20px"
                onClick={() => handleCardClick(veri)}
              >
                <CalismaKagidiCard
                  title={`${veri.finansalTabloHesaplar} Risk Tespiti`}
                  standartMi={veri.standartMi}
                />
              </Grid>
            ))}
          </Grid>
          <YorumEditor></YorumEditor>
        </Grid>
      </Grid>
      {isPopUpOpen && (
        <PopUpComponent
          dipnotNo={selectedDipnotNo}
          finansalTabloHesaplar={selectedFinansalTabloHesaplar}
          cari={selectedCari}
          onceki={selectedOnceki}
          gecmis={selectedGecmis}
          tamOlma={selectedTamOlma}
          dogruluk={selectedDogruluk}
          varOlma={selectedVarOlma}
          degerleme={selectedDegerleme}
          donemsellik={selectedDonemsellik}
          gecerlilik={selectedGecerlilik}
          sunumVeAciklama={selectedSunumVeAciklama}
          onemsizRisk={selectedOnemsizRisk}
          ciddiRisk={selectedCiddiRisk}
          referans={selectedReferans}
          kontrollerinEtkinligininTestEdilmesi={
            selectedKontrollerinEtkinligininTestEdilmesi
          }
          analitikProsedurler={selectedAnalitikProsedurler}
          detayTestler={selectedDetayTestler}
          genelDenetimYaklasimi={selectedGenelDenetimYaklasimi}
          standartMi={selectedStandartMi}
          handleClose={handleClosePopUp}
          handleSetSelectedTamOlma={handleSetSelectedTamOlma}
          handleSetSelectedDogruluk={handleSetSelectedDogruluk}
          handleSetSelectedVarOlma={handleSetSelectedVarOlma}
          handleSetSelectedDegerleme={handleSetSelectedDegerleme}
          handleSetSelectedDonemsellik={handleSetSelectedDonemsellik}
          handleSetSelectedGecerlilik={handleSetSelectedGecerlilik}
          handleSetSelectedSunumVeAciklama={handleSetSelectedSunumVeAciklama}
          handleUpdate={handleUpdate}
          isPopUpOpen={isPopUpOpen}
        />
      )}
    </>
  );
};

export default RiskTespiti;

interface PopUpProps {
  dipnotNo?: string;
  finansalTabloHesaplar?: string;
  cari?: boolean;
  onceki?: boolean;
  gecmis?: boolean;
  tamOlma?: string;
  dogruluk?: string;
  varOlma?: string;
  degerleme?: string;
  donemsellik?: string;
  gecerlilik?: string;
  sunumVeAciklama?: string;
  onemsizRisk?: boolean;
  ciddiRisk?: boolean;
  referans?: boolean;
  kontrollerinEtkinligininTestEdilmesi?: boolean;
  analitikProsedurler?: boolean;
  detayTestler?: boolean;
  genelDenetimYaklasimi?: boolean;
  standartMi?: boolean;

  isPopUpOpen: boolean;

  handleClose: () => void;
  handleSetSelectedTamOlma: (a: string) => void;
  handleSetSelectedDogruluk: (a: string) => void;
  handleSetSelectedVarOlma: (a: string) => void;
  handleSetSelectedDegerleme: (a: string) => void;
  handleSetSelectedDonemsellik: (a: string) => void;
  handleSetSelectedGecerlilik: (a: string) => void;
  handleSetSelectedSunumVeAciklama: (a: string) => void;
  handleUpdate: (
    dipnotNo: string,
    finansalTabloHesaplar: string,
    cari: boolean,
    onceki: boolean,
    gecmis: boolean,
    tamOlma: string,
    dogruluk: string,
    varOlma: string,
    degerleme: string,
    donemsellik: string,
    gecerlilik: string,
    sunumVeAciklama: string,
    onemsizRisk: boolean,
    ciddiRisk: boolean,
    referans: boolean,
    kontrollerinEtkinligininTestEdilmesi: boolean,
    analitikProsedurler: boolean,
    detayTestler: boolean,
    genelDenetimYaklasimi: boolean
  ) => void;
}

const PopUpComponent: React.FC<PopUpProps> = ({
  dipnotNo,
  finansalTabloHesaplar,
  cari,
  onceki,
  gecmis,
  tamOlma,
  dogruluk,
  varOlma,
  degerleme,
  donemsellik,
  gecerlilik,
  sunumVeAciklama,
  onemsizRisk,
  ciddiRisk,
  referans,
  kontrollerinEtkinligininTestEdilmesi,
  analitikProsedurler,
  detayTestler,
  genelDenetimYaklasimi,
  standartMi,
  isPopUpOpen,
  handleClose,
  handleSetSelectedTamOlma,
  handleSetSelectedDogruluk,
  handleSetSelectedVarOlma,
  handleSetSelectedDegerleme,
  handleSetSelectedDonemsellik,
  handleSetSelectedGecerlilik,
  handleSetSelectedSunumVeAciklama,
  handleUpdate,
}) => {
  return (
    <Dialog fullWidth maxWidth={"md"} open={isPopUpOpen} onClose={handleClose}>
      {isPopUpOpen && (
        <>
          <DialogContent className="testdialog" sx={{ overflow: "visible" }}>
            <Stack
              direction="row"
              spacing={2}
              justifyContent={"space-between"}
              alignItems="center"
            >
              <Typography variant="h4" py={1} px={3}>
                Düzenle
              </Typography>
              <IconButton size="small" onClick={handleClose}>
                <IconX size="18" />
              </IconButton>
            </Stack>
          </DialogContent>
          <Divider />
          <DialogContent>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                {finansalTabloHesaplar} Tespit Edilen Riskler
              </Typography>
              <Box px={1} pt={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={12} lg={12}>
                    <Grid container>
                      <Grid
                        item
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        xs={6}
                        sm={6}
                        lg={6}
                      >
                        <Typography variant="h6">Tam Olma</Typography>
                      </Grid>
                      <Grid
                        item
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        xs={6}
                        sm={6}
                        lg={6}
                      >
                        <CustomSelect
                          labelId="tamOlma"
                          id="tamOlma"
                          size="small"
                          value={tamOlma}
                          fullWidth
                          onChange={(e: any) => {
                            handleSetSelectedTamOlma(e.target.value);
                          }}
                          height="36px"
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value={"0"}>Yok</MenuItem>
                          <MenuItem value={"1"}>Önemsiz</MenuItem>
                          <MenuItem value={"2"}>Orta</MenuItem>
                          <MenuItem value={"3"}>Yüksek</MenuItem>
                        </CustomSelect>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sm={12} lg={12}>
                    <Grid container>
                      <Grid
                        item
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        xs={6}
                        sm={6}
                        lg={6}
                      >
                        <Typography variant="h6">Doğruluk</Typography>
                      </Grid>
                      <Grid
                        item
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        xs={6}
                        sm={6}
                        lg={6}
                      >
                        <CustomSelect
                          labelId="dogruluk"
                          id="dogruluk"
                          size="small"
                          value={dogruluk}
                          fullWidth
                          onChange={(e: any) => {
                            handleSetSelectedDogruluk(e.target.value);
                          }}
                          height="36px"
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value={"0"}>Yok</MenuItem>
                          <MenuItem value={"1"}>Önemsiz</MenuItem>
                          <MenuItem value={"2"}>Orta</MenuItem>
                          <MenuItem value={"3"}>Yüksek</MenuItem>
                        </CustomSelect>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sm={12} lg={12}>
                    <Grid container>
                      <Grid
                        item
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        xs={6}
                        sm={6}
                        lg={6}
                      >
                        <Typography variant="h6">Var Olma</Typography>
                      </Grid>
                      <Grid
                        item
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        xs={6}
                        sm={6}
                        lg={6}
                      >
                        <CustomSelect
                          labelId="varOlma"
                          id="varOlma"
                          size="small"
                          value={varOlma}
                          fullWidth
                          onChange={(e: any) => {
                            handleSetSelectedVarOlma(e.target.value);
                          }}
                          height="36px"
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value={"0"}>Yok</MenuItem>
                          <MenuItem value={"1"}>Önemsiz</MenuItem>
                          <MenuItem value={"2"}>Orta</MenuItem>
                          <MenuItem value={"3"}>Yüksek</MenuItem>
                        </CustomSelect>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sm={12} lg={12}>
                    <Grid container>
                      <Grid
                        item
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        xs={6}
                        sm={6}
                        lg={6}
                      >
                        <Typography variant="h6">Değerleme</Typography>
                      </Grid>
                      <Grid
                        item
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        xs={6}
                        sm={6}
                        lg={6}
                      >
                        <CustomSelect
                          labelId="degerleme"
                          id="degerleme"
                          size="small"
                          value={degerleme}
                          fullWidth
                          onChange={(e: any) => {
                            handleSetSelectedDegerleme(e.target.value);
                          }}
                          height="36px"
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value={"0"}>Yok</MenuItem>
                          <MenuItem value={"1"}>Önemsiz</MenuItem>
                          <MenuItem value={"2"}>Orta</MenuItem>
                          <MenuItem value={"3"}>Yüksek</MenuItem>
                        </CustomSelect>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sm={12} lg={12}>
                    <Grid container>
                      <Grid
                        item
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        xs={6}
                        sm={6}
                        lg={6}
                      >
                        <Typography variant="h6">Dönemsellik</Typography>
                      </Grid>
                      <Grid
                        item
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        xs={6}
                        sm={6}
                        lg={6}
                      >
                        <CustomSelect
                          labelId="donemsellik"
                          id="donemsellik"
                          size="small"
                          value={donemsellik}
                          fullWidth
                          onChange={(e: any) => {
                            handleSetSelectedDonemsellik(e.target.value);
                          }}
                          height="36px"
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value={"0"}>Yok</MenuItem>
                          <MenuItem value={"1"}>Önemsiz</MenuItem>
                          <MenuItem value={"2"}>Orta</MenuItem>
                          <MenuItem value={"3"}>Yüksek</MenuItem>
                        </CustomSelect>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sm={12} lg={12}>
                    <Grid container>
                      <Grid
                        item
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        xs={6}
                        sm={6}
                        lg={6}
                      >
                        <Typography variant="h6">Geçerlilik</Typography>
                      </Grid>
                      <Grid
                        item
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        xs={6}
                        sm={6}
                        lg={6}
                      >
                        <CustomSelect
                          labelId="gecerlilik"
                          id="gecerlilik"
                          size="small"
                          value={gecerlilik}
                          fullWidth
                          onChange={(e: any) => {
                            handleSetSelectedGecerlilik(e.target.value);
                          }}
                          height="36px"
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value={"0"}>Yok</MenuItem>
                          <MenuItem value={"1"}>Önemsiz</MenuItem>
                          <MenuItem value={"2"}>Orta</MenuItem>
                          <MenuItem value={"3"}>Yüksek</MenuItem>
                        </CustomSelect>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sm={12} lg={12}>
                    <Grid container>
                      <Grid
                        item
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        xs={6}
                        sm={6}
                        lg={6}
                      >
                        <Typography variant="h6">Sunum ve Açıklama</Typography>
                      </Grid>
                      <Grid
                        item
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        xs={6}
                        sm={6}
                        lg={6}
                      >
                        <CustomSelect
                          labelId="sunumVeAciklama"
                          id="sunumVeAciklama"
                          size="small"
                          value={sunumVeAciklama}
                          fullWidth
                          onChange={(e: any) => {
                            handleSetSelectedSunumVeAciklama(e.target.value);
                          }}
                          height="36px"
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value={"0"}>Yok</MenuItem>
                          <MenuItem value={"1"}>Önemsiz</MenuItem>
                          <MenuItem value={"2"}>Orta</MenuItem>
                          <MenuItem value={"3"}>Yüksek</MenuItem>
                        </CustomSelect>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
            <Button
              variant="outlined"
              color="success"
              onClick={() =>
                handleUpdate(
                  dipnotNo || "",
                  finansalTabloHesaplar || "",
                  cari || false,
                  onceki || false,
                  gecmis || false,
                  tamOlma || "0",
                  dogruluk || "0",
                  varOlma || "0",
                  degerleme || "0",
                  donemsellik || "0",
                  gecerlilik || "0",
                  sunumVeAciklama || "0",
                  onemsizRisk || false,
                  ciddiRisk || false,
                  referans || false,
                  kontrollerinEtkinligininTestEdilmesi || false,
                  analitikProsedurler || false,
                  detayTestler || false,
                  genelDenetimYaklasimi || false
                )
              }
              sx={{ width: "20%" }}
            >
              Kaydet
            </Button>{" "}
            <Button
              variant="outlined"
              color="error"
              onClick={handleClose}
              sx={{ width: "20%" }}
            >
              Kapat
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};
