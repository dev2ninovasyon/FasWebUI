"use client";

import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  FormControl,
  Grid,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import {
  deleteAllCalismaKagidiVerileri,
  getCalismaKagidiVerileriByDenetciDenetlenenYil,
  updateCalismaKagidiVerisi,
} from "@/api/CalismaKagitlari/CalismaKagitlari";
import BelgeKontrolCard from "./Cards/BelgeKontrolCard";

type RiskOption = 1 | 2 | 3;

interface Veri {
  id: number;
  siraNo?: number | null;
  kebirKodu?: number | null;
  hesapAdi?: string | null;
  bakiyeTl?: number | null;
  yuzde?: number | null;
  mizanPayYuzdesi?: number | null;
  fisSayisi?: number | null;
  kalemRiski?: string | null;
  denetciKanaati?: string | null;
  tamlik?: string | null;
  dogruluk?: string | null;
  varOlma?: string | null;
  degerleme?: string | null;
  donemsellik?: string | null;
  gecerlilik?: string | null;
  sunum?: string | null;
  hileRiski?: string | null;
  nicelOnemlilik?: string | null;
  kontrolTesti?: string | null;
  analitik?: string | null;
  detay?: string | null;
  bdsReferans?: string | null;
  oncelikliTeknikler?: string | null;
  notRiskAciklamasi?: string | null;
  raporlamaStandardi?: string | null;
  riskSeviyeKodu?: RiskOption | null;
  standartmi?: boolean | null;
}

interface CalismaKagidiProps {
  controller: string;
  isClickedVarsayilanaDon: boolean;
  setIsClickedVarsayilanaDon: (deger: boolean) => void;
  setTamamlanan: (deger: number) => void;
  setToplam: (deger: number) => void;
}

const riskLabels: Record<RiskOption, string> = {
  1: "Düşük",
  2: "Orta",
  3: "Yüksek",
};

const blueHeader = "#243f70";
const borderColor = "#b7c1d6";

const headerCellSx = {
  backgroundColor: blueHeader,
  color: "#ffffff",
  border: `1px solid ${borderColor}`,
  fontWeight: 800,
  textAlign: "center",
  whiteSpace: "nowrap",
  py: 1.5,
};

const bodyCellBaseSx = {
  border: `1px solid ${borderColor}`,
  py: 0.75,
  px: 1,
  fontSize: "0.9rem",
  lineHeight: 1.2,
};

const detailCardSx = {
  p: 2,
  borderRadius: 2,
  background: "linear-gradient(180deg, #f7f9fd 0%, #edf2fb 100%)",
  border: "1px solid #d8e1f2",
  minHeight: 130,
};

const assertionCardSx = {
  p: 2,
  borderRadius: 2,
  backgroundColor: "#ffffff",
  border: "1px solid #d8e1f2",
  height: "100%",
};

