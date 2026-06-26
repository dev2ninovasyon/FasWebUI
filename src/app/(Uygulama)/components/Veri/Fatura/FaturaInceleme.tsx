"use client";
import "@/lib/handsontableSetup";
import CustomHotTable from "@/components/HotTableWrapper";

import {
  Box, Grid, Button, ToggleButtonGroup, ToggleButton, Typography,
  CircularProgress, Pagination, FormControl, InputLabel, Select, MenuItem,
  Paper, Tabs, Tab, Chip, Stack, TextField, Card, CardContent, Divider,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, LinearProgress, TablePagination, Alert, Tooltip,
  Menu, ListItemIcon, Collapse, Dialog, DialogContent,
} from "@mui/material";
import {
  IconDownload, IconFileWord, IconRefresh, IconChevronRight,
  IconChevronDown, IconEye, IconFileSpreadsheet,
} from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "@/store/hooks";
import { AppState } from "@/store/store";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import { enqueueSnackbar, closeSnackbar } from "notistack";
import { saveAs } from "file-saver";
import {
  fetchPagedFaturalarLite, fetchFaturaDetail, Fatura, FaturaListItem, FaturaSatiri,
  findInvoiceYevmiyeRowsByVkn, previewFaturaHtmlNewTab,
  getFilteredPagedFaturalar, getYuklenenFaturaTipleri, getFiltreSecenekleri,
  downloadFaturaKontrolRaporuWord, getEdefterEslesmeAnalizi,
  FaturaEdefterEslesmeAnalizi, FaturaEdefterEslesmeItem, FaturaDetailItem,
} from "@/api/Fatura/FaturaApi";
import { getIrsaliyeKarsilastirma, Karsilastirma } from "@/api/Fatura/IrsaliyeApi";
import YevmiyeFaturaDialog from "@/app/(Uygulama)/components/Veri/Fatura/YevmiyeFaturaDialog";

type Props = { tip?: string; pageSize?: number };
type Ctx = { tip: string; vkn: string };

const LOADING_SNACK_KEY = "yevmiye-fetching";

function TabPanel(props: { children: React.ReactNode; value: number; index: number }) {
  if (props.value !== props.index) return null;
  return <Box sx={{ mt: 2 }}>{props.children}</Box>;
}

const FaturaInceleme: React.FC<Props> = ({ tip = "Alınan", pageSize = 10 }) => {
  const user = useSelector((s: AppState) => s.userReducer);
  const customizer = useSelector((s: AppState) => s.customizer);
  const dispatch = useDispatch();

  const [tab, setTab] = useState(0);

  useEffect(() => {
    const load = async () => {
      dispatch(setCollapse(true));
      await import(
        customizer.activeMode === "dark"
          ? "@/app/(Uygulama)/components/Veri/HandsOnTable/HandsOnTableDark.css"
          : "@/app/(Uygulama)/components/Veri/HandsOnTable/HandsOnTableLight.css"
      );
    };
    load();
  }, [customizer.activeMode, dispatch]);

  return (
    <>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1 }}>
        <Tab label="Fatura İnceleme" />
        <Tab label="Defter Eşleştirme" />
        <Tab label="İrsaliye Karşılaştırma" />
        <Tab label="Fatura Listesi" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <FaturaIncelemeTab tip={tip} pageSize={pageSize} user={user} customizer={customizer} dispatch={dispatch} />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <DefterEslestirmeTab user={user} />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <IrsaliyeKarsilastirmaTab user={user} />
      </TabPanel>
      <TabPanel value={tab} index={3}>
        <FaturaListesiTab user={user} tip={tip} />
      </TabPanel>
    </>
  );
};

export default FaturaInceleme;

