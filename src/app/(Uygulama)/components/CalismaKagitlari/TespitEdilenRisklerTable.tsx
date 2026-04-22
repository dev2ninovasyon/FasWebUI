"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CalismaKagitiHotTable, {
  HOT_BASE_ROW_HEIGHT,
  islemRenderer,
  tespitRenderer,
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
  TespitEdilenRisklerRow,
  getTespitEdilenRisklerByDenetlenen,
  kaydetTespitEdilenRiskler,
  varsayilanaDonTespitEdilenRiskler,
} from "@/api/CalismaKagitlari/TespitEdilenRiskler";
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
  }) => void;
}

interface RowData {
  id: number;
  islem: string;
  tespit: string;
  gerceklik: boolean;
  tamOlma: boolean;
  varOlma: boolean;
  dogrulukDonemsellik: boolean;
  degerleme: boolean;
  siniflama: boolean;
  uygulananDenetimTeknikleri: string;
  ilgiliBdsStandart: string;
  standartmi?: boolean | null;
  satirNo?: number | null;
}

interface DrawerFormState {
  rowIndex: number;
  id: number;
  islem: string;
  tespit: string;
  uygulananDenetimTeknikleri: string;
  ilgiliBdsStandart: string;
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

const COL_ISLEM = 0;
const COL_TESPIT = 1;
const COL_G = 2;
const COL_T = 3;
const COL_V = 4;
const COL_D = 5;
const COL_DE = 6;
const COL_S = 7;
const COL_TEKNIK = 8;
const COL_BDS = 9;

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

type DrawerField = "islem" | "tespit" | "uygulananDenetimTeknikleri" | "ilgiliBdsStandart";

const getFieldByColumn = (col?: number): DrawerField => {
  if (col === COL_ISLEM) return "islem";
  if (col === COL_TESPIT) return "tespit";
  if (col === COL_TEKNIK) return "uygulananDenetimTeknikleri";
  return "ilgiliBdsStandart";
};

const getFieldLabel = (field: DrawerField) => {
  if (field === "islem") return "Tespit Edilen Risk";
  if (field === "tespit") return "Etkilenen Hesap Grubu (Tespit)";
  if (field === "uygulananDenetimTeknikleri") return "Uygulanan Denetim Teknikleri";
  return "İlgili BDS / Standart Rehberi";
};

const drawerWaveStyles = {
  "@keyframes drawerWavePulse": {
    "0%, 100%": { transform: "scaleY(0.35)", opacity: 0.45 },
    "50%": { transform: "scaleY(1)", opacity: 1 },
  },
} as const;

const TespitEdilenRisklerTable: React.FC<Props> = ({
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

  const [rows, setRows] = useState<TespitEdilenRisklerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isHotDirty, setIsHotDirty] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [targetUrl, setTargetUrl] = useState("");
  const [editorDrawerOpen, setEditorDrawerOpen] = useState(false);
  const [drawerForm, setDrawerForm] = useState<DrawerFormState | null>(null);
  const [drawerActiveField, setDrawerActiveField] = useState<DrawerField>("islem");
  const [drawerAiLoading, setDrawerAiLoading] = useState(false);
  const [drawerAiResult, setDrawerAiResult] = useState("");
  const [drawerRecordingField, setDrawerRecordingField] = useState<DrawerField | null>(null);

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
      const resp = await getTespitEdilenRisklerByDenetlenen(
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
      const deleteSuccess = await varsayilanaDonTespitEdilenRiskler(
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
        id: row.id,
        islem: row.islem || "",
        tespit: row.tespit || "",
        gerceklik: row.gerceklik ?? true,
        tamOlma: row.tamOlma ?? true,
        varOlma: row.varOlma ?? true,
        dogrulukDonemsellik: row.dogrulukDonemsellik ?? true,
        degerleme: row.degerleme ?? true,
        siniflama: row.siniflama ?? true,
        uygulananDenetimTeknikleri: row.uygulananDenetimTeknikleri || "",
        ilgiliBdsStandart: row.ilgiliBdsStandart || "",
        standartmi: row.standartmi,
        satirNo: row.satirNo,
      })),
    [rows]
  );

  useEffect(() => {
    tableDataRef.current = tableData;
  }, [tableData]);

  const colHeaders = useMemo(
    () => [
      "Tespit Edilen Risk",
      "Etkilenen Hesap Grubu (Tespit)",
      `<div title="Gerçeklik" style="color: #EF5350; font-weight: bold; text-align: center;">G</div>`,
      `<div title="Tamlık" style="color: #2196F3; font-weight: bold; text-align: center;">T</div>`,
      `<div title="Var Olma" style="color: #4CAF50; font-weight: bold; text-align: center;">V</div>`,
      `<div title="Doğruluk/Dönemsellik" style="color: #7E57C2; font-weight: bold; text-align: center;">D</div>`,
      `<div title="Değerleme" style="color: #FF9800; font-weight: bold; text-align: center;">De</div>`,
      `<div title="Sınıflama/Sunum" style="color: #00BCD4; font-weight: bold; text-align: center;">S</div>`,
      "Uygulanan Denetim Teknikleri",
      "İlgili BDS",
    ],
    []
  );

  const columns = useMemo(
    () => [
      { type: "text" as const, readOnly: false, width: 220, renderer: islemRenderer, editor: "speech-text" },
      { type: "text" as const, readOnly: false, width: 160, renderer: tespitRenderer, editor: "speech-text" },
      { type: "checkbox" as const, className: "htCenter htMiddle" },
      { type: "checkbox" as const, className: "htCenter htMiddle" },
      { type: "checkbox" as const, className: "htCenter htMiddle" },
      { type: "checkbox" as const, className: "htCenter htMiddle" },
      { type: "checkbox" as const, className: "htCenter htMiddle" },
      { type: "checkbox" as const, className: "htCenter htMiddle" },
      { type: "text" as const, readOnly: false, width: 200, editor: "speech-text" },
      { type: "text" as const, readOnly: false, editor: "speech-text" },
    ],
    []
  );

  const hotData = useMemo(
    () =>
      tableData.map((row) => [
        row.islem,
        row.tespit,
        row.gerceklik,
        row.tamOlma,
        row.varOlma,
        row.dogrulukDonemsellik,
        row.degerleme,
        row.siniflama,
        row.uygulananDenetimTeknikleri,
        row.ilgiliBdsStandart,
        row.id,
        row.satirNo,
      ]),
    [tableData]
  );

  useEffect(() => {
    onStateChange?.({
      isDirty: isHotDirty,
      saving,
      loading,
      recordCount: tableData.length,
    });
  }, [isHotDirty, loading, onStateChange, saving, tableData.length]);

  useEffect(() => {
    setTamamlanan(tableData.length);
    setToplam(tableData.length);
  }, [tableData, setTamamlanan, setToplam]);

  useEffect(() => {
    const applyWidth = () => {
      const hot = hotRef.current?.hotInstance;
      if (!hot) return;
      
      const containerWidth = containerRef.current?.offsetWidth || window.innerWidth - 100;
      if (!containerWidth) return;

      const fixedTotal = 220 + 160 + (6 * 35) + 200; // checkboxes will be ~35px wide 
      const remaining = Math.max(200, containerWidth - fixedTotal);

      hot.updateSettings({
        colWidths: [220, 160, 35, 35, 35, 35, 35, 35, 200, undefined],
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
        hot.setDataAtCell(i, COL_G, true);
        hot.setDataAtCell(i, COL_T, true);
        hot.setDataAtCell(i, COL_V, true);
        hot.setDataAtCell(i, COL_D, true);
        hot.setDataAtCell(i, COL_DE, true);
        hot.setDataAtCell(i, COL_S, true);
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

  const openDrawerForRow = useCallback((rowIndex: number, activeField: DrawerField = "islem") => {
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
      id: Number(rowData[10] || 0),
      islem: String(rowData[COL_ISLEM] ?? ""),
      tespit: String(rowData[COL_TESPIT] ?? ""),
      uygulananDenetimTeknikleri: String(rowData[COL_TEKNIK] ?? ""),
      ilgiliBdsStandart: String(rowData[COL_BDS] ?? ""),
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
    async (field: DrawerField) => {
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
        
        try {
          drawerVizAudioCtxRef.current = new AudioContext();
          drawerAnalyserRef.current = drawerVizAudioCtxRef.current.createAnalyser();
          drawerAnalyserRef.current.fftSize = 256;
          drawerVizAudioCtxRef.current.createMediaStreamSource(permissionStream).connect(drawerAnalyserRef.current);
          drawerVizStreamRef.current = permissionStream;
        } catch {
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

    hot.setDataAtCell(drawerForm.rowIndex, COL_ISLEM, drawerForm.islem);
    hot.setDataAtCell(drawerForm.rowIndex, COL_TESPIT, drawerForm.tespit);
    hot.setDataAtCell(drawerForm.rowIndex, COL_TEKNIK, drawerForm.uygulananDenetimTeknikleri);
    hot.setDataAtCell(drawerForm.rowIndex, COL_BDS, drawerForm.ilgiliBdsStandart);

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
          id: Number(rowArr[10] || 0),
          islem: (rowArr[COL_ISLEM] ?? "").toString(),
          tespit: (rowArr[COL_TESPIT] ?? "").toString(),
          gerceklik: Boolean(rowArr[COL_G] ?? true),
          tamOlma: Boolean(rowArr[COL_T] ?? true),
          varOlma: Boolean(rowArr[COL_V] ?? true),
          dogrulukDonemsellik: Boolean(rowArr[COL_D] ?? true),
          degerleme: Boolean(rowArr[COL_DE] ?? true),
          siniflama: Boolean(rowArr[COL_S] ?? true),
          uygulananDenetimTeknikleri: (rowArr[COL_TEKNIK] ?? "").toString(),
          ilgiliBdsStandart: (rowArr[COL_BDS] ?? "").toString(),
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

      const success = await kaydetTespitEdilenRiskler({
        denetciId: user.denetciId,
        denetlenenId: user.denetlenenId,
        yil: user.yil,
        satirlar,
      });

      if (success) {
        setSnackbarMessage("Başarıyla kaydedildi");
        setSnackbarSeverity("success");
        setIsHotDirty(false);
        changedRowIdsRef.current.clear();
        requiresFullSaveRef.current = false;
        await fetchData();
      } else {
        setSnackbarMessage("Kaydetme işlemi başarısız oldu");
        setSnackbarSeverity("error");
      }
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      setSnackbarMessage("Bir hata oluştu");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
      setSaving(false);
    }
  }, [user.denetciId, user.denetlenenId, user.yil, fetchData]);

  useEffect(() => {
    if (saveRequestVersion > 0) {
      handleKaydet();
    }
  }, [saveRequestVersion, handleKaydet]);

  const buildHtmlAsync = async () => {
    const hot = hotRef.current?.hotInstance;
    if (!hot) return "";

    const sourceData = hot.getSourceData() as any[][];
    const createdAt = new Date().toLocaleString("tr-TR");

    const tableRows = sourceData.map((rowArr, index) => {
      const islem = String(rowArr[COL_ISLEM] || "");
      const tespit = String(rowArr[COL_TESPIT] || "");
      const g = rowArr[COL_G] ? "X" : "";
      const t = rowArr[COL_T] ? "X" : "";
      const v = rowArr[COL_V] ? "X" : "";
      const d = rowArr[COL_D] ? "X" : "";
      const de = rowArr[COL_DE] ? "X" : "";
      const s = rowArr[COL_S] ? "X" : "";
      const teknik = String(rowArr[COL_TEKNIK] || "");
      const bds = String(rowArr[COL_BDS] || "");
      
      const satirNo = rowArr[11] || index + 1;

      return `<tr>
        <td class="htCenter" style="width:40px;">${satirNo}</td>
        <td>${islem.replace(/\n/g, "<br>")}</td>
        <td>${tespit.replace(/\n/g, "<br>")}</td>
        <td class="htCenter">${g}</td>
        <td class="htCenter">${t}</td>
        <td class="htCenter">${v}</td>
        <td class="htCenter">${d}</td>
        <td class="htCenter">${de}</td>
        <td class="htCenter">${s}</td>
        <td>${teknik.replace(/\n/g, "<br>")}</td>
        <td>${bds.replace(/\n/g, "<br>")}</td>
      </tr>`;
    }).join("");

    return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title>Tespit Edilen Riskler Belgesi</title>
  <style>
    @page { size: A4 landscape; margin: 2cm 1.5cm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: Arial, sans-serif; font-size: 10px; color: #1a202c; }
    .doc-header { border-bottom: 2px solid #2b6cb0; padding-bottom: 12px; margin-bottom: 16px; }
    .doc-title { font-size: 14px; font-weight: 700; color: #2b6cb0; text-transform: uppercase; }
    .doc-meta { font-size: 10px; color: #555; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; table-layout: fixed; }
    th { background: #f1f5f9; font-weight: 700; border: 1px solid #cbd5e0; padding: 5px 6px; text-align: left; }
    td { border: 1px solid #e2e8f0; padding: 4px 6px; vertical-align: top; word-break: break-word; }
    tr:nth-child(even) td { background: #f8fafc; }
    .htCenter { text-align: center; }
    .doc-footer { margin-top: 24px; font-size: 9px; color: #999; border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="doc-header">
    <div class="doc-title">BEYAN VE SORUŞTURMA SONUCU TESPİT EDİLEN RİSKLER BELGESİ</div>
    <div class="doc-meta">Denetlenen: ${user.denetlenenFirmaAdi || "Bilinmiyor"} &nbsp;|&nbsp; Yıl: ${user.yil || "Bilinmiyor"}</div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:40px;" class="htCenter">No</th>
        <th style="width:200px;">Tespit Edilen Risk</th>
        <th style="width:160px;">Etkilenen Hesap Grubu</th>
        <th style="width:30px;" class="htCenter" title="Gerçeklik">G</th>
        <th style="width:30px;" class="htCenter" title="Tamlık">T</th>
        <th style="width:30px;" class="htCenter" title="Var Olma">V</th>
        <th style="width:30px;" class="htCenter" title="Doğruluk/Dönemsellik">D</th>
        <th style="width:30px;" class="htCenter" title="Değerleme">De</th>
        <th style="width:30px;" class="htCenter" title="Sınıflama/Sunum">S</th>
        <th style="width:180px;">Uygulanan Denetim Teknikleri</th>
        <th>İlgili BDS</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>
  <div class="doc-footer">
    <span>FAS Denetim Sistemi</span>
    <span>Oluşturulma: ${createdAt}</span>
  </div>
</body>
</html>`;
  };

  const isReadOnly = user.rol?.includes("KaliteKontrol") || user.rol?.includes("SorumluDenetci");

  return (
    <Box sx={{ pb: 8 }}>
      <GlobalStyles styles={drawerWaveStyles} />
      
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleKaydet}
          disabled={saving || loading || isReadOnly}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </Box>

      <Paper
        ref={containerRef}
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "background.paper",
          mb: 3,
        }}
      >
        <CalismaKagitiHotTable
          ref={hotRef}
          data={hotData}
          colHeaders={colHeaders}
          columns={columns}
          rowHeaders={true}
          autoRowSize={false}
          rowHeights={HOT_BASE_ROW_HEIGHT}
          afterChange={handleAfterChange}
          afterCreateRow={handleAfterCreateRow}
          afterRemoveRow={handleAfterRemoveRow}
          readOnly={isReadOnly}
        />
      </Paper>

      <FormOnayBolumu />
      <IslemlerCardHtml controller="TespitEdilenRiskler" buildHtmlAsync={buildHtmlAsync} />

      <Drawer
        anchor="right"
        open={editorDrawerOpen}
        onClose={() => {
          stopDrawerRecording();
          setEditorDrawerOpen(false);
          setDrawerForm(null);
          setDrawerAiResult("");
        }}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 520, lg: 620 },
            borderLeft: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {drawerForm && (
          <>
            <Box
              sx={{
                p: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: "grey.50",
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontSize: "1.1rem", fontWeight: 600, color: "text.primary" }}>
                  Satır Düzenleme Paneli
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Bu alanda yaptığınız değişiklikler tabloya aktarılır. Kalıcı olması için tabloyu kaydetmelisiniz.
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => {
                  stopDrawerRecording();
                  setEditorDrawerOpen(false);
                  setDrawerForm(null);
                  setDrawerAiResult("");
                }}
              >
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Box>

            <Tabs
              value={drawerActiveField}
              onChange={(_, val) => {
                stopDrawerRecording();
                setDrawerActiveField(val);
                setDrawerAiResult("");
                setDrawerAiPanelOpen(false);
              }}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: "1px solid", borderColor: "divider", px: 1, minHeight: 48 }}
            >
              <Tab label="Tespit Edilen Risk" value="islem" sx={{ textTransform: "none", minHeight: 48, fontWeight: 600 }} />
              <Tab label="Hesap Grubu (Tespit)" value="tespit" sx={{ textTransform: "none", minHeight: 48, fontWeight: 600 }} />
              <Tab label="Denetim Teknikleri" value="uygulananDenetimTeknikleri" sx={{ textTransform: "none", minHeight: 48, fontWeight: 600 }} />
              <Tab label="İlgili BDS" value="ilgiliBdsStandart" sx={{ textTransform: "none", minHeight: 48, fontWeight: 600 }} />
            </Tabs>

            <Box sx={{ p: 3, flex: 1, overflowY: "auto" }}>
              <Box sx={{ mb: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.primary" }}>
                  {getFieldLabel(drawerActiveField)}
                </Typography>
              </Box>

              <TextField
                fullWidth
                multiline
                minRows={5}
                variant="outlined"
                value={drawerForm[drawerActiveField]}
                onChange={(e) => handleDrawerFieldChange(drawerActiveField, e.target.value)}
                placeholder={`${getFieldLabel(drawerActiveField)} giriniz...`}
                sx={{
                  "& .MuiInputBase-root": {
                    bgcolor: "background.paper",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                  },
                }}
              />

              <Box
                sx={{
                  mt: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1,
                  borderRadius: 1,
                  bgcolor: "grey.50",
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {drawerRecordingField === drawerActiveField ? (
                    <Tooltip title="Kaydı Durdur">
                      <IconButton
                        size="small"
                        onClick={() => stopDrawerRecording()}
                        sx={{
                          bgcolor: "error.main",
                          color: "white",
                          "&:hover": { bgcolor: "error.dark" },
                          boxShadow: "0 0 0 4px rgba(211, 47, 47, 0.1)",
                        }}
                      >
                        <StopCircleRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Sesle Yaz">
                      <IconButton
                        size="small"
                        onClick={() => startDrawerRecording(drawerActiveField)}
                        sx={{
                          bgcolor: "primary.main",
                          color: "white",
                          "&:hover": { bgcolor: "primary.dark" },
                        }}
                      >
                        <KeyboardVoiceRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {drawerRecordingField === drawerActiveField && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: "2px", height: 16 }}>
                        {[...Array(4)].map((_, i) => (
                          <Box
                            key={i}
                            sx={{
                              width: 3,
                              height: "100%",
                              bgcolor: "error.main",
                              borderRadius: 1,
                              animation: "drawerWavePulse 1.2s infinite ease-in-out",
                              animationDelay: \`\${i * 0.15}s\`,
                            }}
                          />
                        ))}
                      </Box>
                      <Typography variant="caption" sx={{ color: "error.main", fontWeight: 600 }}>
                        Dinliyor...
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Tooltip title="FasAI ile Düzenle">
                  <IconButton
                    size="small"
                    onClick={() => setDrawerAiPanelOpen(!drawerAiPanelOpen)}
                    sx={{
                      bgcolor: drawerAiPanelOpen ? "secondary.main" : "grey.200",
                      color: drawerAiPanelOpen ? "white" : "text.secondary",
                      "&:hover": {
                        bgcolor: drawerAiPanelOpen ? "secondary.dark" : "grey.300",
                      },
                    }}
                  >
                    <AutoAwesomeRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {drawerAiPanelOpen && (
                <Paper
                  variant="outlined"
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: "primary.50",
                    borderColor: "primary.100",
                    borderLeft: "3px solid",
                    borderLeftColor: "primary.main",
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "primary.main", mb: 1.5, display: "block" }}>
                    FASAI İLE METNİ DÜZENLE
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                    {AI_PROMPTS.map((prompt, idx) => (
                      <Chip
                        key={idx}
                        label={prompt.label}
                        size="small"
                        onClick={() => runDrawerAiPrompt(prompt.instruction)}
                        disabled={drawerAiLoading || !drawerForm[drawerActiveField]?.trim()}
                        sx={{
                          bgcolor: "white",
                          border: "1px solid",
                          borderColor: "primary.200",
                          color: "primary.700",
                          fontWeight: 500,
                          "&:hover": { bgcolor: "primary.50" },
                        }}
                      />
                    ))}
                  </Stack>

                  {drawerAiResult && (
                    <Box sx={{ mt: 2, bgcolor: "white", p: 1.5, borderRadius: 1, border: "1px solid", borderColor: "grey.300" }}>
                      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", color: "text.primary" }}>
                        {drawerAiResult}
                      </Typography>
                      {drawerAiResult !== "FasAI çalışıyor..." && drawerAiResult !== "Hata oluştu, tekrar deneyin." && (
                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                          <Button size="small" variant="contained" color="primary" onClick={applyDrawerAiResult}>
                            Kullan
                          </Button>
                        </Box>
                      )}
                    </Box>
                  )}
                </Paper>
              )}
            </Box>

            <Box
              sx={{
                p: 2,
                borderTop: "1px solid",
                borderColor: "divider",
                bgcolor: "grey.50",
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
              }}
            >
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => {
                  stopDrawerRecording();
                  setEditorDrawerOpen(false);
                  setDrawerForm(null);
                  setDrawerAiResult("");
                }}
              >
                İptal
              </Button>
              <Button variant="contained" color="primary" onClick={handleDrawerApply}>
                Tabloya Uygula
              </Button>
            </Box>
          </>
        )}
      </Drawer>

      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Kaydedilmemiş Değişiklikler</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tabloda kaydedilmemiş değişiklikleriniz var. Sayfadan ayrılmak istediğinize emin misiniz?
            Değişiklikleriniz kaybolacaktır.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="inherit">
            İptal
          </Button>
          <Button
            onClick={() => {
              setConfirmDialogOpen(false);
              router.push(targetUrl);
            }}
            color="error"
            variant="contained"
          >
            Ayrıl
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MuiAlert elevation={6} variant="filled" onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default TespitEdilenRisklerTable;
