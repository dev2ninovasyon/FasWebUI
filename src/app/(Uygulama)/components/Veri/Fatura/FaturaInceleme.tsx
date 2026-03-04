"use client";
import "@/lib/handsontableSetup";
import { HotTable } from "@handsontable/react";
import "handsontable/dist/handsontable.full.min.css";
import {
  Box,
  Grid,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  CircularProgress,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { enqueueSnackbar, closeSnackbar } from "notistack";
import { saveAs } from "file-saver";
import {
  fetchPagedFaturalarLite,
  fetchFaturaDetail,
  Fatura,
  FaturaListItem,
  FaturaSatiri,
  findInvoiceYevmiyeRowsByVkn,
} from "@/api/Fatura/FaturaApi";
import YevmiyeFaturaDialog from "@/app/(Uygulama)/components/Veri/Fatura/YevmiyeFaturaDialog";

type Props = {
  tip?: string;
  pageSize?: number;
};

type Ctx = { tip: string; vkn: string };

const LOADING_SNACK_KEY = "yevmiye-fetching";

const FaturaInceleme: React.FC<Props> = ({ tip = "Alınan", pageSize = 10 }) => {
  const user = useSelector((s: AppState) => s.userReducer);
  const hotRef = useRef<any>(null);
  const linesRef = useRef<any>(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [currentTip, setCurrentTip] = useState<string>(tip);

  const [items, setItems] = useState<FaturaListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const [listLoading, setListLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [detailCache, setDetailCache] = useState<Record<string, Fatura>>({});

  const [yevOpen, setYevOpen] = useState(false);
  const [ctx, setCtx] = useState<Ctx | null>(null);
  const [yevRows, setYevRows] = useState<any[]>([]);

  const filters: Record<string, string[]> = {};

  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

  const loadData = async () => {
    if (!user?.denetciId || !user?.yil || !user?.denetlenenId) {
      return;
    }

    setListLoading(true);
    try {
      const data = await fetchPagedFaturalarLite(
        user.denetciId,
        user.yil,
        user.denetlenenId,
        page,
        rowsPerPage,
        currentTip,
        filters
      );
      setItems(data.items);
      setTotal(data.totalCount);

      const hasSelection = data.items.some((x) => x.id === selectedInvoiceId);
      if (!hasSelection) {
        setSelectedInvoiceId(data.items[0]?.id ?? null);
      }
    } catch (e: any) {
      enqueueSnackbar(e?.message || "Veri alınamadı", { variant: "error" });
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, currentTip, rowsPerPage]);

  useEffect(() => {
    const loadDetail = async () => {
      if (!selectedInvoiceId) {
        return;
      }
      if (detailCache[selectedInvoiceId]) {
        return;
      }
      if (!user?.denetciId || !user?.yil || !user?.denetlenenId) {
        return;
      }

      setDetailLoading(true);
      try {
        const detail = await fetchFaturaDetail(
          user.denetciId,
          user.yil,
          user.denetlenenId,
          selectedInvoiceId
        );
        setDetailCache((prev) => ({ ...prev, [selectedInvoiceId]: detail }));
      } catch (e: any) {
        enqueueSnackbar(e?.message || "Fatura detayı alınamadı", { variant: "error" });
      } finally {
        setDetailLoading(false);
      }
    };

    void loadDetail();
  }, [selectedInvoiceId, detailCache, user]);

  const masterRows = useMemo(
    () =>
      items.map((f) => [
        f.id,
        f.faturaNumarasi ?? "",
        (f.faturaTarihi || "").substring(0, 10).split("-").reverse().join("."),
        f.tedarikciAd ?? "",
        f.aliciAd ?? "",
        f.paraBirimi ?? "",
        f.odenecekTutar ?? 0,
      ]),
    [items]
  );

  const masterHeaders = ["Id", "Fatura No", "Tarih", "Düzenleyen", "Alıcı", "PB", "Tutar"];
  const masterColumns = [
    { readOnly: true },
    { type: "text", readOnly: true },
    { type: "text", readOnly: true },
    { type: "text", readOnly: true },
    { type: "text", readOnly: true },
    { type: "text", readOnly: true },
    { type: "numeric", readOnly: true, numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, className: "htRight" },
  ];

  const selectedFatura: Fatura | null = selectedInvoiceId ? (detailCache[selectedInvoiceId] ?? null) : null;

  const lineRows = useMemo(() => {
    const lines = (selectedFatura?.faturaSatirlari ?? []) as FaturaSatiri[];
    return lines.map((s) => [
      s.id,
      s.aciklama ?? "",
      s.miktar,
      s.birimKodu ?? "",
      s.birimFiyat,
      s.satirToplamTutar,
      s.vergi?.vergiKodu ?? "",
      s.vergi?.vergiTuru ?? "",
      s.vergi?.oran ?? null,
      s.vergi?.vergiMatrahi ?? null,
      s.vergi?.vergiTutari ?? null,
    ]);
  }, [selectedFatura]);

  const lineHeaders = ["Id", "Açıklama", "Miktar", "Birim", "Fiyat", "Toplam", "V.Kodu", "V.Türü", "Oran", "Matrah", "Vergi"];
  const lineColumns = [
    { readOnly: true },
    { type: "text", readOnly: true },
    { type: "numeric", readOnly: true, numericFormat: { pattern: "0,0.00", culture: "tr-TR" } },
    { type: "text", readOnly: true },
    { type: "numeric", readOnly: true, numericFormat: { pattern: "0,0.0000", culture: "tr-TR" } },
    { type: "numeric", readOnly: true, numericFormat: { pattern: "0,0.00", culture: "tr-TR" } },
    { type: "text", readOnly: true },
    { type: "text", readOnly: true },
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
    saveAs(
      new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "FaturaInceleme.xlsx"
    );
  };

  const openYevmiyeDialogFromRow = async (rowIndex: number) => {
    const row = items[rowIndex];
    if (!row) return;

    const vkn = currentTip === "Alınan" ? row.tedarikciVkn ?? "" : row.aliciVkn ?? "";
    if (!vkn) {
      enqueueSnackbar("Seçili satırda VKN bulunamadı.", { variant: "warning" });
      return;
    }

    enqueueSnackbar("Yevmiye eşleşmeleri getiriliyor...", {
      key: LOADING_SNACK_KEY,
      variant: "info",
      persist: true,
    });

    try {
      const data = await findInvoiceYevmiyeRowsByVkn(user, currentTip, vkn);
      setCtx({ tip: currentTip, vkn });
      setYevRows(data);
      setYevOpen(true);
    } catch {
      enqueueSnackbar("Veriler alınamadı.", { variant: "error" });
    } finally {
      closeSnackbar(LOADING_SNACK_KEY);
    }
  };

  return (
    <>
      <Grid container mb={2} alignItems="center" justifyContent="space-between" spacing={1}>
        <Grid>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={currentTip}
            onChange={(_, v) => {
              if (!v) return;
              setCurrentTip(v);
              setPage(1);
              setSelectedInvoiceId(null);
            }}
          >
            <ToggleButton value="Alınan">Alınan</ToggleButton>
            <ToggleButton value="Gönderilen">Gönderilen</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography>Toplam: {total}</Typography>
            {listLoading && (
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={16} />
                <Typography variant="body2">Yükleniyor</Typography>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>

      {listLoading ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height={360}
          border="1px solid"
          borderColor="divider"
          borderRadius={1}
          gap={1}
        >
          <CircularProgress size={24} />
          <Typography>Fatura listesi yükleniyor...</Typography>
        </Box>
      ) : (
        <HotTable
          ref={hotRef}
          data={masterRows}
          colHeaders={masterHeaders}
          columns={masterColumns}
          hiddenColumns={{ columns: [0], indicators: false }}
          stretchH="all"
          rowHeaders
          height={360}
          licenseKey="non-commercial-and-evaluation"
          afterSelectionEnd={(r) => {
            if (r >= 0 && r < items.length) {
              setSelectedInvoiceId(items[r].id);
            }
          }}
          contextMenu={{
            items: {
              hsep1: "---------",
              showYevmiye: {
                name: "Seçili tedarikçi ile eşleşen yevmiye kayıtlarını göster",
                callback: async (_key, selection) => {
                  if (!selection || selection.length === 0) return;
                  const rowIndex = selection[0].start.row;
                  await openYevmiyeDialogFromRow(rowIndex);
                },
              },
            },
          }}
        />
      )}

      <Grid container mt={2} spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="subtitle1">Fatura Satırları</Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }} display="flex" justifyContent="flex-end" alignItems="center" gap={1.5}>
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <InputLabel id="rows-per-page-label">Sayfa Boyutu</InputLabel>
            <Select
              labelId="rows-per-page-label"
              label="Sayfa Boyutu"
              value={rowsPerPage}
              onChange={(e) => {
                const next = Number(e.target.value);
                setRowsPerPage(next);
                setPage(1);
              }}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>

          <Pagination
            color="primary"
            page={page}
            count={totalPages}
            onChange={(_, nextPage) => setPage(nextPage)}
            size="small"
            showFirstButton
            showLastButton
          />

          <Button size="small" variant="contained" onClick={handleExportExcel}>
            Excel'e Aktar
          </Button>
        </Grid>

        <Grid size={12}>
          {detailLoading && selectedInvoiceId ? (
            <Box display="flex" alignItems="center" justifyContent="center" height={280} gap={1} border="1px solid" borderColor="divider" borderRadius={1}>
              <CircularProgress size={22} />
              <Typography>Fatura detayı yükleniyor...</Typography>
            </Box>
          ) : (
            <HotTable
              ref={linesRef}
              data={lineRows}
              colHeaders={lineHeaders}
              columns={lineColumns}
              hiddenColumns={{ columns: [0], indicators: false }}
              stretchH="all"
              rowHeaders
              height={280}
              licenseKey="non-commercial-and-evaluation"
            />
          )}
        </Grid>
      </Grid>

      {ctx && (
        <YevmiyeFaturaDialog
          open={yevOpen}
          onClose={() => setYevOpen(false)}
          tip={ctx.tip}
          vkn={ctx.vkn}
          rows={yevRows}
        />
      )}
    </>
  );
};

export default FaturaInceleme;
