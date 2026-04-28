"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CalismaKagitiHotTable, {
  riskRenderer,
  durumRenderer,
  bdsRefRenderer,
  islemRenderer,
} from "@/components/CalismaKagitiHotTable";
import { setEditorPanelOpener } from "@/components/CalismaKagitiHotTable/SpeechTextEditor";
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
  Snackbar,
  Alert as MuiAlert,
  Typography,
  Stack,
  Alert,
  Paper,
  Tab,
  Tabs,
  TextField,
  MenuItem,
  Collapse,
  Drawer,
  IconButton as MuiIconButton,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import KeyboardVoiceRoundedIcon from "@mui/icons-material/KeyboardVoiceRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import { enhanceText } from "@/utils/gemini";
import GlobalStyles from "@mui/material/GlobalStyles";
import { HOT_BASE_ROW_HEIGHT, tespitRenderer } from "@/components/CalismaKagitiHotTable/renderers";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SearchIcon from "@mui/icons-material/Search";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useSnackbar } from "notistack";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  IsletmeyeIliskinIcKontrolTespitRow,
  getIsletmeyeIliskinIcKontrolTespitByDenetlenen,
  kaydetIsletmeyeIliskinIcKontrolTespit,
  varsayilanaDonIsletmeyeIliskinIcKontrolTespit,
} from "@/api/CalismaKagitlari/IsletmeyeIliskinIcKontrolTespit";
import FormOnayBolumu from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/FormOnayBolumu";
import IslemlerCardHtml from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCardHtml";

type MuiChipColor = "error" | "warning" | "info" | "success" | "default";

interface Props {
  isClickedVarsayilanaDon: boolean;
  setIsClickedVarsayilanaDon: (v: boolean) => void;
  setTamamlanan: (v: number) => void;
  setToplam: (v: number) => void;
}

interface RowData {
  satirNo: number | string;
  bolum: string;
  konu: string;
  islem: string;
  durum: string;
  riskSeviyesi: string;
  tespit: string;
  denetimAdimi: string;
  bdsReferansi: string;
  id: number;
  evetIcerik?: string | null;
  hayirIcerik?: string | null;
  evetDenetimAksiyonu?: string | null;
  hayirDenetimAksiyonu?: string | null;
  evetRiskSeviyesi?: string | null;
  hayirRiskSeviyesi?: string | null;
  standartmi?: boolean | null;
}

