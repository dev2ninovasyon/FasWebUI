"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  Alert,
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
import {
  getOnemlilikExcelModel,
  previewOnemlilikExcelModel,
  resetOnemlilikExcelModel,
  restorePreviousOnemlilikExcelModel,
  updateOnemlilikExcelModel,
} from "@/api/DenetimKanitlari/DenetimKanitlari";
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
  color,
  subtitle,
  children,
}: {
  title: string;
  color: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <Paper sx={{ borderRadius: 3, border: "1px solid #dbe3f0", overflow: "hidden", boxShadow: "0 12px 28px rgba(15,23,42,.06)" }}>
    <Box sx={{ px: 3, py: 1.5, background: color, color: "#fff", fontWeight: 800, fontSize: "1.2rem" }}>{title}</Box>
    {subtitle ? <Box sx={{ px: 3, py: 1.2, background: "#fff5df", color: "#b45309", fontWeight: 700 }}>{subtitle}</Box> : null}
    <Box sx={{ p: 3 }}>{children}</Box>
  </Paper>
);

export interface OnemlilikExcelStepperRef {
  handleReset: () => void;
  handleRestorePrevious: () => void;
}

const OnemlilikExcelStepper = forwardRef<OnemlilikExcelStepperRef>((props, ref) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savedWorkbook, setSavedWorkbook] = useState<Workbook | null>(null);
  const [previewWorkbook, setPreviewWorkbook] = useState<Workbook | null>(null);
  const [draftState, setDraftState] = useState<WorkbookState | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewSeqRef = useRef(0);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return fallback;
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

    return () => {
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
      }
    };
  }, []);

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
    }
  };

  const handleRestorePrevious = async () => {
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
    }
  };

  useImperativeHandle(ref, () => ({
    handleReset,
    handleRestorePrevious,
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
  const currentWorkbook = previewWorkbook ?? savedWorkbook;

  const hasPendingChanges = useMemo(() => {
    if (!draftState || !savedWorkbook) {
      return false;
    }

    return JSON.stringify(toPayload(draftState)) !== JSON.stringify(toPayload(buildState(savedWorkbook)));
  }, [draftState, savedWorkbook]);

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
    <Section title="TNB AKADEMI | PARAMETRE PANELI" color="#1f3a6d">
      <Stack spacing={3}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ background: "#2f6fb0", color: "#fff", fontWeight: 800 }}>Alan</TableCell>
                <TableCell sx={{ background: "#2f6fb0", color: "#fff", fontWeight: 800 }}>Değer</TableCell>
                <TableCell sx={{ background: "#2f6fb0", color: "#fff", fontWeight: 800 }}>Not</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Firma Adı</TableCell>
                <TableCell sx={{ background: "#fff7cc" }}><TextField fullWidth variant="standard" value={draftState.parametreler.firmaAdi} onChange={(e) => updateParam("firmaAdi", e.target.value)} /></TableCell>
                <TableCell>Şirket kartı veya kullanıcı girişi</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Denetim Yılı</TableCell>
                <TableCell sx={{ background: "#fff7cc" }}><TextField fullWidth variant="standard" type="number" value={draftState.parametreler.denetimYili} onChange={(e) => updateParam("denetimYili", Number(e.target.value || 1))} /></TableCell>
                <TableCell>1 = ilk yıl, 2-4 = devam, 5+ = uzun vadeli</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Sektör Tipi</TableCell>
                <TableCell sx={{ background: "#fff7cc" }}>
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
                <TableCell sx={{ background: "#fff7cc" }}><TextField fullWidth variant="standard" value={draftState.parametreler.raporlamaDonemi} onChange={(e) => updateParam("raporlamaDonemi", e.target.value)} /></TableCell>
                <TableCell>Örn: 31.12.2024</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Hedef Denetim Riski</TableCell>
                <TableCell sx={{ background: "#fff7cc" }}><TextField fullWidth variant="standard" value={formatPercent(draftState.parametreler.hedefDenetimRiski, 100)} onChange={(e) => updateParam("hedefDenetimRiski", parseDecimal(e.target.value) / 100)} /></TableCell>
                <TableCell>Genellikle %5</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {["#", "Kod", "Hesaplama Bazı", "Tutar (TL)", "Mizan Kaynağı", "Notlar"].map((title) => (
                  <TableCell key={title} sx={{ background: "#1f6b5f", color: "#fff", fontWeight: 800 }}>{title}</TableCell>
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
                    <TableCell sx={{ background: "#fff7cc" }}>
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
    </Section>
  );

  const m1 = (
    <Stack spacing={3}>
      <Section title="BOLUM 2: GENEL ONEMLILIK (M)" color="#c00000" subtitle="Seçilen oran veya önceki parametreler değiştiğinde sonuçlar anlık güncellenir.">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {["#", "Kriter", "Tutar", "Seçilen Oran %", "Ham Önemlilik", "Ağırlık", "Ağırlıklı Önemlilik"].map((title) => (
                  <TableCell key={title} sx={{ background: "#c00000", color: "#fff", fontWeight: 800 }}>{title}</TableCell>
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
                    <TableCell sx={{ background: "#e8f1ff" }}>{formatMoney(row.tutar)}</TableCell>
                    <TableCell sx={{ background: "#fff7cc" }}>
                      <TextField
                        fullWidth
                        variant="standard"
                        value={plain.format((draftState.parametreler[overrideKey] as number | null | undefined) ?? row.secilenOranYuzde)}
                        onChange={(e) => updateParam(overrideKey, parseDecimal(e.target.value))}
                      />
                    </TableCell>
                    <TableCell sx={{ background: "#ffe8da" }}>{formatMoney(row.hamOnemlilik)}</TableCell>
                    <TableCell sx={{ background: "#efe4ff" }}>{plain.format(row.agirlikKatsayisi)}</TableCell>
                    <TableCell sx={{ background: "#ffe8da" }}>{formatMoney(row.agirlikliOnemlilik)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Section>

      <Section title="BOLUM 3: PERFORMANS ONEMLILIGI VE HATA SINIRI" color="#146356">
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
    <Section title="BOLUM 4: HESAP BAZINDA ONEMLILIK DAGITIMI" color="#c45d0a" subtitle="Risk K veya mizan değiştiğinde ilgili satır ve toplamlar anlık güncellenir.">
      <TableContainer>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {["Kebir", "Hesap Adı", "Mizan Tutarı", "Risk K", "Ağırlık", "Ağırlık %", "Sabit Pay", "Kalan", "Dağıtılan Pay", "Nihai Önemlilik", "PM", "Risk Seviyesi"].map((title) => (
                <TableCell key={title} sx={{ background: "#c45d0a", color: "#fff", fontWeight: 800 }}>{title}</TableCell>
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
                  <TableCell sx={{ background: "#fff7cc" }}>
                    <TextField fullWidth variant="standard" value={formatMoney(editable?.mizanTutari ?? row.mizanTutari)} onChange={(e) => updateHesap(row.kebirKodu, { mizanTutari: parseDecimal(e.target.value) })} />
                  </TableCell>
                  <TableCell sx={{ background: "#fff7cc" }}>
                    <TextField select fullWidth variant="standard" value={editable?.riskK ?? row.riskK} onChange={(e) => updateHesap(row.kebirKodu, { riskK: Number(e.target.value) })}>
                      <MenuItem value={1}>1</MenuItem>
                      <MenuItem value={2}>2</MenuItem>
                      <MenuItem value={3}>3</MenuItem>
                    </TextField>
                  </TableCell>
                  <TableCell sx={{ background: "#ffe8da" }}>{formatMoney(row.agirlikTutari)}</TableCell>
                  <TableCell sx={{ background: "#fff7cc" }}>{formatPercent(row.agirlikOraniYuzde)}</TableCell>
                  <TableCell sx={{ background: "#e8f1ff" }}>{formatMoney(row.sabitPay)}</TableCell>
                  <TableCell sx={{ background: "#e8f1ff" }}>{formatMoney(row.kalanTutar)}</TableCell>
                  <TableCell sx={{ background: "#dff1d8" }}>{formatMoney(row.dagitilanPay)}</TableCell>
                  <TableCell sx={{ background: "#ffe8da" }}>{formatMoney(row.nihaiOnemlilik)}</TableCell>
                  <TableCell sx={{ background: "#dff1d8" }}>{formatMoney(row.performansOnemliligi)}</TableCell>
                  <TableCell>{row.riskSeviyesi}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Section>
  );

  const m3 = (
    <Section title="DENETIM RISKI MODELI" color="#5b1c9d" subtitle="Doğal risk ve kontrol riski değiştiğinde önerilen yaklaşım anlık güncellenir.">
      <Stack spacing={3}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {["#", "Kavram", "Simge", "Formül", "Değer", "Açıklama"].map((title) => (
                  <TableCell key={title} sx={{ background: "#5b1c9d", color: "#fff", fontWeight: 800 }}>{title}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {currentWorkbook.denetimRiskiModelTanimlari.map((row) => (
                <TableRow key={row.siraNo}>
                  <TableCell>{row.siraNo}</TableCell>
                  <TableCell sx={{ background: "#efe4ff" }}>{row.kavram}</TableCell>
                  <TableCell>{row.simge}</TableCell>
                  <TableCell>{row.formul}</TableCell>
                  <TableCell sx={{ background: "#fff7cc" }}>{row.deger != null ? formatPercent(row.deger, 100) : "-"}</TableCell>
                  <TableCell>{row.aciklama}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TableContainer>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {["Kebir", "Hesap Adı", "Doğal Risk", "Kontrol Riski", "ÖYR", "TER", "Güven Düzeyi", "Örnekleme %", "Nihai Önemlilik", "Denetim Yaklaşımı"].map((title) => (
                  <TableCell key={title} sx={{ background: "#5b1c9d", color: "#fff", fontWeight: 800 }}>{title}</TableCell>
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
                    <TableCell sx={{ background: "#fff7cc" }}>
                      <TextField fullWidth variant="standard" value={plain.format(editable?.dogalRisk ?? row.dogalRisk)} onChange={(e) => updateHesap(row.kebirKodu, { dogalRisk: parseDecimal(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ background: "#fff7cc" }}>
                      <TextField fullWidth variant="standard" value={plain.format(editable?.kontrolRiski ?? row.kontrolRiski)} onChange={(e) => updateHesap(row.kebirKodu, { kontrolRiski: parseDecimal(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ background: "#ffe8da" }}>{formatPercent(row.oyr, 100)}</TableCell>
                    <TableCell sx={{ background: "#ffe8da" }}>{formatPercent(row.ter, 100)}</TableCell>
                    <TableCell sx={{ background: "#dff1d8" }}>{formatPercent(row.guvenDuzeyi, 100)}</TableCell>
                    <TableCell sx={{ background: "#fff7cc" }}>{row.orneklemeYuzdesi}</TableCell>
                    <TableCell sx={{ background: "#ffe8da" }}>{formatMoney(row.hesapOnemlilikTutari)}</TableCell>
                    <TableCell>{row.onerilenYaklasim}</TableCell>
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
      {previewing ? <Alert severity="info" sx={{ mb: 2, borderRadius: 3 }}>Değişiklikler hesaplanıyor...</Alert> : null}

      <Paper sx={{ borderRadius: 3, border: "1px solid #dbe3f0", overflow: "hidden", mb: 3, background: "linear-gradient(180deg,#f8fbff 0%,#eef5ff 100%)" }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ p: 3 }}>
          {steps.map((label, index) => (
            <Step key={label} onClick={() => setActiveStep(index)}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Stack spacing={3}>{[p0, m1, m2, m3][activeStep]}</Stack>

      <Paper sx={{ borderRadius: 3, border: "1px solid #dbe3f0", boxShadow: "0 12px 28px rgba(15,23,42,.06)", position: "sticky", bottom: 16, mt: 3, p: 2, zIndex: 10 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button variant="outlined" disabled={activeStep === 0} onClick={() => setActiveStep((x) => x - 1)}>Geri</Button>
            <Button variant="outlined" disabled={activeStep === steps.length - 1} onClick={() => setActiveStep((x) => x + 1)}>İleri</Button>
            <Button variant="outlined" color="secondary" startIcon={<IconHistory size={18} />} onClick={handleRestorePrevious} disabled={!savedWorkbook?.birOncekiHesaplamaVar}>
              Bir Önceki Hesaplamaya Dön
            </Button>
            <Button variant="outlined" color="secondary" startIcon={<IconRotate size={18} />} onClick={handleReset}>
              Program Varsayılanına Dön
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
    </Box>
  );
});

export default OnemlilikExcelStepper;
