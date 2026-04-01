"use client";

import React, { useEffect, useMemo, useState, forwardRef, useImperativeHandle } from "react";
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
import { IconAlertTriangle, IconX } from "@tabler/icons-react";
import IconButton from "@mui/material/IconButton";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { enqueueSnackbar } from "notistack";
import {
  getOnemlilikExcelModel,
  updateOnemlilikExcelModel,
} from "@/api/DenetimKanitlari/DenetimKanitlari";

type Parametreler = {
  firmaAdi: string;
  denetimYili: number;
  sektorTipi: string;
  raporlamaDonemi: string;
  vergiOncesiKar: number;
  netSatislar: number;
  ozkaynakToplami: number;
  toplamVarliklar: number;
  aktifYilGrubuKodu: number;
  aktifSektorKodu: number;
  hedefDenetimRiski: number;
};

type M1Row = {
  kod: string;
  kriter: string;
  tutar: number;
  secilenOranYuzde: number;
  hamOnemlilik: number;
  agirlikKatsayisi: number;
  agirlikliOnemlilik: number;
};

type Summary = {
  genelOnemlilik: number;
  performansOnemliligi: number;
  deMinimis: number;
  hesapSabitPayTutari: number;
  kalanDagitilabilirTutar: number;
};

type M2Row = {
  kebirKodu: number;
  hesapAdi: string;
  mizanTutari: number;
  riskK: number;
  agirlikTutari: number;
  agirlikOraniYuzde: number;
  sabitPay: number;
  kalanTutar: number;
  dagitilanPay: number;
  nihaiOnemlilik: number;
  performansOnemliligi: number;
  riskSeviyesi: string;
};

type M3Row = {
  kebirKodu: number;
  hesapAdi: string;
  dogalRisk: number;
  kontrolRiski: number;
  oyr: number;
  ter: number;
  guvenDuzeyi: number;
  orneklemeAraligi: string;
  hesapOnemlilikTutari: number;
  onerilenYaklasim: string;
};

type FormulaRow = {
  siraNo: number;
  bolum: string;
  hucreKonu: string;
  excelFormulu: string;
  aciklama: string;
  bdsDayanagi: string;
};

type Workbook = {
  id?: number;
  parametreler: Parametreler;
  genelOnemlilikSatirlari: M1Row[];
  ozet: Summary;
  hesapDagitimSatirlari: M2Row[];
  denetimRiskiSatirlari: M3Row[];
  formulRehberiSatirlari: FormulaRow[];
};

type WorkbookState = {
  firmaAdi: string;
  denetimYili: number;
  sektorTipi: string;
  raporlamaDonemi: string;
  vergiOncesiKar: number;
  netSatislar: number;
  ozkaynakToplami: number;
  toplamVarliklar: number;
  hesaplar: {
    kebirKodu: number;
    hesapAdi: string;
    mizanTutari: number;
    riskK: number;
    dogalRisk: number;
    kontrolRiski: number;
  }[];
  manualOranlar: Record<string, number>;
};

const steps = [
  "P0 - Parametreler",
  "M1 - Genel Önemlilik",
  "M2 - Hesap Dağıtım",
  "M3 - Denetim Riski",
  "M4 - Formül Rehberi",
];

const formatter = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const sectionTitleSx = {
  fontSize: "1.15rem",
  fontWeight: 700,
  color: "primary.dark",
  mb: 2,
};

const stepperSx = {
  mb: 4,
  backgroundColor: "#f7fafc",
  borderRadius: 2,
  p: 2,
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  ".MuiStepLabel-label": { fontWeight: 600, color: "#1e40af" },
  ".Mui-active .MuiStepLabel-label": { color: "#1d4ed8" },
  ".Mui-completed .MuiStepLabel-label": { color: "#059669" },
};

const actionButtonSx = {
  minWidth: 140,
  fontWeight: 700,
};

