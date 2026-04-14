"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  CircularProgress,
  IconButton,
  Chip,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
  alpha,
} from "@mui/material";
import {
  IconChevronDown,
  IconChevronUp,
  IconSettings,
  IconBook,
  IconCloudCheck,
  IconPencil,
  IconTrash,
  IconPlus,
  IconDeviceFloppy,
  IconX,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { enqueueSnackbar } from "notistack";
import {
  getTespitEdilenRisklerByDenetlenen,
  kaydetTespitEdilenRiskler,
  varsayilanaDonTespitEdilenRiskler,
  addSatirTespitEdilenRiskler,
  updateSatirTespitEdilenRiskler,
  deleteSatirTespitEdilenRiskler,
  TespitEdilenRisklerRow,
} from "@/api/CalismaKagitlari/TespitEdilenRiskler";
import FormOnayBolumu from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/FormOnayBolumu";
import IslemlerCardHtml from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCardHtml";
import { FloatingButtonCalismaKagitlari } from "@/app/(Uygulama)/components/CalismaKagitlari/FloatingButtonCalismaKagitlari";
import { styled } from "@mui/material/styles";

/* ─── Styled ─────────────────────────────────────────────────────────────── */

const HeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontWeight: 700,
  fontSize: "0.78rem",
  padding: "10px 8px",
  whiteSpace: "nowrap",
  position: "sticky",
  top: 0,
  zIndex: 2,
}));

const BodyCell = styled(TableCell)(() => ({
  fontSize: "0.8rem",
  padding: "8px 8px",
  verticalAlign: "top",
}));

/* ─── Constants ─────────────────────────────────────────────────────────── */

const BOOL_COLS = [
  { key: "gerceklik" as const,           label: "G",  tooltip: "Gerçeklik",            color: "#EF5350" },
  { key: "tamOlma" as const,             label: "T",  tooltip: "Tamlık",               color: "#2196F3" },
  { key: "varOlma" as const,             label: "V",  tooltip: "Var Olma",             color: "#4CAF50" },
  { key: "dogrulukDonemsellik" as const, label: "D",  tooltip: "Doğruluk/Dönemsellik", color: "#7E57C2" },
  { key: "degerleme" as const,           label: "De", tooltip: "Değerleme",            color: "#FF9800" },
  { key: "siniflama" as const,           label: "S",  tooltip: "Sınıflama/Sunum",      color: "#00BCD4" },
];

const EMPTY_EDIT = {
  islem: "",
  tespit: "",
  gerceklik: true,
  tamOlma: true,
  varOlma: true,
  dogrulukDonemsellik: true,
  degerleme: true,
  siniflama: true,
  uygulananDenetimTeknikleri: "",
  ilgiliBdsStandart: "",
};

/* ─── Types ─────────────────────────────────────────────────────────────── */

type EditForm = typeof EMPTY_EDIT;

