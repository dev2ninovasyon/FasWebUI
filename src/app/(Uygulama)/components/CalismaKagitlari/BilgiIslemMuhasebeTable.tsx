"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  FormControlLabel,
  Grid,
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
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SaveIcon from "@mui/icons-material/Save";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useSnackbar } from "notistack";
import {
  BilgiIslemMuhasebeRow,
  getBilgiIslemMuhasebeByDenetlenen,
  kaydetBilgiIslemMuhasebe,
} from "@/api/CalismaKagitlari/BilgiIslemMuhasebe";
import BelgeKontrolCard from "./Cards/BelgeKontrolCard";
import IslemlerCardHtml from "./Cards/IslemlerCardHtml";

// ─────────────────────────────────────────────
//  Yardımcı: Risk rengini döner
// ─────────────────────────────────────────────
type MuiChipColor = "error" | "warning" | "info" | "success" | "default";

function getRiskColor(risk: string | null): MuiChipColor {
  if (!risk) return "default";
  switch (risk.toUpperCase()) {
    case "KRİTİK": return "error";
    case "YÜKSEK": return "warning";
    case "ORTA":   return "info";
    case "DÜŞÜK":  return "success";
    default:       return "default";
  }
}

function escapeHtml(value: string | null | undefined): string {
  return (value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function riskChipClass(seviye: string | null): string {
  if (!seviye) return "";
  const s = seviye.toUpperCase();
  if (s.includes("KRİT") || s.includes("KRIT")) return "chip chip-error";
  if (s.includes("YÜKS") || s.includes("YUKS")) return "chip chip-warn";
  if (s === "ORTA") return "chip chip-info";
  if (s.includes("DÜŞÜ") || s.includes("DUSU")) return "chip chip-ok";
  return "chip";
}

// ─────────────────────────────────────────────
//  Yardımcı: "Hizli Referans" verilerini filtrele
// ─────────────────────────────────────────────
const HIZLI_REFERANS_RISKLER = ["KRİTİK", "YÜKSEK"];

// ─────────────────────────────────────────────
//  Ana Bileşen
// ─────────────────────────────────────────────
interface Props {
  isClickedVarsayilanaDon: boolean;
  setIsClickedVarsayilanaDon: (v: boolean) => void;
  setTamamlanan: (v: number) => void;
  setToplam: (v: number) => void;
}

const CONTROLLER = "BilgiIslemMuhasebe";

const BilgiIslemMuhasebeTable: React.FC<Props> = ({
  isClickedVarsayilanaDon,
  setIsClickedVarsayilanaDon,
  setTamamlanan,
  setToplam,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  // Veriler ve durum
  const [rows, setRows] = useState<BilgiIslemMuhasebeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Hangi sheet accordion'ı açık
  const [activeSheet, setActiveSheet] = useState<string>("BT Degerlendirme Belgesi");
  const [hizliReferansAcik, setHizliReferansAcik] = useState(false);

  // Kullanıcının local olarak değiştirdiği satırlar { id -> {durum, tespit} }
  const [localChanges, setLocalChanges] = useState<
    Record<number, { durum: string; tespit: string }>
  >({});

  // ── Veri Yükleme ──────────────────────────────
  const fetchData = useCallback(async () => {
    if (!user.denetciId || !user.denetlenenId || !user.yil) return;
    setLoading(true);
    try {
      const data = await getBilgiIslemMuhasebeByDenetlenen(
        user.denetciId,
        user.denetlenenId,
        user.yil
      );
      setRows(data);

      // İlk yüklemede local state'i doldur
      const initial: Record<number, { durum: string; tespit: string }> = {};
      data.forEach((r) => {
        initial[r.id] = {
          durum: r.durum ?? "Evet",
          tespit: r.tespit ?? (r.durum === "Hayır" ? r.hayirIcerik ?? "" : r.evetIcerik ?? ""),
        };
      });
      setLocalChanges(initial);

      // Sayaçlar: Hayır seçilmişleri tamamlanmış say
      const tamamlanan = data.filter(
        (r) => r.durum && r.durum !== "" && r.standartmi === false
      ).length;
      setTamamlanan(tamamlanan);
      setToplam(data.length);
    } catch (e) {
      enqueueSnackbar("Veriler yüklenirken hata oluştu", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [user.denetciId, user.denetlenenId, user.yil]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Varsayılana Dön ────────────────────────────
  useEffect(() => {
    if (isClickedVarsayilanaDon) {
      fetchData();
      setIsClickedVarsayilanaDon(false);
    }
  }, [isClickedVarsayilanaDon]);

  // ── Evet/Hayır Seçimi Değişince ───────────────
  const handleDurumChange = (id: number, newDurum: string) => {
    setLocalChanges((prev) => {
      const row = rows.find((r) => r.id === id);
      const templateText =
        newDurum === "Hayır"
          ? row?.hayirIcerik ?? ""
          : row?.evetIcerik ?? "";

      return {
        ...prev,
        [id]: {
          durum: newDurum,
          tespit: templateText,
        },
      };
    });
  };

  // ── Tespit Metni Değişince ─────────────────────
  const handleTespitChange = (id: number, newTespit: string) => {
    setLocalChanges((prev) => ({
      ...prev,
      [id]: { ...prev[id], tespit: newTespit },
    }));
  };

  // ── Kaydet ────────────────────────────────────
  const handleKaydet = async () => {
    if (!user.denetciId || !user.denetlenenId || !user.yil) return;
    setSaving(true);
    try {
      const satirlar = Object.entries(localChanges).map(([idStr, val]) => ({
        id: parseInt(idStr),
        durum: val.durum,
        tespit: val.tespit,
      }));

      const success = await kaydetBilgiIslemMuhasebe({
        denetciId: user.denetciId,
        denetlenenId: user.denetlenenId,
        yil: user.yil,
        satirlar,
      });

      if (success) {
        enqueueSnackbar("Belgeler başarıyla kaydedildi", { variant: "success" });
        await fetchData();
      } else {
        enqueueSnackbar("Kaydetme işlemi başarısız", { variant: "error" });
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Sheet grupları ─────────────────────────────
  const mainRows = rows.filter(
    (r) =>
      !r.sheetAdi ||
      r.sheetAdi === "BT Degerlendirme Belgesi" ||
      r.sheetAdi === ""
  );

  const hizliRows = rows.filter((r) =>
    HIZLI_REFERANS_RISKLER.includes((r.riskSeviyesi ?? "").toUpperCase())
  );

  const buildHtmlAsync = async () => {
    const createdAt = new Date().toLocaleString("tr-TR");
    const tableRows = mainRows
      .map((row, idx) => {
        const localState = localChanges[row.id];
        const currentDurum = localState?.durum ?? row.durum ?? "Evet";
        const currentTespit =
          localState?.tespit ??
          (currentDurum === "Hayır"
            ? row.hayirIcerik ?? ""
            : row.evetIcerik ?? "");
        const tespitValue = currentDurum === "Hayır" ? currentTespit : "";

        return `
          <tr>
            <td>${escapeHtml(String(row.satirNo ?? idx + 1))}</td>
            <td><span class="${riskChipClass(row.riskSeviyesi)}">${escapeHtml(
              row.riskSeviyesi ?? "—"
            )}</span></td>
            <td>${escapeHtml(row.islem)}</td>
            <td>${escapeHtml(currentDurum)}</td>
            <td>${escapeHtml(tespitValue)}</td>
            <td>${escapeHtml(row.bdsReferansi)}</td>
          </tr>
        `;
      })
      .join("");

    return `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="utf-8" />
        <title>BİLGİ İŞLEM VE MUHASEBE SİSTEMİNE İLİŞKİN DEĞERLENDİRME BELGESİ</title>
        <style>
          @page { size: A4; margin: 2cm; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body { font-family: Arial, sans-serif; font-size: 10px; color: #1a202c; }
          .doc-header { border-bottom: 2px solid #2b6cb0; padding-bottom: 12px; margin-bottom: 16px; }
          .doc-title { font-size: 14px; font-weight: 700; color: #2b6cb0; text-transform: uppercase; }
          .doc-meta { font-size: 10px; color: #555; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          th { background: #f1f5f9; font-weight: 700; border: 1px solid #cbd5e0; padding: 5px 6px; text-align: left; }
          td { border: 1px solid #e2e8f0; padding: 4px 6px; vertical-align: top; }
          tr:nth-child(even) td { background: #f8fafc; }
          .chip { display: inline-block; padding: 1px 6px; border-radius: 3px; font-size: 9px; font-weight: 600; border: 1px solid; }
          .chip-error { background:#fdf2f2; color:#b91c1c; border-color:#fca5a5; }
          .chip-warn { background:#fffbeb; color:#b45309; border-color:#fcd34d; }
          .chip-info { background:#eff6ff; color:#1d4ed8; border-color:#93c5fd; }
          .chip-ok { background:#f0fdf4; color:#15803d; border-color:#86efac; }
          .doc-footer { margin-top: 24px; font-size: 9px; color: #999; border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; }
          .page-number::before { content: "Sayfa " counter(page); }
        </style>
      </head>
      <body>
        <div class="doc-header">
          <div class="doc-title">BİLGİ İŞLEM VE MUHASEBE SİSTEMİNE İLİŞKİN DEĞERLENDİRME BELGESİ</div>
          <div class="doc-meta">Denetlenen: ${escapeHtml(
            user.denetlenenFirmaAdi
          )} &nbsp;|&nbsp; Yıl: ${escapeHtml(String(user.yil ?? ""))}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:4%;">No</th>
              <th style="width:10%;">Risk</th>
              <th style="width:31%;">Soru</th>
              <th style="width:10%;">Yanıt (Evet/Hayır)</th>
              <th style="width:33%;">Açıklama/Tespit</th>
              <th style="width:12%;">BDS Ref.</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
        <div class="doc-footer">
          <span>Oluşturulma: ${escapeHtml(createdAt)}</span>
          <span class="page-number"></span>
        </div>
      </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "95%", margin: "0 auto" }}>

      {/* ═══════════════════════════════════════════
          BÖLÜM 1: BT DEĞERLENDİRME BELGESİ
      ═══════════════════════════════════════════ */}
      <Paper
        elevation={2}
        sx={{
          mb: 3,
          borderRadius: 2,
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* Sheet Başlığı */}
        <Box
          onClick={() =>
            setActiveSheet((prev) =>
              prev === "BT Degerlendirme Belgesi" ? "" : "BT Degerlendirme Belgesi"
            )
          }
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 2,
            cursor: "pointer",
            bgcolor:
              theme.palette.mode === "dark"
                ? theme.palette.grey[800]
                : theme.palette.grey[100],
            "&:hover": { opacity: 0.92 },
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              BİLGİ İŞLEM VE MUHASEBE SİSTEMİNE İLİŞKİN DEĞERLENDİRME BELGESİ
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              İlgili BDS: BDS 315 §A56-A99 | BDS 240 §A2 | BDS 265 §9 | BDS 330 §7-18
            </Typography>
          </Box>
          {activeSheet === "BT Degerlendirme Belgesi" ? (
            <ExpandLessIcon />
          ) : (
            <ExpandMoreIcon />
          )}
        </Box>

        <Collapse in={activeSheet === "BT Degerlendirme Belgesi"} timeout="auto">
          {/* Kullanım notu */}
          <Box
            sx={{
              px: 3,
              py: 1.5,
              bgcolor:
                theme.palette.mode === "dark"
                  ? theme.palette.grey[800]
                  : theme.palette.grey[50],
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              <strong>KULLANIM:</strong> Her soru için <strong>Evet</strong> veya{" "}
              <strong>Hayır</strong> seçin. Evet → Belge şablonu metin otomatik
              doldurulur. Hayır → Aksiyon adımları gösterilir. Metni
              düzenleyebilirsiniz.
            </Typography>
          </Box>

          {/* Tablo */}
          <TableContainer>
            <Table size="small" sx={{ tableLayout: "fixed" }}>
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? theme.palette.grey[800]
                        : theme.palette.grey[100],
                  }}
                >
                  <TableCell width="4%" align="center">
                    <Typography variant="caption" fontWeight={700}>
                      No
                    </Typography>
                  </TableCell>
                  <TableCell width="8%" align="center">
                    <Typography variant="caption" fontWeight={700}>
                      Risk
                    </Typography>
                  </TableCell>
                  <TableCell width="28%">
                    <Typography variant="caption" fontWeight={700}>
                      SORU
                    </Typography>
                  </TableCell>
                  <TableCell width="10%" align="center">
                    <Typography variant="caption" fontWeight={700}>
                      YANIT (E / H)
                    </Typography>
                  </TableCell>
                  <TableCell width="40%">
                    <Typography variant="caption" fontWeight={700}>
                      AÇIKLAMA / AKSİYON METNİ
                    </Typography>
                  </TableCell>
                  <TableCell width="10%">
                    <Typography variant="caption" fontWeight={700}>
                      BDS Ref.
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {mainRows.map((row, idx) => {
                  const localState = localChanges[row.id];
                  const currentDurum = localState?.durum ?? row.durum ?? "Evet";
                  const currentTespit =
                    localState?.tespit ??
                    (currentDurum === "Hayır"
                      ? row.hayirIcerik ?? ""
                      : row.evetIcerik ?? "");
                  const isEvet = currentDurum !== "Hayır";
                  const isKritik =
                    row.riskSeviyesi?.toUpperCase() === "KRİTİK";

                  return (
                    <TableRow
                      key={row.id}
                      sx={{
                        "&:nth-of-type(even)": {
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.02)"
                              : "rgba(0,0,0,0.01)",
                        },
                        verticalAlign: "top",
                      }}
                    >
                      {/* No */}
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={600}>
                          {row.satirNo ?? idx + 1}
                        </Typography>
                      </TableCell>

                      {/* Risk */}
                      <TableCell align="center">
                        <Chip
                          label={row.riskSeviyesi ?? "—"}
                          variant="outlined"
                          color={getRiskColor(row.riskSeviyesi)}
                          size="small"
                          sx={{ fontSize: "0.65rem" }}
                        />
                      </TableCell>

                      {/* Soru */}
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}
                        >
                          {row.islem}
                        </Typography>
                      </TableCell>

                      {/* Yanıt */}
                      <TableCell align="center">
                        <RadioGroup
                          value={currentDurum}
                          onChange={(e) =>
                            handleDurumChange(row.id, e.target.value)
                          }
                        >
                          <FormControlLabel
                            value="Evet"
                            control={
                              <Radio
                                size="small"
                                sx={{ py: 0.25 }}
                              />
                            }
                            label={
                              <Typography variant="caption">
                                Evet
                              </Typography>
                            }
                          />
                          <FormControlLabel
                            value="Hayır"
                            control={
                              <Radio
                                size="small"
                                sx={{ py: 0.25 }}
                              />
                            }
                            label={
                              <Typography variant="caption">
                                Hayır
                              </Typography>
                            }
                          />
                        </RadioGroup>
                      </TableCell>

                      {/* Açıklama metni */}
                      <TableCell>
                        {!isEvet && (
                          <Box
                            sx={{
                              mb: 1,
                              p: 1,
                              borderRadius: 1,
                              bgcolor:
                                theme.palette.mode === "dark"
                                  ? "rgba(255,255,255,0.05)"
                                  : theme.palette.grey[50],
                              border: `1px dashed ${theme.palette.divider}`,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={600}
                            >
                              ⚠ HAYIR → AKSİYON GEREKLİ
                            </Typography>
                          </Box>
                        )}
                        <TextField
                          fullWidth
                          multiline
                          minRows={isEvet ? 3 : 4}
                          maxRows={12}
                          variant="outlined"
                          size="small"
                          value={currentTespit}
                          onChange={(e) =>
                            handleTespitChange(row.id, e.target.value)
                          }
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              fontSize: "0.8rem",
                              lineHeight: 1.5,
                            },
                          }}
                          placeholder={
                            isEvet
                              ? "Evet → Açıklama metnini düzenleyebilirsiniz"
                              : "Hayır → Aksiyon adımlarını girin"
                          }
                        />
                      </TableCell>

                      {/* BDS Referansı */}
                      <TableCell>
                        <Typography
                          variant="caption"
                          sx={{
                            whiteSpace: "pre-wrap",
                            color: "text.secondary",
                            fontSize: "0.7rem",
                          }}
                        >
                          {row.bdsReferansi}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Kaydet Butonu */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              px: 3,
              py: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ alignSelf: "center" }}>
              {
                Object.values(localChanges).filter((c) => c.durum === "Hayır")
                  .length
              }{" "}
              adet Hayır seçimi var
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={
                saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />
              }
              disabled={saving}
              onClick={handleKaydet}
              sx={{ minWidth: 140 }}
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </Box>
        </Collapse>
      </Paper>

      {/* ═══════════════════════════════════════════
          BÖLÜM 2: HIZLI REFERANS KARTI (Read-Only)
      ═══════════════════════════════════════════ */}
      <Paper
        elevation={1}
        sx={{
          mb: 3,
          borderRadius: 2,
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          onClick={() => setHizliReferansAcik((p) => !p)}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 1.5,
            cursor: "pointer",
            bgcolor:
              theme.palette.mode === "dark"
                ? theme.palette.grey[800]
                : theme.palette.grey[50],
            "&:hover": { opacity: 0.9 },
          }}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            YANIT BAŞVURU KARTI — KRİTİK SORULAR & AKSİYON ÖZETİ
          </Typography>
          {hizliReferansAcik ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>

        <Collapse in={hizliReferansAcik} timeout="auto">
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? theme.palette.grey[800]
                        : theme.palette.grey[100],
                  }}
                >
                  <TableCell width="5%" align="center">
                    <Typography variant="caption" fontWeight={700}>
                      No
                    </Typography>
                  </TableCell>
                  <TableCell width="10%" align="center">
                    <Typography variant="caption" fontWeight={700}>
                      Risk
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" fontWeight={700}>
                      Soru (Kısa)
                    </Typography>
                  </TableCell>
                  <TableCell width="40%">
                    <Typography variant="caption" fontWeight={700}>
                      Hayır → En Kritik Aksiyon
                    </Typography>
                  </TableCell>
                  <TableCell width="15%">
                    <Typography variant="caption" fontWeight={700}>
                      BDS
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hizliRows.map((row, idx) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      "&:nth-of-type(even)": {
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.02)"
                            : "rgba(0,0,0,0.01)",
                      },
                    }}
                  >
                    <TableCell align="center">
                      <Typography variant="body2">{row.satirNo ?? idx + 1}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.riskSeviyesi}
                        color={getRiskColor(row.riskSeviyesi)}
                        size="small"
                        sx={{ fontSize: "0.65rem" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.islem}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="caption"
                        sx={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}
                      >
                        {row.hayirIcerik}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="caption"
                        color="primary.main"
                        sx={{ whiteSpace: "pre-wrap", fontSize: "0.7rem" }}
                      >
                        {row.bdsReferansi}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Collapse>
      </Paper>

      {/* ═══════════════════════════════════════════
          BÖLÜM 3: BELGE KONTROL & İŞLEMLER
      ═══════════════════════════════════════════ */}
      {(user.rol?.includes("KaliteKontrolSorumluDenetci") ||
        user.rol?.includes("SorumluDenetci") ||
        user.rol?.includes("Denetci") ||
        user.rol?.includes("DenetciYardimcisi")) && (
        <Grid
          container
          sx={{
            width: "100%",
            justifyContent: "space-between",
          }}
          spacing={2}
        >
          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <BelgeKontrolCard
              fetch={fetchData}
              hazirlayan="Denetçi - Yardımcı Denetçi"
              controller={CONTROLLER}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <BelgeKontrolCard
              fetch={fetchData}
              onaylayan="Sorumlu Denetçi"
              controller={CONTROLLER}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <BelgeKontrolCard
              fetch={fetchData}
              kaliteKontrol="Kalite Kontrol Sorumlu Denetçi"
              controller={CONTROLLER}
            />
          </Grid>
        </Grid>
      )}

      <Box mt={5}>
        <IslemlerCardHtml
          controller={CONTROLLER}
          buildHtmlAsync={buildHtmlAsync}
        />
      </Box>
    </Box>
  );
};

export default BilgiIslemMuhasebeTable;
