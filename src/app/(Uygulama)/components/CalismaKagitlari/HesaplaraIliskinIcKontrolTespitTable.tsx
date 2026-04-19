"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert as MuiAlert,
  Typography,
  Stack,
  Alert,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Collapse,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useSnackbar } from "notistack";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  HesaplaraIliskinIcKontrolTespitRow,
  getHesaplaraIliskinIcKontrolTespitByDenetlenen,
  kaydetHesaplaraIliskinIcKontrolTespit,
  varsayilanaDonHesaplaraIliskinIcKontrolTespit,
  hesaplaRiskSkoru,
  hesaplaRiskSeviyesi,
  hesaplaTakipGerekli,
} from "@/api/CalismaKagitlari/HesaplaraIliskinIcKontrolTespit";
import FormOnayBolumu from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/FormOnayBolumu";
import IslemlerCardHtml from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCardHtml";

const CONTROLLER = "HesaplaraIliskinIcKontrolTespit";

type RiskLevel = "Kapsam Dışı" | "Düşük" | "Orta" | "Yüksek";

const riskChipProps = (seviye: string): { color: "default" | "success" | "warning" | "error"; label: string } => {
  switch (seviye) {
    case "Yüksek": return { color: "error", label: "Yüksek" };
    case "Orta": return { color: "warning", label: "Orta" };
    case "Düşük": return { color: "success", label: "Düşük" };
    case "Kapsam Dışı": return { color: "default", label: "Kapsam Dışı" };
    default: return { color: "default", label: seviye || "-" };
  }
};

interface LocalRow {
  id: number;
  satirNo: number;
  bolumBasligi: string;
  hesapGrubu: string;
  hesapAdi: string;
  islem: string;
  standartReferans: string;
  riskBoyutu: string;
  yuksekRiskTetikleyici: string;
  yuksekRiskSkoru: number;
  onerilenProsedur: string;
  durum: string;
  tespit: string;
  // computed
  riskSkoru: number;
  riskSeviyesi: string;
  takipGerekli: string;
  dirty: boolean;
}

interface Props {
  isClickedVarsayilanaDon: boolean;
  setIsClickedVarsayilanaDon: (v: boolean) => void;
  setTamamlanan: (v: number) => void;
  setToplam: (v: number) => void;
}

function toLocalRow(r: HesaplaraIliskinIcKontrolTespitRow, idx: number): LocalRow {
  const durum = r.durum ?? "";
  const skor = hesaplaRiskSkoru(durum || null, r.yuksekRiskTetikleyici, r.yuksekRiskSkoru);
  const seviye = hesaplaRiskSeviyesi(skor);
  return {
    id: r.id,
    satirNo: r.satirNo ?? idx + 1,
    bolumBasligi: r.bolumBasligi ?? "BİLANÇO",
    hesapGrubu: r.hesapGrubu ?? r.konu ?? "",
    hesapAdi: r.hesapAdi ?? "",
    islem: r.islem ?? "",
    standartReferans: r.standartReferans ?? "",
    riskBoyutu: r.riskBoyutu ?? "",
    yuksekRiskTetikleyici: r.yuksekRiskTetikleyici ?? "",
    yuksekRiskSkoru: r.yuksekRiskSkoru ?? 3,
    onerilenProsedur: r.onerilenProsedur ?? "",
    durum,
    tespit: r.tespit ?? "",
    riskSkoru: skor,
    riskSeviyesi: seviye,
    takipGerekli: hesaplaTakipGerekli(seviye),
    dirty: false,
  };
}

// ── Bölüm rengini belirle ────────────────────────────────────────────────────
function bolumRengi(bolum: string): string {
  if (bolum.includes("GELİR")) return "#e8f5e9";
  return "#e3f2fd";
}

// ── Risk rengi ────────────────────────────────────────────────────────────────
function riskSatirRengi(seviye: string): string {
  switch (seviye) {
    case "Yüksek": return "#fff3e0";
    case "Orta": return "#fffde7";
    default: return "";
  }
}

