"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CalismaKagitiHotTable, {
  HOT_BASE_ROW_HEIGHT,
  riskRenderer,
  durumRenderer,
  bdsRefRenderer,
  tespitRenderer,
  islemRenderer,
} from "@/components/CalismaKagitiHotTable";
import {
  getPreferredAudioConstraint,
  openMicrophoneSetupDialog,
  setEditorPanelOpener,
} from "@/components/CalismaKagitiHotTable/SpeechTextEditor";
import { enhanceText } from "@/utils/gemini";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Drawer,
  IconButton,
  Paper,
  Snackbar,
  Alert as MuiAlert,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import KeyboardVoiceRoundedIcon from "@mui/icons-material/KeyboardVoiceRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { GlobalStyles } from "@mui/material";
import {
  BilgiIslemMuhasebeRow,
  getBilgiIslemMuhasebeByDenetlenen,
  kaydetBilgiIslemMuhasebe,
  varsayilanaDonBilgiIslemMuhasebe,
} from "@/api/CalismaKagitlari/BilgiIslemMuhasebe";
import FormOnayBolumu from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/FormOnayBolumu";
import IslemlerCardHtml from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCardHtml";

interface Props {
  isClickedVarsayilanaDon: boolean;
  setIsClickedVarsayilanaDon: (v: boolean) => void;
  setTamamlanan: (v: number) => void;
  setToplam: (v: number) => void;
  saveRequestVersion?: number;
  onStateChange?: (state: {
    isDirty: boolean;
    saving: boolean;
    loading: boolean;
    recordCount: number;
    hayirCount: number;
    kritikCount: number;
  }) => void;
}

interface RowData {
  riskSeviyesi: string;
  islem: string;
  durum: string;
  tespit: string;
  bdsReferansi: string;
  id: number;
  evetIcerik?: string | null;
  hayirIcerik?: string | null;
  standartmi?: boolean | null;
}

