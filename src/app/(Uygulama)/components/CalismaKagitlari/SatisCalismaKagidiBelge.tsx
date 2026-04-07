import "@/lib/handsontableSetup";
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import CalismaKagidiCard from "./Cards/CalismaKagidiCard";
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
import { FloatingButtonCalismaKagitlari } from "./FloatingButtonCalismaKagitlari";

// ğŸ”” bildirim
import { enqueueSnackbar } from "notistack";

// ✅ Gönderilen eşleşmeleri API + tip
import { getSentInvoiceMatches, SentInvoiceMatchRow } from "@/api/Fatura/FaturaApi";

// ✅ Handsontable
import { HotTable } from "@handsontable/react";
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-horizon.css';
import 'handsontable/styles/ht-icons-main.css';
interface Veri {
  id: number;
  kontrolTesti: string;
  kontrolAmaci: string;
  testUygulamasi: string;
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

const SatisCalismaKagidiBelge: React.FC<CalismaKagidiProps> = ({
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
  const [selectedKontrolTesti, setSelectedKontrolTesti] = useState("");
  const [selectedKontrolAmaci, setSelectedKontrolAmaci] = useState("");
  const [selectedTestUygulamasi, setSelectedTestUygulamasi] = useState("");
  const [selectedStandartMi, setSelectedStandartMi] = useState(true);

  const [veriler, setVeriler] = useState<Veri[]>([]);
  const [verilerWithBaslikId, setVerilerWithBaslikId] = useState<Veri[]>([]);
  const [verilerWithoutBaslikId, setVerilerWithoutBaslikId] = useState<Veri[]>(
    []
  );

  const [isNew, setIsNew] = useState(false);

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [isGroupPopUpOpen, setIsGroupPopUpOpen] = useState(false);

  const [openedGroupIndex, setOpenGroupIndex] = useState<any>(null);

  // ğŸ”½ Gönderilen eşleşmeleri için state
  const [matchRows, setMatchRows] = useState<SentInvoiceMatchRow[]>([]);
  const hotRef = useRef<any>(null);

  const handleOpenGroup = (index: any) => {
    setOpenGroupIndex(openedGroupIndex === index ? null : index);
  };

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
        createdCalismaKagidiVerisi
      );
      if (result) {
        fetchData();
        handleClosePopUp();
        setIsNew(false);
      } else {
        console.log("Çalışma Kağıdı Verisi ekleme başarısız");
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
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
          selectedId,
          updatedCalismaKagidiVerisi
        );
        if (result) {
          fetchData();
          handleClosePopUp();
        } else {
          console.log("Çalışma Kağıdı Verisi düzenleme başarısız");
        }
      } catch (error) {
        console.log("Bir hata oluştu:", error);
      }
    }
  };

  const handleGroupUpdate = async (kontrolTesti: string) => {
    const updatedCalismaKagidiGroupVerisi = veriler.find(
      (veri) => veri.id === selectedGroupId
    );

    if (updatedCalismaKagidiGroupVerisi) {
      const updatedCalismaKagidiVerisi = {
        kontrolTesti: kontrolTesti,
        kontrolAmaci: "",
        testUygulamasi: "",
      };
      try {
        const result = await updateCalismaKagidiVerisi(
          controller || "",
          selectedGroupId,
          updatedCalismaKagidiVerisi
        );
        if (result) {
          fetchData();
        } else {
          console.log("Çalışma Kağıdı Verisi düzenleme başarısız");
        }
      } catch (error) {
        console.log("Bir hata oluştu:", error);
      }
    }
  };

  const handleDelete = async () => {
    try {
      const result = await deleteCalismaKagidiVerisiById(
        controller || "",
        selectedId
      );
      if (result) {
        fetchData();
        handleClosePopUp();
      } else {
        console.log("Çalışma Kağıdı Verisi silme başarısız");
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const handleGroupDelete = async () => {
    const deletedCalismaKagidiGroupVerileri = veriler.filter(
      (veri) => veri.baslikId === selectedGroupId
    );
    try {
      const result = await deleteCalismaKagidiVerisiById(
        controller || "",
        selectedGroupId
      );
      if (result) {
        for (let i = 0; i < deletedCalismaKagidiGroupVerileri.length; i++) {
          const deletedCalismaKagidiGroupVerileriWithBaslikId =
            deletedCalismaKagidiGroupVerileri[i];
          deleteCalismaKagidiVerisiById(
            controller || "",
            deletedCalismaKagidiGroupVerileriWithBaslikId.id
          );
        }
        fetchData();
        setOpenGroupIndex(null);
      } else {
        console.log("Çalışma Kağıdı Verisi silme başarısız");
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      const result = await deleteAllCalismaKagidiVerileri(
        controller || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0
      );
      if (result) {
        fetchData();
      } else {
        console.log("Çalışma Kağıdı Verileri silme başarısız");
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const calismaKagidiVerileri =
        await getCalismaKagidiVerileriByDenetciDenetlenenYil(
          controller || "",
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
      console.log("Bir hata oluştu:", error);
    }
  };

  // ğŸ”½ Gönderilen eşleşmeleri yükle
  const loadMatches = async () => {
    try {
      const data = await getSentInvoiceMatches(user);
      setMatchRows(data);
    } catch (e: any) {
      enqueueSnackbar(e?.message || "Eşleşmeler alınamadı", { variant: "error" });
    }
  };

  useEffect(() => {
    fetchData();
    loadMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // ğŸ”½ Handsontable data + kolonlar (gönderilen eşleşmeleri)
  const matchesMatrix = useMemo(
    () =>
      matchRows.map((r) => [
        r.matchId, // 0 (gizli)
        r.invoiceNo ?? "",
        r.invoiceDate
          ? (r.invoiceDate as string).substring(0, 10).split("-").reverse().join(".")
          : "",
        r.counterpartyName ?? "",
        r.counterpartyVkn ?? "",
        r.amount ?? 0,
        r.kdv ?? 0,
        r.yevmiyeNo ?? "",
        r.yevmiyeDate
          ? (r.yevmiyeDate as string).substring(0, 10).split("-").reverse().join(".")
          : "",
      ]),
    [matchRows]
  );

  const matchesHeaders = [
    "_MatchId_",
    "Fatura No",
    "Fatura Tarihi",
    "Alıcı",
    "Alıcı VKN",
    "Tutar",
    "KDV",
    "Yevmiye No",
    "Yevmiye Tarihi",
  ];

  const matchesColumns: any[] = [
    { readOnly: true },
    { type: "text", readOnly: true },
    { type: "text", readOnly: true },
    { type: "text", readOnly: true },
    { type: "text", readOnly: true },
    { type: "numeric", readOnly: true, numericFormat: { pattern: "0,0.00", culture: "tr-TR" } },
    { type: "numeric", readOnly: true, numericFormat: { pattern: "0,0.00", culture: "tr-TR" } },
    { type: "text", readOnly: true },
    { type: "text", readOnly: true },
  ];

  const handleCardClick = (veri: any) => {
    setSelectedId(veri.id);
    setSelectedKontrolTesti(veri.kontrolTesti);
    setSelectedKontrolAmaci(veri.kontrolAmaci);
    setSelectedTestUygulamasi(veri.testUygulamasi);
    setSelectedStandartMi(veri.standartMi);
    setIsPopUpOpen(true);
  };

  const handleGroupClick = (veri: any) => {
    setSelectedGroupId(veri.id);
    setSelectedGroupIslem(veri.islem);
  };

  const handleNew = () => {
    setIsNew(true);
    setSelectedKontrolTesti("");
    setSelectedKontrolAmaci("");
    setSelectedTestUygulamasi("");
    setIsPopUpOpen(true);
  };

  const handleNewGrouplu = (index: any) => {
    setIsNew(true);
    setSelectedKontrolTesti("");
    setSelectedKontrolAmaci("");
    setSelectedTestUygulamasi("");
    setOpenGroupIndex(index);
    setIsPopUpOpen(true);
  };

  const handleClosePopUp = () => {
    setIsNew(false);
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

  return (
    <>
      <Grid container>
        {grupluMu ? (
          <>
            {verilerWithoutBaslikId.map((veriWithoutBaslikId: any, index: any) => (
              <Grid
                key={index}
                container
                sx={{
                  width: "95%",
                  margin: "0 auto",
                  justifyContent: "center",
                }}
              >
                <Grid
                  size={{
                    lg: 12,
                    xs: 12
                  }}>
                  <Card
                    sx={{
                      padding: 0,
                      width: "100%",
                      mt: "20px",
                      bgcolor: customizer.activeMode === "dark" ? "#0e121a" : "#f5f5f5",
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
                          {openedGroupIndex === index ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                      }
                    />
                    <Collapse in={openedGroupIndex === index} timeout="auto" unmountOnExit>
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
                            .filter((veriWithBaslikId: any) => veriWithBaslikId.baslikId === veriWithoutBaslikId.id)
                            .map((veriWithBaslikId: any, index: any) => (
                              <Grid
                                key={index}
                                mb={3}
                                onClick={() => {
                                  handleCardClick(veriWithBaslikId);
                                }}
                                size={{
                                  xs: 12,
                                  lg: 12
                                }}>
                                <CalismaKagidiCard
                                  title={`${index + 1}. ${veriWithBaslikId.kontrolTesti}`}
                                  content={veriWithBaslikId.kontrolAmaci}
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
                              sx={{
                                display: "flex",
                                justifyContent: "start",
                              }}
                              size={{
                                xs: 12,
                                lg: 1.5
                              }}>
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
                              sx={{
                                display: "flex",
                                justifyContent: "end",
                              }}
                              size={{
                                xs: 12,
                                lg: 1.5
                              }}>
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
            ))}
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
                  mt="20px"
                  onClick={() => handleCardClick(veri)}
                  size={{
                    xs: 12,
                    lg: 12
                  }}>
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
                my={2}
                sx={{
                  display: "flex",
                  justifyContent: "end",
                }}
                size={{
                  xs: 12,
                  lg: 1.5
                }}>
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

        {/* ğŸ”½ğŸ”½ğŸ”½ BURAYA EKLEDİK: Kartların ALTINA, önizleme (BelgeKontrol) kartlarının ÜSTÜNE */}
        <Grid
          container
          sx={{ width: "95%", margin: "0 auto", justifyContent: "center" }}
        >
          <Grid
            mt={3}
            size={{
              xs: 12,
              lg: 12
            }}>
            <Card>
              <CardHeader
                title="Gönderilen Fatura â†” Yevmiye Eşleşmeleri"
                action={
                  <Button size="small" variant="outlined" onClick={loadMatches}>
                    Yenile
                  </Button>
                }
              />
              <CardContent>
                <HotTable theme={customizer.activeMode === "dark" ? "horizon-dark" : "horizon"}
                  ref={hotRef}
                  data={matchesMatrix}
                  colHeaders={matchesHeaders}
                  columns={matchesColumns}
                  hiddenColumns={{ columns: [0], indicators: false }}
                  stretchH="all"
                  rowHeaders
                  height={360}
                  licenseKey="non-commercial-and-evaluation"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        {/* ğŸ”¼ğŸ”¼ğŸ”¼ EKLENEN KISIM SONU */}

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
            <Grid
              mt={3}
              size={{
                xs: 12,
                md: 3.9,
                lg: 3.9
              }}>
              <BelgeKontrolCard fetch={fetchData} hazirlayan="Denetçi - Yardımcı Denetçi" controller={controller} />
            </Grid>
            <Grid
              mt={3}
              size={{
                xs: 12,
                md: 3.9,
                lg: 3.9
              }}>
              <BelgeKontrolCard fetch={fetchData} onaylayan="Sorumlu Denetçi" controller={controller} />
            </Grid>
            <Grid
              mt={3}
              size={{
                xs: 12,
                md: 3.9,
                lg: 3.9
              }}>
              <BelgeKontrolCard
                fetch={fetchData}
                kaliteKontrol="Kalite Kontrol Sorumlu Denetçi"
                controller={controller}
              />
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
          <Grid
            mt={5}
            size={{
              xs: 12,
              lg: 12
            }}>
            <IslemlerCard controller={controller} />
          </Grid>
        </Grid>
      </Grid>
      {isPopUpOpen && (
        <PopUpComponent
          kontrolTesti={selectedKontrolTesti}
          kontrolAmaci={selectedKontrolAmaci}
          testUygulamasi={selectedTestUygulamasi}
          standartMi={selectedStandartMi}
          handleClose={handleClosePopUp}
          handleSetSelectedKontrolTesti={setSelectedKontrolTesti}
          handleSetSelectedKontrolAmaci={setSelectedKontrolAmaci}
          handleSetSelectedTestUygulamasi={setSelectedTestUygulamasi}
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

export default SatisCalismaKagidiBelge;

interface PopUpProps {
  kontrolTesti?: string;
  kontrolAmaci?: string;
  testUygulamasi?: string;
  standartMi?: boolean;

  isPopUpOpen: boolean;
  isNew: boolean;

  handleClose: () => void;
  handleSetSelectedKontrolTesti: (a: string) => void;
  handleSetSelectedKontrolAmaci: (a: string) => void;
  handleSetSelectedTestUygulamasi: (a: string) => void;
  handleCreate: (kontrolTesti: string, kontrolAmaci: string, testUygulamasi: string) => void;
  handleDelete: () => void;
  handleUpdate: (kontrolTesti: string, kontrolAmaci: string, testUygulamasi: string) => void;
}

const PopUpComponent: React.FC<PopUpProps> = ({
  kontrolTesti,
  kontrolAmaci,
  testUygulamasi,
  standartMi,
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

  const textFieldRef = useRef<HTMLInputElement | null>(null);

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
            <Stack direction="row" spacing={2} justifyContent={"space-between"} alignItems="center">
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
                Kontrol Testi
              </Typography>
              <CustomTextField
                id="KontrolTesti"
                multiline
                rows={8}
                variant="outlined"
                fullWidth
                value={kontrolTesti}
                onChange={(e: any) => handleSetSelectedKontrolTesti(e.target.value)}
              />
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Kontrol Amacı
              </Typography>
              <CustomTextField
                id="KontrolAmaci"
                multiline
                rows={8}
                variant="outlined"
                fullWidth
                value={kontrolAmaci}
                onChange={(e: any) => handleSetSelectedKontrolAmaci(e.target.value)}
              />
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Test Uygulamasi
              </Typography>
              <CustomTextField
                id="TestUygulamasi"
                multiline
                rows={8}
                variant="outlined"
                fullWidth
                value={testUygulamasi}
                onChange={(e: any) => handleSetSelectedTestUygulamasi(e.target.value)}
                inputRef={textFieldRef}
              />
            </Box>
          </DialogContent>
          <FloatingButtonCalismaKagitlari
            control={standartMi ? (control1 || control2 ? true : false) : true}
            text={testUygulamasi}
            isHovered={isHovered}
            setIsHovered={setIsHovered}
            handleClick={handleControl1}
            handleSetSelectedText={handleSetSelectedTestUygulamasi}
          />
          {!isNew ? (
            <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
              <Button
                variant="outlined"
                color="success"
                onClick={() => handleUpdate(kontrolTesti || "", kontrolAmaci || "", testUygulamasi || "")}
                sx={{ width: "20%" }}
              >
                Kaydet
              </Button>{" "}
              <Button variant="outlined" color="error" onClick={() => handleIsConfirm()} sx={{ width: "20%" }}>
                Sil
              </Button>
            </DialogActions>
          ) : (
            <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
              <Button
                variant="outlined"
                color="success"
                onClick={() => handleCreate(kontrolTesti || "", kontrolAmaci || "", testUygulamasi || "")}
                sx={{ width: "20%" }}
              >
                Kaydet
              </Button>{" "}
              <Button variant="outlined" color="error" onClick={handleClose} sx={{ width: "20%" }}>
                Sil
              </Button>
            </DialogActions>
          )}
          {isConfirmPopUpOpen && (
            <ConfirmPopUpComponent isConfirmPopUp={isConfirmPopUpOpen} handleClose={handleClose} handleDelete={handleDelete} />
          )}
        </>
      )}
    </Dialog>
  );
};


