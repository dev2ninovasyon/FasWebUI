import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import "handsontable/dist/handsontable.full.min.css";
import { plus } from "@/utils/theme/Typography";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import ExcelJS from "exceljs";
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
registerAllModules();

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
}
const Hareketsiz: React.FC<Props> = ({ hesaplaTiklandimi, tip }) => {
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

  const afterGetColHeader = (col: any, TH: any) => {
    TH.style.height = "50px";

    let div = TH.querySelector("div");
    if (!div) {
      div = document.createElement("div");
      TH.appendChild(div);
    }

    div.style.whiteSpace = "normal";
    div.style.wordWrap = "break-word";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.height = "100%";
    div.style.position = "relative";

    //typography body1
    TH.style.fontFamily = plus.style.fontFamily;
    TH.style.fontWeight = 500;
    TH.style.fontSize = "0.875rem";
    TH.style.lineHeight = "1.334rem";

    //color
    TH.style.color = customizer.activeMode === "dark" ? "#ffffff" : "#2A3547";
    TH.style.backgroundColor = theme.palette.primary.light;
    //customizer.activeMode === "dark" ? "#253662" : "#ECF2FF";

    TH.style.borderColor = customizer.activeMode === "dark" ? "#10141c" : "#";

    // Create span for the header text
    let span = div.querySelector("span");
    if (!span) {
      span = document.createElement("span");
      div.appendChild(span);
    }
    span.textContent = colHeaders[col];
    span.style.position = "absolute";
    span.style.marginRight = "16px";
    span.style.left = "4px";

    // Create button if it does not exist
    let button = div.querySelector("button");
    if (!button) {
      button = document.createElement("button");
      button.style.display = "none";
      div.appendChild(button);
    }
    button.style.position = "absolute";
    button.style.right = "4px";
  };

  const afterGetRowHeader = (row: any, TH: any) => {
    let div = TH.querySelector("div");
    div.style.whiteSpace = "normal";
    div.style.wordWrap = "break-word";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.style.height = "100%";

    //typography body1
    TH.style.fontFamily = plus.style.fontFamily;
    TH.style.fontWeight = 500;
    TH.style.fontSize = "0.875rem";
    TH.style.lineHeight = "1.334rem";

    //color
    TH.style.color = customizer.activeMode === "dark" ? "#ffffff" : "#2A3547";
    TH.style.backgroundColor = theme.palette.primary.light;
    //customizer.activeMode === "dark" ? "#253662" : "#ECF2FF";

    TH.style.borderColor = customizer.activeMode === "dark" ? "#10141c" : "#";
  };

  const afterRenderer = (
    TD: any,
    row: any,
    col: any,
    prop: any,
    value: any,
    cellProperties: any
  ) => {
    //typography body1
    TD.style.fontFamily = plus.style.fontFamily;
    TD.style.fontWeight = 500;
    TD.style.fontSize = "0.875rem";
    TD.style.lineHeight = "1.334rem";
    //TD.style.textAlign = "left";

    //color
    TD.style.color = customizer.activeMode === "dark" ? "#ffffff" : "#2A3547";

    if (row % 2 === 0) {
      TD.style.backgroundColor =
        customizer.activeMode === "dark" ? "#171c23" : "#ffffff";
      TD.style.borderColor =
        customizer.activeMode === "dark" ? "#10141c" : "#cccccc";
    } else {
      TD.style.backgroundColor =
        customizer.activeMode === "dark" ? "#10141c" : "#cccccc";
      TD.style.borderColor =
        customizer.activeMode === "dark" ? "#10141c" : "#cccccc";
      TD.style.borderRightColor =
        customizer.activeMode === "dark" ? "#171c23" : "#ffffff";
    }
  };

  const handleDeleteById = async (id: number) => {
    try {
      if (tip == "TicariAlacaklar") {
        const result = await deleteHareketsizTicariAlacaklarById(
          user.token || "",
          id
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
        const result = await deleteHareketsizStoklarById(user.token || "", id);
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
      console.error("Bir hata oluştu:", error);
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
        const result = await createHareketsizTicariAlacak(
          user.token || "",
          createdHareketsiz
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
        const result = await createHareketsizStok(
          user.token || "",
          createdHareketsiz
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
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      if (tip == "TicariAlacaklar") {
        const hareketsizTicariAlacaklarVerileri =
          await getHareketsizTicariAlacaklar(
            user.token || "",
            user.denetciId || 0,
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
      }
      if (tip == "Stoklar") {
        const hareketsizStoklarVerileri = await getHareketsizStoklar(
          user.token || "",
          user.denetciId || 0,
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
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (hesaplaTiklandimi) {
      setFetchedData([]);
      setRowCount(0);
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
        console.error("Excel dosyası oluşturulurken bir hata oluştu:", error);
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
  }, [customizer.isCollapse]);

  return (
    <>
      <HotTable
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
        colWidths={[60, 60, 80, 100, 80, 80, 80, 80]}
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
        afterGetColHeader={afterGetColHeader}
        afterGetRowHeader={afterGetRowHeader}
        afterRenderer={afterRenderer}
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
        <Grid item xs={12} lg={10}></Grid>
        <Grid
          item
          xs={12}
          lg={2}
          sx={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <ExceleAktarButton
            handleDownload={handleDownload}
          ></ExceleAktarButton>
        </Grid>
      </Grid>
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
              item
              xs={12}
              lg={12}
              sx={{
                display: "flex",
                alignContent: "center",
                justifyContent: "space-between",
                mt: 2,
              }}
            >
              <Grid item xs={12} lg={6}>
                <Typography variant="h6" p={1}>
                  Kebir Kodu
                </Typography>
              </Grid>
              <Grid item xs={12} lg={6}>
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
              item
              xs={12}
              lg={12}
              sx={{
                display: "flex",
                alignContent: "center",
                justifyContent: "space-between",
                mt: 1,
              }}
            >
              <Grid item xs={12} lg={6}>
                <Typography variant="h6" p={1}>
                  Detay Kodu
                </Typography>
              </Grid>
              <Grid item xs={12} lg={6}>
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
              item
              xs={12}
              lg={12}
              sx={{
                display: "flex",
                alignContent: "center",
                justifyContent: "space-between",
                mt: 2,
              }}
            >
              <Grid item xs={12} lg={6}>
                <Typography variant="h6" p={1}>
                  Hesap Adı
                </Typography>
              </Grid>
              <Grid item xs={12} lg={6}>
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
              item
              xs={12}
              lg={12}
              sx={{
                display: "flex",
                alignContent: "center",
                justifyContent: "space-between",
                mt: 1,
              }}
            >
              <Grid item xs={12} lg={6}>
                <Typography variant="h6" p={1}>
                  Borç
                </Typography>
              </Grid>
              <Grid item xs={12} lg={6}>
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
              item
              xs={12}
              lg={12}
              sx={{
                display: "flex",
                alignContent: "center",
                justifyContent: "space-between",
                mt: 2,
              }}
            >
              <Grid item xs={12} lg={6}>
                <Typography variant="h6" p={1}>
                  Alacak
                </Typography>
              </Grid>
              <Grid item xs={12} lg={6}>
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
              item
              xs={12}
              lg={12}
              sx={{
                display: "flex",
                alignContent: "center",
                justifyContent: "space-between",
                mt: 1,
              }}
            >
              <Grid item xs={12} lg={6}>
                <Typography variant="h6" p={1}>
                  Bakiye
                </Typography>
              </Grid>
              <Grid item xs={12} lg={6}>
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
              item
              xs={12}
              lg={12}
              sx={{
                display: "flex",
                alignContent: "center",
                justifyContent: "space-between",
                mt: 1,
              }}
            >
              <Grid item xs={12} lg={6}>
                <Typography variant="h6" p={1}>
                  Para Birimi
                </Typography>
              </Grid>
              <Grid item xs={12} lg={6}>
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
