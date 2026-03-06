import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link as MuiLink,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { enqueueSnackbar } from "notistack";
import { apiFetch } from "@/api/apiBase";
import ImportControlComponent from "@/app/(Uygulama)/components/Musteri/MusteriIslemleri/ImportControlComponent";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { setDenetlenenId, setDenetlenenFirmaAdi, setEnflasyonmu, setYil } from "@/store/user/UserSlice";
import { useRouter } from "next/navigation";

interface ImportProgressDialogProps {
  open: boolean;
  jobId: string | null;
  onClose: () => void;
  onCompleted?: (status: string) => void;
}

interface JobStatus {
  jobId: string;
  status: string;
  errorMessage?: string;
  tasinanDenetlenenId?: number;
  newCompanyName?: string;
  isUserInteractionPending?: boolean;
  pendingTableKey?: string;
  skippedTables?: string[];
  effectiveYears?: number[];
  notifications?: any[];
  stageResults?: any[];
}

const normalizeJobStatus = (raw: any): JobStatus => ({
  jobId: raw?.jobId ?? raw?.JobId ?? "",
  status: raw?.status ?? raw?.Status ?? "",
  errorMessage: raw?.errorMessage ?? raw?.ErrorMessage,
  tasinanDenetlenenId: raw?.tasinanDenetlenenId ?? raw?.TasinanDenetlenenId,
  newCompanyName: raw?.newCompanyName ?? raw?.NewCompanyName,
  isUserInteractionPending:
    (raw?.isUserInteractionPending ?? raw?.IsUserInteractionPending ?? false) === true,
  pendingTableKey: raw?.pendingTableKey ?? raw?.PendingTableKey,
  skippedTables: raw?.skippedTables ?? raw?.SkippedTables ?? [],
  effectiveYears: Array.isArray(raw?.effectiveYears ?? raw?.EffectiveYears)
    ? (raw?.effectiveYears ?? raw?.EffectiveYears).filter((y: any) => Number(y) > 0).sort((a: number, b: number) => a - b)
    : [],
  notifications: raw?.notifications ?? raw?.Notifications ?? [],
  stageResults: raw?.stageResults ?? raw?.StageResults ?? [],
});

interface NormalizedStageResult {
  tableKey: string;
  totalRecords: number;
  processedRecords: number;
  durationSeconds?: number;
  success: boolean;
  errorMessage?: string;
}

type TransferDurum = "Başarılı" | "Başarısız" | "Hata" | "Uyarı";

interface YearBreakdownResult {
  yil: number;
  toplam: number;
  islenen: number;
  sureSn: number;
  durum: TransferDurum;
}

interface GroupedTableResult {
  tableKey: string;
  tabloAdi: string;
  toplam: number;
  islenen: number;
  sureSn: number;
  durum: TransferDurum;
  yillar: YearBreakdownResult[];
}

const parseNumber = (value: any, fallback = 0): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const mergeDurum = (a: TransferDurum, b: TransferDurum): TransferDurum => {
  if (a === "Hata" || b === "Hata") return "Hata";
  if (a === "Başarısız" || b === "Başarısız") return "Başarısız";
  if (a === "Uyarı" || b === "Uyarı") return "Uyarı";
  return "Başarılı";
};

const toTransferDurum = (rawStatus: any, success?: boolean, hasErrorMessage?: boolean): TransferDurum => {
  const statusText = String(rawStatus ?? "").toLowerCase();
  if (statusText.includes("error") || statusText.includes("fail") || statusText.includes("hata")) return "Hata";
  if (statusText.includes("warning") || statusText.includes("warn")) return "Başarısız";
  if (statusText.includes("success") || statusText.includes("succeed") || statusText.includes("basar")) return "Başarılı";
  if (hasErrorMessage) return "Hata";
  if (typeof success === "boolean") return success ? "Başarılı" : "Hata";
  return "Başarılı";
};