interface DrawerFormState {
  rowIndex: number;
  id: number;
  riskSeviyesi: string;
  islem: string;
  durum: string;
  tespit: string;
  bdsReferansi: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: (() => void) | null;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

const COL_RISK = 0;
const COL_ISLEM = 1;
const COL_DURUM = 2;
const COL_BDS_REF = 3;
const COL_TESPIT = 4;

const AI_PROMPTS = [
  {
    label: "Zenginleştir",
    instruction:
      "Aşağıdaki metni daha profesyonel ve resmi bir dille yeniden yazın. Teknik terimleri koruyun ancak ifadeyi daha net ve anlaşılır hale getirin ve yalnızca yeniden yazılmış metni döndürün. Ek açıklama eklemeyin.",
  },
  {
    label: "Özetle",
    instruction:
      "Aşağıdaki metni ana noktaları koruyarak daha özlü bir şekilde özetleyin ve yalnızca yeniden yazılmış metni döndürün. Ek açıklama eklemeyin.",
  },
  {
    label: "Detaylandır",
    instruction:
      "Aşağıdaki metni daha detaylı ve açıklayıcı bir şekilde genişletin, önemli noktaları vurgulayın ve yalnızca yeniden yazılmış metni döndürün. Ek açıklama eklemeyin.",
  },
] as const;

const getFieldByColumn = (col?: number): "islem" | "tespit" | "bdsReferansi" => {
  if (col === COL_ISLEM) return "islem";
  if (col === COL_BDS_REF) return "bdsReferansi";
  return "tespit";
};

const getFieldLabel = (field: "islem" | "tespit" | "bdsReferansi") => {
  if (field === "islem") return "Soru";
  if (field === "bdsReferansi") return "BDS Referansı";
  return "Açıklama / Değerlendirme Metni";
};

const drawerWaveStyles = {
  "@keyframes drawerWavePulse": {
    "0%, 100%": { transform: "scaleY(0.35)", opacity: 0.45 },
    "50%": { transform: "scaleY(1)", opacity: 1 },
  },
} as const;

const BilgiIslemMuhasebeTableHandson: React.FC<Props> = ({
  isClickedVarsayilanaDon,
  setIsClickedVarsayilanaDon,
  setTamamlanan,
  setToplam,
  saveRequestVersion = 0,
  onStateChange,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const router = useRouter();
  const hotRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [rows, setRows] = useState<BilgiIslemMuhasebeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isHotDirty, setIsHotDirty] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [targetUrl, setTargetUrl] = useState("");
  const [editorDrawerOpen, setEditorDrawerOpen] = useState(false);
  const [drawerForm, setDrawerForm] = useState<DrawerFormState | null>(null);
  const [drawerActiveField, setDrawerActiveField] = useState<"islem" | "tespit" | "bdsReferansi">("tespit");
  const [drawerAiLoading, setDrawerAiLoading] = useState(false);
  const [drawerAiResult, setDrawerAiResult] = useState("");
  const [drawerRecordingField, setDrawerRecordingField] = useState<"islem" | "tespit" | "bdsReferansi" | null>(null);

  const tableDataRef = useRef<RowData[]>([]);
  const changedRowIdsRef = useRef<Set<number>>(new Set());
  const requiresFullSaveRef = useRef(false);
  const drawerRecognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const drawerSpeechAnchorRef = useRef("");
  const drawerAnalyserRef = useRef<AnalyserNode | null>(null);
  const drawerVizAudioCtxRef = useRef<AudioContext | null>(null);
  const drawerVizStreamRef = useRef<MediaStream | null>(null);
  const [drawerAiPanelOpen, setDrawerAiPanelOpen] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("success");

  const fetchData = useCallback(async () => {
    if (!user.denetciId || !user.denetlenenId || !user.yil) return;
    setLoading(true);
    try {
      const resp = await getBilgiIslemMuhasebeByDenetlenen(
        user.denetciId,
        user.denetlenenId,
        user.yil
      );
      setRows(resp);
      setIsHotDirty(false);
      changedRowIdsRef.current.clear();
      requiresFullSaveRef.current = false;
    } catch {
      setSnackbarMessage("Veriler yüklenemedi");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }, [user.denetciId, user.denetlenenId, user.yil]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (isClickedVarsayilanaDon) {
      handleVarsayilanaDon();
    }
  }, [isClickedVarsayilanaDon]);

  const handleVarsayilanaDon = useCallback(async () => {
    if (!user.denetciId || !user.denetlenenId || !user.yil) {
      setIsClickedVarsayilanaDon(false);
      return;
    }

    setLoading(true);
    try {
      const deleteSuccess = await varsayilanaDonBilgiIslemMuhasebe(
        user.denetciId,
        user.denetlenenId,
        user.yil
      );

      if (deleteSuccess) {
        setSnackbarMessage("Veriler varsayılana döndürüldü");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        await fetchData();
      } else {
        setSnackbarMessage("Varsayılana dönüş başarısız oldu");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Varsayılana dönüş hatası:", error);
      setSnackbarMessage("Bir hata oluştu");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
      setIsClickedVarsayilanaDon(false);
    }
  }, [user.denetciId, user.denetlenenId, user.yil, fetchData, setIsClickedVarsayilanaDon]);

  const tableData = useMemo<RowData[]>(
    () =>
      rows.map((row) => ({
        riskSeviyesi: row.riskSeviyesi || "ORTA",
        islem: row.islem || "",
        durum: row.durum || "Evet",
        tespit: row.tespit ?? "",
        bdsReferansi: row.bdsReferansi || "—",
        id: row.id,
        evetIcerik: row.evetIcerik || "",
        hayirIcerik: row.hayirIcerik || "",
        standartmi: row.standartmi,
      })),
    [rows]
  );

  useEffect(() => {
    tableDataRef.current = tableData;
  }, [tableData]);

  const colHeaders = useMemo(
    () => ["Risk", "Soru", "Yanıt (E/H)", "BDS", "Açıklama / Değerlendirme Metni"],
    []
  );

  const columns = useMemo(
    () => [
      { type: "text" as const, readOnly: false, width: 90, renderer: riskRenderer, editor: "speech-text" },
      { type: "text" as const, readOnly: false, width: 360, renderer: islemRenderer, editor: "speech-text" },
      {
        type: "dropdown" as const,
        source: ["Evet", "Hayır"],
        width: 120,
        renderer: durumRenderer,
      },
      { type: "text" as const, readOnly: false, width: 110, renderer: bdsRefRenderer, editor: "speech-text" },
      {
        type: "text" as const,
        renderer: tespitRenderer,
        editor: "speech-text",
      },
    ],
    []
  );

  const editableColumnIndices = useMemo(
    () => [COL_RISK, COL_ISLEM, COL_DURUM, COL_TESPIT, COL_BDS_REF],
    []
  );

  const hotData = useMemo(
    () =>
      tableData.map((row) => [
        row.riskSeviyesi,
        row.islem,
        row.durum,
        row.bdsReferansi,
        row.tespit,
        row.id,
        row.evetIcerik,
        row.hayirIcerik,
      ]),
    [tableData]
  );

  const stats = useMemo(() => {
    const hayirCount = tableData.filter((r) => r.durum?.trim() === "Hayır").length;
    const kritikCount = tableData.filter(
      (r) => r.riskSeviyesi?.toUpperCase() === "KRİTİK"
    ).length;
    const yuksekCount = tableData.filter(
      (r) => r.riskSeviyesi?.toUpperCase() === "YÜKSEK"
    ).length;
    return { hayirCount, kritikCount, yuksekCount, toplam: tableData.length };
  }, [tableData]);

  useEffect(() => {
    onStateChange?.({
      isDirty: isHotDirty,
      saving,
      loading,
      recordCount: tableData.length,
      hayirCount: stats.hayirCount,
      kritikCount: stats.kritikCount,
    });
  }, [isHotDirty, loading, onStateChange, saving, stats.hayirCount, stats.kritikCount, tableData.length]);

  useEffect(() => {
    setTamamlanan(tableData.filter((r) => r.durum?.trim()).length);
    setToplam(tableData.length);
  }, [tableData, setTamamlanan, setToplam]);

  useEffect(() => {
    const applyWidth = () => {
      const hot = hotRef.current?.hotInstance;
      if (!hot) return;
      
      const containerWidth = containerRef.current?.offsetWidth || window.innerWidth - 100;
      if (!containerWidth) return;

      const fixedTotal = 90 + 120 + 110;
      const remaining = Math.max(400, containerWidth - fixedTotal);

      // Soru %44, Açıklama son sütun olduğu için stretchH="last" ile tüm boşluğu dolduracak.
      const soruWidth = Math.floor(remaining * 0.44);

      hot.updateSettings({
        colWidths: [90, soruWidth, 120, 110, undefined],
        stretchH: "last",
        width: containerWidth
      });
    };

    const timer = setTimeout(applyWidth, 100);
    window.addEventListener("resize", applyWidth);

    const container = containerRef.current;
    const observer = new ResizeObserver(() => applyWidth());
    if (container) observer.observe(container);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", applyWidth);
      observer.disconnect();
    };
  }, []);


  useEffect(() => {
    if (!isHotDirty) return;
    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor || !anchor.getAttribute("href")?.startsWith("/")) return;
      e.preventDefault();
      setTargetUrl(anchor.getAttribute("href")!);
      setConfirmDialogOpen(true);
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", handleAnchorClick, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, [isHotDirty]);

  const handleAfterCreateRow = useCallback(
    function (this: any, index: number, amount: number) {
      const hot = this;
      for (let i = index; i < index + amount; i++) {
        hot.setDataAtCell(i, COL_RISK, "ORTA");
        hot.setDataAtCell(i, COL_DURUM, "Evet");
        hot.setDataAtCell(i, COL_BDS_REF, "—");
      }
      requiresFullSaveRef.current = true;
      setIsHotDirty(true);
    },
    []
  );

  const handleAfterRemoveRow = useCallback(() => {
    requiresFullSaveRef.current = true;
    setIsHotDirty(true);
  }, []);

  const openDrawerForRow = useCallback((rowIndex: number, activeField: "islem" | "tespit" | "bdsReferansi" = "tespit") => {
    const hot = hotRef.current?.hotInstance;
    if (!hot || rowIndex < 0) return;

    const activeEditor = hot.getActiveEditor?.();
    if (activeEditor?.isOpened?.()) {
      activeEditor.finishEditing?.(false);
    }

    const rowData = hot.getSourceDataAtRow(rowIndex) as any[] | undefined;
    if (!rowData) return;

    setDrawerForm({
      rowIndex,
      id: Number(rowData[5] || 0),
      riskSeviyesi: String(rowData[COL_RISK] ?? "ORTA"),
      islem: String(rowData[COL_ISLEM] ?? ""),
      durum: String(rowData[COL_DURUM] ?? "Evet"),
      tespit: String(rowData[COL_TESPIT] ?? ""),
      bdsReferansi: String(rowData[COL_BDS_REF] ?? "—"),
    });
    setDrawerActiveField(activeField);
    setDrawerAiResult("");
    setEditorDrawerOpen(true);
  }, []);

  useEffect(() => {
    setEditorPanelOpener(({ row, col }) => {
      openDrawerForRow(row, getFieldByColumn(col));
    });

    return () => {
      setEditorPanelOpener(null);
    };
  }, [openDrawerForRow]);

  const handleAfterChange = useCallback(
    function (this: any, change: any[] | null, source: string) {
      if (!change || !change.length || source === "loadData") return;
      const hot = this;

      change.forEach(([row, prop, oldValue, newValue]: [number, any, any, any]) => {
        if (newValue === "EDITOR_DRAWER_OPEN") {
          const colIndex = hot.propToCol(prop);
          const currentValue = hot.getDataAtCell(row, colIndex);
          openDrawerForRow(row, getFieldByColumn(colIndex));
          setTimeout(() => hot.setDataAtCell(row, colIndex, currentValue, "internal"), 0);
          return;
        }

        setIsHotDirty(true);
        const rowId = tableDataRef.current[row]?.id;
        if (rowId) {
          changedRowIdsRef.current.add(rowId);
        }

        if ((prop === "durum" || prop === COL_DURUM) && newValue?.trim()) {
          const currentRow = tableDataRef.current[row];
          const currentTespit = hot.getDataAtCell(row, COL_TESPIT) ?? "";

          const oldTemplateContent =
            oldValue === "Hayır"
              ? currentRow?.hayirIcerik || ""
              : currentRow?.evetIcerik || "";

          const newTemplateContent =
            newValue === "Hayır"
              ? currentRow?.hayirIcerik || ""
              : currentRow?.evetIcerik || "";

          if (currentTespit === "" || currentTespit === oldTemplateContent) {
            setTimeout(() => hot.setDataAtCell(row, COL_TESPIT, newTemplateContent), 0);
          }
        }
      });
    },
    [openDrawerForRow]
  );

  const handleDrawerFieldChange = useCallback(
    (field: keyof Omit<DrawerFormState, "rowIndex" | "id">, value: string) => {
      setDrawerForm((prev) => (prev ? { ...prev, [field]: value } : prev));
    },
    []
  );

  const stopDrawerRecording = useCallback(() => {
    if (drawerRecognitionRef.current) {
      try {
        drawerRecognitionRef.current.onend = null;
        drawerRecognitionRef.current.onerror = null;
        drawerRecognitionRef.current.abort();
      } catch {
        // noop
      }
      drawerRecognitionRef.current = null;
    }
    setDrawerRecordingField(null);
    drawerSpeechAnchorRef.current = "";
    
    // Cleanup analyser (same as SpeechTextEditor)
    try { drawerVizAudioCtxRef.current?.close(); } catch { /* noop */ }
    drawerVizStreamRef.current?.getTracks().forEach((t) => t.stop());
    drawerAnalyserRef.current = null;
    drawerVizAudioCtxRef.current = null;
    drawerVizStreamRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      stopDrawerRecording();
    };
  }, [stopDrawerRecording]);

  const startDrawerRecording = useCallback(
    async (field: "islem" | "tespit" | "bdsReferansi") => {
      const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
      if (!SR) {
        setSnackbarMessage("Tarayıcınız ses tanımayı desteklemiyor.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      if (!drawerForm) return;

      if (drawerRecordingField === field) {
        stopDrawerRecording();
        return;
      }

      stopDrawerRecording();

      try {
        const permissionStream = await navigator.mediaDevices.getUserMedia({ audio: getPreferredAudioConstraint() });
        
        // Setup analyser for visualization (like SpeechTextEditor)
        try {
          drawerVizAudioCtxRef.current = new AudioContext();
          drawerAnalyserRef.current = drawerVizAudioCtxRef.current.createAnalyser();
          drawerAnalyserRef.current.fftSize = 256;
          drawerVizAudioCtxRef.current.createMediaStreamSource(permissionStream).connect(drawerAnalyserRef.current);
          drawerVizStreamRef.current = permissionStream;
        } catch {
          // Analyser setup failed, but continue without visualization
          drawerAnalyserRef.current = null;
        }
      } catch (err: any) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setSnackbarMessage("Mikrofon izni reddedildi. Adres çubuğundan izin verin.");
        } else if (err.name === "NotFoundError") {
          setSnackbarMessage("Mikrofon bulunamadı.");
        } else {
          setSnackbarMessage(`Mikrofon hatası: ${err.message}`);
        }
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        void openMicrophoneSetupDialog("Mikrofon erişimi veya tercih edilen cihaz açılamadı.");
        return;
      }

      const rec: SpeechRecognitionInstance = new SR();
      let hasReceivedResult = false;
      let hasStarted = false;
      let retryCount = 0;
      let restartOnEnd = false;
      const MAX_NO_SPEECH_RETRIES = 2;
      const event = { error: "" };
      const startTimeout = window.setTimeout(() => {
        if (!hasStarted) {
          setSnackbarMessage("Ses motoru başlatılamadı. Tarayıcıyı ve mikrofon iznini kontrol edin.");
          setSnackbarSeverity("warning");
          setSnackbarOpen(true);
          void openMicrophoneSetupDialog(`Ses algılama hatası: ${event.error}`);
          void openMicrophoneSetupDialog("Ses motoru seçili veya varsayılan mikrofonla başlatılamadı.");
          stopDrawerRecording();
        }
      }, 4000);
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "tr-TR";
      rec.maxAlternatives = 1;

      drawerSpeechAnchorRef.current = drawerForm[field] ?? "";
      rec.onstart = () => {
        hasStarted = true;
        window.clearTimeout(startTimeout);
        setDrawerRecordingField(field);
      };

      rec.onresult = (event: SpeechRecognitionEvent) => {
        hasReceivedResult = true;
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          const sep = drawerSpeechAnchorRef.current && !drawerSpeechAnchorRef.current.endsWith(" ") ? " " : "";
          drawerSpeechAnchorRef.current = drawerSpeechAnchorRef.current + sep + final;
          handleDrawerFieldChange(field, drawerSpeechAnchorRef.current);
        } else if (interim) {
          const sep = drawerSpeechAnchorRef.current && !drawerSpeechAnchorRef.current.endsWith(" ") ? " " : "";
          handleDrawerFieldChange(field, drawerSpeechAnchorRef.current + sep + interim);
        }
      };

      rec.onerror = (event: SpeechRecognitionErrorEvent) => {
        window.clearTimeout(startTimeout);
        if (event.error === "aborted") {
          stopDrawerRecording();
          return;
        }
        if (event.error === "no-speech" && retryCount < MAX_NO_SPEECH_RETRIES) {
          restartOnEnd = true;
          return;
        }
        if (event.error !== "aborted" && event.error !== "no-speech") {
          setSnackbarMessage(`Ses algılama hatası: ${event.error}`);
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        }
        stopDrawerRecording();
      };

      rec.onend = () => {
        window.clearTimeout(startTimeout);
        if (restartOnEnd && retryCount < MAX_NO_SPEECH_RETRIES) {
          restartOnEnd = false;
          retryCount += 1;
          hasStarted = false;
          try {
            rec.start();
            return;
          } catch {
            // fall through
          }
        }
        if (hasStarted && !hasReceivedResult) {
          setSnackbarMessage("Ses algılanamadı. Mikrofon iznini ve cihazı kontrol edin.");
          setSnackbarSeverity("warning");
          setSnackbarOpen(true);
          void openMicrophoneSetupDialog("Ses algılanamadı. Birden fazla mikrofon varsa çalışan cihazı seçip test edin.");
        }
        stopDrawerRecording();
      };

      drawerRecognitionRef.current = rec;

      try {
        rec.start();
      } catch {
        setSnackbarMessage("Ses kaydı başlatılamadı.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        stopDrawerRecording();
      }
    },
    [drawerForm, drawerRecordingField, handleDrawerFieldChange, stopDrawerRecording]
  );

  const runDrawerAiPrompt = useCallback(
    async (instruction: string) => {
      if (!drawerForm) return;
      const text = drawerForm[drawerActiveField]?.trim();
      if (!text) {
        setSnackbarMessage("Önce metin girin.");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        return;
      }

      setDrawerAiLoading(true);
      setDrawerAiResult("FasAI çalışıyor...");

      try {
        const result = await enhanceText(user, text, instruction);
        setDrawerAiResult(result);
      } catch {
        setDrawerAiResult("Hata oluştu, tekrar deneyin.");
      } finally {
        setDrawerAiLoading(false);
      }
    },
    [drawerActiveField, drawerForm, user]
  );

  const applyDrawerAiResult = useCallback(() => {
    if (
      !drawerAiResult ||
      drawerAiResult === "FasAI çalışıyor..." ||
      drawerAiResult === "Hata oluştu, tekrar deneyin."
    ) {
      return;
    }

    handleDrawerFieldChange(drawerActiveField, drawerAiResult);
    setDrawerAiResult("");
  }, [drawerActiveField, drawerAiResult, handleDrawerFieldChange]);

  const handleDrawerApply = useCallback(() => {
    if (!drawerForm) return;
    const hot = hotRef.current?.hotInstance;
    if (!hot) return;

    hot.setDataAtCell(drawerForm.rowIndex, COL_RISK, drawerForm.riskSeviyesi);
    hot.setDataAtCell(drawerForm.rowIndex, COL_ISLEM, drawerForm.islem);
    hot.setDataAtCell(drawerForm.rowIndex, COL_DURUM, drawerForm.durum);
    hot.setDataAtCell(drawerForm.rowIndex, COL_TESPIT, drawerForm.tespit);
    hot.setDataAtCell(drawerForm.rowIndex, COL_BDS_REF, drawerForm.bdsReferansi);

    if (drawerForm.id) {
      changedRowIdsRef.current.add(drawerForm.id);
    }

    setIsHotDirty(true);
    stopDrawerRecording();
    setEditorDrawerOpen(false);
    setDrawerForm(null);
    setDrawerAiResult("");
    setSnackbarMessage("Satır güncellendi. Kalıcı olması için kaydedin.");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  }, [drawerForm, stopDrawerRecording]);

  const handleKaydet = useCallback(async () => {
    if (!user.denetciId || !user.denetlenenId || !user.yil) return;
    const hot = hotRef.current?.hotInstance;
    if (!hot) return;
    setSaving(true);
    try {
      const sourceData = hot.getSourceData() as any[][];

      const satirlar = sourceData
        .map((rowArr) => ({
          id: Number(rowArr[5] || 0),
          satirNo: null,
          riskSeviyesi: (rowArr[COL_RISK] ?? "").toString(),
          islem: (rowArr[COL_ISLEM] ?? "").toString(),
          durum: (rowArr[COL_DURUM] ?? "Evet").toString(),
          tespit: (rowArr[COL_TESPIT] ?? "").toString(),
          bdsReferansi: (rowArr[COL_BDS_REF] ?? "").toString(),
        }))
        .filter((item) =>
          requiresFullSaveRef.current ? true : item.id === 0 || changedRowIdsRef.current.has(item.id)
        );

      if (satirlar.length === 0) {
        setSnackbarMessage("Değişiklik yapılmadı");
        setSnackbarSeverity("info");
        setSnackbarOpen(true);
        setSaving(false);
        return;
      }

      const success = await kaydetBilgiIslemMuhasebe({
        denetciId: user.denetciId,
        denetlenenId: user.denetlenenId,
        yil: user.yil,
        satirlar: satirlar as any,
      });
      if (success) {
        setIsHotDirty(false);
        changedRowIdsRef.current.clear();
        requiresFullSaveRef.current = false;
        setSnackbarMessage("Veriler başarıyla kaydedildi");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        await fetchData();
      } else {
        setSnackbarMessage("Veriler kaydedilemedi. Lütfen tekrar deneyin.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      setSnackbarMessage("Bir hata oluştu. Lütfen tekrar deneyin.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setSaving(false);
    }
  }, [fetchData, user.denetciId, user.denetlenenId, user.yil]);

  useEffect(() => {
    if (saveRequestVersion > 0) {
      void handleKaydet();
    }
  }, [handleKaydet, saveRequestVersion]);

  const escapeHtml = (s: string) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const buildHtmlAsync = async (): Promise<string> => {
    const tableRows = tableData
      .map(
        (row) => `
      <tr>
        <td class="center risk-${(row.riskSeviyesi || "").toLowerCase().replace(/[^a-z]/g, "")}" style="width:10%">${escapeHtml(row.riskSeviyesi)}</td>
        <td style="width:32%">${escapeHtml(row.islem)}</td>
        <td class="center durum-${row.durum === "Hayır" ? "hayir" : "evet"}" style="width:9%">${escapeHtml(row.durum)}</td>
        <td class="center" style="width:12%">${escapeHtml(row.bdsReferansi)}</td>
        <td style="width:37%">${escapeHtml(row.tespit)}</td>
      </tr>`
      )
      .join("");
    return `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"/><title>PDF</title><style>table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:8px;}</style></head><body><table>${tableRows}</table></body></html>`;
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", bgcolor: "#ffffff" }}>
      <GlobalStyles
        styles={{
          ...drawerWaveStyles,
          ".ht-cell-clamp": {
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
            overflow: "hidden",
            fontSize: "0.82rem",
            lineHeight: "1.35",
            padding: "8px !important",
            whiteSpace: "pre-wrap",
          },
          ".handsontable .htCore": {
            width: "100% !important",
          },
          ".calisma-kagiti-hot-table-shell": {
            overflow: "hidden !important",
          },
          ".handsontable td": {
            verticalAlign: "top !important",
          },
        }}
      />
      <Box sx={{ px: { xs: 0.25, md: 0.5 } }}>
        <Box
          className="calisma-kagidi-hot-table-shell"
          sx={{ width: "100%", overflow: "hidden", borderRadius: 1, border: "1px solid", borderColor: "divider" }}
        >
          <Box ref={containerRef} className="calisma-kagidi-hot-table" sx={{ position: "relative", minWidth: 0 }}>
            <CalismaKagitiHotTable
              ref={hotRef}
              className="ht-theme-horizon calisma-kagidi-hot-table-grid"
              data={hotData}
              colHeaders={colHeaders}
              columns={columns}
              rowHeaders={true}
              height="calc(100vh - 260px)"
              width="100%"
              rowHeight={HOT_BASE_ROW_HEIGHT}
              stretchH="last"
              dropdownMenu={true}
              manualColumnResize={true}
              manualRowResize={false}
              editableColumnIndices={editableColumnIndices}
              afterChange={handleAfterChange}
              afterCreateRow={handleAfterCreateRow}
              afterRemoveRow={handleAfterRemoveRow}
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <FormOnayBolumu
          controller="BilgiIslemMuhasebe"
          showKaliteKontrol={true}
          onHazirlayanChange={fetchData}
          onOnaylayanChange={fetchData}
        />
      </Box>
      <Box sx={{ mt: 4 }}>
        <IslemlerCardHtml
          controller="BilgiIslemMuhasebe"
          buildHtmlAsync={buildHtmlAsync}
          previewEndpoint="/ArsivIslemleri/WordDosyasiniPdfOlarakOnizleHtml"
        />
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MuiAlert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>

      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Değişiklikler Kaybolacak</DialogTitle>
        <DialogContent>
          <DialogContentText>Sayfadan ayrılmak istiyor musunuz?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>İptal</Button>
          <Button
            onClick={() => {
              setConfirmDialogOpen(false);
              router.push(targetUrl);
            }}
            color="error"
          >
            Ayrıl
          </Button>
        </DialogActions>
      </Dialog>

      <Drawer
        anchor="right"
        open={editorDrawerOpen}
        onClose={() => {
          setEditorDrawerOpen(false);
          setDrawerForm(null);
        }}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 520, lg: 620 },
            p: 0,
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Box
            sx={{
              px: 2.5,
              py: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: "background.paper",
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Satır Düzenleme Paneli
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Değişiklikleri tabloya uygula, ardından üstteki kaydet butonuyla kalıcı hale getir.
              </Typography>
            </Box>
            <IconButton
              onClick={() => {
                stopDrawerRecording();
                setEditorDrawerOpen(false);
                setDrawerForm(null);
                setDrawerAiResult("");
              }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          {/* Alan Sekmeleri */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2.5 }}>
            <Tabs
              value={drawerActiveField}
              onChange={(_, v) => {
                setDrawerActiveField(v);
                setDrawerAiResult("");
              }}
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab value="islem" label="Soru" sx={{ fontSize: "0.75rem" }} />
              <Tab value="tespit" label="Açıklama" sx={{ fontSize: "0.75rem" }} />
              <Tab value="bdsReferansi" label="BDS Ref." sx={{ fontSize: "0.75rem" }} />
            </Tabs>
          </Box>

          <Box sx={{ p: 2.5, overflowY: "auto", flex: 1 }}>
            <Stack spacing={1.5}>
              {/* Metin Alanı */}
              <TextField
                label={getFieldLabel(drawerActiveField)}
                value={drawerForm?.[drawerActiveField] ?? ""}
                onChange={(e) => handleDrawerFieldChange(drawerActiveField, e.target.value)}
                fullWidth
                multiline
                minRows={drawerActiveField === "bdsReferansi" ? 4 : drawerActiveField === "islem" ? 6 : 8}
                variant="outlined"
              />

              {/* SpeechTextEditor Stili Araç Çubuğu */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 1,
                  py: 0.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  bgcolor: "grey.50",
                }}
              >
                {/* Sol: Kayıt durumu */}
                <Typography
                  variant="caption"
                  color="primary.main"
                  fontWeight={600}
                  sx={{
                    fontSize: "0.65rem",
                    visibility: drawerRecordingField === drawerActiveField ? "visible" : "hidden",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: 0.8,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: "primary.50",
                  }}
                >
                  ● Dinliyor
                </Typography>

                {/* Sağ: İkon Butonları */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  {/* FasAI Butonu */}
                  <Tooltip title="FasAI ile Geliştir">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setDrawerAiPanelOpen((v) => !v);
                        setDrawerAiResult("");
                      }}
                      sx={{
                        width: 26,
                        height: 26,
                        border: "1px solid",
                        borderColor: drawerAiPanelOpen ? "primary.main" : "divider",
                        bgcolor: drawerAiPanelOpen ? "primary.50" : "background.paper",
                        color: drawerAiPanelOpen ? "primary.main" : "text.secondary",
                        borderRadius: "50%",
                      }}
                    >
                      <AutoAwesomeRoundedIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>

                  {/* Mikrofon Butonu */}
                  <Tooltip title={drawerRecordingField === drawerActiveField ? "Kaydı Durdur" : "Sesle Yaz"}>
                    <IconButton
                      size="small"
                      onClick={() => startDrawerRecording(drawerActiveField)}
                      sx={{
                        width: 26,
                        height: 26,
                        border: "1px solid",
                        borderColor: drawerRecordingField === drawerActiveField ? "error.main" : "divider",
                        bgcolor: drawerRecordingField === drawerActiveField ? "error.50" : "background.paper",
                        color: drawerRecordingField === drawerActiveField ? "error.main" : "text.secondary",
                        borderRadius: "50%",
                      }}
                    >
                      {drawerRecordingField === drawerActiveField ? (
                        <StopCircleRoundedIcon sx={{ fontSize: 14 }} />
                      ) : (
                        <KeyboardVoiceRoundedIcon sx={{ fontSize: 14 }} />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* AI Paneli (FasAI butonuna tıklanınca açılır) */}
              {drawerAiPanelOpen && (
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "primary.50",
                    border: "1px solid",
                    borderColor: "primary.light",
                    borderRadius: 1,
                  }}
                >
                  {/* Prompt Chip'leri */}
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1 }}>
                    {AI_PROMPTS.map((p) => (
                      <Chip
                        key={p.label}
                        label={p.label}
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => runDrawerAiPrompt(p.instruction)}
                        disabled={drawerAiLoading || !(drawerForm?.[drawerActiveField]?.trim())}
                        sx={{ cursor: "pointer", fontSize: "0.7rem" }}
                      />
                    ))}
                  </Box>

                  {/* Yükleniyor */}
                  {drawerAiLoading && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <CircularProgress size={12} />
                      <Typography variant="body2" color="text.secondary">İşleniyor...</Typography>
                    </Box>
                  )}

