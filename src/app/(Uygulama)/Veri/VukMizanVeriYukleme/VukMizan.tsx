import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import "handsontable/dist/handsontable.full.min.css";
import { plus } from "@/utils/theme/Typography";
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
  Paper
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { getFormat } from "@/api/Veri/base";
import { enqueueSnackbar } from "notistack";
import ExceleAktarButton from "@/app/(Uygulama)/components/Veri/ExceleAktarButton";
import ExcelJS from "exceljs";
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
registerAllModules();

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
  const hotTableComponent = useRef<any>(null);

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
            hotTableComponent.current?.hotInstance.getDataAtCell(row, 0)
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
          hotTableComponent.current?.hotInstance.getDataAtCell(row, 2)
        ) {
          currentRowData.adi = matched.adi;
        }

        rowsToUpdate.set(row, currentRowData);
      }
    }

    // Toplu hücre güncellemeleri (tek render tetikler)
    hotTableComponent.current?.hotInstance.batch(() => {
      rowsToUpdate.forEach((data, row) => {
        if (data.kod !== undefined) {
          hotTableComponent.current?.hotInstance.setDataAtCell(
            row,
            0,
            data.kod
          );
        }
        if (data.adi !== undefined) {
          hotTableComponent.current?.hotInstance.setDataAtCell(
            row,
            2,
            data.adi
          );
        }
        if (data.paraBirimi !== undefined) {
          hotTableComponent.current?.hotInstance.setDataAtCell(
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
      // HotTable'dan güncel verileri al (state'ten değil)
      const hotTableInstance = hotTableComponent.current?.hotInstance;
      let dataToSave = hotTableInstance?.getData() || fetchedData;

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
    const hotTableInstance = hotTableComponent.current?.hotInstance;
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
    const hotTableInstance = hotTableComponent.current?.hotInstance;
    const currentData = hotTableInstance?.getData() || fetchedData;
    
    // Çift satırları gruplandır
    const duplicateGroups = groupDuplicateRows(currentData);
    
    // Tüm duplicate satırları flatten et
    const duplicateRowNumbers = duplicateGroups.flat();
    
    // Çift satırları filtrele
    const cleanedData = currentData.filter((_: any, index: number) => !duplicateRowNumbers.includes(index + 1));
    
    // HotTable'ı görsel olarak update et
    hotTableInstance?.loadData(cleanedData);
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
      const hotTableInstance = hotTableComponent.current?.hotInstance;
      const currentData = hotTableInstance?.getData() || [];
      
      // Boş olmayan satır sayısını kontrol et
      const hasNonEmptyRows = currentData.some((row: any) => {
        return row.some((cell: any) => cell != null && cell !== "" && cell !== undefined);
      });
      
      onDataLoaded?.(hasNonEmptyRows);
    };
    
    checkHasData();
  }, [fetchedData, onDataLoaded]);

  const handleDownload = () => {
    const hotTableInstance = hotTableComponent.current.hotInstance;
    const data = hotTableInstance.getData();

    const processedData = data.map((row: any) => row);

    const headers = hotTableInstance.getColHeader();

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
        saveAs(blob, "VukMizanFormati.xlsx");
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
        colWidths={[45, 45, 60, 55, 55, 45]}
        stretchH="all"
        manualColumnResize={true}
        rowHeaders={true}
        rowHeights={35}
        autoWrapRow={true}
        minRows={rowCount}
        minCols={8}
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
        afterPaste={afterPaste} // Add afterPaste hook
        afterChange={handleAfterChange} // Add afterChange hook
        beforeChange={handleBeforeChange} // Add beforeChange hook
        afterCreateRow={handleCreateRow} // Add createRow hook
        afterRemoveRow={handleAfterRemoveRow} // Add afterRemoveRow hook
        contextMenu={[
          "row_above",
          "row_below",
          "remove_row",
          "alignment",
          "copy",
        ]}
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
    </>
  );
};

export default VukMizan;

