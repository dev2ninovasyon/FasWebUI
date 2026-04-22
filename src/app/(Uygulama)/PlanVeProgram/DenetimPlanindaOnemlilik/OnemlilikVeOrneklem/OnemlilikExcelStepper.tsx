"use client";

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Drawer,
  IconButton as MuiIconButton,
  Tooltip,
  Tab,
  Tabs,
  Chip,
  Divider
} from "@mui/material";
import { IconHistory, IconRotate } from "@tabler/icons-react";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import KeyboardVoiceRoundedIcon from "@mui/icons-material/KeyboardVoiceRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import { enqueueSnackbar } from "notistack";
import { saveAs } from "file-saver";
import axios from "axios";
import {
  getDenetimPlaniOnemlilikExcelModel,
  previewDenetimPlaniOnemlilikExcelModel,
  resetDenetimPlaniOnemlilikExcelModel,
  restorePreviousDenetimPlaniOnemlilikExcelModel,
  updateDenetimPlaniOnemlilikExcelModel,
} from "@/api/PlanVeProgram/DenetimPlaniOnemlilik";
import { getFormHazirlayanOnaylayanByDenetciDenetlenenYilFormKodu } from "@/api/CalismaKagitlari/CalismaKagitlari";
import { getMenus } from "@/api/Menu/Menu";
import { url } from "@/api/apiBase";
import { createAuthorizedAxiosConfig } from "@/utils/authSession";
import { getKullaniciByDenetlenenYilRol, getKullaniciById } from "@/api/Kullanici/KullaniciIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { enhanceText } from "@/utils/gemini";

// Handsontable imports
import CalismaKagitiHotTable, {
  riskRenderer,
  durumRenderer,
  bdsRefRenderer,
  islemRenderer,
} from "@/components/CalismaKagitiHotTable";
import { setEditorPanelOpener } from "@/components/CalismaKagitiHotTable/SpeechTextEditor";
import { HOT_BASE_ROW_HEIGHT, moneyRenderer, percentRenderer } from "@/components/CalismaKagitiHotTable/renderers";

type Parametreler = {
  firmaAdi: string;
  denetimYili: number;
  sektorTipi: string;
  raporlamaDonemi: string;
  vergiOncesiKar: number;
  netSatislar: number;
  ozkaynakToplami: number;
  toplamVarliklar: number;
  hedefDenetimRiski: number;
  vokOraniYuzdeOverride?: number | null;
  netSatisOraniYuzdeOverride?: number | null;
  ozkaynakOraniYuzdeOverride?: number | null;
  toplamVarlikOraniYuzdeOverride?: number | null;
};

type HesapGirdi = {
  siraNo: number;
  kebirKodu: number;
  hesapAdi: string;
  mizanTutari: number;
  riskK: number;
  dogalRisk: number;
  kontrolRiski: number;
};

type Row = Record<string, any>;

type Workbook = {
  parametreler: Parametreler;
  finansalVeriler: Row[];
  yilGrubuMatrisi: Row[];
  sektorAgirlikMatrisi: Row[];
  aktifParametreler: Row;
  genelOnemlilikSatirlari: Row[];
  ozet: {
    genelOnemlilik: number;
    performansOnemliligi: number;
    deMinimis: number;
    hesapSabitPayTutari: number;
    kalanDagitilabilirTutar: number;
    dagitimdaKullanilanHesapAdedi: number;
  };
  hesapDagitimSatirlari: Row[];
  denetimRiskiModelTanimlari: Row[];
  denetimRiskiSatirlari: Row[];
  birOncekiHesaplamaVar: boolean;
};

type WorkbookState = {
  parametreler: Parametreler;
  hesaplar: HesapGirdi[];
};

type SignaturePerson = {
  adSoyad: string;
  unvan?: string;
  tarih?: string | null;
};

type DocumentMeta = {
  referansNo?: string;
  formKodu?: string;
  belgeAdi?: string;
  hazirlayan?: SignaturePerson | null;
  onaylayan?: SignaturePerson | null;
  kontrolEden?: SignaturePerson | null;
};

interface DrawerFormState {
  rowIndex: number;
  kebirKodu: number;
  hesapAdi: string;
  mizanTutari: number;
  riskK: number;
  dogalRisk: number;
  kontrolRiski: number;
  nihaiOnemlilik?: number;
  yaklasim?: string;
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
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
}

const AI_PROMPTS = [
  { label: "Zenginleştir", instruction: "Bu metni daha profesyonel ve detaylı bir dille zenginleştir:" },
  { label: "Özetle", instruction: "Bu metni denetim raporu için kısa ve öz bir tespite dönüştür:" },
  { label: "Detaylandır", instruction: "Bu metni denetim standartlarına uygun şekilde daha fazla detay ekleyerek genişlet:" },
];