interface DrawerFormState {
  rowIndex: number;
  id: number;
  satirNo: string;
  bolum: string;
  konu: string;
  islem: string;
  durum: string;
  riskSeviyesi: string;
  tespit: string;
  denetimAdimi: string;
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

const COL_SATIR_NO = 0;
const COL_BOLUM = 1;
const COL_KONU = 2;
const COL_SORU = 3;
const COL_DURUM = 4;
const COL_RISK = 5;
const COL_AKSIYON = 6;
const COL_BDS_REF = 7;
const COL_TESPIT = 8;

const AI_PROMPTS = [
  {
    label: "Zenginleştir",
    instruction: "Bu metni daha profesyonel ve detaylı bir dille zenginleştir:",
  },
  {
    label: "Özetle",
    instruction: "Bu metni denetim raporu için kısa ve öz bir tespite dönüştür:",
  },
  {
    label: "Detaylandır",
    instruction: "Bu metni denetim standartlarına uygun şekilde daha fazla detay ekleyerek genişlet:",
  },
];

const SOFT_SURFACE = "#f8f7f4";
const SOFT_BORDER = "#e7e2d8";

const summaryCardStyles = {
  "Toplam soru": { bg: "#f5f3ee", border: "#e5ddd0", text: "#5c5548" },
  "Hayır seçimi": { bg: "#fbf4ea", border: "#ecdac0", text: "#8a6a3f" },
  "Kritik soru": { bg: "#f8efee", border: "#e7d3d0", text: "#8a605d" },
  "Yüksek riskli soru": { bg: "#f3f4f1", border: "#d9ddd3", text: "#5d6c5a" },
} as const;

function normalizeText(value: string | null | undefined) {
  return (value ?? "").toLocaleUpperCase("tr-TR");
}

const getFieldByColumn = (
  col?: number
): "islem" | "tespit" | "bdsReferansi" => {
  if (col === COL_SORU) return "islem";
  if (col === COL_BDS_REF) return "bdsReferansi";
  return "tespit";
};

const getFieldLabel = (
  field: "islem" | "tespit" | "bdsReferansi"
) => {
  if (field === "islem") return "Soru";
  if (field === "bdsReferansi") return "BDS Referansı";
  return "Açıklama / Değerlendirme Metni";
};

const IsletmeyeIliskinIcKontrolTespitTable: React.FC<Props> = ({
  isClickedVarsayilanaDon,
  setIsClickedVarsayilanaDon,
  setTamamlanan,
  setToplam,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const hotRef = useRef<any>(null);

  const [rows, setRows] = useState<IsletmeyeIliskinIcKontrolTespitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isHotDirty, setIsHotDirty] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [targetUrl, setTargetUrl] = useState("");

  const [activeSheet, setActiveSheet] = useState("İç Kontrol Belgesi");
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("Tümü");
  const [yalnizcaHayirlar, setYalnizcaHayirlar] = useState(false);

  const tableDataRef = useRef<RowData[]>([]);
  const changedRowIdsRef = useRef<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const [editorDrawerOpen, setEditorDrawerOpen] = useState(false);
  const [drawerForm, setDrawerForm] = useState<DrawerFormState | null>(null);
  const [drawerActiveField, setDrawerActiveField] = useState<
    "islem" | "tespit" | "bdsReferansi"
  >("tespit");
  const [drawerAiPanelOpen, setDrawerAiPanelOpen] = useState(false);
  const [drawerAiLoading, setDrawerAiLoading] = useState(false);
  const [drawerAiResult, setDrawerAiResult] = useState("");
  const [drawerRecordingField, setDrawerRecordingField] = useState<
    "islem" | "tespit" | "bdsReferansi" | null
  >(null);
  const drawerRecognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const drawerSpeechAnchorRef = useRef("");

  // ── Veri yükleme ─────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!user.denetciId || !user.denetlenenId || !user.yil) return;
    setLoading(true);
    try {
      const resp = await getIsletmeyeIliskinIcKontrolTespitByDenetlenen(
        user.denetciId,
        user.denetlenenId,
        user.yil
      );
      setRows(resp);
      setIsHotDirty(false);
      changedRowIdsRef.current.clear();
    } catch {
      enqueueSnackbar("Veriler yüklenemedi", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [user.denetciId, user.denetlenenId, user.yil, enqueueSnackbar]);

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
      const deleteSuccess = await varsayilanaDonIsletmeyeIliskinIcKontrolTespit(
        user.denetciId,
        user.denetlenenId,
        user.yil
      );

      if (deleteSuccess) {
        enqueueSnackbar("Veriler varsayılana döndürüldü", { variant: "success" });
        await fetchData();
      } else {
        enqueueSnackbar("Varsayılana dönüş başarısız oldu", { variant: "error" });
      }
    } catch (error) {
      console.error("Varsayılana dönüş hatası:", error);
      enqueueSnackbar("Bir hata oluştu", { variant: "error" });
    } finally {
      setLoading(false);
      setIsClickedVarsayilanaDon(false);
    }
  }, [user.denetciId, user.denetlenenId, user.yil, fetchData, setIsClickedVarsayilanaDon, enqueueSnackbar]);

  // ── Tablo verisi ─────────────────────────────────────────────────────────────

  const baseTableData = useMemo<RowData[]>(
    () =>
      rows.map((row, index) => {
        const durum = row.durum ?? "Evet";
        const riskSeviyesi = durum === "Evet" ? (row.evetRiskSeviyesi ?? "-") : (row.hayirRiskSeviyesi ?? "-");
        
        return {
          satirNo: row.satirNo ?? index + 1,
          bolum: row.bolum ?? "-",
          konu: row.konu ?? "Genel",
          islem: row.islem ?? "",
          durum,
          riskSeviyesi,
          tespit: row.tespit ?? (durum === "Evet" ? (row.evetIcerik ?? "") : (row.hayirIcerik ?? "")),
          denetimAdimi: durum === "Evet" ? (row.evetDenetimAksiyonu ?? "") : (row.hayirDenetimAksiyonu ?? ""),
          bdsReferansi: row.ilgiliBds ?? "",
          id: row.id,
          evetIcerik: row.evetIcerik ?? "",
          hayirIcerik: row.hayirIcerik ?? "",
          evetDenetimAksiyonu: row.evetDenetimAksiyonu ?? "",
          hayirDenetimAksiyonu: row.hayirDenetimAksiyonu ?? "",
          evetRiskSeviyesi: row.evetRiskSeviyesi ?? "",
          hayirRiskSeviyesi: row.hayirRiskSeviyesi ?? "",
          standartmi: row.standartmi,
        };
      }),
    [rows]
  );

  const tableData = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("tr-TR");
    return baseTableData.filter((row) => {
      const matchesRisk = riskFilter === "Tümü" || normalizeText(row.riskSeviyesi) === normalizeText(riskFilter);
      const matchesSearch = query.length === 0 || [row.bolum, row.konu, row.islem, row.tespit, row.denetimAdimi, row.bdsReferansi].join(" ").toLocaleLowerCase("tr-TR").includes(query);
      const matchesHayirFilter = !yalnizcaHayirlar || row.durum === "Hayır";
      return matchesRisk && matchesSearch && matchesHayirFilter;
    });
  }, [baseTableData, riskFilter, searchTerm, yalnizcaHayirlar]);

  useEffect(() => {
    tableDataRef.current = tableData;
  }, [tableData]);

  const stats = useMemo(() => {
    const hayirCount = baseTableData.filter((r) => r.durum?.trim() === "Hayır").length;
    const kritikCount = baseTableData.filter((r) => r.riskSeviyesi?.toUpperCase() === "KRİTİK").length;
    const yuksekCount = baseTableData.filter((r) => r.riskSeviyesi?.toUpperCase() === "YÜKSEK").length;
    return { hayirCount, kritikCount, yuksekCount, toplam: baseTableData.length };
  }, [baseTableData]);

  const answeredCount = baseTableData.filter((r) => r.durum?.trim()).length;

  useEffect(() => {
    setTamamlanan(answeredCount);
    setToplam(baseTableData.length);
  }, [answeredCount, baseTableData.length, setTamamlanan, setToplam]);

  const colHeaders = useMemo(
    () => [
      "No",
      "Bölüm",
      "Alt Bölüm",
      "Kontrol Sorusu",
      "Yanıt",
      "Risk",
      "Denetim Adımı",
      "İlgili BDS",
      "Açıklama / Değerlendirme Metni",
    ],
    []
  );

  const columns = useMemo(
    () => [
      { type: "text" as const, readOnly: false, width: 40, editor: "speech-text" }, // 0: No
      { type: "text" as const, readOnly: false, width: 90, renderer: islemRenderer, editor: "speech-text" }, // 1: Bölüm
      { type: "text" as const, readOnly: false, width: 110, renderer: islemRenderer, editor: "speech-text" }, // 2: Alt Bölüm
      { type: "text" as const, readOnly: false, width: 360, renderer: islemRenderer, editor: "speech-text" }, // 3: Soru
      {
        type: "dropdown" as const,
        source: ["Evet", "Hayır"],
        width: 100,
        renderer: durumRenderer,
      }, // 4: Yanıt
      { type: "text" as const, readOnly: false, width: 90, renderer: riskRenderer, editor: "speech-text" }, // 5: Risk
      {
        type: "text" as const,
        width: 250,
        renderer: islemRenderer,
        editor: false,
        readOnly: true,
      }, // 6: Denetim Adımı (Aksiyon)
      { type: "text" as const, readOnly: true, width: 90, renderer: bdsRefRenderer, editor: false }, // 7: İlgili BDS
      {
        type: "text" as const,
        renderer: tespitRenderer,
        editor: "speech-text",
      }, // 8: Açıklama Metni (Tespit)
    ],
    []
  );

  const editableColumnIndices = useMemo(() => [COL_SATIR_NO, COL_BOLUM, COL_KONU, COL_SORU, COL_DURUM, COL_RISK, COL_TESPIT], []);

  const hotData = useMemo(
    () =>
      tableData.map((row) => [
        row.satirNo,
        row.bolum,
        row.konu,
        row.islem,
        row.durum,
        row.riskSeviyesi,
        row.denetimAdimi,
        row.bdsReferansi,
        row.tespit,
        row.id,
        row.evetIcerik,
        row.hayirIcerik,
      ]),
    [tableData]
  );

  // ── Sayfa terk uyarısı ────────────────────────────────────────────────────────

  useEffect(() => {
    const applyWidth = () => {
      const hot = hotRef.current?.hotInstance;
      if (!hot) return;
      
      const containerWidth = containerRef.current?.offsetWidth || window.innerWidth - 100;
      if (!containerWidth) return;

      const fixedTotal = 40 + 90 + 110 + 100 + 90 + 250 + 90;
      const remaining = Math.max(400, containerWidth - fixedTotal);

      // Soru %44, Açıklama son sütun olduğu için stretchH="last" ile tüm boşluğu dolduracak.
      const soruWidth = Math.floor(remaining * 0.44);

      hot.updateSettings({
        colWidths: [40, 90, 110, soruWidth, 100, 90, 250, 90, undefined],
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
      if (container) observer.unobserve(container);
    };
  }, [tableData]);

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

  const openDrawerForRow = useCallback(
    (
      rowIndex: number,
      activeField: "islem" | "tespit" | "bdsReferansi" = "tespit",
      currentValue?: string
    ) => {
      const hot = hotRef.current?.hotInstance;
      if (!hot || rowIndex < 0) return;

      const activeEditor = hot.getActiveEditor?.();
      if (activeEditor?.isOpened?.()) {
        activeEditor.finishEditing?.(false);
      }

      const rowData = hot.getSourceDataAtRow(rowIndex) as any[] | undefined;
      if (!rowData) return;

      const form: DrawerFormState = {
        rowIndex,
        id: Number(rowData[9] || 0),
        satirNo: String(rowData[COL_SATIR_NO] ?? ""),
        bolum: String(rowData[COL_BOLUM] ?? ""),
        konu: String(rowData[COL_KONU] ?? ""),
        islem: String(rowData[COL_SORU] ?? ""),
        durum: String(rowData[COL_DURUM] ?? "Evet"),
        riskSeviyesi: String(rowData[COL_RISK] ?? "-"),
        tespit: String(rowData[COL_TESPIT] ?? ""),
        denetimAdimi: String(rowData[COL_AKSIYON] ?? ""),
        bdsReferansi: String(rowData[COL_BDS_REF] ?? ""),
      };
      if (currentValue !== undefined) {
        form[activeField] = currentValue;
      }
      setDrawerForm(form);
      setDrawerActiveField(activeField);
      setDrawerAiResult("");
      setDrawerAiPanelOpen(false);
      setEditorDrawerOpen(true);
    },
    []
  );

  useEffect(() => {
    setEditorPanelOpener(({ row, col, value }) => {
      openDrawerForRow(row, getFieldByColumn(col), value);
    });

    return () => {
      setEditorPanelOpener(null);
    };
  }, [openDrawerForRow]);

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
  }, []);

  useEffect(() => {
    return () => {
      stopDrawerRecording();
    };
  }, [stopDrawerRecording]);

  const startDrawerRecording = useCallback(
    async (field: "islem" | "tespit" | "bdsReferansi") => {
      const SR =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (!SR) {
        enqueueSnackbar("Tarayıcınız ses tanımayı desteklemiyor.", {
          variant: "error",
        });
        return;
      }

      if (!drawerForm) return;

      if (drawerRecordingField === field) {
        stopDrawerRecording();
        return;
      }

      stopDrawerRecording();

      const rec: SpeechRecognitionInstance = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "tr-TR";
      rec.maxAlternatives = 1;

      drawerSpeechAnchorRef.current = drawerForm[field] ?? "";
      setDrawerRecordingField(field);

      rec.onresult = (event: SpeechRecognitionEvent) => {
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
          const sep =
            drawerSpeechAnchorRef.current &&
            !drawerSpeechAnchorRef.current.endsWith(" ")
              ? " "
              : "";
          drawerSpeechAnchorRef.current =
            drawerSpeechAnchorRef.current + sep + final;
          handleDrawerFieldChange(field, drawerSpeechAnchorRef.current);
        } else if (interim) {
          const sep =
            drawerSpeechAnchorRef.current &&
            !drawerSpeechAnchorRef.current.endsWith(" ")
              ? " "
              : "";
          handleDrawerFieldChange(
            field,
            drawerSpeechAnchorRef.current + sep + interim
          );
        }
      };

      rec.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error !== "aborted" && event.error !== "no-speech") {
          enqueueSnackbar(`Ses algılama hatası: ${event.error}`, {
            variant: "error",
          });
        }
        stopDrawerRecording();
      };

      rec.onend = () => {
        stopDrawerRecording();
      };

      drawerRecognitionRef.current = rec;

      try {
        rec.start();
      } catch {
        enqueueSnackbar("Ses kaydı başlatılamadı.", { variant: "error" });
        stopDrawerRecording();
      }
    },
    [
      drawerForm,
      drawerRecordingField,
      enqueueSnackbar,
      handleDrawerFieldChange,
      stopDrawerRecording,
    ]
  );

  const runDrawerAiPrompt = useCallback(
    async (instruction: string) => {
      if (!drawerForm) return;
      const text = drawerForm[drawerActiveField]?.trim();
      if (!text) {
        enqueueSnackbar("Önce metin girin.", { variant: "warning" });
        return;
      }

      setDrawerAiLoading(true);
      setDrawerAiPanelOpen(true);
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
    [drawerActiveField, drawerForm, enqueueSnackbar, user]
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

    hot.setDataAtCell(drawerForm.rowIndex, COL_SORU, drawerForm.islem);
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
    setDrawerAiPanelOpen(false);
    enqueueSnackbar("Satır güncellendi. Kalıcı olması için kaydedin.", {
      variant: "success",
    });
  }, [drawerForm, enqueueSnackbar, stopDrawerRecording]);

  // ── Handsontable event handlers ───────────────────────────────────────────────

  const handleAfterChange = useCallback(
    function (this: any, change: any[] | null, source: string) {
      if (!change || !change.length || source === "loadData") return;
      
      const hot = this;

      change.forEach(([row, prop, oldValue, newValue]: [number, any, any, any]) => {
        if (newValue === "EDITOR_DRAWER_OPEN") {
          const colIndex = hot.propToCol(prop);
          const val = hot.getDataAtCell(row, colIndex);
          openDrawerForRow(row, getFieldByColumn(colIndex));
          setTimeout(() => hot.setDataAtCell(row, colIndex, val, "internal"), 0);
          return;
        }

        setIsHotDirty(true);
        const rowData = tableDataRef.current[row];
        if (rowData?.id) {
          changedRowIdsRef.current.add(rowData.id);
        }

        if ((prop === "durum" || prop === COL_DURUM) && newValue?.trim()) {
          const currentTespit = hot.getDataAtCell(row, COL_TESPIT) ?? "";
          const currentAksiyon = hot.getDataAtCell(row, COL_AKSIYON) ?? "";
          
          const isOldEvet = oldValue === "Evet";
          const isNewEvet = newValue === "Evet";

          const oldAciklamaTemplate = isOldEvet ? rowData?.evetIcerik || "" : rowData?.hayirIcerik || "";
          const newAciklamaTemplate = isNewEvet ? rowData?.evetIcerik || "" : rowData?.hayirIcerik || "";

          const oldAksiyonTemplate = isOldEvet ? rowData?.evetDenetimAksiyonu || "" : rowData?.hayirDenetimAksiyonu || "";
          const newAksiyonTemplate = isNewEvet ? rowData?.evetDenetimAksiyonu || "" : rowData?.hayirDenetimAksiyonu || "";
          
          const newRisk = isNewEvet ? (rowData?.evetRiskSeviyesi ?? "-") : (rowData?.hayirRiskSeviyesi ?? "-");
          setTimeout(() => hot.setDataAtCell(row, COL_RISK, newRisk), 0);

          if (currentTespit === "" || currentTespit.trim() === oldAciklamaTemplate.trim()) {
            setTimeout(() => hot.setDataAtCell(row, COL_TESPIT, newAciklamaTemplate), 0);
          }
          
          if (currentAksiyon === "" || currentAksiyon.trim() === oldAksiyonTemplate.trim()) {
            setTimeout(() => hot.setDataAtCell(row, COL_AKSIYON, newAksiyonTemplate), 0);
          }
        }
      });
    },
    [openDrawerForRow]
  );

  const handleAfterCreateRow = useCallback(
    function (this: any, index: number, amount: number) {
      setIsHotDirty(true);
      const hot = this;
      for (let i = index; i < index + amount; i++) {
        hot.setDataAtCell(i, COL_DURUM, "Evet");
        hot.setDataAtCell(i, 9, 0, "internal"); // id=0 → yeni kayıt
      }
    },
    []
  );

  // ── Kaydet ───────────────────────────────────────────────────────────────────

  const handleKaydet = useCallback(async () => {
    if (!user.denetciId || !user.denetlenenId || !user.yil) return;
    const hot = hotRef.current?.hotInstance;
    if (!hot) return;
    setSaving(true);
    try {
      const sourceData = hot.getSourceData() as any[][];
      const gosterilenSatirlar = sourceData
        .map((rowArr) => ({
          id: Number(rowArr[9] || 0),
          satirNo: rowArr[COL_SATIR_NO] ? Number(rowArr[COL_SATIR_NO]) : null,
          bolum: (rowArr[COL_BOLUM] ?? "").toString(),
          konu: (rowArr[COL_KONU] ?? "").toString(),
          islem: (rowArr[COL_SORU] ?? "").toString(),
          durum: (rowArr[COL_DURUM] ?? "Evet").toString(),
          riskSeviyesi: (rowArr[COL_RISK] ?? "").toString(),
          tespit: (rowArr[COL_TESPIT] ?? "").toString(),
          ilgiliBds: (rowArr[COL_BDS_REF] ?? "").toString(),
          denetimAdimi: (rowArr[COL_AKSIYON] ?? "").toString(),
        }));

      if (gosterilenSatirlar.length === 0) {
        enqueueSnackbar("Değişiklik yapılmadı", { variant: "info" });
        setSaving(false);
        return;
      }

      const gosterilenSatirIdleri = new Set(
        gosterilenSatirlar.filter((item) => item.id > 0).map((item) => item.id)
      );

      const gizliSatirlar = baseTableData
        .filter((row) => row.id > 0 && !gosterilenSatirIdleri.has(row.id))
        .map((row) => ({
          id: row.id,
          satirNo: typeof row.satirNo === "number" ? row.satirNo : Number(row.satirNo) || null,
          bolum: row.bolum,
          konu: row.konu,
          islem: row.islem,
          durum: row.durum,
          riskSeviyesi: row.riskSeviyesi,
          tespit: row.tespit,
          ilgiliBds: row.bdsReferansi,
        }));

      const satirlar = [...gosterilenSatirlar, ...gizliSatirlar].sort(
        (a, b) => (a.satirNo ?? Number.MAX_SAFE_INTEGER) - (b.satirNo ?? Number.MAX_SAFE_INTEGER)
      );

      const success = await kaydetIsletmeyeIliskinIcKontrolTespit({
        denetciId: user.denetciId,
        denetlenenId: user.denetlenenId,
        yil: user.yil,
        satirlar,
      });

      if (success) {
        setIsHotDirty(false);
        changedRowIdsRef.current.clear();
        enqueueSnackbar("Veriler başarıyla kaydedildi", { variant: "success" });
        await fetchData();
      } else {
        enqueueSnackbar("Veriler kaydedilemedi. Lütfen tekrar deneyin.", { variant: "error" });
      }
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      enqueueSnackbar("Bir hata oluştu. Lütfen tekrar deneyin.", { variant: "error" });
    } finally {
      setSaving(false);
    }
  }, [user.denetciId, user.denetlenenId, user.yil, baseTableData, fetchData, enqueueSnackbar]);

  // ── HTML çıktı ────────────────────────────────────────────────────────────────

  const escapeHtml = (s: string) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const buildHtmlAsync = async (): Promise<string> => {
    const createdAt = new Date().toLocaleString("tr-TR");
    
    const riskChipClass = (val?: string | null) => {
      const v = (val || "").toLowerCase();
      if (v.includes("yüksek") || v.includes("kritik")) return "chip chip-error";
      if (v.includes("orta")) return "chip chip-warn";
      if (v.includes("düşük") || v.includes("bilgi")) return "chip chip-info";
      return "chip chip-ok";
    };

    const tableRows = baseTableData
      .map(
        (row, idx) => `
      <tr>
        <td style="text-align:center">${escapeHtml(String(row.satirNo ?? idx + 1))}</td>
        <td>${escapeHtml(row.bolum)}</td>
        <td>${escapeHtml(row.konu)}</td>
        <td>${escapeHtml(row.islem)}</td>
        <td style="text-align:center">${escapeHtml(row.durum)}</td>
        <td style="text-align:center"><span class="${riskChipClass(row.riskSeviyesi)}">${escapeHtml(row.riskSeviyesi)}</span></td>
        <td>${escapeHtml(row.denetimAdimi)}</td>
        <td style="text-align:center">${escapeHtml(row.bdsReferansi)}</td>
        <td>${escapeHtml(row.tespit)}</td>
      </tr>`
      )
      .join("");
      
    return `<!DOCTYPE html><html lang="tr">
      <head>
        <meta charset="utf-8"/>
        <title>İşletmeye İlişkin İç Kontrol Tespit Belgesi</title>
        <style>
          @page { size: A4 landscape; margin: 1cm; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body { font-family: Arial, sans-serif; font-size: 10px; color: #1a202c; }
          .doc-header { border-bottom: 2px solid #2b6cb0; padding-bottom: 12px; margin-bottom: 16px; }
          .doc-title { font-size: 14px; font-weight: 700; color: #2b6cb0; text-transform: uppercase; }
          .doc-meta { font-size: 10px; color: #555; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          th { background: #f1f5f9; font-weight: 700; border: 1px solid #cbd5e0; padding: 5px 6px; text-align: left; }
          td { border: 1px solid #e2e8f0; padding: 4px 6px; vertical-align: top; }
          tr:nth-child(even) td { background: #f8fafc; }
          .chip { display: inline-block; padding: 1px 6px; border-radius: 3px; font-size: 9px; font-weight: 600; border: 1px solid; }
          .chip-error { background:#fdf2f2; color:#b91c1c; border-color:#fca5a5; }
          .chip-warn { background:#fffbeb; color:#b45309; border-color:#fcd34d; }
          .chip-info { background:#eff6ff; color:#1d4ed8; border-color:#93c5fd; }
          .chip-ok { background:#f0fdf4; color:#15803d; border-color:#86efac; }
          .doc-footer { margin-top: 24px; font-size: 9px; color: #999; border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="doc-header">
          <div class="doc-title">İşletmeye İlişkin İç Kontrol Tespit Belgesi</div>
          <div class="doc-meta">Denetlenen: ${escapeHtml(user.denetlenenFirmaAdi || "")} | Yıl: ${escapeHtml(String(user.yil ?? ""))}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:3%;">No</th>
              <th style="width:7%;">Bölüm</th>
              <th style="width:10%;">Alt Bölüm</th>
              <th style="width:18%;">Kontrol Sorusu</th>
              <th style="width:5%;">Yanıt</th>
              <th style="width:6%;">Risk</th>
              <th style="width:20%;">Denetim Adımı</th>
              <th style="width:8%;">BDS</th>
              <th style="width:23%;">Açıklama</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        
        <div class="doc-footer">
          <span>Oluşturulma: ${escapeHtml(createdAt)}</span>
          <span class="page-number">Bu belge denetim kanıtı niteliğindedir.</span>
        </div>
      </body>
      </html>`;
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ width: "100%", margin: 0, display: "flex", flexDirection: "column", bgcolor: "#ffffff" }}>
      <GlobalStyles
        styles={{
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
      <Stack spacing={2.5}>
        <Box sx={{ px: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button
            onClick={handleKaydet}
            disabled={saving || (!isHotDirty && changedRowIdsRef.current.size === 0)}
            variant="contained"
            color={isHotDirty ? "warning" : "primary"}
          >
            {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Button>
        </Box>

        <Box sx={{ px: 2 }}>
          <Box
            className="calisma-kagiti-hot-table-shell"
            sx={{
              width: "100%",
              overflow: "hidden",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box
              ref={containerRef}
              className="calisma-kagiti-hot-table"
              sx={{ position: "relative", minWidth: 0 }}
            >
              <CalismaKagitiHotTable
                ref={hotRef}
                className="ht-theme-horizon calisma-kagiti-hot-table-grid"
                data={hotData}
                colHeaders={colHeaders}
                columns={columns}
                rowHeaders={false}
                height="calc(100vh - 420px)"
                width="100%"
                rowHeight={HOT_BASE_ROW_HEIGHT}
                stretchH="last"
                dropdownMenu={true}
                manualColumnResize={true}
                manualRowResize={false}
                editableColumnIndices={editableColumnIndices}
                afterChange={handleAfterChange}
                afterCreateRow={handleAfterCreateRow}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <FormOnayBolumu
            controller="IsletmeyeIliskinIcKontrolTespit"
            showKaliteKontrol={true}
            onHazirlayanChange={fetchData}
            onOnaylayanChange={fetchData}
          />
        </Box>

        <Box sx={{ mt: 4 }}>
          <IslemlerCardHtml
            controller="IsletmeyeIliskinIcKontrolTespit"
            buildHtmlAsync={buildHtmlAsync}
            previewEndpoint="/ArsivIslemleri/WordDosyasiniPdfOlarakOnizleHtml"
          />
        </Box>
      </Stack>

      {/* Editor Drawer */}
      <Drawer
        anchor="right"
        open={editorDrawerOpen}
        onClose={() => {
          stopDrawerRecording();
          setEditorDrawerOpen(false);
          setDrawerForm(null);
          setDrawerAiResult("");
          setDrawerAiPanelOpen(false);
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
            <MuiIconButton
              onClick={() => {
                stopDrawerRecording();
                setEditorDrawerOpen(false);
                setDrawerForm(null);
                setDrawerAiResult("");
                setDrawerAiPanelOpen(false);
              }}
            >
              <CloseIcon />
            </MuiIconButton>
          </Box>

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
              <TextField
                label={getFieldLabel(drawerActiveField)}
                value={drawerForm?.[drawerActiveField] ?? ""}
                onChange={(e) =>
                  handleDrawerFieldChange(drawerActiveField, e.target.value)
                }
                fullWidth
                multiline
                minRows={
                  drawerActiveField === "bdsReferansi"
                    ? 4
                    : drawerActiveField === "islem"
                      ? 6
                      : 8
                }
                variant="outlined"
              />

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
                <Typography
                  variant="caption"
                  color="primary.main"
                  fontWeight={600}
                  sx={{
                    fontSize: "0.65rem",
                    visibility:
                      drawerRecordingField === drawerActiveField
                        ? "visible"
                        : "hidden",
                  }}
                >
                  ● Dinliyor
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Tooltip title="FasAI ile Geliştir">
                    <MuiIconButton
                      size="small"
                      onClick={() => {
                        setDrawerAiPanelOpen((v) => !v);
                        setDrawerAiResult("");
                      }}
                      sx={{
                        width: 26,
                        height: 26,
                        border: "1px solid",
                        borderColor: drawerAiPanelOpen
                          ? "primary.main"
                          : "divider",
                        bgcolor: drawerAiPanelOpen
                          ? "primary.50"
                          : "background.paper",
                        color: drawerAiPanelOpen
                          ? "primary.main"
                          : "text.secondary",
                        borderRadius: "50%",
                      }}
                    >
                      <AutoAwesomeRoundedIcon sx={{ fontSize: 14 }} />
                    </MuiIconButton>
                  </Tooltip>

                  <Tooltip
                    title={
                      drawerRecordingField === drawerActiveField
                        ? "Kaydı Durdur"
                        : "Sesle Yaz"
                    }
                  >
                    <MuiIconButton
                      size="small"
                      onClick={() => startDrawerRecording(drawerActiveField)}
                      sx={{
                        width: 26,
                        height: 26,
                        border: "1px solid",
                        borderColor:
                          drawerRecordingField === drawerActiveField
                            ? "error.main"
                            : "divider",
                        bgcolor:
                          drawerRecordingField === drawerActiveField
                            ? "error.50"
                            : "background.paper",
                        color:
                          drawerRecordingField === drawerActiveField
                            ? "error.main"
                            : "text.secondary",
                        borderRadius: "50%",
                      }}
                    >
                      {drawerRecordingField === drawerActiveField ? (
                        <StopCircleRoundedIcon sx={{ fontSize: 14 }} />
                      ) : (
                        <KeyboardVoiceRoundedIcon sx={{ fontSize: 14 }} />
                      )}
                    </MuiIconButton>
                  </Tooltip>
                </Box>
              </Box>

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
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.75,
                      mb: 1,
                    }}
                  >
                    {AI_PROMPTS.map((item) => (
                      <Chip
                        key={item.label}
                        label={item.label}
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => runDrawerAiPrompt(item.instruction)}
                        disabled={
                          drawerAiLoading ||
                          !(drawerForm?.[drawerActiveField]?.trim())
                        }
                        sx={{ cursor: "pointer", fontSize: "0.7rem" }}
                      />
                    ))}
                  </Box>

                  {drawerAiLoading && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <CircularProgress size={12} />
                      <Typography variant="body2" color="text.secondary">
                        İşleniyor...
                      </Typography>
                    </Box>
                  )}

                  {!drawerAiLoading && drawerAiResult && (
                    <>
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          mb: 1,
                          color: "text.primary",
                        }}
                      >
                        {drawerAiResult}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
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
                setDrawerAiPanelOpen(false);
              }}
            >
              Kapat
            </Button>
            <Button
              variant="contained"
              onClick={handleDrawerApply}
              disabled={!drawerForm}
            >
              Tabloya Uygula
            </Button>
          </Box>
        </Box>
      </Drawer>

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
    </Box>
  );
};

export default IsletmeyeIliskinIcKontrolTespitTable;