const formatNumber = (value?: number | null) => {
  if (value === null || value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatPercent = (value?: number | null) => {
  if (value === null || value === undefined) {
    return "-";
  }

  return `%${formatNumber(value)}`;
};

const getRiskCode = (row: Veri): RiskOption => {
  if (row.riskSeviyeKodu && row.riskSeviyeKodu >= 1 && row.riskSeviyeKodu <= 3) {
    return row.riskSeviyeKodu;
  }

  const normalized = row.denetciKanaati?.toLocaleLowerCase("tr-TR");
  if (normalized === "düşük" || normalized === "dusuk") return 1;
  if (normalized === "orta") return 2;
  return 3;
};

const getRiskCellColor = (value?: string | null) => {
  const normalized = value?.toLocaleLowerCase("tr-TR") ?? "";

  if (normalized.includes("yüksek") || normalized.includes("yuksek")) {
    return { backgroundColor: "#fde1d5", color: "#a65200", fontWeight: 700 };
  }

  if (normalized.includes("orta")) {
    return { backgroundColor: "#fdeebd", color: "#8d6400", fontWeight: 700 };
  }

  if (normalized.includes("düşük") || normalized.includes("dusuk")) {
    return { backgroundColor: "#dff0da", color: "#41632f", fontWeight: 700 };
  }

  return {};
};

const getAssertionCellColor = (value?: string | null) => {
  const normalized = value?.toLocaleLowerCase("tr-TR") ?? "";

  if (normalized.includes("çok önemli") || normalized.includes("cok onemli")) {
    return { backgroundColor: "#fff0ef", color: "#de1d1d", fontWeight: 800 };
  }

  if (normalized.includes("önemli") || normalized.includes("onemli")) {
    return { backgroundColor: "#fff3cf", color: "#9a6a00", fontWeight: 700 };
  }

  return { backgroundColor: "#f8f8f8", color: "#5f6470" };
};

const getIndicatorCellColor = (value?: string | null, mode: "red" | "green" | "light" = "light") => {
  const normalized = value?.toLocaleLowerCase("tr-TR") ?? "";
  const active =
    normalized.includes("var") ||
    normalized.includes("önemli") ||
    normalized.includes("onemli") ||
    normalized.includes("✔");

  if (!active) {
    return {
      backgroundColor: mode === "green" ? "#496c2f" : "#fafafa",
      color: mode === "green" ? "#f3f5ee" : "#6f6f6f",
      fontWeight: 700,
    };
  }

  if (mode === "red") {
    return { backgroundColor: "#d91010", color: "#ffffff", fontWeight: 800 };
  }

  if (mode === "green") {
    return { backgroundColor: "#3f6428", color: "#ffffff", fontWeight: 800 };
  }

  return { backgroundColor: "#ffffff", color: "#111111", fontWeight: 700 };
};

const FinansalTablolarDenetimRiskiBelirlemeBelge: React.FC<CalismaKagidiProps> = ({
  controller,
  isClickedVarsayilanaDon,
  setIsClickedVarsayilanaDon,
  setTamamlanan,
  setToplam,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const isCompactScreen = useMediaQuery(theme.breakpoints.down("lg"));
  const user = useSelector((state: AppState) => state.userReducer);
  const [veriler, setVeriler] = useState<Veri[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const applyRows = useCallback(
    (rows: Veri[]) => {
      const sortedRows = [...rows].sort(
        (a, b) => (a.siraNo || 0) - (b.siraNo || 0) || (a.kebirKodu || 0) - (b.kebirKodu || 0)
      );

      setVeriler(sortedRows);
      setToplam(sortedRows.length);
      setTamamlanan(sortedRows.filter((row) => row.standartmi === false).length);
    },
    [setTamamlanan, setToplam]
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getCalismaKagidiVerileriByDenetciDenetlenenYil(
        controller,
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0
      );

      const resultPayload = result as { data?: Veri[]; warnings?: string[] } | Veri[] | null | undefined;
      const rows = Array.isArray(resultPayload) ? resultPayload : (resultPayload?.data || []);
      const warnings = Array.isArray(resultPayload) ? [] : (resultPayload?.warnings || []);

      applyRows(rows);
      if (warnings.length) {
        setWarningMessage(warnings.join(" "));
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Veriler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [applyRows, controller, user.denetciId, user.denetlenenId, user.yil]);

  const handleRiskChange = useCallback(
    async (row: Veri, riskSeviyeKodu: RiskOption) => {
      setSavingId(row.id);
      try {
        const result = await updateCalismaKagidiVerisi(controller, row.id, {
          siraNo: row.siraNo,
          kebirKodu: row.kebirKodu,
          hesapAdi: row.hesapAdi,
          bakiyeTl: row.bakiyeTl,
          yuzde: row.yuzde,
          mizanPayYuzdesi: row.mizanPayYuzdesi,
          fisSayisi: row.fisSayisi,
          raporlamaStandardi: row.raporlamaStandardi,
          riskSeviyeKodu,
          denetciKanaati: riskLabels[riskSeviyeKodu],
        });

        const updatedRow = result as Veri | null | undefined;
        if (!updatedRow) {
          setErrorMessage("Satır güncellenemedi.");
          return;
        }

        setVeriler((currentRows) => {
          const nextRows = currentRows.map((currentRow) =>
            currentRow.id === row.id ? { ...currentRow, ...updatedRow } : currentRow
          );
          const sortedRows = [...nextRows].sort(
            (a, b) => (a.siraNo || 0) - (b.siraNo || 0) || (a.kebirKodu || 0) - (b.kebirKodu || 0)
          );

          setToplam(sortedRows.length);
          setTamamlanan(sortedRows.filter((currentRow) => currentRow.standartmi === false).length);
          return sortedRows;
        });
      } catch (error) {
        console.error(error);
        setErrorMessage("Satır güncellenirken bir hata oluştu.");
      } finally {
        setSavingId(null);
      }
    },
    [controller, setTamamlanan, setToplam]
  );

  const handleDeleteAll = useCallback(async () => {
    try {
      const result = await deleteAllCalismaKagidiVerileri(
        controller,
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0
      );

      if (!result) {
        setErrorMessage("Varsayılan veriler yüklenemedi.");
        return;
      }

      await fetchData();
    } catch (error) {
      console.error(error);
      setErrorMessage("Varsayılana dönüş sırasında bir hata oluştu.");
    } finally {
      setIsClickedVarsayilanaDon(false);
    }
  }, [controller, fetchData, setIsClickedVarsayilanaDon, user.denetciId, user.denetlenenId, user.yil]);

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const openRow = (id: number) => {
    setExpandedRows((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (isClickedVarsayilanaDon) {
      handleDeleteAll();
    }
  }, [handleDeleteAll, isClickedVarsayilanaDon]);

  const summaryText = useMemo(() => {
    if (!veriler.length) {
      return "Henüz satır oluşturulmadı.";
    }

    const standart = veriler.filter((row) => row.standartmi !== false).length;
    const guncellenen = veriler.length - standart;
    return `${veriler.length} satır oluşturuldu. ${guncellenen} satır denetçi kanaati ile güncellenmiş durumda.`;
  }, [veriler]);

  return (
    <Box sx={{ width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 1.5, md: 2.5 },
          borderRadius: 3,
          background: "linear-gradient(135deg, #f6f8fc 0%, #eef3fb 100%)",
          borderColor: "#d2dcee",
        }}
      >
        <Stack direction={{ xs: "column", lg: "row" }} spacing={2} justifyContent="space-between">
          <Box sx={{ minWidth: 0 }}>
            <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ fontWeight: 800, color: blueHeader }}>
              Finansal Tablolar Denetim Riski Belirleme Belgesi
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 900 }}>
              Ana tabloda karar kolonları görünür. Satıra tıklayınca TFRS / BOBİ FRS beyan riski 7 boyut alanı,
              BDS referansı, öncelikli teknikler ve risk açıklaması aşağıda açılır.
            </Typography>
            <Stack spacing={0.75} sx={{ mt: 1.25, maxWidth: 980 }}>
              <Typography variant="body2" color="text.secondary">
                Kullanım rehberi: Sayfa, mizan içindeki payı esas alarak her hesap için standart risk satırını otomatik oluşturur.
                Satıra veya denetçi kanaati alanına tıkladığınızda 7 boyut beyan riski, BDS referansı, öncelikli teknikler ve risk açıklaması açılır.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Formül 1: <strong>Yüzde = borç + alacak / toplam borç + alacak</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Formül 2: <strong>Mizan payı &lt; %2 ise Düşük, %2 - %5 arası ise Orta, %5 üzeri ise Yüksek</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Denetçi kanaati değiştirildiğinde yalnızca seçilen satır güncellenir; ilgili standart risk satırı yeniden yüklenir.
              </Typography>
            </Stack>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ maxWidth: { xs: "100%", lg: 340 } }}>
            <Chip
              size="small"
              label={summaryText}
              sx={{
                fontWeight: 700,
                backgroundColor: "#e8eef9",
                maxWidth: "100%",
                height: "auto",
                "& .MuiChip-label": {
                  display: "block",
                  whiteSpace: "normal",
                  py: 0.75,
                },
              }}
            />
          </Stack>
        </Stack>
      </Paper>

      {isCompactScreen ? (
        <Stack spacing={2} sx={{ mt: 3 }}>
          {loading ? (
            <Paper
              variant="outlined"
              sx={{
                py: 6,
                borderRadius: 3,
                borderColor: "#cad6ea",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={30} />
            </Paper>
          ) : veriler.length === 0 ? (
            <Paper
              variant="outlined"
              sx={{
                py: 6,
                borderRadius: 3,
                borderColor: "#cad6ea",
                textAlign: "center",
              }}
            >
              Kayıt bulunamadı.
            </Paper>
          ) : (
            veriler.map((row) => {
              const isExpanded = expandedRows.includes(row.id);
              const riskCode = getRiskCode(row);

              return (
                <Paper
                  key={row.id}
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    borderColor: "#cad6ea",
                    overflow: "hidden",
                    backgroundColor: row.standartmi === false ? "#fffaf0" : "#ffffff",
                    boxShadow: "0 12px 30px rgba(36,63,112,0.08)",
                  }}
                >
                  <Box
                    onClick={() => toggleRow(row.id)}
                    sx={{
                      p: 1.5,
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "#f4f8ff" },
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: blueHeader, fontWeight: 800 }}>
                          {row.kebirKodu || "-"} - {row.hesapAdi || "-"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Bakiye: {formatNumber(row.bakiyeTl)} TL
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Yüzde: {formatPercent(row.yuzde)} | Fiş Sayısı: {formatNumber(row.fisSayisi)}
                        </Typography>
                      </Box>
                      <Box sx={{ pt: 0.25 }}>{isExpanded ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}</Box>
                    </Stack>

                    <Grid container spacing={1} sx={{ mt: 1 }}>
                      <Grid size={{ xs: 6 }}>
                        <Box sx={{ ...bodyCellBaseSx, ...getRiskCellColor(row.kalemRiski), borderRadius: 2, textAlign: "center" }}>
                          {row.kalemRiski || "-"}
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Box sx={{ ...bodyCellBaseSx, ...getIndicatorCellColor(row.hileRiski, "red"), borderRadius: 2, textAlign: "center" }}>
                          {row.hileRiski || "-"}
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Box sx={{ ...bodyCellBaseSx, ...getIndicatorCellColor(row.nicelOnemlilik, "light"), borderRadius: 2, textAlign: "center" }}>
                          {row.nicelOnemlilik || "-"}
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Box sx={{ ...bodyCellBaseSx, ...getIndicatorCellColor(row.kontrolTesti, "green"), borderRadius: 2, textAlign: "center" }}>
                          {row.kontrolTesti || "-"}
                        </Box>
                      </Grid>
                    </Grid>

                    <Box
                      sx={{ mt: 1.25 }}
                      onClick={(event) => {
                        event.stopPropagation();
                        openRow(row.id);
                      }}
                    >
                      <Typography variant="caption" sx={{ display: "block", mb: 0.5, fontWeight: 700, color: blueHeader }}>
                        Denetçi Kanaati
                      </Typography>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={riskCode}
                          disabled={savingId === row.id}
                          onOpen={() => openRow(row.id)}
                          onChange={(event) => handleRiskChange(row, Number(event.target.value) as RiskOption)}
                          sx={{
                            backgroundColor: "#ffffff",
                            fontWeight: 700,
                            ".MuiSelect-select": { py: 0.8 },
                          }}
                        >
                          <MenuItem value={1}>Düşük</MenuItem>
                          <MenuItem value={2}>Orta</MenuItem>
                          <MenuItem value={3}>Yüksek</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>

                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ p: 1.5, backgroundColor: "#f8fbff", borderTop: "1px solid #d7e3f5" }}>
                      <Box
                        sx={{
                          backgroundColor: blueHeader,
                          color: "#fff",
                          borderRadius: 2,
                          px: 2,
                          py: 1.25,
                          mb: 1.5,
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                          {row.raporlamaStandardi === "Bobi"
                            ? "BOBİ FRS BEYAN RİSKİ (7 BOYUT)"
                            : "TFRS BEYAN RİSKİ (7 BOYUT)"}
                        </Typography>
                      </Box>

                      <Grid container spacing={1.25} sx={{ mb: 1.5 }}>
                        <Grid size={{ xs: 6 }}>
                          <Box sx={assertionCardSx}>
                            <Typography variant="subtitle2" sx={{ ...getAssertionCellColor(row.tamlik), p: 1, borderRadius: 1, textAlign: "center" }}>Tamlık</Typography>
                            <Typography variant="body2" sx={{ mt: 1.5, textAlign: "center", fontWeight: 700 }}>{row.tamlik || "-"}</Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Box sx={assertionCardSx}>
                            <Typography variant="subtitle2" sx={{ ...getAssertionCellColor(row.dogruluk), p: 1, borderRadius: 1, textAlign: "center" }}>Doğruluk</Typography>
                            <Typography variant="body2" sx={{ mt: 1.5, textAlign: "center", fontWeight: 700 }}>{row.dogruluk || "-"}</Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Box sx={assertionCardSx}>
                            <Typography variant="subtitle2" sx={{ ...getAssertionCellColor(row.varOlma), p: 1, borderRadius: 1, textAlign: "center" }}>Var Olma</Typography>
                            <Typography variant="body2" sx={{ mt: 1.5, textAlign: "center", fontWeight: 700 }}>{row.varOlma || "-"}</Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Box sx={assertionCardSx}>
                            <Typography variant="subtitle2" sx={{ ...getAssertionCellColor(row.degerleme), p: 1, borderRadius: 1, textAlign: "center" }}>Değerleme</Typography>
                            <Typography variant="body2" sx={{ mt: 1.5, textAlign: "center", fontWeight: 700 }}>{row.degerleme || "-"}</Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Box sx={assertionCardSx}>
                            <Typography variant="subtitle2" sx={{ ...getAssertionCellColor(row.donemsellik), p: 1, borderRadius: 1, textAlign: "center" }}>Dönemsellik</Typography>
                            <Typography variant="body2" sx={{ mt: 1.5, textAlign: "center", fontWeight: 700 }}>{row.donemsellik || "-"}</Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Box sx={assertionCardSx}>
                            <Typography variant="subtitle2" sx={{ ...getAssertionCellColor(row.gecerlilik), p: 1, borderRadius: 1, textAlign: "center" }}>Geçerlilik</Typography>
                            <Typography variant="body2" sx={{ mt: 1.5, textAlign: "center", fontWeight: 700 }}>{row.gecerlilik || "-"}</Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Box sx={assertionCardSx}>
                            <Typography variant="subtitle2" sx={{ ...getAssertionCellColor(row.sunum), p: 1, borderRadius: 1, textAlign: "center" }}>Sunum</Typography>
                            <Typography variant="body2" sx={{ mt: 1.5, textAlign: "center", fontWeight: 700 }}>{row.sunum || "-"}</Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <Stack spacing={1.25}>
                        <Box sx={detailCardSx}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: blueHeader, mb: 1 }}>BDS Referans</Typography>
                          <Divider sx={{ mb: 1.25 }} />
                          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{row.bdsReferans || "-"}</Typography>
                        </Box>
                        <Box sx={detailCardSx}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: blueHeader, mb: 1 }}>Öncelikli Teknikler</Typography>
                          <Divider sx={{ mb: 1.25 }} />
                          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{row.oncelikliTeknikler || "-"}</Typography>
                        </Box>
                        <Box sx={detailCardSx}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: blueHeader, mb: 1 }}>Not / Risk Açıklaması</Typography>
                          <Divider sx={{ mb: 1.25 }} />
                          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{row.notRiskAciklamasi || "-"}</Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Collapse>
                </Paper>
              );
            })
          )}
        </Stack>
      ) : (
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          mt: 3,
          borderRadius: 3,
          borderColor: "#cad6ea",
          overflowX: "auto",
          overflowY: "auto",
          maxWidth: "100%",
          maxHeight: { xs: "65vh", md: "72vh" },
          boxShadow: "0 12px 30px rgba(36,63,112,0.08)",
          "&::-webkit-scrollbar": {
            height: 10,
          },
        }}
      >
        <Table stickyHeader size="small" sx={{ minWidth: { xs: 1180, md: 1320, lg: 1450 } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headerCellSx, width: 48 }} />
              <TableCell sx={headerCellSx}>KOD</TableCell>
              <TableCell sx={headerCellSx}>HESAP ADI</TableCell>
              <TableCell sx={headerCellSx}>BAKİYE (TL)</TableCell>
              <TableCell sx={headerCellSx}>
                Yüzde
                <Box sx={{ fontSize: "0.8rem", opacity: 0.9, mt: 0.5 }}>
                  borç+alacak / toplam borç+alacak
                </Box>
              </TableCell>
              <TableCell sx={headerCellSx}>FİŞ SAYISI</TableCell>
              <TableCell sx={headerCellSx}>KALEM RİSKİ</TableCell>
              <TableCell sx={headerCellSx}>DENETÇİ KANAATİ</TableCell>
              <TableCell sx={headerCellSx}>HİLE</TableCell>
              <TableCell sx={headerCellSx}>NİC. ÖNEMLİ</TableCell>
              <TableCell sx={headerCellSx}>K.TESTİ</TableCell>
              <TableCell sx={headerCellSx}>ANALİTİK</TableCell>
              <TableCell sx={headerCellSx}>DETAY</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={13} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : veriler.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} align="center" sx={{ py: 6 }}>
                  Kayıt bulunamadı.
                </TableCell>
              </TableRow>
            ) : (
              veriler.map((row) => {
                const isExpanded = expandedRows.includes(row.id);
                const riskCode = getRiskCode(row);

                return (
                  <Fragment key={row.id}>
                    <TableRow
                      hover
                      onClick={() => toggleRow(row.id)}
                      sx={{
                        cursor: "pointer",
                        backgroundColor: row.standartmi === false ? "#fffaf0" : "#ffffff",
                        "&:hover": { backgroundColor: "#f4f8ff" },
                      }}
                    >
                      <TableCell sx={{ ...bodyCellBaseSx, textAlign: "center", width: 48 }}>
                        {isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                      </TableCell>
                      <TableCell sx={{ ...bodyCellBaseSx, fontWeight: 700 }}>{row.kebirKodu || "-"}</TableCell>
                      <TableCell sx={{ ...bodyCellBaseSx, minWidth: { xs: 220, md: 320 } }}>{row.hesapAdi || "-"}</TableCell>
                      <TableCell sx={{ ...bodyCellBaseSx }}>{formatNumber(row.bakiyeTl)}</TableCell>
                      <TableCell sx={{ ...bodyCellBaseSx }}>{formatPercent(row.yuzde)}</TableCell>
                      <TableCell sx={{ ...bodyCellBaseSx, textAlign: "center" }}>{formatNumber(row.fisSayisi)}</TableCell>
                      <TableCell sx={{ ...bodyCellBaseSx, textAlign: "center", ...getRiskCellColor(row.kalemRiski) }}>
                        {row.kalemRiski || "-"}
                      </TableCell>
                      <TableCell
                        sx={{ ...bodyCellBaseSx, minWidth: { xs: 145, md: 170 } }}
                        onClick={(event) => {
                          event.stopPropagation();
                          openRow(row.id);
                        }}
                      >
                        <FormControl size="small" fullWidth>
                          <Select
                            value={riskCode}
                            disabled={savingId === row.id}
                            onOpen={() => openRow(row.id)}
                            onChange={(event) => handleRiskChange(row, Number(event.target.value) as RiskOption)}
                            sx={{
                              backgroundColor: "#ffffff",
                              fontWeight: 700,
                              ".MuiSelect-select": { py: 0.8 },
                            }}
                          >
                            <MenuItem value={1}>Düşük</MenuItem>
                            <MenuItem value={2}>Orta</MenuItem>
                            <MenuItem value={3}>Yüksek</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell sx={{ ...bodyCellBaseSx, textAlign: "center", ...getIndicatorCellColor(row.hileRiski, "red") }}>
                        {row.hileRiski || "-"}
                      </TableCell>
                      <TableCell sx={{ ...bodyCellBaseSx, textAlign: "center", ...getIndicatorCellColor(row.nicelOnemlilik, "light") }}>
                        {row.nicelOnemlilik || "-"}
                      </TableCell>
                      <TableCell sx={{ ...bodyCellBaseSx, textAlign: "center", ...getIndicatorCellColor(row.kontrolTesti, "green") }}>
                        {row.kontrolTesti || "-"}
                      </TableCell>
                      <TableCell sx={{ ...bodyCellBaseSx, textAlign: "center", ...getIndicatorCellColor(row.analitik, "green") }}>
                        {row.analitik || "-"}
                      </TableCell>
                      <TableCell sx={{ ...bodyCellBaseSx, textAlign: "center", ...getIndicatorCellColor(row.detay, "green") }}>
                        {row.detay || "-"}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell sx={{ p: 0, border: 0 }} colSpan={13}>
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ p: { xs: 1.5, md: 2.5 }, backgroundColor: "#f8fbff", borderTop: "1px solid #d7e3f5" }}>
                            <Box
                              sx={{
                                backgroundColor: blueHeader,
                                color: "#fff",
                                borderRadius: 2,
                                px: 2,
                                py: 1.5,
                                mb: 2,
                                textAlign: "center",
                              }}
                            >
                              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                {row.raporlamaStandardi === "Bobi"
                                  ? "BOBİ FRS BEYAN RİSKİ (7 BOYUT)"
                                  : "TFRS BEYAN RİSKİ (7 BOYUT)"}
                              </Typography>
                            </Box>

                            <Grid container spacing={2} sx={{ mb: 2 }}>
                              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 12 / 7 }}>
                                <Box sx={assertionCardSx}>
                                  <Typography variant="subtitle2" sx={{ ...getAssertionCellColor(row.tamlik), p: 1, borderRadius: 1, textAlign: "center" }}>
                                    Tamlık
                                  </Typography>
                                  <Typography variant="body2" sx={{ mt: 1.5, textAlign: "center", fontWeight: 700 }}>
                                    {row.tamlik || "-"}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 12 / 7 }}>
                                <Box sx={assertionCardSx}>
                                  <Typography variant="subtitle2" sx={{ ...getAssertionCellColor(row.dogruluk), p: 1, borderRadius: 1, textAlign: "center" }}>
                                    Doğruluk
                                  </Typography>
                                  <Typography variant="body2" sx={{ mt: 1.5, textAlign: "center", fontWeight: 700 }}>
                                    {row.dogruluk || "-"}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 12 / 7 }}>
                                <Box sx={assertionCardSx}>
                                  <Typography variant="subtitle2" sx={{ ...getAssertionCellColor(row.varOlma), p: 1, borderRadius: 1, textAlign: "center" }}>
                                    Var Olma
                                  </Typography>
                                  <Typography variant="body2" sx={{ mt: 1.5, textAlign: "center", fontWeight: 700 }}>
                                    {row.varOlma || "-"}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 12 / 7 }}>
                                <Box sx={assertionCardSx}>
                                  <Typography variant="subtitle2" sx={{ ...getAssertionCellColor(row.degerleme), p: 1, borderRadius: 1, textAlign: "center" }}>
                                    Değerleme
                                  </Typography>
                                  <Typography variant="body2" sx={{ mt: 1.5, textAlign: "center", fontWeight: 700 }}>
                                    {row.degerleme || "-"}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 12 / 7 }}>
                                <Box sx={assertionCardSx}>
                                  <Typography variant="subtitle2" sx={{ ...getAssertionCellColor(row.donemsellik), p: 1, borderRadius: 1, textAlign: "center" }}>
                                    Dönemsellik
                                  </Typography>
                                  <Typography variant="body2" sx={{ mt: 1.5, textAlign: "center", fontWeight: 700 }}>
                                    {row.donemsellik || "-"}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 12 / 7 }}>
                                <Box sx={assertionCardSx}>
                                  <Typography variant="subtitle2" sx={{ ...getAssertionCellColor(row.gecerlilik), p: 1, borderRadius: 1, textAlign: "center" }}>
                                    Geçerlilik
                                  </Typography>
                                  <Typography variant="body2" sx={{ mt: 1.5, textAlign: "center", fontWeight: 700 }}>
                                    {row.gecerlilik || "-"}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 12 / 7 }}>
                                <Box sx={assertionCardSx}>
                                  <Typography variant="subtitle2" sx={{ ...getAssertionCellColor(row.sunum), p: 1, borderRadius: 1, textAlign: "center" }}>
                                    Sunum
                                  </Typography>
                                  <Typography variant="body2" sx={{ mt: 1.5, textAlign: "center", fontWeight: 700 }}>
                                    {row.sunum || "-"}
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>

                            <Grid container spacing={2}>
                              <Grid size={{ xs: 12, md: 3 }}>
                                <Box sx={detailCardSx}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: blueHeader, mb: 1 }}>
                                    BDS Referans
                                  </Typography>
                                  <Divider sx={{ mb: 1.25 }} />
                                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                    {row.bdsReferans || "-"}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid size={{ xs: 12, md: 4 }}>
                                <Box sx={detailCardSx}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: blueHeader, mb: 1 }}>
                                    Öncelikli Teknikler
                                  </Typography>
                                  <Divider sx={{ mb: 1.25 }} />
                                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                    {row.oncelikliTeknikler || "-"}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid size={{ xs: 12, md: 5 }}>
                                <Box sx={detailCardSx}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: blueHeader, mb: 1 }}>
                                    Not / Risk Açıklaması
                                  </Typography>
                                  <Divider sx={{ mb: 1.25 }} />
                                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                    {row.notRiskAciklamasi || "-"}
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      )}

      {(user.rol?.includes("KaliteKontrolSorumluDenetci") ||
        user.rol?.includes("SorumluDenetci") ||
        user.rol?.includes("Denetci") ||
        user.rol?.includes("DenetciYardimcisi")) && (
        <Grid container spacing={2} sx={{ mt: 1, width: "100%", mx: 0 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <BelgeKontrolCard
              fetch={fetchData}
              hazirlayan="Denetçi - Yardımcı Denetçi"
              controller={controller}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <BelgeKontrolCard
              fetch={fetchData}
              onaylayan="Sorumlu Denetçi"
              controller={controller}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <BelgeKontrolCard
              fetch={fetchData}
              kaliteKontrol="Kalite Kontrol Sorumlu Denetçi"
              controller={controller}
            />
          </Grid>
        </Grid>
      )}

      <Snackbar
        open={Boolean(warningMessage)}
        autoHideDuration={7000}
        onClose={() => setWarningMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="warning" onClose={() => setWarningMessage("")} variant="filled">
          {warningMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={4000}
        onClose={() => setErrorMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="error" onClose={() => setErrorMessage("")} variant="filled">
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FinansalTablolarDenetimRiskiBelirlemeBelge;
