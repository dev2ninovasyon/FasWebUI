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
import IslemlerCard from "./Cards/IslemlerCard";

// ─────────────────────────────────────────────
//  Yardımcı: Risk rengini döner
// ─────────────────────────────────────────────
function getRiskColor(risk: string | null): "error" | "warning" | "info" | "default" | "primary" | "secondary" | "success" {
  if (!risk) return "default";
  switch (risk.toUpperCase()) {
    case "KRİTİK": return "error";
    case "YÜKSEK": return "warning";
    case "ORTA": return "info";
    case "DÜŞÜK": return "success";
    case "BİLGİ": return "default";
    default: return "default";
  }
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
                ? theme.palette.grey[900]
                : theme.palette.primary.main,
            color: "#fff",
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
                  : "#f0f7ff",
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
                        border: isKritik
                          ? `1px solid ${theme.palette.error.light}`
                          : undefined,
                        bgcolor: !isEvet
                          ? theme.palette.mode === "dark"
                            ? "rgba(211,47,47,0.08)"
                            : "rgba(211,47,47,0.04)"
                          : undefined,
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
                                color="success"
                                sx={{ py: 0.25 }}
                              />
                            }
                            label={
                              <Typography variant="caption" color="success.main">
                                Evet
                              </Typography>
                            }
                          />
                          <FormControlLabel
                            value="Hayır"
                            control={
                              <Radio
                                size="small"
                                color="error"
                                sx={{ py: 0.25 }}
                              />
                            }
                            label={
                              <Typography variant="caption" color="error.main">
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
                                  ? "rgba(211,47,47,0.15)"
                                  : "rgba(211,47,47,0.07)",
                              border: `1px dashed ${theme.palette.error.light}`,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="error.main"
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
                            color: "primary.main",
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
          border: `1px solid ${theme.palette.warning.light}`,
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
                : theme.palette.warning.light,
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
          <Grid item xs={12} md={3.9}>
            <BelgeKontrolCard
              fetch={fetchData}
              hazirlayan="Denetçi - Yardımcı Denetçi"
              controller={CONTROLLER}
            />
          </Grid>
          <Grid item xs={12} md={3.9}>
            <BelgeKontrolCard
              fetch={fetchData}
              onaylayan="Sorumlu Denetçi"
              controller={CONTROLLER}
            />
          </Grid>
          <Grid item xs={12} md={3.9}>
            <BelgeKontrolCard
              fetch={fetchData}
              kaliteKontrol="Kalite Kontrol Sorumlu Denetçi"
              controller={CONTROLLER}
            />
          </Grid>
        </Grid>
      )}

      <Box mt={5}>
        <IslemlerCard controller={CONTROLLER} />
      </Box>
    </Box>
  );
};

export default BilgiIslemMuhasebeTable;
