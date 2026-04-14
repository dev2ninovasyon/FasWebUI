"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { IconHistory, IconRotate } from "@tabler/icons-react";
import { enqueueSnackbar } from "notistack";
import { saveAs } from "file-saver";
import axios from "axios";
import {
  getOnemlilikExcelModel,
  previewOnemlilikExcelModel,
  resetOnemlilikExcelModel,
  restorePreviousOnemlilikExcelModel,
  updateOnemlilikExcelModel,
} from "@/api/DenetimKanitlari/DenetimKanitlari";
import { getFormHazirlayanOnaylayanByDenetciDenetlenenYilFormKodu } from "@/api/CalismaKagitlari/CalismaKagitlari";
import { getMenus } from "@/api/Menu/Menu";
import { url } from "@/api/apiBase";
import { createAuthorizedAxiosConfig } from "@/utils/authSession";
import { getKullaniciByDenetlenenYilRol, getKullaniciById } from "@/api/Kullanici/KullaniciIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

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

type ChangedCellMap = Record<string, true>;

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

const Section = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <Paper sx={{ borderRadius: 3, border: "1px solid #dbe3f0", overflow: "hidden", boxShadow: "0 12px 28px rgba(15,23,42,.06)" }}>
    <Box sx={{ px: 3, py: 1.5, background: "#f8fafc", color: "#1e293b", borderBottom: "1px solid #e2e8f0", fontWeight: 800, fontSize: "1.1rem" }}>{title}</Box>
    {subtitle ? <Box sx={{ px: 3, py: 1.2, background: "#fffbeb", color: "#92400e", fontWeight: 700, fontSize: "0.85rem" }}>{subtitle}</Box> : null}
    <Box sx={{ p: 3 }}>{children}</Box>
  </Paper>
);

const tableScrollSx = {
  maxHeight: "42vh",
  overflow: "auto",
  border: "1px solid #dbe3f0",
  borderRadius: 2,
  backgroundColor: "#fff",
};

const FORM_KODU = "OnemlilikSeviyesiKayitlari";
const FORM_TITLE = "Önemlilik Seviyesi Belirleme ve Değerlendirme";
const FORM_URL = "/DenetimKanitlari/Onemlilik/OnemlilikSeviyesiBelirlemeVeDegerlendirme";