const steps = [
  "P0 - Parametreler",
  "M1 - Genel Önemlilik",
  "M2 - Hesap Dağıtım",
  "M3 - Denetim Riski",
];

const money = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const plain = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 4 });
const formatMoney = (value?: number | null) => money.format(value ?? 0);
const formatPercent = (value?: number | null, multiplier = 1) => `%${money.format((value ?? 0) * multiplier)}`;

const parseDecimal = (value: string) => {
  const normalized = (value || "0").replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildState = (workbook: Workbook): WorkbookState => ({
  parametreler: workbook.parametreler,
  hesaplar: workbook.hesapDagitimSatirlari.map((item) => {
    const risk = workbook.denetimRiskiSatirlari.find((x) => x.kebirKodu === item.kebirKodu);
    return {
      siraNo: item.siraNo,
      kebirKodu: item.kebirKodu,
      hesapAdi: item.hesapAdi,
      mizanTutari: item.mizanTutari,
      riskK: item.riskK,
      dogalRisk: risk?.dogalRisk ?? 0.6,
      kontrolRiski: risk?.kontrolRiski ?? 0.7,
    };
  }),
});

const toPayload = (state: WorkbookState) => ({
  parametreler: state.parametreler,
  hesaplar: state.hesaplar,
});

const Section = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <Paper sx={{ borderRadius: 3, border: "1px solid #dbe3f0", overflow: "hidden", boxShadow: "0 12px 28px rgba(15,23,42,.06)" }}>
    <Box sx={{ px: 3, py: 1.5, background: "#f8fafc", color: "#1e293b", borderBottom: "1px solid #e2e8f0", fontWeight: 800, fontSize: "1.1rem" }}>{title}</Box>
    {subtitle ? <Box sx={{ px: 3, py: 1.2, background: "#fffbeb", color: "#92400e", fontWeight: 700, fontSize: "0.85rem" }}>{subtitle}</Box> : null}
    <Box sx={{ p: 3 }}>{children}</Box>
  </Paper>
);

const FORM_KODU = "OnemlilikVeOrneklem";
const FORM_TITLE = "Önemlilik Ve Örneklem";
const FORM_URL = "/PlanVeProgram/DenetimPlanindaOnemlilik/OnemlilikVeOrneklem";

export interface OnemlilikExcelStepperRef {
  handleReset: () => Promise<void>;
  handleRestorePrevious: () => Promise<void>;
  handleOpenPreview: () => Promise<void>;
  handleExcelDownload: () => Promise<void>;
  handleWordDownload: () => Promise<void>;
}