interface Props {
  isClickedVarsayilanaDon: boolean;
  setIsClickedVarsayilanaDon: (v: boolean) => void;
  setTamamlanan: (n: number) => void;
  setToplam: (n: number) => void;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function escapeHtml(value: string | null | undefined): string {
  return (value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function rowToForm(row: TespitEdilenRisklerRow): EditForm {
  return {
    islem:                      row.islem                      ?? "",
    tespit:                     row.tespit                     ?? "",
    gerceklik:                  row.gerceklik                  ?? true,
    tamOlma:                    row.tamOlma                    ?? true,
    varOlma:                    row.varOlma                    ?? true,
    dogrulukDonemsellik:        row.dogrulukDonemsellik        ?? true,
    degerleme:                  row.degerleme                  ?? true,
    siniflama:                  row.siniflama                  ?? true,
    uygulananDenetimTeknikleri: row.uygulananDenetimTeknikleri ?? "",
    ilgiliBdsStandart:          row.ilgiliBdsStandart          ?? "",
  };
}

/** Satırın kaydedilmemiş değişiklik tespiti için karşılaştırma anahtarı */
function rowKey(row: TespitEdilenRisklerRow): string {
  return JSON.stringify([
    row.gerceklik,
    row.tamOlma,
    row.varOlma,
    row.dogrulukDonemsellik,
    row.degerleme,
    row.siniflama,
    row.uygulananDenetimTeknikleri ?? null,
    row.ilgiliBdsStandart ?? null,
  ]);
}

/* ─── EditableTextField ──────────────────────────────────────────────────── */

/**
 * Kendi yerel draft state'ini tutar, sadece blur'da parent'a bildirir.
 * Büyük listelerde her tuş vuruşunda tüm tabloyu yeniden render ettirmez.
 */
const EditableTextField = React.memo(function EditableTextField({
  value,
  onCommit,
  placeholder,
  minRows = 4,
}: {
  value: string;
  onCommit: (v: string) => void;
  placeholder?: string;
  minRows?: number;
}) {
  const [draft, setDraft] = React.useState(value);
  React.useEffect(() => { setDraft(value); }, [value]);
  return (
    <TextField
      multiline
      minRows={minRows}
      fullWidth
      size="small"
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => onCommit(draft)}
      sx={{
        "& .MuiInputBase-root": { fontSize: "0.82rem", lineHeight: 1.65 },
        "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
      }}
    />
  );
});

/* ─── Row Edit Dialog ────────────────────────────────────────────────────── */

type FocusedTextField = keyof Pick<EditForm, "islem" | "tespit" | "uygulananDenetimTeknikleri" | "ilgiliBdsStandart">;

interface EditDialogProps {
  open: boolean;
  title: string;
  form: EditForm;
  saving: boolean;
  onChange: (field: keyof EditForm, value: string | boolean) => void;
  onSave: () => void;
  onClose: () => void;
}

const EditDialog: React.FC<EditDialogProps> = ({
  open, title, form, saving, onChange, onSave, onClose,
}) => {
  const theme = useTheme();

  const [focusedField, setFocusedField] = useState<FocusedTextField | null>(null);
  const [isAiHovered, setIsAiHovered]   = useState(false);
  const isInteractingWithAi             = useRef(false);

  const handleFocus = (field: FocusedTextField) => setFocusedField(field);
  const handleBlur  = () => {
    setTimeout(() => {
      if (!isInteractingWithAi.current) setFocusedField(null);
    }, 150);
  };

  const aiText = focusedField ? (form[focusedField] as string) : "";

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
        <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>{title}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <TextField
              label="Tespit Edilen Risk / İşlem"
              multiline
              minRows={3}
              fullWidth
              size="small"
              value={form.islem}
              onChange={(e) => onChange("islem", e.target.value)}
              onFocus={() => handleFocus("islem")}
              onBlur={handleBlur}
            />
            <TextField
              label="Etkilenen Hesap Grubu (Tespit)"
              multiline
              minRows={2}
              fullWidth
              size="small"
              value={form.tespit}
              onChange={(e) => onChange("tespit", e.target.value)}
              onFocus={() => handleFocus("tespit")}
              onBlur={handleBlur}
            />

            {/* Booleans */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Risk Değerlendirme Boyutları
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1.5} useFlexGap>
                {BOOL_COLS.map((col) => (
                  <Box
                    key={col.key}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      border: `1px solid ${alpha(col.color, 0.3)}`,
                      bgcolor: alpha(col.color, 0.05),
                      borderRadius: 1,
                      px: 1.5, py: 0.5,
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                    onClick={() => onChange(col.key, !form[col.key])}
                  >
                    <Checkbox
                      size="small"
                      checked={form[col.key]}
                      sx={{ p: 0, color: alpha(col.color, 0.4), "&.Mui-checked": { color: col.color } }}
                      onChange={(e) => onChange(col.key, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Typography variant="body2" fontWeight={600} sx={{ color: col.color }}>
                      {col.tooltip}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Divider />

            <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <IconSettings size={15} color={theme.palette.primary.main} />
                  <Typography variant="subtitle2" fontWeight={700} fontSize="0.8rem">
                    Uygulanan Denetim Teknikleri
                  </Typography>
                </Stack>
                <TextField
                  multiline
                  minRows={4}
                  fullWidth
                  size="small"
                  placeholder="Denetim tekniklerini giriniz..."
                  value={form.uygulananDenetimTeknikleri}
                  onChange={(e) => onChange("uygulananDenetimTeknikleri", e.target.value)}
                  onFocus={() => handleFocus("uygulananDenetimTeknikleri")}
                  onBlur={handleBlur}
                  sx={{ "& .MuiInputBase-root": { fontSize: "0.82rem", lineHeight: 1.65 } }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <IconBook size={15} color={theme.palette.secondary.main} />
                  <Typography variant="subtitle2" fontWeight={700} fontSize="0.8rem">
                    İlgili BDS / Standart Rehberi
                  </Typography>
                </Stack>
                <TextField
                  multiline
                  minRows={4}
                  fullWidth
                  size="small"
                  placeholder="Standart referanslarını giriniz..."
                  value={form.ilgiliBdsStandart}
                  onChange={(e) => onChange("ilgiliBdsStandart", e.target.value)}
                  onFocus={() => handleFocus("ilgiliBdsStandart")}
                  onBlur={handleBlur}
                  sx={{ "& .MuiInputBase-root": { fontSize: "0.82rem", lineHeight: 1.65 } }}
                />
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button variant="outlined" color="inherit" startIcon={<IconX size={16} />} onClick={onClose}>
            İptal
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <IconDeviceFloppy size={16} />}
            disabled={saving || !form.islem.trim()}
            onClick={onSave}
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* FAS AI — görünür olduğunda metin alanına odaklanılmış demektir */}
      {open && focusedField && (
        <Box
          onMouseDown={() => { isInteractingWithAi.current = true; }}
          onMouseUp={() => { setTimeout(() => { isInteractingWithAi.current = false; }, 300); }}
        >
          <FloatingButtonCalismaKagitlari
            control={true}
            isHovered={isAiHovered}
            setIsHovered={setIsAiHovered}
            text={aiText}
            handleClick={() => {}}
            handleSetSelectedText={(newText) => {
              if (focusedField) onChange(focusedField, newText);
            }}
          />
        </Box>
      )}
    </>
  );
};

/* ─── Main Component ─────────────────────────────────────────────────────── */

const TespitEdilenRisklerTable: React.FC<Props> = ({
  isClickedVarsayilanaDon,
  setIsClickedVarsayilanaDon,
  setTamamlanan,
  setToplam,
}) => {
  const theme  = useTheme();
  const router = useRouter();
  const user   = useSelector((state: AppState) => state.userReducer);

  const [rows, setRows]                 = useState<TespitEdilenRisklerRow[]>([]);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [loading, setLoading]           = useState(false);
  const [bulkSaving, setBulkSaving]     = useState(false);
  const [showLegend, setShowLegend]     = useState(false);

  // Dirty tracking
  const initialSnapshot = useRef<Map<number, string>>(new Map());

  // Navigation guard
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [targetUrl, setTargetUrl]                 = useState("");

  // Edit dialog
  const [editOpen, setEditOpen]         = useState(false);
  const [editingId, setEditingId]       = useState<number | null>(null);
  const [editForm, setEditForm]         = useState<EditForm>(EMPTY_EDIT);
  const [editSaving, setEditSaving]     = useState(false);

  // Delete confirm dialog
  const [deleteId, setDeleteId]         = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ── Dirty rows ── */
  const dirtyRowIds = useMemo(() => {
    const dirty = new Set<number>();
    rows.forEach((r) => {
      const snap = initialSnapshot.current.get(r.id);
      if (snap !== undefined && snap !== rowKey(r)) dirty.add(r.id);
    });
    return dirty;
  }, [rows]);

  /* ── Fetch ── */
  const fetchData = async () => {
    if (!user.denetciId || !user.denetlenenId || !user.yil) return;
    setLoading(true);
    const data = await getTespitEdilenRisklerByDenetlenen(
      user.denetciId, user.denetlenenId, user.yil
    );
    setRows(data);
    initialSnapshot.current = new Map(data.map((r) => [r.id, rowKey(r)]));
    setToplam(data.length);
    setTamamlanan(data.length);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user.denetciId, user.denetlenenId, user.yil]);

  /* ── Varsayılana dön ── */
  useEffect(() => {
    if (!isClickedVarsayilanaDon) return;
    const { denetciId, denetlenenId, yil } = user;
    if (!denetciId || !denetlenenId || !yil) { setIsClickedVarsayilanaDon(false); return; }
    (async () => {
      const ok = await varsayilanaDonTespitEdilenRiskler(denetciId, denetlenenId, yil);
      if (ok) { enqueueSnackbar("Varsayılan değerlere döndü", { variant: "success" }); await fetchData(); }
      else      enqueueSnackbar("Varsayılana dönme başarısız", { variant: "error" });
      setIsClickedVarsayilanaDon(false);
    })();
  }, [isClickedVarsayilanaDon]);

  /* ── Navigation guard ── */
  useEffect(() => {
    if (dirtyRowIds.size === 0) return;
    const beforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", beforeUnload);
    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      e.preventDefault();
      setTargetUrl(href);
      setConfirmDialogOpen(true);
    };
    document.addEventListener("click", handleAnchorClick, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, [dirtyRowIds.size]);

  /* ── Checkbox inline change ── */
  const handleBoolChange = (id: number, field: keyof Pick<EditForm,
    "gerceklik"|"tamOlma"|"varOlma"|"dogrulukDonemsellik"|"degerleme"|"siniflama">,
    value: boolean,
  ) => {
    setRows((prev) =>
      prev.map((r) => r.id === id ? { ...r, [field]: value } : r)
    );
  };

  /* ── Inline text change (expanded row) ── */
  const handleTextChange = useCallback((
    id: number,
    field: "uygulananDenetimTeknikleri" | "ilgiliBdsStandart",
    value: string,
  ) => {
    setRows((prev) =>
      prev.map((r) => r.id === id ? { ...r, [field]: value || null } : r)
    );
  }, []);

  /* ── Edit dialog ── */
  const openEditDialog = (row?: TespitEdilenRisklerRow) => {
    setEditingId(row?.id ?? null);
    setEditForm(row ? rowToForm(row) : EMPTY_EDIT);
    setEditOpen(true);
  };

  const handleEditChange = (field: keyof EditForm, value: string | boolean) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async () => {
    if (!user.denetciId || !user.denetlenenId || !user.yil) return;
    setEditSaving(true);

    let ok: boolean;
    if (editingId === null) {
      ok = await addSatirTespitEdilenRiskler({
        denetciId: user.denetciId,
        denetlenenId: user.denetlenenId,
        yil: user.yil,
        islem: editForm.islem,
        tespit: editForm.tespit,
        gerceklik: editForm.gerceklik,
        tamOlma: editForm.tamOlma,
        varOlma: editForm.varOlma,
        dogrulukDonemsellik: editForm.dogrulukDonemsellik,
        degerleme: editForm.degerleme,
        siniflama: editForm.siniflama,
        uygulananDenetimTeknikleri: editForm.uygulananDenetimTeknikleri || null,
        ilgiliBdsStandart: editForm.ilgiliBdsStandart || null,
      });
    } else {
      ok = await updateSatirTespitEdilenRiskler(editingId, {
        islem: editForm.islem,
        tespit: editForm.tespit,
        gerceklik: editForm.gerceklik,
        tamOlma: editForm.tamOlma,
        varOlma: editForm.varOlma,
        dogrulukDonemsellik: editForm.dogrulukDonemsellik,
        degerleme: editForm.degerleme,
        siniflama: editForm.siniflama,
        uygulananDenetimTeknikleri: editForm.uygulananDenetimTeknikleri || null,
        ilgiliBdsStandart: editForm.ilgiliBdsStandart || null,
      });
    }

    if (ok) {
      enqueueSnackbar(editingId === null ? "Satır eklendi" : "Satır güncellendi", { variant: "success" });
      setEditOpen(false);
      await fetchData();
    } else {
      enqueueSnackbar("İşlem başarısız", { variant: "error" });
    }
    setEditSaving(false);
  };

  /* ── Delete ── */
  const handleDeleteConfirm = async () => {
    if (deleteId === null) return;
    setDeleteLoading(true);
    const ok = await deleteSatirTespitEdilenRiskler(deleteId);
    if (ok) {
      enqueueSnackbar("Satır silindi", { variant: "success" });
      setDeleteConfirmOpen(false);
      setDeleteId(null);
      await fetchData();
    } else {
      enqueueSnackbar("Silme başarısız", { variant: "error" });
    }
    setDeleteLoading(false);
  };

  /* ── Bulk save ── */
  const handleBulkKaydet = async () => {
    if (!user.denetciId || !user.denetlenenId || !user.yil) return;
    setBulkSaving(true);
    const satirlar = rows.map((row) => ({
      id: row.id,
      gerceklik:                  row.gerceklik                ?? true,
      tamOlma:                    row.tamOlma                  ?? true,
      varOlma:                    row.varOlma                  ?? true,
      dogrulukDonemsellik:        row.dogrulukDonemsellik      ?? true,
      degerleme:                  row.degerleme                ?? true,
      siniflama:                  row.siniflama                ?? true,
      uygulananDenetimTeknikleri: row.uygulananDenetimTeknikleri ?? null,
      ilgiliBdsStandart:          row.ilgiliBdsStandart        ?? null,
    }));
    const ok = await kaydetTespitEdilenRiskler({
      denetciId: user.denetciId, denetlenenId: user.denetlenenId, yil: user.yil, satirlar,
    });
    if (ok) {
      enqueueSnackbar("Kaydedildi", { variant: "success" });
      // Snapshot'ı güncelle — tam refetch gereksiz
      initialSnapshot.current = new Map(rows.map((r) => [r.id, rowKey(r)]));
      // dirtyRowIds'i sıfırlamak için rows'u shallow-trigger et
      setRows((prev) => [...prev]);
    } else {
      enqueueSnackbar("Kaydetme başarısız", { variant: "error" });
    }
    setBulkSaving(false);
  };

  const isReadOnly = user.rol?.includes("KaliteKontrol") || user.rol?.includes("SorumluDenetci");

  /* ── HTML builder for export ── */
  const buildHtmlAsync = async () => {
    const createdAt = new Date().toLocaleString("tr-TR");
    const bv = (v: boolean | null | undefined) => (v ? "✔" : "—");
    const tableRows = rows.map((row, idx) => `
      <tr>
        <td class="center">${escapeHtml(String(row.satirNo ?? idx + 1))}</td>
        <td>${escapeHtml(row.islem)}</td>
        <td>${escapeHtml(row.tespit)}</td>
        <td class="center">${bv(row.gerceklik)}</td>
        <td class="center">${bv(row.tamOlma)}</td>
        <td class="center">${bv(row.varOlma)}</td>
        <td class="center">${bv(row.dogrulukDonemsellik)}</td>
        <td class="center">${bv(row.degerleme)}</td>
        <td class="center">${bv(row.siniflama)}</td>
        <td>${escapeHtml(row.uygulananDenetimTeknikleri)}</td>
        <td>${escapeHtml(row.ilgiliBdsStandart)}</td>
      </tr>`).join("");
    return `<!DOCTYPE html>
<html lang="tr"><head><meta charset="utf-8"/>
<title>BEYAN VE SORUŞTURMA SONUCU TESPİT EDİLEN RİSKLER BELGESİ</title>
<style>
  @page{size:A4 landscape;margin:1.5cm 1cm}
  *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  body{font-family:Arial,sans-serif;font-size:10px;color:#1a202c}
  .doc-header{border-bottom:2px solid #2b6cb0;padding-bottom:12px;margin-bottom:16px}
  .doc-title{font-size:14px;font-weight:700;color:#2b6cb0;text-transform:uppercase}
  .doc-meta{font-size:10px;color:#555;margin-top:4px}
  table{width:100%;border-collapse:collapse;table-layout:fixed}
  th{background:#f1f5f9;font-weight:700;border:1px solid #cbd5e0;padding:5px 6px;text-align:left}
  td{border:1px solid #e2e8f0;padding:4px 6px;vertical-align:top}
  tr:nth-child(even) td{background:#f8fafc}
  .center{text-align:center}
  .doc-footer{margin-top:24px;font-size:9px;color:#999;border-top:1px solid #e2e8f0;padding-top:8px;display:flex;justify-content:space-between}
</style></head><body>
<div class="doc-header">
  <div class="doc-title">BEYAN VE SORUŞTURMA SONUCU TESPİT EDİLEN RİSKLER BELGESİ</div>
  <div class="doc-meta">Denetlenen: ${escapeHtml(user.denetlenenFirmaAdi)} &nbsp;|&nbsp; Yıl: ${escapeHtml(String(user.yil ?? ""))}</div>
</div>
<table><thead><tr>
  <th style="width:4%">No</th><th style="width:18%">Tespit Edilen Risk</th><th style="width:14%">Etkilenen Hesap Grubu</th>
  <th style="width:3%">G</th><th style="width:3%">T</th><th style="width:3%">V</th><th style="width:3%">D</th><th style="width:3%">De</th><th style="width:3%">S</th>
  <th style="width:28%">Uygulanan Denetim Teknikleri</th><th style="width:18%">İlgili BDS</th>
</tr></thead><tbody>${tableRows}</tbody></table>
<div class="doc-footer"><span>FAS Denetim Sistemi</span><span>Oluşturulma: ${escapeHtml(createdAt)}</span></div>
</body></html>`;
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  /* ── Render ── */
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

      {/* Legend (collapsible) */}
      <Paper
        variant="outlined"
        sx={{
          borderLeft: `4px solid ${theme.palette.primary.main}`,
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          overflow: "hidden",
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ px: 2, py: 1, cursor: "pointer", userSelect: "none" }}
          onClick={() => setShowLegend((v) => !v)}
        >
          <IconInfoCircle size={16} color={theme.palette.primary.main} />
          <Typography variant="subtitle2" fontWeight={700} color="primary" sx={{ flex: 1 }}>
            Risk Boyutları Açıklamaları
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {showLegend ? "▲ gizle" : "▼ göster"}
          </Typography>
        </Stack>
        <Collapse in={showLegend}>
          <Box sx={{ px: 2, pb: 1.5 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {BOOL_COLS.map((col) => (
                <Chip
                  key={col.key}
                  label={`${col.label} — ${col.tooltip}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    borderColor: alpha(col.color, 0.4),
                    bgcolor: alpha(col.color, 0.06),
                    color: col.color,
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Collapse>
      </Paper>

      {/* Table */}
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 280px)", overflowX: "auto" }}>
          <Table size="small" stickyHeader sx={{ minWidth: 860, tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                <HeadCell align="center" sx={{ width: 44 }}>No</HeadCell>
                <HeadCell sx={{ width: "28%" }}>Tespit Edilen Risk</HeadCell>
                <HeadCell sx={{ width: "20%" }}>Etkilenen Hesap Grubu</HeadCell>
                {BOOL_COLS.map((col) => (
                  <Tooltip key={col.key} title={col.tooltip} arrow placement="top">
                    <HeadCell
                      align="center"
                      sx={{ width: 38, px: 0.5, bgcolor: `${alpha(col.color, 0.82)} !important` }}
                    >
                      {col.label}
                    </HeadCell>
                  </Tooltip>
                ))}
                <HeadCell align="center" sx={{ width: 44 }}>Det.</HeadCell>
                {!isReadOnly && (
                  <HeadCell align="center" sx={{ width: 72 }}>İşlem</HeadCell>
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((row, idx) => {
                const isExpanded = expandedRows[row.id] ?? false;
                const isEven     = idx % 2 === 0;
                const isDirty    = dirtyRowIds.has(row.id);

                return (
                  <React.Fragment key={row.id}>
                    {/* Main row */}
                    <TableRow
                      hover
                      sx={{
                        cursor: "pointer",
                        bgcolor: isDirty
                          ? alpha(theme.palette.warning.main, 0.06)
                          : isExpanded
                          ? alpha(theme.palette.primary.main, 0.06)
                          : isEven
                          ? alpha(theme.palette.action.hover, 0.4)
                          : "background.paper",
                        "&:hover": {
                          bgcolor: `${alpha(theme.palette.primary.light, 0.12)} !important`,
                        },
                        transition: "background-color 0.15s",
                      }}
                      onClick={() => setExpandedRows((prev) => ({ ...prev, [row.id]: !prev[row.id] }))}
                    >
                      {/* No */}
                      <BodyCell align="center" sx={{ width: 44 }}>
                        <Typography
                          variant="caption"
                          fontWeight={700}
                          sx={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: 24, height: 24, borderRadius: "50%",
                            bgcolor: isDirty
                              ? alpha(theme.palette.warning.main, 0.15)
                              : alpha(theme.palette.primary.main, 0.1),
                            color: isDirty ? theme.palette.warning.dark : theme.palette.primary.main,
                          }}
                        >
                          {row.satirNo ?? idx + 1}
                        </Typography>
                      </BodyCell>

                      {/* Risk / Islem */}
                      <BodyCell sx={{ width: "28%" }}>
                        <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.55, fontWeight: 500 }}>
                          {row.islem || <em style={{ color: "#999" }}>—</em>}
                        </Typography>
                      </BodyCell>

                      {/* Tespit / Hesap grubu */}
                      <BodyCell sx={{ width: "20%" }}>
                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line", lineHeight: 1.45 }}>
                          {row.tespit || <em>—</em>}
                        </Typography>
                      </BodyCell>

                      {/* Bool checkboxes */}
                      {BOOL_COLS.map((col) => (
                        <TableCell
                          key={col.key}
                          align="center"
                          sx={{ width: 38, padding: "4px 2px", verticalAlign: "middle" }}
                        >
                          <Checkbox
                            size="small"
                            checked={row[col.key] ?? true}
                            disabled={isReadOnly}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleBoolChange(row.id, col.key, e.target.checked)}
                            sx={{ p: 0, color: alpha(col.color, 0.35), "&.Mui-checked": { color: col.color } }}
                          />
                        </TableCell>
                      ))}

                      {/* Expand toggle */}
                      <BodyCell align="center" sx={{ width: 44 }}>
                        <IconButton
                          size="small"
                          color={isExpanded ? "primary" : "default"}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedRows((prev) => ({ ...prev, [row.id]: !prev[row.id] }));
                          }}
                        >
                          {isExpanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
                        </IconButton>
                      </BodyCell>

                      {/* Edit / Delete */}
                      {!isReadOnly && (
                        <BodyCell align="center" sx={{ width: 72 }}>
                          <Stack direction="row" justifyContent="center" spacing={0.25}>
                            <Tooltip title="Düzenle" arrow>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={(e) => { e.stopPropagation(); openEditDialog(row); }}
                              >
                                <IconPencil size={16} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Sil" arrow>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteId(row.id);
                                  setDeleteConfirmOpen(true);
                                }}
                              >
                                <IconTrash size={16} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </BodyCell>
                      )}
                    </TableRow>

                    {/* Expanded detail panel */}
                    <TableRow>
                      <TableCell
                        colSpan={isReadOnly ? 10 : 11}
                        sx={{ p: 0, borderBottom: isExpanded ? `1px solid ${theme.palette.divider}` : 0 }}
                      >
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box
                            sx={{ p: { xs: 2, md: 3 }, bgcolor: alpha(theme.palette.primary.main, 0.02) }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                  <IconSettings size={16} color={theme.palette.primary.main} />
                                  <Typography variant="subtitle2" fontWeight={700} fontSize="0.8rem">
                                    Uygulanan Denetim Teknikleri
                                  </Typography>
                                </Stack>
                                {isReadOnly ? (
                                  <Typography
                                    variant="body2"
                                    sx={{ whiteSpace: "pre-line", lineHeight: 1.65, color: "text.secondary", fontSize: "0.82rem" }}
                                  >
                                    {row.uygulananDenetimTeknikleri || <em>—</em>}
                                  </Typography>
                                ) : (
                                  <EditableTextField
                                    value={row.uygulananDenetimTeknikleri ?? ""}
                                    onCommit={(v) => handleTextChange(row.id, "uygulananDenetimTeknikleri", v)}
                                    placeholder="Denetim tekniklerini giriniz..."
                                  />
                                )}
                              </Box>
                              <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "flex" } }} />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                  <IconBook size={16} color={theme.palette.secondary.main} />
                                  <Typography variant="subtitle2" fontWeight={700} fontSize="0.8rem">
                                    İlgili BDS / Standart Rehberi
                                  </Typography>
                                </Stack>
                                {isReadOnly ? (
                                  <Typography
                                    variant="body2"
                                    sx={{ whiteSpace: "pre-line", lineHeight: 1.65, color: "text.secondary", fontSize: "0.82rem" }}
                                  >
                                    {row.ilgiliBdsStandart || <em>—</em>}
                                  </Typography>
                                ) : (
                                  <EditableTextField
                                    value={row.ilgiliBdsStandart ?? ""}
                                    onCommit={(v) => handleTextChange(row.id, "ilgiliBdsStandart", v)}
                                    placeholder="Standart referanslarını giriniz..."
                                  />
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Action bar */}
      {!isReadOnly && (
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            zIndex: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
            bgcolor: "background.paper",
            borderTop: dirtyRowIds.size > 0 ? `2px solid ${theme.palette.warning.main}` : `1px solid ${theme.palette.divider}`,
            px: 2,
            py: 1.5,
            borderRadius: 2,
            boxShadow: dirtyRowIds.size > 0
              ? `0 -2px 12px ${alpha(theme.palette.warning.main, 0.2)}`
              : "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant="outlined"
              color="primary"
              startIcon={<IconPlus size={18} />}
              onClick={() => openEditDialog()}
            >
              Yeni Satır
            </Button>
            {dirtyRowIds.size > 0 && (
              <Typography variant="caption" color="warning.dark" fontWeight={600}>
                {dirtyRowIds.size} satırda kaydedilmemiş değişiklik
              </Typography>
            )}
          </Stack>
          <Button
            variant="contained"
            color={dirtyRowIds.size > 0 ? "warning" : "primary"}
            startIcon={bulkSaving ? <CircularProgress size={16} color="inherit" /> : <IconDeviceFloppy size={18} />}
            disabled={bulkSaving}
            onClick={handleBulkKaydet}
            sx={{ minWidth: 140 }}
          >
            {bulkSaving ? "Kaydediliyor..." : dirtyRowIds.size > 0 ? "Değişiklikleri Kaydet" : "Kaydet"}
          </Button>
        </Box>
      )}

      <Box sx={{ mt: 2 }}>
        <FormOnayBolumu
          controller="TespitEdilenRiskler"
          onHazirlayanChange={fetchData}
          onOnaylayanChange={fetchData}
        />
      </Box>
      <IslemlerCardHtml
        controller="TespitEdilenRiskler"
        buildHtmlAsync={buildHtmlAsync}
      />

      {/* Edit / Add dialog */}
      <EditDialog
        open={editOpen}
        title={editingId === null ? "Yeni Satır Ekle" : "Satırı Düzenle"}
        form={editForm}
        saving={editSaving}
        onChange={handleEditChange}
        onSave={handleEditSave}
        onClose={() => setEditOpen(false)}
      />

      {/* Delete confirm */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs">
        <DialogTitle>Satırı Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bu satırı kalıcı olarak silmek istediğinizden emin misiniz?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" color="inherit" onClick={() => setDeleteConfirmOpen(false)}>
            İptal
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={14} color="inherit" /> : <IconTrash size={16} />}
            onClick={handleDeleteConfirm}
          >
            {deleteLoading ? "Siliniyor..." : "Sil"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Navigation guard dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="xs">
        <DialogTitle>Kaydedilmemiş Değişiklikler</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Kaydedilmemiş değişiklikleriniz var. Sayfadan ayrılırsanız bu değişiklikler kaybolacak.
            Devam etmek istiyor musunuz?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="outlined" color="inherit" onClick={() => setConfirmDialogOpen(false)}>
            İptal
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setConfirmDialogOpen(false);
              router.push(targetUrl);
            }}
          >
            Ayrıl
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TespitEdilenRisklerTable;
