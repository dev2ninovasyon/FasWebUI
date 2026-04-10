"use client";

import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { enqueueSnackbar } from "notistack";
import {
  getTespitEdilenRisklerByDenetlenen,
  kaydetTespitEdilenRiskler,
  varsayilanaDonTespitEdilenRiskler,
  TespitEdilenRisklerRow,
} from "@/api/CalismaKagitlari/TespitEdilenRiskler";
import BelgeKontrolCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCardHtml from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCardHtml";

interface LocalChange {
  gerceklik: boolean;
  tamOlma: boolean;
  varOlma: boolean;
  dogrulukDonemsellik: boolean;
  degerleme: boolean;
  siniflama: boolean;
  uygulananDenetimTeknikleri: string;
  ilgiliBdsStandart: string;
}

interface Props {
  isClickedVarsayilanaDon: boolean;
  setIsClickedVarsayilanaDon: (v: boolean) => void;
  setTamamlanan: (n: number) => void;
  setToplam: (n: number) => void;
}

function escapeHtml(value: string | null | undefined): string {
  return (value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const BOOL_COLS = [
  { key: "gerceklik" as const, label: "G", tooltip: "Gerçeklik" },
  { key: "tamOlma" as const, label: "T", tooltip: "Tamlık" },
  { key: "varOlma" as const, label: "V", tooltip: "Var Olma" },
  { key: "dogrulukDonemsellik" as const, label: "D", tooltip: "Doğruluk / Dönemsellik" },
  { key: "degerleme" as const, label: "De", tooltip: "Değerleme" },
  { key: "siniflama" as const, label: "S", tooltip: "Sınıflama / Sunum" },
];

const TespitEdilenRisklerTable: React.FC<Props> = ({
  isClickedVarsayilanaDon,
  setIsClickedVarsayilanaDon,
  setTamamlanan,
  setToplam,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const [rows, setRows] = useState<TespitEdilenRisklerRow[]>([]);
  const [localChanges, setLocalChanges] = useState<Record<number, LocalChange>>({});
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    if (!user.denetciId || !user.denetlenenId || !user.yil) return;
    setLoading(true);
    const data = await getTespitEdilenRisklerByDenetlenen(
      user.denetciId,
      user.denetlenenId,
      user.yil
    );
    setRows(data);
    // Initialize local changes from fetched data
    const init: Record<number, LocalChange> = {};
    data.forEach((row) => {
      init[row.id] = {
        gerceklik: row.gerceklik ?? true,
        tamOlma: row.tamOlma ?? true,
        varOlma: row.varOlma ?? true,
        dogrulukDonemsellik: row.dogrulukDonemsellik ?? true,
        degerleme: row.degerleme ?? true,
        siniflama: row.siniflama ?? true,
        uygulananDenetimTeknikleri: row.uygulananDenetimTeknikleri ?? "",
        ilgiliBdsStandart: row.ilgiliBdsStandart ?? "",
      };
    });
    setLocalChanges(init);
    setToplam(data.length);
    setTamamlanan(data.length); // All rows are present = all "tamamlanan"
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user.denetciId, user.denetlenenId, user.yil]);

  // Varsayılana dön
  useEffect(() => {
    if (!isClickedVarsayilanaDon) return;
    const denetciId = user.denetciId;
    const denetlenenId = user.denetlenenId;
    const yil = user.yil;
    if (!denetciId || !denetlenenId || !yil) {
      setIsClickedVarsayilanaDon(false);
      return;
    }
    const doVarsayilan = async () => {
      const ok = await varsayilanaDonTespitEdilenRiskler(
        denetciId,
        denetlenenId,
        yil
      );
      if (ok) {
        enqueueSnackbar("Varsayılan değerlere döndü", { variant: "success" });
        await fetchData();
      } else {
        enqueueSnackbar("Varsayılana dönme başarısız", { variant: "error" });
      }
      setIsClickedVarsayilanaDon(false);
    };
    doVarsayilan();
  }, [isClickedVarsayilanaDon]);

  const handleBoolChange = (id: number, field: keyof Omit<LocalChange, "uygulananDenetimTeknikleri" | "ilgiliBdsStandart">, value: boolean) => {
    setLocalChanges((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleTextChange = (id: number, field: "uygulananDenetimTeknikleri" | "ilgiliBdsStandart", value: string) => {
    setLocalChanges((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const toggleExpand = (id: number) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleKaydet = async () => {
    if (!user.denetciId || !user.denetlenenId || !user.yil) return;
    setSaving(true);
    const satirlar = rows.map((row) => {
      const ch = localChanges[row.id];
      return {
        id: row.id,
        gerceklik: ch?.gerceklik ?? row.gerceklik ?? true,
        tamOlma: ch?.tamOlma ?? row.tamOlma ?? true,
        varOlma: ch?.varOlma ?? row.varOlma ?? true,
        dogrulukDonemsellik: ch?.dogrulukDonemsellik ?? row.dogrulukDonemsellik ?? true,
        degerleme: ch?.degerleme ?? row.degerleme ?? true,
        siniflama: ch?.siniflama ?? row.siniflama ?? true,
        uygulananDenetimTeknikleri: ch?.uygulananDenetimTeknikleri ?? row.uygulananDenetimTeknikleri ?? null,
        ilgiliBdsStandart: ch?.ilgiliBdsStandart ?? row.ilgiliBdsStandart ?? null,
      };
    });

    const ok = await kaydetTespitEdilenRiskler({
      denetciId: user.denetciId,
      denetlenenId: user.denetlenenId,
      yil: user.yil,
      satirlar,
    });

    if (ok) {
      enqueueSnackbar("Kaydedildi", { variant: "success" });
      await fetchData();
    } else {
      enqueueSnackbar("Kaydetme başarısız", { variant: "error" });
    }
    setSaving(false);
  };

  const isReadOnly =
    user.rol?.includes("KaliteKontrol") || user.rol?.includes("SorumluDenetci");

  const buildHtmlAsync = async () => {
    const createdAt = new Date().toLocaleString("tr-TR");
    const boolValue = (value: boolean | undefined) => (value ? "✔" : "—");
    const tableRows = rows
      .map((row, idx) => {
        const ch = localChanges[row.id];
        return `
          <tr>
            <td>${escapeHtml(String(row.satirNo ?? idx + 1))}</td>
            <td>${escapeHtml(row.islem)}</td>
            <td>${escapeHtml(row.tespit)}</td>
            <td class="center">${boolValue(ch?.gerceklik ?? row.gerceklik ?? true)}</td>
            <td class="center">${boolValue(ch?.tamOlma ?? row.tamOlma ?? true)}</td>
            <td class="center">${boolValue(ch?.varOlma ?? row.varOlma ?? true)}</td>
            <td class="center">${boolValue(
              ch?.dogrulukDonemsellik ?? row.dogrulukDonemsellik ?? true
            )}</td>
            <td class="center">${boolValue(ch?.degerleme ?? row.degerleme ?? true)}</td>
            <td class="center">${boolValue(ch?.siniflama ?? row.siniflama ?? true)}</td>
            <td>${escapeHtml(
              ch?.uygulananDenetimTeknikleri ?? row.uygulananDenetimTeknikleri
            )}</td>
            <td>${escapeHtml(ch?.ilgiliBdsStandart ?? row.ilgiliBdsStandart)}</td>
          </tr>
        `;
      })
      .join("");

    return `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="utf-8" />
        <title>BEYAN VE SORUŞTURMA SONUCU TESPİT EDİLEN RİSKLER BELGESİ</title>
        <style>
          @page { size: A4 landscape; margin: 1.5cm 1cm; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body { font-family: Arial, sans-serif; font-size: 10px; color: #1a202c; }
          .doc-header { border-bottom: 2px solid #2b6cb0; padding-bottom: 12px; margin-bottom: 16px; }
          .doc-title { font-size: 14px; font-weight: 700; color: #2b6cb0; text-transform: uppercase; }
          .doc-meta { font-size: 10px; color: #555; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; table-layout: fixed; }
          th { background: #f1f5f9; font-weight: 700; border: 1px solid #cbd5e0; padding: 5px 6px; text-align: left; }
          td { border: 1px solid #e2e8f0; padding: 4px 6px; vertical-align: top; }
          tr:nth-child(even) td { background: #f8fafc; }
          .center { text-align: center; }
          .doc-footer { margin-top: 24px; font-size: 9px; color: #999; border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; }
          .page-number::before { content: "Sayfa " counter(page); }
        </style>
      </head>
      <body>
        <div class="doc-header">
          <div class="doc-title">BEYAN VE SORUŞTURMA SONUCU TESPİT EDİLEN RİSKLER BELGESİ</div>
          <div class="doc-meta">Denetlenen: ${escapeHtml(
            user.denetlenenFirmaAdi
          )} &nbsp;|&nbsp; Yıl: ${escapeHtml(String(user.yil ?? ""))}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:4%;">No</th>
              <th style="width:18%;">Tespit Edilen Risk</th>
              <th style="width:14%;">Etkilenen Hesap Grubu</th>
              <th style="width:3%;">G</th>
              <th style="width:3%;">T</th>
              <th style="width:3%;">V</th>
              <th style="width:3%;">D</th>
              <th style="width:3%;">De</th>
              <th style="width:3%;">S</th>
              <th style="width:28%;">Uygulanan Denetim Teknikleri</th>
              <th style="width:18%;">İlgili BDS</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
        <div class="doc-footer">
          <span>FAS Denetim Sistemi</span>
          <span>Oluşturulma: ${escapeHtml(createdAt)}</span>
          <span class="page-number"></span>
        </div>
      </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Legend */}
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Beyan Kategorileri:</strong>&nbsp; G = Gerçeklik &nbsp;|&nbsp; T = Tamlık &nbsp;|&nbsp;
          V = Var Olma &nbsp;|&nbsp; D = Doğruluk / Dönemsellik &nbsp;|&nbsp; De = Değerleme &nbsp;|&nbsp;
          S = Sınıflama / Sunum &nbsp;&nbsp;
          <strong>✔</strong> = Risk bu boyutu etkiliyor &nbsp;|&nbsp; <strong>—</strong> = Bu boyutu etkilemiyor
        </Typography>
      </Paper>

      {/* Main table */}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small" sx={{ tableLayout: "fixed" }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.100" }}>
              <TableCell sx={{ width: 40, fontWeight: 700 }}>No</TableCell>
              <TableCell sx={{ width: "25%", fontWeight: 700 }}>Tespit Edilen Risk</TableCell>
              <TableCell sx={{ width: "18%", fontWeight: 700 }}>Etkilenen Hesap Grubu</TableCell>
              {BOOL_COLS.map((col) => (
                <Tooltip key={col.key} title={col.tooltip} arrow>
                  <TableCell
                    align="center"
                    sx={{ width: 44, fontWeight: 700, cursor: "help", px: 0.5 }}
                  >
                    {col.label}
                  </TableCell>
                </Tooltip>
              ))}
              <TableCell sx={{ fontWeight: 700 }}>Detay</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => {
              const ch = localChanges[row.id] ?? {};
              const isExpanded = expandedRows[row.id] ?? false;
              return (
                <React.Fragment key={row.id}>
                  <TableRow
                    sx={{
                      bgcolor: idx % 2 === 0 ? "background.paper" : "action.hover",
                      "&:hover": { bgcolor: "action.selected" },
                      verticalAlign: "top",
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>{row.satirNo ?? idx + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.5 }}>
                        {row.islem}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.5 }}>
                        {row.tespit}
                      </Typography>
                    </TableCell>
                    {BOOL_COLS.map((col) => (
                      <TableCell key={col.key} align="center" sx={{ px: 0.5 }}>
                        <Checkbox
                          size="small"
                          checked={ch[col.key] ?? true}
                          disabled={isReadOnly}
                          onChange={(e) => handleBoolChange(row.id, col.key, e.target.checked)}
                          sx={{ p: 0 }}
                        />
                      </TableCell>
                    ))}
                    <TableCell>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => toggleExpand(row.id)}
                        endIcon={isExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                        sx={{ textTransform: "none", fontSize: "0.75rem" }}
                      >
                        {isExpanded ? "Gizle" : "Göster"}
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={10} sx={{ p: 0, border: 0 }}>
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 2, bgcolor: "grey.50", display: "flex", gap: 2, flexWrap: "wrap" }}>
                          <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" gutterBottom display="block">
                              Uygulanan Denetim Teknikleri
                            </Typography>
                            <TextField
                              multiline
                              minRows={4}
                              maxRows={12}
                              fullWidth
                              size="small"
                              value={ch.uygulananDenetimTeknikleri ?? ""}
                              disabled={isReadOnly}
                              onChange={(e) => handleTextChange(row.id, "uygulananDenetimTeknikleri", e.target.value)}
                              sx={{ "& .MuiInputBase-input": { fontSize: "0.8rem", lineHeight: 1.6 } }}
                            />
                          </Box>
                          <Box sx={{ flex: "1 1 280px", minWidth: 0 }}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" gutterBottom display="block">
                              İlgili BDS / Standart
                            </Typography>
                            <TextField
                              multiline
                              minRows={4}
                              maxRows={12}
                              fullWidth
                              size="small"
                              value={ch.ilgiliBdsStandart ?? ""}
                              disabled={isReadOnly}
                              onChange={(e) => handleTextChange(row.id, "ilgiliBdsStandart", e.target.value)}
                              sx={{ "& .MuiInputBase-input": { fontSize: "0.8rem", lineHeight: 1.6 } }}
                            />
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

      {/* Kaydet button */}
      {!isReadOnly && (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleKaydet}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </Box>
      )}

      <BelgeKontrolCard controller="TespitEdilenRiskler" />
      <IslemlerCardHtml
        controller="TespitEdilenRiskler"
        buildHtmlAsync={buildHtmlAsync}
      />
    </Box>
  );
};

export default TespitEdilenRisklerTable;
