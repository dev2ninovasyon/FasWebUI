"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  FormControlLabel,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useSnackbar } from "notistack";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  BilgiIslemMuhasebeRow,
  getBilgiIslemMuhasebeByDenetlenen,
  kaydetBilgiIslemMuhasebe,
} from "@/api/CalismaKagitlari/BilgiIslemMuhasebe";
import BelgeKontrolCard from "./Cards/BelgeKontrolCard";
import IslemlerCardHtml from "./Cards/IslemlerCardHtml";

type MuiChipColor = "error" | "warning" | "info" | "success" | "default";

interface Props {
  isClickedVarsayilanaDon: boolean;
  setIsClickedVarsayilanaDon: (v: boolean) => void;
  setTamamlanan: (v: number) => void;
  setToplam: (v: number) => void;
}

interface LocalRowState {
  durum: string;
  tespit: string;
}

interface RenderRow {
  row: BilgiIslemMuhasebeRow;
  currentDurum: string;
  currentTespit: string;
  isHayir: boolean;
}

const CONTROLLER = "BilgiIslemMuhasebe";
const HIZLI_REFERANS_RISKLER = ["KRİTİK", "YÜKSEK"];
const SOFT_SURFACE = "#f8f7f4";
const SOFT_BORDER = "#e7e2d8";

const summaryCardStyles = {
  "Toplam soru": {
    bg: "#f5f3ee",
    border: "#e5ddd0",
    text: "#5c5548",
  },
  "Hayır seçimi": {
    bg: "#fbf4ea",
    border: "#ecdac0",
    text: "#8a6a3f",
  },
  "Kritik soru": {
    bg: "#f8efee",
    border: "#e7d3d0",
    text: "#8a605d",
  },
  "Yüksek riskli soru": {
    bg: "#f3f4f1",
    border: "#d9ddd3",
    text: "#5d6c5a",
  },
} as const;

function normalizeText(value: string | null | undefined) {
  return (value ?? "").toLocaleUpperCase("tr-TR");
}

function getRiskColor(risk: string | null): MuiChipColor {
  const normalized = normalizeText(risk);
  if (normalized === "KRİTİK") return "error";
  if (normalized === "YÜKSEK") return "warning";
  if (normalized === "ORTA") return "info";
  if (normalized === "DÜŞÜK") return "success";
  return "default";
}

function riskChipClass(seviye: string | null): string {
  const normalized = normalizeText(seviye);
  if (normalized === "KRİTİK") return "chip chip-error";
  if (normalized === "YÜKSEK") return "chip chip-warn";
  if (normalized === "ORTA") return "chip chip-info";
  if (normalized === "DÜŞÜK") return "chip chip-ok";
  return "chip";
}

