import "@/lib/handsontableSetup";
import Handsontable from "handsontable";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  Grid,
  useTheme,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { getFormat } from "@/api/Veri/base";
import { enqueueSnackbar } from "notistack";
import ExceleAktarButton from "@/app/(Uygulama)/components/Veri/ExceleAktarButton";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";
import {
  createVukMizanVerisi,
  deleteVukMizanVerisi,
  getVukMizanVerileriByDenetciDenetlenenYil,
} from "@/api/Veri/VukMizan";
import WarnBox from "@/app/(Uygulama)/components/Alerts/WarnBox";
import { IconX, IconAlertTriangle } from "@tabler/icons-react";

// register Handsontable's modules
numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Veri {
  kebirKodu: number;
  detayHesapKodu: string;
  hesapAdi: string;
  borcTutari: number;
  alacakTutari: number;
  paraBirimi: string;
}

interface Props {
  genelHesapPlaniListesi: any;
  kaydetTiklandimi: boolean;
  setKaydetTiklandimi: (b: boolean) => void;
  onLoadingChange?: (loading: boolean) => void;
  onDataLoaded?: (hasData: boolean) => void;
}

const VukMizan: React.FC<Props> = ({
  genelHesapPlaniListesi,
  kaydetTiklandimi,
  setKaydetTiklandimi,
  onLoadingChange,
  onDataLoaded,
}) => {
  const hotTableContainer = useRef<HTMLDivElement>(null);
  const hotTableInstanceRef = useRef<Handsontable | null>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [rowCount, setRowCount] = useState<number>(200);

  const [fetchedData, setFetchedData] = useState<any[]>([]);

  const [duplicatesControl, setDuplicatesControl] = useState(false);

  const [duplicateMessage, setDuplicateMessage] = useState<string>("");
  const [showAlert, setShowAlert] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<number[][]>([]);
  const [noDataOpen, setNoDataOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCleaningSaving, setIsCleaningSaving] = useState(false);

  const uyari = [
    "Boş Bırakılmaması Gereken Sütunlar: Kebir Kodu, Detay Hesap Kodu, Hesap Adı, Borç, Alacak",
    "Kebir Kodu Sütunu Boş Bırakılmamalıdır Ve Tam Sayı Girilmelidir.",
    "Detay Hesap Kodu Sütunu Boş Bırakılmamalıdır Ve Seçeneklerden Biri Seçilmelidir.",
    "Hesap Adı Sütunu Boş Bırakılmamalıdır.",
    "Borç Ve Alacak Sütunları Boş Bırakılmamalıdır Ve Ondalıklı Sayı Girilmelidir.",
    "Para Birimi Sütununda Seçeneklerden Biri Seçilmelidir Veya Boş Bırakılabilir. (3 Haneli Detay Kodu İçin Otomatik Boş Tutulur)",
    "Detay Kodu Sütunu 3 Haneli Ise Para Birimi Otomatik Olarak Boş Tutulacaktır.",
  ];

  const [endRow, setEndRow] = useState(-1);

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

  const integerValidator = (
    value: string,
    callback: (value: boolean) => void
  ) => {
    const integerRegex = /^\d+$/; // Regex to match integers only
    if (integerRegex.test(value)) {
      callback(true);
    } else {
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

  function groupDuplicateRows(data: any[]): number[][] {
    const rowMap = new Map<string, number[]>();

    data.forEach((row, index) => {
      if (isRowEmpty(row)) return;

      const rowString = JSON.stringify(row, Object.keys(row).sort());

      if (!rowMap.has(rowString)) {
        rowMap.set(rowString, []);
      }
      rowMap.get(rowString)!.push(index + 1); // 1-based row number
    });

    // Sadece 2+ tekrar eden satırları döndür (duplicate olanları)
    const duplicateGroups: number[][] = [];
    rowMap.forEach((rowNumbers, _) => {
      if (rowNumbers.length > 1) {
        duplicateGroups.push(rowNumbers.sort((a, b) => a - b));
      }
    });

    return duplicateGroups.sort((a, b) => a[0] - b[0]);
  }

  useEffect(() => {
    if (duplicatesControl) {
      const duplicateRowGroups = groupDuplicateRows(fetchedData);

      if (duplicateRowGroups.length > 0) {
        setDuplicateGroups(duplicateRowGroups);
        setShowDuplicateDialog(true);
      }

      setDuplicatesControl(false);
    }
  }, [duplicatesControl]);

  const colHeaders = [
    "Kebir Kodu",
    "D. Hesap Kodu",
    "Hesap Adı",
    "Borç",
    "Alacak",
    "Para Birimi",
  ];

  const columns = [
    {
      type: "numeric",
      columnSorting: true,
      className: "htLeft",
      validator: integerValidator,
      allowInvalid: false,
    }, // Kebir Kodu
    {
      type: "autocomplete",
      source: function (query: string, process: (result: string[]) => void) {
        let results = genelHesapPlaniListesi
          .filter((item: any) => item.kod.includes(query))
          .slice(0, 50)
          .map((item: any) => item.kod);
        process(results);
      },
      strict: false,
      allowInvalid: true,
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
      validator: numberValidator,
      allowInvalid: false,
    }, // Borç Tutarı
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
    }, // Alacak Tutarı
    {
      type: "autocomplete",
      source: [
        "TL",
        "USD",
        "EUR",
        "GBP",
        "CHF",
        "RUB",
        "CNY",
        "JPY",
        "SAR",
        "Diğer",
      ],
      className: "htLeft",
      strict: false,
      allowInvalid: false,
    }, // Para Birimi
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
    if (hotTableInstanceRef.current) {
      const cellMeta = hotTableInstanceRef.current.getDataAtRow(row);
      console.log("Satır Verileri:", cellMeta);
      return cellMeta;
    }
  };

  const handleCreateRow = async (index: number, amount: number) => {
    if (amount == 1 && index != rowCount - 1) {
      console.log(
        `Yeni satır(lar) eklendi: ${amount} adet satır ${index} indexinden itibaren.`
      );
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

  const handleAfterChange = async (changes: any, source: any) => {
    if (source === "loadData" || !changes) return;

    const hesapMap = new Map<string, { kod: string; adi: string }>(
      genelHesapPlaniListesi.map((item: any) => [item.kod, item])
    );

    const rowsToUpdate = new Map<number, { kod?: string; adi?: string; paraBirimi?: string }>();

    for (const [row, prop, oldValue, newValue] of changes) {
      if (prop === 1 && newValue !== oldValue) {
        const matched = hesapMap.get(newValue);
        const currentRowData = rowsToUpdate.get(row) ?? {};

        if (newValue && typeof newValue === "string" && newValue.length >= 3) {
          if (
            newValue.substring(0, 3) !==
            hotTableInstanceRef.current?.getDataAtCell(row, 0)
          ) {
            currentRowData.kod = newValue.substring(0, 3);
          }

          // 3 haneli ise Para Birimi boş olmalı
          if (newValue.length === 3) {
            currentRowData.paraBirimi = "";
          }
        }

        if (
          matched?.adi &&
          matched.adi !==
          hotTableInstanceRef.current?.getDataAtCell(row, 2)
        ) {
          currentRowData.adi = matched.adi;
        }

        rowsToUpdate.set(row, currentRowData);
      }
    }

    // Toplu hücre güncellemeleri (tek render tetikler)
    hotTableInstanceRef.current?.batch(() => {
      rowsToUpdate.forEach((data, row) => {
        if (data.kod !== undefined) {
          hotTableInstanceRef.current?.setDataAtCell(
            row,
            0,
            data.kod
          );
        }
        if (data.adi !== undefined) {
          hotTableInstanceRef.current?.setDataAtCell(
            row,
            2,
            data.adi
          );
        }
        if (data.paraBirimi !== undefined) {
          hotTableInstanceRef.current?.setDataAtCell(
            row,
            5,
            data.paraBirimi
          );
        }
      });
    });
  };

  const handleBeforeChange = (changes: any[]) => {
    if (!changes) return;

    for (let i = 0; i < changes.length; i++) {
      const [row, prop, oldValue, newValue] = changes[i];

      if ([3, 4].includes(prop)) {  // Borç ve Alacak sütunları
        if (typeof newValue === "string") {
          let normalized = newValue.trim();

          // Eğer virgül varsa → Türkçe format (47.792,87 veya 47792,87)
          if (normalized.includes(',')) {
            // Bin ayırıcıları (noktaları) kaldır, virgülü noktaya çevir
            // 47.792,87 → 47792.87
            normalized = normalized.replace(/\./g, '').replace(',', '.');
          }
          // Eğer sadece nokta varsa → International format (47792.87) → olduğu gibi

          changes[i][3] = normalized;
        }
      }
    }
  };

  const handleCreateVukMizanVerisi = async (cleanDuplicates: boolean = false) => {
    onLoadingChange?.(true);
    setIsLoading(true);
    try {
      let dataToSave = hotTableInstanceRef.current?.getData() || fetchedData;

      // Eğer cleanDuplicates true ise, çift kayıtları temizle
      if (cleanDuplicates) {
        const duplicateRowNumbers = findDuplicateRows(dataToSave);
        dataToSave = dataToSave.filter((_: any, index: number) => !duplicateRowNumbers.includes(index + 1));
      }

      if (dataToSave.filter((item: any) => item[0]).length == 0) {
        await handleDeleteVukMizanVerisi();
        onLoadingChange?.(false);
        setIsLoading(false);
        return;
      }

      const keys = [
        "denetciId",
        "denetlenenId",
        "yil",
        "kebirKodu",
        "detayHesapKodu",
        "hesapAdi",
        "borc",
        "alacak",
        "paraBirimi",
      ];
      const jsonData = dataToSave
        .filter((item: any) => item[0])
        .map((item: any) => {
          let obj: { [key: string]: any } = {};
          const detayHesapKodu = item[1];

          keys.forEach((key, index) => {
            if (key === "denetciId") {
              obj[key] = user.denetciId;
            } else if (key === "denetlenenId") {
              obj[key] = user.denetlenenId;
            } else if (key === "yil") {
              obj[key] = user.yil;
            } else if (key === "borc" || key === "alacak") {
              if (
                item[index - 3] == undefined ||
                item[index - 3] == null ||
                item[index - 3] == ""
              ) {
                obj[key] = 0.0;
              } else {
                obj[key] = item[index - 3];
              }
            } else if (key === "paraBirimi") {
              // 3 haneli Detay Kodu ise Para Birimi boş tutulmalı
              if (detayHesapKodu && typeof detayHesapKodu === "string" && detayHesapKodu.length === 3) {
                obj[key] = "";
              } else if (
                item[index - 3] == undefined ||
                item[index - 3] == null ||
                item[index - 3] == ""
              ) {
                obj[key] = "TL";
              } else {
                obj[key] = item[index - 3];
              }
            } else {
              if (
                item[index - 3] == undefined ||
                item[index - 3] == null ||
                item[index - 3] == ""
              ) {
                obj[key] = null;
              } else {
                obj[key] = item[index - 3];
              }
            }
          });

          return obj;
        });

      const result = await createVukMizanVerisi(jsonData);
      if (result) {
        await fetchData();
        setDuplicatesControl(true);
        setDuplicateGroups([]);
        setShowDuplicateDialog(false);
        setIsLoading(false);
        onLoadingChange?.(false);
        onDataLoaded?.(true); // Veri başarıyla kaydedildi
        enqueueSnackbar("Kaydedildi", {
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
        setIsLoading(false);
        onLoadingChange?.(false);
        enqueueSnackbar("Kaydedilemedi", {
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
      setIsLoading(false);
      onLoadingChange?.(false);
      console.log("Bir hata oluştu:", error);
    }
  };

  const handleDeleteVukMizanVerisi = async () => {
    try {
      const result = await deleteVukMizanVerisi(
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0
      );
      if (result) {
        await fetchData();
        setIsLoading(false);
        onLoadingChange?.(false);
        enqueueSnackbar("Kaydedildi", {
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
        setIsLoading(false);
        onLoadingChange?.(false);
        enqueueSnackbar("Kaydedilemedi", {
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
      console.log("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    setEndRow(-1);

    try {
      const vukMizanVerileri = await getVukMizanVerileriByDenetciDenetlenenYil(
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0
      );

      const rowsAll: any = [];
      vukMizanVerileri.forEach((veri: any) => {
        const newRow: any = [
          veri.kebirKodu,
          veri.detayHesapKodu,
          veri.hesapAdi,
          veri.borc,
          veri.alacak,
          veri.paraBirimi,
        ];
        rowsAll.push(newRow);
      });
      setFetchedData(rowsAll);
      setNoDataOpen(rowsAll.length === 0);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const fetchRowCount = async () => {
    try {
      const format = await getFormat("Vuk Mizan");
      if (format && format.satirSayisi) {
        setRowCount(format.satirSayisi);
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Non-blocking çağrı
    fetchRowCount().catch((error) => {
      console.log("RowCount fetch başarısız (görmezden gelinecek):", error);
    });
  }, []);

  const handleCheckDuplicatesBeforeSave = async () => {
    // HotTable instance'ünden güncel verileri al (state'ten değil)
    const hotTableInstance = hotTableInstanceRef.current;
    const currentData = hotTableInstance?.getData() || fetchedData;

    const duplicateGroups = groupDuplicateRows(currentData);

    if (duplicateGroups.length > 0) {
      setDuplicateGroups(duplicateGroups);
      setShowDuplicateDialog(true);
    } else {
      // Çift kayıt yok, direkt kaydet
      await handleCreateVukMizanVerisi(false);
    }
  };

  const handleCleanAndSave = async () => {
    // HotTable instance'ünden güncel verileri al
    const currentData = hotTableInstanceRef.current?.getData() || fetchedData;

    // Çift satırları gruplandır
    const duplicateGroups = groupDuplicateRows(currentData);

    // Tüm duplicate satırları flatten et
    const duplicateRowNumbers = duplicateGroups.flat();

    // Çift satırları filtrele
    const cleanedData = currentData.filter((_: any, index: number) => !duplicateRowNumbers.includes(index + 1));

    // HotTable'ı görsel olarak update et
    hotTableInstanceRef.current?.loadData(cleanedData);
    setFetchedData(cleanedData);

    // Loading state başla
    setIsCleaningSaving(true);

    // Çift satırların hepsini sil mesajı göster
    enqueueSnackbar(`${duplicateRowNumbers.length} satır siliniyor, veriler kaydediliyor...`, {
      variant: "info",
      autoHideDuration: 3000,
      style: {
        backgroundColor:
          customizer.activeMode === "dark"
            ? theme.palette.info.light
            : theme.palette.info.main,
        maxWidth: "720px",
      },
    });

    // Temizlenmiş veriyi kaydet
    try {
      const keys = [
        "denetciId",
        "denetlenenId",
        "yil",
        "kebirKodu",
        "detayHesapKodu",
        "hesapAdi",
        "borc",
        "alacak",
        "paraBirimi",
      ];

      const jsonData = cleanedData
        .filter((item: any) => item[0])
        .map((item: any) => {
          let obj: { [key: string]: any } = {};
          const detayHesapKodu = item[1];

          keys.forEach((key, index) => {
            if (key === "denetciId") {
              obj[key] = user.denetciId;
            } else if (key === "denetlenenId") {
              obj[key] = user.denetlenenId;
            } else if (key === "yil") {
              obj[key] = user.yil;
            } else if (key === "borc" || key === "alacak") {
              if (
                item[index - 3] == undefined ||
                item[index - 3] == null ||
                item[index - 3] == ""
              ) {
                obj[key] = 0.0;
              } else {
                obj[key] = item[index - 3];
              }
            } else if (key === "paraBirimi") {
              // 3 haneli Detay Kodu ise Para Birimi boş tutulmalı
              if (detayHesapKodu && typeof detayHesapKodu === "string" && detayHesapKodu.length === 3) {
                obj[key] = "";
              } else if (
                item[index - 3] == undefined ||
                item[index - 3] == null ||
                item[index - 3] == ""
              ) {
                obj[key] = "TL";
              } else {
                obj[key] = item[index - 3];
              }
            } else {
              if (
                item[index - 3] == undefined ||
                item[index - 3] == null ||
                item[index - 3] == ""
              ) {
                obj[key] = null;
              } else {
                obj[key] = item[index - 3];
              }
            }
          });

          return obj;
        });

      const result = await createVukMizanVerisi(jsonData);
      if (result) {
        await fetchData();
        setDuplicatesControl(true);

        enqueueSnackbar("Kaydedildi", {
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

        // Başarıdan sonra dialog kapat
        setShowDuplicateDialog(false);
      } else {
        enqueueSnackbar("Kaydedilemedi", {
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
      console.log("Temizleme kaydetme sırasında hata:", error);
      enqueueSnackbar("Kayıt sırasında hata oluştu", {
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
    } finally {
      setIsCleaningSaving(false);
    }
  };

  useEffect(() => {
    if (kaydetTiklandimi) {
      handleCheckDuplicatesBeforeSave();
      setKaydetTiklandimi(false);
    }
  }, [kaydetTiklandimi]);

  // HotTable'daki veri değişikliğini izle ve parent'a bildir
  useEffect(() => {
    const checkHasData = () => {
      const currentData = hotTableInstanceRef.current?.getData() || fetchedData;
      // Boş olmayan satır sayısını kontrol et
      const hasNonEmptyRows = currentData.some((row: any) => {
        if (Array.isArray(row)) {
          return row.some((cell: any) => cell != null && cell !== "" && cell !== undefined);
        } else if (row && typeof row === 'object') {
          return Object.values(row).some((cell: any) => cell != null && cell !== "" && cell !== undefined);
        }
        return false;
      });

      onDataLoaded?.(hasNonEmptyRows);
    };

    checkHasData();
  }, [fetchedData, onDataLoaded]);

  const handleDownload = () => {
    const hotTableInstance = hotTableInstanceRef.current;
    if (!hotTableInstance) return;
    const data = hotTableInstance.getData();

    const processedData = data.map((row: any) => row);

    const headers = hotTableInstance.getColHeader();

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
        saveAs(blob, "VukMizanFormati.xlsx");
        console.log("Excel dosyası başarıyla oluşturuldu");
      } catch (error) {
        console.log("Excel dosyası oluşturulurken bir hata oluştu:", error);
      }
    }
    createExcelFile();
  };

  useEffect(() => {
    if (hotTableInstanceRef.current) {
      hotTableInstanceRef.current.updateSettings({
        theme: customizer.activeMode === "dark" ? 'ht-theme-horizon-dark' : 'ht-theme-horizon',
      });
    }
  }, [customizer.activeMode]);

  useEffect(() => {
    if (hotTableInstanceRef.current && hotTableContainer.current) {
      const diff = customizer.isCollapse
        ? 0
        : customizer.SidebarWidth && customizer.MiniSidebarWidth
          ? customizer.SidebarWidth - customizer.MiniSidebarWidth
          : 0;

      hotTableInstanceRef.current.updateSettings({
        width: customizer.isCollapse
          ? "100%"
          : hotTableContainer.current.clientWidth - diff,
      });
    }
  }, [
    customizer.isCollapse,
    customizer.SidebarWidth,
    customizer.MiniSidebarWidth,
  ]);

  useEffect(() => {
    if (hotTableContainer.current && !hotTableInstanceRef.current) {
      hotTableInstanceRef.current = new Handsontable(hotTableContainer.current, {
        data: fetchedData,
        colHeaders: colHeaders,
        columns: columns,
        language: dictionary.languageCode,
        theme: customizer.activeMode === "dark" ? 'ht-theme-horizon-dark' : 'ht-theme-horizon',
        height: 684,
        colWidths: [45, 45, 60, 55, 55, 45],
        stretchH: 'all',
        manualColumnResize: true,
        rowHeaders: true,
        rowHeights: 35,
        autoWrapRow: true,
        minRows: rowCount,
        minCols: 8,
        filters: true,
        columnSorting: true,
        dropdownMenu: [
          'filter_by_condition',
          'filter_by_value',
          'filter_action_bar',
        ],
        licenseKey: 'non-commercial-and-evaluation',
        afterRenderer: afterRenderer,
        contextMenu: [
          'row_above',
          'row_below',
          'remove_row',
          'alignment',
          'copy',
        ],
        afterPaste: afterPaste,
        afterChange: handleAfterChange,
        beforeChange: handleBeforeChange,
        afterCreateRow: handleCreateRow,
        afterRemoveRow: handleAfterRemoveRow,
        copyPaste: true,
      });
    }

    return () => {
      if (hotTableInstanceRef.current) {
        hotTableInstanceRef.current.destroy();
        hotTableInstanceRef.current = null;
      }
    };
  }, [fetchedData, rowCount, colHeaders, columns, dictionary, customizer, afterRenderer]);

  return (
    <>
      <WarnBox warn={uyari} />
      {showAlert && (
        <Alert
          severity="warning"
          sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setShowAlert(false);
              }}
            >
              <IconX fontSize="inherit" />
            </IconButton>
          }
        >
          {duplicateMessage}
        </Alert>
      )}
      <div
        ref={hotTableContainer}
        style={{
          height: "100%",
          width: "100%",
          maxHeight: 684,
          maxWidth: "100%",
        }}
      />
      <Grid container marginTop={2}>
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

      {/* Duplicate Detection Dialog */}
      <Dialog
        open={showDuplicateDialog}
        onClose={() => setShowDuplicateDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconAlertTriangle size={24} color="#ff9800" />
            Çift Kayıt Uyarısı
          </Box>
          <IconButton
            onClick={() => setShowDuplicateDialog(false)}
            size="small"
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <IconX size={24} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, mt: 1 }}>
            Aşağıdaki satırlar tekrar eden veri içeriyor. Lütfen kontrol edin ve gerekirse düzeltme yapın.
          </Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 500, overflow: "auto" }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 80 }}>Satır No</TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 120 }}>Kebir Kodu</TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 140 }}>D. Hesap Kodu</TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 180 }}>Hesap Adı</TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 100, textAlign: "right" }}>Borç</TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 100, textAlign: "right" }}>Alacak</TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 120 }}>Para Birimi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {duplicateGroups.map((group, groupIndex) => (
                  <>
                    {group.map((rowNum) => {
                      // Her grup için farklı renk (HSL color space)
                      const hue = (groupIndex * 60) % 360;
                      const backgroundColor = `hsl(${hue}, 70%, 85%)`;

                      return (
                        <TableRow
                          key={rowNum}
                          sx={{ backgroundColor: backgroundColor }}
                        >
                          <TableCell sx={{ fontWeight: "500" }}>
                            {rowNum}
                          </TableCell>
                          <TableCell>{(fetchedData[rowNum - 1] as any)?.[0] || "-"}</TableCell>
                          <TableCell>{(fetchedData[rowNum - 1] as any)?.[1] || "-"}</TableCell>
                          <TableCell>{(fetchedData[rowNum - 1] as any)?.[2] || "-"}</TableCell>
                          <TableCell sx={{ textAlign: "right" }}>
                            {(fetchedData[rowNum - 1] as any)?.[3] ? parseFloat((fetchedData[rowNum - 1] as any)[3]).toLocaleString("tr-TR") : "-"}
                          </TableCell>
                          <TableCell sx={{ textAlign: "right" }}>
                            {(fetchedData[rowNum - 1] as any)?.[4] ? parseFloat((fetchedData[rowNum - 1] as any)[4]).toLocaleString("tr-TR") : "-"}
                          </TableCell>
                          <TableCell>{(fetchedData[rowNum - 1] as any)?.[5] || "TL"}</TableCell>
                        </TableRow>
                      );
                    })}
                  </>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={async () => {
              setShowDuplicateDialog(false);
              await handleCreateVukMizanVerisi(false);
            }}
            variant="contained"
            color="primary"
            disabled={isLoading || isCleaningSaving}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? "Kaydediliyor..." : "Bu Şekilde Kaydet"}
          </Button>
          <Button
            onClick={handleCleanAndSave}
            variant="contained"
            color="success"
            disabled={isCleaningSaving || isLoading}
            startIcon={isCleaningSaving ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isCleaningSaving ? "Kaydediliyor..." : "Tekrar Edenleri Temizle Kaydet"}
          </Button>
        </DialogActions>
      </Dialog>
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
          VUK Mizan verisi bulunamadı.
        </Alert>
      </Snackbar>
    </>
  );
};

export default VukMizan;
