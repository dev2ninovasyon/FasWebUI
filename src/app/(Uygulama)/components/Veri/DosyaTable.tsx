import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  TableHead,
  IconButton,
  TableFooter,
  TablePagination,
  TextField,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
  useMediaQuery,
  Checkbox,
  Button,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  Paper,
} from "@mui/material";
// LoadingButton import removed
import { useSnackbar } from "notistack";
import { Stack } from "@mui/system";
// import TablePaginationActions from "@mui/material/TablePagination";
import {
  deleteDosyaBilgisiMultiple,
  getDefterYuklemeLoglari,
  getDosyaBilgileri,
} from "@/api/Dosya/DosyaBilgileri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { ConfirmPopUpComponent } from "@/app/(Uygulama)/components/CalismaKagitlari/ConfirmPopUp";
import WarnAlertCart from "@/app/(Uygulama)/components/Alerts/WarnAlertCart";
import { IconDotsVertical, IconEye, IconX } from "@tabler/icons-react";
import { url } from "@/api/apiBase";
import { createAuthorizedAxiosConfig } from "@/utils/authSession";

import axios from "axios";
import LogFormatter from "./LogFormatter";

interface Veri {
  id: number;
  link: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  tip: string;
}

interface MyComponentProps {
  rows: DosyaType[];
  fetchedData: Veri | null;
  fileType: string;
  dosyaYuklendiMi: boolean;
  setRows: (dosya: DosyaType[]) => void;
  setDosyaYuklendiMi: (deger: boolean) => void;
  pendingUploadRows?: { fileName: string; status: string }[];
  onlyShowFinalizedRows?: boolean;
  onServerRowsChange?: (rows: DosyaType[]) => void;
  openLogsFromStatusChip?: boolean;
}

interface DosyaType {
  id: number;
  adi: string;
  olusturulmaTarihi: string;
  durum: string;
  progress?: number;
}

const normalizeStatusText = (status?: string) => {
  if (!status) return "";

  return status
    .replace(/Ä±/g, "ı")
    .replace(/Ä°/g, "İ")
    .replace(/ÅŸ/g, "ş")
    .replace(/Å/g, "Ş")
    .replace(/Ã¼/g, "ü")
    .replace(/Ãœ/g, "Ü")
    .replace(/Ã¶/g, "ö")
    .replace(/Ã–/g, "Ö")
    .replace(/Ã§/g, "ç")
    .replace(/Ã‡/g, "Ç")
    .replace(/ÄŸ/g, "ğ")
    .replace(/Ä/g, "Ğ")
    .replace(/oluÅŸtu/g, "oluştu")
    .replace(/tamamlandÄ±/g, "tamamlandı")
    .replace(/sÄ±raya alÄ±ndÄ±/g, "sıraya alındı")
    .replace(/sÄ±rada/g, "sırada")
    .replace(/iÅŸleniyor/g, "işleniyor")
    .toLocaleLowerCase("tr-TR")
    .trim();
};

const isCompletedStatus = (status?: string) =>
  normalizeStatusText(status).includes("tamamlandı");

const isErrorStatus = (status?: string) => {
  const normalized = normalizeStatusText(status);
  return normalized.includes("hata oluştu") || normalized.includes("hata!");
};

const canOpenLogsForStatusChip = (status?: string) =>
  isCompletedStatus(status) || isErrorStatus(status);

