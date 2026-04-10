"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { enqueueSnackbar } from "notistack";
import {
  getIsletmeyeIliskinIcKontrolTespitByDenetlenen,
  kaydetIsletmeyeIliskinIcKontrolTespit,
  varsayilanaDonIsletmeyeIliskinIcKontrolTespit,
  IsletmeyeIliskinIcKontrolTespitRow,
} from "@/api/CalismaKagitlari/IsletmeyeIliskinIcKontrolTespit";
import BelgeKontrolCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCard";

interface LocalChange {
  durum: string;
  tespit: string;
}

interface Props {
  isClickedVarsayilanaDon: boolean;
  setIsClickedVarsayilanaDon: (v: boolean) => void;
  setTamamlanan: (n: number) => void;
  setToplam: (n: number) => void;
}

const RISK_CHIP: Record<string, "error" | "warning" | "info" | "success" | "default"> = {
  Kritik: "error",
  Yüksek: "warning",
  Orta: "info",
  Düşük: "success",
};

function getRiskColor(seviye: string | null) {
  if (!seviye) return "default";
  return RISK_CHIP[seviye] ?? "default";
}

const IsletmeyeIliskinIcKontrolTespitTable: React.FC<Props> = ({
  isClickedVarsayilanaDon,
  setIsClickedVarsayilanaDon,
  setTamamlanan,
  setToplam,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const [rows, setRows] = useState<IsletmeyeIliskinIcKontrolTespitRow[]>([]);
  const [localChanges, setLocalChanges] = useState<Record<number, LocalChange>>({});
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    if (!user.denetciId || !user.denetlenenId || !user.yil) return;
    setLoading(true);
    const data = await getIsletmeyeIliskinIcKontrolTespitByDenetlenen(
      user.denetciId,
      user.denetlenenId,
      user.yil
    );
    setRows(data);
    const init: Record<number, LocalChange> = {};
    data.forEach((row) => {
      const durum = row.durum ?? "Evet";
      init[row.id] = {
        durum,
        tespit: row.tespit ?? (durum === "Evet" ? row.evetIcerik ?? "" : row.hayirIcerik ?? ""),
      };
    });
    setLocalChanges(init);
    setToplam(data.length);
    setTamamlanan(data.filter((r) => r.durum === "Evet" || r.durum === "Hayır").length);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user.denetciId, user.denetlenenId, user.yil]);

  useEffect(() => {
    if (!isClickedVarsayilanaDon) return;
    const doVarsayilan = async () => {
      const ok = await varsayilanaDonIsletmeyeIliskinIcKontrolTespit(
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

  const handleDurumChange = (id: number, durum: string, row: IsletmeyeIliskinIcKontrolTespitRow) => {
    const autoTespit = durum === "Evet" ? row.evetIcerik ?? "" : row.hayirIcerik ?? "";
    setLocalChanges((prev) => ({
      ...prev,
      [id]: { durum, tespit: autoTespit },
    }));
  };

  const handleTespitChange = (id: number, tespit: string) => {
    setLocalChanges((prev) => ({
      ...prev,
      [id]: { ...prev[id], tespit },
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
        durum: ch?.durum ?? row.durum ?? "Evet",
        tespit: ch?.tespit ?? row.tespit ?? null,
      };
    });
    const ok = await kaydetIsletmeyeIliskinIcKontrolTespit({
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

  // Group rows by Konu (AltBölüm)
  const groups: Record<string, IsletmeyeIliskinIcKontrolTespitRow[]> = {};
  rows.forEach((row) => {
    const key = row.konu ?? "Diğer";
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  });

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* BDS Referans Notu */}
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>BDS 315</strong> §A56-A80 · <strong>BDS 240</strong> §A2 · <strong>BDS 265</strong> §9 ·{" "}
          <strong>BDS 330</strong> §6-21 · <strong>BDS 501</strong> §4-9
        </Typography>
      </Paper>

      {/* Risk Seviyesi Açıklama */}
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>RİSK KRİTERİ:</strong>&nbsp;
          <Chip label="Kritik" color="error" size="small" sx={{ mx: 0.5 }} /> Görevler ayrılığı / hile / varlık güvenliği &nbsp;|&nbsp;
          <Chip label="Yüksek" color="warning" size="small" sx={{ mx: 0.5 }} /> Kritik kontrol eksikliği &nbsp;|&nbsp;
          <Chip label="Orta" color="info" size="small" sx={{ mx: 0.5 }} /> Kontrol zafiyeti &nbsp;|&nbsp;
          <Chip label="Düşük" color="success" size="small" sx={{ mx: 0.5 }} /> Standart prosedür yeterli
        </Typography>
      </Paper>

      {/* Grouped tables */}
      {Object.entries(groups).map(([konu, groupRows]) => (
        <Box key={konu}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              bgcolor: "primary.50",
              px: 2,
              py: 0.75,
              borderRadius: 1,
              mb: 0.5,
            }}
          >
            {konu}
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small" sx={{ tableLayout: "fixed" }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.100" }}>
                  <TableCell sx={{ width: 40, fontWeight: 700 }}>No</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Kontrol Sorusu</TableCell>
                  <TableCell sx={{ width: 130, fontWeight: 700 }}>Yanıt</TableCell>
                  <TableCell sx={{ width: 100, fontWeight: 700 }}>Risk</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Tespit / Açıklama</TableCell>
                  <TableCell sx={{ width: 80, fontWeight: 700 }}>Detay</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groupRows.map((row, idx) => {
                  const ch = localChanges[row.id] ?? { durum: row.durum ?? "Evet", tespit: "" };
                  const isEvet = ch.durum === "Evet";
                  const riskSeviye = isEvet ? row.evetRiskSeviyesi : row.hayirRiskSeviyesi;
                  const denetimAksiyonu = isEvet ? row.evetDenetimAksiyonu : row.hayirDenetimAksiyonu;
                  const isExpanded = expandedRows[row.id] ?? false;

                  return (
                    <React.Fragment key={row.id}>
                      <TableRow
                        sx={{
                          bgcolor: idx % 2 === 0 ? "background.paper" : "action.hover",
                          verticalAlign: "top",
                        }}
                      >
                        <TableCell sx={{ fontWeight: 600, pt: 1.5 }}>{row.satirNo ?? idx + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ lineHeight: 1.5, pt: 0.5 }}>
                            {row.islem}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <RadioGroup
                            row
                            value={ch.durum}
                            onChange={(e) => !isReadOnly && handleDurumChange(row.id, e.target.value, row)}
                          >
                            <FormControlLabel
                              value="Evet"
                              control={<Radio size="small" disabled={isReadOnly} />}
                              label={<Typography variant="body2">Evet</Typography>}
                              sx={{ mr: 0.5 }}
                            />
                            <FormControlLabel
                              value="Hayır"
                              control={<Radio size="small" disabled={isReadOnly} />}
                              label={<Typography variant="body2">Hayır</Typography>}
                            />
                          </RadioGroup>
                        </TableCell>
                        <TableCell sx={{ pt: 1.5 }}>
                          {riskSeviye && (
                            <Chip
                              label={riskSeviye}
                              color={getRiskColor(riskSeviye)}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <TextField
                            multiline
                            minRows={2}
                            maxRows={6}
                            fullWidth
                            size="small"
                            value={ch.tespit}
                            disabled={isReadOnly}
                            onChange={(e) => handleTespitChange(row.id, e.target.value)}
                            sx={{ "& .MuiInputBase-input": { fontSize: "0.8rem" } }}
                          />
                        </TableCell>
                        <TableCell sx={{ pt: 1.5 }}>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => toggleExpand(row.id)}
                            endIcon={isExpanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                            sx={{ textTransform: "none", fontSize: "0.72rem", minWidth: 0 }}
                          >
                            {isExpanded ? "Gizle" : "Detay"}
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 2, bgcolor: "grey.50", display: "flex", gap: 2, flexWrap: "wrap" }}>
                              <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
                                <Typography variant="caption" fontWeight={700} color="primary" display="block" gutterBottom>
                                  Denetim Aksiyonu &amp; Risk Kriteri
                                </Typography>
                                <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.6, fontSize: "0.8rem" }}>
                                  {denetimAksiyonu ?? "—"}
                                </Typography>
                              </Box>
                              <Box sx={{ flex: "0 0 200px", minWidth: 0 }}>
                                <Typography variant="caption" fontWeight={700} color="primary" display="block" gutterBottom>
                                  İlgili BDS / Standart
                                </Typography>
                                <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.6, fontSize: "0.8rem" }}>
                                  {row.ilgiliBds ?? "—"}
                                </Typography>
                              </Box>
                              {!isEvet && (
                                <Box sx={{ flex: "1 1 200px", minWidth: 0 }}>
                                  <Typography variant="caption" fontWeight={700} color="error" display="block" gutterBottom>
                                    Hayır Seçildiğinde Risk
                                  </Typography>
                                  <Tooltip title={row.hayirDenetimAksiyonu ?? ""} arrow>
                                    <Chip
                                      label={row.hayirRiskSeviyesi ?? "—"}
                                      color={getRiskColor(row.hayirRiskSeviyesi)}
                                      size="small"
                                    />
                                  </Tooltip>
                                </Box>
                              )}
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
        </Box>
      ))}

      {/* Kaydet */}
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

      <BelgeKontrolCard controller="IsletmeyeIliskinIcKontrolTespit" />
      <IslemlerCard controller="IsletmeyeIliskinIcKontrolTespit" />
    </Box>
  );
};

export default IsletmeyeIliskinIcKontrolTespitTable;
