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
import IslemlerCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCard";

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
    const doVarsayilan = async () => {
      const ok = await varsayilanaDonTespitEdilenRiskler(
        user.denetciId,
        user.denetlenenId,
        user.yil
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

  const isReadOnly = user.rol === "KaliteKontrol" || user.rol === "SorumluDenetci";

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
            <TableRow sx={{ bgcolor: "primary.main" }}>
              <TableCell sx={{ color: "white", width: 40, fontWeight: 700 }}>No</TableCell>
              <TableCell sx={{ color: "white", width: "25%", fontWeight: 700 }}>Tespit Edilen Risk</TableCell>
              <TableCell sx={{ color: "white", width: "18%", fontWeight: 700 }}>Etkilenen Hesap Grubu</TableCell>
              {BOOL_COLS.map((col) => (
                <Tooltip key={col.key} title={col.tooltip} arrow>
                  <TableCell
                    align="center"
                    sx={{ color: "white", width: 44, fontWeight: 700, cursor: "help", px: 0.5 }}
                  >
                    {col.label}
                  </TableCell>
                </Tooltip>
              ))}
              <TableCell sx={{ color: "white", fontWeight: 700 }}>Detay</TableCell>
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
                            <Typography variant="caption" fontWeight={700} color="primary" gutterBottom display="block">
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
                            <Typography variant="caption" fontWeight={700} color="primary" gutterBottom display="block">
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
      <IslemlerCard controller="TespitEdilenRiskler" />
    </Box>
  );
};

export default TespitEdilenRisklerTable;