const formatDosyaOlusturulmaTarihi = (value?: string) => {
  if (!value) return "";

  const normalized = value.trim();
  const isoMatch = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/
  );

  if (isoMatch) {
    const [, year, month, day, hour, minute] = isoMatch;
    return hour && minute
      ? `${day}.${month}.${year} ${hour}:${minute}`
      : `${day}.${month}.${year}`;
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return normalized;
  }

  return parsed.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const DosyaTable: React.FC<MyComponentProps> = ({
  rows,
  fetchedData,
  fileType,
  dosyaYuklendiMi,
  setRows,
  setDosyaYuklendiMi,
  pendingUploadRows,
  onlyShowFinalizedRows = false,
  onServerRowsChange,
  openLogsFromStatusChip = false,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [xmlBlobUrl, setXmlBlobUrl] = useState<string | null>(null);

  const [defterLoglari, setDefterLoglari] = useState("");
  const [selectedLogFileName, setSelectedLogFileName] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  // const [page, setPage] = useState(0);
  // const [rowsPerPage, setRowsPerPage] = useState(5);

  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);

  const [selected, setSelected] = useState<number[]>([]);
  const [selectedId, setSelectedId] = useState(0);

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));
  const mdUp = useMediaQuery((theme: any) => theme.breakpoints.up("md"));

  const [control, setControl] = useState(false);
  const [control2, setControl2] = useState(true);

  const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = useState(false);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [openCartAlert, setOpenCartAlert] = useState(false);

  const [message, setMessage] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState<number | null>(null);
  const [previewDetayKodu, setPreviewDetayKodu] = useState("");
  const [previewHesapAdi, setPreviewHesapAdi] = useState("");
  const [previewAciklama, setPreviewAciklama] = useState("");
  const [previewVisibleRows, setPreviewVisibleRows] = useState<number | null>(null);
  const [previewTotalRows, setPreviewTotalRows] = useState<number | null>(null);
  const lastRowsSignatureRef = useRef<string>("");

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const isFinalStatus = (status?: string) => {
    const s = (status || "").toLocaleLowerCase("tr-TR");
    return (
      s.includes("tamamlandı") ||
      s.includes("hata oluştu") ||
      s.includes("hatalı belge")
    );
  };

  const isQueueStatus = (status?: string) => {
    const s = (status || "").toLocaleLowerCase("tr-TR");
    return s.includes("sıraya alındı") || s.includes("sırada");
  };

  const isProcessingStatus = (status?: string) => {
    const s = (status || "").toLocaleLowerCase("tr-TR");
    return s.includes("işleniyor");
  };

  const canOpenLogsFromStatus = (status?: string) => {
    return canOpenLogsForStatusChip(status);
  };

  const sameFileName = (a?: string, b?: string) => {
    const left = (a || "").toLocaleLowerCase("tr-TR").trim();
    const right = (b || "").toLocaleLowerCase("tr-TR").trim();
    if (!left || !right) return false;
    return left === right || left.includes(right) || right.includes(left);
  };

  function normalizeString(str: string): string {
    const turkishChars: { [key: string]: string } = {
      ç: "c",
      ğ: "g",
      ı: "i",
      ö: "o",
      ş: "s",
      ü: "u",
      Ç: "C",
      Ğ: "G",
      İ: "I",
      Ö: "O",
      Ş: "S",
      Ü: "U",
    };

    // Türkçe karakterleri değiştir
    let normalized = str.replace(
      /[çğıöşüÇĞÖŞÜıİ]/g,
      (match) => turkishChars[match] || match
    );

    // Tüm boşluk, tab, satır başı/sonu karakterlerini sil
    normalized = normalized.replace(/\s+/g, "");

    // Küçük harfe çevir
    return normalized.toLowerCase();
  }

  const monthOptions = [
    { value: "01", label: "01-Ocak" },
    { value: "02", label: "02-Şubat" },
    { value: "03", label: "03-Mart" },
    { value: "04", label: "04-Nisan" },
    { value: "05", label: "05-Mayıs" },
    { value: "06", label: "06-Haziran" },
    { value: "07", label: "07-Temmuz" },
    { value: "08", label: "08-Ağustos" },
    { value: "09", label: "09-Eylül" },
    { value: "10", label: "10-Ekim" },
    { value: "11", label: "11-Kasım" },
    { value: "12", label: "12-Aralık" },
  ];

  const getMonthCodeFromDefterName = (fileName?: string): string | null => {
    if (!fileName) return null;

    const normalized = fileName.trim();
    const regexMatch = normalized.match(/-(\d{6})-[^-]+\.[^.]+$/i);
    if (regexMatch?.[1]) {
      const monthCode = regexMatch[1].slice(4, 6);
      return monthCode >= "01" && monthCode <= "12" ? monthCode : null;
    }

    const parts = normalized.split("-");
    if (parts.length > 1 && /^\d{6}$/.test(parts[1])) {
      const monthCode = parts[1].slice(4, 6);
      return monthCode >= "01" && monthCode <= "12" ? monthCode : null;
    }

    return null;
  };

  const extractParts = (
    adi: string
  ): { datePart: string; serialPart: string } => {
    const matches = adi.match(/-\d{6}-K-\d{6}\.xml/);

    if (matches) {
      const parts = matches[0].split("-");
      return { datePart: parts[1], serialPart: parts[3].split(".")[0] };
    }
    return { datePart: "", serialPart: "" };
  };

  const handleAlertPopUp = () => {
    let seri: number;
    let tarih: number;
    let aylar: number[] = [];
    rows.sort((a: DosyaType, b: DosyaType) => a.adi.localeCompare(b.adi));

    rows.forEach((row: DosyaType, index: number) => {
      const { datePart, serialPart } = extractParts(row.adi);

      const monthPart = parseInt(datePart.slice(-2));
      if (aylar.indexOf(monthPart) === -1) {
        aylar.push(monthPart);
      }

      if (seri != undefined && tarih != undefined) {
        if (parseInt(serialPart) === 0) {
          seri = -2;
          tarih = 0;
          return;
        }
        if (parseInt(serialPart) === 1) {
          seri = parseInt(serialPart);
          tarih = parseInt(datePart);
          if (index === rows.length - 1) {
            seri = parseInt(serialPart);
            tarih = parseInt(datePart);
            console.log("t");

            handleAlert();
            setMessage(
              `${parseInt(
                datePart.slice(-2)
              )}. Ay İçin Eksik E-Defter Yüklenmiştir. Kontrol Edin.`
            );
            return;
          } else {
            return;
          }
        }
        if (parseInt(datePart) === tarih) {
          if (parseInt(serialPart) === (seri || -2) + 1) {
            seri = parseInt(serialPart);
            tarih = parseInt(datePart);
            return;
          } else {
            console.log("x");
            handleAlert();
            setMessage(
              `${parseInt(
                datePart.slice(-2)
              )}. Ay İçin Eksik E-Defter Yüklenmiştir. Kontrol Edin.`
            );
            return;
          }
        } else {
          console.log("y");
          handleAlert();

          if (parseInt(serialPart) !== 0 || parseInt(serialPart) !== 1) {
            setMessage(
              `${parseInt(
                datePart.slice(-2)
              )}. Ay İçin Eksik E-Defter Yüklenmiştir. Kontrol Edin.`
            );
          } else {
            setMessage(
              `${parseInt(
                tarih.toString().slice(-2)
              )}. Ay İçin Eksik E-Defter Yüklenmiştir. Kontrol Edin.`
            );
          }
          return;
        }
      } else {
        if (parseInt(serialPart) === 0) {
          return;
        } else if (parseInt(serialPart) === 1) {
          seri = parseInt(serialPart);
          tarih = parseInt(datePart);
          if (index === rows.length - 1) {
            console.log("z");
            handleAlert();
            setMessage(
              `${parseInt(
                datePart.slice(-2)
              )}. Ay İçin Eksik E-Defter Yüklenmiştir. Kontrol Edin.`
            );
            return;
          } else {
            return;
          }
        } else {
          handleAlert();
          setMessage(
            `${parseInt(
              datePart.slice(-2)
            )}. Ay İçin Eksik E-Defter Yüklenmiştir. Kontrol Edin.`
          );
          return;
        }
      }
    });

    const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);

    const missingMonths = allMonths.filter((month) => !aylar.includes(month));

    if (missingMonths.length > 0) {
      handleAlert();
      setMessage(
        `Tüm Aylar İçin E-Defter Yükleyin. Eksik Aylar: ${missingMonths.join(
          ", "
        )}`
      );
    }
    setControl(false);
  };

  const handleAlert = () => {
    setIsAlertOpen(true);
    setOpenCartAlert(true);
  };

  const handleIsConfirm = () => {
    setIsConfirmPopUpOpen(!isConfirmPopUpOpen);
  };

  const handleCloseConfirmPopUp = () => {
    setIsConfirmPopUpOpen(false);
  };

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    id: number
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePreview = async (id: number, fileName?: string, currentStatus?: string) => {
    try {
      const defterYuklemeLoglari = await getDefterYuklemeLoglari(id);
      if (defterYuklemeLoglari) {
        setDefterLoglari(defterYuklemeLoglari);
      } else {
        setDefterLoglari(`Bu dosya için detay log bulunamadı.\nDurum: ${currentStatus || "Bilinmiyor"}`);
      }
    } catch (error) {
      console.log("Defter Logları getirilemedi");
      setDefterLoglari("Loglar yüklenirken bir hata oluştu.");
    }

    setSelectedLogFileName(fileName || `Dosya #${id}`);
    setIsOpen(true);
  };

  const handlePreview2 = async () => {
    if (isLoadingPreview !== null) return; // Prevent double-click

    setIsLoadingPreview(selectedId);
    const loadingSnackbarKey = enqueueSnackbar("Dosya yükleniyor, lütfen bekleyin...", {
      variant: "info",
      persist: true,
    });

    try {
      var controller =
        fileType === "E-DefterKebir" ? "DosyaGoster" : "PdfDosyasiGoster";
      const response = await axios({
        url: `${url}/Veri/${controller}/${selectedId}`,
        method: "GET",
        responseType: "blob",
        ...createAuthorizedAxiosConfig(
          {
            headers: {
              Accept:
                fileType === "E-DefterKebir" ? "text/html" : "application/pdf",
            },
          },
          user.token
        ),
      });

      const xmlBlob = new Blob([response.data], {
        type: fileType === "E-DefterKebir" ? "text/html" : "application/pdf",
      });
      const nextBlobUrl = window.URL.createObjectURL(xmlBlob);
      if (xmlBlobUrl) {
        window.URL.revokeObjectURL(xmlBlobUrl);
      }
      setXmlBlobUrl(nextBlobUrl);
      setPreviewDetayKodu("");
      setPreviewHesapAdi("");
      setPreviewAciklama("");
      setPreviewVisibleRows(null);
      setPreviewTotalRows(null);
      setIsOpen2(true);
      handleClose();
    } catch (error) {
      console.log("Error fetching file:", error);
      enqueueSnackbar("Dosya yüklenirken bir hata oluştu.", {
        variant: "error",
        autoHideDuration: 3000,
      });
    } finally {
      closeSnackbar(loadingSnackbarKey);
      setIsLoadingPreview(null);
    }
  };

  const applyIframeFilter = () => {
    if (fileType !== "E-DefterKebir") return;

    const iframe = document.getElementById("defter-preview-iframe") as HTMLIFrameElement | null;
    const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
    if (!doc) return;

    const detayFilter = previewDetayKodu.toLocaleLowerCase("tr-TR").trim();
    const hesapFilter = previewHesapAdi.toLocaleLowerCase("tr-TR").trim();
    const aciklamaFilter = previewAciklama.toLocaleLowerCase("tr-TR").trim();

    const entryTables = Array.from(doc.querySelectorAll("table.entryHeader"));
    let total = 0;
    let visible = 0;

    entryTables.forEach((table) => {
      const mainCode = (
        table.querySelector("thead tr:first-child th:nth-child(3)")?.textContent || ""
      )
        .toLocaleLowerCase("tr-TR")
        .trim();
      const mainName = (
        table.querySelector("thead tr:first-child th:nth-child(4)")?.textContent || ""
      )
        .toLocaleLowerCase("tr-TR")
        .trim();

      const rows = Array.from(table.querySelectorAll("tbody tr"));
      let tableVisible = 0;

      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (!cells || cells.length < 4) return;

        total++;
        const detayValue = (cells[2].textContent || "").toLocaleLowerCase("tr-TR");
        const hesapValue = (cells[3].textContent || "").toLocaleLowerCase("tr-TR");
        const aciklamaValue = (cells[5].textContent || "").toLocaleLowerCase("tr-TR");

        const matchDetay =
          !detayFilter ||
          detayValue.includes(detayFilter) ||
          mainCode.includes(detayFilter);
        const matchHesap =
          !hesapFilter ||
          hesapValue.includes(hesapFilter) ||
          mainName.includes(hesapFilter);
        const matchAciklama = !aciklamaFilter || aciklamaValue.includes(aciklamaFilter);
        const show = matchDetay && matchHesap && matchAciklama;

        (row as HTMLElement).style.display = show ? "" : "none";
        if (show) {
          tableVisible++;
          visible++;
        }
      });

      (table as HTMLElement).style.display = tableVisible > 0 ? "" : "none";
    });

    setPreviewTotalRows(total);
    setPreviewVisibleRows(visible);
  };

  useEffect(() => {
    if (isOpen2) applyIframeFilter();
  }, [previewDetayKodu, previewHesapAdi, previewAciklama, isOpen2]);

  const fetchData = useCallback(async (): Promise<boolean> => {
    try {
      const dosyaBilgileri = await getDosyaBilgileri(user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        fileType
      );

      if (!Array.isArray(dosyaBilgileri)) return false;

      const serverRows: DosyaType[] = dosyaBilgileri.map((dosya: DosyaType) => ({
        id: dosya.id,
        adi: dosya.adi,
        olusturulmaTarihi: formatDosyaOlusturulmaTarihi(dosya.olusturulmaTarihi),
        durum: dosya.durum,
        progress: Number((dosya as any).progress ?? (dosya as any).Progress ?? 0),
      }));
      onServerRowsChange?.(serverRows);

      const today = formatDosyaOlusturulmaTarihi(new Date().toISOString());
      const pendingRowsForTracking: DosyaType[] = (pendingUploadRows || [])
        .filter(
          (pending) =>
            !serverRows.some((row) => sameFileName(row.adi, pending.fileName))
        )
        .map((pending, index) => ({
          id: -(index + 1),
          adi: pending.fileName,
          olusturulmaTarihi: today,
          durum: pending.status,
          progress: 0,
        }));

      const optimisticRows: DosyaType[] = onlyShowFinalizedRows
        ? []
        : pendingRowsForTracking;

      const displayServerRows = onlyShowFinalizedRows
        ? serverRows.filter((row) => isFinalStatus(row.durum))
        : serverRows;

      const newRows: DosyaType[] = [...optimisticRows, ...displayServerRows];

      const nextSignature = newRows
        .map((r) => `${r.id}|${r.adi}|${r.olusturulmaTarihi}|${r.durum}`)
        .join("~");

      if (lastRowsSignatureRef.current !== nextSignature) {
        setRows(newRows);
        lastRowsSignatureRef.current = nextSignature;
      }

      setControl(true);
      const hasActiveServerRows = serverRows.some((r: DosyaType) => !isFinalStatus(r.durum));
      const hasActiveOptimisticRows = pendingRowsForTracking.some((r: DosyaType) => !isFinalStatus(r.durum));
      return hasActiveServerRows || hasActiveOptimisticRows;
    } catch (error) {
      console.log("Bir hata oluştu:", error);
      return false;
    }
  }, [fileType, onServerRowsChange, onlyShowFinalizedRows, pendingUploadRows, setRows, user.denetciId, user.denetlenenId, user.yil]);

  useEffect(() => {
    if (fileType === "E-DefterKebir") {
      if (control && control2) {
        handleAlertPopUp();
      }
    }
  }, [control, control2]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      const hasActive = await fetchData();
      if (cancelled) return;

      if (!hasActive && !dosyaYuklendiMi) {
        setDosyaYuklendiMi(true);
      }
      setControl2(!hasActive);

      const isVisible =
        typeof document === "undefined" || document.visibilityState === "visible";
      const nextMs = !isVisible
        ? 15000
        : hasActive || !dosyaYuklendiMi
          ? 2000
          : 8000;
      timer = setTimeout(poll, nextMs);
    };

    poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [dosyaYuklendiMi, fetchData, setDosyaYuklendiMi]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [fetchData]);

  useEffect(() => {
    return () => {
      if (xmlBlobUrl) {
        window.URL.revokeObjectURL(xmlBlobUrl);
      }
    };
  }, [xmlBlobUrl]);

  // const emptyRows =
  //   page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  // const handleChangePage = (event: any, newPage: any) => {
  //   setPage(newPage);
  // };

  // const handleChangeRowsPerPage = (event: any) => {
  //   setRowsPerPage(parseInt(event.target.value, 10));
  //   setPage(0);
  // };

  const filteredRows = rows.filter((row) => {
    const matchesSearch = normalizeString(row.adi).includes(normalizeString(searchTerm));

    if (
      selectedMonth === "all" ||
      (fileType !== "E-DefterKebir" && fileType !== "E-DefterYevmiye")
    ) {
      return matchesSearch;
    }

    const rowMonthCode = getMonthCodeFromDefterName(row.adi);
    const matchesMonth = rowMonthCode === selectedMonth;
    return matchesSearch && matchesMonth;
  });

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = filteredRows.map((row) => row.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClickRow = (id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const deleteSelected = async () => {
    const deletedIds = [...selected];
    setIsDeleting(true);
    try {
      const result = await deleteDosyaBilgisiMultiple(selected);
      if (result) {
        setRows(rows.filter((row) => !deletedIds.includes(row.id)));
        enqueueSnackbar(`${selected.length} kayıt başarıyla silindi.`, {
          variant: "success",
          autoHideDuration: 3000,
        });
        setSelected([]);
        handleCloseConfirmPopUp();
        void fetchData();
      } else {
        enqueueSnackbar("Dosya bilgileri silinemedi.", {
          variant: "error",
          autoHideDuration: 5000,
        });
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
      enqueueSnackbar("Silme işlemi sırasında bir hata oluştu.", {
        variant: "error",
        autoHideDuration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Stack mb={1} spacing={1}>
        <Box sx={{ pt: 1 }}>
          <Typography variant="h5" textAlign="center">
            Yüklenmiş Dosya Bilgileri
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems="center"
          gap={1}
          px={2}
        >
          {(fileType === "E-DefterKebir" || fileType === "E-DefterYevmiye") && (
            <TextField
              select
              label="Ay"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              size="small"
              sx={{ minWidth: 170, width: { xs: "100%", sm: "auto" } }}
            >
              <MenuItem value="all">Tümü</MenuItem>
              {monthOptions.map((month) => (
                <MenuItem key={month.value} value={month.value}>
                  {month.label}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            placeholder="Arama"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
        </Stack>
      </Stack>

      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selected.length > 0 && selected.length < filteredRows.length
                  }
                  checked={
                    filteredRows.length > 0 &&
                    selected.length === filteredRows.length
                  }
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              <TableCell>Dosya Adı</TableCell>
              <TableCell>Yükleme Tarihi</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row) => {
              const isItemSelected = isSelected(row.id);
              return (
                <TableRow
                  hover
                  onClick={() => handleClickRow(row.id)}
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={row.id}
                  selected={isItemSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox checked={isItemSelected} />
                  </TableCell>
                  <TableCell>{row.adi}</TableCell>
                  <TableCell>{row.olusturulmaTarihi}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.durum}
                      size="small"
                      clickable={openLogsFromStatusChip && canOpenLogsForStatusChip(row.durum)}
                      onClick={
                        openLogsFromStatusChip && canOpenLogsForStatusChip(row.durum)
                          ? (e) => {
                            e.stopPropagation();
                            handlePreview(row.id, row.adi, row.durum);
                          }
                          : undefined
                      }
                      color={
                        row.durum?.toLocaleLowerCase("tr-TR").includes("hata")
                          ? "error"
                          : row.durum?.toLocaleLowerCase("tr-TR").includes("tamamlandı")
                          ? "success"
                          : "info"
                      }
                      sx={
                        openLogsFromStatusChip && canOpenLogsForStatusChip(row.durum)
                          ? { cursor: "pointer", fontWeight: 600 }
                          : undefined
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {!openLogsFromStatusChip && <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreview(row.id, row.adi, row.durum);
                        }}
                        title="İşlem Logları"
                        color="primary"
                      >
                        <IconEye size="20" />
                      </IconButton>}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClick(e as any, row.id);
                        }}
                      >
                        <IconDotsVertical size="20" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {selected.length !== 0 && (
        <Button
          variant="outlined"
          color="error"
          size="small"
          disabled={fetchedData != null}
          loading={isDeleting}
          onClick={() => {
            handleIsConfirm();
          }}
          sx={{
            position: "relative",
            width: smDown ? "100%" : "auto",
            marginLeft: "10px",
            marginBottom: "12px",
            marginTop: "8px",
          }}
        >
          {selected.length} Kayıt Sil
        </Button>
      )}

      {/* İşlemler Menusu */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handlePreview2} disabled={isLoadingPreview !== null}>
          <ListItemIcon>
            <IconEye size="20" />
          </ListItemIcon>
          Önizleme
        </MenuItem>
      </Menu>

      {/* İşlem Logları Dialog */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" component="span">İşlem Logları</Typography>
          <IconButton onClick={() => setIsOpen(false)}>
            <IconX size="20" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: "text.secondary" }}>
            {selectedLogFileName}
          </Typography>
          <LogFormatter logs={defterLoglari} />
        </DialogContent>
      </Dialog>

      {/* Dosya Önizleme Dialog */}
      <Dialog
        open={isOpen2}
        onClose={() => {
          if (xmlBlobUrl) {
            window.URL.revokeObjectURL(xmlBlobUrl);
            setXmlBlobUrl(null);
          }
          setIsOpen2(false);
        }}
        fullWidth
        maxWidth={fileType === "E-DefterKebir" ? false : "xl"}
        scroll="paper"
        PaperProps={{
          sx: {
            height: "95vh",
            maxHeight: "95vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            p: 1,
            position: "sticky",
            top: 0,
            zIndex: 1,
            bgcolor: "background.paper",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <Box sx={{ flex: 1 }}>
            {fileType === "E-DefterKebir" && (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
                <TextField
                  size="small"
                  label="Detay Kodu"
                  value={previewDetayKodu}
                  onChange={(e) => setPreviewDetayKodu(e.target.value)}
                  sx={{ width: 120 }}
                />
                <TextField
                  size="small"
                  label="Hesap Adı"
                  value={previewHesapAdi}
                  onChange={(e) => setPreviewHesapAdi(e.target.value)}
                  sx={{ width: 150 }}
                />
                <TextField
                  size="small"
                  label="Açıklama"
                  value={previewAciklama}
                  onChange={(e) => setPreviewAciklama(e.target.value)}
                  sx={{ width: 150 }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setPreviewDetayKodu("");
                    setPreviewHesapAdi("");
                    setPreviewAciklama("");
                  }}
                >
                  Temizle
                </Button>
                <Typography variant="body2" color="text.secondary">
                  {previewTotalRows !== null
                    ? `Görünen: ${previewVisibleRows ?? 0}/${previewTotalRows}`
                    : ""}
                </Typography>
              </Stack>
            )}
          </Box>
          <IconButton
            size="medium"
            onClick={() => {
              if (xmlBlobUrl) {
                window.URL.revokeObjectURL(xmlBlobUrl);
                setXmlBlobUrl(null);
              }
              setIsOpen2(false);
            }}
          >
            <IconX size="24" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent
          sx={{
            p: 0,
            overflow: "hidden",
            flex: 1,
            minHeight: 0,
          }}
        >
          {xmlBlobUrl && (
            <iframe
              id="defter-preview-iframe"
              src={xmlBlobUrl}
              width="100%"
              height="100%"
              loading="eager"
              onLoad={applyIframeFilter}
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                backgroundColor: "#fff",
                border: "none",
              }}
            ></iframe>
          )}
        </DialogContent>
      </Dialog>

      {isConfirmPopUpOpen && (
        <ConfirmPopUpComponent
          isConfirmPopUp={isConfirmPopUpOpen}
          handleClose={handleCloseConfirmPopUp}
          handleDelete={deleteSelected}
          isLoading={isDeleting}
        />
      )}
      {
        isAlertOpen && fileType === "E-DefterKebir" && (
          <WarnAlertCart
            openCartAlert={openCartAlert}
            setOpenCartAlert={setOpenCartAlert}
            message={message}
          ></WarnAlertCart>
        )
      }
    </>
  );
};

export default DosyaTable;
