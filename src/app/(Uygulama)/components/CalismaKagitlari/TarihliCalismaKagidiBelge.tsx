import React, { useEffect, useState } from "react";
import {
  Box,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
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
import CalismaKagidiTarihCard from "./Cards/CalismaKagidiTarihCard";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";

interface Veri {
  id: number;
  calisma: string;
  baslangicTarihi: string;
  bitisTarihi: string;
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

const TarihliCalismaKagidiBelge: React.FC<CalismaKagidiProps> = ({
  controller,

  isClickedVarsayılanaDon,
  setIsClickedVarsayılanaDon,
  setTamamlanan,
  setToplam,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [selectedId, setSelectedId] = useState(0);
  const [selectedCalisma, setSelectedCalisma] = useState("");
  const [selectedBaslangicTarihi, setSelectedBaslangicTarihi] = useState("");
  const [selectedBitisTarihi, setSelectedBitisTarihi] = useState("");

  const [veriler, setVeriler] = useState<Veri[]>([]);

  const [verilerWithoutBaslikId, setVerilerWithoutBaslikId] = useState<Veri[]>(
    []
  );

  const [isNew, setIsNew] = useState(false);

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [isDuzenlePopUpOpen, setIsDuzenlePopUpOpen] = useState(false);

  const handleCreate = async (
    calisma: string,
    baslangicTarihi: string,
    bitisTarihi: string
  ) => {
    const createdCalismaKagidiVerisi = {
      denetlenenId: user.denetlenenId,
      denetciId: user.denetciId,
      yil: user.yil,
      calisma: calisma,
      baslangicTarihi: baslangicTarihi,
      bitisTarihi: bitisTarihi,
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
    calisma: string,
    baslangicTarihi: string,
    bitisTarihi: string
  ) => {
    const updatedCalismaKagidiVerisi = veriler.find(
      (veri) => veri.id === selectedId
    );
    if (updatedCalismaKagidiVerisi) {
      updatedCalismaKagidiVerisi.calisma = calisma;
      updatedCalismaKagidiVerisi.baslangicTarihi = baslangicTarihi;
      updatedCalismaKagidiVerisi.bitisTarihi = bitisTarihi;

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
      const rowsWithoutBaslikId: Veri[] = [];

      const tamamlanan: any[] = [];
      const toplam: any[] = [];

      calismaKagidiVerileri.forEach((veri: any) => {
        const newRow: Veri = {
          id: veri.id,
          calisma: veri.calisma,
          baslangicTarihi: veri.baslangicTarihi,
          bitisTarihi: veri.bitisTarihi,

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
    setSelectedCalisma(veri.calisma);
    setSelectedBaslangicTarihi(veri.baslangicTarihi);
    setSelectedBitisTarihi(veri.bitisTarihi);

    setIsPopUpOpen(true);
  };

  const handleNew = () => {
    setIsNew(true);
    setSelectedCalisma("");
    setSelectedBaslangicTarihi("");
    setSelectedBitisTarihi("");
    setIsPopUpOpen(true);
  };

  const handleClosePopUp = () => {
    setIsPopUpOpen(false);
  };

  const handleSetSelectedCalisma = async (calisma: any) => {
    setSelectedCalisma(calisma);
  };

  const handleSetSelectedBaslangicTarihi = async (baslangicTarihi: any) => {
    setSelectedBaslangicTarihi(baslangicTarihi);
  };

  const handleSetSelectedBitisTarihi = async (bitisTarihi: any) => {
    setSelectedBitisTarihi(bitisTarihi);
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
                <CalismaKagidiTarihCard
                  content={`${index + 1}. ${veri.calisma}`}
                  startDate={veri.baslangicTarihi}
                  endDate={veri.bitisTarihi}
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
          calisma={selectedCalisma}
          baslangicTarihi={selectedBaslangicTarihi}
          bitisTarihi={selectedBitisTarihi}
          handleClose={handleClosePopUp}
          handleSetSelectedCalisma={handleSetSelectedCalisma}
          handleSetSelectedBaslangicTarihi={handleSetSelectedBaslangicTarihi}
          handleSetSelectedBitisTarihi={handleSetSelectedBitisTarihi}
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

export default TarihliCalismaKagidiBelge;

interface PopUpProps {
  calisma?: string;
  baslangicTarihi?: string;
  bitisTarihi?: string;

  isPopUpOpen: boolean;
  isNew: boolean;

  handleClose: () => void;
  handleSetSelectedCalisma: (a: string) => void;
  handleSetSelectedBaslangicTarihi: (a: string) => void;
  handleSetSelectedBitisTarihi: (a: string) => void;
  handleCreate: (
    calisma: string,
    baslangicTarihi: string,
    bitisTarihi: string
  ) => void;
  handleDelete: () => void;
  handleUpdate: (
    calisma: string,
    baslangicTarihi: string,
    bitisTarihi: string
  ) => void;
}

const PopUpComponent: React.FC<PopUpProps> = ({
  calisma,
  baslangicTarihi,
  bitisTarihi,
  isPopUpOpen,
  isNew,
  handleClose,
  handleSetSelectedCalisma,
  handleSetSelectedBaslangicTarihi,
  handleSetSelectedBitisTarihi,
  handleCreate,
  handleDelete,
  handleUpdate,
}) => {
  const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = useState(false);
  const handleIsConfirm = () => {
    setIsConfirmPopUpOpen(!isConfirmPopUpOpen);
  };
  const formattedStartDate = baslangicTarihi
    ? baslangicTarihi.split("T")[0]
    : "";
  const formattedEndDate = bitisTarihi ? bitisTarihi.split("T")[0] : "";

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
            <Box px={3} pt={2}>
              <Typography variant="h5" mb={1} p={1}>
                Görev Süresi
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <CustomTextField
                    id="start-date"
                    label="Başlangıç Tarihi"
                    type="date"
                    variant="outlined"
                    value={formattedStartDate}
                    onChange={(e: any) =>
                      handleSetSelectedBaslangicTarihi(e.target.value)
                    }
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomTextField
                    id="end-date"
                    label="Bitiş Tarihi"
                    type="date"
                    variant="outlined"
                    value={formattedEndDate}
                    onChange={(e: any) =>
                      handleSetSelectedBitisTarihi(e.target.value)
                    }
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box px={3} pt={3}></Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Çalışma
              </Typography>
              <CustomTextField
                id="Calisma"
                multiline
                rows={8}
                variant="outlined"
                fullWidth
                value={calisma}
                onChange={(e: any) => handleSetSelectedCalisma(e.target.value)}
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
                    calisma || "",
                    baslangicTarihi || "",
                    bitisTarihi || ""
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
                    calisma || "",
                    baslangicTarihi || "",
                    bitisTarihi || ""
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
