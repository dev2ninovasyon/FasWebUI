"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import SaveIcon from "@mui/icons-material/Save";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import FormOnayBolumu from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/FormOnayBolumu";
import IslemlerCardHtml from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCardHtml";
import {
  createAdatHesaplanmis,
  createAdatOnIzleme,
  deleteAdatHesaplama,
  getAdatHesaplamaDetay,
  getAdatHesaplamalar,
  getAdatKebirKodlari,
} from "@/api/Hesaplamalar/Hesaplamalar";
import usePageTitle from "@/hooks/usePageTitle";
import { useSelector } from "@/store/hooks";

type HesapTipi = "KASA_HESABI" | "KASA_DISI_AKTIF_HESAPLAR" | "PASIF_HESAPLAR";

interface KebirOption {
  kod: number;
  adi: string;
}

interface AdatHesaplamaListe {
  id: number;
  hesaplamaAdi?: string;
  genelToplamFaiz?: number;
  genelToplamTLFaiz?: number;
  hesaplamaTarihi?: string;
  baslangicTarihi?: string;
  bitisTarihi?: string;
}

interface AdatOzet {
  kebirKodu: string;
  hesapAdi: string;
  hesapTipi: HesapTipi;
  satirSayisi: number;
  toplamGun: number;
  toplamFaizMatrahi: number;
  toplamTLFaizMatrahi: number;
  toplamFaiz: number;
  toplamTLFaiz: number;
  ilkTarih?: string;
  sonTarih?: string;
}

interface AdatDetay {
  kebirKodu: string;
  hesapAdi: string;
  hesapTipi: HesapTipi;
  tarih?: string;
  fisNo?: string;
  aciklama?: string;
  borc: number;
  alacak: number;
  bakiye: number;
  paraBirimi: string;
  dovizBorc: number;
  dovizAlacak: number;
  dovizliBakiye: number;
  dovizKuru: number;
  kurTarihi?: string;
  kurKaynak: string;
  tlBakiye: number;
  makulBakiye?: number | null;
  kalanBakiye?: number | null;
  gun: number;
  faizOrani: number;
  faizOraniTarihi?: string;
  faizKaynak: string;
  faizMatrahi: number;
  faizTutari: number;
  tlFaizMatrahi: number;
  tlFaizTutari: number;
  siraNo: number;
}

interface OnIzlemeDetay {
  kebirKodu: string;
  hesapAdi: string;
  hesapTipi: HesapTipi;
  tarih?: string;
  fisNo?: string;
  aciklama?: string;
  dovizBorc: number;
  dovizAlacak: number;
  dovizliBakiye: number;
  paraBirimi: string;
  siraNo: number;
}

interface AdatResult {
  hesaplamaId?: number;
  genelToplamFaiz: number;
  genelToplamTLFaiz: number;
  ozetler: AdatOzet[];
  detaylar: AdatDetay[];
  uyarilar?: string[];
}

const BCrumb = [
  { to: "/Hesaplamalar", title: "Hesaplamalar" },
  { to: "/Hesaplamalar/adat-hesaplama", title: "Adat Hesaplama" },
];

const hesapTipiEtiketleri: Record<HesapTipi, string> = {
  KASA_HESABI: "Kasa Hesabı",
  KASA_DISI_AKTIF_HESAPLAR: "Kasa Dışı Aktif Hesaplar",
  PASIF_HESAPLAR: "Pasif Hesaplar",
};

const kolonlarStandart: Record<HesapTipi, string[]> = {
  KASA_HESABI: ["Tarih", "Borç Tutarı", "Alacak Tutarı", "Bakiye", "Makul Bakiye", "Kalan Bakiye", "Geçen Gün Sayısı", "Faiz Oranı", "Adat Faiz Tutarı"],
  KASA_DISI_AKTIF_HESAPLAR: ["Tarih", "Borç Tutarı", "Alacak Tutarı", "Bakiye", "Geçen Gün Sayısı", "Faiz Oranı", "Adat Faiz Tutarı"],
  PASIF_HESAPLAR: ["Tarih", "Borç Tutarı", "Alacak Tutarı", "Bakiye", "Geçen Gün Sayısı", "Faiz Oranı", "Adat Faiz Tutarı"],
};

