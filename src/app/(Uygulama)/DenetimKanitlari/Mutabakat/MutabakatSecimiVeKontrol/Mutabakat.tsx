import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import "handsontable/dist/handsontable.full.min.css";
import { plus } from "@/utils/theme/Typography";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  useTheme,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import ExceleAktarButton from "@/app/(Uygulama)/components/Veri/ExceleAktarButton";
import {
  getMutabakat,
  updateMutabakat,
} from "@/api/DenetimKanitlari/DenetimKanitlari";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";
import { enqueueSnackbar } from "notistack";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";

// register Handsontable's modules
registerAllModules();

numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Veri {
  id: number;
  secim: boolean;
  kebirKodu: number;
  detayKodu: string;
  hesapAdi: string;
  borcAlacakToplami: number;
  bakiye: number;
  ortalamaBakiyeSecilen: number;
  yargisalRastgeleSecilen: number;
  gelenYanit: number;
  fark: number;
  orneklemeyeAlinmadi: string;
}

interface Props {
  grupKodu: string;
  hesapAdi: string;
  verileriGetirTiklandimi: boolean;
  kaydetTiklandimi: boolean;
  varsayilanaDonTiklandimi: boolean;
  setVerileriGetirTiklandimi: (bool: boolean) => void;
  setKaydetTiklandimi: (bool: boolean) => void;
}

