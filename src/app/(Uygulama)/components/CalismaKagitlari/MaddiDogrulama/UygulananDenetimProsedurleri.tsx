import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CalismaKagidiCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/CalismaKagidiCard";
import { Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import { IconX } from "@tabler/icons-react";
import { AppState } from "@/store/store";
import BelgeKontrolCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCard";
import { useSelector } from "@/store/hooks";
import {
  createCalismaKagidiVerisi,
  deleteAllCalismaKagidiVerileri,
  deleteCalismaKagidiVerisiById,
  updateCalismaKagidiVerisi,
} from "@/api/MaddiDogrulama/MaddiDogrulama";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import { ConfirmPopUpComponent } from "@/app/(Uygulama)/components/CalismaKagitlari/ConfirmPopUp";
import { getUygulananDenetimProsedurleri } from "@/api/MaddiDogrulama/MaddiDogrulama";
import Autocomplete from "@mui/material/Autocomplete";
import dynamic from "next/dynamic";
const MaddiDogrulamaKonuEditor = dynamic(
  () => import("@/app/(Uygulama)/components/Editor/MaddiDogrulamaKonuEditor"),
  { ssr: false }
);
const YorumEditor = dynamic(
  () => import("@/app/(Uygulama)/components/Editor/YorumEditor"),
  {
    ssr: false,
  }
);
const MaddiDogrulamaAciklamaEditor = dynamic(
  () =>
    import("@/app/(Uygulama)/components/Editor/MaddiDogrulamaAciklamaEditor"),
  { ssr: false }
);

interface Veri {
  id: number;
  kategori: string;
  konu: string;
  aciklama: string;
  standartMi: boolean;
}

interface CalismaKagidiProps {
  controller: string;
  isClickedVarsayılanaDon: boolean;
  alanAdi1: string;
  alanAdi2: string;
  alanAdi3: string;

  setIsClickedVarsayılanaDon: (deger: boolean) => void;
  setTamamlanan: (deger: number) => void;
  setToplam: (deger: number) => void;
  dipnotAdi: string; // Ek olarak dipnotAdi prop'u eklendi
  setDip: (str: string) => void;
}

const UygulananDentimProsedurleri: React.FC<CalismaKagidiProps> = ({
  controller,
  alanAdi1,
  alanAdi2,
  alanAdi3,
  isClickedVarsayılanaDon,
  setIsClickedVarsayılanaDon,
  setTamamlanan,
  setToplam,
  dipnotAdi,
  setDip,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const [selectedId, setSelectedId] = useState(0);
  const [selectedKategori, setSelectedKategori] = useState("");
  const [selectedKonu, setSelectedKonu] = useState("");
  const [selectedAciklama, setSelectedAciklama] = useState("");
  const [veriler, setVeriler] = useState<Veri[]>([]);
  const [isNew, setIsNew] = useState(false);
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);

  //const router = useRouter();

  const handleCreate = async (
    kategori: string,
    konu: string,
    aciklama: string
  ) => {
    const createdCalismaKagidiVerisi = {
      denetlenenId: user.denetlenenId,
      denetciId: user.denetciId,
      yil: user.yil,
      kategori: kategori,
      konu: konu,
      aciklama: aciklama,
    };
    try {
      const result = await createCalismaKagidiVerisi(
        user.token || "",
        createdCalismaKagidiVerisi
      );
      if (result) {
        fetchData();
        handleClosePopUp();
        setIsNew(false);
      } else {
        console.error("Çalışma Kağıdı Verisi ekleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const handleUpdate = async (
    kategori: string,
    konu: string,
    aciklama: string
  ) => {
    const updatedCalismaKagidiVerisi = veriler.find(
      (veri) => veri.id === selectedId
    );
    if (updatedCalismaKagidiVerisi) {
      updatedCalismaKagidiVerisi.kategori = kategori;
      updatedCalismaKagidiVerisi.konu = konu;
      updatedCalismaKagidiVerisi.aciklama = aciklama;

      try {
        const result = await updateCalismaKagidiVerisi(
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

  const handleDelete = async () => {
    try {
      const result = await deleteCalismaKagidiVerisiById(
        controller || "",
        user.token || "",
        selectedId
      );
      if (result) {
        fetchData();
        handleClosePopUp();
      } else {
        console.error("Çalışma Kağıdı Verisi silme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      const result = await deleteAllCalismaKagidiVerileri(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        dipnotAdi || "",
        user.tfrsmi || false
      );
      if (result) {
        fetchData();
      } else {
        console.error("Çalışma Kağıdı Verileri silme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const calismaKagidiVerileri = await getUygulananDenetimProsedurleri(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        dipnotAdi || "",
        user.tfrsmi || false
      );

      const rowsAll: any = [];
      const tamamlanan: any[] = [];
      const toplam: any[] = [];

      calismaKagidiVerileri.forEach((veri: any) => {
        setDip(veri.dipnotAdi);
        const newRow: Veri = {
          id: veri.id,
          kategori: veri.kategori,
          konu: veri.konu,
          aciklama: veri.aciklama,
          standartMi: veri.standartmi,
        };
        rowsAll.push(newRow);

        if (newRow.standartMi) {
          toplam.push(newRow);
        } else {
          tamamlanan.push(newRow);
          toplam.push(newRow);
        }
      });
      setVeriler(rowsAll);
      setToplam(toplam.length);
      setTamamlanan(tamamlanan.length);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const handleCardClick = (veri: any) => {
    setSelectedId(veri.id);
    setSelectedKategori(veri.kategori);
    setSelectedKonu(veri.konu);
    setSelectedAciklama(veri.aciklama);

    setIsPopUpOpen(true);
  };

  const handleNew = () => {
    setIsNew(true);
    setSelectedKategori("");
    setSelectedKonu("");
    setSelectedAciklama("");
    setIsPopUpOpen(true);
  };

  const handleClosePopUp = () => {
    setIsPopUpOpen(false);
  };

  const handleSetSelectedKategori = async (kategori: any) => {
    setSelectedKategori(kategori);
  };

  const handleSetSelectedKonu = async (konu: any) => {
    setSelectedKonu(konu);
  };
  const handleSetSelectedAciklama = async (aciklama: any) => {
    setSelectedAciklama(aciklama);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isClickedVarsayılanaDon) {
      handleDeleteAll();
      setIsClickedVarsayılanaDon(false);
    }
  }, [isClickedVarsayılanaDon]);

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
                mt="20px"
                onClick={() => handleCardClick(veri)}
              >
                <CalismaKagidiCard
                  title={`${index + 1}. ${veri.kategori || "Kategori seçiniz"}`}
                  content={veri.konu
                    .replaceAll("<p>", "")
                    .replaceAll("</p>", "")}
                  standartMi={veri.standartMi}
                />
              </Grid>
            ))}
          </Grid>
          <Grid
            container
            sx={{
              width: "95%",
              margin: "0 auto",
              justifyContent: "end",
            }}
          >
            <Grid
              item
              xs={12}
              lg={1.5}
              my={2}
              sx={{
                display: "flex",
                justifyContent: "end",
              }}
            >
              <Button
                size="medium"
                variant="outlined"
                color="primary"
                onClick={() => handleNew()}
                sx={{
                  width: "100%",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    overflowWrap: "break-word",
                    wordWrap: "break-word",
                  }}
                >
                  Yeni İşlem Ekle
                </Typography>
              </Button>
            </Grid>
          </Grid>
          <YorumEditor></YorumEditor>
        </Grid>

        <Grid
          container
          sx={{
            width: "95%",
            margin: "0 auto",
            justifyContent: "space-between",
          }}
        >
          <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
            <BelgeKontrolCard hazirlayan="Ahmet Geçmiş"></BelgeKontrolCard>
          </Grid>
          <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
            <BelgeKontrolCard onaylayan="Ahmet Geçmiş"></BelgeKontrolCard>
          </Grid>
          <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
            <BelgeKontrolCard kaliteKontrol="Ahmet Geçmiş"></BelgeKontrolCard>
          </Grid>
        </Grid>
        <Grid
          container
          sx={{
            width: "95%",
            margin: "0 auto",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Grid item xs={12} lg={12} mt={5}>
            <IslemlerCard controller={controller} />
          </Grid>
        </Grid>
      </Grid>
      {isPopUpOpen && (
        <PopUpComponent
          kategori={selectedKategori}
          konu={selectedKonu}
          aciklama={selectedAciklama}
          alanAdi1={alanAdi1}
          alanAdi2={alanAdi2}
          alanAdi3={alanAdi3}
          handleClose={handleClosePopUp}
          handleSetSelectedKategori={handleSetSelectedKategori}
          handleSetSelectedKonu={handleSetSelectedKonu}
          handleSetSelectedAciklama={handleSetSelectedAciklama}
          handleCreate={handleCreate}
          handleDelete={handleDelete}
          handleUpdate={handleUpdate}
          isPopUpOpen={isPopUpOpen}
          isNew={isNew}
        />
      )}
    </>
  );
};

export default UygulananDentimProsedurleri;

interface PopUpProps {
  kategori?: string;
  konu?: string;
  aciklama?: string;
  alanAdi1?: string;
  alanAdi2?: string;
  alanAdi3?: string;
  isPopUpOpen: boolean;
  isNew: boolean;

  handleClose: () => void;
  handleSetSelectedKategori: (a: string) => void;
  handleSetSelectedKonu: (a: string) => void;
  handleSetSelectedAciklama: (a: string) => void;
  handleCreate: (kategori: string, konu: string, aciklama: string) => void;
  handleDelete: () => void;
  handleUpdate: (kategori: string, konu: string, aciklama: string) => void;
}

const PopUpComponent: React.FC<PopUpProps> = ({
  kategori,
  konu,
  aciklama,
  alanAdi1,
  alanAdi2,
  alanAdi3,
  isPopUpOpen,
  isNew,
  handleClose,
  handleSetSelectedKategori,
  handleSetSelectedKonu,
  handleSetSelectedAciklama,
  handleCreate,
  handleDelete,
  handleUpdate,
}) => {
  const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = useState(false);
  const handleIsConfirm = () => {
    setIsConfirmPopUpOpen(!isConfirmPopUpOpen);
  };
  return (
    <Dialog fullWidth maxWidth={"lg"} open={isPopUpOpen} onClose={handleClose}>
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
                {alanAdi1}
              </Typography>
              <KategoriBoxAutocomplete
                onSelect={(selectedKategori) =>
                  handleSetSelectedKategori(selectedKategori)
                }
                initialValue={kategori || ""}
              ></KategoriBoxAutocomplete>
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                {alanAdi2}
              </Typography>
              <MaddiDogrulamaKonuEditor
                konu={konu}
                handleSetSelectedKonu={handleSetSelectedKonu}
              />
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                {alanAdi3}
              </Typography>
              <MaddiDogrulamaAciklamaEditor
                aciklama={aciklama}
                handleSetSelectedAciklama={handleSetSelectedAciklama}
              />
            </Box>
          </DialogContent>
          {!isNew ? (
            <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
              <Button
                variant="outlined"
                color="success"
                onClick={() =>
                  handleUpdate(kategori || "", konu || "", aciklama || "")
                }
                sx={{ width: "20%" }}
              >
                Kaydet
              </Button>{" "}
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleIsConfirm()}
                sx={{ width: "20%" }}
              >
                Sil
              </Button>
            </DialogActions>
          ) : (
            <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
              <Button
                variant="outlined"
                color="success"
                onClick={() =>
                  handleCreate(kategori || "", konu || "", aciklama || "")
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
                Sil
              </Button>
            </DialogActions>
          )}
          {isConfirmPopUpOpen && (
            <ConfirmPopUpComponent
              isConfirmPopUp={isConfirmPopUpOpen}
              handleClose={handleClose}
              handleDelete={handleDelete}
            />
          )}
        </>
      )}
    </Dialog>
  );
};

interface Kategory {
  label: string;
}

const kategoriler = [
  {
    label: "Finansal Tablolara İlişkin Tespit ve Açıklamalar",
  },
  {
    label: "Hesaplara İlişkin Tespit ve Açıklamalar",
  },
  {
    label: "Uygulanan Denetim Prosedürleri",
  },
];
interface KategoriBoxProps {
  onSelect: (selectedKategori: string) => void;
  initialValue: string;
}

const KategoriBoxAutocomplete: React.FC<KategoriBoxProps> = ({
  onSelect,
  initialValue,
}) => {
  const [initial, setInitial] = useState<Kategory | null>(null);

  useEffect(() => {
    const matchedOption = kategoriler.find((row) => row.label === initialValue);
    setInitial(matchedOption || null);
  }, [initialValue]);

  return (
    <Autocomplete
      id="kategori-box"
      options={kategoriler}
      fullWidth
      value={initial}
      onChange={(event, value) => {
        onSelect(value?.label || "");
      }}
      renderInput={(params) => (
        <CustomTextField
          {...params}
          placeholder={"Kategori Seçiniz"}
          aria-label="Kategori Seçiniz"
        />
      )}
    />
  );
};
