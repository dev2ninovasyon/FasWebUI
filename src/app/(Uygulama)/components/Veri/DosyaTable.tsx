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

import axios from "axios";

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
}

interface DosyaType {
  id: number;
  adi: string;
  olusturulmaTarihi: string;
  durum: string;
  progress?: number;
}

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
    const sections: string[] = [];

    try {
      const defterYuklemeLoglari = await getDefterYuklemeLoglari(id);
      if (typeof defterYuklemeLoglari === "string" && defterYuklemeLoglari.trim()) {
        sections.push(`[Sunucu İşlem Logları]\n${defterYuklemeLoglari}`);
      } else if (defterYuklemeLoglari) {
        sections.push(
          `[Sunucu İşlem Logları]\n${JSON.stringify(defterYuklemeLoglari, null, 2)}`
        );
      }
    } catch (error) {
      console.log("Defter Logları getirilemedi");
    }

    if (!sections.length) {
      sections.push(
        `Bu dosya için detay log bulunamadı.\nDurum: ${currentStatus || "Bilinmiyor"}`
      );
    }

    setSelectedLogFileName(fileName || `Dosya #${id}`);
    setDefterLoglari(sections.join("\n\n------------------------------\n\n"));
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
        headers: {
          Accept:
            fileType === "E-DefterKebir" ? "text/html" : "application/pdf",
          Authorization: `Bearer ${user.token}`,
        },
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
        olusturulmaTarihi: dosya.olusturulmaTarihi
          .split("T")[0]
          .split("-")
          .reverse()
          .join("."),
        durum: dosya.durum,
        progress: Number((dosya as any).progress ?? (dosya as any).Progress ?? 0),
      }));
      onServerRowsChange?.(serverRows);

      const today = new Date().toLocaleDateString("tr-TR");
      const optimisticRows: DosyaType[] = onlyShowFinalizedRows
        ? []
        : (pendingUploadRows || [])
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
      const hasActiveOptimisticRows = optimisticRows.some((r: DosyaType) => !isFinalStatus(r.durum));
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
    setIsDeleting(true);
    try {
      const result = await deleteDosyaBilgisiMultiple(selected || 0
      );
      if (result) {
        enqueueSnackbar(`${selected.length} kayıt başarıyla silindi.`, {
          variant: "success",
          autoHideDuration: 3000,
        });
        setSelected([]);
        fetchData();
        handleCloseConfirmPopUp();
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
      <TableContainer
        sx={{
          mt: 0.5,
          flexGrow: 1,
          overflowY: "auto",
        }}
      >
        <Table stickyHeader aria-label="sticky table" size="small">
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
                  inputProps={{ "aria-label": "select all desserts" }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="h6">Dosya Adı</Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign={"center"} variant="h6">
                  Tarih
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign={"center"} variant="h6">
                  Durum
                </Typography>
              </TableCell>
              {mdUp && <TableCell></TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row, index) => {
              const isItemSelected = isSelected(row.id);
              const labelId = `enhanced-table-checkbox-${index}`;

              return (
                <TableRow
                  key={index}
                  hover
                  onClick={() => handleClickRow(row.id)}
                  role="checkbox"
                  aria-checked={isItemSelected}
                  selected={isItemSelected}
                  tabIndex={-1}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isItemSelected}
                      inputProps={{ "aria-labelledby": labelId }}
                      size="small"
                    />
                  </TableCell>
                  <TableCell scope="row">
                    <Typography variant="body1" color="textSecondary">
                      {fileType == "E-DefterKebir" ||
                        fileType == "E-DefterYevmiye"
                        ? row.adi.split("-").slice(1).join("-")
                        : row.adi}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ padding: "2px 16px" }}>
                    <Typography
                      textAlign={"center"}
                      variant="body2"
                      color="textSecondary"
                    >
                      {row.olusturulmaTarihi}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <IconButton
                      onClick={(event) => {
                        event.stopPropagation();
                        handlePreview(row.id, row.adi, row.durum);
                      }}
                    >
                        <Chip
                          label={row.durum}
                          sx={{
                            backgroundColor: isFinalStatus(row.durum)
                              ? (theme) => theme.palette.success.light
                              : isProcessingStatus(row.durum)
                                ? (theme) => theme.palette.info.light
                                : isQueueStatus(row.durum)
                                  ? (theme) => theme.palette.warning.light
                                  : (theme) => theme.palette.error.light,
                            color: isFinalStatus(row.durum)
                              ? (theme) => theme.palette.success.main
                              : isProcessingStatus(row.durum)
                                ? (theme) => theme.palette.info.main
                                : isQueueStatus(row.durum)
                                  ? (theme) => theme.palette.warning.main
                                  : (theme) => theme.palette.error.main,
                          }}
                        />
                    </IconButton>
                  </TableCell>
                  {mdUp && (
                    <TableCell sx={{ padding: "2px 16px" }}>
                      <IconButton
                        size="small"
                        id="basic-button"
                        aria-controls={open ? "basic-menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? "true" : undefined}
                        onClick={(event) => handleClick(event, row.id)}
                      >
                        <IconDotsVertical width={18} />
                      </IconButton>

                      <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                          "aria-labelledby": "basic-button",
                        }}
                      >
                        <MenuItem onClick={() => handlePreview2()} disabled={isLoadingPreview === selectedId}>
                          <ListItemIcon>
                            <IconEye width={18} />
                          </ListItemIcon>
                          {isLoadingPreview === selectedId ? "Yükleniyor..." : "Göster"}
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            {/* {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )} */}
          </TableBody>
        </Table>
        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          fullWidth
          maxWidth={"md"}
        >
          <DialogContent className="testdialog">
            <Stack
              direction="row"
              justifyContent={"space-between"}
              alignItems="center"
            >
              <Box>
                <Typography variant="h5" py={1}>
                  İşlem Logları
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedLogFileName}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setIsOpen(false)}>
                <IconX size="18" />
              </IconButton>
            </Stack>
          </DialogContent>
          <Divider />
          <DialogContent>
            <Typography variant="body1" style={{ whiteSpace: "pre-line" }}>
              {defterLoglari}
            </Typography>
          </DialogContent>
        </Dialog>
        <Dialog
          open={isOpen2}
          onClose={() => {
            if (xmlBlobUrl) {
              window.URL.revokeObjectURL(xmlBlobUrl);
              setXmlBlobUrl(null);
            }
            setPreviewDetayKodu("");
            setPreviewHesapAdi("");
            setPreviewAciklama("");
            setPreviewVisibleRows(null);
            setPreviewTotalRows(null);
            setIsOpen2(false);
          }}
          fullWidth
          scroll="paper"
          maxWidth={fileType === "E-DefterKebir" ? false : "xl"}
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
            }}
          >
            <Stack direction="row" justifyContent="flex-end" alignItems="center">
              {fileType === "E-DefterKebir" && (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mr: 2, flexWrap: "wrap" }}>
                  <TextField
                    size="small"
                    label="Detay Kodu"
                    value={previewDetayKodu}
                    onChange={(e) => setPreviewDetayKodu(e.target.value)}
                  />
                  <TextField
                    size="small"
                    label="Hesap Adı"
                    value={previewHesapAdi}
                    onChange={(e) => setPreviewHesapAdi(e.target.value)}
                  />
                  <TextField
                    size="small"
                    label="Açıklama"
                    value={previewAciklama}
                    onChange={(e) => setPreviewAciklama(e.target.value)}
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
                      ? `Gorunen satir: ${previewVisibleRows ?? 0}/${previewTotalRows}`
                      : "Detay kodu veya hesap adı ile arayın"}
                  </Typography>
                </Stack>
              )}
              <IconButton
                size="medium"
                onClick={() => {
                  if (xmlBlobUrl) {
                    window.URL.revokeObjectURL(xmlBlobUrl);
                    setXmlBlobUrl(null);
                  }
                  setPreviewDetayKodu("");
                  setPreviewHesapAdi("");
                  setPreviewAciklama("");
                  setPreviewVisibleRows(null);
                  setPreviewTotalRows(null);
                  setIsOpen2(false);
                }}
              >
                <IconX size="24" />
              </IconButton>
            </Stack>
          </DialogTitle>
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
      {/* <Table>
        <TableFooter
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            border: 0,
          }}
        >
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, { label: "Hepsi", value: -1 }]}
              count={filteredRows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              SelectProps={{
                native: true,
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
              labelRowsPerPage="Sayfa başına satır sayısı:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} arası / ${
                  count !== -1 ? count : `daha fazla`
                } satır`
              }
              sx={{ mt: 0.5, mr: "2px", border: 0 }}
            />
          </TableRow>
        </TableFooter>
      </Table> */}
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