function escapeHtml(value: string | null | undefined): string {
  return (value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const BilgiIslemMuhasebeTable: React.FC<Props> = ({
  isClickedVarsayilanaDon,
  setIsClickedVarsayilanaDon,
  setTamamlanan,
  setToplam,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { enqueueSnackbar } = useSnackbar();

  const [rows, setRows] = useState<BilgiIslemMuhasebeRow[]>([]);
  const [localChanges, setLocalChanges] = useState<Record<number, LocalRowState>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSheet, setActiveSheet] = useState("BT Degerlendirme Belgesi");
  const [hizliReferansAcik, setHizliReferansAcik] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("Tümü");
  const [yalnizcaHayirlar, setYalnizcaHayirlar] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user.denetciId || !user.denetlenenId || !user.yil) return;

    setLoading(true);
    try {
      const data = await getBilgiIslemMuhasebeByDenetlenen(
        user.denetciId,
        user.denetlenenId,
        user.yil
      );

      console.log("BilgiIslemMuhasebe verisi yüklendi:", data);
      console.log("İlk row risk seviyesi:", data[0]?.riskSeviyesi);

      setRows(data);

      const nextLocalChanges: Record<number, LocalRowState> = {};
      data.forEach((item) => {
        const durum = item.durum ?? "Evet";
        nextLocalChanges[item.id] = {
          durum,
          tespit:
            item.tespit ??
            (durum === "Hayır" ? item.hayirIcerik ?? "" : item.evetIcerik ?? ""),
        };
      });
      setLocalChanges(nextLocalChanges);
    } catch {
      enqueueSnackbar("Bilgi işlem değerlendirme verileri yüklenemedi.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar, user.denetciId, user.denetlenenId, user.yil]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (isClickedVarsayilanaDon) {
      fetchData().finally(() => setIsClickedVarsayilanaDon(false));
    }
  }, [fetchData, isClickedVarsayilanaDon, setIsClickedVarsayilanaDon]);

  const mainRows = useMemo(
    () =>
      rows.filter(
        (item) =>
          !item.sheetAdi ||
          item.sheetAdi === "BT Degerlendirme Belgesi" ||
          item.sheetAdi === ""
      ),
    [rows]
  );

  const renderedRows = useMemo<RenderRow[]>(
    () =>
      mainRows.map((row, index) => {
        const localState = localChanges[row.id];
        const currentDurum = localState?.durum ?? row.durum ?? "Evet";
        const currentTespit =
          localState?.tespit ??
          (currentDurum === "Hayır" ? row.hayirIcerik ?? "" : row.evetIcerik ?? "");

        // Ensure satirNo and riskSeviyesi have values
        const enrichedRow = {
          ...row,
          satirNo: row.satirNo ?? (index + 1),
          riskSeviyesi: row.riskSeviyesi ?? "—",
        };

        return {
          row: enrichedRow,
          currentDurum,
          currentTespit,
          isHayir: currentDurum === "Hayır",
        };
      }),
    [localChanges, mainRows]
  );

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("tr-TR");

    return renderedRows.filter(({ row, currentDurum, currentTespit, isHayir }) => {
      const matchesRisk =
        riskFilter === "Tümü" || normalizeText(row.riskSeviyesi) === normalizeText(riskFilter);

      const matchesSearch =
        query.length === 0 ||
        [row.islem, currentTespit, row.bdsReferansi, row.riskSeviyesi, currentDurum]
          .join(" ")
          .toLocaleLowerCase("tr-TR")
          .includes(query);

      const matchesHayirFilter = !yalnizcaHayirlar || isHayir;

      return matchesRisk && matchesSearch && matchesHayirFilter;
    });
  }, [renderedRows, riskFilter, searchTerm, yalnizcaHayirlar]);

  const hizliRows = useMemo(
    () =>
      renderedRows.filter(({ row }) =>
        HIZLI_REFERANS_RISKLER.includes(normalizeText(row.riskSeviyesi))
      ),
    [renderedRows]
  );

  const answeredCount = renderedRows.filter(({ currentDurum }) => currentDurum?.trim()).length;
  const hayirCount = renderedRows.filter(({ isHayir }) => isHayir).length;
  const kritikCount = renderedRows.filter(
    ({ row }) => normalizeText(row.riskSeviyesi) === "KRİTİK"
  ).length;
  const yuksekCount = renderedRows.filter(
    ({ row }) => normalizeText(row.riskSeviyesi) === "YÜKSEK"
  ).length;

  useEffect(() => {
    setTamamlanan(answeredCount);
    setToplam(mainRows.length);
  }, [answeredCount, mainRows.length, setTamamlanan, setToplam]);

  const handleDurumChange = (id: number, newDurum: string) => {
    const source = rows.find((item) => item.id === id);
    
    // Eğer currentDurum değişmişse, tespit'i otomatik güncelle
    const newTespit =
      newDurum === "Hayır"
        ? source?.hayirIcerik ?? ""
        : source?.evetIcerik ?? "";

    setLocalChanges((prev) => ({
      ...prev,
      [id]: {
        durum: newDurum,
        tespit: newTespit,
      },
    }));
  };

  const handleTespitChange = (id: number, newTespit: string) => {
    setLocalChanges((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? { durum: "Evet", tespit: "" }),
        tespit: newTespit,
      },
    }));
  };

  const handleKaydet = async () => {
    if (!user.denetciId || !user.denetlenenId || !user.yil) return;

    setSaving(true);
    try {
      // Build satirlar with proper content mapping
      const satirlar = Object.entries(localChanges).map(([id, value]) => {
        const sourceRow = rows.find((r) => r.id === Number(id));
        
        // Select appropriate content based on durum (Evet/Hayır)
        const standardContent = 
          value.durum === "Hayır" 
            ? sourceRow?.hayirIcerik ?? "" 
            : sourceRow?.evetIcerik ?? "";

        // Combine standard template with user input if user has modified it
        const finalTespit = value.tespit && value.tespit !== standardContent
          ? value.tespit  // Use user's manual edit
          : standardContent; // Use standard template

        console.log(`Row ${id}: durum=${value.durum}, tespit=${finalTespit?.substring(0, 50)}...`);

        return {
          id: Number(id),
          durum: value.durum,
          tespit: finalTespit,
        };
      });

      console.log("Kaydedilecek satirlar:", satirlar);

      const success = await kaydetBilgiIslemMuhasebe({
        denetciId: user.denetciId,
        denetlenenId: user.denetlenenId,
        yil: user.yil,
        satirlar,
      });

      if (!success) {
        enqueueSnackbar("Kaydetme işlemi tamamlanamadı.", { variant: "error" });
        return;
      }

      enqueueSnackbar("Değerlendirme başarıyla kaydedildi.", {
        variant: "success",
      });
      await fetchData();
    } finally {
      setSaving(false);
    }
  };

  const buildHtmlAsync = async () => {
    const createdAt = new Date().toLocaleString("tr-TR");

    const tableRows = renderedRows
      .map(({ row, currentDurum, currentTespit }, index) => {
        const tespitValue = currentDurum === "Hayır" ? currentTespit : currentTespit;

        return `
          <tr>
            <td>${escapeHtml(String(row.satirNo ?? index + 1))}</td>
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
        <title>Bilgi İşlem ve Muhasebe Sistemine İlişkin Değerlendirme Belgesi</title>
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
          <div class="doc-title">Bilgi İşlem ve Muhasebe Sistemine İlişkin Değerlendirme Belgesi</div>
          <div class="doc-meta">Denetlenen: ${escapeHtml(
            user.denetlenenFirmaAdi
          )} | Yıl: ${escapeHtml(String(user.yil ?? ""))}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:4%;">No</th>
              <th style="width:10%;">Risk</th>
              <th style="width:31%;">Soru</th>
              <th style="width:10%;">Yanıt</th>
              <th style="width:33%;">Açıklama / Tespit</th>
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
      <Stack spacing={2.5}>
        <Alert severity="info" variant="outlined">
          Bu formda Excel şablonundaki sorular, risk seviyeleri ve açıklama metinleri
          esas alınır. Yanıt değiştiğinde önerilen metin otomatik gelir; ihtiyaç halinde
          düzenleyebilirsiniz.
        </Alert>

        <Grid container spacing={2}>
          {[
            {
              label: "Toplam soru",
              value: mainRows.length,
              color: "primary.main",
            },
            {
              label: "Hayır seçimi",
              value: hayirCount,
              color: "warning.main",
            },
            {
              label: "Kritik soru",
              value: kritikCount,
              color: "error.main",
            },
            {
              label: "Yüksek riskli soru",
              value: yuksekCount,
              color: "info.main",
            },
          ].map((item) => (
            <Grid key={item.label} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  height: "100%",
                  borderRadius: 2.5,
                  bgcolor: summaryCardStyles[item.label as keyof typeof summaryCardStyles].bg,
                  borderColor:
                    summaryCardStyles[item.label as keyof typeof summaryCardStyles].border,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    mt: 1,
                    fontWeight: 700,
                    color:
                      summaryCardStyles[item.label as keyof typeof summaryCardStyles].text,
                  }}
                >
                  {item.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Paper
          variant="outlined"
          sx={{ p: 2.5, borderRadius: 2.5, bgcolor: SOFT_SURFACE, borderColor: SOFT_BORDER }}
        >
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={1.5}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Bilgi İşlem ve Muhasebe Değerlendirme Soruları
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Arama, risk filtresi ve sadece problemli maddeleri göster seçeneği ile
                  ekranı daraltabilirsiniz.
                </Typography>
              </Box>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ minWidth: { lg: 520 } }}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Soru, açıklama veya BDS referansı ara"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  select
                  size="small"
                  label="Risk"
                  value={riskFilter}
                  onChange={(event) => setRiskFilter(event.target.value)}
                  sx={{ minWidth: 150 }}
                >
                  {["Tümü", "Bilgi", "Düşük", "Orta", "Yüksek", "KRİTİK"].map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  variant={yalnizcaHayirlar ? "contained" : "outlined"}
                  color="warning"
                  onClick={() => setYalnizcaHayirlar((prev) => !prev)}
                  sx={
                    yalnizcaHayirlar
                      ? {
                          bgcolor: "#d8c2a4",
                          borderColor: "#d8c2a4",
                          color: "#4e3f2d",
                          "&:hover": { bgcolor: "#ccb28f", borderColor: "#ccb28f" },
                        }
                      : {
                          borderColor: "#d9c7ad",
                          color: "#7b6345",
                          "&:hover": { borderColor: "#ccb28f", bgcolor: "#fbf6ef" },
                        }
                  }
                >
                  Sadece Hayır
                </Button>
              </Stack>
            </Stack>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1}
              alignItems={{ xs: "flex-start", md: "center" }}
            >
              <Chip label={`${filteredRows.length} kayıt listeleniyor`} variant="outlined" />
              <Chip
                label={`${answeredCount}/${mainRows.length} soru yanıtlı`}
                color={answeredCount === mainRows.length ? "success" : "primary"}
                variant="outlined"
              />
              {hayirCount > 0 && (
                <Chip
                  icon={<WarningAmberIcon />}
                  label={`${hayirCount} soruda aksiyon gerekiyor`}
                  sx={{
                    bgcolor: "#f5ede2",
                    color: "#7b6345",
                    border: "1px solid #e2d3bf",
                  }}
                />
              )}
            </Stack>
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            borderRadius: 2.5,
            overflow: "hidden",
            borderColor: SOFT_BORDER,
            bgcolor: "#fcfbf8",
          }}
        >
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
              bgcolor: "#f4f1ea",
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Bilgi İşlem ve Muhasebe Sistemine İlişkin Değerlendirme Belgesi
              </Typography>
              <Typography variant="body2" color="text.secondary">
                İlgili BDS: BDS 315 §A56-A99, BDS 240 §A2, BDS 265 §9, BDS 330 §7-18
              </Typography>
            </Box>
            {activeSheet === "BT Degerlendirme Belgesi" ? (
              <ExpandLessIcon />
            ) : (
              <ExpandMoreIcon />
            )}
          </Box>

          <Collapse in={activeSheet === "BT Degerlendirme Belgesi"} timeout="auto">
            <Box
              sx={{
                px: 3,
                py: 1.5,
                borderTop: `1px solid ${theme.palette.divider}`,
                borderBottom: `1px solid ${theme.palette.divider}`,
                bgcolor: "#faf8f3",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Her soru için <strong>Evet</strong> veya <strong>Hayır</strong> seçin.
                Şablon metni otomatik gelir; belgeye uygun olacak şekilde revize
                edebilirsiniz.
              </Typography>
            </Box>

            {isMobile ? (
              <Stack spacing={2} sx={{ p: 2 }}>
                {filteredRows.map(({ row, currentDurum, currentTespit, isHayir }, index) => (
                  <Paper
                    key={row.id}
                    variant="outlined"
                    sx={{ p: 2, borderRadius: 2 }}
                  >
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Chip size="small" label={`No ${row.satirNo ?? index + 1}`} />
                        <Chip
                          size="small"
                          label={row.riskSeviyesi ?? "—"}
                          color={getRiskColor(row.riskSeviyesi)}
                          variant="outlined"
                        />
                        {isHayir && <Chip size="small" label="Aksiyon gerekli" color="warning" />}
                      </Stack>

                      <Typography variant="subtitle2" fontWeight={700}>
                        {row.islem}
                      </Typography>

                      <RadioGroup
                        row
                        value={currentDurum}
                        onChange={(event) => handleDurumChange(row.id, event.target.value)}
                      >
                        <FormControlLabel value="Evet" control={<Radio size="small" />} label="Evet" />
                        <FormControlLabel value="Hayır" control={<Radio size="small" />} label="Hayır" />
                      </RadioGroup>

                      <TextField
                        fullWidth
                        multiline
                        minRows={4}
                        value={currentTespit}
                        onChange={(event) => handleTespitChange(row.id, event.target.value)}
                        placeholder="Açıklama veya aksiyon metnini güncelleyin"
                      />

                      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
                        {row.bdsReferansi}
                      </Typography>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <TableContainer>
                <Table size="small" sx={{ tableLayout: "fixed", minWidth: 1080 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.grey[100] }}>
                      <TableCell width="5%" align="center">No</TableCell>
                      <TableCell width="9%" align="center">Risk</TableCell>
                      <TableCell width="28%">Soru</TableCell>
                      <TableCell width="11%" align="center">Yanıt</TableCell>
                      <TableCell width="37%">Açıklama / Aksiyon</TableCell>
                      <TableCell width="10%">BDS Ref.</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRows.map(({ row, currentDurum, currentTespit, isHayir }, index) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          "&:nth-of-type(even)": {
                            bgcolor: "rgba(0,0,0,0.01)",
                          },
                          verticalAlign: "top",
                        }}
                      >
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight={600}>
                            {row.satirNo ?? index + 1}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={row.riskSeviyesi ?? "—"}
                            color={getRiskColor(row.riskSeviyesi)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                            {row.islem}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <RadioGroup
                            value={currentDurum}
                            onChange={(event) => handleDurumChange(row.id, event.target.value)}
                          >
                            <FormControlLabel value="Evet" control={<Radio size="small" />} label="Evet" />
                            <FormControlLabel value="Hayır" control={<Radio size="small" />} label="Hayır" />
                          </RadioGroup>
                        </TableCell>
                        <TableCell>
                          {isHayir && (
                            <Alert
                              severity="warning"
                              sx={{
                                mb: 1,
                                py: 0,
                                bgcolor: "#faf3e7",
                                color: "#765d40",
                                "& .MuiAlert-icon": { color: "#b0895a" },
                              }}
                            >
                              Bu satır için aksiyon metni düzenlenmeli.
                            </Alert>
                          )}
                          <TextField
                            fullWidth
                            multiline
                            minRows={isHayir ? 4 : 3}
                            maxRows={12}
                            size="small"
                            value={currentTespit}
                            onChange={(event) => handleTespitChange(row.id, event.target.value)}
                            placeholder="Açıklama veya aksiyon metnini güncelleyin"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ whiteSpace: "pre-wrap" }}
                          >
                            {row.bdsReferansi}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", md: "center" }}
              sx={{
                p: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Kaydetme işleminde tüm satırların mevcut yanıt ve açıklamaları gönderilir.
              </Typography>

              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                disabled={saving}
                onClick={handleKaydet}
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </Stack>
          </Collapse>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            borderRadius: 2.5,
            overflow: "hidden",
            borderColor: SOFT_BORDER,
            bgcolor: "#fcfbf8",
          }}
        >
          <Box
            onClick={() => setHizliReferansAcik((prev) => !prev)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 3,
              py: 2,
              cursor: "pointer",
              bgcolor: "#f4f1ea",
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Hızlı Referans
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Kritik ve yüksek riskli satırlar için hızlı aksiyon özeti
              </Typography>
            </Box>
            {hizliReferansAcik ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Box>

          <Collapse in={hizliReferansAcik} timeout="auto">
            <Stack spacing={1.5} sx={{ p: 2 }}>
              {hizliRows.map(({ row }) => (
                <Paper
                  key={`quick-${row.id}`}
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 2 }}
                >
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Chip
                        size="small"
                        label={`No ${row.satirNo ?? row.id}`}
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={row.riskSeviyesi ?? "—"}
                        color={getRiskColor(row.riskSeviyesi)}
                      />
                    </Stack>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {row.islem}
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {row.hayirIcerik}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
                      {row.bdsReferansi}
                    </Typography>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Collapse>
        </Paper>

        {(user.rol?.includes("KaliteKontrolSorumluDenetci") ||
          user.rol?.includes("SorumluDenetci") ||
          user.rol?.includes("Denetci") ||
          user.rol?.includes("DenetciYardimcisi")) && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <BelgeKontrolCard
                fetch={fetchData}
                hazirlayan="Denetçi - Yardımcı Denetçi"
                controller={CONTROLLER}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <BelgeKontrolCard
                fetch={fetchData}
                onaylayan="Sorumlu Denetçi"
                controller={CONTROLLER}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <BelgeKontrolCard
                fetch={fetchData}
                kaliteKontrol="Kalite Kontrol Sorumlu Denetçi"
                controller={CONTROLLER}
              />
            </Grid>
          </Grid>
        )}

        <Box>
          <IslemlerCardHtml controller={CONTROLLER} buildHtmlAsync={buildHtmlAsync} />
        </Box>
      </Stack>
    </Box>
  );
};

export default BilgiIslemMuhasebeTable;
