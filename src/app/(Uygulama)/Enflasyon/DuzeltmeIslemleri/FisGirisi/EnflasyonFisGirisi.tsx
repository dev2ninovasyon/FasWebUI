import "@/lib/handsontableSetup";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import CustomHotTable from "@/components/HotTableWrapper";




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
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import { createFisGirisiVerisi, getFisNo } from "@/api/Enflasyon/FisGirisi";
import { IconDeviceFloppy } from "@tabler/icons-react";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";

// register Handsontable's modules
numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Props {
  konsolidasyonMu?: boolean;
  kod: string;
  ad: string;
  fisType: string;
  genelHesapPlaniListesi: any;
  hazirFislerTiklandimi: boolean;
  handleFilterChange: (str: string) => void;
  setHazirFislerTiklandimi: (bool: boolean) => void;
}

interface Veri {
  fisNo: number;
  detayKodu: string;
  hesapAdi: string;
  borc: number;
  alacak: number;
  aciklama: string;
}

const FisGirisi: React.FC<Props> = ({
  konsolidasyonMu = false,
  kod,
  ad,
  fisType,
  genelHesapPlaniListesi,
  hazirFislerTiklandimi,
  handleFilterChange,
  setHazirFislerTiklandimi,
}) => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const [rowCount, setRowCount] = useState<number>(1);

  const [fetchedData, setFetchedData] = useState<any[]>([]);

  const [duplicatesControl, setDuplicatesControl] = useState(false);

  const [endRow, setEndRow] = useState(-1);

  const [lastFisNo, setLastFisNo] = useState(1);

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

  const numberValidator = (
    value: string,
    callback: (value: boolean) => void
  ) => {
    const numberRegex = /^[0-9]+(\.[0-9]+)?$/; // Regex to match numbers with optional decimal part
    if (numberRegex.test(value)) {
      callback(true);
    } else {
      enqueueSnackbar("Hatalı Sayı Girişi. Ondalıklı Sayı Girilmelidir.", {
        variant: "warning",
        autoHideDuration: 5000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.warning.dark
              : theme.palette.warning.main,
          maxWidth: "720px",
        },
      });
      callback(false);
    }
  };

  const integerValidator = (
    value: string,
    callback: (value: boolean) => void
  ) => {
    const integerRegex = /^\d+$/; // Regex to match integers only
    if (integerRegex.test(value)) {
      callback(true);
    } else {
      enqueueSnackbar("Hatalı Sayı Girişi. Tam Sayı Girilmelidir.", {
        variant: "warning",
        autoHideDuration: 5000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.warning.dark
              : theme.palette.warning.main,
          maxWidth: "720px",
        },
      });
      callback(false);
    }
  };

  function isRowEmpty(row: Veri): boolean {
    return Object.values(row).every(
      (value) =>
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.trim() === "")
    );
  }

  function findDuplicateRows(data: Veri[]): number[] {
    const seenRows = new Set<string>();
    const duplicates: number[] = [];

    data.forEach((row, index) => {
      if (isRowEmpty(row)) return; // tüm değerler boşsa geç

      const rowString = JSON.stringify(row, Object.keys(row).sort());

      if (seenRows.has(rowString)) {
        duplicates.push(index + 1); // 1-based row number
      } else {
        seenRows.add(rowString);
      }
    });

    return duplicates;
  }

  useEffect(() => {
    if (duplicatesControl) {
      const duplicateRowNumbers = findDuplicateRows(fetchedData);

      if (duplicateRowNumbers.length > 0) {
        const duplicatesMessage = duplicateRowNumbers.join(", ") + " ";

        enqueueSnackbar(
          `${duplicatesMessage}Numaralı Satır${
            duplicateRowNumbers.length > 1 ? "lar" : ""
          } Tekrar Eden Veri İçeriyor. Kontrol Edin.`,
          {
            variant: "warning",
            autoHideDuration: 5000,
            style: {
              backgroundColor:
                customizer.activeMode === "dark"
                  ? theme.palette.warning.dark
                  : theme.palette.warning.main,
              maxWidth: "720px",
            },
          }
        );
      }

      setDuplicatesControl(false);
    }
  }, [duplicatesControl]);

  const colHeaders = [
    "No",
    "D. Hesap Kodu",
    "Hesap Adı",
    "Borç",
    "Alacak",
    "Açıklama",
  ];

  const columns = [
    {
      type: "numeric",
      columnSorting: true,
      className: "htLeft",
      validator: integerValidator,
      allowInvalid: false,
    }, // Fiş No
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
    }, // Hesap Kodu
    { type: "text", columnSorting: true, className: "htLeft" }, // Hesap Adı
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
    }, // Borç
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
    }, // Alacak
    { type: "text", columnSorting: true, className: "htLeft" }, // Açıklama
  ];



  const afterRenderer = (
    TD: any,
    row: any,
    col: any,
    prop: any,
    value: any,
    cellProperties: any
  ) => {
    //TD.style.textAlign = "left";

    if (row <= endRow && (value == undefined || value == null || value == "")) {
      TD.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
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

  const handleCreateRow = async (index: number, amount: number) => {
    if (amount == 1 && index != rowCount - 1) {
      console.log(
        `Yeni satır(lar) eklendi: ${amount} adet satır ${index} indexinden itibaren.`
      );

      const hotInstance = hotTableComponent.current.hotInstance;
      hotInstance.setDataAtCell(index, 0, lastFisNo); // index satır, 0 sütun, 5 değer
    }
  };

  const handleAfterRemoveRow = async (
    index: number,
    amount: number,
    physicalRows: number[],
    source: any
  ) => {
    console.log(
      `Satır(lar) silindi: ${amount} adet satır ${index} indexinden itibaren.${physicalRows}`
    );
  };

  const afterPaste = async (data: any, coords: any) => {
    console.log("Pasted data:", data);

    console.log("Pasted startRow coordinates:", coords[0].startRow);
    console.log("Pasted endRow coordinates:", coords[0].endRow);
    console.log("Pasted startCol coordinates:", coords[0].startCol);
    console.log("Pasted endCol coordinates:", coords[0].endCol);

    if (endRow < coords[0].endRow) {
      setEndRow(coords[0].endRow);
    }
  };

  const handleAfterChange = (changes: any, source: any) => {
    if (source === "loadData") {
      return; // Skip this hook on loadData
    }
    if (changes) {
      for (const [row, prop, oldValue, newValue] of changes) {
        console.log(
          `Changed cell at row: ${row}, col: ${prop}, from: ${oldValue}, to: ${newValue}`
        );

        if (prop === 1) {
          handleFilterChange(newValue);

          const matched = genelHesapPlaniListesi.find(
            (item: any) => item.kod === newValue
          );

          if (matched && matched.adi != "") {
            if (hotTableComponent.current) {
              hotTableComponent.current.hotInstance.setDataAtCell(
                row,
                2,
                matched.adi
              );
            }
          }
        }
        if (prop === 3) {
          setToplamBorc((prevToplamBorc) => {
            const newNumber =
              parseFloat(
                (newValue ? String(newValue) : "0").replace(",", "")
              ) || 0;
            const oldNumber =
              parseFloat(
                (oldValue ? String(oldValue) : "0").replace(",", "")
              ) || 0;
            return prevToplamBorc + (newNumber - oldNumber);
          });
        }

        if (prop === 4) {
          setToplamAlacak((prevToplamAlacak) => {
            const newNumber =
              parseFloat(
                (newValue ? String(newValue) : "0").replace(",", "")
              ) || 0;
            const oldNumber =
              parseFloat(
                (oldValue ? String(oldValue) : "0").replace(",", "")
              ) || 0;
            return prevToplamAlacak + (newNumber - oldNumber);
          });
        }
      }
    }
  };

  const handleBeforeChange = (changes: any[]) => {
    if (!changes) return;

    for (let i = 0; i < changes.length; i++) {
      const [row, prop, oldValue, newValue] = changes[i];

      if ([3, 4].includes(prop)) {
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

  const handleCreateFisGirisiVerisi = async () => {
    let controlBorcAlacak = true;
    let controlAnaHesap = true;
    let controlHesaplar = true;
    let controlDetayKoduHesapAdi = true;

    const keys = [
      "denetciId",
      "denetlenenId",
      "yil",
      "fisTipi",
      "fisNo",
      "detayKodu",
      "hesapAdi",
      "borc",
      "alacak",
      "aciklama",
    ];

    const jsonData = fetchedData.map((item: any[]) => {
      let obj: { [key: string]: any } = {};
      keys.forEach((key, index) => {
        if (
          (item[1] == undefined || item[1] == null || item[1] == "") &&
          (item[2] == undefined || item[2] == null || item[2] == "")
        ) {
          controlDetayKoduHesapAdi = false;
          if (item[1] == "") {
            if (
              item[1].startsWith("590") ||
              item[1].startsWith("591") ||
              item[1].startsWith("690") ||
              item[1].startsWith("692")
            ) {
              controlHesaplar = false;
            }
            if (item[1].length == 3) {
              controlAnaHesap = false;
            }
          }
        }
        if (item[3] === 0 && item[4] === 0) {
          controlBorcAlacak = false;
        } else {
          if (
            (item[3] === undefined || item[3] === null) &&
            (item[4] === undefined || item[4] === null)
          ) {
            controlBorcAlacak = false;
          } else {
            if (item[3] === undefined || item[3] === null) {
              controlBorcAlacak = true;
            } else if (item[4] === undefined || item[4] === null) {
              controlBorcAlacak = true;
            } else {
              if (item[3] > 0 && item[4] > 0) {
                controlBorcAlacak = false;
              } else {
                controlBorcAlacak = true;
              }
            }
          }
        }

        if (key === "denetciId") {
          obj[key] = user.denetciId;
        } else if (key === "denetlenenId") {
          obj[key] = user.denetlenenId;
        } else if (key === "yil") {
          obj[key] = user.yil;
        } else if (key === "fisTipi") {
          obj[key] = fisType;
        } else if (key === "borc" || key === "alacak") {
          if (
            (key === "borc" || key === "alacak") &&
            (item[index - 4] == null || item[index - 4] == undefined)
          ) {
            obj[key] = 0.0;
          } else if (typeof item[index - 4] === "string") {
            obj[key] = parseFloat(item[index - 4].replace(",", "."));
          } else {
            obj[key] = item[index - 4];
          }
        } else {
          if (
            key === "aciklama" &&
            (item[index - 4] == null || item[index - 4] == undefined)
          ) {
            obj[key] = "";
          } else {
            obj[key] = item[index - 4];
          }
        }
      });
      return obj;
    });
    let control =
      controlBorcAlacak &&
      controlAnaHesap &&
      controlHesaplar &&
      controlDetayKoduHesapAdi;
    if (control) {
      try {
        const result = await createFisGirisiVerisi(jsonData,
          konsolidasyonMu
        );
        if (result) {
          await fetchFisNo();
          setFetchedData([]);
          setEndRow(-1);

          enqueueSnackbar("Fiş Kaydedildi", {
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
          enqueueSnackbar("Fiş Kaydedilemedi", {
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
        console.log("Bir hata oluştu:", error);
      }
    } else {
      if (!controlDetayKoduHesapAdi) {
        enqueueSnackbar("Detay Kodu Ve Hesap Adı Boş Bırakılamaz", {
          variant: "warning",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.warning.dark
                : theme.palette.warning.main,
          },
        });
      } else if (!controlBorcAlacak) {
        enqueueSnackbar("Borç Yada Alacak Tutarı Girmelisiniz", {
          variant: "warning",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.warning.dark
                : theme.palette.warning.main,
          },
        });
      } else if (!controlAnaHesap) {
        enqueueSnackbar("Ana Hesaba Fiş Girişi Gerçekleştiremezsiniz", {
          variant: "warning",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.warning.dark
                : theme.palette.warning.main,
          },
        });
      } else if (!controlHesaplar) {
        enqueueSnackbar(
          "Dönem Kârı İle İlgili Hesaba Fiş Girişi Gerçekleştiremezsiniz",
          {
            variant: "warning",
            autoHideDuration: 5000,
            style: {
              backgroundColor:
                customizer.activeMode === "dark"
                  ? theme.palette.warning.dark
                  : theme.palette.warning.main,
            },
          }
        );
      }
    }
  };

  const fetchFisNo = async () => {
    try {
      const fisNo = await getFisNo(user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        konsolidasyonMu
      );
      setLastFisNo(fisNo + 1);
      const hotInstance = hotTableComponent.current.hotInstance;
      hotInstance.setDataAtCell(0, 0, fisNo + 1); // index satır, 0 sütun, 5 değer
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchFisNo();
  }, []);

  useEffect(() => {
    if (hazirFislerTiklandimi) {
      fetchFisNo();
      setHazirFislerTiklandimi(false);
    }
  }, [hazirFislerTiklandimi]);

  useEffect(() => {
    if (hotTableComponent.current) {
      const row = hotTableComponent.current.hotInstance.countRows() - 1;
      if (kod != "" && ad != "") {
        const hotInstance = hotTableComponent.current.hotInstance;
        hotInstance.setDataAtCell(row, 1, kod);
        hotInstance.setDataAtCell(row, 2, ad);
      }
    }
  }, [kod, ad]);

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
      <Grid container>
        <Grid
          size={{
            xs: 12,
            lg: 12
          }}>
          <CustomHotTable theme={customizer.activeMode === "dark" ? "ht-theme-horizon-dark" : "ht-theme-horizon"}
            style={{
              width: "100%",
              minHeight: "100px",
              maxHeight: 684,
              maxWidth: "100%",
              overflow: smDown ? "auto" : "",
            }}
            language={dictionary.languageCode}
            ref={hotTableComponent}
            data={fetchedData}
            colHeaders={colHeaders}
            columns={columns}
            colWidths={[32, 100, 150, 100, 100, 100]}
            stretchH="all"
            manualColumnResize={true}
            rowHeaders={true}
            rowHeights={35}
            autoWrapRow={true}
            minRows={rowCount}
            minCols={6}
            filters={true}
            columnSorting={true}
            dropdownMenu={[
              "filter_by_condition",
              "filter_by_value",
              "filter_action_bar",
            ]}
            licenseKey="non-commercial-and-evaluation" // For non-commercial use only
            afterRenderer={afterRenderer}
            afterPaste={afterPaste} // Add afterPaste hook
            afterCreateRow={handleCreateRow} // Add createRow hook
            afterRemoveRow={handleAfterRemoveRow} // Add afterRemoveRow hook
            afterChange={handleAfterChange} // Add afterChange hook
            beforeChange={handleBeforeChange} // Add beforeChange hook
            contextMenu={{
              items: {
                row_above: {},
                row_below: {},
                remove_row: {},
                alignment: {},
                copy: {},
                fis_esitle: {
                  name: "Fiş eşitle",
                  callback: async function (key, selection) {
                    const hotInstance = hotTableComponent.current.hotInstance;
                    if (fark < 0) {
                      hotInstance.setDataAtCell(
                        selection[0].start.row,
                        3,
                        Math.abs(fark)
                      );
                      hotInstance.setDataAtCell(
                        selection[0].start.row,
                        4,
                        formatNumber(0)
                      );
                    } else if (fark == 0) {
                      hotInstance.setDataAtCell(
                        selection[0].start.row,
                        3,
                        formatNumber(0)
                      );
                      hotInstance.setDataAtCell(
                        selection[0].start.row,
                        4,
                        formatNumber(0)
                      );
                    } else {
                      hotInstance.setDataAtCell(
                        selection[0].start.row,
                        3,
                        formatNumber(0)
                      );
                      hotInstance.setDataAtCell(
                        selection[0].start.row,
                        4,
                        Math.abs(fark)
                      );
                    }
                  },
                },
              },
            }}
          />
        </Grid>
      </Grid>
      <Grid container justifyContent={"end"} spacing={1}>
        <Grid
          size={{
            xs: 12,
            lg: 2
          }}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              width: "100%",
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
        </Grid>
        <Grid
          size={{
            xs: 12,
            lg: 2
          }}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              width: "100%",
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
        </Grid>
        <Grid
          display={"flex"}
          alignItems={"center"}
          sx={{ py: 2, pl: { lg: 2 } }}
          size={{
            xs: 12,
            lg: 2
          }}>
          <Button
            size="medium"
            variant="outlined"
            color="primary"
            startIcon={<IconDeviceFloppy width={18} />}
            onClick={() => handleCreateFisGirisiVerisi()}
            sx={{ width: "100%" }}
          >
            Kaydet
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default FisGirisi;