const headerCellSx = {
  backgroundColor: "#d9e7fb",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const inputCellSx = {
  backgroundColor: "#fff4cc",
};

const formulaCellSx = {
  backgroundColor: "#e8f1ff",
};

const readNumber = (value: string) => {
  if (!value) return 0;
  return Number(value.replace(/\./g, "").replace(",", "."));
};

const formatNumber = (value?: number | null) => formatter.format(value ?? 0);
const formatPercent = (value?: number | null) => `%${percentFormatter.format(value ?? 0)}`;

const buildStateFromWorkbook = (workbook: Workbook): WorkbookState => ({
  firmaAdi: workbook.parametreler.firmaAdi,
  denetimYili: workbook.parametreler.denetimYili,
  sektorTipi: workbook.parametreler.sektorTipi,
  raporlamaDonemi: workbook.parametreler.raporlamaDonemi,
  vergiOncesiKar: workbook.parametreler.vergiOncesiKar,
  netSatislar: workbook.parametreler.netSatislar,
  ozkaynakToplami: workbook.parametreler.ozkaynakToplami,
  toplamVarliklar: workbook.parametreler.toplamVarliklar,
  hesaplar: workbook.hesapDagitimSatirlari.map((row) => {
    const risk = workbook.denetimRiskiSatirlari.find((x) => x.kebirKodu === row.kebirKodu);
    return {
      kebirKodu: row.kebirKodu,
      hesapAdi: row.hesapAdi,
      mizanTutari: row.mizanTutari,
      riskK: row.riskK,
      dogalRisk: risk?.dogalRisk ?? 0.6,
      kontrolRiski: risk?.kontrolRiski ?? 0.7,
    };
  }),
  manualOranlar: workbook.genelOnemlilikSatirlari.reduce((acc, row) => {
    acc[row.kod] = row.secilenOranYuzde;
    return acc;
  }, {} as Record<string, number>),
});

export interface OnemlilikExcelStepperRef {
  handleReset: () => void;
}

const OnemlilikExcelStepper = forwardRef<OnemlilikExcelStepperRef>((props, ref) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workbook, setWorkbook] = useState<Workbook | null>(null);
  const [state, setState] = useState<WorkbookState | null>(null);
  const [initialState, setInitialState] = useState<WorkbookState | null>(null);

  // Confirmation Dialog State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const openConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmConfig({ title, message, onConfirm });
    setConfirmOpen(true);
  };

  const loadWorkbook = async () => {
    setLoading(true);
    try {
      const data = await getOnemlilikExcelModel(
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
      );
      if (data) {
        setWorkbook(data);
        const newState = buildStateFromWorkbook(data);
        setState(newState);
        setInitialState(newState);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    openConfirm(
      "Varsayılana Dön",
      "Tüm manuel oranlar silinecek ve sistemin varsayılan hesaplama matrisine dönülecektir. Onaylıyor musunuz?",
      async () => {
        if (!state) return;
        const resetState = { ...state, manualOranlar: {} };
        setSaving(true);
        try {
          const data = await updateOnemlilikExcelModel(
            user.denetciId || 0,
            user.denetlenenId || 0,
            user.yil || 0,
            resetState,
          );
          if (data) {
            setWorkbook(data);
            const newState = buildStateFromWorkbook(data);
            setState(newState);
            setInitialState(newState);
            enqueueSnackbar("Varsayılan oranlara başarıyla dönüldü.", { variant: "success" });
          }
        } finally {
          setSaving(false);
        }
      }
    );
  };

  useImperativeHandle(ref, () => ({
    handleReset,
  }));

  useEffect(() => {
    loadWorkbook();
  }, []);

  const saveWorkbook = async (force: boolean = false) => {
    if (!state) return;

    if (!force && initialState) {
      const financialsChanged =
        state.vergiOncesiKar !== initialState.vergiOncesiKar ||
        state.netSatislar !== initialState.netSatislar ||
        state.ozkaynakToplami !== initialState.ozkaynakToplami ||
        state.toplamVarliklar !== initialState.toplamVarliklar;

      const manualOranlarChanged = JSON.stringify(state.manualOranlar) !== JSON.stringify(initialState.manualOranlar);

      if (financialsChanged || manualOranlarChanged) {
        openConfirm(
          "Değişiklik Onayı",
          "Manuel veri veya oran değişiklikleri tespit edildi. Bu durum tüm önemlilik hesaplamalarını ve dağıtımlarını etkileyecektir. Devam ederseniz mevcut hesaplamalar güncellenecek ve önceki veriler geri alınamayacaktır. Onaylıyor musunuz?",
          () => saveWorkbook(true)
        );
        return;
      }
    }

    setSaving(true);
    try {
      const data = await updateOnemlilikExcelModel(
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        state,
      );
      if (data) {
        setWorkbook(data);
        const newState = buildStateFromWorkbook(data);
        setState(newState);
        setInitialState(newState);
        enqueueSnackbar("Önemlilik modeli kaydedildi.", { variant: "success" });
      } else {
        enqueueSnackbar("Önemlilik modeli kaydedilemedi.", { variant: "error" });
      }
    } finally {
      setSaving(false);
    }
  };

  const hesapMap = useMemo(() => {
    const map = new Map<number, WorkbookState["hesaplar"][number]>();
    state?.hesaplar.forEach((item) => map.set(item.kebirKodu, item));
    return map;
  }, [state]);

  const updateState = (updater: (prev: WorkbookState) => WorkbookState) => {
    setState((prev) => (prev ? updater(prev) : prev));
  };

  const updateHesap = (kebirKodu: number, partial: Partial<WorkbookState["hesaplar"][number]>) => {
    updateState((prev) => ({
      ...prev,
      hesaplar: prev.hesaplar.map((item) =>
        item.kebirKodu === kebirKodu ? { ...item, ...partial } : item,
      ),
    }));
  };

  if (loading || !workbook || !state) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ fontFamily: "'Plus Jakarta Sans', Helvetica, Arial, sans-serif" }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        Excel modelindeki her sayfa burada bir adım olarak gösteriliyor. Sarı alanlar giriş, mavi alanlar formül sonucudur.
      </Alert>

      <Stepper activeStep={activeStep} alternativeLabel sx={stepperSx}>
        {steps.map((label, index) => (
          <Step key={label} onClick={() => setActiveStep(index)}>
            <StepLabel
              StepIconProps={{
                sx: {
                  width: 30,
                  height: 30,
                  fontSize: 16,
                  fontWeight: 700,
                  color: activeStep === index ? "#1d4ed8" : "#9ca3af",
                },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Stack spacing={3}>
          {/* A - Genel Bilgiler Kaldırıldı */}

          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography sx={sectionTitleSx}>B - Finansal Veriler</Typography>
            <Grid container spacing={2}>
              {[
                ["Vergi Öncesi Kâr", "vergiOncesiKar"],
                ["Net Satışlar", "netSatislar"],
                ["Özkaynak Toplamı", "ozkaynakToplami"],
                ["Toplam Varlıklar", "toplamVarliklar"],
              ].map(([label, key]) => (
                <Grid key={key} size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label={label}
                    value={formatNumber((state as any)[key])}
                    onChange={(e) =>
                      updateState((prev) => ({ ...prev, [key]: readNumber(e.target.value) }))
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>

          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography sx={sectionTitleSx}>E - Aktif Parametreler</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Aktif Yıl Grubu Kodu" value={workbook.parametreler.aktifYilGrubuKodu} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Aktif Sektör Kodu" value={workbook.parametreler.aktifSektorKodu} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Hedef Denetim Riski" value={formatPercent((workbook.parametreler.hedefDenetimRiski || 0) * 100)} InputProps={{ readOnly: true }} />
              </Grid>
            </Grid>
          </Paper>
        </Stack>
      )}

      {activeStep === 1 && (
        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography sx={sectionTitleSx}>M1 - Genel Önemlilik</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerCellSx}>Kod</TableCell>
                    <TableCell sx={headerCellSx}>Kriter</TableCell>
                    <TableCell sx={headerCellSx}>Tutar</TableCell>
                    <TableCell sx={headerCellSx}>Seçilen Oran %</TableCell>
                    <TableCell sx={headerCellSx}>Ham Önemlilik</TableCell>
                    <TableCell sx={headerCellSx}>Ağırlık Katsayısı</TableCell>
                    <TableCell sx={headerCellSx}>Ağırlıklı Önemlilik</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workbook.genelOnemlilikSatirlari.map((row) => (
                    <TableRow key={row.kod}>
                      <TableCell>{row.kod}</TableCell>
                      <TableCell>{row.kriter}</TableCell>
                      <TableCell sx={inputCellSx}>{formatNumber(row.tutar)}</TableCell>
                      <TableCell sx={inputCellSx}>
                        <TextField
                          size="small"
                          type="number"
                          value={state.manualOranlar[row.kod] ?? row.secilenOranYuzde}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateState((prev) => ({
                              ...prev,
                              manualOranlar: { ...prev.manualOranlar, [row.kod]: val },
                            }));
                          }}
                          slotProps={{ htmlInput: { step: 0.1 } }}
                        />
                      </TableCell>
                      <TableCell sx={formulaCellSx}>{formatNumber(row.hamOnemlilik)}</TableCell>
                      <TableCell sx={formulaCellSx}>{row.agirlikKatsayisi.toFixed(2)}</TableCell>
                      <TableCell sx={formulaCellSx}>{formatNumber(row.agirlikliOnemlilik)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography sx={sectionTitleSx}>Özet</Typography>
            <Grid container spacing={2}>
              {[
                ["Genel Önemlilik (M)", workbook.ozet.genelOnemlilik],
                ["Performans Önemliliği", workbook.ozet.performansOnemliligi],
                ["De Minimis", workbook.ozet.deMinimis],
                ["Hesap Sabit Pay Tutarı", workbook.ozet.hesapSabitPayTutari],
                ["Kalan Dağıtılabilir Tutar", workbook.ozet.kalanDagitilabilirTutar],
              ].map(([label, value]) => (
                <Grid key={String(label)} size={{ xs: 12, md: 4 }}>
                  <TextField fullWidth label={String(label)} value={formatNumber(Number(value))} InputProps={{ readOnly: true }} />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Stack>
      )}

      {activeStep === 2 && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography sx={sectionTitleSx}>M2 - Hesap Bazında Önemlilik Dağıtımı</Typography>
          <TableContainer sx={{ maxHeight: "65vh" }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={headerCellSx}>Kebir</TableCell>
                  <TableCell sx={headerCellSx}>Hesap Adı</TableCell>
                  <TableCell sx={headerCellSx}>Mizan Tutarı</TableCell>
                  <TableCell sx={headerCellSx}>Risk K</TableCell>
                  <TableCell sx={headerCellSx}>Ağırlık</TableCell>
                  <TableCell sx={headerCellSx}>Ağırlık %</TableCell>
                  <TableCell sx={headerCellSx}>Sabit Pay</TableCell>
                  <TableCell sx={headerCellSx}>Kalan</TableCell>
                  <TableCell sx={headerCellSx}>Dağıtılan Pay</TableCell>
                  <TableCell sx={headerCellSx}>Nihai Önemlilik</TableCell>
                  <TableCell sx={headerCellSx}>Performans Önemliliği</TableCell>
                  <TableCell sx={headerCellSx}>Risk Seviyesi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workbook.hesapDagitimSatirlari.map((row) => {
                  const editable = hesapMap.get(row.kebirKodu);
                  return (
                    <TableRow key={row.kebirKodu}>
                      <TableCell>{row.kebirKodu}</TableCell>
                      <TableCell>{row.hesapAdi}</TableCell>
                      <TableCell sx={formulaCellSx}>{formatNumber(row.mizanTutari)}</TableCell>
                      <TableCell sx={inputCellSx}>
                        <TextField
                          select
                          size="small"
                          value={editable?.riskK ?? row.riskK}
                          onChange={(e) => {
                            const newVal = Number(e.target.value);
                            openConfirm(
                              "Risk Katsayısı Değişikliği",
                              "Risk katsayısını (Risk K) değiştirmek bu hesaba bağlı tüm önemlilik dağıtımlarını ve örnekleme aralıklarını güncelleyecektir. Devam etmek istiyor musunuz?",
                              () => updateHesap(row.kebirKodu, { riskK: newVal })
                            );
                          }}
                          sx={{ minWidth: 100 }}
                        >
                          <MenuItem value={1}>1</MenuItem>
                          <MenuItem value={2}>2</MenuItem>
                          <MenuItem value={3}>3</MenuItem>
                        </TextField>
                      </TableCell>
                      <TableCell sx={formulaCellSx}>{formatNumber(row.agirlikTutari)}</TableCell>
                      <TableCell sx={formulaCellSx}>{formatPercent(row.agirlikOraniYuzde)}</TableCell>
                      <TableCell sx={formulaCellSx}>{formatNumber(row.sabitPay)}</TableCell>
                      <TableCell sx={formulaCellSx}>{formatNumber(row.kalanTutar)}</TableCell>
                      <TableCell sx={formulaCellSx}>{formatNumber(row.dagitilanPay)}</TableCell>
                      <TableCell sx={formulaCellSx}>{formatNumber(row.nihaiOnemlilik)}</TableCell>
                      <TableCell sx={formulaCellSx}>{formatNumber(row.performansOnemliligi)}</TableCell>
                      <TableCell sx={formulaCellSx}>{row.riskSeviyesi}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {activeStep === 3 && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography sx={sectionTitleSx}>M3 - Denetim Riski</Typography>
          <TableContainer sx={{ maxHeight: "65vh" }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={headerCellSx}>Kebir</TableCell>
                  <TableCell sx={headerCellSx}>Hesap Adı</TableCell>
                  <TableCell sx={headerCellSx}>Doğal Risk</TableCell>
                  <TableCell sx={headerCellSx}>Kontrol Riski</TableCell>
                  <TableCell sx={headerCellSx}>ÖYR</TableCell>
                  <TableCell sx={headerCellSx}>TER</TableCell>
                  <TableCell sx={headerCellSx}>Güven Düzeyi</TableCell>
                  <TableCell sx={headerCellSx}>Örnekleme Aralığı</TableCell>
                  <TableCell sx={headerCellSx}>Hesap Önemlilik</TableCell>
                  <TableCell sx={headerCellSx}>Önerilen Yaklaşım</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workbook.denetimRiskiSatirlari.map((row) => {
                  const editable = hesapMap.get(row.kebirKodu);
                  return (
                    <TableRow key={row.kebirKodu}>
                      <TableCell>{row.kebirKodu}</TableCell>
                      <TableCell>{row.hesapAdi}</TableCell>
                      <TableCell sx={inputCellSx}>
                        <TextField
                          size="small"
                          value={editable?.dogalRisk ?? row.dogalRisk}
                          onChange={(e) => updateHesap(row.kebirKodu, { dogalRisk: Number(e.target.value) })}
                        />
                      </TableCell>
                      <TableCell sx={inputCellSx}>
                        <TextField
                          size="small"
                          value={editable?.kontrolRiski ?? row.kontrolRiski}
                          onChange={(e) => updateHesap(row.kebirKodu, { kontrolRiski: Number(e.target.value) })}
                        />
                      </TableCell>
                      <TableCell sx={formulaCellSx}>{formatPercent(row.oyr * 100)}</TableCell>
                      <TableCell sx={formulaCellSx}>{formatPercent(row.ter * 100)}</TableCell>
                      <TableCell sx={formulaCellSx}>{formatPercent(row.guvenDuzeyi * 100)}</TableCell>
                      <TableCell sx={formulaCellSx}>{row.orneklemeAraligi}</TableCell>
                      <TableCell sx={formulaCellSx}>{formatNumber(row.hesapOnemlilikTutari)}</TableCell>
                      <TableCell sx={formulaCellSx}>{row.onerilenYaklasim}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {activeStep === 4 && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography sx={sectionTitleSx}>M4 - Formül Rehberi</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={headerCellSx}>#</TableCell>
                  <TableCell sx={headerCellSx}>Bölüm</TableCell>
                  <TableCell sx={headerCellSx}>Hücre / Konu</TableCell>
                  <TableCell sx={headerCellSx}>Excel Formülü</TableCell>
                  <TableCell sx={headerCellSx}>Açıklama</TableCell>
                  <TableCell sx={headerCellSx}>BDS Dayanağı</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workbook.formulRehberiSatirlari.map((row) => (
                  <TableRow key={row.siraNo}>
                    <TableCell>{row.siraNo}</TableCell>
                    <TableCell>{row.bolum}</TableCell>
                    <TableCell>{row.hucreKonu}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace" }}>{row.excelFormulu}</TableCell>
                    <TableCell>{row.aciklama}</TableCell>
                    <TableCell>{row.bdsDayanagi}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Paper
        elevation={6}
        sx={{
          position: "sticky",
          bottom: 16,
          mt: 3,
          p: 2,
          zIndex: 20,
          borderRadius: 2,
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} spacing={2}>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" disabled={activeStep === 0} onClick={() => setActiveStep((prev) => prev - 1)}>
              Geri
            </Button>
            <Button variant="outlined" disabled={activeStep === steps.length - 1} onClick={() => setActiveStep((prev) => prev + 1)}>
              İleri
            </Button>
          </Stack>
          <Button variant="contained" onClick={() => saveWorkbook()} disabled={saving} startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}>
            {saving ? "Kaydediliyor..." : "Kaydet ve Hesapla"}
          </Button>
        </Stack>
      </Paper>

      {/* Standard Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconAlertTriangle size={24} color="#ff9800" />
            {confirmConfig?.title}
          </Box>
          <IconButton onClick={() => setConfirmOpen(false)} size="small">
            <IconX size={24} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <Typography variant="body1">{confirmConfig?.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setConfirmOpen(false)} variant="outlined" color="inherit">
            Vazgeç
          </Button>
          <Button
            onClick={() => {
              confirmConfig?.onConfirm();
              setConfirmOpen(false);
            }}
            variant="contained"
            color="primary"
            autoFocus
          >
            Onayla ve Devam Et
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default OnemlilikExcelStepper;
