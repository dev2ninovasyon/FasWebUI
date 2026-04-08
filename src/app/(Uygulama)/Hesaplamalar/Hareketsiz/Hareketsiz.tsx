import "@/lib/handsontableSetup";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import CustomHotTable from "@/components/HotTableWrapper";




import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import React, { useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import ExceleAktarButton from "@/app/(Uygulama)/components/Veri/ExceleAktarButton";
import {
  createHareketsizStok,
  createHareketsizTicariAlacak,
  deleteHareketsizStoklarById,
  deleteHareketsizTicariAlacaklarById,
  getHareketsizStoklar,
  getHareketsizTicariAlacaklar,
} from "@/api/Hesaplamalar/Hesaplamalar";
import { enqueueSnackbar } from "notistack";
import { IconX } from "@tabler/icons-react";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import CustomSelect from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSelect";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";

// register Handsontable's modules
numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Veri {
  id: number;
  kebirKodu: number;
  detayKodu: string;
  hesapAdi: string;
  borcTutari: number;
  alacakTutari: number;
  netBakiye: number;
  paraBirimi: string;
}

interface Props {
  hesaplaTiklandimi: boolean;
  tip: string;
  onDataCount?: (count: number) => void;
}
const Hareketsiz: React.FC<Props> = ({ hesaplaTiklandimi, tip, onDataCount }) => {
  const hotTableComponent = useRef<any>(null);

  const [showDrawer, setShowDrawer] = React.useState(false);
  const handleDrawerClose = () => {
    setShowDrawer(false);
  };

  const [paraBirimi, setParaBirimi] = useState("TL");
  const handleChangeParaBirimi = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setParaBirimi(event.target.value);
  };

  const [kebirKodu, setKebirKodu] = useState<number>(0);
  const [detayKodu, setDetayKodu] = useState<string>("0");
  const [hesapAdi, setHesapAdi] = useState<string>("");
  const [borcTutari, setBorcTutari] = useState<number>(0);
  const [alacakTutari, setAlacakTutari] = useState<number>(0);
  const [netBakiye, setNetBakiye] = useState<number>(0);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [rowCount, setRowCount] = useState(0);

  const [fetchedData, setFetchedData] = useState<Veri[]>([]);
  const [noDataOpen, setNoDataOpen] = useState(false);

  useEffect(() => {
    const loadStyles = async () => {
      dispatch(setCollapse(true));
      if (customizer.activeMode === "dark") {
        await import(
          "@/app/(Uygulama)/components/Veri/HandsOnTable/HandsOnTableDark.css"
        );
      } else {
        await import(
          "@/app/(Uygulama)/components/Veri/HandsOnTable/HandsOnTableLight.css"
        );
      }
    };

    loadStyles();
  }, [customizer.activeMode]);

  const colHeaders = [
    "Id",
    "Kebir Kodu",
    "Detay Kodu",
    "Hesap Adı",
    "Borç",
    "Alacak",
    "Bakiye",
    "Para Birimi",
  ];

  const columns = [
    {
      type: "numeric",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Id
    {
      type: "numeric",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Kebir Kodu
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Detay Kodu
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Hesap Adı
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Borç
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Alacak
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Bakiye
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Para Birimi
  ];




  const handleDeleteById = async (id: number) => {
    try {
      if (tip == "TicariAlacaklar") {
        const result = await deleteHareketsizTicariAlacaklarById(id
        );
        if (result) {
          await fetchData();
          enqueueSnackbar("Kayıt Silindi", {
            variant: "success",
            autoHideDuration: 5000,
            style: {
              backgroundColor:
                customizer.activeMode === "dark"
                  ? theme.palette.success.light
                  : theme.palette.success.main,
            },
          });
        } else {
          enqueueSnackbar("Kayıt Silinemedi", {
            variant: "error",
            autoHideDuration: 5000,
            style: {
              backgroundColor:
                customizer.activeMode === "dark"
                  ? theme.palette.error.light
                  : theme.palette.error.main,
              maxWidth: "720px",
            },
          });
        }
      }
      if (tip == "Stoklar") {
        const result = await deleteHareketsizStoklarById(id);
        if (result) {
          await fetchData();
          enqueueSnackbar("Kayıt Silindi", {
            variant: "success",
            autoHideDuration: 5000,
            style: {
              backgroundColor:
                customizer.activeMode === "dark"
                  ? theme.palette.success.light
                  : theme.palette.success.main,
            },
          });
        } else {
          enqueueSnackbar("Kayıt Silinemedi", {
            variant: "error",
            autoHideDuration: 5000,
            style: {
              backgroundColor:
                customizer.activeMode === "dark"
                  ? theme.palette.error.light
                  : theme.palette.error.main,
              maxWidth: "720px",
            },
          });
        }
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const handleCreate = async () => {
    const createdHareketsiz = {
      denetciId: user.denetciId,
      yil: user.yil,
      denetlenenId: user.denetlenenId,
      kebirKodu: kebirKodu,
      detayKodu: detayKodu,
      hesapAdi: hesapAdi,
      borcTutari: borcTutari,
      alacakTutari: alacakTutari,
      netBakiye: netBakiye,
      paraBirimi: paraBirimi,
    };
    try {
      if (tip == "TicariAlacaklar") {
        const result = await createHareketsizTicariAlacak(createdHareketsiz
        );
        if (result) {
          await fetchData();
          await handleDrawerClose();
          enqueueSnackbar("Satır Eklendi", {
            variant: "success",
            autoHideDuration: 5000,
            style: {
              backgroundColor:
                customizer.activeMode === "dark"
                  ? theme.palette.success.light
                  : theme.palette.success.main,
              maxWidth: "720px",
            },
          });
        } else {
          enqueueSnackbar("Satır Eklenemedi", {
            variant: "error",
            autoHideDuration: 5000,
            style: {
              backgroundColor:
                customizer.activeMode === "dark"
                  ? theme.palette.error.light
                  : theme.palette.error.main,
              maxWidth: "720px",
            },
          });
        }
      }
      if (tip == "Stoklar") {
        const result = await createHareketsizStok(createdHareketsiz
        );
        if (result) {
          await fetchData();
          await handleDrawerClose();
          enqueueSnackbar("Satır Eklendi", {
            variant: "success",
            autoHideDuration: 5000,
            style: {
              backgroundColor:
                customizer.activeMode === "dark"
                  ? theme.palette.success.light
                  : theme.palette.success.main,
              maxWidth: "720px",
            },
          });
        } else {
          enqueueSnackbar("Satır Eklenemedi", {
            variant: "error",
            autoHideDuration: 5000,
            style: {
              backgroundColor:
                customizer.activeMode === "dark"
                  ? theme.palette.error.light
                  : theme.palette.error.main,
              maxWidth: "720px",
            },
          });
        }
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      if (tip == "TicariAlacaklar") {
        const hareketsizTicariAlacaklarVerileri =
          await getHareketsizTicariAlacaklar(user.denetciId || 0,
            user.yil || 0,
            user.denetlenenId || 0
          );

        const rowsAll: any = [];
        hareketsizTicariAlacaklarVerileri.forEach((veri: any) => {
          const newRow: any = [
            veri.id,
            veri.kebirKodu,
            veri.detayKodu,
            veri.hesapAdi,
            veri.borcTutari,
            veri.alacakTutari,
            veri.netBakiye,
            veri.paraBirimi,
          ];
          rowsAll.push(newRow);
        });

        setRowCount(rowsAll.length);
        setFetchedData(rowsAll);
        setNoDataOpen(rowsAll.length === 0);
        onDataCount && onDataCount(rowsAll.length);
      }
      if (tip == "Stoklar") {
        const hareketsizStoklarVerileri = await getHareketsizStoklar(user.denetciId || 0,
          user.yil || 0,
          user.denetlenenId || 0
        );

        const rowsAll: any = [];
        hareketsizStoklarVerileri.forEach((veri: any) => {
          const newRow: any = [
            veri.id,
            veri.kebirKodu,
            veri.detayKodu,
            veri.hesapAdi,
            veri.borcTutari,
            veri.alacakTutari,
            veri.netBakiye,
            veri.paraBirimi,
          ];
          rowsAll.push(newRow);
        });

        setRowCount(rowsAll.length);
        setFetchedData(rowsAll);
        setNoDataOpen(rowsAll.length === 0);
        onDataCount && onDataCount(rowsAll.length);
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (hesaplaTiklandimi) {
      setFetchedData([]);
      setRowCount(0);
      onDataCount && onDataCount(0);
    } else {
      fetchData();
    }
  }, [hesaplaTiklandimi, tip]);

  const handleDownload = () => {
    const hotTableInstance = hotTableComponent.current.hotInstance;
    const data = hotTableInstance.getData();

    const processedData = data.map((row: any) => row.slice(0));

    const headers = hotTableInstance.getColHeader().slice(0);

    const fullData = [headers, ...processedData];

    async function createExcelFile() {
      const { default: ExcelJS } = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sayfa1");

      fullData.forEach((row: any) => {
        worksheet.addRow(row);
      });

      const headerRow = worksheet.getRow(1);
      headerRow.font = {
        name: "Calibri",
        size: 12,
        bold: true,
        color: { argb: "FFFFFF" },
      };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "1a6786" },
      };
      headerRow.alignment = { horizontal: "left" };

      worksheet.columns.forEach((column) => {
        column.width = 25;
      });

      try {
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, `${tip}Hesaplama.xlsx`);
        console.log("Excel dosyası başarıyla oluşturuldu");
      } catch (error) {
        console.log("Excel dosyası oluşturulurken bir hata oluştu:", error);
      }
    }
    createExcelFile();
  };

  useEffect(() => {
    if (hotTableComponent.current) {
      const diff = customizer.isCollapse
        ? 0
        : customizer.SidebarWidth && customizer.MiniSidebarWidth
          ? customizer.SidebarWidth - customizer.MiniSidebarWidth
          : 0;

      hotTableComponent.current.hotInstance.updateSettings({
        width: customizer.isCollapse
          ? "100%"
          : hotTableComponent.current.hotInstance.rootElement.clientWidth -
          diff,
      });
    }
  }, [
    customizer.isCollapse,
    customizer.SidebarWidth,
    customizer.MiniSidebarWidth,
  ]);

  return (
    <>
      <CustomHotTable theme={customizer.activeMode === "dark" ? "ht-theme-horizon-dark" : "ht-theme-horizon"}
        style={{
          height: "100%",
          width: "100%",
          maxHeight: 684,
          maxWidth: "100%",
        }}
        language={dictionary.languageCode}
        ref={hotTableComponent}
        data={fetchedData}
        height={684}
        colHeaders={colHeaders}
        columns={columns}
        colWidths={[40, 40, 50, 60, 50, 50, 50, 50]}
        stretchH="all"
        manualColumnResize={true}
        rowHeaders={true}
        rowHeights={35}
        autoWrapRow={true}
        minRows={rowCount}
        minCols={8}
        hiddenColumns={{
          columns: [0],
        }}
        filters={true}
        columnSorting={true}
        dropdownMenu={[
          "filter_by_condition",
          "filter_by_value",
          "filter_action_bar",
        ]}
        licenseKey="non-commercial-and-evaluation" // For non-commercial use only
        contextMenu={{
          items: {
            kayitEkle: {
              name: "Satır Ekle",
              callback: async function (key, selection) {
                const hotInstance = hotTableComponent.current.hotInstance;
                setShowDrawer(true);
              },
            },
            copy: {},
            alignment: {},
            kayitSil: {
              name: "Satır Sil",
              callback: async function (key, selection) {
                const hotInstance = hotTableComponent.current.hotInstance;
                handleDeleteById(
                  hotInstance.getDataAtRow(selection[0].start.row)[0]
                );
              },
            },
          },
        }}
      />
      <Grid container marginTop={2} marginBottom={1}>
        <Grid
          size={{
            xs: 12,
            lg: 10
          }}></Grid>
        <Grid
          sx={{
            display: "flex",
            justifyContent: "flex-end",
          }}
          size={{
            xs: 12,
            lg: 2
          }}>
          <ExceleAktarButton
            handleDownload={handleDownload}
          ></ExceleAktarButton>
        </Grid>
      </Grid>
      <Snackbar
        open={noDataOpen}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity="warning"
          variant="filled"
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setNoDataOpen(false)}
            >
              <Close fontSize="small" />
            </IconButton>
          }
          sx={{ width: "100%", fontSize: "14px" }}
        >
          Hareketsiz stok verisi bulunamadı.
        </Alert>
      </Snackbar>
      <Dialog
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        maxWidth={"md"}
      >
        <DialogContent className="testdialog" sx={{ overflow: "visible" }}>
          <Stack
            direction="row"
            spacing={2}
            justifyContent={"space-between"}
            alignItems="center"
          >
            <Typography variant="h5" p={1}>
              Satır Ekle
            </Typography>
            <IconButton size="small" onClick={handleDrawerClose}>
              <IconX size="18" />
            </IconButton>
          </Stack>
        </DialogContent>
        <Divider />
        <DialogContent>
          <Grid container>
            <Grid
              sx={{
                display: "flex",
                alignContent: "center",
                justifyContent: "space-between",
                mt: 2,
              }}
              size={{
                xs: 12,
                lg: 12
              }}>
              <Grid
                size={{
                  xs: 12,
                  lg: 6
                }}>
                <Typography variant="h6" p={1}>
                  Kebir Kodu
                </Typography>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  lg: 6
                }}>
                <CustomTextField
                  id="kebirKodu"
                  type="number"
                  fullWidth
                  value={kebirKodu}
                  onChange={(e: any) => setKebirKodu(parseInt(e.target.value))}
                />
              </Grid>
            </Grid>
            <Grid
              sx={{
                display: "flex",
                alignContent: "center",
                justifyContent: "space-between",
                mt: 1,
              }}
              size={{
                xs: 12,
                lg: 12
              }}>
              <Grid
                size={{
                  xs: 12,
                  lg: 6
                }}>
                <Typography variant="h6" p={1}>
                  Detay Kodu
                </Typography>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  lg: 6
                }}>
                <CustomTextField
                  id="detayKodu"
                  type="text"
                  fullWidth
                  value={detayKodu}
                  onChange={(e: any) => setDetayKodu(e.target.value)}
                />
              </Grid>
            </Grid>
            <Grid
              sx={{
                display: "flex",
                alignContent: "center",
                justifyContent: "space-between",
                mt: 2,
              }}
              size={{
                xs: 12,
                lg: 12
              }}>
              <Grid
                size={{
                  xs: 12,
                  lg: 6
                }}>
                <Typography variant="h6" p={1}>
                  Hesap Adı
                </Typography>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  lg: 6
                }}>
                <CustomTextField
                  id="hesapAdi"
                  type="text"
                  fullWidth
                  value={hesapAdi}
                  onChange={(e: any) => setHesapAdi(e.target.value)}
                />
              </Grid>
            </Grid>
            <Grid
              sx={{
                display: "flex",
                alignContent: "center",
                justifyContent: "space-between",
                mt: 1,
              }}
              size={{
                xs: 12,
                lg: 12
              }}>
              <Grid
                size={{
                  xs: 12,
                  lg: 6
                }}>
                <Typography variant="h6" p={1}>
                  Borç
                </Typography>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  lg: 6
                }}>
                <CustomTextField
                  id="borcTutari"
                  type="number"
                  fullWidth
                  value={borcTutari}
                  onChange={(e: any) => setBorcTutari(parseInt(e.target.value))}
                />
              </Grid>
            </Grid>
            <Grid
              sx={{
                display: "flex",
                alignContent: "center",
                justifyContent: "space-between",
                mt: 2,
              }}
              size={{
                xs: 12,
                lg: 12
              }}>
              <Grid
                size={{
                  xs: 12,
                  lg: 6
                }}>
                <Typography variant="h6" p={1}>
                  Alacak
                </Typography>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  lg: 6
                }}>
                <CustomTextField
                  id="alacakTutari"
                  type="number"
                  fullWidth
                  value={alacakTutari}
                  onChange={(e: any) =>
                    setAlacakTutari(parseInt(e.target.value))
                  }
                />
              </Grid>
            </Grid>
            <Grid
              sx={{
                display: "flex",
                alignContent: "center",
                justifyContent: "space-between",
                mt: 1,
              }}
              size={{
                xs: 12,
                lg: 12
              }}>
              <Grid
                size={{
                  xs: 12,
                  lg: 6
                }}>
                <Typography variant="h6" p={1}>
                  Bakiye
                </Typography>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  lg: 6
                }}>
                <CustomTextField
                  id="personel2021"
                  type="number"
                  fullWidth
                  value={netBakiye}
                  onChange={(e: any) => setNetBakiye(parseInt(e.target.value))}
                />
              </Grid>
            </Grid>
            <Grid
              sx={{
                display: "flex",
                alignContent: "center",
                justifyContent: "space-between",
                mt: 1,
              }}
              size={{
                xs: 12,
                lg: 12
              }}>
              <Grid
                size={{
                  xs: 12,
                  lg: 6
                }}>
                <Typography variant="h6" p={1}>
                  Para Birimi
                </Typography>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  lg: 6
                }}>
                <CustomSelect
                  labelId="kacGun"
                  id="kacGun"
                  size="medium"
                  fullWidth
                  value={paraBirimi}
                  onChange={handleChangeParaBirimi}
                >
                  <MenuItem value={"TL"}>TL</MenuItem>
                  <MenuItem value={"USD"}>USD</MenuItem>
                  <MenuItem value={"EUR"}>EUR</MenuItem>
                  <MenuItem value={"GBP"}>GBP</MenuItem>
                  <MenuItem value={"CHF"}>CHF</MenuItem>
                  <MenuItem value={"RUB"}>RUB</MenuItem>
                  <MenuItem value={"CNY"}>CNY</MenuItem>
                  <MenuItem value={"JPY"}>JPY</MenuItem>
                  <MenuItem value={"SAR"}>SAR</MenuItem>
                  <MenuItem value={"Diğer"}>Diğer</MenuItem>
                </CustomSelect>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
          <Button
            variant="outlined"
            color="success"
            onClick={() => handleCreate()}
            sx={{ width: "20%" }}
          >
            Ekle
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleDrawerClose()}
            sx={{ width: "20%" }}
          >
            Vazgeç
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Hareketsiz;

