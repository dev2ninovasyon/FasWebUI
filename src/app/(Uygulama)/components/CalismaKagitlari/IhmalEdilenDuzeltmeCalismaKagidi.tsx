import React, { useEffect, useState } from "react";
import {
  Box,
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
import BelgeKontrolCard from "./Cards/BelgeKontrolCard";
import IslemlerCard from "./Cards/IslemlerCard";
import { useSelector } from "@/store/hooks";
import {
  createCalismaKagidiVerisi,
  deleteAllCalismaKagidiVerileri,
  deleteCalismaKagidiVerisiById,
  getCalismaKagidiVerileriByDenetciDenetlenenYil,
  updateCalismaKagidiVerisi,
} from "@/api/CalismaKagitlari/CalismaKagitlari";
import { ConfirmPopUpComponent } from "./ConfirmPopUp";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";

interface Veri {
  id: number;
  kontrolTesti: string;
  kontrolAmaci: string;
  testUygulamasi: string;
  standartMi: boolean;
}

interface CalismaKagidiProps {
  controller: string;
  isClickedYeniGrupEkle: boolean;
  isClickedVarsayılanaDon: boolean;

  setIsClickedVarsayılanaDon: (deger: boolean) => void;
  setTamamlanan: (deger: number) => void;
  setToplam: (deger: number) => void;
}

const IhmalEdilenDuzeltmeCalismaKagidi: React.FC<CalismaKagidiProps> = ({
  controller,
  isClickedYeniGrupEkle,
  isClickedVarsayılanaDon,
  setIsClickedVarsayılanaDon,
  setTamamlanan,
  setToplam,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);

  const [selectedId, setSelectedId] = useState(0);
  const [selectedKontrolTesti, setSelectedKontrolTesti] = useState("");
  const [selectedKontrolAmaci, setSelectedKontrolAmaci] = useState("");
  const [selectedTestUygulamasi, setSelectedTestUygulamasi] = useState("");

  const [veriler, setVeriler] = useState<Veri[]>([]);

  const [verilerWithoutBaslikId, setVerilerWithoutBaslikId] = useState<Veri[]>(
    []
  );

  const [isNew, setIsNew] = useState(false);

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [isDuzenlePopUpOpen, setIsDuzenlePopUpOpen] = useState(false);

  const handleCreate = async (
    kontrolTesti: string,
    kontrolAmaci: string,
    testUygulamasi: string
  ) => {
    const createdCalismaKagidiVerisi = {
      denetlenenId: user.denetlenenId,
      denetciId: user.denetciId,
      yil: user.yil,
      kontrolTesti: kontrolTesti,
      kontrolAmaci: kontrolAmaci,
      testUygulamasi: testUygulamasi,
    };
    try {
      const result = await createCalismaKagidiVerisi(
        controller || "",
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
    kontrolTesti: string,
    kontrolAmaci: string,
    testUygulamasi: string
  ) => {
    const updatedCalismaKagidiVerisi = veriler.find(
      (veri) => veri.id === selectedId
    );
    if (updatedCalismaKagidiVerisi) {
      updatedCalismaKagidiVerisi.kontrolTesti = kontrolTesti;
      updatedCalismaKagidiVerisi.kontrolAmaci = kontrolAmaci;
      updatedCalismaKagidiVerisi.testUygulamasi = testUygulamasi;

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
        controller || "",
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0
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
      const calismaKagidiVerileri =
        await getCalismaKagidiVerileriByDenetciDenetlenenYil(
          controller || "",
          user.token || "",
          user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0
        );

      const rowsAll: any = [];
      const rowsWithBaslikId: Veri[] = [];
      const rowsWithoutBaslikId: Veri[] = [];

      const tamamlanan: any[] = [];
      const toplam: any[] = [];

      calismaKagidiVerileri.forEach((veri: any) => {
        const newRow: Veri = {
          id: veri.id,
          kontrolTesti: veri.kontrolTesti,
          kontrolAmaci: veri.kontrolAmaci,
          testUygulamasi: veri.testUygulamasi,

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
      setVerilerWithoutBaslikId(rowsWithoutBaslikId);

      setToplam(toplam.length);
      setTamamlanan(tamamlanan.length);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const handleCardClick = (veri: any) => {
    setSelectedId(veri.id);
    setSelectedKontrolTesti(veri.kontrolTesti);
    setSelectedKontrolAmaci(veri.kontrolAmaci);
    setSelectedTestUygulamasi(veri.testUygulamasi);

    setIsPopUpOpen(true);
  };

  const handleNew = () => {
    setIsNew(true);
    setSelectedKontrolTesti("");
    setSelectedKontrolAmaci("");
    setSelectedTestUygulamasi("");
    setIsPopUpOpen(true);
  };

  const handleClosePopUp = () => {
    setIsPopUpOpen(false);
  };

  const handleSetSelectedKontrolTesti = async (kontrolTesti: any) => {
    setSelectedKontrolTesti(kontrolTesti);
  };

  const handleSetSelectedKontrolAmaci = async (kontrolAmaci: any) => {
    setSelectedKontrolAmaci(kontrolAmaci);
  };

  const handleSetSelectedTestUygulamasi = async (testUygulamasi: any) => {
    setSelectedTestUygulamasi(testUygulamasi);
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
        <>
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
                  title={`${index + 1}. ${veri.kontrolTesti}`}
                  content={veri.kontrolAmaci}
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
        </>

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
          kontrolTesti={selectedKontrolTesti}
          kontrolAmaci={selectedKontrolAmaci}
          testUygulamasi={selectedTestUygulamasi}
          handleClose={handleClosePopUp}
          handleSetSelectedKontrolTesti={handleSetSelectedKontrolTesti}
          handleSetSelectedKontrolAmaci={handleSetSelectedKontrolAmaci}
          handleSetSelectedTestUygulamasi={handleSetSelectedTestUygulamasi}
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

export default IhmalEdilenDuzeltmeCalismaKagidi;

interface PopUpProps {
  kontrolTesti?: string;
  kontrolAmaci?: string;
  testUygulamasi?: string;

  isPopUpOpen: boolean;
  isNew: boolean;

  handleClose: () => void;
  handleSetSelectedKontrolTesti: (a: string) => void;
  handleSetSelectedKontrolAmaci: (a: string) => void;
  handleSetSelectedTestUygulamasi: (a: string) => void;
  handleCreate: (
    kontrolTesti: string,
    kontrolAmaci: string,
    testUygulamasi: string
  ) => void;
  handleDelete: () => void;
  handleUpdate: (
    kontrolTesti: string,
    kontrolAmaci: string,
    testUygulamasi: string
  ) => void;
}

const PopUpComponent: React.FC<PopUpProps> = ({
  kontrolTesti,
  kontrolAmaci,
  testUygulamasi,
  isPopUpOpen,
  isNew,
  handleClose,
  handleSetSelectedKontrolTesti,
  handleSetSelectedKontrolAmaci,
  handleSetSelectedTestUygulamasi,
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
          <DialogContent className="testdialog">
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
                Hesap Grubu
              </Typography>
              <CustomTextField
                id="KontrolTesti"
                multiline
                rows={8}
                variant="outlined"
                fullWidth
                value={kontrolTesti}
                onChange={(e: any) =>
                  handleSetSelectedKontrolTesti(e.target.value)
                }
              />
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Düzeltme Kaydının Toplam Varlıklar Üzerine Etkisi
              </Typography>
              <CustomTextField
                id="KontrolAmaci"
                multiline
                rows={8}
                variant="outlined"
                fullWidth
                value={kontrolAmaci}
                onChange={(e: any) =>
                  handleSetSelectedKontrolAmaci(e.target.value)
                }
              />
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Düzeltme Kaydının Özkaynaklar Üzerine Etkisi
              </Typography>
              <CustomTextField
                id="TestUygulamasi"
                multiline
                rows={8}
                variant="outlined"
                fullWidth
                value={testUygulamasi}
                onChange={(e: any) =>
                  handleSetSelectedTestUygulamasi(e.target.value)
                }
              />
            </Box>
          </DialogContent>
          {!isNew ? (
            <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
              <Button
                variant="outlined"
                color="success"
                onClick={() =>
                  handleUpdate(
                    kontrolTesti || "",
                    kontrolAmaci || "",
                    testUygulamasi || ""
                  )
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
                  handleCreate(
                    kontrolTesti || "",
                    kontrolAmaci || "",
                    testUygulamasi || ""
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