const kolonlarDetayli: Record<HesapTipi, string[]> = {
  KASA_HESABI: ["Tarih", "Fiş No", "Açıklama", "Borç Tutarı", "Alacak Tutarı", "Bakiye", "Makul Bakiye", "Kalan Bakiye", "Geçen Gün Sayısı", "Faiz Oranı", "Faiz Kaynağı", "Adat Faiz Tutarı"],
  KASA_DISI_AKTIF_HESAPLAR: ["Tarih", "Fiş No", "Açıklama", "Borç Tutarı", "Alacak Tutarı", "Bakiye", "Geçen Gün Sayısı", "Faiz Oranı", "Faiz Kaynağı", "Adat Faiz Tutarı"],
  PASIF_HESAPLAR: ["Tarih", "Fiş No", "Açıklama", "Borç Tutarı", "Alacak Tutarı", "Bakiye", "Geçen Gün Sayısı", "Faiz Oranı", "Faiz Kaynağı", "Adat Faiz Tutarı"],
};

const numericColumns = new Set([
  "Borç Tutarı", "Alacak Tutarı", "Bakiye", "Makul Bakiye", "Kalan Bakiye",
  "Geçen Gün Sayısı", "Faiz Oranı", "Adat Faiz Tutarı",
]);

function fmtNum(value?: number | null, dec = 2) {
  return (value ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function fmtDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("tr-TR");
}

function cellValue(row: AdatDetay, col: string) {
  switch (col) {
    case "Tarih": return fmtDate(row.tarih);
    case "Fiş No": return row.fisNo ?? "";
    case "Açıklama": return row.aciklama ?? "";
    case "Borç":
    case "Borç Tutarı": return fmtNum(row.borc);
    case "Alacak":
    case "Alacak Tutarı": return fmtNum(row.alacak);
    case "Bakiye": return fmtNum(row.bakiye);
    case "Para Birimi": return row.paraBirimi;
    case "Döviz Borç": return fmtNum(row.dovizBorc);
    case "Döviz Alacak": return fmtNum(row.dovizAlacak);
    case "Dövizli Bakiye": return fmtNum(row.dovizliBakiye);
    case "Döviz Kuru": return fmtNum(row.dovizKuru, 4);
    case "Kur Tarihi": return fmtDate(row.kurTarihi);
    case "Kur Kaynağı": return row.kurKaynak;
    case "TL Bakiye": return fmtNum(row.tlBakiye);
    case "Makul Bakiye": return fmtNum(row.makulBakiye);
    case "Kalan Bakiye": return fmtNum(row.kalanBakiye);
    case "Gün":
    case "Geçen Gün Sayısı": return row.gun;
    case "Faiz Oranı": return `%${fmtNum(row.faizOrani)}`;
    case "Faiz Kaynağı": return row.faizKaynak;
    case "TL Faiz Matrahı": return fmtNum(row.tlFaizMatrahi);
    case "Adat Faiz Tutarı":
    case "TL Faiz Tutarı": return fmtNum(row.tlFaizTutari);
    default: return "";
  }
}

function hesapTipiBelirle(kod: number): HesapTipi | null {
  if (kod === 100) return "KASA_HESABI";
  if ((kod >= 101 && kod <= 199) || (kod >= 200 && kod <= 299)) return "KASA_DISI_AKTIF_HESAPLAR";
  if (kod >= 300 && kod <= 599) return "PASIF_HESAPLAR";
  return null;
}

const AdatHesaplamaPage = () => {
  usePageTitle("Adat Hesaplama");

  const user = useSelector((state) => state.userReducer);
  const selectedYear = user?.yil && user.yil > 0 ? user.yil : new Date().getFullYear();
  const denetciId = user?.denetciId ?? 0;
  const denetlenenId = user?.denetlenenId ?? 0;

  const [baslangicTarihi, setBaslangicTarihi] = useState(`${selectedYear}-01-01`);
  const [bitisTarihi, setBitisTarihi] = useState(`${selectedYear}-12-31`);
  const [selectedKebir, setSelectedKebir] = useState<KebirOption | null>(null);
  const [kebirKodlari, setKebirKodlari] = useState<KebirOption[]>([]);
  const [makulKasaBakiyesi, setMakulKasaBakiyesi] = useState("");
  const [hesaplamaAdi, setHesaplamaAdi] = useState("");
  const [history, setHistory] = useState<AdatHesaplamaListe[]>([]);
  const [result, setResult] = useState<AdatResult | null>(null);
  const [activeKebir, setActiveKebir] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [historySearch, setHistorySearch] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingKebir, setLoadingKebir] = useState(false);
  const [kebirLoaded, setKebirLoaded] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewRows, setPreviewRows] = useState<OnIzlemeDetay[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [gorunumModu, setGorunumModu] = useState<"standart" | "detayli">("standart");

  const selectedTip = useMemo(
    () => selectedKebir ? { ...selectedKebir, hesapTipi: hesapTipiBelirle(selectedKebir.kod) } : null,
    [selectedKebir]
  );

  const filteredHistory = useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    if (!q) return history;
    return history.filter((item) => (item.hesaplamaAdi ?? "").toLowerCase().includes(q));
  }, [history, historySearch]);

  const detayGruplari = useMemo(() => {
    const groups = new Map<string, AdatDetay[]>();
    (result?.detaylar ?? []).forEach((row) => {
      if (!groups.has(row.kebirKodu)) groups.set(row.kebirKodu, []);
      groups.get(row.kebirKodu)!.push(row);
    });
    return Array.from(groups.entries()).map(([kebirKodu, rows]) => ({ kebirKodu, rows }));
  }, [result]);

  const previewGruplari = useMemo(() => {
    const groups = new Map<string, OnIzlemeDetay[]>();
    previewRows.forEach((row) => {
      if (!groups.has(row.kebirKodu)) groups.set(row.kebirKodu, []);
      groups.get(row.kebirKodu)!.push(row);
    });
    return Array.from(groups.entries()).map(([kebirKodu, rows]) => ({ kebirKodu, rows }));
  }, [previewRows]);

  const handleVeriYukle = useCallback(async () => {
    if (!denetciId || !denetlenenId) {
      setMessage("Kullanıcı veya denetlenen bilgisi eksik.");
      return;
    }
    if (!selectedKebir) {
      setMessage("Kebir kodu seçin.");
      return;
    }
    if (!hesapTipiBelirle(selectedKebir.kod)) {
      setMessage(`${selectedKebir.kod}: Seçilen kebir kodu adat hesaplama kapsamına uygun değildir.`);
      return;
    }
    setLoadingPreview(true);
    setMessage(null);
    setResult(null);
    try {
      const response = await createAdatOnIzleme(
        denetciId, selectedYear, denetlenenId,
        baslangicTarihi, bitisTarihi,
        [selectedKebir.kod],
        "TL", "Satis"
      );
      if (response.success) {
        setPreviewRows(response.data ?? []);
        setMakulKasaBakiyesi("");
      } else {
        setMessage("Veriler yüklenemedi.");
      }
    } finally {
      setLoadingPreview(false);
    }
  }, [denetciId, denetlenenId, selectedKebir, selectedYear, baslangicTarihi, bitisTarihi]);

  const loadHistory = useCallback(async () => {
    if (!denetlenenId || !selectedYear) return;
    setLoadingHistory(true);
    try {
      const response = await getAdatHesaplamalar(denetciId, selectedYear, denetlenenId);
      setHistory(Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []);
    } finally {
      setLoadingHistory(false);
    }
  }, [denetciId, denetlenenId, selectedYear]);

  const handleHesapla = useCallback(async () => {
    if (!denetciId || !denetlenenId) {
      setMessage("Kullanıcı veya denetlenen bilgisi eksik.");
      return;
    }
    if (!selectedKebir || previewRows.length === 0) {
      setMessage("Önce 'Verileri Yükle' butonuna tıklayın.");
      return;
    }

    const hasKasa = selectedTip?.hesapTipi === "KASA_HESABI";
    if (hasKasa) {
      const val = makulKasaBakiyesi.trim();
      if (val === "" || isNaN(Number(val.replace(",", ".")))) {
        setMessage("Kasa hesabı için makul kasa bakiyesi girilmelidir.");
        return;
      }
    }

    setCalculating(true);
    setMessage(null);
    try {
      const response = await createAdatHesaplanmis(
        denetciId,
        selectedYear,
        denetlenenId,
        baslangicTarihi,
        bitisTarihi,
        [selectedKebir.kod],
        hesaplamaAdi,
        hasKasa && makulKasaBakiyesi.trim() !== "" ? Number(makulKasaBakiyesi.replace(",", ".")) : null,
        true,
        "TL",
        "EVDS",
        "Satis"
      );
      if (!response?.success) {
        setMessage(response?.message || "Adat hesaplama yapılamadı.");
        return;
      }
      const nextResult: AdatResult = response.data;
      setResult(nextResult);
      setActiveKebir(nextResult.ozetler?.[0]?.kebirKodu ?? "");
      setMessage("Adat hesaplama başarıyla tamamlandı.");
      await loadHistory();
    } finally {
      setCalculating(false);
    }
  }, [denetciId, denetlenenId, selectedKebir, selectedTip, selectedYear, baslangicTarihi, bitisTarihi, hesaplamaAdi, makulKasaBakiyesi, previewRows, loadHistory]);

  const selectHistoryItem = useCallback(async (id: number) => {
    setMessage(null);
    setPreviewRows([]);
    const response = await getAdatHesaplamaDetay(id);
    const nextResult: AdatResult | undefined = response?.data;
    if (nextResult) {
      setResult(nextResult);
      setActiveKebir(nextResult.ozetler?.[0]?.kebirKodu ?? "");
    }
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    setDeletingId(id);
    try {
      const response = await deleteAdatHesaplama(id);
      if (response?.success) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
        if (result?.hesaplamaId === id) setResult(null);
      }
    } finally {
      setDeletingId(null);
    }
  }, [result?.hesaplamaId]);

  const buildHtmlAsync = useCallback(async () => {
    const activeResult = result;
    if (!activeResult) return "<p>Adat hesaplama sonucu bulunamadı.</p>";
    const kolonlar = gorunumModu === "standart" ? kolonlarStandart : kolonlarDetayli;
    let html = `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"/><style>@page{size:A4 landscape;margin:1cm;}body{font-family:Arial,sans-serif;font-size:10px;color:#000;}table{width:100%;border-collapse:collapse;margin-bottom:14px;}th,td{border:1px solid #333;padding:4px 6px;}th{font-weight:bold;text-align:center;}td.num{text-align:right;}h2{text-align:center;font-size:13px;}h3{font-size:11px;margin:14px 0 4px;}</style></head><body>`;
    html += `<h2>ADAT HESAPLAMA TABLOSU</h2>`;
    activeResult.ozetler.forEach((ozet) => {
      const rows = activeResult.detaylar.filter((d) => d.kebirKodu === ozet.kebirKodu);
      html += `<h3>${ozet.kebirKodu} - ${ozet.hesapAdi} (${hesapTipiEtiketleri[ozet.hesapTipi]})</h3>`;
      html += `<p>Toplam TL Faiz Matrahı: ${fmtNum(ozet.toplamTLFaizMatrahi)} | Toplam TL Faiz: ${fmtNum(ozet.toplamTLFaiz)}</p><table><thead><tr>`;
      kolonlar[ozet.hesapTipi].forEach((col) => { html += `<th>${col}</th>`; });
      html += `</tr></thead><tbody>`;
      rows.forEach((row) => {
        html += `<tr>`;
        kolonlar[ozet.hesapTipi].forEach((col) => {
          html += `<td class="${numericColumns.has(col) ? "num" : ""}">${cellValue(row, col)}</td>`;
        });
        html += `</tr>`;
      });
      html += `</tbody></table>`;
    });
    html += `<h3>Genel Toplam TL Faiz: ${fmtNum(activeResult.genelToplamTLFaiz)}</h3></body></html>`;
    return html;
  }, [result, gorunumModu]);

  const exportExcel = useCallback(async () => {
    if (!result) return;
    const [{ default: ExcelJS }, fileSaver] = await Promise.all([
      import("exceljs"),
      import("file-saver"),
    ]);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "FAS";
    workbook.created = new Date();
    const kolonlar = gorunumModu === "standart" ? kolonlarStandart : kolonlarDetayli;

    const summary = workbook.addWorksheet("Özet");
    summary.addRow(["Kebir Kodu", "Hesap Adı", "Hesap Tipi", "Toplam Gün", "Toplam TL Faiz Matrahı", "Toplam TL Faiz", "Satır Sayısı"]);
    result.ozetler.forEach((row) => {
      summary.addRow([row.kebirKodu, row.hesapAdi, hesapTipiEtiketleri[row.hesapTipi], row.toplamGun, row.toplamTLFaizMatrahi, row.toplamTLFaiz, row.satirSayisi]);
    });
    summary.addRow([]);
    summary.addRow(["Genel Toplam TL Faiz", result.genelToplamTLFaiz]);
    summary.getRow(1).font = { bold: true };

    result.ozetler.forEach((ozet) => {
      const sheetName = `${ozet.kebirKodu}`.substring(0, 31);
      const sheet = workbook.addWorksheet(sheetName);
      const cols = kolonlar[ozet.hesapTipi];
      sheet.addRow(cols);
      result.detaylar.filter((d) => d.kebirKodu === ozet.kebirKodu).forEach((row) => {
        sheet.addRow(cols.map((col) => cellValue(row, col)));
      });
      sheet.getRow(1).font = { bold: true };
      sheet.columns.forEach((column) => { column.width = 18; });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    fileSaver.saveAs(blob, `Adat_Hesaplama_${selectedYear}.xlsx`);
  }, [result, selectedYear, gorunumModu]);

  useEffect(() => {
    setBaslangicTarihi(`${selectedYear}-01-01`);
    setBitisTarihi(`${selectedYear}-12-31`);
  }, [selectedYear]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    setKebirLoaded(false);
    setKebirKodlari([]);
  }, [denetciId, denetlenenId, selectedYear, baslangicTarihi, bitisTarihi]);

  const handleKebirOpen = useCallback(async () => {
    if (loadingKebir || kebirLoaded || !denetciId || !denetlenenId || !selectedYear) return;
    setLoadingKebir(true);
    try {
      const items = await getAdatKebirKodlari(denetciId, selectedYear, denetlenenId, baslangicTarihi, bitisTarihi);
      const list = Array.isArray(items) ? items : [];
      setKebirKodlari(list);
      if (list.length > 0) setKebirLoaded(true); // boş gelirse retry'a izin ver
    } finally {
      setLoadingKebir(false);
    }
  }, [loadingKebir, kebirLoaded, denetciId, denetlenenId, selectedYear, baslangicTarihi, bitisTarihi]);

  return (
    <PageContainer title="Adat Hesaplama" description="E-Defter kebir verilerine göre adat hesaplaması yapın.">
      <Breadcrumb title="Adat Hesaplama" items={BCrumb} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Hesaplama Parametreleri</Typography>
                <TextField size="small" label="Hesaplama Adı" value={hesaplamaAdi} onChange={(e) => setHesaplamaAdi(e.target.value)} />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <TextField size="small" label="Başlangıç Tarihi" type="date" value={baslangicTarihi} onChange={(e) => setBaslangicTarihi(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
                  <TextField size="small" label="Bitiş Tarihi" type="date" value={bitisTarihi} onChange={(e) => setBitisTarihi(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
                </Stack>
                <Autocomplete
                  options={kebirKodlari}
                  getOptionLabel={(o) => `${o.kod} - ${o.adi}`}
                  value={selectedKebir}
                  onChange={(_, value) => { setSelectedKebir(value); setPreviewRows([]); setResult(null); }}
                  onOpen={() => void handleKebirOpen()}
                  size="small"
                  loading={loadingKebir}
                  loadingText="Kebir kodları yükleniyor..."
                  noOptionsText={kebirLoaded ? "Kebir kodu bulunamadı" : "Açmak için tıklayın"}
                  renderInput={(params) => <TextField {...params} label="Kebir Kodu" placeholder="Tıklayarak kod seçin" />}
                />
                {selectedTip && (
                  <Chip
                    size="small"
                    color={selectedTip.hesapTipi ? "primary" : "error"}
                    label={selectedTip.hesapTipi ? hesapTipiEtiketleri[selectedTip.hesapTipi] : "Kapsam Dışı"}
                    sx={{ alignSelf: "flex-start" }}
                  />
                )}
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" fullWidth startIcon={loadingPreview ? <CircularProgress size={16} /> : undefined} disabled={loadingPreview || calculating} onClick={() => void handleVeriYukle()}>
                    {loadingPreview ? "Yükleniyor..." : "Verileri Yükle"}
                  </Button>
                  <Button variant="contained" fullWidth startIcon={calculating ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />} disabled={calculating || loadingPreview || previewRows.length === 0} onClick={() => void handleHesapla()}>
                    {calculating ? "Hesaplanıyor..." : "Hesapla ve Kaydet"}
                  </Button>
                </Stack>
                {message && <Alert severity={message.includes("başarıyla") ? "success" : "warning"}>{message}</Alert>}
              </Stack>
            </CardContent>
          </Card>

          <Box mt={2}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Geçmiş Hesaplamalar</Typography>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Hesaplama adı ara..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                  sx={{ mb: 1 }}
                />
                {loadingHistory ? (
                  <Stack spacing={0.5}>{[1, 2, 3].map((i) => <Skeleton key={i} height={40} variant="rounded" />)}</Stack>
                ) : (
                  <Stack spacing={0.5} sx={{ maxHeight: 320, overflowY: "auto" }}>
                    {filteredHistory.map((item) => (
                      <Stack key={item.id} direction="row" spacing={0.5}>
                        <Button variant={result?.hesaplamaId === item.id ? "contained" : "outlined"} size="small" onClick={() => void selectHistoryItem(item.id)} sx={{ flex: 1, justifyContent: "space-between", textTransform: "none" }}>
                          <span>{item.hesaplamaAdi || `Adat Hesaplama #${item.id}`}</span>
                          <span>{fmtNum(item.genelToplamTLFaiz ?? item.genelToplamFaiz)}</span>
                        </Button>
                        <Tooltip title="Sil">
                          <IconButton size="small" color="error" disabled={deletingId === item.id} onClick={() => void handleDelete(item.id)}>
                            {deletingId === item.id ? <CircularProgress size={16} color="error" /> : <DeleteIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    ))}
                    {filteredHistory.length === 0 && <Typography variant="body2" color="text.secondary">Henüz hesaplama kaydı yok.</Typography>}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          {!result && previewRows.length > 0 && (
            <Stack spacing={2} mb={2}>
              {previewGruplari.map((group) => {
                const isKasa = group.rows[0]?.hesapTipi === "KASA_HESABI";
                const mkb = makulKasaBakiyesi.trim() !== "" ? Number(makulKasaBakiyesi.replace(",", ".")) : 0;
                return (
                  <Card key={group.kebirKodu}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="subtitle1">
                          {group.kebirKodu} — {group.rows[0]?.hesapAdi} ({hesapTipiEtiketleri[group.rows[0]?.hesapTipi ?? "KASA_DISI_AKTIF_HESAPLAR"]})
                        </Typography>
                        <Typography variant="body2" color="text.secondary">{group.rows.length} satır</Typography>
                      </Stack>
                      <TableContainer sx={{ maxHeight: 420, overflow: "auto" }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell>Tarih</TableCell>
                              <TableCell align="right">Borç Tutarı</TableCell>
                              <TableCell align="right">Alacak Tutarı</TableCell>
                              <TableCell align="right">Bakiye</TableCell>
                              {isKasa && <TableCell align="right" sx={{ minWidth: 150 }}>Makul Bakiye ₺</TableCell>}
                              {isKasa && <TableCell align="right">Kalan Bakiye</TableCell>}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {group.rows.map((row, idx) => {
                              const kalan = isKasa ? Math.max((row.dovizliBakiye ?? 0) - mkb, 0) : 0;
                              return (
                                <TableRow key={`${row.kebirKodu}-${row.siraNo}`} hover>
                                  <TableCell>{fmtDate(row.tarih)}</TableCell>
                                  <TableCell align="right">{fmtNum(row.dovizBorc)}</TableCell>
                                  <TableCell align="right">{fmtNum(row.dovizAlacak)}</TableCell>
                                  <TableCell align="right">{fmtNum(row.dovizliBakiye)}</TableCell>
                                  {isKasa && (
                                    <TableCell align="right">
                                      {idx === 0 ? (
                                        <TextField
                                          size="small"
                                          value={makulKasaBakiyesi}
                                          onChange={(e) => setMakulKasaBakiyesi(e.target.value)}
                                          error={makulKasaBakiyesi.trim() === ""}
                                          inputProps={{ style: { textAlign: "right" } }}
                                          sx={{ width: 130 }}
                                        />
                                      ) : (
                                        fmtNum(mkb)
                                      )}
                                    </TableCell>
                                  )}
                                  {isKasa && <TableCell align="right">{fmtNum(kalan)}</TableCell>}
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
          {result ? (
            <Stack spacing={2}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6">Özet</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={() => void exportExcel()}>
                        Excel
                      </Button>
                      <Typography variant="h6">Genel Toplam TL Faiz: {fmtNum(result.genelToplamTLFaiz)}</Typography>
                    </Stack>
                  </Stack>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Kebir Kodu</TableCell>
                          <TableCell>Hesap Adı</TableCell>
                          <TableCell>Hesap Tipi</TableCell>
                          <TableCell align="right">Toplam Gün</TableCell>
                          <TableCell align="right">Toplam TL Faiz Matrahı</TableCell>
                          <TableCell align="right">Toplam TL Faiz</TableCell>
                          <TableCell align="right">Satır Sayısı</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {result.ozetler.map((row) => (
                          <TableRow key={row.kebirKodu} hover>
                            <TableCell>{row.kebirKodu}</TableCell>
                            <TableCell>{row.hesapAdi}</TableCell>
                            <TableCell>{hesapTipiEtiketleri[row.hesapTipi]}</TableCell>
                            <TableCell align="right">{row.toplamGun}</TableCell>
                            <TableCell align="right">{fmtNum(row.toplamTLFaizMatrahi)}</TableCell>
                            <TableCell align="right">{fmtNum(row.toplamTLFaiz)}</TableCell>
                            <TableCell align="right">{row.satirSayisi}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Tabs value={activeKebir} onChange={(_, value) => setActiveKebir(value)} variant="scrollable" scrollButtons="auto">
                      {detayGruplari.map((group) => <Tab key={group.kebirKodu} value={group.kebirKodu} label={group.kebirKodu} />)}
                    </Tabs>
                    <ToggleButtonGroup value={gorunumModu} exclusive onChange={(_, v) => v && setGorunumModu(v)} size="small" sx={{ ml: 1, flexShrink: 0 }}>
                      <ToggleButton value="standart">Standart (Excel)</ToggleButton>
                      <ToggleButton value="detayli">Detaylı</ToggleButton>
                    </ToggleButtonGroup>
                  </Stack>
                  {detayGruplari.filter((group) => group.kebirKodu === activeKebir).map((group) => {
                    const tip = group.rows[0]?.hesapTipi ?? "KASA_DISI_AKTIF_HESAPLAR";
                    const aktifKolonlar = gorunumModu === "standart" ? kolonlarStandart[tip] : kolonlarDetayli[tip];
                    return (
                      <TableContainer key={group.kebirKodu} sx={{ maxHeight: 520, overflow: "auto" }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>{aktifKolonlar.map((col) => <TableCell key={col} align={numericColumns.has(col) ? "right" : "left"}>{col}</TableCell>)}</TableRow>
                          </TableHead>
                          <TableBody>
                            {group.rows.map((row) => (
                              <TableRow key={`${row.kebirKodu}-${row.siraNo}`} hover>
                                {aktifKolonlar.map((col) => (
                                  <TableCell key={col} align={numericColumns.has(col) ? "right" : "left"}>{cellValue(row, col)}</TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    );
                  })}
                </CardContent>
              </Card>
            </Stack>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Kebir kodu seçip <b>Verileri Yükle</b> butonuna tıklayın. Satırlar yüklendikten sonra makul kasa bakiyesini girin ve <b>Hesapla ve Kaydet</b> butonuna tıklayın.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      <FormOnayBolumu controller="AdatHesaplama" />
      <Box mt={2}>
        <Divider sx={{ mb: 2 }} />
        <IslemlerCardHtml controller="AdatHesaplama" buildHtmlAsync={buildHtmlAsync} previewEndpoint="/ArsivIslemleri/WordDosyasiniPdfOlarakOnizleHtml" />
      </Box>
    </PageContainer>
  );
};

export default AdatHesaplamaPage;