/* ============= TAB 1: Fatura İnceleme (original) ============= */
const FaturaIncelemeTab: React.FC<{ tip: string; pageSize: number; user: any; customizer: any; dispatch: any }> = ({
  tip, pageSize, user, customizer, dispatch
}) => {
  const hotRef = useRef<any>(null);
  const linesRef = useRef<any>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [currentTip, setCurrentTip] = useState(tip);
  const [items, setItems] = useState<FaturaListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [detailCache, setDetailCache] = useState<Record<string, Fatura>>({});
  const [yevOpen, setYevOpen] = useState(false);
  const [ctx, setCtx] = useState<Ctx | null>(null);
  const [yevRows, setYevRows] = useState<any[]>([]);

  const filters: Record<string, string[]> = {};
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

  const loadData = async () => {
    if (!user?.denetciId || !user?.yil || !user?.denetlenenId) return;
    setListLoading(true);
    try {
      const data = await fetchPagedFaturalarLite(user.denetciId, user.yil, user.denetlenenId, page, rowsPerPage, currentTip, filters);
      setItems(data.items);
      setTotal(data.totalCount);
      if (!data.items.some((x) => x.id === selectedInvoiceId)) setSelectedInvoiceId(data.items[0]?.id ?? null);
    } catch (e: any) { enqueueSnackbar(e?.message || "Veri alınamadı", { variant: "error" }); }
    finally { setListLoading(false); }
  };

  useEffect(() => { void loadData(); }, [page, currentTip, rowsPerPage]);

  useEffect(() => {
    const loadDetail = async () => {
      if (!selectedInvoiceId || detailCache[selectedInvoiceId] || !user?.denetciId || !user?.yil || !user?.denetlenenId) return;
      setDetailLoading(true);
      try {
        const detail = await fetchFaturaDetail(user.denetciId, user.yil, user.denetlenenId, selectedInvoiceId);
        setDetailCache((prev) => ({ ...prev, [selectedInvoiceId]: detail }));
      } catch (e: any) { enqueueSnackbar(e?.message || "Fatura detayı alınamadı", { variant: "error" }); }
      finally { setDetailLoading(false); }
    };
    void loadDetail();
  }, [selectedInvoiceId, detailCache, user]);

  const selectedFatura: Fatura | null = selectedInvoiceId ? (detailCache[selectedInvoiceId] ?? null) : null;
  const selectedPreviewUrl = selectedFatura?.faturaDosyaId ? previewUrls[selectedFatura.faturaDosyaId] : null;

  useEffect(() => {
    const loadPreview = async () => {
      const dosyaId = selectedFatura?.faturaDosyaId;
      if (!dosyaId) { setPreviewError("Seçili faturada önizlenecek dosya bulunamadı."); return; }
      if (previewUrls[dosyaId]) { setPreviewError(null); return; }
      setPreviewLoading(true); setPreviewError(null);
      try {
        const blob = await previewFaturaHtmlNewTab(user, dosyaId);
        setPreviewUrls((prev) => ({ ...prev, [dosyaId]: URL.createObjectURL(blob) }));
      } catch (e: any) { setPreviewError(e?.message || "Fatura önizlemesi alınamadı."); }
      finally { setPreviewLoading(false); }
    };
    if (selectedFatura?.faturaDosyaId && user?.token) void loadPreview();
    else if (selectedInvoiceId) setPreviewError("Seçili faturada önizlenecek dosya bulunamadı.");
  }, [selectedFatura?.faturaDosyaId, selectedInvoiceId, user?.token]);

  useEffect(() => () => { Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url)); }, [previewUrls]);

  const masterRows = useMemo(() =>
    items.map((f) => [f.id, f.faturaNumarasi ?? "", (f.faturaTarihi || "").substring(0, 10).split("-").reverse().join("."), currentTip === "Alınan" ? (f.tedarikciAd ?? "") : (f.aliciAd ?? ""), f.paraBirimi ?? "", f.odenecekTutar ?? 0]),
    [items, currentTip]);

  const masterHeaders = ["Id", "Fatura No", "Tarih", currentTip === "Alınan" ? "Düzenleyen" : "Alıcı", "PB", "Tutar"];
  const masterColumns = [
    { readOnly: true }, { type: "text", readOnly: true }, { type: "text", readOnly: true },
    { type: "text", readOnly: true }, { type: "text", readOnly: true },
    { type: "numeric", readOnly: true, numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, className: "htRight" },
  ];

  const lineRows = useMemo(() => {
    const lines = (selectedFatura?.faturaSatirlari ?? []) as FaturaSatiri[];
    return lines.map((s) => [
      s.id, s.aciklama ?? "", s.miktar, s.birimKodu ?? "", s.birimFiyat, s.satirToplamTutar,
      s.vergi?.vergiKodu ?? "", s.vergi?.vergiTuru ?? "", s.vergi?.oran ?? null,
      s.vergi?.vergiMatrahi ?? null, s.vergi?.vergiTutari ?? null,
    ]);
  }, [selectedFatura]);

  const lineHeaders = ["Id", "Açıklama", "Miktar", "Birim", "Fiyat", "Toplam", "V.Kodu", "V.Türü", "Oran", "Matrah", "Vergi"];
  const lineColumns = [
    { readOnly: true }, { type: "text", readOnly: true },
    { type: "numeric", readOnly: true, numericFormat: { pattern: "0,0.00", culture: "tr-TR" } },
    { type: "text", readOnly: true },
    { type: "numeric", readOnly: true, numericFormat: { pattern: "0,0.0000", culture: "tr-TR" } },
    { type: "numeric", readOnly: true, numericFormat: { pattern: "0,0.00", culture: "tr-TR" } },
    { type: "text", readOnly: true }, { type: "text", readOnly: true },
    { type: "numeric", readOnly: true, numericFormat: { pattern: "0,0.##", culture: "tr-TR" } },
    { type: "numeric", readOnly: true, numericFormat: { pattern: "0,0.00", culture: "tr-TR" } },
    { type: "numeric", readOnly: true, numericFormat: { pattern: "0,0.00", culture: "tr-TR" } },
  ];

  const handleExportExcel = async () => {
    const { default: ExcelJS } = await import("exceljs");
    const wb = new ExcelJS.Workbook();
    const ws1 = wb.addWorksheet("Faturalar");
    ws1.addRow(masterHeaders.slice(1));
    masterRows.forEach((r) => ws1.addRow(r.slice(1)));
    ws1.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    ws1.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1a6786" } };
    ws1.columns.forEach((c) => (c.width = 22));
    if (selectedFatura) {
      const ws2 = wb.addWorksheet("Seçili Fatura Satırları");
      ws2.addRow(lineHeaders.slice(1));
      lineRows.forEach((r) => ws2.addRow(r.slice(1)));
      ws2.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      ws2.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1a6786" } };
      ws2.columns.forEach((c) => (c.width = 22));
    }
    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "FaturaInceleme.xlsx");
  };

  const openYevmiyeDialogFromRow = async (rowIndex: number) => {
    const row = items[rowIndex];
    if (!row) return;
    const vkn = currentTip === "Alınan" ? row.tedarikciVkn ?? "" : row.aliciVkn ?? "";
    if (!vkn) { enqueueSnackbar("Seçili satırda VKN bulunamadı.", { variant: "warning" }); return; }
    enqueueSnackbar("Yevmiye eşleşmeleri getiriliyor...", { key: LOADING_SNACK_KEY, variant: "info", persist: true });
    try {
      const data = await findInvoiceYevmiyeRowsByVkn(user, currentTip, vkn);
      setCtx({ tip: currentTip, vkn }); setYevRows(data); setYevOpen(true);
    } catch { enqueueSnackbar("Veriler alınamadı.", { variant: "error" }); }
    finally { closeSnackbar(LOADING_SNACK_KEY); }
  };

  const htTheme = customizer.activeMode === "dark" ? "ht-theme-horizon-dark" : "ht-theme-horizon";

  return (
    <>
      <Grid container mb={2} alignItems="center" justifyContent="space-between" spacing={1}>
        <Grid>
          <ToggleButtonGroup size="small" exclusive value={currentTip} onChange={(_, v) => { if (!v) return; setCurrentTip(v); setPage(1); setSelectedInvoiceId(null); }}>
            <ToggleButton value="Alınan">Alınan</ToggleButton>
            <ToggleButton value="Gönderilen">Gönderilen</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography>Toplam: {total}</Typography>
            {listLoading && <Box display="flex" alignItems="center" gap={1}><CircularProgress size={16} /><Typography variant="body2">Yükleniyor</Typography></Box>}
          </Box>
        </Grid>
      </Grid>

      {listLoading ? (
        <Box display="flex" alignItems="center" justifyContent="center" height={360} border="1px solid" borderColor="divider" borderRadius={1} gap={1}>
          <CircularProgress size={24} /><Typography>Fatura listesi yükleniyor...</Typography>
        </Box>
      ) : (
        <CustomHotTable dropdownMenu={["filter_by_condition", "filter_by_value", "filter_action_bar"]}
          columnSorting={true} filters={true} theme={htTheme}
          ref={hotRef} data={masterRows} colHeaders={masterHeaders} columns={masterColumns}
          hiddenColumns={{ columns: [0], indicators: false }} stretchH="all" rowHeaders height={360}
          licenseKey="non-commercial-and-evaluation"
          afterSelectionEnd={(r) => { if (r >= 0 && r < items.length) setSelectedInvoiceId(items[r].id); }}
          contextMenu={{
            items: {
              hsep1: "---------",
              showYevmiye: {
                name: "Seçili tedarikçi ile eşleşen yevmiye kayıtlarını göster",
                callback: async (_key, selection) => { if (selection?.length) await openYevmiyeDialogFromRow(selection[0].start.row); },
              },
            },
          }}
        />
      )}

      <Grid container mt={2} spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 4 }}><Typography variant="subtitle1">Fatura Satırları</Typography></Grid>
        <Grid size={{ xs: 12, md: 8 }} display="flex" justifyContent="flex-end" alignItems="center" gap={1.5}>
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <InputLabel id="rpp-label">Sayfa Boyutu</InputLabel>
            <Select labelId="rpp-label" label="Sayfa Boyutu" value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>
          <Pagination color="primary" page={page} count={totalPages} onChange={(_, p) => setPage(p)} size="small" showFirstButton showLastButton />
          <Button size="small" variant="contained" onClick={handleExportExcel}>Excel'e Aktar</Button>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          {detailLoading && selectedInvoiceId ? (
            <Box display="flex" alignItems="center" justifyContent="center" height={280} gap={1} border="1px solid" borderColor="divider" borderRadius={1}>
              <CircularProgress size={22} /><Typography>Fatura detayı yükleniyor...</Typography>
            </Box>
          ) : (
            <CustomHotTable dropdownMenu={["filter_by_condition", "filter_by_value", "filter_action_bar"]}
              columnSorting={true} filters={true} theme={htTheme}
              ref={linesRef} data={lineRows} colHeaders={lineHeaders} columns={lineColumns}
              hiddenColumns={{ columns: [0], indicators: false }} stretchH="all" rowHeaders height={420}
              licenseKey="non-commercial-and-evaluation"
            />
          )}
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Typography variant="subtitle1" mb={1}>Fatura Önizleme</Typography>
          <Paper variant="outlined" sx={{ height: 420, overflow: "hidden" }}>
            {previewLoading ? (
              <Box display="flex" alignItems="center" justifyContent="center" height="100%" gap={1}>
                <CircularProgress size={22} /><Typography>Fatura önizlemesi yükleniyor...</Typography>
              </Box>
            ) : previewError ? (
              <Box display="flex" alignItems="center" justifyContent="center" height="100%" px={3}>
                <Typography color="text.secondary">{previewError}</Typography>
              </Box>
            ) : selectedPreviewUrl ? (
              <iframe title="Fatura Önizleme" src={selectedPreviewUrl} width="100%" height="100%" style={{ border: "none" }} />
            ) : (
              <Box display="flex" alignItems="center" justifyContent="center" height="100%" px={3}>
                <Typography color="text.secondary">Önizleme için bir fatura seçin.</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {ctx && <YevmiyeFaturaDialog open={yevOpen} onClose={() => setYevOpen(false)} tip={ctx.tip} vkn={ctx.vkn} rows={yevRows} />}
    </>
  );
};