const getRiskLevelStyles = (value?: string | null) => {
  const risk = (value || "").toLowerCase();
  if (risk.includes("yüksek")) {
    return { backgroundColor: "#fff1f0", color: "#cf222e", fontWeight: 800 };
  }
  if (risk.includes("orta")) {
    return { backgroundColor: "#fff8e1", color: "#b45309", fontWeight: 800 };
  }
  return { backgroundColor: "#f0fdf4", color: "#166534", fontWeight: 800 };
};

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
  const [changedCells, setChangedCells] = useState<ChangedCellMap>({});
  const currentWorkbook = previewWorkbook ?? savedWorkbook;
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewSeqRef = useRef(0);
  const stepLoadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const changedCellsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousWorkbookRef = useRef<Workbook | null>(null);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return fallback;
  };

  const revokeBlobUrl = (value?: string | null) => {
    if (value && value.startsWith("blob:")) {
      window.URL.revokeObjectURL(value);
    }
  };

  const getChangedCellKey = (section: string, rowKey: string | number, field: string) => `${section}:${rowKey}:${field}`;

  const getChangedCellSx = (key: string, baseSx?: Record<string, any>) => ({
    ...(baseSx || {}),
    transition: "background-color .45s ease, box-shadow .45s ease",
    ...(changedCells[key]
      ? {
          backgroundColor: "#fff4a3",
          boxShadow: "inset 0 0 0 2px rgba(245, 158, 11, 0.45)",
        }
      : {}),
  });

  const formatDate = (value?: string | null) => {
    if (!value) {
      return "-";
    }

    const normalized = value.includes("T") ? value.split("T")[0] : value;
    const [year, month, day] = normalized.split("-");
    return year && month && day ? `${day}.${month}.${year}` : normalized;
  };

  const resolvePerson = async (id?: number | null, fallbackTip?: string) => {
    if (id) {
      const userData = await getKullaniciById(id);
      if (userData) {
        return {
          adSoyad: userData.personelAdi || userData.kullaniciAdi || "-",
          unvan: userData.unvan || "",
        };
      }
    }

    if (!fallbackTip) {
      return null;
    }

    const fallbackPeople = await getKullaniciByDenetlenenYilRol(user.denetlenenId || 0, user.yil || 0, fallbackTip);
    const fallbackUser = fallbackPeople?.[0];
    if (!fallbackUser) {
      return null;
    }

    return {
      adSoyad: fallbackUser.personelAdi || fallbackUser.kullaniciAdi || "-",
      unvan: fallbackUser.unvan || "",
    };
  };

  const loadDocumentMeta = async () => {
    try {
      const [formData, menus] = await Promise.all([
        getFormHazirlayanOnaylayanByDenetciDenetlenenYilFormKodu(
          user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0,
          FORM_KODU
        ),
        getMenus(),
      ]);

      const matchedMenu = menus.find(
        (menu) => menu.formKodu === FORM_KODU || menu.formUrl === FORM_URL
      );

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
      console.log("Belge meta bilgisi yüklenemedi", error);
      setDocumentMeta({
        referansNo: "",
        formKodu: FORM_KODU,
        belgeAdi: FORM_TITLE,
      });
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
      const data = await getOnemlilikExcelModel(user.denetciId || 0, user.denetlenenId || 0, user.yil || 0);
      if (!data) {
        throw new Error("Önemlilik modeli yüklenemedi.");
      }

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
      const data = await previewOnemlilikExcelModel(user.denetciId || 0, user.denetlenenId || 0, user.yil || 0, toPayload(nextState));
      if (seq !== previewSeqRef.current || !data) {
        return;
      }

      setPreviewWorkbook(data);
      setLoadError(null);
    } catch (error) {
      if (seq !== previewSeqRef.current) {
        return;
      }
      enqueueSnackbar(getErrorMessage(error, "Önizleme hesaplanamadı."), { variant: "error" });
    } finally {
      if (seq === previewSeqRef.current) {
        setPreviewing(false);
      }
    }
  };

  useEffect(() => {
    loadWorkbook();
    loadDocumentMeta();

    return () => {
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
      }
      if (stepLoadingTimerRef.current) {
        clearTimeout(stepLoadingTimerRef.current);
      }
      if (changedCellsTimerRef.current) {
        clearTimeout(changedCellsTimerRef.current);
      }
      revokeBlobUrl(pdfBlobUrl);
    };
  }, []);

  useEffect(() => {
    if (!currentWorkbook) {
      return;
    }

    const previousWorkbook = previousWorkbookRef.current;
    if (!previousWorkbook) {
      previousWorkbookRef.current = currentWorkbook;
      return;
    }

    const nextChangedCells: ChangedCellMap = {};

    previousWorkbook.hesapDagitimSatirlari.forEach((previousRow) => {
      const nextRow = currentWorkbook.hesapDagitimSatirlari.find((item) => item.kebirKodu === previousRow.kebirKodu);
      if (!nextRow) {
        return;
      }

      [
        "agirlikTutari",
        "agirlikOraniYuzde",
        "sabitPay",
        "kalanTutar",
        "dagitilanPay",
        "nihaiOnemlilik",
        "performansOnemliligi",
        "riskSeviyesi",
      ].forEach((field) => {
        if (String(previousRow[field] ?? "") !== String(nextRow[field] ?? "")) {
          nextChangedCells[getChangedCellKey("m2", nextRow.kebirKodu, field)] = true;
        }
      });
    });

    previousWorkbook.denetimRiskiSatirlari.forEach((previousRow) => {
      const nextRow = currentWorkbook.denetimRiskiSatirlari.find((item) => item.kebirKodu === previousRow.kebirKodu);
      if (!nextRow) {
        return;
      }

      ["oyr", "ter", "guvenDuzeyi", "orneklemeYuzdesi", "hesapOnemlilikTutari", "onerilenYaklasim"].forEach((field) => {
        if (String(previousRow[field] ?? "") !== String(nextRow[field] ?? "")) {
          nextChangedCells[getChangedCellKey("m3", nextRow.kebirKodu, field)] = true;
        }
      });
    });

    previousWorkbookRef.current = currentWorkbook;

    if (!Object.keys(nextChangedCells).length) {
      return;
    }

    setChangedCells(nextChangedCells);
    if (changedCellsTimerRef.current) {
      clearTimeout(changedCellsTimerRef.current);
    }
    changedCellsTimerRef.current = setTimeout(() => {
      setChangedCells({});
    }, 1800);
  }, [currentWorkbook]);

  useEffect(() => {
    if (!draftState || !savedWorkbook) {
      return;
    }

    if (JSON.stringify(toPayload(draftState)) === JSON.stringify(toPayload(buildState(savedWorkbook)))) {
      setPreviewWorkbook(savedWorkbook);
      setPreviewing(false);
      return;
    }

    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
    }

    previewTimerRef.current = setTimeout(() => {
      requestPreview(draftState);
    }, 350);
  }, [draftState, savedWorkbook]);

  const handleReset = async () => {
    setToolbarActionLoading("reset");
    try {
      const data = await resetOnemlilikExcelModel(user.denetciId || 0, user.denetlenenId || 0, user.yil || 0);
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
    if (savedWorkbook?.birOncekiHesaplamaVar !== true) {
      return;
    }

    setToolbarActionLoading("restore");
    try {
      const data = await restorePreviousOnemlilikExcelModel(user.denetciId || 0, user.denetlenenId || 0, user.yil || 0);
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

  const escapeHtml = (value: unknown) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;");

  const buildTableHtml = (title: string, headers: string[], rows: (string | number)[][], color: string) => `
    <section style="margin-top:24px;">
      <div style="background:${color};color:#fff;padding:10px 14px;font-weight:700;border-radius:8px 8px 0 0;">${escapeHtml(title)}</div>
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead>
          <tr>
            ${headers.map((header) => `<th style="border:1px solid #d6deef;padding:8px;background:#eef3fb;text-align:left;">${escapeHtml(header)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => `<tr>${row.map((cell) => `<td style="border:1px solid #d6deef;padding:8px;vertical-align:top;">${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </section>
  `;

  const buildHtmlAsync = async () => {
    const workbook = previewWorkbook ?? savedWorkbook;
    if (!workbook) {
      return "";
    }
    const meta = documentMeta ?? {
      referansNo: "",
      formKodu: FORM_KODU,
      belgeAdi: FORM_TITLE,
    };

    const paramRows = Object.entries(workbook.parametreler).map(([alan, deger]) => [
      alan,
      typeof deger === "number" ? formatMoney(deger) : String(deger ?? "-"),
    ]);

    const genelRows = workbook.genelOnemlilikSatirlari.map((row) => [
      row.kriter,
      formatMoney(row.tutar),
      plain.format(row.secilenOranYuzde),
      formatMoney(row.hamOnemlilik),
      plain.format(row.agirlikKatsayisi),
      formatMoney(row.agirlikliOnemlilik),
    ]);

    const dagitimRows = workbook.hesapDagitimSatirlari.map((row) => [
      row.kebirKodu,
      row.hesapAdi,
      formatMoney(row.mizanTutari),
      row.riskK,
      formatMoney(row.nihaiOnemlilik),
      formatMoney(row.performansOnemliligi),
      row.riskSeviyesi,
    ]);

    const riskRows = workbook.denetimRiskiSatirlari.map((row) => [
      row.kebirKodu,
      row.hesapAdi,
      plain.format(row.dogalRisk),
      plain.format(row.kontrolRiski),
      formatPercent(row.oyr, 100),
      formatPercent(row.ter, 100),
      row.orneklemeYuzdesi,
      row.onerilenYaklasim,
    ]);
    const approvalRows = [
      ["Hazırlayan", meta.hazirlayan],
      ["Onaylayan", meta.onaylayan],
      ["Kalite Kontrol", meta.kontrolEden],
    ] as const;

    return `
      <!doctype html>
      <html lang="tr">
      <head>
        <meta charset="utf-8" />
        <title>Önemlilik Seviyesi Belirleme ve Değerlendirme</title>
      </head>
      <body style="font-family:Calibri, Arial, sans-serif;color:#1f2937;padding:24px;">
        <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:18px;border-bottom:2px solid #d6deef;padding-bottom:14px;">
          <div style="font-size:12px;color:#475569;">
            <div><strong>Referans No:</strong> ${escapeHtml(meta.referansNo || "-")}</div>
            <div style="margin-top:4px;"><strong>Form Kodu:</strong> ${escapeHtml(meta.formKodu || FORM_KODU)}</div>
            <div style="margin-top:4px;"><strong>Belge:</strong> ${escapeHtml(meta.belgeAdi || FORM_TITLE)}</div>
            <div style="margin-top:4px;"><strong>Sayfa:</strong> 1 / 1</div>
          </div>
        </div>
        <h1 style="margin:0 0 6px;font-size:22px;color:#1f3a6d;">Önemlilik Seviyesi Belirleme ve Değerlendirme</h1>
        <div style="margin-bottom:18px;color:#475569;">Firma: ${escapeHtml(workbook.parametreler.firmaAdi)} | Yıl: ${escapeHtml(workbook.parametreler.denetimYili)}</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:8px;">
          ${[
            ["Genel Önemlilik", workbook.ozet.genelOnemlilik],
            ["Performans Önemliliği", workbook.ozet.performansOnemliligi],
            ["De Minimis", workbook.ozet.deMinimis],
            ["Hesap Sabit Pay", workbook.ozet.hesapSabitPayTutari],
          ].map(([label, value]) => `
            <div style="min-width:180px;border:1px solid #d6deef;border-radius:10px;padding:12px;background:#f8fbff;">
              <div style="font-size:12px;color:#475569;">${escapeHtml(label)}</div>
              <div style="font-size:18px;font-weight:700;color:#1f3a6d;">${escapeHtml(formatMoney(Number(value)))}</div>
            </div>
          `).join("")}
        </div>
        ${buildTableHtml("Parametre Özeti", ["Alan", "Değer"], paramRows, "#1f3a6d")}
        ${buildTableHtml("Genel Önemlilik", ["Kriter", "Tutar", "Seçilen Oran %", "Ham Önemlilik", "Ağırlık", "Ağırlıklı Önemlilik"], genelRows, "#c00000")}
        ${buildTableHtml("Hesap Dağıtım", ["Kebir", "Hesap Adı", "Mizan Tutarı", "Risk K", "Nihai Önemlilik", "PM", "Risk Seviyesi"], dagitimRows, "#c45d0a")}
        ${buildTableHtml("Denetim Riski", ["Kebir", "Hesap Adı", "Doğal Risk", "Kontrol Riski", "ÖYR", "TER", "Örnekleme %", "Yaklaşım"], riskRows, "#5b1c9d")}
        <section style="margin-top:28px;border:1px solid #d6deef;border-radius:10px;overflow:hidden;">
          <div style="background:#1f3a6d;color:#fff;padding:10px 14px;font-weight:700;">Belge Onay Bilgileri</div>
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <thead>
              <tr>
                ${["Rol", "Ad Soyad", "Unvan", "Tarih"].map((header) => `<th style="border:1px solid #d6deef;padding:8px;background:#eef3fb;text-align:left;">${escapeHtml(header)}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${approvalRows.map(([label, person]) => `
                <tr>
                  <td style="border:1px solid #d6deef;padding:8px;font-weight:700;">${escapeHtml(label)}</td>
                  <td style="border:1px solid #d6deef;padding:8px;">${escapeHtml(person?.adSoyad || "-")}</td>
                  <td style="border:1px solid #d6deef;padding:8px;">${escapeHtml(person?.unvan || "-")}</td>
                  <td style="border:1px solid #d6deef;padding:8px;">${escapeHtml(formatDate(person?.tarih))}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </section>      </body>
      </html>
    `;
  };

  const handleOpenPreview = async () => {
    try {
      const html = await buildHtmlAsync();
      const response = await axios.post(
        "/ArsivIslemleri/PreviewFromHtml",
        {
          denetciId: user.denetciId,
          yil: user.yil,
          denetlenenId: user.denetlenenId,
          title: "OnemlilikSeviyesiBelirlemeVeDegerlendirme",
          html,
          save: true,
        },
        createAuthorizedAxiosConfig(
          {
            baseURL: url,
            headers: { "Content-Type": "application/json" },
            responseType: "blob",
          },
          user.token
        )
      );

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const nextPdfUrl = window.URL.createObjectURL(pdfBlob);
      setPdfBlobUrl((prev) => {
        revokeBlobUrl(prev);
        return nextPdfUrl;
      });
      setPdfPreviewOpen(true);
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error, "PDF önizleme oluşturulamadı."), { variant: "error" });
    }
  };

  const handleExcelDownload = async () => {
    const workbook = previewWorkbook ?? savedWorkbook;
    if (!workbook) {
      enqueueSnackbar("İndirilecek önizleme verisi bulunamadı.", { variant: "warning" });
      return;
    }

    try {
      const { default: ExcelJS } = await import("exceljs");
      const excel = new ExcelJS.Workbook();
      excel.creator = "FAS Denetim";
      excel.created = new Date();

      const toSheetRows = (rows: Row[]) =>
        rows.map((row) =>
          Object.fromEntries(
            Object.entries(row).map(([key, value]) => [key, value ?? ""])
          )
        );

      const addObjectSheet = (sheetName: string, rows: Record<string, any>[]) => {
        const worksheet = excel.addWorksheet(sheetName);
        if (!rows.length) {
          worksheet.addRow(["Veri bulunamadı"]);
          return;
        }

        const headers = Object.keys(rows[0]);
        worksheet.addRow(headers);
        rows.forEach((row) => worksheet.addRow(headers.map((header) => row[header])));
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
        headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F3A6D" } };
        worksheet.views = [{ state: "frozen", ySplit: 1 }];
        worksheet.columns = headers.map((header) => ({
          key: header,
          width: Math.min(Math.max(header.length + 6, 16), 34),
        }));
      };

      addObjectSheet("Parametreler", Object.entries(workbook.parametreler).map(([alan, deger]) => ({ alan, deger })));
      addObjectSheet("Finansal Veriler", toSheetRows(workbook.finansalVeriler));
      addObjectSheet("Genel Onemlilik", toSheetRows(workbook.genelOnemlilikSatirlari));
      addObjectSheet("Ozet", [workbook.ozet]);
      addObjectSheet("Hesap Dagitim", toSheetRows(workbook.hesapDagitimSatirlari));
      addObjectSheet("Denetim Riski", toSheetRows(workbook.denetimRiskiSatirlari));

      const buffer = await excel.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `OnemlilikSeviyesiBelirleme_${user.yil || "rapor"}.xlsx`);
      enqueueSnackbar("Excel dosyası indirildi.", { variant: "success" });
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error, "Excel dosyası oluşturulamadı."), { variant: "error" });
    }
  };

  const handleWordDownload = async () => {
    try {
      const html = await buildHtmlAsync();
      const response = await axios.post(
        "/ArsivIslemleri/WordDosyasiIndirHtml",
        {
          denetciId: user.denetciId,
          yil: user.yil,
          denetlenenId: user.denetlenenId,
          title: "OnemlilikSeviyesiBelirlemeVeDegerlendirme",
          html,
          save: true,
        },
        createAuthorizedAxiosConfig(
          {
            baseURL: url,
            headers: { "Content-Type": "application/json" },
            responseType: "blob",
          },
          user.token
        )
      );

      const urlFile = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = urlFile;
      link.setAttribute("download", `OnemlilikSeviyesiBelirleme_${user.yil || "rapor"}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(urlFile), 0);
      enqueueSnackbar("Word dosyası indirildi.", { variant: "success" });
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error, "Word dosyası oluşturulamadı."), { variant: "error" });
    }
  };

  useImperativeHandle(ref, () => ({
    handleReset,
    handleRestorePrevious,
    handleOpenPreview,
    handleExcelDownload,
    handleWordDownload,
  }));

  const updateParam = (key: keyof Parametreler, value: any) => {
    setDraftState((prev) => (prev ? { ...prev, parametreler: { ...prev.parametreler, [key]: value } } : prev));
  };

  const updateHesap = (kebirKodu: number, patch: Partial<HesapGirdi>) => {
    setDraftState((prev) =>
      prev
        ? {
            ...prev,
            hesaplar: prev.hesaplar.map((item) => (item.kebirKodu === kebirKodu ? { ...item, ...patch } : item)),
          }
        : prev,
    );
  };

  const hesapMap = useMemo(() => new Map(draftState?.hesaplar.map((item) => [item.kebirKodu, item]) ?? []), [draftState]);

  const hasPendingChanges = useMemo(() => {
    if (!draftState || !savedWorkbook) {
      return false;
    }

    return JSON.stringify(toPayload(draftState)) !== JSON.stringify(toPayload(buildState(savedWorkbook)));
  }, [draftState, savedWorkbook]);
  const hasPreviousCalculation = savedWorkbook?.birOncekiHesaplamaVar === true;

  const calculationInProgress = previewing || saving;

  const changeStep = (nextStep: number) => {
    if (nextStep === activeStep) {
      return;
    }

    if (stepLoadingTimerRef.current) {
      clearTimeout(stepLoadingTimerRef.current);
    }

    setToolbarActionLoading(nextStep > activeStep ? "next" : "back");
    setStepLoading(true);
    setActiveStep(nextStep);

    stepLoadingTimerRef.current = setTimeout(() => {
      setStepLoading(false);
      setToolbarActionLoading(null);
    }, 350);
  };

  const diffSummary = useMemo(() => {
    if (!savedWorkbook || !currentWorkbook) {
      return [];
    }

    return [
      ["Genel Önemlilik", savedWorkbook.ozet.genelOnemlilik, currentWorkbook.ozet.genelOnemlilik],
      ["Performans Önemliliği", savedWorkbook.ozet.performansOnemliligi, currentWorkbook.ozet.performansOnemliligi],
      ["De Minimis", savedWorkbook.ozet.deMinimis, currentWorkbook.ozet.deMinimis],
      ["Hesap Sabit Pay", savedWorkbook.ozet.hesapSabitPayTutari, currentWorkbook.ozet.hesapSabitPayTutari],
    ].filter((item) => Number(item[1]) !== Number(item[2]));
  }, [savedWorkbook, currentWorkbook]);

  const confirmSave = async () => {
    if (!draftState) {
      return;
    }

    setSaving(true);
    try {
      const data = await updateOnemlilikExcelModel(user.denetciId || 0, user.denetlenenId || 0, user.yil || 0, toPayload(draftState));
      if (!data) {
        enqueueSnackbar("Önemlilik modeli kaydedilemedi.", { variant: "error" });
        return;
      }

      syncFromWorkbook(data);
      setConfirmOpen(false);
      enqueueSnackbar("Önemlilik modeli kaydedildi.", { variant: "success" });
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error, "Önemlilik modeli kaydedilemedi."), { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const openConfirm = () => {
    if (!hasPendingChanges) {
      enqueueSnackbar("Kaydedilecek yeni bir hesaplama değişikliği yok.", { variant: "info" });
      return;
    }

    setConfirmOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadError || !currentWorkbook || !draftState) {
    return (
      <Alert
        severity="warning"
        sx={{ borderRadius: 3 }}
        action={<Button color="inherit" size="small" onClick={loadWorkbook}>Tekrar Dene</Button>}
      >
        {loadError ?? "Önemlilik modeli yüklenemedi."}
      </Alert>
    );
  }

  const oranOverrideMap: Record<string, keyof Parametreler> = {
    "Vergi Oncesi Kar": "vokOraniYuzdeOverride",
    "Net Satislar": "netSatisOraniYuzdeOverride",
    "Ozkaynak Toplami": "ozkaynakOraniYuzdeOverride",
    "Toplam Varliklar": "toplamVarlikOraniYuzdeOverride",
  };

  const finansalKeyMap: Record<string, keyof Parametreler> = {
    VOK: "vergiOncesiKar",
    SAT: "netSatislar",
    OZK: "ozkaynakToplami",
    VAR: "toplamVarliklar",
  };

  const p0 = (
      <Stack spacing={3}>
        <TableContainer sx={{ ...tableScrollSx, maxHeight: "32vh" }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ background: "#f8fafc", color: "#475569", fontWeight: 800 }}>Alan</TableCell>
                <TableCell sx={{ background: "#f8fafc", color: "#475569", fontWeight: 800 }}>Değer</TableCell>
                <TableCell sx={{ background: "#f8fafc", color: "#475569", fontWeight: 800 }}>Not</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Firma Adı</TableCell>
                <TableCell><TextField fullWidth variant="standard" value={draftState.parametreler.firmaAdi} onChange={(e) => updateParam("firmaAdi", e.target.value)} /></TableCell>
                <TableCell>Şirket kartı veya kullanıcı girişi</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Denetim Yılı</TableCell>
                <TableCell><TextField fullWidth variant="standard" type="number" value={draftState.parametreler.denetimYili} onChange={(e) => updateParam("denetimYili", Number(e.target.value || 1))} /></TableCell>
                <TableCell>1 = ilk yıl, 2-4 = devam, 5+ = uzun vadeli</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Sektör Tipi</TableCell>
                <TableCell>
                  <TextField select fullWidth variant="standard" value={draftState.parametreler.sektorTipi} onChange={(e) => updateParam("sektorTipi", e.target.value)}>
                    <MenuItem value="Uretim">Üretim</MenuItem>
                    <MenuItem value="Ticaret">Ticaret</MenuItem>
                    <MenuItem value="Diger">Diğer</MenuItem>
                  </TextField>
                </TableCell>
                <TableCell>Ağırlık matrisi seçimi</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Raporlama Dönemi</TableCell>
                <TableCell><TextField fullWidth variant="standard" value={draftState.parametreler.raporlamaDonemi} onChange={(e) => updateParam("raporlamaDonemi", e.target.value)} /></TableCell>
                <TableCell>Örn: 31.12.2024</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Hedef Denetim Riski</TableCell>
                <TableCell><TextField fullWidth variant="standard" value={formatPercent(draftState.parametreler.hedefDenetimRiski, 100)} onChange={(e) => updateParam("hedefDenetimRiski", parseDecimal(e.target.value) / 100)} /></TableCell>
                <TableCell>Genellikle %5</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <TableContainer sx={{ ...tableScrollSx, maxHeight: "30vh" }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {["#", "Kod", "Hesaplama Bazı", "Tutar (TL)", "Mizan Kaynağı", "Notlar"].map((title) => (
                  <TableCell key={title} sx={{ background: "#f8fafc", color: "#475569", fontWeight: 800 }}>{title}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {currentWorkbook.finansalVeriler.map((row) => {
                const key = finansalKeyMap[row.kod as keyof typeof finansalKeyMap];
                return (
                  <TableRow key={row.kod}>
                    <TableCell>{row.siraNo}</TableCell>
                    <TableCell>{row.kod}</TableCell>
                    <TableCell>{row.hesaplamaBazi}</TableCell>
                    <TableCell>
                      <TextField fullWidth variant="standard" value={formatMoney(draftState.parametreler[key] as number)} onChange={(e) => updateParam(key, parseDecimal(e.target.value))} />
                    </TableCell>
                    <TableCell>{row.mizanKaynagi}</TableCell>
                    <TableCell>{row.notlar}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
  );

  const m1 = (
    <Stack spacing={3}>
      <Section title="BÖLÜM 2: GENEL ÖNEMLİLİK (M)" subtitle="Seçilen oran veya önceki parametreler değiştiğinde sonuçlar anlık güncellenir.">
        <TableContainer sx={{ ...tableScrollSx, maxHeight: "42vh" }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {["#", "Kriter", "Tutar", "Seçilen Oran %", "Ham Önemlilik", "Ağırlık", "Ağırlıklı Önemlilik"].map((title) => (
                  <TableCell key={title} sx={{ background: "#f8fafc", color: "#475569", fontWeight: 800 }}>{title}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {currentWorkbook.genelOnemlilikSatirlari.map((row) => {
                const overrideKey = oranOverrideMap[row.kriter];
                return (
                  <TableRow key={row.siraNo}>
                    <TableCell>{row.siraNo}</TableCell>
                    <TableCell>{row.kriter}</TableCell>
                    <TableCell>{formatMoney(row.tutar)}</TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        variant="standard"
                        value={plain.format((draftState.parametreler[overrideKey] as number | null | undefined) ?? row.secilenOranYuzde)}
                        onChange={(e) => updateParam(overrideKey, parseDecimal(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>{formatMoney(row.hamOnemlilik)}</TableCell>
                    <TableCell>{plain.format(row.agirlikKatsayisi)}</TableCell>
                    <TableCell>{formatMoney(row.agirlikliOnemlilik)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Section>

      <Section title="BÖLÜM 3: PERFORMANS ÖNEMLİLİĞİ VE HATA SINIRI">
        <Grid container spacing={2}>
          {[
            ["Genel Önemlilik (M)", currentWorkbook.ozet.genelOnemlilik],
            ["Performans Önemliliği", currentWorkbook.ozet.performansOnemliligi],
            ["De Minimis", currentWorkbook.ozet.deMinimis],
            ["Hesap Sabit Pay", currentWorkbook.ozet.hesapSabitPayTutari],
            ["Kalan Dağıtılabilir", currentWorkbook.ozet.kalanDagitilabilirTutar],
          ].map(([label, value]) => (
            <Grid key={String(label)} size={{ xs: 12, md: 4 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{String(label)}</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{formatMoney(Number(value))}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Section>
    </Stack>
  );

  const m2 = (
    <Section title="BÖLÜM 4: HESAP BAZINDA ÖNEMLİLİK DAĞITIMI" subtitle="Risk K veya mizan değiştiğinde ilgili satır ve toplamlar anlık güncellenir.">
      <TableContainer sx={{ ...tableScrollSx, maxHeight: "52vh" }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {["Kebir", "Hesap Adı", "Mizan Tutarı", "Risk K", "Ağırlık", "Ağırlık %", "Sabit Pay", "Kalan", "Dağıtılan Pay", "Nihai Önemlilik", "PM", "Risk Seviyesi"].map((title) => (
                <TableCell key={title} sx={{ background: "#f8fafc", color: "#475569", fontWeight: 800 }}>{title}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {currentWorkbook.hesapDagitimSatirlari.map((row) => {
              const editable = hesapMap.get(row.kebirKodu);
              return (
                <TableRow key={row.kebirKodu}>
                  <TableCell>{row.kebirKodu}</TableCell>
                  <TableCell>{row.hesapAdi}</TableCell>
                  <TableCell>
                    <TextField fullWidth variant="standard" value={formatMoney(editable?.mizanTutari ?? row.mizanTutari)} onChange={(e) => updateHesap(row.kebirKodu, { mizanTutari: parseDecimal(e.target.value) })} />
                  </TableCell>
                  <TableCell>
                    <TextField select fullWidth variant="standard" value={editable?.riskK ?? row.riskK} onChange={(e) => updateHesap(row.kebirKodu, { riskK: Number(e.target.value) })}>
                      <MenuItem value={1}>1</MenuItem>
                      <MenuItem value={2}>2</MenuItem>
                      <MenuItem value={3}>3</MenuItem>
                    </TextField>
                  </TableCell>
                  <TableCell sx={getChangedCellSx(getChangedCellKey("m2", row.kebirKodu, "agirlikTutari"))}>{formatMoney(row.agirlikTutari)}</TableCell>
                  <TableCell sx={getChangedCellSx(getChangedCellKey("m2", row.kebirKodu, "agirlikOraniYuzde"))}>{formatPercent(row.agirlikOraniYuzde)}</TableCell>
                  <TableCell sx={getChangedCellSx(getChangedCellKey("m2", row.kebirKodu, "sabitPay"))}>{formatMoney(row.sabitPay)}</TableCell>
                  <TableCell sx={getChangedCellSx(getChangedCellKey("m2", row.kebirKodu, "kalanTutar"))}>{formatMoney(row.kalanTutar)}</TableCell>
                  <TableCell sx={getChangedCellSx(getChangedCellKey("m2", row.kebirKodu, "dagitilanPay"))}>{formatMoney(row.dagitilanPay)}</TableCell>
                  <TableCell sx={getChangedCellSx(getChangedCellKey("m2", row.kebirKodu, "nihaiOnemlilik"))}>{formatMoney(row.nihaiOnemlilik)}</TableCell>
                  <TableCell sx={getChangedCellSx(getChangedCellKey("m2", row.kebirKodu, "performansOnemliligi"))}>{formatMoney(row.performansOnemliligi)}</TableCell>
                  <TableCell sx={getChangedCellSx(getChangedCellKey("m2", row.kebirKodu, "riskSeviyesi"), getRiskLevelStyles(row.riskSeviyesi))}>{row.riskSeviyesi}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Section>
  );

  const m3 = (
    <Section title="DENETİM RİSKİ MODELİ" subtitle="Doğal risk ve kontrol riski değiştiğinde önerilen yaklaşım anlık güncellenir.">
      <Stack spacing={3}>
        <TableContainer sx={{ ...tableScrollSx, maxHeight: "26vh" }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {["#", "Kavram", "Simge", "Formül", "Değer", "Açıklama"].map((title) => (
                  <TableCell key={title} sx={{ background: "#f8fafc", color: "#475569", fontWeight: 800 }}>{title}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {currentWorkbook.denetimRiskiModelTanimlari.map((row) => (
                <TableRow key={row.siraNo}>
                  <TableCell>{row.siraNo}</TableCell>
                  <TableCell>{row.kavram}</TableCell>
                  <TableCell>{row.simge}</TableCell>
                  <TableCell>{row.formul}</TableCell>
                  <TableCell>{row.deger != null ? formatPercent(row.deger, 100) : "-"}</TableCell>
                  <TableCell>{row.aciklama}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TableContainer sx={{ ...tableScrollSx, maxHeight: "48vh" }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {["Kebir", "Hesap Adı", "Doğal Risk", "Kontrol Riski", "ÖYR", "TER", "Güven Düzeyi", "Örnekleme %", "Nihai Önemlilik", "Denetim Yaklaşımı"].map((title) => (
                  <TableCell key={title} sx={{ background: "#f8fafc", color: "#475569", fontWeight: 800 }}>{title}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {currentWorkbook.denetimRiskiSatirlari.map((row) => {
                const editable = hesapMap.get(row.kebirKodu);
                return (
                  <TableRow key={row.kebirKodu}>
                    <TableCell>{row.kebirKodu}</TableCell>
                    <TableCell>{row.hesapAdi}</TableCell>
                    <TableCell>
                      <TextField fullWidth variant="standard" value={plain.format(editable?.dogalRisk ?? row.dogalRisk)} onChange={(e) => updateHesap(row.kebirKodu, { dogalRisk: parseDecimal(e.target.value) })} />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth variant="standard" value={plain.format(editable?.kontrolRiski ?? row.kontrolRiski)} onChange={(e) => updateHesap(row.kebirKodu, { kontrolRiski: parseDecimal(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={getChangedCellSx(getChangedCellKey("m3", row.kebirKodu, "oyr"))}>{formatPercent(row.oyr, 100)}</TableCell>
                    <TableCell sx={getChangedCellSx(getChangedCellKey("m3", row.kebirKodu, "ter"))}>{formatPercent(row.ter, 100)}</TableCell>
                    <TableCell sx={getChangedCellSx(getChangedCellKey("m3", row.kebirKodu, "guvenDuzeyi"))}>{formatPercent(row.guvenDuzeyi, 100)}</TableCell>
                    <TableCell sx={getChangedCellSx(getChangedCellKey("m3", row.kebirKodu, "orneklemeYuzdesi"))}>{row.orneklemeYuzdesi}</TableCell>
                    <TableCell sx={getChangedCellSx(getChangedCellKey("m3", row.kebirKodu, "hesapOnemlilikTutari"))}>{formatMoney(row.hesapOnemlilikTutari)}</TableCell>
                    <TableCell sx={getChangedCellSx(getChangedCellKey("m3", row.kebirKodu, "onerilenYaklasim"))}>{row.onerilenYaklasim}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Section>
  );

  return (
    <Box sx={{ fontFamily: "'Plus Jakarta Sans', Helvetica, Arial, sans-serif" }}>
      <Backdrop
        open={calculationInProgress || stepLoading}
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 20,
          backgroundColor: "rgba(15, 23, 42, 0.36)",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress color="inherit" />
        <Paper
          elevation={0}
          sx={{
            px: 3,
            py: 2,
            borderRadius: 3,
            textAlign: "center",
            minWidth: { xs: 280, sm: 360 },
            maxWidth: "90vw",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#1f3a6d", mb: 0.5 }}>
            {stepLoading ? "Adım yükleniyor" : saving ? "Hesaplama kaydediliyor" : "Hesaplama yapiliyor"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#475569" }}>
            {stepLoading
              ? "Seçilen bölüm hazırlanıyor. Lütfen bekleyin."
              : saving
              ? "Önemlilik seviyeleri yeniden hesaplanıp kaydediliyor. Lütfen bekleyin."
              : "Girdiğiniz değerlere göre önizleme hesaplanıyor. Sonuçlar birazdan güncellenecek."}
          </Typography>
        </Paper>
      </Backdrop>
      {previewing ? <Alert severity="info" sx={{ mb: 2, borderRadius: 3 }}>Değişiklikler hesaplanıyor...</Alert> : null}

      <Paper
        sx={{
          borderRadius: 3,
          border: "1px solid #dbe3f0",
          overflow: "hidden",
          mb: 3,
          background: "linear-gradient(180deg,#f8fbff 0%,#eef5ff 100%)",
          position: "sticky",
          top: { xs: 8, md: 12 },
          zIndex: 11,
        }}
      >
        <Stepper activeStep={activeStep} alternativeLabel sx={{ p: 3 }}>
          {steps.map((label, index) => (
            <Step
              key={label}
              onClick={() => changeStep(index)}
              sx={{
                cursor: "pointer",
                "& .MuiStepLabel-root": {
                  borderRadius: 2,
                  transition: "all .18s ease",
                },
                "& .MuiStepLabel-label": {
                  transition: "color .18s ease, transform .18s ease",
                },
                "&:hover .MuiStepLabel-root": {
                  backgroundColor: index === activeStep ? "rgba(25, 118, 210, 0.08)" : "rgba(36, 63, 112, 0.06)",
                },
                "&:hover .MuiStepLabel-label": {
                  color: "#1f3a6d",
                  transform: "translateY(-1px)",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                },
                "&:hover .MuiStepIcon-root": {
                  transform: "scale(1.05)",
                },
              }}
            >
              <StepLabel
                sx={{
                  cursor: "pointer",
                  px: 1,
                  py: 0.5,
                  "& .MuiStepLabel-label": {
                    fontWeight: index === activeStep ? 800 : 600,
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Stack spacing={3}>{[p0, m1, m2, m3][activeStep]}</Stack>

      <Paper sx={{ borderRadius: 3, border: "1px solid #dbe3f0", boxShadow: "0 12px 28px rgba(15,23,42,.06)", position: "sticky", bottom: 16, mt: 3, p: 2, zIndex: 10 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="outlined"
              disabled={activeStep === 0 || stepLoading}
              onClick={() => changeStep(activeStep - 1)}
              startIcon={toolbarActionLoading === "back" ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {toolbarActionLoading === "back" ? "Yükleniyor..." : "Geri"}
            </Button>
            <Button
              variant="outlined"
              disabled={activeStep === steps.length - 1 || stepLoading}
              onClick={() => changeStep(activeStep + 1)}
              startIcon={toolbarActionLoading === "next" ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {toolbarActionLoading === "next" ? "Yükleniyor..." : "İleri"}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={toolbarActionLoading === "restore" ? <CircularProgress size={16} color="inherit" /> : <IconHistory size={18} />}
              onClick={handleRestorePrevious}
              disabled={!hasPreviousCalculation || toolbarActionLoading !== null}
            >
              {toolbarActionLoading === "restore" ? "Yükleniyor..." : "Bir Önceki Hesaplamaya Dön"}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={toolbarActionLoading === "reset" ? <CircularProgress size={16} color="inherit" /> : <IconRotate size={18} />}
              onClick={handleReset}
              disabled={toolbarActionLoading !== null || saving}
            >
              {toolbarActionLoading === "reset" ? "Yükleniyor..." : "Program Varsayılanına Dön"}
            </Button>
          </Stack>
          <Button variant="contained" onClick={openConfirm} disabled={saving || previewing || !hasPendingChanges} startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}>
            {saving ? "Kaydediliyor..." : "Kaydet ve Hesapla"}
          </Button>
        </Stack>
      </Paper>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Hesaplama Sonuçları Değişecek</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="body2">
              Bu işlem kaydedildiğinde yeni hesaplama sonuçları kalıcı olacaktır. Onaylamadan önce özet değişiklikleri kontrol et.
            </Typography>
            {diffSummary.length === 0 ? (
              <Typography variant="body2">Özet toplamlar değişmedi, ancak satır bazlı alanlarda değişiklik var.</Typography>
            ) : (
              diffSummary.map(([label, oldValue, newValue]) => (
                <Paper key={String(label)} variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{String(label)}</Typography>
                  <Typography variant="body2">Önceki: {formatMoney(Number(oldValue))}</Typography>
                  <Typography variant="body2">Yeni: {formatMoney(Number(newValue))}</Typography>
                </Paper>
              ))
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={confirmSave} disabled={saving}>Onayla ve Kaydet</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={pdfPreviewOpen && Boolean(pdfBlobUrl)}
        onClose={() => {
          setPdfPreviewOpen(false);
          revokeBlobUrl(pdfBlobUrl);
          setPdfBlobUrl("");
        }}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            width: "min(1200px, 96vw)",
            height: "90vh",
            maxWidth: "none",
          },
        }}
      >
        <DialogTitle>PDF Önizleme</DialogTitle>
        <DialogContent dividers sx={{ p: 0, overflow: "hidden" }}>
          {pdfBlobUrl ? (
            <Box
              component="iframe"
              src={`${pdfBlobUrl}#navpanes=0`}
              title="Önemlilik PDF Önizleme"
              sx={{ width: "100%", height: "100%", minHeight: "78vh", border: 0 }}
            />
          ) : (
            <Stack alignItems="center" justifyContent="center" sx={{ minHeight: "50vh" }}>
              <CircularProgress />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setPdfPreviewOpen(false);
              revokeBlobUrl(pdfBlobUrl);
              setPdfBlobUrl("");
            }}
          >
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default OnemlilikExcelStepper;




