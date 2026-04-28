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
  getDenetimPlaniOnemlilikExcelModel,
  previewDenetimPlaniOnemlilikExcelModel,
  resetDenetimPlaniOnemlilikExcelModel,
  restorePreviousDenetimPlaniOnemlilikExcelModel,
  updateDenetimPlaniOnemlilikExcelModel,
} from "@/api/PlanVeProgram/DenetimPlaniOnemlilik";
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
  parametreler: workbook.parametreler || {},
  hesaplar: (workbook.hesapDagitimSatirlari || []).map((item) => {
    const risk = (workbook.denetimRiskiSatirlari || []).find((x) => x.kebirKodu === item.kebirKodu);
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
  const [changedCells, setChangedCells] = useState<ChangedCellMap>({});
  
  const currentWorkbook = previewWorkbook ?? savedWorkbook;
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewSeqRef = useRef(0);
  const previousWorkbookRef = useRef<Workbook | null>(null);
  const changedCellsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useImperativeHandle(ref, () => ({
    handleReset,
    handleRestorePrevious,
    handleOpenPreview: async () => {},
    handleExcelDownload: async () => {},
    handleWordDownload: async () => {},
  }));

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
    } catch {
      setLoadError("Önemlilik modeli yüklenemedi.");
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
    } catch {
      if (seq === previewSeqRef.current) enqueueSnackbar("Hesaplama yapılamadı.", { variant: "error" });
    } finally {
      if (seq === previewSeqRef.current) setPreviewing(false);
    }
  };

  useEffect(() => { loadWorkbook(); }, []);

  useEffect(() => {
    if (!currentWorkbook) return;
    const previousWorkbook = previousWorkbookRef.current;
    if (!previousWorkbook) { previousWorkbookRef.current = currentWorkbook; return; }
    const nextChangedCells: ChangedCellMap = {};
    const getCellKey = (sec: string, k: any, f: string) => `${sec}:${k}:${f}`;
    currentWorkbook.hesapDagitimSatirlari.forEach((row) => {
      const prev = previousWorkbook.hesapDagitimSatirlari.find(x => x.kebirKodu === row.kebirKodu);
      if (!prev) return;
      ["nihaiOnemlilik", "performansOnemliligi", "riskSeviyesi"].forEach(f => {
        if (String(row[f] ?? "") !== String(prev[f] ?? "")) nextChangedCells[getCellKey("m2", row.kebirKodu, f)] = true;
      });
    });
    previousWorkbookRef.current = currentWorkbook;
    if (Object.keys(nextChangedCells).length) {
      setChangedCells(nextChangedCells);
      if (changedCellsTimerRef.current) clearTimeout(changedCellsTimerRef.current);
      changedCellsTimerRef.current = setTimeout(() => setChangedCells({}), 1800);
    }
  }, [currentWorkbook]);

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
    try {
      const data = await resetDenetimPlaniOnemlilikExcelModel(user.denetciId || 0, user.denetlenenId || 0, user.yil || 0);
      if (data) { syncFromWorkbook(data); setActiveStep(0); enqueueSnackbar("Sıfırlandı.", { variant: "success" }); }
    } catch { enqueueSnackbar("Hata oluştu.", { variant: "error" }); }
  };

  const handleRestorePrevious = async () => {
    try {
      const data = await restorePreviousDenetimPlaniOnemlilikExcelModel(user.denetciId || 0, user.denetlenenId || 0, user.yil || 0);
      if (data) { syncFromWorkbook(data); enqueueSnackbar("Geri yüklendi.", { variant: "success" }); }
    } catch { enqueueSnackbar("Hata oluştu.", { variant: "error" }); }
  };

  const updateParam = (key: keyof Parametreler, value: any) => {
    if (!draftState) return;
    setDraftState({ ...draftState, parametreler: { ...draftState.parametreler, [key]: value } });
  };

  const updateHesap = (kebirKodu: number, field: keyof HesapGirdi, value: any) => {
    if (!draftState) return;
    const nextHesaplar = draftState.hesaplar.map(h => h.kebirKodu === kebirKodu ? { ...h, [field]: value } : h);
    setDraftState({ ...draftState, hesaplar: nextHesaplar });
  };

  const headerSx = { bgcolor: "#f1f5f9", color: "#475569", fontWeight: 800, fontSize: "0.7rem", py: 0.75, borderBottom: "1px solid #e2e8f0" };
  const cellSx = { py: 0.5, borderBottom: "1px solid #f1f5f9", fontSize: "0.8rem" };

  if (loading) return <Box sx={{ p: 10, textAlign: "center" }}><CircularProgress /></Box>;
  if (loadError) return <Box sx={{ p: 5 }}><Alert severity="error">{loadError}</Alert></Box>;

  return (
    <Box sx={{ width: "100%", bgcolor: "white", border: "1px solid #e2e8f0", borderRadius: 2, overflow: "hidden" }}>
      <Backdrop open={saving} sx={{ zIndex: 9999, color: "#fff" }}><CircularProgress color="inherit" /></Backdrop>

      <Box sx={{ py: 3, borderBottom: "1px solid #f1f5f9" }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ ".MuiStepLabel-label": { fontWeight: 800, color: "#64748b" }, ".MuiStepIcon-root.Mui-active": { color: "#1e293b" }, ".MuiStepIcon-root.Mui-completed": { color: "#1e293b" } }}>
          {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>
      </Box>

      <Box sx={{ p: 1, minHeight: "42vh", position: "relative" }}>
        {stepLoading && <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, background: "rgba(255,255,255,0.5)" }}><CircularProgress /></Box>}

        {activeStep === 0 && draftState && (
          <Stack spacing={1}>
            <Table size="small">
              <TableHead><TableRow><TableCell sx={headerSx}>Alan</TableCell><TableCell sx={headerSx}>Değer</TableCell><TableCell sx={headerSx}>Not</TableCell></TableRow></TableHead>
              <TableBody>
                {[
                  { l: "Firma Adı", k: "firmaAdi", n: "Şirket kartı veya kullanıcı girişi" },
                  { l: "Denetim Yılı", k: "denetimYili", n: "1 = ilk yıl, 2-4 = devam, 5+ = uzun vadeli", t: "number" },
                  { l: "Sektör Tipi", k: "sektorTipi", n: "Ağırlık matrisi seçimi", t: "select" },
                  { l: "Raporlama Dönemi", k: "raporlamaDonemi", n: "Örn: 31.12.2024" },
                  { l: "Hedef Denetim Riski", k: "hedefDenetimRiski", n: "Genellikle %5", t: "percent" }
                ].map(r => (
                  <TableRow key={r.k}><TableCell sx={{ ...cellSx, width: "15%", fontWeight: 700 }}>{r.l}</TableCell><TableCell sx={{ ...cellSx, width: "45%" }}>{r.t === "select" ? <TextField fullWidth select variant="standard" value={draftState.parametreler.sektorTipi} onChange={e => updateParam("sektorTipi", e.target.value)} InputProps={{ disableUnderline: true, style: { fontSize: "0.85rem" } }}><MenuItem value="Ticaret">Ticaret</MenuItem><MenuItem value="Uretim">Üretim</MenuItem><MenuItem value="Diger">Diğer</MenuItem></TextField> : <TextField fullWidth variant="standard" value={r.t === "percent" ? formatPercent(draftState.parametreler.hedefDenetimRiski, 100) : (draftState.parametreler as any)[r.k]} onChange={e => updateParam(r.k as any, r.t === "percent" ? parseDecimal(e.target.value)/100 : r.t === "number" ? Number(e.target.value) : e.target.value)} InputProps={{ disableUnderline: true, style: { fontSize: "0.85rem" } }} />}</TableCell><TableCell sx={{ ...cellSx, color: "#94a3b8", fontSize: "0.75rem" }}>{r.n}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>

            {currentWorkbook && (
              <Table size="small">
                <TableHead><TableRow>{["#", "Kod", "Hesaplama Bazı", "Tutar (TL)", "Mizan Kaynağı", "Notlar"].map(h => <TableCell key={h} sx={headerSx}>{h}</TableCell>)}</TableRow></TableHead>
                <TableBody>
                  {currentWorkbook.finansalVeriler.map((row, idx) => (
                    <TableRow key={idx}><TableCell sx={cellSx}>{idx + 1}</TableCell><TableCell sx={{ ...cellSx, fontWeight: 700 }}>{row.kod}</TableCell><TableCell sx={cellSx}>{row.hesaplamaBazi}</TableCell><TableCell align="right" sx={cellSx}><TextField variant="standard" fullWidth inputProps={{ style: { textAlign: "right", fontWeight: 700, fontSize: "0.85rem" } }} InputProps={{ disableUnderline: true }} value={formatMoney((draftState.parametreler as any)[row.kod === 'VOK' ? 'vergiOncesiKar' : row.kod === 'SAT' ? 'netSatislar' : row.kod === 'OZK' ? 'ozkaynakToplami' : 'toplamVarliklar'])} onChange={e => updateParam(row.kod === 'VOK' ? 'vergiOncesiKar' : row.kod === 'SAT' ? 'netSatislar' : row.kod === 'OZK' ? 'ozkaynakToplami' : 'toplamVarliklar' as any, parseDecimal(e.target.value))} /></TableCell><TableCell sx={{ ...cellSx, color: "#94a3b8", fontSize: "0.75rem" }}>{row.mizanKaynagi}</TableCell><TableCell sx={{ ...cellSx, color: "#94a3b8", fontSize: "0.75rem" }}>{row.notlar}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Stack>
        )}

        {activeStep === 1 && currentWorkbook && (
          <Stack spacing={2}>
            <Grid container spacing={1}>
              {[{ t: "Genel Önemlilik (M)", v: currentWorkbook.ozet.genelOnemlilik, c: "#0ea5e9" }, { t: "Performans (PM)", v: currentWorkbook.ozet.performansOnemliligi, c: "#10b981" }, { t: "De Minimis (DM)", v: currentWorkbook.ozet.deMinimis, c: "#f59e0b" }, { t: "Hesap Sabit Pay", v: currentWorkbook.ozet.hesapSabitPayTutari, c: "#64748b" }].map(x => <Grid size={{ xs: 12, md: 3 }} key={x.t}><Paper elevation={0} sx={{ p: 1.5, border: "1px solid #f1f5f9", borderRadius: 1 }}><Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 800 }}>{x.t}</Typography><Typography variant="h6" sx={{ fontWeight: 900, color: x.c }}>{formatMoney(x.v)}</Typography></Paper></Grid>)}
            </Grid>
            <Table size="small">
              <TableHead><TableRow>{["Kriter", "Büyüklük", "Oran (%)", "Ham", "Ağırlık", "Ağırlıklı"].map(h => <TableCell key={h} sx={headerSx}>{h}</TableCell>)}</TableRow></TableHead>
              <TableBody>{currentWorkbook.genelOnemlilikSatirlari.map((row, idx) => <TableRow key={idx}><TableCell sx={{ ...cellSx, fontWeight: 700 }}>{row.kriter}</TableCell><TableCell align="right" sx={cellSx}>{formatMoney(row.tutar)}</TableCell><TableCell align="right" sx={cellSx}>{plain.format(row.secilenOranYuzde)}</TableCell><TableCell align="right" sx={cellSx}>{formatMoney(row.hamOnemlilik)}</TableCell><TableCell align="right" sx={cellSx}>{formatPercent(row.agirlikKatsayisi)}</TableCell><TableCell align="right" sx={{ ...cellSx, fontWeight: 800, color: "primary.main" }}>{formatMoney(row.agirlikliOnemlilik)}</TableCell></TableRow>)}</TableBody>
            </Table>
          </Stack>
        )}

        {activeStep === 2 && currentWorkbook && (
          <Box sx={{ border: "1px solid #f1f5f9", borderRadius: 1, overflow: "hidden" }}>
            <Table size="small" stickyHeader>
              <TableHead><TableRow>{["Kebir", "Hesap Adı", "Mizan Tutarı", "Risk K", "Nihai Önemlilik", "PM", "Risk Seviyesi"].map(h => <TableCell key={h} sx={headerSx}>{h}</TableCell>)}</TableRow></TableHead>
              <TableBody>
                {currentWorkbook.hesapDagitimSatirlari.map((row) => (
                  <TableRow key={row.kebirKodu}>
                    <TableCell sx={{ ...cellSx, fontWeight: 700 }}>{row.kebirKodu}</TableCell><TableCell sx={cellSx}>{row.hesapAdi}</TableCell><TableCell align="right" sx={cellSx}>{formatMoney(row.mizanTutari)}</TableCell>
                    <TableCell align="center" sx={cellSx}><TextField select variant="standard" value={draftState?.hesaplar.find(x => x.kebirKodu === row.kebirKodu)?.riskK ?? row.riskK} onChange={e => updateHesap(row.kebirKodu, "riskK", Number(e.target.value))} InputProps={{ disableUnderline: true }} sx={{ width: 40 }}><MenuItem value={1}>1</MenuItem><MenuItem value={2}>2</MenuItem><MenuItem value={3}>3</MenuItem></TextField></TableCell>
                    <TableCell align="right" sx={{ ...cellSx, transition: "background .4s", bgcolor: changedCells[`m2:${row.kebirKodu}:nihaiOnemlilik`] ? "#fff4a3" : "transparent" }}>{formatMoney(row.nihaiOnemlilik)}</TableCell>
                    <TableCell align="right" sx={{ ...cellSx, transition: "background .4s", bgcolor: changedCells[`m2:${row.kebirKodu}:performansOnemliligi`] ? "#fff4a3" : "transparent" }}>{formatMoney(row.performansOnemliligi)}</TableCell>
                    <TableCell align="center" sx={{ ...cellSx, transition: "background .4s", bgcolor: changedCells[`m2:${row.kebirKodu}:riskSeviyesi`] ? "#fff4a3" : "transparent" }}>{row.riskSeviyesi}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        {activeStep === 3 && currentWorkbook && (
          <Box sx={{ border: "1px solid #f1f5f9", borderRadius: 1, overflow: "hidden" }}>
            <Table size="small" stickyHeader>
              <TableHead><TableRow>{["Kebir", "Hesap Adı", "Doğal Risk", "Kontrol Riski", "ÖYR", "TER", "Örnekleme %", "Yaklaşım"].map(h => <TableCell key={h} sx={headerSx}>{h}</TableCell>)}</TableRow></TableHead>
              <TableBody>
                {currentWorkbook.denetimRiskiSatirlari.map((row) => (
                  <TableRow key={row.kebirKodu}>
                    <TableCell sx={{ ...cellSx, fontWeight: 700 }}>{row.kebirKodu}</TableCell><TableCell sx={cellSx}>{row.hesapAdi}</TableCell>
                    <TableCell align="center" sx={cellSx}><TextField variant="standard" type="number" inputProps={{ step: 0.1 }} value={draftState?.hesaplar.find(x => x.kebirKodu === row.kebirKodu)?.dogalRisk ?? row.dogalRisk} onChange={e => updateHesap(row.kebirKodu, "dogalRisk", Number(e.target.value))} InputProps={{ disableUnderline: true }} sx={{ width: 40 }} /></TableCell>
                    <TableCell align="center" sx={cellSx}><TextField variant="standard" type="number" inputProps={{ step: 0.1 }} value={draftState?.hesaplar.find(x => x.kebirKodu === row.kebirKodu)?.kontrolRiski ?? row.kontrolRiski} onChange={e => updateHesap(row.kebirKodu, "kontrolRiski", Number(e.target.value))} InputProps={{ disableUnderline: true }} sx={{ width: 40 }} /></TableCell>
                    <TableCell align="right" sx={cellSx}>{formatPercent(row.oyr, 100)}</TableCell>
                    <TableCell align="right" sx={cellSx}>{formatPercent(row.ter, 100)}</TableCell>
                    <TableCell align="center" sx={cellSx}>{row.orneklemeYuzdesi}</TableCell>
                    <TableCell sx={cellSx}>{row.onerilenYaklasim}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Box>

      <Box sx={{ mt: 2, py: 1.5, px: 2, borderTop: "1px solid #e2e8f0", bgcolor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" sx={{ bgcolor: "white", textTransform: "none", color: "#64748b", borderColor: "#e2e8f0", px: 2 }} onClick={() => setActiveStep(prev => prev - 1)} disabled={activeStep === 0}>Geri</Button>
          <Button variant="outlined" size="small" sx={{ bgcolor: "white", textTransform: "none", color: "#64748b", borderColor: "#e2e8f0", px: 2 }} onClick={() => setActiveStep(prev => prev + 1)} disabled={activeStep === steps.length - 1}>İleri</Button>
          {savedWorkbook?.birOncekiHesaplamaVar && <Button startIcon={<IconHistory size={16} />} variant="outlined" size="small" sx={{ bgcolor: "white", textTransform: "none", color: "#64748b", borderColor: "#e2e8f0" }} onClick={handleRestorePrevious}>Bir Önceki Hesaplamaya Dön</Button>}
          <Button startIcon={<IconRotate size={16} />} variant="outlined" size="small" sx={{ bgcolor: "white", textTransform: "none", color: "#64748b", borderColor: "#e2e8f0" }} onClick={() => setConfirmOpen(true)}>Program Varsayılanlarına Dön</Button>
        </Stack>
        <Button variant="contained" size="small" sx={{ bgcolor: "#f1f5f9", color: "#94a3b8", boxShadow: "none", fontWeight: 800, px: 3, "&:hover": { bgcolor: "#e2e8f0" } }} onClick={handleNext}>{activeStep === steps.length - 1 ? "KAYDET VE HESAPLA" : "İLERLE"}</Button>
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}><DialogTitle sx={{ fontWeight: 800 }}>Onay</DialogTitle><DialogContent>Sıfırlansın mı?</DialogContent><DialogActions><Button onClick={() => setConfirmOpen(false)}>Hayır</Button><Button variant="contained" color="error" onClick={() => { setConfirmOpen(false); handleReset(); }}>Evet</Button></DialogActions></Dialog>
    </Box>
  );

  async function handleNext() {
    if (activeStep < steps.length - 1) { setActiveStep(prev => prev + 1); return; }
    setSaving(true);
    try {
      const data = await updateDenetimPlaniOnemlilikExcelModel(user.denetciId || 0, user.denetlenenId || 0, user.yil || 0, toPayload(draftState!));
      if (data) { syncFromWorkbook(data); enqueueSnackbar("Kaydedildi.", { variant: "success" }); }
    } catch { enqueueSnackbar("Hata.", { variant: "error" }); } finally { setSaving(false); }
  }
});

OnemlilikExcelStepper.displayName = "OnemlilikExcelStepper";
export default OnemlilikExcelStepper;