/* ============= TAB 2: Defter Eşleştirme ============= */
const DefterEslestirmeTab: React.FC<{ user: any }> = ({ user }) => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [tip, setTip] = useState("Alınan");
  const [durum, setDurum] = useState("all");
  const [tolerance, setTolerance] = useState(1);
  const [data, setData] = useState<FaturaEdefterEslesmeAnalizi | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [expandedMukerrer, setExpandedMukerrer] = useState<Record<string, boolean>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getEdefterEslesmeAnalizi(user, month, tip, durum, page + 1, rowsPerPage, tolerance);
      setData(result);
    } catch (e: any) { enqueueSnackbar(e?.message || "Analiz alınamadı.", { variant: "error" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { void loadData(); }, [month, tip, durum, tolerance, page, rowsPerPage]);

  const summary = data?.summary;
  const items = data?.items ?? [];
  const mukerrer = data?.mukerrerFaturaGruplari ?? [];

  const handleWordExport = async (kontrol: string) => {
    try {
      const blob = await downloadFaturaKontrolRaporuWord(user, month, tip, kontrol, tolerance);
      saveAs(blob, `DefterEslestirme_${kontrol}_Ay${month}.docx`);
    } catch (e: any) { enqueueSnackbar(e?.message || "Word export hatası", { variant: "error" }); }
  };

  const summaryCards = summary ? [
    { label: "Fatura", value: summary.faturaSayisi, color: "primary" as const },
    { label: "Defter Kaydı", value: summary.defterKaydiSayisi, color: "info" as const },
    { label: "Eşleşen", value: summary.eslesenKayitSayisi, color: "success" as const },
    { label: "Tutar Uyumlu", value: summary.tutarUyumluSayisi, color: "success" as const },
    { label: "Tutar Farklı", value: summary.tutarFarkliSayisi, color: "warning" as const },
    { label: "Eşleşmeyen", value: summary.defterdeOlmayanFaturaSayisi, color: "error" as const },
    { label: "Mükerrer", value: summary.mukerrerFaturaNoSayisi, color: "warning" as const },
  ] : [];

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" mb={2}>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Ay</InputLabel>
          <Select value={month} label="Ay" onChange={(e) => { setMonth(Number(e.target.value)); setPage(0); }}>
            {Array.from({ length: 12 }, (_, i) => (
              <MenuItem key={i + 1} value={i + 1}>{i + 1}. Ay</MenuItem>
            ))}
          </Select>
        </FormControl>
        <ToggleButtonGroup size="small" exclusive value={tip} onChange={(_, v) => { if (v) { setTip(v); setPage(0); } }}>
          <ToggleButton value="Alınan">Alınan</ToggleButton>
          <ToggleButton value="Gönderilen">Gönderilen</ToggleButton>
        </ToggleButtonGroup>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Durum</InputLabel>
          <Select value={durum} label="Durum" onChange={(e) => { setDurum(e.target.value); setPage(0); }}>
            <MenuItem value="all">Tümü</MenuItem>
            <MenuItem value="eslesen">Eşleşen</MenuItem>
            <MenuItem value="eslesmeyen">Eşleşmeyen</MenuItem>
            <MenuItem value="tutar-farki">Tutar Farkı</MenuItem>
          </Select>
        </FormControl>
        <TextField size="small" label="Tolerans" type="number" value={tolerance}
          onChange={(e) => setTolerance(Number(e.target.value))} sx={{ width: 90 }} />
        <Button size="small" variant="outlined" startIcon={<IconRefresh size={16} />} onClick={() => loadData()}>Yenile</Button>
      </Stack>

      {summaryCards.length > 0 && (
        <Stack direction="row" spacing={1.5} mb={2} flexWrap="wrap">
          {summaryCards.map((c) => (
            <Card key={c.label} variant="outlined" sx={{ minWidth: 100, flex: 1 }}>
              <CardContent sx={{ p: "12px !important", textAlign: "center" }}>
                <Typography variant="h5" color={`${c.color}.main`}>{c.value}</Typography>
                <Typography variant="caption">{c.label}</Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Stack direction="row" spacing={1} mb={1}>
        <Button size="small" startIcon={<IconFileWord size={16} />} onClick={() => handleWordExport("all")}>Tümü Word</Button>
        <Button size="small" startIcon={<IconFileWord size={16} />} onClick={() => handleWordExport("eslesen")}>Eşleşen Word</Button>
        <Button size="small" startIcon={<IconFileWord size={16} />} onClick={() => handleWordExport("eslesmeyen")}>Eşleşmeyen Word</Button>
        <Button size="small" startIcon={<IconFileWord size={16} />} onClick={() => handleWordExport("tutar-farki")}>Tutar Farkı Word</Button>
        <Button size="small" startIcon={<IconFileWord size={16} />} onClick={() => handleWordExport("mukerrer-fatura")}>Mükerrer Word</Button>
      </Stack>

      {loading ? (
        <Box display="flex" alignItems="center" justifyContent="center" height={300} gap={1}>
          <CircularProgress size={22} /><Typography>Analiz yükleniyor...</Typography>
        </Box>
      ) : (
        <Paper variant="outlined" sx={{ overflow: "auto", maxHeight: 420 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Durum</TableCell>
                <TableCell>Fatura No</TableCell>
                <TableCell>Tarih</TableCell>
                <TableCell>Taraf</TableCell>
                <TableCell align="right">Tutar</TableCell>
                <TableCell align="right">Defter B.</TableCell>
                <TableCell align="right">Defter A.</TableCell>
                <TableCell align="right">Fark</TableCell>
                <TableCell>PB</TableCell>
                <TableCell>Açıklama</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={10}><Typography textAlign="center" color="text.secondary">Kayıt bulunamadı</Typography></TableCell></TableRow>
              ) : items.map((row) => (
                <TableRow key={row.faturaId} hover
                  sx={{ bgcolor: row.durum === "eslesti" ? "success.lighter" : row.durum === "fark-var" ? "warning.lighter" : "error.lighter" }}>
                  <TableCell>
                    <Chip label={row.durum} size="small" color={row.durum === "eslesti" ? "success" : row.durum === "fark-var" ? "warning" : "error"} variant="outlined" />
                  </TableCell>
                  <TableCell>{row.faturaNumarasi}</TableCell>
                  <TableCell>{row.faturaTarihi ? new Date(row.faturaTarihi).toLocaleDateString("tr-TR") : "-"}</TableCell>
                  <TableCell>{row.tarafAdi ?? "-"}</TableCell>
                  <TableCell align="right">{row.faturaTutari.toFixed(2)}</TableCell>
                  <TableCell align="right">{row.defterBorcToplami.toFixed(2)}</TableCell>
                  <TableCell align="right">{row.defterAlacakToplami.toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <Typography color={row.fark === 0 ? "text.secondary" : Math.abs(row.fark) > tolerance ? "error.main" : "warning.main"}>
                      {row.fark.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.paraBirimi ?? "-"}</TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.aciklama}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {items.length > 0 && (
        <TablePagination component="div" count={data?.totalCount ?? 0} page={page} onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
      )}

      {mukerrer.length > 0 && (
        <Box mt={3}>
          <Typography variant="h6" mb={1}>Mükerrer Fatura No Grupları</Typography>
          {mukerrer.map((grp) => (
            <Card key={grp.faturaNumarasi} variant="outlined" sx={{ mb: 1 }}>
              <CardContent sx={{ p: "12px !important", "&:last-child": { pb: "12px" } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography fontWeight={600}>{grp.faturaNumarasi}</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={`${grp.tekrarSayisi}x`} size="small" color="warning" />
                    <Typography variant="caption">{grp.toplamTutar.toFixed(2)} {grp.paraBirimi}</Typography>
                  </Stack>
                </Stack>
                <Typography variant="caption" color="text.secondary">{grp.tarafAdlari?.join(", ")}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

/* ============= TAB 3: İrsaliye Karşılaştırma ============= */
const IrsaliyeKarsilastirmaTab: React.FC<{ user: any }> = ({ user }) => {
  const [data, setData] = useState<Karsilastirma[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getIrsaliyeKarsilastirma(user);
        setData(Array.isArray(result) ? result : []);
      } catch { enqueueSnackbar("İrsaliye karşılaştırma verisi alınamadı.", { variant: "error" }); }
      finally { setLoading(false); }
    };
    void load();
  }, [user]);

  if (loading) return <Box display="flex" alignItems="center" justifyContent="center" height={300} gap={1}><CircularProgress size={22} /><Typography>Yükleniyor...</Typography></Box>;

  return (
    <Paper variant="outlined" sx={{ overflow: "auto", maxHeight: 500 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>İrsaliye No</TableCell>
            <TableCell>Tarih</TableCell>
            <TableCell>Tedarikçi</TableCell>
            <TableCell>Fatura No</TableCell>
            <TableCell align="right">Tutar</TableCell>
            <TableCell>Durum</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow><TableCell colSpan={7}><Typography textAlign="center" color="text.secondary">Kayıt yok</Typography></TableCell></TableRow>
          ) : data.map((row, idx) => (
            <React.Fragment key={row.id ?? idx}>
              <TableRow hover>
                <TableCell>
                  <IconButton size="small" onClick={() => setExpanded((p) => ({ ...p, [String(idx)]: !p[String(idx)] }))}>
                    {expanded[String(idx)] ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                  </IconButton>
                </TableCell>
                <TableCell>{row.irsaliyeNo ?? "-"}</TableCell>
                <TableCell>{row.tarih ? new Date(row.tarih).toLocaleDateString("tr-TR") : "-"}</TableCell>
                <TableCell>{row.tedarikciAdi ?? "-"}</TableCell>
                <TableCell>{row.faturaNo ?? "-"}</TableCell>
                <TableCell align="right">{row.tutar?.toFixed(2) ?? "-"}</TableCell>
                <TableCell>
                  <Chip label={row.durum ?? "Bilinmiyor"} size="small"
                    color={row.durum === "eslesti" ? "success" : row.durum === "fark-var" ? "warning" : "default"} variant="outlined" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={7} sx={{ p: 0, border: 0 }}>
                  <Collapse in={!!expanded[String(idx)]} timeout="auto" unmountOnExit>
                    <Box px={2} py={1}>
                      <Typography variant="subtitle2" mb={0.5}>Kalemler</Typography>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Açıklama</TableCell>
                            <TableCell align="right">Miktar</TableCell>
                            <TableCell>Birim</TableCell>
                            <TableCell align="right">Birim Fiyat</TableCell>
                            <TableCell align="right">Tutar</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(row.kalemler ?? []).length === 0 ? (
                            <TableRow><TableCell colSpan={5}><Typography variant="caption" color="text.secondary">Kalem yok</Typography></TableCell></TableRow>
                          ) : row.kalemler!.map((k, ki) => (
                            <TableRow key={ki}>
                              <TableCell>{k.aciklama ?? "-"}</TableCell>
                              <TableCell align="right">{k.miktar ?? "-"}</TableCell>
                              <TableCell>{k.birim ?? "-"}</TableCell>
                              <TableCell align="right">{k.birimFiyat?.toFixed(4) ?? "-"}</TableCell>
                              <TableCell align="right">{k.tutar?.toFixed(2) ?? "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

/* ============= TAB 4: Fatura Listesi ============= */
const FaturaListesiTab: React.FC<{ user: any; tip: string }> = ({ user, tip }) => {
  const [currentTip, setCurrentTip] = useState(tip);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [search, setSearch] = useState("");
  const [invoiceTypeCode, setInvoiceTypeCode] = useState("");
  const [tevkifatliMi, setTevkifatliMi] = useState("");
  const [tipOptions, setTipOptions] = useState<string[]>([]);
  const [items, setItems] = useState<FaturaDetailItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const tipler = await getYuklenenFaturaTipleri(user);
        setTipOptions(tipler);
      } catch {}
    };
    void load();
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const filter: Record<string, string | null | undefined> = {};
        if (search) filter.search = search;
        if (invoiceTypeCode) filter.invoiceTypeCode = invoiceTypeCode;
        if (tevkifatliMi) filter.tevkifatliMi = tevkifatliMi;
        const result = await getFilteredPagedFaturalar(user, page + 1, rowsPerPage, currentTip, filter);
        setItems(result.items);
        setTotal(result.totalCount);
      } catch (e: any) { enqueueSnackbar(e?.message || "Faturalar alınamadı.", { variant: "error" }); }
      finally { setLoading(false); }
    };
    void loadData();
  }, [user, page, rowsPerPage, currentTip, search, invoiceTypeCode, tevkifatliMi]);

  const stats = useMemo(() => {
    const satis = items.filter((x) => x.invoiceTypeCode === "SATIS" || x.invoiceTypeCode === "SATIS").length;
    const iade = items.filter((x) => x.invoiceTypeCode === "IADE" || x.invoiceTypeCode === "İADE").length;
    const tevkifat = items.filter((x) => x.tevkifatKodu).length;
    const diger = items.length - satis - iade;
    return { satis, iade, tevkifat, diger };
  }, [items]);

  return (
    <Box>
      <Stack direction="row" spacing={1.5} mb={2} flexWrap="wrap">
        <Card variant="outlined" sx={{ minWidth: 100, flex: 1 }}><CardContent sx={{ p: "12px !important", textAlign: "center" }}><Typography variant="h5" color="primary.main">{stats.satis}</Typography><Typography variant="caption">SATIŞ</Typography></CardContent></Card>
        <Card variant="outlined" sx={{ minWidth: 100, flex: 1 }}><CardContent sx={{ p: "12px !important", textAlign: "center" }}><Typography variant="h5" color="warning.main">{stats.iade}</Typography><Typography variant="caption">İADE</Typography></CardContent></Card>
        <Card variant="outlined" sx={{ minWidth: 100, flex: 1 }}><CardContent sx={{ p: "12px !important", textAlign: "center" }}><Typography variant="h5" color="info.main">{stats.tevkifat}</Typography><Typography variant="caption">TEVKİFAT</Typography></CardContent></Card>
        <Card variant="outlined" sx={{ minWidth: 100, flex: 1 }}><CardContent sx={{ p: "12px !important", textAlign: "center" }}><Typography variant="h5" color="text.secondary">{stats.diger}</Typography><Typography variant="caption">DİĞER</Typography></CardContent></Card>
      </Stack>

      <Stack direction="row" spacing={1.5} alignItems="center" mb={2} flexWrap="wrap">
        <ToggleButtonGroup size="small" exclusive value={currentTip} onChange={(_, v) => { if (v) { setCurrentTip(v); setPage(0); } }}>
          <ToggleButton value="Alınan">Alınan</ToggleButton>
          <ToggleButton value="Gönderilen">Gönderilen</ToggleButton>
        </ToggleButtonGroup>
        <TextField size="small" label="Fatura No / ETTN" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} sx={{ minWidth: 180 }} />
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Fatura Tipi</InputLabel>
          <Select value={invoiceTypeCode} label="Fatura Tipi" onChange={(e) => { setInvoiceTypeCode(e.target.value); setPage(0); }}>
            <MenuItem value="">Tümü</MenuItem>
            {tipOptions.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Tevkifat</InputLabel>
          <Select value={tevkifatliMi} label="Tevkifat" onChange={(e) => { setTevkifatliMi(e.target.value); setPage(0); }}>
            <MenuItem value="">Tümü</MenuItem>
            <MenuItem value="true">Tevkifatlı</MenuItem>
            <MenuItem value="false">Tevkifatsız</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Paper variant="outlined" sx={{ overflowX: "auto", maxHeight: 420 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Fatura No</TableCell>
              <TableCell>ETTN</TableCell>
              <TableCell>Tarih</TableCell>
              <TableCell>Satıcı</TableCell>
              <TableCell>Alıcı</TableCell>
              <TableCell>Tip</TableCell>
              <TableCell align="right">Matrah</TableCell>
              <TableCell align="right">KDV</TableCell>
              <TableCell>Tevkifat</TableCell>
              <TableCell align="right">Tevkifat Tutarı</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={10}><Box display="flex" alignItems="center" justifyContent="center" py={4} gap={1}><CircularProgress size={20} /><Typography>Yükleniyor...</Typography></Box></TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={10}><Typography textAlign="center" color="text.secondary" py={2}>Kayıt bulunamadı</Typography></TableCell></TableRow>
            ) : items.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.faturaNumarasi ?? "-"}</TableCell>
                <TableCell sx={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.faturaDosyaId ?? "-"}</TableCell>
                <TableCell>{row.faturaTarihi ? new Date(row.faturaTarihi).toLocaleDateString("tr-TR") : "-"}</TableCell>
                <TableCell>{row.tedarikci?.ad ?? "-"}</TableCell>
                <TableCell>{row.alici?.ad ?? "-"}</TableCell>
                <TableCell><Chip label={row.invoiceTypeCode ?? "-"} size="small" variant="outlined" /></TableCell>
                <TableCell align="right">{row.vergiHaricTutar?.toFixed(2) ?? "-"}</TableCell>
                <TableCell align="right">{row.kdvTutari?.toFixed(2) ?? "-"}</TableCell>
                <TableCell>{row.tevkifatKodu ? <Chip label={row.tevkifatKodu} size="small" color="info" /> : "-"}</TableCell>
                <TableCell align="right">{row.tevkifatTutari?.toFixed(2) ?? "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <TablePagination component="div" count={total} page={page} onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
    </Box>
  );
};
