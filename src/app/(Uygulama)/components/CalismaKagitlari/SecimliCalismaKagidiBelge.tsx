import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import CalismaKagidiCard from "./Cards/CalismaKagidiCard";
import { Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import { IconX } from "@tabler/icons-react";
import { AppState } from "@/store/store";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
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
import { DuzenleGroupPopUp } from "./DuzenleGroupPopUp";
import { ConfirmPopUpComponent } from "./ConfirmPopUp";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import CustomSelect from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSelect";
import { FloatingButtonCalismaKagitlari } from "./FloatingButtonCalismaKagitlari";

interface Veri {
  id: number;
  islem: string;
  tespit: string;
  durum: string;
  baslikId?: number;
  standartMi: boolean;
}

interface CalismaKagidiProps {
  controller: string;
  grupluMu: boolean;
  isClickedYeniGrupEkle: boolean;
  isClickedVarsayilanaDon: boolean;
  setIsClickedVarsayilanaDon: (deger: boolean) => void;
  setTamamlanan: (deger: number) => void;
  setToplam: (deger: number) => void;
}

const SecimliCalismaKagidiBelge: React.FC<CalismaKagidiProps> = ({
  controller,
  grupluMu,
  isClickedYeniGrupEkle,
  isClickedVarsayilanaDon,
  setIsClickedVarsayilanaDon,
  setTamamlanan,
  setToplam,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);

  const [selectedGroupId, setSelectedGroupId] = useState(0);
  const [selectedGroupIslem, setSelectedGroupIslem] = useState("");

  const [selectedId, setSelectedId] = useState(0);
  const [selectedIslem, setSelectedIslem] = useState("");
  const [selectedTespit, setSelectedTespit] = useState("");
  const [selectedDurum, setSelectedDurum] = useState("");
  const [selectedStandartMi, setSelectedStandartMi] = useState(true);

  const [veriler, setVeriler] = useState<Veri[]>([]);
  const [verilerWithBaslikId, setVerilerWithBaslikId] = useState<Veri[]>([]);
  const [verilerWithoutBaslikId, setVerilerWithoutBaslikId] = useState<Veri[]>(
    []
  );

  const [isNew, setIsNew] = useState(false);

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [isGroupPopUpOpen, setIsGroupPopUpOpen] = useState(false);

  const [openedGroupIndex, setOpenGroupIndex] = useState(null);

  const handleOpenGroup = (index: any) => {
    setOpenGroupIndex(openedGroupIndex === index ? null : index);
  };

  const handleCreate = async (islem: string, tespit: string, durum: string) => {
    const createdCalismaKagidiVerisi = {
      denetlenenId: user.denetlenenId,
      denetciId: user.denetciId,
      yil: user.yil,
      islem: islem,
      tespit: tespit,
      durum: durum,
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

  const handleUpdate = async (islem: string, tespit: string, durum: string) => {
    const updatedCalismaKagidiVerisi = veriler.find(
      (veri) => veri.id === selectedId
    );
    if (updatedCalismaKagidiVerisi) {
      updatedCalismaKagidiVerisi.islem = islem;
      updatedCalismaKagidiVerisi.tespit = tespit;
      updatedCalismaKagidiVerisi.durum = durum;

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

  const handleGroupUpdate = async (islem: string) => {
    const updatedCalismaKagidiGroupVerisi = veriler.find(
      (veri) => veri.id === selectedGroupId
    );

    if (updatedCalismaKagidiGroupVerisi) {
      const updatedCalismaKagidiVerisi = {
        islem: islem,
        tespit: "",
      };
      try {
        const result = await updateCalismaKagidiVerisi(
          controller || "",
          user.token || "",
          selectedGroupId,
          updatedCalismaKagidiVerisi
        );
        if (result) {
          fetchData();
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

  const handleGroupDelete = async () => {
    const deletedCalismaKagidiGroupVerileri = veriler.filter(
      (veri) => veri.baslikId === selectedGroupId
    );
    try {
      const result = await deleteCalismaKagidiVerisiById(
        controller || "",
        user.token || "",
        selectedGroupId
      );
      if (result) {
        for (let i = 0; i < deletedCalismaKagidiGroupVerileri.length; i++) {
          const deletedCalismaKagidiGroupVerileriWithBaslikId =
            deletedCalismaKagidiGroupVerileri[i];
          deleteCalismaKagidiVerisiById(
            controller || "",
            user.token || "",
            deletedCalismaKagidiGroupVerileriWithBaslikId.id
          );
        }
        fetchData();
        setOpenGroupIndex(null);
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
          islem: veri.islem,
          tespit: veri.tespit,
          durum: veri.durum ? veri.durum : "Hayır",
          baslikId: veri.baslikId,
          standartMi: veri.standartmi,
        };
        rowsAll.push(newRow);

        if (grupluMu) {
          if (veri.baslikId) {
            rowsWithBaslikId.push(newRow);
            if (newRow.standartMi) {
              toplam.push(newRow);
            } else {
              tamamlanan.push(newRow);
              toplam.push(newRow);
            }
          } else {
            rowsWithoutBaslikId.push(newRow);
            rowsAll.push(newRow);
          }
        } else {
          if (newRow.standartMi) {
            toplam.push(newRow);
          } else {
            tamamlanan.push(newRow);
            toplam.push(newRow);
          }
        }
      });
      setVeriler(rowsAll);
      setVerilerWithBaslikId(rowsWithBaslikId);
      setVerilerWithoutBaslikId(rowsWithoutBaslikId);

      setToplam(toplam.length);
      setTamamlanan(tamamlanan.length);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const handleCardClick = (veri: any) => {
    setSelectedId(veri.id);
    setSelectedIslem(veri.islem);
    setSelectedTespit(veri.tespit);
    setSelectedDurum(veri.durum);
    setSelectedStandartMi(veri.standartMi);
    setIsPopUpOpen(true);
  };

  const handleGroupClick = (veri: any) => {
    setSelectedGroupId(veri.id);
    setSelectedGroupIslem(veri.islem);
  };

  const handleNew = () => {
    setIsNew(true);
    setSelectedIslem("");
    setSelectedTespit("");
    setSelectedDurum("");
    setIsPopUpOpen(true);
  };

  const handleNewGrouplu = (index: any) => {
    setIsNew(true);
    setSelectedIslem("");
    setSelectedTespit("");
    setOpenGroupIndex(index);
    setIsPopUpOpen(true);
  };

  const handleClosePopUp = () => {
    setIsNew(false);
    setIsPopUpOpen(false);
  };

  const handleSetSelectedIslem = async (islem: any) => {
    setSelectedIslem(islem);
  };

  const handleSetSelectedTespit = async (tespit: any) => {
    setSelectedTespit(tespit);
  };

  const handleSetSelectedDurum = async (durum: any) => {
    setSelectedDurum(durum);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!isClickedYeniGrupEkle) {
      fetchData();
    }
  }, [isClickedYeniGrupEkle]);

  useEffect(() => {
    if (isClickedVarsayilanaDon) {
      handleDeleteAll();
      setIsClickedVarsayilanaDon(false);
    }
  }, [isClickedVarsayilanaDon]);

  return (
    <>
      <Grid container>
        {grupluMu ? (
          <>
            {verilerWithoutBaslikId.map(
              (veriWithoutBaslikId: any, index: any) => (
                <Grid
                  key={index}
                  container
                  sx={{
                    width: "95%",
                    margin: "0 auto",
                    justifyContent: "center",
                  }}
                >
                  <Grid item lg={12} xs={12}>
                    <Card
                      sx={{
                        padding: 0,
                        width: "100%",
                        mt: "20px",
                        bgcolor:
                          customizer.activeMode === "dark"
                            ? "#0e121a"
                            : "#f5f5f5",
                      }}
                    >
                      <CardHeader
                        title={veriWithoutBaslikId.islem}
                        action={
                          <IconButton
                            aria-label="expand row"
                            size="medium"
                            onClick={() => {
                              handleOpenGroup(index);
                              handleGroupClick(veriWithoutBaslikId);
                            }}
                          >
                            {openedGroupIndex === index ? (
                              <KeyboardArrowUpIcon />
                            ) : (
                              <KeyboardArrowDownIcon />
                            )}
                          </IconButton>
                        }
                      />
                      <Collapse
                        in={openedGroupIndex === index}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Divider />
                        <CardContent>
                          <Grid
                            container
                            sx={{
                              width: "100%",
                              margin: "0 auto",
                              justifyContent: "center",
                            }}
                          >
                            {verilerWithBaslikId
                              .filter(
                                (veriWithBaslikId: any) =>
                                  veriWithBaslikId.baslikId ===
                                  veriWithoutBaslikId.id
                              )
                              .map((veriWithBaslikId: any, index: any) => (
                                <Grid
                                  key={index}
                                  item
                                  xs={12}
                                  lg={12}
                                  mb={3}
                                  onClick={() => {
                                    handleCardClick(veriWithBaslikId);
                                  }}
                                >
                                  <CalismaKagidiCard
                                    title={`${index + 1}. ${
                                      veriWithBaslikId.islem
                                    }`}
                                    content={veriWithBaslikId.tespit}
                                    standartMi={veriWithBaslikId.standartMi}
                                  />
                                </Grid>
                              ))}
                            <Grid
                              container
                              sx={{
                                width: "100%",
                                margin: "0 auto",
                                justifyContent: "space-between",
                              }}
                            >
                              <Grid
                                item
                                xs={12}
                                lg={1.5}
                                sx={{
                                  display: "flex",
                                  justifyContent: "start",
                                }}
                              >
                                <Button
                                  size="medium"
                                  variant="outlined"
                                  color="primary"
                                  onClick={() => setIsGroupPopUpOpen(true)}
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
                                    Grup Düzenle
                                  </Typography>
                                </Button>
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                lg={1.5}
                                sx={{
                                  display: "flex",
                                  justifyContent: "end",
                                }}
                              >
                                <Button
                                  size="medium"
                                  variant="outlined"
                                  color="primary"
                                  onClick={() => handleNewGrouplu(index)}
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
                          </Grid>
                        </CardContent>
                      </Collapse>
                    </Card>
                  </Grid>
                </Grid>
              )
            )}
          </>
        ) : (
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
                    title={`${index + 1}. ${veri.islem}`}
                    content={veri.tespit}
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
        )}
        {(user.rol?.includes("KaliteKontrolSorumluDenetci") ||
          user.rol?.includes("SorumluDenetci") ||
          user.rol?.includes("Denetci") ||
          user.rol?.includes("DenetciYardimcisi")) && (
          <Grid
            container
            sx={{
              width: "95%",
              margin: "0 auto",
              justifyContent: "space-between",
            }}
          >
            <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
              <BelgeKontrolCard
                hazirlayan="Denetçi - Yardımcı Denetçi"
                controller={controller}
              ></BelgeKontrolCard>
            </Grid>
            <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
              <BelgeKontrolCard
                onaylayan="Sorumlu Denetçi"
                controller={controller}
              ></BelgeKontrolCard>
            </Grid>
            <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
              <BelgeKontrolCard
                kaliteKontrol="Kalite Kontrol Sorumlu Denetçi"
                controller={controller}
              ></BelgeKontrolCard>
            </Grid>
          </Grid>
        )}
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
          islem={selectedIslem}
          tespit={selectedTespit}
          durum={selectedDurum}
          standartMi={selectedStandartMi}
          handleClose={handleClosePopUp}
          handleSetSelectedIslem={handleSetSelectedIslem}
          handleSetSelectedTespit={handleSetSelectedTespit}
          handleSetSelectedDurum={handleSetSelectedDurum}
          handleCreate={handleCreate}
          handleDelete={handleDelete}
          handleUpdate={handleUpdate}
          isPopUpOpen={isPopUpOpen}
          isNew={isNew}
        />
      )}
      {isGroupPopUpOpen && (
        <DuzenleGroupPopUp
          islem={selectedGroupIslem}
          setIslem={setSelectedGroupIslem}
          isPopUpOpen={isGroupPopUpOpen}
          setIsPopUpOpen={setIsGroupPopUpOpen}
          handleGroupUpdate={handleGroupUpdate}
          handleGroupDelete={handleGroupDelete}
        />
      )}
    </>
  );
};

export default SecimliCalismaKagidiBelge;

interface PopUpProps {
  islem?: string;
  tespit?: string;
  durum?: string;
  standartMi?: boolean;

  isPopUpOpen: boolean;
  isNew: boolean;

  handleClose: () => void;
  handleSetSelectedIslem: (a: string) => void;
  handleSetSelectedTespit: (a: string) => void;
  handleSetSelectedDurum: (a: string) => void;
  handleCreate: (islem: string, tespit: string, durum: string) => void;
  handleDelete: () => void;
  handleUpdate: (islem: string, tespit: string, durum: string) => void;
}

const PopUpComponent: React.FC<PopUpProps> = ({
  islem,
  tespit,
  durum,
  standartMi,
  isPopUpOpen,
  isNew,
  handleClose,
  handleSetSelectedIslem,
  handleSetSelectedTespit,
  handleSetSelectedDurum,
  handleCreate,
  handleDelete,
  handleUpdate,
}) => {
  const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = useState(false);
  const handleIsConfirm = () => {
    setIsConfirmPopUpOpen(!isConfirmPopUpOpen);
  };

  const textFieldRef = useRef<HTMLInputElement | null>(null);

  const [control, setControl] = useState<string>(durum || "Hayır");

  const [control1, setControl1] = useState(false);
  const [control2, setControl2] = useState(false);

  const [isHovered, setIsHovered] = useState(false);

  const handleControl1 = () => {
    if (standartMi) {
      setControl1(true);
    }
  };

  useEffect(() => {
    if (!standartMi) {
      setControl2(true);
    }
  }, [standartMi]);

  useEffect(() => {
    if (isHovered && textFieldRef.current) {
      textFieldRef.current.focus();
    } else if (!isHovered && textFieldRef.current) {
      textFieldRef.current.blur();
    }
  }, [isHovered]);

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
                İşlem
              </Typography>
              <CustomTextField
                id="islem"
                multiline
                rows={8}
                variant="outlined"
                fullWidth
                value={islem}
                onChange={(e: any) => handleSetSelectedIslem(e.target.value)}
              />
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Yanıt Belirt
              </Typography>
              <CustomSelect
                labelId="durum"
                id="durum"
                size="small"
                value={durum}
                onChange={(e: any) => {
                  handleSetSelectedDurum(e.target.value);
                  setControl(e.target.value);
                }}
                height={"36px"}
                sx={{ width: "100%" }}
              >
                <MenuItem value={"Evet"}>Evet</MenuItem>
                <MenuItem value={"Hayır"}>Hayır</MenuItem>
              </CustomSelect>
            </Box>
            {control == "Evet" && (
              <Box px={3} pt={3}>
                <Typography variant="h5" p={1}>
                  Tespit
                </Typography>
                <CustomTextField
                  id="tespit"
                  multiline
                  rows={8}
                  variant="outlined"
                  fullWidth
                  value={tespit}
                  onChange={(e: any) => handleSetSelectedTespit(e.target.value)}
                  inputRef={textFieldRef}
                />
              </Box>
            )}
          </DialogContent>
          {control == "Evet" && (
            <FloatingButtonCalismaKagitlari
              control={
                standartMi ? (control1 || control2 ? true : false) : true
              }
              text={tespit}
              isHovered={isHovered}
              setIsHovered={setIsHovered}
              handleClick={handleControl1}
              handleSetSelectedText={handleSetSelectedDurum}
            />
          )}
          {!isNew ? (
            <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
              <Button
                variant="outlined"
                color="success"
                onClick={() =>
                  handleUpdate(islem || "", tespit || "", durum || "")
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
                  handleCreate(islem || "", tespit || "", durum || "")
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
