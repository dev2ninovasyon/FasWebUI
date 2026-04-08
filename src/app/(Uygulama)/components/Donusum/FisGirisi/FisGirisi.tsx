import "@/lib/handsontableSetup";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import CustomHotTable from "@/components/HotTableWrapper";




import { plus } from "@/utils/theme/Typography";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  Alert,
  Box,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import { createFisGirisiVerisi, getFisNo } from "@/api/Donusum/FisGirisi";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { getDonusumMizan } from "@/api/Donusum/Donusum";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";

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
  transferSignal: number;
}

interface DonusumMizanVeri {
  detayKodu: string;
  hesapAdi: string;
  borcBakiye: number;
  alacakBakiye: number;
}

interface FisOzetiRow {
  detayKodu: string;
  hesapAdi: string;
  mevcutBorcBakiye: number;
  mevcutAlacakBakiye: number;
  fisBorcDegisim: number;
  fisAlacakDegisim: number;
  yeniBorcBakiye: number;
  yeniAlacakBakiye: number;
}

type GridRow = Array<string | number | null | undefined>;

const MIN_FIS_NO = 2;
const DEFAULT_ROW_COUNT = 2;

const formatNumber = (num: number) =>
  new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

const createInitialRows = (fisNo: number): GridRow[] =>
  Array.from({ length: DEFAULT_ROW_COUNT }, () => [fisNo, "", "", null, null, ""]);

const areGridRowsEqual = (left: GridRow[], right: GridRow[]): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  for (let i = 0; i < left.length; i += 1) {
    const leftRow = left[i] || [];
    const rightRow = right[i] || [];

    if (leftRow.length !== rightRow.length) {
      return false;
    }

    for (let j = 0; j < leftRow.length; j += 1) {
      if (leftRow[j] !== rightRow[j]) {
        return false;
      }
    }
  }

  return true;
};

const normalizeAccountCode = (value: unknown): string =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/[-_/]/g, ".")
    .replace(/[^\d.]/g, "")
    .replace(/\.{2,}/g, ".")
    .replace(/^\./, "")
    .replace(/\.$/, "");

const normalizeAccountCodeCompact = (value: unknown): string =>
  normalizeAccountCode(value).replace(/\./g, "");

const parseLocaleNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const rawValue = String(value).trim().replace(/\s/g, "");
  if (!rawValue) {
    return null;
  }

  let normalized = rawValue;

  if (rawValue.includes(",") && rawValue.includes(".")) {
    normalized =
      rawValue.lastIndexOf(",") > rawValue.lastIndexOf(".")
        ? rawValue.replace(/\./g, "").replace(",", ".")
        : rawValue.replace(/,/g, "");
  } else if (rawValue.includes(",")) {
    const commaCount = (rawValue.match(/,/g) || []).length;
    normalized =
      commaCount > 1 ? rawValue.replace(/,/g, "") : rawValue.replace(",", ".");
  } else {
    const dotCount = (rawValue.match(/\./g) || []).length;
    if (/^\d{1,3}(\.\d{3})+$/.test(rawValue)) {
      normalized = rawValue.replace(/\./g, "");
    } else if (dotCount > 1) {
      normalized = rawValue.replace(/\./g, "");
    }
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseFisNo = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = parseInt(String(value).trim(), 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const isGridRowEmpty = (row: GridRow): boolean =>
  row.every((value, index) => {
    if (index === 0) {
      return value === null || value === undefined || value === "";
    }

    if (typeof value === "number") {
      return value === 0;
    }

    return value === null || value === undefined || String(value).trim() === "";
  });

const FisGirisi: React.FC<Props> = ({
  konsolidasyonMu = false,
  kod,
  ad,
  fisType,
  genelHesapPlaniListesi,
  hazirFislerTiklandimi,
  handleFilterChange,
  setHazirFislerTiklandimi,
  transferSignal,
}) => {
  const hotTableComponent = useRef<any>(null);
  const lastTransferredRef = useRef<string>("");

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();
  const smDown = useMediaQuery((muiTheme: any) => muiTheme.breakpoints.down("sm"));

  const [fetchedData, setFetchedData] = useState<GridRow[]>(createInitialRows(MIN_FIS_NO));
  const [duplicatesControl, setDuplicatesControl] = useState(false);
  const [endRow, setEndRow] = useState(-1);
  const [lastFisNo, setLastFisNo] = useState(MIN_FIS_NO);
  const [toplamBorc, setToplamBorc] = useState(0);
  const [toplamAlacak, setToplamAlacak] = useState(0);
  const [fark, setFark] = useState(0);
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);
  const [donusumMizanData, setDonusumMizanData] = useState<DonusumMizanVeri[]>([]);

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
  }, [customizer.activeMode, dispatch]);

  const showSnackbar = (
    message: string,
    variant: "success" | "error" | "warning"
  ) => {
    enqueueSnackbar(message, {
      variant,
      autoHideDuration: 5000,
      style: {
        backgroundColor:
          customizer.activeMode === "dark"
            ? theme.palette[variant].light || theme.palette[variant].main
            : theme.palette[variant].main,
        maxWidth: "720px",
      },
    });
  };

  const numberValidator = (
    value: string,
    callback: (value: boolean) => void
  ) => {
    if (value === null || value === undefined || value === "") {
      callback(true);
      return;
    }

    if (parseLocaleNumber(value) !== null) {
      callback(true);
    } else {
      showSnackbar("Hatalı sayı girişi. Geçerli bir tutar giriniz.", "warning");
      callback(false);
    }
  };

  const integerValidator = (
    value: string,
    callback: (value: boolean) => void
  ) => {
    if (value === null || value === undefined || value === "") {
      callback(true);
      return;
    }

    const integerRegex = /^\d+$/;
    if (integerRegex.test(String(value).trim())) {
      callback(true);
    } else {
      showSnackbar("Hatalı sayı girişi. Tam sayı girilmelidir.", "warning");
      callback(false);
    }
  };

  const findDuplicateRows = (data: GridRow[]): number[] => {
    const seenRows = new Set<string>();
    const duplicates: number[] = [];

    data.forEach((row, index) => {
      if (isGridRowEmpty(row)) {
        return;
      }

      const rowString = JSON.stringify(row);
      if (seenRows.has(rowString)) {
        duplicates.push(index + 1);
      } else {
        seenRows.add(rowString);
      }
    });

    return duplicates;
  };

  useEffect(() => {
    if (!duplicatesControl) {
      return;
    }

    const duplicateRowNumbers = findDuplicateRows(fetchedData);
    if (duplicateRowNumbers.length > 0) {
      showSnackbar(
        `${duplicateRowNumbers.join(", ")} numaralı satırlar tekrar eden veri içeriyor. Kontrol edin.`,
        "warning"
      );
    }

    setDuplicatesControl(false);
  }, [duplicatesControl, fetchedData]);

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
    },
    {
      type: "autocomplete",
      source: function (query: string, process: (result: string[]) => void) {
        const results = genelHesapPlaniListesi
          .filter((item: any) => item.kod.includes(query))
          .slice(0, 50)
          .map((item: any) => item.kod);
        process(results);
      },
      strict: true,
      allowInvalid: false,
      className: "htLeft",
    },
    { type: "text", columnSorting: true, className: "htLeft" },
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
    },
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
    },
    { type: "text", columnSorting: true, className: "htLeft" },
  ];



  const afterRenderer = (
    TD: HTMLTableCellElement,
    row: number,
    col: number,
    prop: string | number,
    value: string,
    cellProperties: any
  ) => {
    

    

    if (row <= endRow && (value === undefined || value === null || value === "")) {
      TD.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
    }
  };

  const syncTableState = () => {
    if (!hotTableComponent.current) {
      return;
    }

    const hotInstance = hotTableComponent.current.hotInstance;
    const rawData = hotInstance.getData() as GridRow[];
    const nextData = rawData.map((row) => [...row]);

    setFetchedData((prev) =>
      areGridRowsEqual(prev, nextData) ? prev : nextData
    );

    const totals = rawData.reduce(
      (acc, row) => {
        acc.borc += parseLocaleNumber(row[3]) || 0;
        acc.alacak += parseLocaleNumber(row[4]) || 0;
        return acc;
      },
      { borc: 0, alacak: 0 }
    );

    setToplamBorc(totals.borc);
    setToplamAlacak(totals.alacak);
    setFark(totals.borc - totals.alacak);
  };

  const findTransferTargetRow = (rows: GridRow[]): number => {
    const firstCompletelyEmptyRow = rows.findIndex((row) => isGridRowEmpty(row));
    if (firstCompletelyEmptyRow >= 0) {
      return firstCompletelyEmptyRow;
    }

    const firstEmptyAccountRow = rows.findIndex((row) => {
      const detayKodu = String(row[1] ?? "").trim();
      const hesapAdi = String(row[2] ?? "").trim();
      const borc = parseLocaleNumber(row[3]) || 0;
      const alacak = parseLocaleNumber(row[4]) || 0;
      const aciklama = String(row[5] ?? "").trim();

      return !detayKodu && !hesapAdi && borc === 0 && alacak === 0 && !aciklama;
    });

    if (firstEmptyAccountRow >= 0) {
      return firstEmptyAccountRow;
    }

    return -1;
  };

  const handleGetRowData = async (row: number) => {
    if (hotTableComponent.current) {
      return hotTableComponent.current.hotInstance.getDataAtRow(row);
    }
  };

  const handleCreateRow = async (index: number, amount: number) => {
    if (!hotTableComponent.current || amount <= 0) {
      return;
    }

    const hotInstance = hotTableComponent.current.hotInstance;
    for (let offset = 0; offset < amount; offset += 1) {
      hotInstance.setDataAtCell(index + offset, 0, lastFisNo, "create-row-default");
    }

    syncTableState();
  };

  const handleAfterRemoveRow = async () => {
    syncTableState();
  };

  const afterPaste = async (data: any, coords: any) => {
    if (endRow < coords[0].endRow) {
      setEndRow(coords[0].endRow);
    }
    syncTableState();
  };

  const handleAfterChange = (changes: any, source: string) => {
    // loadData/create-row-default are initial bootstrap events, skip them.
    if (source === "loadData" || source === "create-row-default") {
      return;
    }

    let shouldFetchDonusumMizan = false;

    if (changes) {
      for (const [row, prop, oldValue, newValue] of changes) {
        if (prop === 1) {
          if (source !== "account-transfer") {
            handleFilterChange(newValue || "");
          }

          const matched = genelHesapPlaniListesi.find(
            (item: any) => item.kod === newValue
          );

          if (matched?.adi && hotTableComponent.current) {
            hotTableComponent.current.hotInstance.setDataAtCell(
              row,
              2,
              matched.adi,
              "auto-fill-account-name"
            );
          }

          const normalizedInput = normalizeAccountCode(newValue || "");
          const rowIndex = fetchedData.findIndex((row) =>
            normalizeAccountCode(String(row[1] ?? "")).toLowerCase() ===
            normalizedInput.toLowerCase()
          );
          setActiveRowIndex(rowIndex >= 0 ? rowIndex : null);

          shouldFetchDonusumMizan = true;
        }

        if (prop === 0) {
          const parsedFisNo = parseFisNo(newValue);
          if (parsedFisNo !== null && parsedFisNo < MIN_FIS_NO) {
            showSnackbar(
              "1 numaralı fiş açılış fişi için ayrılmıştır. Fiş no 2 veya daha büyük olmalıdır.",
              "warning"
            );
          }
        }

        if ([3, 4].includes(prop)) {
          shouldFetchDonusumMizan = true;
        }
      }
    }

    syncTableState();

    if (shouldFetchDonusumMizan) {
      fetchDonusumMizanData();
    }
  };

  const handleBeforeChange = (changes: any[]) => {
    if (!changes) {
      return;
    }

    for (let i = 0; i < changes.length; i += 1) {
      const [, prop, , newValue] = changes[i];

      if (prop === 0) {
        const fisNo = parseFisNo(newValue);
        changes[i][3] = fisNo ?? newValue;
      }

      if ([3, 4].includes(prop)) {
        const parsedNumber = parseLocaleNumber(newValue);
        changes[i][3] = parsedNumber ?? newValue;
      }
    }
  };

  const fetchDonusumMizanData = async () => {
    try {
      const donusumMizanVerileri = await getDonusumMizan(
        user.denetlenenId || 0,
        user.yil || 0,
        konsolidasyonMu
      );

      setDonusumMizanData(donusumMizanVerileri || []);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const fetchFisNo = async () => {
    try {
      const fisNo = await getFisNo(
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        konsolidasyonMu
      );
      const nextFisNo = Math.max((Number(fisNo) || 0) + 1, MIN_FIS_NO);
      setLastFisNo(nextFisNo);
      setFetchedData(createInitialRows(nextFisNo));
      setEndRow(-1);
      setToplamBorc(0);
      setToplamAlacak(0);
      setFark(0);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchFisNo();
    fetchDonusumMizanData();
  }, []);

  useEffect(() => {
    if (hazirFislerTiklandimi) {
      fetchFisNo();
      fetchDonusumMizanData();
      setHazirFislerTiklandimi(false);
    }
  }, [hazirFislerTiklandimi]);

  const lastTransferSignalRef = useRef<number>(0);

  useEffect(() => {
    if (kod === "" || ad === "" || !hotTableComponent.current) {
      return;
    }

    if (transferSignal === lastTransferSignalRef.current) {
      return;
    }

    lastTransferSignalRef.current = transferSignal;

    const hotInstance = hotTableComponent.current.hotInstance;
    const rows = hotInstance.getData() as GridRow[];
    let targetRow = findTransferTargetRow(rows);

    if (targetRow < 0) {
      targetRow = hotInstance.countRows();
      hotInstance.alter("insert_row_below", hotInstance.countRows() - 1, 1);
    }

    hotInstance.setDataAtCell(targetRow, 0, lastFisNo, "account-transfer");
    hotInstance.setDataAtCell(targetRow, 1, kod, "account-transfer");
    hotInstance.setDataAtCell(targetRow, 2, ad, "account-transfer");

    setActiveRowIndex(targetRow);
    lastTransferredRef.current = `${lastFisNo}|${kod}|${ad}|${transferSignal}`;

    syncTableState();
  }, [kod, ad, lastFisNo, transferSignal]);

  useEffect(() => {
    if (hotTableComponent.current && activeRowIndex !== null) {
      const hot = hotTableComponent.current.hotInstance;
      hot.selectCell(activeRowIndex, 1);
      hot.scrollViewportTo(activeRowIndex, 1);
    }

    if (hotTableComponent.current) {
      const diff = customizer.isCollapse
        ? 0
        : customizer.SidebarWidth && customizer.MiniSidebarWidth
          ? customizer.SidebarWidth - customizer.MiniSidebarWidth
          : 0;

      hotTableComponent.current.hotInstance.updateSettings({
        width: customizer.isCollapse
          ? "100%"
          : hotTableComponent.current.hotInstance.rootElement.clientWidth - diff,
      });
    }
  }, [customizer.isCollapse, customizer.MiniSidebarWidth, customizer.SidebarWidth]);

  const filledRows = useMemo(
    () => fetchedData.filter((row) => !isGridRowEmpty(row)),
    [fetchedData]
  );

  const ozetKaynakRows = useMemo(
    () =>
      fetchedData.filter((row) => {
        const rawDetayKodu = String(row[1] ?? "").trim();
        return Boolean(rawDetayKodu) || !isGridRowEmpty(row);
      }),
    [fetchedData]
  );

  const hesapKodlari = useMemo<string[]>(() => {
    const codes = new Set<string>();
    ozetKaynakRows.forEach((row) => {
      const code = String(row[1] ?? "").trim();
      if (code) codes.add(code);
    });
    return Array.from(codes);
  }, [ozetKaynakRows]);

  const donusumMizanMap = useMemo(() => {
    const map = new Map<string, DonusumMizanVeri>();
    donusumMizanData.forEach((item) => {
      const rawKey = String(item.detayKodu || "").trim();
      if (!rawKey) return;
      const normalizedKey = normalizeAccountCode(rawKey);
      const compactKey = normalizeAccountCodeCompact(rawKey);
      map.set(rawKey, item);
      map.set(normalizedKey, item);
      map.set(compactKey, item);
    });
    return map;
  }, [donusumMizanData]);

  // Her güncellemede her değişiklik anlık yansısın:
  useEffect(() => {
    fetchDonusumMizanData();
  }, [fetchedData]);


  const fisOzetiRows = useMemo<FisOzetiRow[]>(() => {
    const grouped = new Map<
      string,
      { hesapAdi: string; fisBorcDegisim: number; fisAlacakDegisim: number }
    >();

    ozetKaynakRows.forEach((row) => {
      const rawDetayKodu = String(row[1] ?? "").trim();
      const detayKodu = normalizeAccountCode(rawDetayKodu) || rawDetayKodu;
      const hesapAdi = String(row[2] || "").trim();
      const borc = parseLocaleNumber(row[3]) || 0;
      const alacak = parseLocaleNumber(row[4]) || 0;

      if (!detayKodu) {
        return;
      }

      const existing = grouped.get(detayKodu) || {
        hesapAdi,
        fisBorcDegisim: 0,
        fisAlacakDegisim: 0,
      };

      existing.hesapAdi = existing.hesapAdi || hesapAdi;
      existing.fisBorcDegisim += borc;
      existing.fisAlacakDegisim += alacak;
      grouped.set(detayKodu, existing);
    });

    return Array.from(grouped.entries()).map(([detayKodu, summary]) => {
      const normalizedDetayKodu = normalizeAccountCode(detayKodu);
      const compactDetayKodu = normalizeAccountCodeCompact(detayKodu);

      const donusumMizanRowFromMap =
        donusumMizanMap.get(detayKodu) ||
        donusumMizanMap.get(normalizedDetayKodu) ||
        donusumMizanMap.get(compactDetayKodu);

      const donusumMizanRow =
        donusumMizanRowFromMap ||
        ({
          detayKodu,
          hesapAdi: summary.hesapAdi || "",
          borcBakiye: 0,
          alacakBakiye: 0,
        } as DonusumMizanVeri);

      const mevcutBorcBakiye = Number(donusumMizanRow.borcBakiye || 0);
      const mevcutAlacakBakiye = Number(donusumMizanRow.alacakBakiye || 0);
      const netDeger =
        mevcutBorcBakiye -
        mevcutAlacakBakiye +
        summary.fisBorcDegisim -
        summary.fisAlacakDegisim;

      return {
        detayKodu,
        hesapAdi: donusumMizanRow?.hesapAdi || summary.hesapAdi || "",
        mevcutBorcBakiye,
        mevcutAlacakBakiye,
        fisBorcDegisim: summary.fisBorcDegisim,
        fisAlacakDegisim: summary.fisAlacakDegisim,
        yeniBorcBakiye: netDeger > 0 ? netDeger : 0,
        yeniAlacakBakiye: netDeger < 0 ? Math.abs(netDeger) : 0,
      };
    });
  }, [donusumMizanData, ozetKaynakRows, donusumMizanMap]);



  useEffect(() => {
    console.log("[DEBUG] fisOzetiRows", fisOzetiRows);
  }, [fisOzetiRows]);

  useEffect(() => {
    if (!ozetKaynakRows || ozetKaynakRows.length === 0) {
      return;
    }

    const hasMissing = hesapKodlari.some((code) => {
      const normalized = normalizeAccountCode(code);
      return !donusumMizanMap.has(code) && !donusumMizanMap.has(normalized);
    });

    if (hasMissing) {
      fetchDonusumMizanData();
    }
  }, [hesapKodlari, donusumMizanMap, fetchDonusumMizanData]);

  const ozetHeaderCellSx = {
    fontFamily: plus.style.fontFamily,
    fontWeight: 500,
    fontSize: "0.875rem",
    lineHeight: "1.334rem",
    color: customizer.activeMode === "dark" ? "#ffffff" : "#2A3547",
    backgroundColor: theme.palette.primary.light,
    borderColor: customizer.activeMode === "dark" ? "#10141c" : "#cccccc",
    whiteSpace: "nowrap",
  } as const;

  const ozetBodyCellSx = {
    fontFamily: plus.style.fontFamily,
    fontWeight: 500,
    fontSize: "0.875rem",
    lineHeight: "1.334rem",
    color: customizer.activeMode === "dark" ? "#ffffff" : "#2A3547",
    borderColor: customizer.activeMode === "dark" ? "#10141c" : "#cccccc",
  } as const;

  const handleCreateFisGirisiVerisi = async () => {
    const validRows = filledRows;

    if (validRows.length === 0) {
      showSnackbar("Kaydetmeden önce en az bir satır doldurmalısınız.", "warning");
      return;
    }

    const jsonData = [];

    for (const item of validRows) {
      const fisNo = parseFisNo(item[0]);
      const detayKodu = String(item[1] || "").trim();
      const hesapAdi = String(item[2] || "").trim();
      const borc = parseLocaleNumber(item[3]) || 0;
      const alacak = parseLocaleNumber(item[4]) || 0;
      const aciklama = String(item[5] || "").trim();

      if (!fisNo || fisNo < MIN_FIS_NO) {
        showSnackbar(
          "1 numaralı fiş açılış fişi için ayrılmıştır. Fiş no 2 veya daha büyük olmalıdır.",
          "warning"
        );
        return;
      }

      if (!detayKodu || !hesapAdi) {
        showSnackbar("Detay kodu ve hesap adı boş bırakılamaz.", "warning");
        return;
      }

      if (detayKodu.length === 3) {
        showSnackbar("Ana hesaba fiş girişi gerçekleştiremezsiniz.", "warning");
        return;
      }

      if (
        detayKodu.startsWith("590") ||
        detayKodu.startsWith("591") ||
        detayKodu.startsWith("690") ||
        detayKodu.startsWith("692")
      ) {
        showSnackbar(
          "Dönem kârı ile ilgili hesaba fiş girişi gerçekleştiremezsiniz.",
          "warning"
        );
        return;
      }

      if ((borc <= 0 && alacak <= 0) || (borc > 0 && alacak > 0)) {
        showSnackbar(
          "Her satırda yalnızca borç veya alacak alanlarından biri dolu olmalıdır.",
          "warning"
        );
        return;
      }

      jsonData.push({
        denetciId: user.denetciId,
        denetlenenId: user.denetlenenId,
        yil: user.yil,
        fisTipi: fisType,
        fisNo,
        detayKodu,
        hesapAdi,
        borc,
        alacak,
        aciklama,
      });
    }

    try {
      const result = await createFisGirisiVerisi(jsonData, konsolidasyonMu);
      if (result) {
        await fetchFisNo();
        await fetchDonusumMizanData();
        setDuplicatesControl(true);

        showSnackbar("Fiş kaydedildi.", "success");
      } else {
        showSnackbar("Fiş kaydedilemedi.", "error");
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  return (
    <>
      <Grid container spacing={2} sx={{ mb: 2, position: "sticky", top: 80, zIndex: 1000, backgroundColor: theme.palette.background.default }}>
        <Grid
          size={{
            xs: 12,
            lg: 12,
          }}
        >
          <Alert severity="info" sx={{ mb: 1.5 }}>
            `1` numaralı fiş açılış fişi için ayrılmıştır. Bu ekranda yeni fişler varsayılan
            olarak `2` numarasıyla başlar ve açılış fişi mantığına göre `1` numarasıyla kayıt
            oluşturulamaz.
          </Alert>
        </Grid>
        <Grid
          size={{
            xs: 12,
            lg: 12,
          }}
        >
          <CustomHotTable theme={customizer.activeMode === "dark" ? "ht-theme-horizon-dark" : "ht-theme-horizon"}
            style={{
              width: "100%",
              minHeight: "200px",
              maxHeight: 420,
              maxWidth: "100%",
              overflow: "auto",
            }}
            language={dictionary.languageCode}
            ref={hotTableComponent}
            data={fetchedData}
            colHeaders={colHeaders}
            columns={columns}
            colWidths={[48, 120, 170, 120, 120, 160]}
            stretchH="all"
            manualColumnResize={true}
            rowHeaders={true}
            rowHeights={35}
            autoWrapRow={true}
            minRows={DEFAULT_ROW_COUNT}
            minCols={6}
            filters={true}
            columnSorting={true}
            dropdownMenu={[
              "filter_by_condition",
              "filter_by_value",
              "filter_action_bar",
            ]}
            licenseKey="non-commercial-and-evaluation"
            afterRenderer={afterRenderer}
            afterPaste={afterPaste}
            afterCreateRow={handleCreateRow}
            afterRemoveRow={handleAfterRemoveRow}
            afterChange={handleAfterChange}
            beforeChange={handleBeforeChange}
            contextMenu={{
              items: {
                row_above: {},
                row_below: {},
                remove_row: {},
                alignment: {},
                copy: {},
                fis_esitle: {
                  name: "Fiş eşitle",
                  callback: async function (_key, selection) {
                    const hotInstance = hotTableComponent.current.hotInstance;
                    const selectedRow = selection[0].start.row;

                    if (fark < 0) {
                      hotInstance.setDataAtCell(selectedRow, 3, Math.abs(fark), "fis-balance");
                      hotInstance.setDataAtCell(selectedRow, 4, 0, "fis-balance");
                    } else if (fark === 0) {
                      hotInstance.setDataAtCell(selectedRow, 3, 0, "fis-balance");
                      hotInstance.setDataAtCell(selectedRow, 4, 0, "fis-balance");
                    } else {
                      hotInstance.setDataAtCell(selectedRow, 3, 0, "fis-balance");
                      hotInstance.setDataAtCell(selectedRow, 4, Math.abs(fark), "fis-balance");
                    }

                    syncTableState();
                  },
                },
              },
            }}
          />
        </Grid>
      </Grid>

      <Grid container justifyContent={"end"} spacing={1} sx={{ mt: 1 }}>
        <Grid
          size={{
            xs: 12,
            lg: 2,
          }}
        >
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
              Borç Toplamı
            </Typography>
            <Typography variant="subtitle1" align="right">
              {formatNumber(toplamBorc)}
            </Typography>
          </Paper>
        </Grid>
        <Grid
          size={{
            xs: 12,
            lg: 2,
          }}
        >
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
              Alacak Toplamı
            </Typography>
            <Typography variant="subtitle1" align="right">
              {formatNumber(toplamAlacak)}
            </Typography>
          </Paper>
        </Grid>
        <Grid
          size={{
            xs: 12,
            lg: 2,
          }}
        >
          <Paper
            elevation={1}
            sx={{
              p: 2,
              width: "100%",
              backgroundColor: fark === 0 ? "success.light" : "warning.light",
              overflow: "auto",
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
              Fark
            </Typography>
            <Typography variant="subtitle1" align="right">
              {formatNumber(fark)}
            </Typography>
          </Paper>
        </Grid>
        <Grid
          display={"flex"}
          alignItems={"center"}
          sx={{ py: 2, pl: { lg: 2 } }}
          size={{
            xs: 12,
            lg: 2,
          }}
        >
          <Box sx={{ width: '100%' }} />
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

      <Box sx={{ mt: 3 }}>
        <Typography
          variant="h6"
          sx={{
            mb: 1.5,
            fontFamily: plus.style.fontFamily,
            fontWeight: 600,
            fontSize: "1rem",
            lineHeight: "1.5rem",
          }}
        >
          Hazırlanan Fişin Dönüşüm Mizan Etkisi
        </Typography>
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            borderColor: customizer.activeMode === "dark" ? "#10141c" : "#cccccc",
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          <Table
            size="small"
            sx={{
              "& thead th": ozetHeaderCellSx,
              "& tbody td": ozetBodyCellSx,
              "& tbody tr:nth-of-type(odd)": {
                backgroundColor:
                  customizer.activeMode === "dark" ? "#171c23" : "#ffffff",
              },
              "& tbody tr:nth-of-type(even)": {
                backgroundColor:
                  customizer.activeMode === "dark" ? "#10141c" : "#f7f9fc",
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={ozetHeaderCellSx}>Detay Kodu</TableCell>
                <TableCell>Hesap Adı</TableCell>
                <TableCell align="right">Mevcut Borç Bakiye</TableCell>
                <TableCell align="right">Mevcut Alacak Bakiye</TableCell>
                <TableCell align="right">Fiş Borç Değişim</TableCell>
                <TableCell align="right">Fiş Alacak Değişim</TableCell>
                <TableCell align="right">Yeni Borç Bakiye</TableCell>
                <TableCell align="right">Yeni Alacak Bakiye</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fisOzetiRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Fişe hesap ekledikçe ilgili dönüşüm mizan etkisi burada gösterilecektir.
                  </TableCell>
                </TableRow>
              ) : (
                fisOzetiRows.map((row) => (
                  <TableRow key={row.detayKodu}>
                    <TableCell>{row.detayKodu}</TableCell>
                    <TableCell>{row.hesapAdi}</TableCell>
                    <TableCell align="right">{formatNumber(row.mevcutBorcBakiye)}</TableCell>
                    <TableCell align="right">{formatNumber(row.mevcutAlacakBakiye)}</TableCell>
                    <TableCell align="right">{formatNumber(row.fisBorcDegisim)}</TableCell>
                    <TableCell align="right">{formatNumber(row.fisAlacakDegisim)}</TableCell>
                    <TableCell align="right">{formatNumber(row.yeniBorcBakiye)}</TableCell>
                    <TableCell align="right">{formatNumber(row.yeniAlacakBakiye)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};

export default FisGirisi;