const OnemlilikExcelStepper = forwardRef<OnemlilikExcelStepperRef>((props, ref) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stepLoading, setStepLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savedWorkbook, setSavedWorkbook] = useState<Workbook | null>(null);
  const [previewWorkbook, setPreviewWorkbook] = useState<Workbook | null>(null);
  const [draftState, setDraftState] = useState<WorkbookState | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState("");
  const [documentMeta, setDocumentMeta] = useState<DocumentMeta | null>(null);
  const [toolbarActionLoading, setToolbarActionLoading] = useState<null | "back" | "next" | "restore" | "reset">(null);
  const currentWorkbook = previewWorkbook ?? savedWorkbook;
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewSeqRef = useRef(0);
  const stepLoadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Drawer states
  const [editorDrawerOpen, setEditorDrawerOpen] = useState(false);
  const [drawerForm, setDrawerForm] = useState<DrawerFormState | null>(null);
  const [drawerActiveField, setDrawerActiveField] = useState<"riskK" | "dogalRisk" | "kontrolRiski">("riskK");
  const [drawerAiPanelOpen, setDrawerAiPanelOpen] = useState(false);
  const [drawerAiLoading, setDrawerAiLoading] = useState(false);
  const [drawerAiResult, setDrawerAiResult] = useState("");
  const [drawerRecordingField, setDrawerRecordingField] = useState<string | null>(null);
  const drawerRecognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const hotM2Ref = useRef<any>(null);
  const hotM3Ref = useRef<any>(null);

  const getErrorMessage = (error: any, fallback: string) => {
    if (error?.response?.data) {
      if (typeof error.response.data === "string") return error.response.data;
      if (error.response.data.message) return error.response.data.message;
      if (error.response.data.title) return error.response.data.title;
    }
    return error instanceof Error ? error.message : fallback;
  };

  const revokeBlobUrl = (value?: string | null) => {
    if (value?.startsWith("blob:")) window.URL.revokeObjectURL(value);
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const normalized = value.includes("T") ? value.split("T")[0] : value;
    const [year, month, day] = normalized.split("-");
    return year && month && day ? `${day}.${month}.${year}` : normalized;
  };

  const resolvePerson = async (id?: number | null, fallbackTip?: string) => {
    if (id) {
      const userData = await getKullaniciById(id);
      if (userData) return { adSoyad: userData.personelAdi || userData.kullaniciAdi || "-", unvan: userData.unvan || "" };
    }
    if (!fallbackTip) return null;
    const fallbackPeople = await getKullaniciByDenetlenenYilRol(user.denetlenenId || 0, user.yil || 0, fallbackTip);
    const fallbackUser = fallbackPeople?.[0];
    return fallbackUser ? { adSoyad: fallbackUser.personelAdi || fallbackUser.kullaniciAdi || "-", unvan: fallbackUser.unvan || "" } : null;
  };

  const loadDocumentMeta = async () => {
    try {
      const [formData, menus] = await Promise.all([
        getFormHazirlayanOnaylayanByDenetciDenetlenenYilFormKodu(user.denetciId || 0, user.denetlenenId || 0, user.yil || 0, FORM_KODU),
        getMenus(),
      ]);
      const matchedMenu = menus.find((menu) => menu.formKodu === FORM_KODU || menu.formUrl === FORM_URL);
      const [hazirlayan, onaylayan, kontrolEden] = await Promise.all([
        resolvePerson(formData?.hazirlayanId, "Hazırlayan"),
        resolvePerson(formData?.onaylayanId, "Onaylayan"),
        resolvePerson(formData?.kontrolEdenId, "Kalite Kontrol"),
      ]);
      setDocumentMeta({
        referansNo: matchedMenu?.referansNo || "",
        formKodu: matchedMenu?.formKodu || FORM_KODU,
        belgeAdi: matchedMenu?.belgeAdi || FORM_TITLE,
        hazirlayan: hazirlayan ? { ...hazirlayan, tarih: formData?.hazirlanmaTarihi } : null,
        onaylayan: onaylayan ? { ...onaylayan, tarih: formData?.onaylanmaTarihi } : null,
        kontrolEden: kontrolEden ? { ...kontrolEden, tarih: formData?.kontrolTarihi } : null,
      });
    } catch (error) {
      setDocumentMeta({ referansNo: "", formKodu: FORM_KODU, belgeAdi: FORM_TITLE });
    }
  };

  const syncFromWorkbook = (workbook: Workbook) => {
    setSavedWorkbook(workbook);
    setPreviewWorkbook(workbook);
    setDraftState(buildState(workbook));
    setLoadError(null);
  };

  const loadWorkbook = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getDenetimPlaniOnemlilikExcelModel(user.denetciId || 0, user.denetlenenId || 0, user.yil || 0);
      if (!data) throw new Error("Önemlilik modeli yüklenemedi.");
      syncFromWorkbook(data);
    } catch (error) {
      setSavedWorkbook(null);
      setPreviewWorkbook(null);
      setDraftState(null);
      setLoadError(getErrorMessage(error, "Önemlilik modeli yüklenemedi."));
    } finally {
      setLoading(false);
    }
  };

  const requestPreview = async (nextState: WorkbookState) => {
    const seq = ++previewSeqRef.current;
    setPreviewing(true);
    try {
      const data = await previewDenetimPlaniOnemlilikExcelModel(user.denetciId || 0, user.denetlenenId || 0, user.yil || 0, toPayload(nextState));
      if (seq !== previewSeqRef.current || !data) return;
      setPreviewWorkbook(data);
      setLoadError(null);
    } catch (error) {
      if (seq !== previewSeqRef.current) return;
      enqueueSnackbar(getErrorMessage(error, "Önizleme hesaplanamadı."), { variant: "error" });
    } finally {
      if (seq === previewSeqRef.current) setPreviewing(false);
    }
  };

  useEffect(() => {
    loadWorkbook();
    loadDocumentMeta();
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      if (stepLoadingTimerRef.current) clearTimeout(stepLoadingTimerRef.current);
      revokeBlobUrl(pdfBlobUrl);
    };
  }, []);

  useEffect(() => {
    if (!draftState || !savedWorkbook) return;
    if (JSON.stringify(toPayload(draftState)) === JSON.stringify(toPayload(buildState(savedWorkbook)))) {
      setPreviewWorkbook(savedWorkbook);
      setPreviewing(false);
      return;
    }
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(() => requestPreview(draftState), 350);
  }, [draftState, savedWorkbook]);

  const handleReset = async () => {
    setToolbarActionLoading("reset");
    try {
      const data = await resetDenetimPlaniOnemlilikExcelModel(user.denetciId || 0, user.denetlenenId || 0, user.yil || 0);
      if (!data) {
        enqueueSnackbar("Program varsayılanlarına dönülemedi.", { variant: "error" });
        return;
      }
      syncFromWorkbook(data);
      setActiveStep(0);
      enqueueSnackbar("Program varsayılanlarına dönüldü.", { variant: "success" });
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error, "Program varsayılanlarına dönülemedi."), { variant: "error" });
    } finally {
      setToolbarActionLoading(null);
    }
  };

  const handleRestorePrevious = async () => {
    if (savedWorkbook?.birOncekiHesaplamaVar !== true) return;
    setToolbarActionLoading("restore");
    try {
      const data = await restorePreviousDenetimPlaniOnemlilikExcelModel(user.denetciId || 0, user.denetlenenId || 0, user.yil || 0);
      if (!data) {
        enqueueSnackbar("Bir önceki hesaplama geri yüklenemedi.", { variant: "error" });
        return;
      }
      syncFromWorkbook(data);
      enqueueSnackbar("Bir önceki hesaplamaya dönüldü.", { variant: "success" });
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error, "Bir önceki hesaplama geri yüklenemedi."), { variant: "error" });
    } finally {
      setToolbarActionLoading(null);
    }
  };

  // --- Drawer Logic ---

  const openDrawerForRow = useCallback((rowIndex: number, activeField: "riskK" | "dogalRisk" | "kontrolRiski" = "riskK") => {
    const workbook = previewWorkbook ?? savedWorkbook;
    if (!workbook) return;

    // Determine which step we are in to get row data
    let rowData: any = null;
    if (activeStep === 2) rowData = workbook.hesapDagitimSatirlari[rowIndex];
    else if (activeStep === 3) rowData = workbook.denetimRiskiSatirlari[rowIndex];

    if (!rowData) return;

    const kebirKodu = rowData.kebirKodu;
    const draftRow = draftState?.hesaplar.find(x => x.kebirKodu === kebirKodu);

    setDrawerForm({
      rowIndex,
      kebirKodu,
      hesapAdi: rowData.hesapAdi,
      mizanTutari: rowData.mizanTutari,
      riskK: draftRow?.riskK ?? rowData.riskK,
      dogalRisk: draftRow?.dogalRisk ?? rowData.dogalRisk,
      kontrolRiski: draftRow?.kontrolRiski ?? rowData.kontrolRiski,
      nihaiOnemlilik: rowData.nihaiOnemlilik,
      yaklasim: rowData.onerilenYaklasim
    });
    setDrawerActiveField(activeField);
    setDrawerAiResult("");
    setDrawerAiPanelOpen(false);
    setEditorDrawerOpen(true);
  }, [previewWorkbook, savedWorkbook, activeStep, draftState]);

  useEffect(() => {
    setEditorPanelOpener(({ row, col }) => {
      // Logic to determine which field based on column
      let field: "riskK" | "dogalRisk" | "kontrolRiski" = "riskK";
      if (activeStep === 3) {
        if (col === 2) field = "dogalRisk";
        else if (col === 3) field = "kontrolRiski";
      }
      openDrawerForRow(row, field);
    });
    return () => setEditorPanelOpener(null);
  }, [openDrawerForRow, activeStep]);

  const stopDrawerRecording = useCallback(() => {
    if (drawerRecognitionRef.current) {
      try {
        drawerRecognitionRef.current.onend = null;
        drawerRecognitionRef.current.onerror = null;
        drawerRecognitionRef.current.abort();
      } catch {}
      drawerRecognitionRef.current = null;
    }
    setDrawerRecordingField(null);
  }, []);

  const startDrawerRecording = useCallback(async (field: "riskK" | "dogalRisk" | "kontrolRiski") => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      enqueueSnackbar("Tarayıcınız ses tanımayı desteklemiyor.", { variant: "error" });
      return;
    }
    if (drawerRecordingField === field) {
      stopDrawerRecording();
      return;
    }
    stopDrawerRecording();
    const rec: SpeechRecognitionInstance = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "tr-TR";
    setDrawerRecordingField(field);

    rec.onresult = (event: any) => {
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
      }
      if (final) {
        // Try to parse as number since these are numeric fields
        const cleaned = final.replace(/[^0-9,\.]/g, "").replace(",", ".");
        const val = parseFloat(cleaned);
        if (!isNaN(val)) setDrawerForm(prev => prev ? { ...prev, [field]: val } : prev);
      }
    };
    rec.onerror = () => stopDrawerRecording();
    rec.onend = () => stopDrawerRecording();
    drawerRecognitionRef.current = rec;
    try { rec.start(); } catch { stopDrawerRecording(); }
  }, [drawerRecordingField, stopDrawerRecording, enqueueSnackbar]);

  const handleDrawerApply = () => {
    if (!drawerForm || !draftState) return;
    const nextHesaplar = [...draftState.hesaplar];
    const idx = nextHesaplar.findIndex(x => x.kebirKodu === drawerForm.kebirKodu);
    if (idx > -1) {
      nextHesaplar[idx] = {
        ...nextHesaplar[idx],
        riskK: drawerForm.riskK,
        dogalRisk: drawerForm.dogalRisk,
        kontrolRiski: drawerForm.kontrolRiski
      };
      setDraftState({ ...draftState, hesaplar: nextHesaplar });
    }
    setEditorDrawerOpen(false);
    enqueueSnackbar("Değişiklikler tabloya uygulandı.", { variant: "success" });
  };

  const runDrawerAiPrompt = async (instruction: string) => {
    if (!drawerForm) return;
    const text = String(drawerForm[drawerActiveField]);
    setDrawerAiLoading(true);
    setDrawerAiPanelOpen(true);
    setDrawerAiResult("FasAI çalışıyor...");
    try {
      const result = await enhanceText(user, text, instruction);
      setDrawerAiResult(result);
    } catch {
      setDrawerAiResult("Hata oluştu.");
    } finally {
      setDrawerAiLoading(false);
    }
  };

  const applyDrawerAiResult = () => {
    if (!drawerAiResult || drawerAiResult.includes("...")) return;
    const cleaned = drawerAiResult.replace(/[^0-9,\.]/g, "").replace(",", ".");
    const val = parseFloat(cleaned);
    if (!isNaN(val)) setDrawerForm(prev => prev ? { ...prev, [drawerActiveField]: val } : prev);
    setDrawerAiResult("");
  };

  // --- Handson Columns & Data ---

  const m2Columns = useMemo(() => [
    { type: "text", readOnly: true, width: 60, renderer: islemRenderer }, // 0: Kebir
    { type: "text", readOnly: true, width: 220, renderer: islemRenderer }, // 1: Hesap Adı
    { type: "numeric", numericFormat: { pattern: "0,0.00" }, readOnly: true, width: 120, renderer: moneyRenderer }, // 2: Mizan
    { type: "dropdown", source: [1, 2, 3], width: 70, editor: "speech-text" }, // 3: Risk K
    { type: "numeric", numericFormat: { pattern: "0,0.00" }, readOnly: true, width: 120, renderer: moneyRenderer }, // 4: Nihai
    { type: "numeric", numericFormat: { pattern: "0,0.00" }, readOnly: true, width: 120, renderer: moneyRenderer }, // 5: PM
    { type: "text", readOnly: true, width: 100, renderer: riskRenderer } // 6: Risk Seviyesi
  ], []);

  const m2Data = useMemo(() => currentWorkbook?.hesapDagitimSatirlari.map(row => [
    row.kebirKodu,
    row.hesapAdi,
    row.mizanTutari,
    draftState?.hesaplar.find(x => x.kebirKodu === row.kebirKodu)?.riskK ?? row.riskK,
    row.nihaiOnemlilik,
    row.performansOnemliligi,
    row.riskSeviyesi
  ]) ?? [], [currentWorkbook, draftState]);

  const m3Columns = useMemo(() => [
    { type: "text", readOnly: true, width: 60, renderer: islemRenderer }, // 0: Kebir
    { type: "text", readOnly: true, width: 180, renderer: islemRenderer }, // 1: Hesap Adı
    { type: "numeric", numericFormat: { pattern: "0,0.0" }, width: 80, editor: "speech-text" }, // 2: Doğal Risk
    { type: "numeric", numericFormat: { pattern: "0,0.0" }, width: 80, editor: "speech-text" }, // 3: Kontrol Riski
    { type: "numeric", numericFormat: { pattern: "0.0%" }, readOnly: true, width: 80, renderer: percentRenderer }, // 4: OYR
    { type: "numeric", numericFormat: { pattern: "0.0%" }, readOnly: true, width: 80, renderer: percentRenderer }, // 5: TER
    { type: "text", readOnly: true, width: 100, renderer: islemRenderer }, // 6: Örnekleme %
    { type: "text", readOnly: true, width: 180, renderer: islemRenderer } // 7: Yaklaşım
  ], []);

  const m3Data = useMemo(() => currentWorkbook?.denetimRiskiSatirlari.map(row => {
    const draftRow = draftState?.hesaplar.find(x => x.kebirKodu === row.kebirKodu);
    return [
      row.kebirKodu,
      row.hesapAdi,
      draftRow?.dogalRisk ?? row.dogalRisk,
      draftRow?.kontrolRiski ?? row.kontrolRiski,
      row.oyr,
      row.ter,
      row.orneklemeYuzdesi,
      row.onerilenYaklasim
    ];
  }) ?? [], [currentWorkbook, draftState]);

  const handleM2Change = useCallback((changes: any[] | null, source: string) => {
    if (!changes || source === "loadData" || !draftState) return;
    const nextHesaplar = [...draftState.hesaplar];
    changes.forEach(([row, prop, oldVal, newVal]) => {
      if (prop === 3) { // Risk K
        const kebirKodu = m2Data[row][0];
        const idx = nextHesaplar.findIndex(x => x.kebirKodu === kebirKodu);
        if (idx > -1) nextHesaplar[idx] = { ...nextHesaplar[idx], riskK: Number(newVal) };
      }
    });
    setDraftState({ ...draftState, hesaplar: nextHesaplar });
  }, [draftState, m2Data]);

  const handleM3Change = useCallback((changes: any[] | null, source: string) => {
    if (!changes || source === "loadData" || !draftState) return;
    const nextHesaplar = [...draftState.hesaplar];
    changes.forEach(([row, prop, oldVal, newVal]) => {
      const kebirKodu = m3Data[row][0];
      const idx = nextHesaplar.findIndex(x => x.kebirKodu === kebirKodu);
      if (idx > -1) {
        if (prop === 2) nextHesaplar[idx] = { ...nextHesaplar[idx], dogalRisk: Number(newVal) };
        else if (prop === 3) nextHesaplar[idx] = { ...nextHesaplar[idx], kontrolRiski: Number(newVal) };
      }
    });
    setDraftState({ ...draftState, hesaplar: nextHesaplar });
  }, [draftState, m3Data]);

  // --- Downloads ---

  const handleExcelDownload = async () => {
    const workbook = previewWorkbook ?? savedWorkbook;
    if (!workbook) return;
    try {
      const { default: ExcelJS } = await import("exceljs");
      const excel = new ExcelJS.Workbook();
      const addObjectSheet = (name: string, rows: any[]) => {
        const ws = excel.addWorksheet(name);
        if (!rows.length) return;
        const headers = Object.keys(rows[0]);
        ws.addRow(headers);
        rows.forEach(r => ws.addRow(headers.map(h => r[h])));
      };
      addObjectSheet("Parametreler", Object.entries(workbook.parametreler).map(([alan, deger]) => ({ alan, deger })));
      addObjectSheet("Hesap Dagitim", workbook.hesapDagitimSatirlari);
      const buffer = await excel.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `Onemlilik_${user.yil}.xlsx`);
    } catch {}
  };

  const handleWordDownload = async () => enqueueSnackbar("Yakında eklenecek", { variant: "info" });
  const handleOpenPreview = async () => enqueueSnackbar("Yakında eklenecek", { variant: "info" });

  useImperativeHandle(ref, () => ({
    handleReset, handleRestorePrevious, handleOpenPreview, handleExcelDownload, handleWordDownload
  }));

  const handleBack = () => {
    setStepLoading(true);
    setTimeout(() => { setActiveStep(prev => prev - 1); setStepLoading(false); }, 450);
  };

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      setSaving(true);
      try {
        if (!draftState) throw new Error("Veri yok.");
        const data = await updateDenetimPlaniOnemlilikExcelModel(user.denetciId || 0, user.denetlenenId || 0, user.yil || 0, toPayload(draftState));
        if (!data) throw new Error("Hata.");
        syncFromWorkbook(data);
        enqueueSnackbar("Kaydedildi.", { variant: "success" });
      } catch { enqueueSnackbar("Hata.", { variant: "error" }); } finally { setSaving(false); }
      return;
    }
    setStepLoading(true);
    setTimeout(() => { setActiveStep(prev => prev + 1); setStepLoading(false); }, 450);
  };

  if (loading) return <Box sx={{ p: 6, textAlign: "center" }}><CircularProgress /><Typography>Yükleniyor...</Typography></Box>;

  return (
    <Box>
      <Backdrop open={saving} sx={{ zIndex: 9999, color: "#fff" }}><CircularProgress color="inherit" /></Backdrop>

      <Section title="Önemlilik ve Örneklem Hesaplama">
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>

        <Box sx={{ minHeight: "50vh", position: "relative" }}>
          {stepLoading && <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, background: "rgba(255,255,255,0.7)" }}><CircularProgress /></Box>}

          {activeStep === 0 && draftState && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <TextField fullWidth label="Firma Adı" value={draftState.parametreler.firmaAdi} onChange={e => setDraftState({ ...draftState, parametreler: { ...draftState.parametreler, firmaAdi: e.target.value } })} />
                  <TextField fullWidth label="Denetim Yılı" type="number" value={draftState.parametreler.denetimYili} onChange={e => setDraftState({ ...draftState, parametreler: { ...draftState.parametreler, denetimYili: Number(e.target.value) } })} />
                  <TextField fullWidth select label="Sektör Tipi" value={draftState.parametreler.sektorTipi} onChange={e => setDraftState({ ...draftState, parametreler: { ...draftState.parametreler, sektorTipi: e.target.value } })}>
                    {["Ticaret", "Uretim", "Diger"].map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                  </TextField>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <TextField fullWidth label="Vergi Öncesi Kar" value={money.format(draftState.parametreler.vergiOncesiKar)} onChange={e => setDraftState({ ...draftState, parametreler: { ...draftState.parametreler, vergiOncesiKar: parseDecimal(e.target.value) } })} />
                  <TextField fullWidth label="Net Satışlar" value={money.format(draftState.parametreler.netSatislar)} onChange={e => setDraftState({ ...draftState, parametreler: { ...draftState.parametreler, netSatislar: parseDecimal(e.target.value) } })} />
                  <TextField fullWidth label="Hedef Denetim Riski" type="number" value={draftState.parametreler.hedefDenetimRiski} onChange={e => setDraftState({ ...draftState, parametreler: { ...draftState.parametreler, hedefDenetimRiski: Number(e.target.value) } })} />
                </Stack>
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && currentWorkbook && (
            <Box>
              <Paper variant="outlined" sx={{ overflow: "hidden" }}>
                <Table size="small">
                  <TableHead><TableRow><TableCell>Kriter</TableCell><TableCell align="right">Tutar</TableCell><TableCell align="right">Oran %</TableCell><TableCell align="right">Onemlilik</TableCell></TableRow></TableHead>
                  <TableBody>
                    {currentWorkbook.genelOnemlilikSatirlari.map((row, idx) => (
                      <TableRow key={idx}><TableCell>{row.kriter}</TableCell><TableCell align="right">{formatMoney(row.tutar)}</TableCell><TableCell align="right">{plain.format(row.secilenOranYuzde)}</TableCell><TableCell align="right">{formatMoney(row.agirlikliOnemlilik)}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Paper sx={{ p: 2, flex: 1, bgcolor: "primary.50" }}><Typography variant="caption">M (GENEL)</Typography><Typography variant="h6">{formatMoney(currentWorkbook.ozet.genelOnemlilik)}</Typography></Paper>
                <Paper sx={{ p: 2, flex: 1, bgcolor: "success.50" }}><Typography variant="caption">PM (PERFORMANS)</Typography><Typography variant="h6">{formatMoney(currentWorkbook.ozet.performansOnemliligi)}</Typography></Paper>
              </Stack>
            </Box>
          )}

          {activeStep === 2 && currentWorkbook && (
            <Box sx={{ border: "1px solid #ddd", borderRadius: 1, overflow: "hidden" }}>
              <CalismaKagitiHotTable
                ref={hotM2Ref}
                data={m2Data}
                colHeaders={["Kebir", "Hesap Adı", "Mizan", "Risk K", "Nihai", "PM", "Seviye"]}
                columns={m2Columns}
                afterChange={handleM2Change}
                height="45vh"
                stretchH="last"
              />
            </Box>
          )}

          {activeStep === 3 && currentWorkbook && (
            <Box sx={{ border: "1px solid #ddd", borderRadius: 1, overflow: "hidden" }}>
              <CalismaKagitiHotTable
                ref={hotM3Ref}
                data={m3Data}
                colHeaders={["Kebir", "Hesap Adı", "Doğal R.", "Kontrol R.", "ÖYR", "TER", "Örnekleme %", "Yaklaşım"]}
                columns={m3Columns}
                afterChange={handleM3Change}
                height="45vh"
                stretchH="last"
              />
            </Box>
          )}
        </Box>

        <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
          <Stack direction="row" spacing={1}>
            <Button startIcon={<IconRotate size={18} />} onClick={() => setConfirmOpen(true)}>Sıfırla</Button>
            {savedWorkbook?.birOncekiHesaplamaVar && <Button startIcon={<IconHistory size={18} />} onClick={handleRestorePrevious}>Geri Yükle</Button>}
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button onClick={handleBack} disabled={activeStep === 0}>Geri</Button>
            <Button variant="contained" onClick={handleNext}>{activeStep === steps.length - 1 ? "Kaydet" : "İlerle"}</Button>
          </Stack>
        </Box>
      </Section>

      {/* Row Edit Drawer */}
      <Drawer anchor="right" open={editorDrawerOpen} onClose={() => setEditorDrawerOpen(false)} PaperProps={{ sx: { width: { xs: "100%", sm: 520, lg: 620 } } }}>
        <Box sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6" fontWeight={700}>Satır Düzenleme Paneli</Typography>
            <MuiIconButton onClick={() => setEditorDrawerOpen(false)}><CloseIcon /></MuiIconButton>
          </Stack>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>Hesap: {drawerForm?.kebirKodu} - {drawerForm?.hesapAdi}</Typography>
          <Divider sx={{ mb: 2 }} />

          <Tabs value={drawerActiveField} onChange={(_, v) => setDrawerActiveField(v)} sx={{ mb: 2 }}>
            <Tab label="Genel" value="riskK" />
            <Tab label="Denetim Riski" value="dogalRisk" />
          </Tabs>

          <Box sx={{ mb: 3 }}>
            {drawerActiveField === "riskK" && (
              <Stack spacing={2}>
                <Typography variant="subtitle2">Risk Katsayısı (K)</Typography>
                <TextField fullWidth select value={drawerForm?.riskK} onChange={e => setDrawerForm(prev => prev ? { ...prev, riskK: Number(e.target.value) } : prev)}>
                  <MenuItem value={1}>1 - Düşük</MenuItem>
                  <MenuItem value={2}>2 - Orta</MenuItem>
                  <MenuItem value={3}>3 - Yüksek</MenuItem>
                </TextField>
                <Typography variant="caption" color="textSecondary">Mizan Tutarı: {formatMoney(drawerForm?.mizanTutari)}</Typography>
                <Typography variant="caption" color="textSecondary">Nihai Önemlilik: {formatMoney(drawerForm?.nihaiOnemlilik)}</Typography>
              </Stack>
            )}

            {(drawerActiveField === "dogalRisk" || drawerActiveField === "kontrolRiski") && (
              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2">Doğal Risk (0.1 - 1.0)</Typography>
                    <Stack direction="row">
                      <MuiIconButton size="small" onClick={() => startDrawerRecording("dogalRisk")} color={drawerRecordingField === "dogalRisk" ? "error" : "default"}>
                        {drawerRecordingField === "dogalRisk" ? <StopCircleRoundedIcon /> : <KeyboardVoiceRoundedIcon />}
                      </MuiIconButton>
                      <MuiIconButton size="small" onClick={() => setDrawerAiPanelOpen(!drawerAiPanelOpen)}><AutoAwesomeRoundedIcon /></MuiIconButton>
                    </Stack>
                  </Stack>
                  <TextField fullWidth type="number" inputProps={{ step: 0.1 }} value={drawerForm?.dogalRisk} onChange={e => setDrawerForm(prev => prev ? { ...prev, dogalRisk: Number(e.target.value) } : prev)} />
                </Box>

                <Box>
                  <Typography variant="subtitle2">Kontrol Riski (0.1 - 1.0)</Typography>
                  <TextField fullWidth type="number" inputProps={{ step: 0.1 }} value={drawerForm?.kontrolRiski} onChange={e => setDrawerForm(prev => prev ? { ...prev, kontrolRiski: Number(e.target.value) } : prev)} />
                </Box>
                
                <Typography variant="caption" color="primary" fontWeight={700}>Önerilen Yaklaşım: {drawerForm?.yaklasim}</Typography>
              </Stack>
            )}
          </Box>

          {drawerAiPanelOpen && (
            <Paper sx={{ p: 2, bgcolor: "primary.50", mb: 3, border: "1px solid", borderColor: "primary.100" }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>FasAI Araçları</Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                {AI_PROMPTS.map(p => <Button key={p.label} size="small" variant="outlined" onClick={() => runDrawerAiPrompt(p.instruction)}>{p.label}</Button>)}
              </Stack>
              {drawerAiResult && (
                <Box sx={{ p: 1.5, bgcolor: "white", borderRadius: 1, border: "1px solid #eee" }}>
                  <Typography variant="body2">{drawerAiResult}</Typography>
                  <Button size="small" sx={{ mt: 1 }} onClick={applyDrawerAiResult} disabled={drawerAiLoading}>Uygula</Button>
                </Box>
              )}
            </Paper>
          )}

          <Stack direction="row" spacing={2} sx={{ mt: "auto" }}>
            <Button fullWidth variant="outlined" onClick={() => setEditorDrawerOpen(false)}>Kapat</Button>
            <Button fullWidth variant="contained" onClick={handleDrawerApply}>Tabloya Uygula</Button>
          </Stack>
        </Box>
      </Drawer>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Sıfırlama</DialogTitle>
        <DialogContent><Typography>Sıfırlamak istediğinize emin misiniz?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Vazgeç</Button>
          <Button onClick={() => { setConfirmOpen(false); handleReset(); }} color="error">Sıfırla</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

OnemlilikExcelStepper.displayName = "OnemlilikExcelStepper";
export default OnemlilikExcelStepper;