const Mutabakat: React.FC<Props> = ({
  grupKodu,
  hesapAdi,
  verileriGetirTiklandimi,
  kaydetTiklandimi,
  varsayilanaDonTiklandimi,
  setVerileriGetirTiklandimi,
  setKaydetTiklandimi,
}) => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [rowCount, setRowCount] = useState(0);

  const [fetchedData, setFetchedData] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const [openCartAlert, setOpenCartAlert] = useState(false);
  const [openCartAlert2, setOpenCartAlert2] = useState(false);

  const [anaKutleBakiye, setAnaKutleBakiye] = useState(0);
  const [anaKutleMusteriSayisi, setAnaKutleMusteriSayisi] = useState(0);
  const [ortalama, setOrtalama] = useState(0);
  const [bakiyeBazindaIncelenenTutar, setBakiyeBazindaIncelenenTutar] =
    useState(0);
  const [bakiyeBazindaIncelenenKisim, setBakiyeBazindaIncelenenKisim] =
    useState(0);
  const [ortalamaBakiyeBazindaSecilen, setOrtalamaBazindaSecilen] = useState(0);
  const [yargisalOlarakRastgeleSecilen, setYargisalOlarakRastgeleSecilen] =
    useState(0);
  const [toplamIncelenen, setToplamIncelenen] = useState(0);
  const [fark, setFark] = useState(0);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const rows = [
    { label: "Ana Kütle - Bakiye", value: formatNumber(anaKutleBakiye) },
    { label: "Ana Kütle - Müşteri Sayısı", value: anaKutleMusteriSayisi },
    { label: "Ortalama", value: formatNumber(ortalama) },
    {
      label: "Bakiye Bazında İncelenen Toplam Tutar",
      value: formatNumber(bakiyeBazindaIncelenenTutar),
    },
    {
      label: "Bakiye Bazında İncelenen Kısım (%)",
      value: formatNumber(bakiyeBazindaIncelenenKisim),
    },
    {
      label: "Fark",
      value: formatNumber(fark),
    },
    {
      label: "Ortalama Bakiye Bazında Seçilen Örnek Adedi",
      value: ortalamaBakiyeBazindaSecilen,
    },
    {
      label: "Yargısal Olarak Rastgele Seçilen Örnek Adedi",
      value: yargisalOlarakRastgeleSecilen,
    },
    {
      label: "Toplam İncelenen Örnek Adedi",
      value: toplamIncelenen,
    },
  ];

  const groupedRows = [];
  for (let i = 0; i < rows.length; i += 3) {
    groupedRows.push([rows[i], rows[i + 1], rows[i + 2]]);
  }

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

  const numberValidator = (
    value: string,
    callback: (value: boolean) => void
  ) => {
    const numberRegex = /^[0-9]+(\.[0-9]+)?$/; // Regex to match numbers with optional decimal part
    if (numberRegex.test(value)) {
      callback(true);
    } else {
      callback(false);
    }
  };

  const colHeaders = [
    "Id",
    "Seçim",
    "Kebir Kodu",
    "Detay Kodu",
    "Hesap Adı",
    "Borç Alacak Toplamı",
    "Bakiye",
    "Ortalama Bakiye Bazında Seçilen",
    "Yargısal Olarak Rastgele Seçilen",
    "Gelen Yanıt",
    "Fark",
    "Durum",
  ];

  const columns = [
    { type: "numeric", columnSorting: true, readOnly: true, editor: false }, // Id
    {
      type: "checkbox",
      className: "htCenter",
    }, // Seçim
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
      readOnly: true,
      editor: false,
    }, // Borç Alacak Toplamı
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Bakiye
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Ortalama Bakiye Bazında Seçilen
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Yargısal Olarak Rastgele Seçilen
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      validator: numberValidator,
      allowInvalid: false,
    }, // Gelen Yanıt
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Fark
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Durum
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

    if (col != 1) {
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
    } else {
      div.style.justifyContent = "space-between";

      // Destroy the button if it exists
      let button = div.querySelector("button");
      if (button) {
        div.removeChild(button); // Remove the button from the DOM
      }

      // Create checkbox if it does not exist
      let checkbox = div.querySelector("input[type='checkbox']");
      if (!checkbox) {
        checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        div.appendChild(checkbox);
      }

      checkbox.onclick = function () {
        const hotInstance = hotTableComponent.current.hotInstance;

        if (checkbox.checked) {
          fetchedData.forEach((item, index) => {
            if (item[4] != "Toplam") {
              hotInstance.setDataAtCell(index, 1, true); // Burada HOT API ile değişiklik yapıyoruz
            }
          });
        } else {
          fetchedData.forEach((item, index) => {
            hotInstance.setDataAtCell(index, 1, false); // Hepsini false yap
          });
        }
      };
    }
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

    if (source === "loadData") {
      return; // Skip this hook on loadData
    }
    if (source === "edit" || source === "Autofill.fill") {
      const updatedSelectedRows = fetchedData.filter((row) => row[1] == true);
      setSelectedRows(updatedSelectedRows);
    }
    if (changes) {
      const hotInstance = hotTableComponent.current.hotInstance;

      for (const [row, prop, oldValue, newValue] of changes) {
        console.log(
          `Changed cell at row: ${row}, col: ${prop}, from: ${oldValue}, to: ${newValue}`
        );
        changedRow = row;

        if (prop == 1) {
          let secim = hotInstance.getDataAtRow(row)[1];
          let bakiye = hotInstance.getDataAtRow(row)[6];
          if (secim) {
            hotInstance.setDataAtCell(row, 8, bakiye);
          } else {
            hotInstance.setDataAtCell(row, 8, 0);
            hotInstance.setDataAtCell(row, 11, "Örneklenmeye Alınmadı");
          }
        }
        if (prop == 9) {
          let bakiye = hotInstance.getDataAtRow(row)[6];
          let gelenYanit = hotInstance.getDataAtRow(row)[9];
          hotInstance.setDataAtCell(row, 10, Math.abs(bakiye - gelenYanit));
          changedRow = -1;
        }

        if (prop == 8 || prop == 10) {
          let secim = hotInstance.getDataAtRow(row)[1];
          let fark = hotInstance.getDataAtRow(row)[10];
          if (secim) {
            if (fark > 0) {
              hotInstance.setDataAtCell(row, 11, "Fark Vardır");
            } else {
              hotInstance.setDataAtCell(row, 11, "Fark Yoktur");
            }
          }
          changedRow = -1;
        }
      }

      handleOzet();
    }
  };

  const handleBeforeChange = (changes: any[]) => {
    if (!changes) return;

    for (let i = 0; i < changes.length; i++) {
      const [row, prop, oldValue, newValue] = changes[i];

      if ([9].includes(prop)) {
        if (typeof newValue === "string") {
          const cleanedNewValue = newValue.replaceAll(/\./g, "");
          changes[i][3] = cleanedNewValue;
        }
      }
    }
  };

  const handleOzet = async () => {
    let bakiyeAnaKutle = 0;
    fetchedData.forEach((row: any) => {
      bakiyeAnaKutle += row[6];
    });
    setAnaKutleBakiye(bakiyeAnaKutle);

    setAnaKutleMusteriSayisi(fetchedData.length);

    setOrtalama(bakiyeAnaKutle / fetchedData.length);

    let bakiyeSecilen = 0;
    fetchedData.forEach((row: any) => {
      if (row[1]) bakiyeSecilen += row[6];
    });
    setBakiyeBazindaIncelenenTutar(bakiyeSecilen);

    setBakiyeBazindaIncelenenKisim(
      bakiyeAnaKutle !== 0 ? (bakiyeSecilen / bakiyeAnaKutle) * 100 : 0
    );

    setOrtalamaBazindaSecilen(
      fetchedData.filter((row: any) => row[7] > 0).length
    );

    setYargisalOlarakRastgeleSecilen(
      fetchedData.filter((row: any) => row[8] > 0).length
    );

    setToplamIncelenen(
      fetchedData.filter((row: any) => row[7] > 0).length +
        fetchedData.filter((row: any) => row[8] > 0).length
    );

    let bakiyeFark = 0;
    fetchedData.forEach((row: any) => {
      bakiyeFark += row[10];
    });
    setFark(bakiyeFark);
  };

  const handleUpdate = async (json: any) => {
    try {
      const result = await updateMutabakat(user.token || "", json);
      if (result) {
        fetchData();
        setKaydetTiklandimi(false);
        enqueueSnackbar("Mutabakat Kaydedildi", {
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
        setKaydetTiklandimi(false);
        enqueueSnackbar("Mutabakat Kaydedilemedi", {
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
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const mutabakatVerileri = await getMutabakat(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        grupKodu,
        hesapAdi
      );
      setVerileriGetirTiklandimi(false);
      const rowsAll: any = [];

      mutabakatVerileri.forEach((veri: any) => {
        const newRow: any = [
          veri.id,
          veri.secim,
          veri.kebirKodu,
          veri.detayKodu,
          veri.hesapAdi,
          veri.borc + veri.alacak,
          veri.bakiye,
          veri.ortalamaBakiyeSecilen,
          veri.yargisalRastgeleSecilen,
          veri.gelenYanit,
          veri.fark,
          veri.orneklemeyeAlinmadi,
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
    if (verileriGetirTiklandimi) {
      setOpenCartAlert(true);
      setFetchedData([]);
      setRowCount(0);
      fetchData();
    } else {
      handleOzet();
      setOpenCartAlert(false);
    }
  }, [verileriGetirTiklandimi]);

  useEffect(() => {
    if (kaydetTiklandimi) {
      setOpenCartAlert2(true);
      setFetchedData([]);
      setRowCount(0);
      const keys = [
        "id",
        "secim",
        "yargisalRastgeleSecilen",
        "gelenYanit",
        "fark",
        "orneklemeyeAlinmadi",
      ];

      const jsonData = fetchedData
        .filter((item: any) => item[0])
        .map((item: any) => {
          let obj: { [key: string]: any } = {};
          keys.forEach((key, index) => {
            if (
              key === "yargisalRastgeleSecilen" ||
              key === "gelenYanit" ||
              key === "fark"
            ) {
              if (
                item[index + 6] == undefined ||
                item[index + 6] == null ||
                item[index + 6] == ""
              ) {
                obj[key] = 0;
              } else {
                obj[key] = item[index + 6];
              }
            } else if (key == "orneklemeyeAlinmadi") {
              if (
                item[index + 6] == undefined ||
                item[index + 6] == null ||
                item[index + 6] == ""
              ) {
                obj[key] = "Örneklenmeye Alınmadı";
              } else {
                obj[key] = item[index + 6];
              }
            } else {
              if (
                item[index] == undefined ||
                item[index] == null ||
                item[index] == ""
              ) {
                obj[key] = false;
              } else {
                obj[key] = item[index];
              }
            }
          });

          return obj;
        });

      handleUpdate(jsonData);
    } else {
      setOpenCartAlert2(false);
    }
  }, [kaydetTiklandimi]);

  useEffect(() => {
    if (!varsayilanaDonTiklandimi && fetchedData.length > 0) {
      fetchData();
    }
  }, [varsayilanaDonTiklandimi]);

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
        saveAs(blob, "Mutabakat.xlsx");
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
      {fetchedData.length > 0 && (
        <Paper
          elevation={2}
          sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor: "primary.light",
            mb: 3,
          }}
        >
          <TableContainer>
            <Table>
              <TableBody>
                {groupedRows.map((group, index) => (
                  <TableRow key={index}>
                    {group.map((item, i) => (
                      <>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            width: "16.66%",
                            border: "none",
                          }}
                        >
                          {item?.label}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ width: "16.66%", border: "none" }}
                        >
                          {item?.value}
                        </TableCell>
                      </>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
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
        colWidths={[0, 40, 60, 80, 100, 80, 80, 80, 80, 80, 80, 80]}
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
        contextMenu={{
          items: {
            mutabakat_dogrulama_mektubu_olustur: {
              name: "Mutabakat Doğrulama Mektubu Oluştur",
              callback: async function (key, selection) {
                const row = await handleGetRowData(selection[0].start.row);
                if (row[1]) {
                  window.open(
                    `/DenetimKanitlari/Mutabakat/MutabakatSecimiVeKontrol/MutabakatDogrulamaMektubu/${row[3]}`,
                    "_blank"
                  );
                } else {
                  enqueueSnackbar("Önce Seçim Yapmalısınız", {
                    variant: "warning",
                    autoHideDuration: 5000,
                    style: {
                      backgroundColor:
                        customizer.activeMode === "dark"
                          ? theme.palette.warning.light
                          : theme.palette.warning.main,
                      maxWidth: "720px",
                    },
                  });
                }
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
      {openCartAlert && (
        <InfoAlertCart
          openCartAlert={openCartAlert}
          setOpenCartAlert={setOpenCartAlert}
        ></InfoAlertCart>
      )}
      {openCartAlert2 && (
        <InfoAlertCart
          openCartAlert={openCartAlert2}
          setOpenCartAlert={setOpenCartAlert2}
        ></InfoAlertCart>
      )}
    </>
  );
};

export default Mutabakat;