                  {/* Sonuç */}
                  {!drawerAiLoading && drawerAiResult && (
                    <>
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word", mb: 1, color: "text.primary" }}
                      >
                        {drawerAiResult}
                      </Typography>
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="text"
                          color="inherit"
                          onClick={() => setDrawerAiResult("")}
                          sx={{ fontSize: "0.7rem" }}
                        >
                          Vazgeç
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() => {
                            applyDrawerAiResult();
                            setDrawerAiPanelOpen(false);
                          }}
                          sx={{ fontSize: "0.7rem" }}
                        >
                          Kullan
                        </Button>
                      </Stack>
                    </>
                  )}

                  {/* Bekleme mesajı */}
                  {!drawerAiLoading && !drawerAiResult && (
                    <Typography variant="caption" color="text.secondary">
                      Bir seçenek seçin...
                    </Typography>
                  )}
                </Box>
              )}
            </Stack>
          </Box>

          <Box
            sx={{
              px: 2.5,
              py: 2,
              borderTop: "1px solid",
              borderColor: "divider",
              display: "flex",
              gap: 1,
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="text"
              onClick={() => {
                stopDrawerRecording();
                setEditorDrawerOpen(false);
                setDrawerForm(null);
                setDrawerAiResult("");
              }}
            >
              Kapat
            </Button>
            <Button variant="contained" onClick={handleDrawerApply} disabled={!drawerForm}>
              Tabloya Uygula
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default BilgiIslemMuhasebeTableHandson;