export default function ImportProgressDialog({
  open,
  jobId,
  onClose,
  onCompleted,
}: ImportProgressDialogProps) {
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [polling, setPolling] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [canClose, setCanClose] = useState(false);
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});
  const [controlDialogOpen, setControlDialogOpen] = useState(false);
  const [controlTableKey, setControlTableKey] = useState<string>("");
  const [controlYear, setControlYear] = useState<number | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [previousSelection, setPreviousSelection] = useState<{ denetlenenId?: number; yil?: number; enflasyonmu?: boolean } | null>(null);
  const [skippedNavConfirm, setSkippedNavConfirm] = useState<{ tableKey: string; year: number; route: string } | null>(null);
  const lastTerminalNotifiedRef = useRef<string | null>(null);
  const onCompletedRef = useRef(onCompleted);
  const handledTerminalRef = useRef<string | null>(null);
  const isFirstPollRef = useRef(true);
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: AppState) => state.userReducer);

  useEffect(() => {
    onCompletedRef.current = onCompleted;
  }, [onCompleted]);

  useEffect(() => {
    if (!open || !jobId) {
      setPolling(false);
      return;
    }

    setPolling(true);
    setCanClose(false);
    isFirstPollRef.current = true;

    const processStatus = (status: JobStatus, intervalRef: { id: ReturnType<typeof setInterval> | null }) => {
      setJobStatus(status);

      if (
        !["Succeeded", "Failed", "Cancelled"].includes(status.status) &&
        (status.isUserInteractionPending || status.status === "WaitingForUserInput")
      ) {
        setPolling(false);
        setErrorModalOpen(true);
      }

      if (
        status.status === "Succeeded" ||
        status.status === "Failed" ||
        status.status === "Cancelled"
      ) {
        const cancelFinalized =
          status.status !== "Cancelled" ||
          (status.notifications ?? []).some((n: any) => {
            const msg = String(n?.message ?? n?.Message ?? "").toLowerCase();
            return msg.includes("geri alma tamamlandı") || msg.includes("geri alma sırasında uyarı");
          });

        // Cancel durumunda rollback final mesajı gelmeden polling'i kesme.
        if (!cancelFinalized) {
          isFirstPollRef.current = false;
          return;
        }

        if (intervalRef.id !== null) {
          clearInterval(intervalRef.id);
          intervalRef.id = null;
        }
        setPolling(false);
        setCanClose(true);

        const handledKey = `${status.jobId}:${status.status}`;
        if (handledTerminalRef.current !== handledKey) {
          handledTerminalRef.current = handledKey;
          onCompletedRef.current?.(status.status);
        }

        // İlk polling'de zaten terminal durumdaysa (dialog önceden tamamlanmış bir job için açıldı)
        // snackbar gösterme — sadece bu oturumda tamamlandıysa göster.
        const terminalKey = `${status.jobId}:${status.status}`;
        if (lastTerminalNotifiedRef.current !== terminalKey && !isFirstPollRef.current) {
          lastTerminalNotifiedRef.current = terminalKey;

          const hasStageErrors = (status.stageResults ?? []).some((r: any) => {
            const success = r?.success ?? r?.Success;
            const err = r?.errorMessage ?? r?.ErrorMessage;
            return success === false || Boolean(err);
          });

          if (status.status === "Succeeded" && !hasStageErrors) {
            enqueueSnackbar("✓ Taşıma işlemi başarıyla tamamlandı!", { variant: "success" });
          } else if (status.status === "Succeeded" && hasStageErrors) {
            enqueueSnackbar("Müşteri veri taşıma işlemi tamamlandı ancak bazı tablolarda hata var.", { variant: "warning" });
          } else if (status.status === "Failed") {
            enqueueSnackbar("✗ Taşıma işlemi sırasında hata oluştu!", { variant: "error" });
          } else if (status.status === "Cancelled") {
            enqueueSnackbar("⊘ Taşıma işlemi kullanıcı tarafından iptal edildi.", { variant: "warning" });
          }
        } else if (lastTerminalNotifiedRef.current !== terminalKey) {
          // İlk polling zaten terminal → sadece ref'i güncelle, snackbar gösterme
          lastTerminalNotifiedRef.current = terminalKey;
        }
      }

      isFirstPollRef.current = false;
    };

    const intervalRef: { id: ReturnType<typeof setInterval> | null } = { id: null };

    // Dialog açılır açılmaz anında ilk fetch yap (2 sn beklemeden)
    const fetchStatus = async () => {
      try {
        const response = await apiFetch(`/DataTransfer/ImportJobStatus/${jobId}`);
        if (!response.ok) throw new Error("Job bulunamadı");
        const statusRaw = await response.json();
        processStatus(normalizeJobStatus(statusRaw), intervalRef);
      } catch (e: any) {
        console.error("Polling hatası:", e);
        isFirstPollRef.current = false;
      }
    };

    fetchStatus();

    intervalRef.id = setInterval(fetchStatus, 2000);

    return () => {
      if (intervalRef.id !== null) clearInterval(intervalRef.id);
    };
  }, [open, jobId]);

  const handleErrorModalAction = async (action: "continue" | "skip" | "cancel") => {
    if (!jobId) return;
    setActionInProgress(true);

    try {
      const response = await apiFetch(`/DataTransfer/ImportJob/${jobId}/Resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) throw new Error("Resume hatası");

      setErrorModalOpen(false);
      setPolling(true);

      if (action === "continue") {
        enqueueSnackbar("Hatalı tablo atlandı, işlem diğer tablolara devam ediyor.", {
          variant: "warning",
        });
      } else if (action === "cancel") {
        enqueueSnackbar("İşlem iptal edildi.", {
          variant: "warning",
        });
      } else {
        enqueueSnackbar(`İşlem "${action}" ile devam ediyor...`, { variant: "info" });
      }
    } catch (e: any) {
      enqueueSnackbar("Eylem gerçekleştirilirken hata: " + (e.message || "Bilinmeyen hata"), {
        variant: "error",
      });
    } finally {
      setActionInProgress(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Succeeded":
        return "success";
      case "Failed":
      case "Cancelled":
        return "error";
      case "Running":
      case "WaitingForUserInput":
        return "info";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Queued":
        return "Kuyruğa Alındı";
      case "Running":
        return "Çalışıyor";
      case "Succeeded":
        return "✓ Başarılı";
      case "Failed":
        return "✗ Başarısız";
      case "Cancelled":
        return "⊘ İptal Edildi";
      case "WaitingForUserInput":
        return "â¸ Onay Bekliyor";
      default:
        return status;
    }
  };

  const getManualSourceHint = (tableKey: string) => {
    switch (tableKey) {
      case "DonusumMizan":
        return "OldDb: DonusumBobiDetayMizan / DonusumTfrsDetayMizan";
      case "Amortisman":
        return "OldDb: AmortismanHesaplamaV3";
      case "CekSenetReeskont":
        return "OldDb: CekSenetReeskontKayitlari";
      case "DavaKarsiliklari":
        return "OldDb: DavaKarsiliklariHesaplanan";
      case "KidemTazminati":
        return "OldDb: KidemTazminatiVerileriV2";
      case "KrediHesaplama":
        return "OldDb: KrediHesaplama";
      case "Yaslandirma":
        return "OldDb: YaslandirmaKayitlariV3";
      case "ErtelenmisVergiHesabi":
        return "OldDb: ErtelenmisVergiHesabi";
      case "EnflasyonDonusumMizan":
        return "OldDb: DonusumEnflasyonDetayMizan";
      default:
        return "OldDb ilgili kaynak tablo";
    }
  };

  const getManualRoute = (tableKey: string) => {
    switch (tableKey) {
      case "DonusumMizan":
        return "/DenetimKanitlari/MizanKontrol/DonusumMizanKontrol";
      case "Amortisman":
        return "/Hesaplamalar/Amortisman";
      case "CekSenetReeskont":
        return "/Hesaplamalar/CekSenetReeskont";
      case "DavaKarsiliklari":
        return "/Hesaplamalar/DavaKarsiliklari";
      case "KidemTazminati":
        return "/Hesaplamalar/KidemTazminatiBobi";
      case "KrediHesaplama":
        return "/Hesaplamalar/KrediHesaplama";
      case "Yaslandirma":
        return "/Hesaplamalar/Yaslandirma";
      case "ErtelenmisVergiHesabi":
        return "/Hesaplamalar/ErtelenmisVergiHesabi";
      case "EnflasyonDonusumMizan":
        return "/DenetimKanitlari/MizanKontrol/DonusumMizanKontrol";
      default:
        return null;
    }
  };

  const getControlRoute = (tableKey: string) => {
    switch (tableKey) {
      case "DonusumMizan":
        return "/DenetimKanitlari/MizanKontrol/DonusumMizanKontrol";
      case "Amortisman":
        return "/Hesaplamalar/Amortisman";
      case "CekSenetReeskont":
        return "/Hesaplamalar/CekSenetReeskont";
      case "DavaKarsiliklari":
        return "/Hesaplamalar/DavaKarsiliklari";
      case "KidemTazminati":
        return "/Hesaplamalar/KidemTazminatiBobi";
      case "KrediHesaplama":
        return "/Hesaplamalar/KrediHesaplama";
      case "Yaslandirma":
        return "/Hesaplamalar/Yaslandirma";
      case "ErtelenmisVergiHesabi":
        return "/Hesaplamalar/ErtelenmisVergiHesabi";
      case "EnflasyonDonusumMizan":
        return "/DenetimKanitlari/MizanKontrol/DonusumMizanKontrol";
      default:
        return null;
    }
  };

  const getTableDisplayName = (tableKey: string): string => {
    const names: Record<string, string> = {
      "DonusumMizan": "Dönüşüm Mizan",
      "Amortisman": "Amortisman",
      "CekSenetReeskont": "Çek Senet Reeskont",
      "DavaKarsiliklari": "Dava Karşılıkları",
      "KidemTazminati": "Kıdem Tazminatı",
      "KrediHesaplama": "Kredi Hesaplaması",
      "Yaslandirma": "Yaşlandırma",
      "ErtelenmisVergiHesabi": "Ertelenmiş Vergi Hesabı",
      "EnflasyonDonusumMizan": "Enflasyon Dönüşüm Mizan",
    };
    return names[tableKey] ?? tableKey;
  };

  const normalizeStageResult = (result: any): NormalizedStageResult => ({
    tableKey: result?.tableKey ?? result?.TableKey ?? "",
    totalRecords: result?.totalRecords ?? result?.TotalRecords ?? 0,
    processedRecords: result?.processedRecords ?? result?.ProcessedRecords ?? 0,
    durationSeconds: result?.durationSeconds ?? result?.DurationSeconds,
    success: (result?.success ?? result?.Success ?? false) === true,
    errorMessage: result?.errorMessage ?? result?.ErrorMessage,
  });

  const groupedResults = useMemo<GroupedTableResult[]>(() => {
    const rawResults = Array.isArray(jobStatus?.stageResults) ? jobStatus.stageResults : [];
    if (!rawResults.length) return [];

    const isTargetModel = rawResults.every(
      (r: any) =>
        (r?.tabloAdi || r?.tableKey || r?.TableKey) &&
        Array.isArray(r?.yillar ?? r?.years ?? r?.yearSummaries ?? r?.YearSummaries)
    );

    if (isTargetModel) {
      return rawResults
        .filter((r: any) => !["Denetlened", "Denetlenen"].includes(r?.tableKey ?? r?.TableKey ?? ""))

        .map((r: any) => {
          const yillar: YearBreakdownResult[] = (r?.yillar ?? r?.years ?? r?.yearSummaries ?? r?.YearSummaries ?? [])
            .map((y: any) => {
              const yil = parseNumber(y?.yil ?? y?.year ?? y?.Year, 0);
              const toplam = parseNumber(
                y?.toplam ?? y?.total ?? y?.totalRecords ?? y?.TotalRecords ?? y?.readRecords ?? y?.ReadRecords,
                0
              );
              const islenen = parseNumber(
                y?.islenen ?? y?.processed ?? y?.processedRecords ?? y?.ProcessedRecords ?? y?.addedRecords ?? y?.AddedRecords,
                0
              );
              const sureSn = parseNumber(y?.sureSn ?? y?.durationSeconds ?? y?.DurationSeconds, 0);
              const durum = toTransferDurum(
                y?.durum ?? y?.status,
                undefined,
                Boolean(y?.errorMessage ?? y?.ErrorMessage)
              );
              const cappedIslenen = toplam > 0 ? Math.min(islenen, toplam) : islenen;
              return {
                yil,
                toplam,
                islenen: cappedIslenen,
                sureSn,
                durum: cappedIslenen < toplam && durum === "Başarılı" ? "Uyarı" : durum,
              };
            })
            .filter((y: YearBreakdownResult) => y.yil > 0)
            .sort((a: YearBreakdownResult, b: YearBreakdownResult) => a.yil - b.yil);

          const toplam = yillar.length > 0
            ? yillar.reduce((sum, y) => sum + y.toplam, 0)
            : parseNumber(r?.toplam ?? r?.totalRecords ?? r?.TotalRecords, 0);
          const islenen = yillar.length > 0
            ? yillar.reduce((sum, y) => sum + y.islenen, 0)
            : parseNumber(r?.islenen ?? r?.processedRecords ?? r?.ProcessedRecords, 0);
          const sureSn = parseNumber(
            r?.sureSn ?? r?.durationSeconds ?? r?.DurationSeconds,
            yillar.reduce((sum, y) => sum + y.sureSn, 0)
          );
          const durum = yillar.length
            ? yillar.reduce<TransferDurum>((agg, y) => mergeDurum(agg, y.durum), "Başarılı")
            : toTransferDurum(r?.durum ?? r?.status, undefined, Boolean(r?.errorMessage ?? r?.ErrorMessage));

          const rawTableKey = String(r?.tableKey ?? r?.TableKey ?? r?.tabloAdi ?? "");
          return {
            tableKey: rawTableKey,
            tabloAdi: getTableDisplayName(rawTableKey),
            toplam,
            islenen,
            sureSn,
            durum,
            yillar,
          };
        });
    }

    const grouped = new Map<string, GroupedTableResult>();
    rawResults.forEach((raw: any) => {
      const result = normalizeStageResult(raw);
      if (!result.tableKey) return;
      if (result.tableKey === "Denetlened" || result.tableKey === "Denetlenen") return;

      const yil = parseNumber(raw?.yil ?? raw?.year ?? raw?.Year, 0);
      const stageDurum = toTransferDurum(raw?.durum ?? raw?.status ?? raw?.Status, result.success, Boolean(result.errorMessage));
      const computedStageDurum =
        result.processedRecords < result.totalRecords && stageDurum === "Başarılı" ? "Uyarı" : stageDurum;

      if (!grouped.has(result.tableKey)) {
        grouped.set(result.tableKey, {
          tableKey: result.tableKey,
          tabloAdi: getTableDisplayName(result.tableKey),
          toplam: 0,
          islenen: 0,
          sureSn: 0,
          durum: "Başarılı",
          yillar: [],
        });
      }

      const group = grouped.get(result.tableKey)!;
      group.toplam += result.totalRecords;
      group.islenen += result.processedRecords;
      group.sureSn += parseNumber(result.durationSeconds, 0);
      group.durum = mergeDurum(group.durum, computedStageDurum);

      const existingYear = group.yillar.find((y) => y.yil === yil);
      const yearEntry: YearBreakdownResult = {
        yil,
        toplam: result.totalRecords,
        islenen: result.processedRecords,
        sureSn: parseNumber(result.durationSeconds, 0),
        durum: computedStageDurum,
      };

      if (yil > 0) {
        if (existingYear) {
          existingYear.toplam += yearEntry.toplam;
          existingYear.islenen += yearEntry.islenen;
          existingYear.sureSn += yearEntry.sureSn;
          existingYear.durum = mergeDurum(existingYear.durum, yearEntry.durum);
        } else {
          group.yillar.push(yearEntry);
        }
      }
    });

    return Array.from(grouped.values()).map((group) => ({
      ...group,
      yillar: group.yillar.sort((a, b) => a.yil - b.yil),
      durum: group.yillar.length
        ? group.yillar.reduce<TransferDurum>((agg, y) => mergeDurum(agg, y.durum), "Başarılı")
        : group.durum,
    }));
  }, [jobStatus?.stageResults]);

  const toggleExpanded = (tableKey: string) => {
    setExpandedTables((prev) => ({ ...prev, [tableKey]: !prev[tableKey] }));
  };

  const renderDurum = (durum: TransferDurum) => {
    const icon =
      durum === "Başarılı" ? (
        <CheckCircleOutlineIcon fontSize="small" sx={{ color: "success.main" }} />
      ) : durum === "Uyarı" ? (
        <WarningAmberOutlinedIcon fontSize="small" sx={{ color: "warning.main" }} />
      ) : (
        <ErrorOutlineIcon fontSize="small" sx={{ color: "error.main" }} />
      );
    return (
      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
        {icon}
        <Typography variant="body2">{durum}</Typography>
      </Box>
    );
  };

  const renderYearChips = (result: GroupedTableResult) => {
    const years = Array.from(new Set(result.yillar.map((y) => y.yil).filter((y) => y > 0))).sort((a, b) => a - b);
    if (!years.length) return "-";

    const visibleYears = years.slice(0, 3);
    const remaining = years.length - visibleYears.length;
    return (
      <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.5 }}>
        {visibleYears.map((year) => (
          <Chip key={`${result.tabloAdi}-${year}`} label={year} size="small" variant="outlined" />
        ))}
        {remaining > 0 && (
          <Tooltip title={years.join(", ")}>
            <Chip label={`+${remaining}`} size="small" />
          </Tooltip>
        )}
      </Box>
    );
  };

  const getControlHref = (tableKey: string, year?: number, denetlenenId?: number) => {
    const route = getControlRoute(tableKey);
    if (!route) return null;
    const query = new URLSearchParams();
    if (typeof year === "number" && year > 0) query.set("yil", String(year));
    if (typeof denetlenenId === "number" && denetlenenId > 0) query.set("denetlenenId", String(denetlenenId));
    const qs = query.toString();
    return qs ? `${route}?${qs}` : route;
  };

  const handleOpenControlDialog = (tableKey: string, year?: number) => {
    const targetDenetlenenId = Number(jobStatus?.tasinanDenetlenenId ?? 0);
    if (!targetDenetlenenId) {
      enqueueSnackbar("Kontrol için taşınan denetlenen kimliği bulunamadı.", { variant: "warning" });
      return;
    }
    const targetYear = Number(year ?? 0);
    if (!targetYear) {
      enqueueSnackbar("Kontrol için yıl bilgisi bulunamadı.", { variant: "warning" });
      return;
    }

    const targetEnflasyonmu = tableKey === "EnflasyonDonusumMizan";

    setPreviousSelection({
      denetlenenId: user?.denetlenenId,
      yil: user?.yil,
      enflasyonmu: user?.enflasyonmu,
    });
    dispatch(setDenetlenenId(targetDenetlenenId));
    dispatch(setYil(targetYear));
    if (targetEnflasyonmu) dispatch(setEnflasyonmu(true));
    setControlTableKey(tableKey);
    setControlYear(targetYear);
    setControlDialogOpen(true);
  };

  const handleCloseControlDialog = () => {
    if (previousSelection) {
      if (typeof previousSelection.denetlenenId === "number") {
        dispatch(setDenetlenenId(previousSelection.denetlenenId));
      }
      if (typeof previousSelection.yil === "number") {
        dispatch(setYil(previousSelection.yil));
      }
      if (typeof previousSelection.enflasyonmu === "boolean") {
        dispatch(setEnflasyonmu(previousSelection.enflasyonmu));
      }
    }
    setControlDialogOpen(false);
    setControlTableKey("");
    setControlYear(null);
    setPreviousSelection(null);
  };

  const handleSkippedNavClick = (tableKey: string, year: number, route: string) => {
    const targetDenetlenenId = Number(jobStatus?.tasinanDenetlenenId ?? 0);
    const currentDenetlenenId = Number(user?.denetlenenId ?? 0);
    const currentYil = Number(user?.yil ?? 0);

    // Mevcut şirket ve yıl zaten hedefle aynıysa uyarı atla, direkt git
    const isSameCompany = targetDenetlenenId > 0 && targetDenetlenenId === currentDenetlenenId;
    const isSameYear = year === 0 || (year > 0 && year === currentYil);

    if (isSameCompany && isSameYear) {
      const query = new URLSearchParams();
      if (year > 0) query.set("yil", String(year));
      if (targetDenetlenenId > 0) query.set("denetlenenId", String(targetDenetlenenId));
      const fullRoute = query.toString() ? `${route}?${query.toString()}` : route;
      window.open(fullRoute, "_blank");
      return;
    }

    setSkippedNavConfirm({ tableKey, year, route });
  };

  const handleSkippedNavConfirm = () => {
    if (!skippedNavConfirm) return;
    const { route, year } = skippedNavConfirm;
    const targetDenetlenenId = Number(jobStatus?.tasinanDenetlenenId ?? 0);
    const targetName = jobStatus?.newCompanyName ?? "";

    dispatch(setDenetlenenId(targetDenetlenenId));
    if (targetName) dispatch(setDenetlenenFirmaAdi(targetName));
    dispatch(setYil(year));

    // Yeni sekmede açmak için tam URL oluştur
    const query = new URLSearchParams();
    if (year > 0) query.set("yil", String(year));
    if (targetDenetlenenId > 0) query.set("denetlenenId", String(targetDenetlenenId));
    const fullRoute = query.toString() ? `${route}?${query.toString()}` : route;

    setSkippedNavConfirm(null);
    window.open(fullRoute, "_blank");
  };

  return (
    <>
      <Dialog
        open={open && !errorModalOpen}
        maxWidth="md"
        fullWidth
        onClose={() => canClose && onClose()}
        disableEscapeKeyDown={!canClose}
      >
        <DialogTitle>
          Müşteri Data Taşıma İşlemi
          {jobStatus && (
            <Chip
              label={getStatusLabel(jobStatus.status)}
              color={getStatusColor(jobStatus.status) as any}
              sx={{ ml: 2 }}
            />
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {!jobStatus ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {jobStatus.status === "Queued" && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    İşlem kuyruğa alındı, başlaması bekleniyor...
                  </Alert>
                )}
                {jobStatus.status === "Running" && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <CircularProgress size={20} sx={{ mr: 1, mb: -0.5 }} />
                    İşlem çalışıyor... Lütfen bekleyin.
                  </Alert>
                )}
                {jobStatus.status === "Succeeded" && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    ✓ İşlem başarıyla tamamlandı!
                  </Alert>
                )}
                {jobStatus.status === "Failed" && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    ✗ İşlem sırasında bir hata oluştu
                  </Alert>
                )}
                {jobStatus.status === "Cancelled" && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    ⊘ İşlem kullanıcı tarafından iptal edildi
                  </Alert>
                )}

                {jobStatus.errorMessage && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <strong>Hata:</strong> {jobStatus.errorMessage}
                  </Alert>
                )}

                {groupedResults.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <h4>Tablo Başına Sonuçlar:</h4>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                            <TableCell sx={{ width: 56 }} />
                            <TableCell><strong>Tablo Adı</strong></TableCell>
                            <TableCell align="right"><strong>Toplam</strong></TableCell>
                            <TableCell align="right"><strong>Taşınan</strong></TableCell>
                            <TableCell><strong>Yıllar</strong></TableCell>
                            <TableCell align="right"><strong>Süre (sn)</strong></TableCell>
                            <TableCell><strong>Durum</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {groupedResults.map((result) => {
                            const expanded = Boolean(expandedTables[result.tabloAdi]);
                            return (
                              <React.Fragment key={`new-${result.tabloAdi}`}>
                                <TableRow hover onClick={() => toggleExpanded(result.tabloAdi)} sx={{ cursor: "pointer" }}>
                                  <TableCell sx={{ width: 56 }}>
                                    <IconButton
                                      size="small"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        toggleExpanded(result.tabloAdi);
                                      }}
                                    >
                                      {expanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                                    </IconButton>
                                  </TableCell>
                                  <TableCell>{result.tabloAdi}</TableCell>
                                  <TableCell align="right">{result.toplam}</TableCell>
                                  <TableCell align="right">{result.islenen}</TableCell>
                                  <TableCell>{renderYearChips(result)}</TableCell>
                                  <TableCell align="right">{result.sureSn ? result.sureSn.toFixed(2) : "-"}</TableCell>
                                  <TableCell>{renderDurum(result.durum)}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell colSpan={7} sx={{ py: 0, border: 0 }}>
                                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                                      <Paper
                                        elevation={0}
                                        sx={{
                                          my: 1.5,
                                          mx: 1,
                                          p: 1.5,
                                          backgroundColor: "#f7f8fa",
                                          border: "1px solid #e5e7eb",
                                        }}
                                      >
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                          Yıl Bazlı Sonuçlar
                                        </Typography>
                                        <Table size="small">
                                          <TableHead>
                                            <TableRow>
                                              <TableCell><strong>Yıl</strong></TableCell>
                                              <TableCell align="right"><strong>Toplam</strong></TableCell>
                                              <TableCell align="right"><strong>Taşınan</strong></TableCell>
                                              <TableCell align="right"><strong>Süre (sn)</strong></TableCell>
                                              <TableCell><strong>Durum</strong></TableCell>
                                              <TableCell><strong>Kontrol</strong></TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            {result.yillar.length > 0 ? (
                                              result.yillar.map((yearRow) => {
                                                const yearHref = getControlHref(
                                                  result.tableKey,
                                                  yearRow.yil,
                                                  Number(jobStatus?.tasinanDenetlenenId ?? 0)
                                                );
                                                return (
                                                  <TableRow key={`${result.tableKey}-${yearRow.yil}`}>
                                                    <TableCell>{yearRow.yil}</TableCell>
                                                    <TableCell align="right">{yearRow.toplam}</TableCell>
                                                    <TableCell align="right">{yearRow.islenen}</TableCell>
                                                    <TableCell align="right">{yearRow.sureSn ? yearRow.sureSn.toFixed(2) : "-"}</TableCell>
                                                    <TableCell>{renderDurum(yearRow.durum)}</TableCell>
                                                    <TableCell>
                                                      {yearHref ? (
                                                        <Button
                                                          size="small"
                                                          variant="text"
                                                          onClick={() => handleOpenControlDialog(result.tableKey, yearRow.yil)}
                                                        >
                                                          Kontrol Et
                                                        </Button>
                                                      ) : (
                                                        "-"
                                                      )}
                                                    </TableCell>
                                                  </TableRow>
                                                );
                                              })
                                            ) : (
                                              <TableRow>
                                                <TableCell colSpan={6} align="center">
                                                  Yıl kırılımı bulunamadı.
                                                </TableCell>
                                              </TableRow>
                                            )}
                                          </TableBody>
                                        </Table>
                                      </Paper>
                                    </Collapse>
                                  </TableCell>
                                </TableRow>
                              </React.Fragment>
                            );
                          })}

                          {jobStatus.skippedTables && jobStatus.skippedTables.length > 0 && (
                            <>
                              <TableRow sx={{ backgroundColor: "#fff4e5" }}>
                                <TableCell colSpan={7}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", py: 1, color: "#663c00" }}>
                                    Taşınamayan Veriler
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              {jobStatus.skippedTables.map((tableKey) => {
                                const expanded = Boolean(expandedTables[tableKey]);
                                const skippedYears = (jobStatus.effectiveYears ?? []).filter((y) => y > 0).sort((a, b) => a - b);
                                const manualRoute = getManualRoute(tableKey);
                                return (
                                  <React.Fragment key={`skipped-${tableKey}`}>
                                    <TableRow hover onClick={() => toggleExpanded(tableKey)} sx={{ cursor: "pointer" }}>
                                      <TableCell sx={{ width: 56 }}>
                                        <IconButton
                                          size="small"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            toggleExpanded(tableKey);
                                          }}
                                        >
                                          {expanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                                        </IconButton>
                                      </TableCell>
                                      <TableCell>{getTableDisplayName(tableKey)}</TableCell>
                                      <TableCell align="right">-</TableCell>
                                      <TableCell align="right">-</TableCell>
                                      <TableCell align="center">-</TableCell>
                                      <TableCell align="right">-</TableCell>
                                      <TableCell>{renderDurum("Uyarı")}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell colSpan={7} sx={{ py: 0, border: 0 }}>
                                        <Collapse in={expanded} timeout="auto" unmountOnExit>
                                          <Paper
                                            elevation={0}
                                            sx={{
                                              my: 1.5,
                                              mx: 1,
                                              p: 2,
                                              backgroundColor: "#fffdfa",
                                              border: "1px solid #ffd8a8",
                                              borderRadius: 2
                                            }}
                                          >
                                            <Typography variant="body1" sx={{ mb: 1.5, fontWeight: 500 }}>
                                              Bu tablo otomatik taşınamadı. Lütfen ilgili ekrana giderek verilerinizi manuel olarak düzenleyin veya kontrol edin.
                                            </Typography>
                                            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                                              <strong>Kaynak Bilgisi:</strong> {getManualSourceHint(tableKey)}
                                            </Typography>

                                            {/* Yıl bazlı tablo */}
                                            {skippedYears.length > 0 && manualRoute ? (
                                              <>
                                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                  Yıl Bazlı Sonuçlar
                                                </Typography>
                                                <Table size="small" sx={{ mb: 1.5 }}>
                                                  <TableHead>
                                                    <TableRow>
                                                      <TableCell><strong>Yıl</strong></TableCell>
                                                      <TableCell><strong>Toplam</strong></TableCell>
                                                      <TableCell><strong>Taşınan</strong></TableCell>
                                                      <TableCell><strong>Süre (sn)</strong></TableCell>
                                                      <TableCell><strong>Durum</strong></TableCell>
                                                      <TableCell><strong>Ekran</strong></TableCell>
                                                    </TableRow>
                                                  </TableHead>
                                                  <TableBody>
                                                    {skippedYears.map((yr) => {
                                                      const denetlenenId = Number(jobStatus?.tasinanDenetlenenId ?? 0);
                                                      const routeWithYear = `${manualRoute}?yil=${yr}${denetlenenId > 0 ? `&denetlenenId=${denetlenenId}` : ""}`;
                                                      return (
                                                        <TableRow key={`${tableKey}-skipped-${yr}`}>
                                                          <TableCell>{yr}</TableCell>
                                                          <TableCell>-</TableCell>
                                                          <TableCell>-</TableCell>
                                                          <TableCell>-</TableCell>
                                                          <TableCell>{renderDurum("Uyarı")}</TableCell>
                                                          <TableCell>
                                                            <Button
                                                              size="small"
                                                              variant="contained"
                                                              color="warning"
                                                              onClick={() => handleSkippedNavClick(tableKey, yr, manualRoute)}
                                                              startIcon={<KeyboardArrowRightIcon />}
                                                              sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}
                                                            >
                                                              İlgili Ekrana Git
                                                            </Button>
                                                          </TableCell>
                                                        </TableRow>
                                                      );
                                                    })}
                                                  </TableBody>
                                                </Table>
                                              </>
                                            ) : manualRoute ? (
                                              /* Yıl bilgisi yoksa tek buton */
                                              <Button
                                                variant="contained"
                                                color="warning"
                                                size="medium"
                                                onClick={() => handleSkippedNavClick(tableKey, 0, manualRoute)}
                                                sx={{ fontWeight: "bold", px: 3 }}
                                                startIcon={<KeyboardArrowRightIcon />}
                                              >
                                                İlgili Ekrana Git
                                              </Button>
                                            ) : null}
                                          </Paper>
                                        </Collapse>
                                      </TableCell>
                                    </TableRow>
                                  </React.Fragment>
                                );
                              })}
                            </>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/*
                  <Box sx={{ mb: 3 }}>
                    <h4>Tablo Başına Sonuçlar:</h4>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                            <TableCell sx={{ width: 56 }} />
                            <TableCell>
                              <strong>Tablo Adı</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>Toplam</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>İşlenen</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>Süre (sn)</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Yillar</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Durum</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Kontrol</strong>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {groupedResults.map((result) => {
                            const expanded = Boolean(expandedTables[result.tabloAdi]);
                            const tableYear = getTableControlYear(result);
                            const tableHref = getControlHref(result.tabloAdi, tableYear);
                            return (
                              <React.Fragment key={result.tabloAdi}>
                                <TableRow hover onClick={() => toggleExpanded(result.tabloAdi)} sx={{ cursor: "pointer" }}>
                                  <TableCell sx={{ width: 56 }}>
                                    <IconButton
                                      size="small"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        toggleExpanded(result.tabloAdi);
                                      }}
                                    >
                                      {expanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                                    </IconButton>
                                  </TableCell>
                                  <TableCell>{result.tabloAdi}</TableCell>
                                  <TableCell align="right">{result.toplam}</TableCell>
                                  <TableCell align="right">{result.islenen}</TableCell>
                                  <TableCell align="right">{result.sureSn ? result.sureSn.toFixed(2) : "-"}</TableCell>
                              <TableCell>
                                <Chip
                                  label={result.success ? "✓" : "✗"}
                                  color={result.success ? "success" : "error"}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                {result.success && getControlRoute(result.tableKey) ? (
                                  <MuiLink href={getControlRoute(result.tableKey)!} underline="hover">
                                    Kontrole Git
                                  </MuiLink>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                            </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                */}

                {jobStatus.notifications && jobStatus.notifications.length > 0 && (
                  <Box>
                    <Box
                      onClick={() => setShowLogs(!showLogs)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        mb: 1,
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      {showLogs ? (
                        <KeyboardArrowDownIcon />
                      ) : (
                        <KeyboardArrowRightIcon />
                      )}
                      <Typography
                        variant="h6"
                        component="h4"
                        sx={{ ml: 1, my: 0, fontSize: "1.1rem", fontWeight: 600 }}
                      >
                        Ayrıntılı Log Mesajları:
                      </Typography>
                    </Box>
                    <Collapse in={showLogs}>
                      <Box
                        sx={{
                          maxHeight: 250,
                          overflow: "auto",
                          backgroundColor: "#f9f9f9",
                          border: "1px solid #ddd",
                          p: 1.5,
                          borderRadius: 1,
                          fontFamily: "monospace",
                          fontSize: "0.8rem",
                          lineHeight: 1.6,
                        }}
                      >
                        {jobStatus.notifications.map((notif: any, idx: number) => (
                          <Box
                            key={idx}
                            sx={{
                              mb: 0.5,
                              color:
                                notif.severity === "Error"
                                  ? "#d32f2f"
                                  : notif.severity === "Warning"
                                    ? "#f57c00"
                                    : "#1976d2",
                            }}
                          >
                            <span style={{ color: "#999" }}>
                              {new Date(notif.createdAt).toLocaleTimeString()}
                            </span>{" "}
                            <span>
                              {notif.message}
                              {notif.recordCount && ` [${notif.recordCount} kayıt]`}
                            </span>
                          </Box>
                        ))}
                      </Box>
                    </Collapse>
                  </Box>
                )}

              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          {canClose || jobStatus?.status === "Succeeded" ? (
            <Button onClick={onClose} variant="contained">
              Kapat
            </Button>
          ) : (
            <Box sx={{ color: "#999", fontSize: "0.9rem" }}>
              İşlem tamamlanıncaya kadar bekleyin...
            </Box>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={errorModalOpen} maxWidth="sm" fullWidth disableEscapeKeyDown>
        <DialogTitle>⚠ İşlem Duraklatıldı - Onay Gerekli</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {jobStatus?.pendingTableKey && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <strong>{jobStatus.pendingTableKey}</strong> tablosunda hata oluştu:
              </Alert>
            )}

            {jobStatus?.stageResults
              ?.map((r: any) => normalizeStageResult(r))
              .find((r) => r.tableKey === jobStatus.pendingTableKey)?.errorMessage && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {
                    jobStatus.stageResults
                      .map((r: any) => normalizeStageResult(r))
                      .find((r) => r.tableKey === jobStatus.pendingTableKey)?.errorMessage
                  }
                </Alert>
              )}

            <Box sx={{ mb: 2 }}>
              <p>
                <strong>Ne yapmak istiyorsunuz?</strong>
              </p>
              <ul style={{ marginLeft: 20 }}>
                <li>
                  <strong>Devam Et:</strong> Hata alınan bu tablo atlanır ve işlem diğer tablolara
                  devam eder
                </li>
                <li>
                  <strong>İptal Et:</strong> Tüm işlemi iptal edin
                </li>
              </ul>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handleErrorModalAction("continue")}
            variant="outlined"
            disabled={actionInProgress}
          >
            {actionInProgress ? <CircularProgress size={20} /> : "Devam Et (Tabloyu Atla)"}
          </Button>
          <Button
            onClick={() => handleErrorModalAction("cancel")}
            variant="contained"
            color="error"
            disabled={actionInProgress}
          >
            İptal Et
          </Button>
        </DialogActions>
      </Dialog>

      {/* İlgili Ekrana Git - Şirket/Yıl Değişikliği Onay Diyaloğu */}
      <Dialog
        open={Boolean(skippedNavConfirm)}
        onClose={() => setSkippedNavConfirm(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>⚠ Şirket ve Yıl Değişikliği</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Bu işlem{" "}
              <strong>
                {jobStatus?.newCompanyName ?? `ID: ${jobStatus?.tasinanDenetlenenId}`}
              </strong>{" "}
              şirketine{skippedNavConfirm && skippedNavConfirm.year > 0 ? (
                <> ve <strong>{skippedNavConfirm.year}</strong> yılına</>
              ) : null} aittir. Devam ederseniz mevcut seçili şirket ve yıl bilgileriniz aşağıdaki bilgilere göre değiştirilecektir.
              <br /><strong>Onaylıyor musunuz?</strong>
            </Alert>
            <Box sx={{ bgcolor: "action.hover", borderRadius: 1, p: 2, mb: 1.5 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Mevcut Şirket:</strong>{" "}
                {user?.denetlenenFirmaAdi
                  ? `${user.denetlenenFirmaAdi} (ID: ${user.denetlenenId})`
                  : user?.denetlenenId
                    ? `ID: ${user.denetlenenId}`
                    : "Seçili şirket yok"}
              </Typography>
              <Typography variant="body2">
                <strong>Mevcut Yıl:</strong> {user?.yil ?? "-"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", color: "warning.main", mb: 1.5 }}>
              <KeyboardArrowRightIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box sx={{ bgcolor: "rgba(237, 108, 2, 0.08)", borderRadius: 1, p: 2, border: "1px solid rgba(237, 108, 2, 0.3)" }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Hedef Şirket:</strong>{" "}
                {jobStatus?.newCompanyName
                  ? `${jobStatus.newCompanyName} (ID: ${jobStatus.tasinanDenetlenenId})`
                  : `ID: ${jobStatus?.tasinanDenetlenenId}`}
              </Typography>
              {skippedNavConfirm && skippedNavConfirm.year > 0 && (
                <Typography variant="body2">
                  <strong>Hedef Yıl:</strong> {skippedNavConfirm.year}
                </Typography>
              )}
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                <strong>İlgili Ekran:</strong> {skippedNavConfirm ? getTableDisplayName(skippedNavConfirm.tableKey) : ""}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSkippedNavConfirm(null)} variant="outlined">
            İptal
          </Button>
          <Button
            onClick={handleSkippedNavConfirm}
            variant="contained"
            color="warning"
            startIcon={<KeyboardArrowRightIcon />}
          >
            Onayla ve Ekrana Git
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={controlDialogOpen} maxWidth="xl" fullWidth onClose={handleCloseControlDialog}>
        <DialogTitle>
          Kontrol
          {controlTableKey ? ` - ${getTableDisplayName(controlTableKey)}` : ""}
          {controlYear ? ` (${controlYear})` : ""}
        </DialogTitle>
        <DialogContent dividers>
          {controlTableKey && controlYear ? (
            <ImportControlComponent
              key={`${controlTableKey}-${controlYear}-${jobStatus?.tasinanDenetlenenId ?? 0}`}
              tableKey={controlTableKey}
            />
          ) : (
            <Alert severity="warning">Kontrol bilgisi eksik.</Alert>
          )}
        </DialogContent>
        <DialogActions>
          {getControlHref(controlTableKey, controlYear ?? undefined, Number(jobStatus?.tasinanDenetlenenId ?? 0)) && (
            <MuiLink
              href={getControlHref(controlTableKey, controlYear ?? undefined, Number(jobStatus?.tasinanDenetlenenId ?? 0))!}
              underline="hover"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ mr: "auto", ml: 1 }}
            >
              Yeni sekmede aç
            </MuiLink>
          )}
          <Button onClick={handleCloseControlDialog} variant="contained">
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}