const HesaplaraIliskinIcKontrolTespitTable: React.FC<Props> = ({
  isClickedVarsayilanaDon,
  setIsClickedVarsayilanaDon,
  setTamamlanan,
  setToplam,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const { enqueueSnackbar } = useSnackbar();

  const [localRows, setLocalRows] = useState<LocalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirmVarsayilan, setConfirmVarsayilan] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("Tümü");
  const [bolumFilter, setBolumFilter] = useState("Tümü");
  const [expandedGruplar, setExpandedGruplar] = useState<Record<string, boolean>>({});

  // ── Veri yükleme ─────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!user.denetciId || !user.denetlenenId || !user.yil) return;
    setLoading(true);
    try {
      const resp = await getHesaplaraIliskinIcKontrolTespitByDenetlenen(
        user.denetciId,
        user.denetlenenId,
        user.yil
      );
      const rows = resp.map((r, i) => toLocalRow(r, i));
      setLocalRows(rows);

      // Tüm grupları başlangıçta açık aç
      const gruplar: Record<string, boolean> = {};
      rows.forEach((r) => { gruplar[r.hesapGrubu] = true; });
      setExpandedGruplar(gruplar);

      setDirty(false);
    } catch {
      enqueueSnackbar("Veriler yüklenemedi", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [user.denetciId, user.denetlenenId, user.yil, enqueueSnackbar]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Tamamlanan / Toplam ──────────────────────────────────────────────────────
  useEffect(() => {
    setToplam(localRows.length);
    setTamamlanan(localRows.filter((r) => r.durum !== "").length);
  }, [localRows, setTamamlanan, setToplam]);

  // ── Varsayılana Dön ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (isClickedVarsayilanaDon) {
      setConfirmVarsayilan(true);
    }
  }, [isClickedVarsayilanaDon]);

  const handleVarsayilanaDon = useCallback(async () => {
    setConfirmVarsayilan(false);
    if (!user.denetciId || !user.denetlenenId || !user.yil) {
      setIsClickedVarsayilanaDon(false);
      return;
    }
    setLoading(true);
    try {
      const ok = await varsayilanaDonHesaplaraIliskinIcKontrolTespit(
        user.denetciId,
        user.denetlenenId,
        user.yil
      );
      if (ok) {
        enqueueSnackbar("Veriler varsayılana döndürüldü", { variant: "success" });
        await fetchData();
      } else {
        enqueueSnackbar("Varsayılana dönüş başarısız", { variant: "error" });
      }
    } catch {
      enqueueSnackbar("Bir hata oluştu", { variant: "error" });
    } finally {
      setLoading(false);
      setIsClickedVarsayilanaDon(false);
    }
  }, [user.denetciId, user.denetlenenId, user.yil, fetchData, setIsClickedVarsayilanaDon, enqueueSnackbar]);

  // ── Satır güncelle ───────────────────────────────────────────────────────────
  const handleDurumChange = useCallback((rowId: number, yeniDurum: string) => {
    setLocalRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const skor = hesaplaRiskSkoru(yeniDurum, r.yuksekRiskTetikleyici, r.yuksekRiskSkoru);
        const seviye = hesaplaRiskSeviyesi(skor);
        return { ...r, durum: yeniDurum, riskSkoru: skor, riskSeviyesi: seviye, takipGerekli: hesaplaTakipGerekli(seviye), dirty: true };
      })
    );
    setDirty(true);
  }, []);

  const handleTespitChange = useCallback((rowId: number, yeniTespit: string) => {
    setLocalRows((prev) =>
      prev.map((r) => r.id === rowId ? { ...r, tespit: yeniTespit, dirty: true } : r)
    );
    setDirty(true);
  }, []);

  // ── Kaydet ───────────────────────────────────────────────────────────────────
  const handleKaydet = useCallback(async () => {
    if (!user.denetciId || !user.denetlenenId || !user.yil) return;
    setSaving(true);
    try {
      const ok = await kaydetHesaplaraIliskinIcKontrolTespit({
        denetciId: user.denetciId,
        denetlenenId: user.denetlenenId,
        yil: user.yil,
        satirlar: localRows.map((r) => ({ id: r.id, durum: r.durum || null, tespit: r.tespit || null })),
      });
      if (ok) {
        enqueueSnackbar("Kaydedildi", { variant: "success" });
        setDirty(false);
        setLocalRows((prev) => prev.map((r) => ({ ...r, dirty: false })));
      } else {
        enqueueSnackbar("Kaydetme başarısız", { variant: "error" });
      }
    } catch {
      enqueueSnackbar("Bir hata oluştu", { variant: "error" });
    } finally {
      setSaving(false);
    }
  }, [user, localRows, enqueueSnackbar]);

  // ── Filtrele ─────────────────────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLocaleLowerCase("tr-TR");
    return localRows.filter((r) => {
      if (bolumFilter !== "Tümü" && r.bolumBasligi !== bolumFilter) return false;
      if (riskFilter !== "Tümü" && r.riskSeviyesi !== riskFilter) return false;
      if (q) {
        const haystack = [r.hesapGrubu, r.hesapAdi, r.islem, r.standartReferans, r.riskBoyutu, r.tespit].join(" ").toLocaleLowerCase("tr-TR");
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [localRows, searchTerm, riskFilter, bolumFilter]);

  // ── İstatistikler ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const cevaplanmis = localRows.filter((r) => r.durum !== "").length;
    const yuksekRisk = localRows.filter((r) => r.riskSeviyesi === "Yüksek").length;
    const ortaRisk = localRows.filter((r) => r.riskSeviyesi === "Orta").length;
    const takipGerekli = localRows.filter((r) => r.takipGerekli === "Evet").length;
    return { cevaplanmis, yuksekRisk, ortaRisk, takipGerekli, toplam: localRows.length };
  }, [localRows]);

  // ── Gruplama ──────────────────────────────────────────────────────────────────
  const groupedData = useMemo(() => {
    // Önce bölüm bazında, sonra hesap grubu bazında grupla
    const bolumler: Record<string, Record<string, LocalRow[]>> = {};
    filteredRows.forEach((r) => {
      if (!bolumler[r.bolumBasligi]) bolumler[r.bolumBasligi] = {};
      if (!bolumler[r.bolumBasligi][r.hesapGrubu]) bolumler[r.bolumBasligi][r.hesapGrubu] = [];
      bolumler[r.bolumBasligi][r.hesapGrubu].push(r);
    });
    return bolumler;
  }, [filteredRows]);

  const benzersizBolumler = useMemo(() => {
    const seen = new Set<string>();
    return localRows.map((r) => r.bolumBasligi).filter((b) => { if (seen.has(b)) return false; seen.add(b); return true; });
  }, [localRows]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* ── Özet İstatistikler ── */}
      <Grid container spacing={2} mb={2}>
        {[
          { label: "Toplam Soru", value: stats.toplam, color: "#e3f2fd" },
          { label: "Cevaplanmış", value: stats.cevaplanmis, color: "#e8f5e9" },
          { label: "Yüksek Risk", value: stats.yuksekRisk, color: "#ffebee" },
          { label: "Orta Risk", value: stats.ortaRisk, color: "#fff8e1" },
          { label: "Takip Gerekli", value: stats.takipGerekli, color: "#fce4ec" },
        ].map(({ label, value, color }) => (
          <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={label}>
            <Paper sx={{ p: 1.5, textAlign: "center", bgcolor: color, border: "1px solid rgba(0,0,0,0.08)" }}>
              <Typography variant="h5" fontWeight={700}>{value}</Typography>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ── Filtreler + Kaydet ── */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={1} mb={2} alignItems="center">
        <TextField
          size="small"
          placeholder="Ara (hesap, soru, not…)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ minWidth: 220 }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Bölüm</InputLabel>
          <Select label="Bölüm" value={bolumFilter} onChange={(e) => setBolumFilter(e.target.value as string)}>
            <MenuItem value="Tümü">Tümü</MenuItem>
            {benzersizBolumler.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Risk</InputLabel>
          <Select label="Risk" value={riskFilter} onChange={(e) => setRiskFilter(e.target.value as string)}>
            {["Tümü", "Yüksek", "Orta", "Düşük", "Kapsam Dışı"].map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </Select>
        </FormControl>
        <Box flex={1} />
        <Button
          variant="contained"
          color="primary"
          disabled={!dirty || saving}
          onClick={handleKaydet}
          sx={{ minWidth: 120 }}
        >
          {saving ? <CircularProgress size={18} /> : "Kaydet"}
        </Button>
      </Stack>

      {dirty && (
        <Alert severity="info" sx={{ mb: 2, py: 0.5 }}>
          Kaydedilmemiş değişiklikler var. Kaydet butonuna tıklayarak kaydedin.
        </Alert>
      )}

      {/* ── Tablo ── */}
      {Object.entries(groupedData).map(([bolum, gruplar]) => (
        <Box key={bolum} mb={3}>
          {/* Bölüm başlığı */}
          <Box
            sx={{
              bgcolor: bolumRengi(bolum),
              borderLeft: "4px solid",
              borderColor: bolum.includes("GELİR") ? "success.main" : "primary.main",
              px: 2, py: 1, mb: 1, borderRadius: "4px",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} letterSpacing={0.5}>
              ◼ {bolum}
            </Typography>
          </Box>

          {Object.entries(gruplar).map(([hesapGrubu, satirlar]) => (
            <Box key={hesapGrubu} mb={2}>
              {/* Alt grup başlığı */}
              <Box
                onClick={() => setExpandedGruplar((prev) => ({ ...prev, [hesapGrubu]: !prev[hesapGrubu] }))}
                sx={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  cursor: "pointer", bgcolor: "#f5f5f5",
                  borderBottom: "1px solid #e0e0e0", px: 2, py: 0.8,
                  "&:hover": { bgcolor: "#eeeeee" },
                }}
              >
                <Typography variant="body2" fontWeight={600}>{hesapGrubu}</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" color="text.secondary">{satirlar.length} soru</Typography>
                  {expandedGruplar[hesapGrubu] ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </Stack>
              </Box>

              <Collapse in={expandedGruplar[hesapGrubu] !== false}>
                {/* Tablo başlığı */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "42px 80px 1fr 90px 100px 1fr 120px 80px",
                    bgcolor: "#fafafa",
                    borderBottom: "2px solid #e0e0e0",
                    px: 1,
                    py: 0.5,
                  }}
                >
                  {["No", "Hesap", "Kontrol Sorusu", "Standart", "Risk Boyutu", "Durum / Tespit", "Önerilen Prosedür", "Risk"].map((h) => (
                    <Typography key={h} variant="caption" fontWeight={700} color="text.secondary" sx={{ px: 0.5 }}>
                      {h}
                    </Typography>
                  ))}
                </Box>

                {/* Satırlar */}
                {satirlar.map((r) => (
                  <SatirBileseni
                    key={r.id}
                    row={r}
                    onDurumChange={handleDurumChange}
                    onTespitChange={handleTespitChange}
                  />
                ))}
              </Collapse>
            </Box>
          ))}
        </Box>
      ))}

      {/* ── Onay ve İşlemler ── */}
      <Box mt={4}>
        <FormOnayBolumu
          controller={CONTROLLER}
          showKaliteKontrol
          onHazirlayanChange={fetchData}
          onOnaylayanChange={fetchData}
        />
        <Box mt={2}>
          <IslemlerCardHtml controller={CONTROLLER} />
        </Box>
      </Box>

      {/* ── Varsayılana Dön Onayı ── */}
      <Dialog open={confirmVarsayilan} onClose={() => { setConfirmVarsayilan(false); setIsClickedVarsayilanaDon(false); }}>
        <DialogTitle>Varsayılana Dön</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tüm girişleriniz (Evet/Hayır seçimleri ve tespitler) silinecek ve standart veriler yeniden yüklenecek. Devam etmek istiyor musunuz?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setConfirmVarsayilan(false); setIsClickedVarsayilanaDon(false); }}>İptal</Button>
          <Button color="error" onClick={handleVarsayilanaDon}>Evet, Sıfırla</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ── Tekil satır bileşeni (performans için ayrı component) ─────────────────────
interface SatirProps {
  row: LocalRow;
  onDurumChange: (id: number, durum: string) => void;
  onTespitChange: (id: number, tespit: string) => void;
}

const SatirBileseni = React.memo<SatirProps>(({ row, onDurumChange, onTespitChange }) => {
  const [tespitAcik, setTespitAcik] = useState(false);
  const bgColor = row.dirty ? "#fffde7" : riskSatirRengi(row.riskSeviyesi);
  const chip = riskChipProps(row.riskSeviyesi);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "42px 80px 1fr 90px 100px 1fr 120px 80px",
        borderBottom: "1px solid #f0f0f0",
        bgcolor: bgColor,
        "&:hover": { bgcolor: "#f9f9f9" },
        px: 1,
        py: 0.5,
        minHeight: 44,
        alignItems: "start",
      }}
    >
      {/* No */}
      <Box sx={{ pt: 0.8, px: 0.5 }}>
        <Typography variant="caption" color="text.secondary">{row.satirNo}</Typography>
      </Box>

      {/* Hesap Adı */}
      <Box sx={{ pt: 0.8, px: 0.5 }}>
        <Typography variant="caption" fontWeight={500}>{row.hesapAdi}</Typography>
      </Box>

      {/* Kontrol Sorusu */}
      <Box sx={{ pt: 0.5, px: 0.5 }}>
        <Typography variant="body2" sx={{ fontSize: "0.78rem", lineHeight: 1.4 }}>{row.islem}</Typography>
      </Box>

      {/* Standart Referans */}
      <Box sx={{ pt: 0.8, px: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>{row.standartReferans}</Typography>
      </Box>

      {/* Risk Boyutu */}
      <Box sx={{ pt: 0.8, px: 0.5 }}>
        <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>{row.riskBoyutu}</Typography>
      </Box>

      {/* Durum + Tespit */}
      <Box sx={{ px: 0.5, py: 0.5 }}>
        <Select
          size="small"
          value={row.durum}
          onChange={(e) => onDurumChange(row.id, e.target.value)}
          displayEmpty
          sx={{ minWidth: 130, fontSize: "0.78rem", height: 30, mb: 0.5 }}
        >
          <MenuItem value=""><em style={{ fontSize: "0.78rem", color: "#aaa" }}>Seçiniz…</em></MenuItem>
          <MenuItem value="Evet" sx={{ fontSize: "0.78rem" }}>Evet</MenuItem>
          <MenuItem value="Hayır" sx={{ fontSize: "0.78rem" }}>Hayır</MenuItem>
          <MenuItem value="Kapsam Dışı" sx={{ fontSize: "0.78rem" }}>Kapsam Dışı</MenuItem>
        </Select>
        <Box>
          <Typography
            variant="caption"
            color="primary.main"
            sx={{ cursor: "pointer", textDecoration: "underline", fontSize: "0.7rem" }}
            onClick={() => setTespitAcik((v) => !v)}
          >
            {tespitAcik ? "▲ Tespiti kapat" : "▼ Tespit notu"}
            {row.tespit ? " ✓" : ""}
          </Typography>
          <Collapse in={tespitAcik}>
            <TextField
              multiline
              minRows={2}
              maxRows={5}
              size="small"
              fullWidth
              value={row.tespit}
              onChange={(e) => onTespitChange(row.id, e.target.value)}
              placeholder="Denetçi gözlemi / tespit…"
              sx={{ mt: 0.5, fontSize: "0.78rem" }}
              InputProps={{ sx: { fontSize: "0.78rem" } }}
            />
          </Collapse>
        </Box>
      </Box>

      {/* Önerilen Prosedür */}
      <Box sx={{ pt: 0.8, px: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem", lineHeight: 1.3 }}>
          {row.onerilenProsedur}
        </Typography>
      </Box>

      {/* Risk Seviyesi + Takip */}
      <Box sx={{ pt: 0.5, px: 0.5 }}>
        {row.durum ? (
          <Stack spacing={0.4}>
            <Chip {...chip} size="small" sx={{ fontSize: "0.68rem", height: 20 }} />
            {row.takipGerekli === "Evet" && (
              <Chip label="Takip" size="small" color="error" variant="outlined" sx={{ fontSize: "0.65rem", height: 18 }} />
            )}
          </Stack>
        ) : (
          <Typography variant="caption" color="text.disabled">-</Typography>
        )}
      </Box>
    </Box>
  );
});

SatirBileseni.displayName = "SatirBileseni";

export default HesaplaraIliskinIcKontrolTespitTable;
