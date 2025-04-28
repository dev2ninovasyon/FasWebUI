import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import "handsontable/dist/handsontable.full.min.css";
import { plus } from "@/utils/theme/Typography";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { enqueueSnackbar } from "notistack";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import { usePathname } from "next/navigation";
import { IconFileTypeXls } from "@tabler/icons-react";
import {
  createFisListesiVerisi,
  deleteFisListesiVerisi,
  getFisListesiVerileriByFisNo,
  updateFisListesiVerisi,
} from "@/api/Donusum/FisListesi";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";

// register Handsontable's modules
registerAllModules();

numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Veri {
  [key: number]: number;
  id: number;
  fisNo: number;
  fisTipi: string;
  detayKodu: string;
  hesapAdi: string;
  borc: number;
  alacak: number;
  aciklama: string;
}

interface Props {
  genelHesapPlaniListesi: any;
}

const FisDetaylari: React.FC<Props> = ({ genelHesapPlaniListesi }) => {
  const hotTableComponent = useRef<any>(null);

  const pathname = usePathname();
  const segments = pathname.split("/");
  const idIndex = segments.indexOf("FisDetaylari") + 1;
  const pathFisNo = parseInt(segments[idIndex]);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const [rowCount, setRowCount] = useState(0);

  const [fetchedData, setFetchedData] = useState<Veri[]>([]);

  const [toplamBorc, setToplamBorc] = useState(0);
  const [toplamAlacak, setToplamAlacak] = useState(0);
  const [fark, setFark] = useState(0);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

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
    "Fiş No",
    "Tip",
    "Detay Kodu",
    "Hesap Adı",
    "Borç",
    "Alacak",
    "Açıklama",
  ];

  const columns = [
    {
      type: "numeric",
      columnSorting: true,
      readOnly: true,
      editor: false,
      className: "htLeft",
    }, // Id
    {
      type: "numeric",
      columnSorting: true,
      readOnly: true,
      editor: false,
      className: "htLeft",
    }, // Fiş No
    {
      type: "dropdown",
      columnSorting: true,
      source: ["Açılış", "Düzeltme", "Sınıflama", "Transfer"],
      className: "htLeft",
      allowInvalid: false,
    }, // Tip
    {
      type: "autocomplete",
      source: function (query: string, process: (result: string[]) => void) {
        let results = genelHesapPlaniListesi
          .filter((item: any) => item.kod.includes(query))
          .slice(0, 50)
          .map((item: any) => item.kod);
        process(results);
      },
      strict: true,
      allowInvalid: false,
      className: "htLeft",
    }, // Detay Hesap Kodu
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
    }, // Hesap Adı
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
    }, // Borc
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
    }, // Alacak
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
    }, // Açıklama
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
    TD.style.whiteSpace = "nowrap";
    TD.style.overflow = "hidden";
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

  const handleGetRowData = async (row: number) => {
    if (hotTableComponent.current) {
      const hotInstance = hotTableComponent.current.hotInstance;
      const cellMeta = hotInstance.getDataAtRow(row);
      console.log("Satır Verileri:", cellMeta);
      return cellMeta;
    }
  };

  const handleAfterChange = async (changes: any, source: any) => {
    //Değişen Cellin Satır Indexi
    let changedRow = -1;
    //Değişen Cellin Satır Verileri
    let changedRowData: any;
    if (source === "loadData") {
      return; // Skip this hook on loadData
    }
    if (changes) {
      for (const [row, prop, oldValue, newValue] of changes) {
        console.log(
          `Changed cell at row: ${row}, col: ${prop}, from: ${oldValue}, to: ${newValue}`
        );
        changedRow = row;

        changedRowData = await handleGetRowData(row);

        if (prop === 3) {
          const matched = genelHesapPlaniListesi.find(
            (item: any) => item.kod === newValue
          );
          console.log(matched);
          if (matched && matched.adi != "") {
            if (hotTableComponent.current) {
              hotTableComponent.current.hotInstance.setDataAtCell(
                row,
                4,
                matched.adi
              );
            }
          }
        }

        //Cell Güncelleme
        if (
          changedRow >= 0 &&
          changedRowData[0] != null &&
          changedRowData[1] != null &&
          changedRowData[2] != null &&
          changedRowData[3] != null &&
          changedRowData[4] != null &&
          changedRowData[5] != null &&
          changedRowData[6] != null &&
          changedRowData[7] != null
        ) {
          await handleUpdateFisVerisi(changedRow);

          changedRow = -1;
        }
      }
    }
  };

  const handleBeforeChange = (changes: any[]) => {
    if (!changes) return;

    for (let i = 0; i < changes.length; i++) {
      const [row, prop, oldValue, newValue] = changes[i];

      if ([5, 6].includes(prop)) {
        if (typeof newValue === "string") {
          const cleanedNewValue = newValue.replaceAll(/\./g, "");
          changes[i][3] = cleanedNewValue;
        }
      }
    }
  };

  useEffect(() => {
    setFark(toplamBorc - toplamAlacak);
  }, [toplamBorc, toplamAlacak]);

  const handleCreateNullFisVerisi = async () => {
    try {
      const result = await createFisListesiVerisi(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        pathFisNo
      );
      if (result) {
        if (true) {
          await fetchData();
        }
        console.log("Fiş Verisi ekleme başarılı");
      } else {
        console.error("Fiş Verisi ekleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const handleUpdateFisVerisi = async (row: number) => {
    const rowData = await handleGetRowData(row);

    const updatedFisVerisi = {
      fisTipi: rowData[2],
      detayKodu: rowData[3],
      hesapAdi: rowData[4],
      borc: rowData[5],
      alacak: rowData[6],
      aciklama: rowData[7],
    };

    try {
      const result = await updateFisListesiVerisi(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        rowData[0],
        updatedFisVerisi
      );
      if (result) {
        await fetchData();
        console.log("Fiş Verisi güncelleme başarılı");
      } else {
        console.error("Fiş güncelleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const handleDeleteFisVerisi = async (ids: number[]) => {
    try {
      const result = await deleteFisListesiVerisi(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        ids
      );
      if (result) {
        await fetchData();
        enqueueSnackbar("Fiş Silindi.", {
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
        enqueueSnackbar("Fiş Silinemedi.", {
          variant: "error",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.error.light
                : theme.palette.error.main,
          },
        });
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const fisVerileriByFisNo = await getFisListesiVerileriByFisNo(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        pathFisNo
      );
      const rowsAll: any = [];

      fisVerileriByFisNo.forEach((veri: any) => {
        const newRow: any = [
          veri.id,
          veri.fisNo,
          veri.fisTipi,
          veri.detayKodu,
          veri.hesapAdi,
          veri.borc,
          veri.alacak,
          veri.aciklama,
        ];
        rowsAll.push(newRow);
      });

      setFetchedData(rowsAll);
      setRowCount(rowsAll.length);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (fetchedData && fetchedData.length > 0) {
      const borc = fetchedData.reduce((acc, current) => {
        return acc + (current[5] || 0);
      }, 0);

      const alacak = fetchedData.reduce((acc, current) => {
        return acc + (current[6] || 0);
      }, 0);

      setToplamBorc(borc);
      setToplamAlacak(alacak);
    }
  }, [fetchedData]);

  const handleDownload = () => {
    const hotTableInstance = hotTableComponent.current.hotInstance;
    const data = hotTableInstance.getData();

    const processedData = data.map((row: any) => row.slice(1));

    const headers = hotTableInstance.getColHeader().slice(1);

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
        saveAs(blob, "FisDetaylari.xlsx");
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
    <Grid container>
      <Grid item xs={12} lg={12} mb={2}>
        <HotTable
          style={{
            height: "100%",
            width: "100%",
            maxHeight: 684,
            maxWidth: "100%",
            overflow: smDown ? "auto" : "",
          }}
          language={dictionary.languageCode}
          ref={hotTableComponent}
          data={fetchedData}
          colHeaders={colHeaders}
          columns={columns}
          colWidths={[0, 31, 50, 50, 125, 90, 90, 90]}
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
          afterChange={handleAfterChange}
          beforeChange={handleBeforeChange}
          copyPaste={false}
          contextMenu={{
            items: {
              row_below: {
                name: "Satır ekle",
                callback: function (key, selection) {
                  this.alter("insert_row_below", selection[0].start.row, 1);

                  handleCreateNullFisVerisi();
                },
              },
              remove_row: {
                name: "Satırı sil",
                callback: function (key, selection) {
                  const rowPromises = [];

                  for (
                    let rowIndex = selection[0].start.row;
                    rowIndex <= selection[0].end.row;
                    rowIndex++
                  ) {
                    rowPromises.push(handleGetRowData(rowIndex));
                  }

                  let ids: number[] = [];

                  Promise.all(rowPromises)
                    .then((rowData: any) => {
                      rowData.forEach((data: any) => {
                        ids.push(data[0]);
                      });

                      handleDeleteFisVerisi(ids);
                    })
                    .catch((error) => {
                      console.error("Veri alınırken bir hata oluştu: ", error);
                    });
                },
              },
              alignment: {},
              fis_esitle: {
                name: "Fiş eşitle",
                callback: async function (key, selection) {
                  const hotInstance = hotTableComponent.current.hotInstance;
                  if (fark < 0) {
                    hotInstance.setDataAtCell(
                      selection[0].start.row,
                      5,
                      Math.abs(fark)
                    );
                    hotInstance.setDataAtCell(
                      selection[0].start.row,
                      6,
                      formatNumber(0)
                    );
                  } else if (fark == 0) {
                    hotInstance.setDataAtCell(
                      selection[0].start.row,
                      5,
                      formatNumber(0)
                    );
                    hotInstance.setDataAtCell(
                      selection[0].start.row,
                      6,
                      formatNumber(0)
                    );
                  } else {
                    hotInstance.setDataAtCell(
                      selection[0].start.row,
                      5,
                      formatNumber(0)
                    );
                    hotInstance.setDataAtCell(
                      selection[0].start.row,
                      6,
                      Math.abs(fark)
                    );
                  }
                },
              },
            },
          }}
        />
      </Grid>
      <Grid item xs={12} lg={6}></Grid>
      <Grid
        item
        xs={12}
        lg={4}
        sx={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          gap={2}
          flexWrap="wrap"
          sx={{ flex: 1 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2,
              flex: 1,
              backgroundColor: "primary.light",
              overflow: "auto",
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
              Toplam
            </Typography>
            <Typography variant="subtitle1" align="right">
              {formatNumber(toplamBorc)}
            </Typography>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              flex: 1,
              backgroundColor: "primary.light",
              overflow: "auto",
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
              Toplam
            </Typography>
            <Typography variant="subtitle1" align="right">
              {formatNumber(toplamAlacak)}
            </Typography>
          </Paper>
        </Box>
      </Grid>

      <Grid
        item
        xs={12}
        lg={2}
        display={"flex"}
        alignItems={"center"}
        sx={{ py: 2, pl: { lg: 2 } }}
      >
        <Button
          size="medium"
          variant="outlined"
          color="primary"
          startIcon={<IconFileTypeXls width={18} />}
          onClick={() => handleDownload()}
          sx={{ width: "100%" }}
        >
          Excel&apos;e Aktar
        </Button>
      </Grid>
    </Grid>
  );
};

export default FisDetaylari;
