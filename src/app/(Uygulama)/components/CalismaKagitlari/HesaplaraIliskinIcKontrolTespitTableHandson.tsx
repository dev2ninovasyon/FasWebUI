"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CalismaKagitiHotTable, {
  riskRenderer,
  durumRenderer,
  bdsRefRenderer,
  tespitRenderer,
  islemRenderer,
  takipRenderer,
} from "@/components/CalismaKagitiHotTable";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert as MuiAlert,
  Typography,
  Grid,
  Paper,
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
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

interface Props {
  isClickedVarsayilanaDon: boolean;
  setIsClickedVarsayilanaDon: (v: boolean) => void;
  setTamamlanan: (v: number) => void;
  setToplam: (v: number) => void;
}

interface RowData {
  satirNo: number | string;
  hesapAdi: string;
  islem: string;
  standartReferans: string;
  riskBoyutu: string;
  durum: string;
  tespit: string;
  onerilenProsedur: string;
  riskSeviyesi: string;
  takipGerekli: string;
  id: number;
  yuksekRiskTetikleyici: string;
  yuksekRiskSkoru: number;
}

const COL_SATIR_NO = 0;
const COL_HESAP = 1;
const COL_SORU = 2;
const COL_STANDART = 3;
const COL_BOYUT = 4;
const COL_DURUM = 5;
const COL_TESPIT = 6;
const COL_PROSEDUR = 7;
const COL_RISK = 8;
const COL_TAKIP = 9;

const HesaplaraIliskinIcKontrolTespitTableHandson: React.FC<Props> = ({
  isClickedVarsayilanaDon,
  setIsClickedVarsayilanaDon,
  setTamamlanan,
  setToplam,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const hotRef = useRef<any>(null);

  const [rows, setRows] = useState<HesaplaraIliskinIcKontrolTespitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isHotDirty, setIsHotDirty] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [targetUrl, setTargetUrl] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("Tümü");

  const tableDataRef = useRef<RowData[]>([]);
  const changedRowIdsRef = useRef<Set<number>>(new Set());

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
      setRows(resp);
      setIsHotDirty(false);
      changedRowIdsRef.current.clear();
    } catch {
      enqueueSnackbar("Veriler yüklenemedi", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [user.denetciId, user.denetlenenId, user.yil, enqueueSnackbar]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (isClickedVarsayilanaDon) {
      handleVarsayilanaDon();
    }
  }, [isClickedVarsayilanaDon]);

  const handleVarsayilanaDon = useCallback(async () => {
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

  // ── Tablo verisi ─────────────────────────────────────────────────────────────

  const baseTableData = useMemo<RowData[]>(
    () =>
      rows.map((row, index) => {
        const durum = row.durum ?? "";
        const skor = hesaplaRiskSkoru(durum, row.yuksekRiskTetikleyici, row.yuksekRiskSkoru);
        const seviye = hesaplaRiskSeviyesi(skor);
        return {
          satirNo: row.satirNo ?? index + 1,
          hesapAdi: row.hesapAdi ?? "",
          islem: row.islem ?? "",
          standartReferans: row.standartReferans ?? "",
          riskBoyutu: row.riskBoyutu ?? "",
          durum,
          tespit: row.tespit ?? "",
          onerilenProsedur: row.onerilenProsedur ?? "",
          riskSeviyesi: seviye,
          takipGerekli: hesaplaTakipGerekli(seviye),
          id: row.id,
          yuksekRiskTetikleyici: row.yuksekRiskTetikleyici ?? "",
          yuksekRiskSkoru: row.yuksekRiskSkoru ?? 3,
        };
      }),
    [rows]
  );

  const tableData = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("tr-TR");
    return baseTableData.filter((row) => {
      const matchesRisk = riskFilter === "Tümü" || row.riskSeviyesi === riskFilter;
      const matchesSearch = query.length === 0 || [row.hesapAdi, row.islem, row.tespit].join(" ").toLocaleLowerCase("tr-TR").includes(query);
      return matchesRisk && matchesSearch;
    });
  }, [baseTableData, riskFilter, searchTerm]);

  useEffect(() => {
    tableDataRef.current = tableData;
    setTamamlanan(baseTableData.filter((r) => r.durum !== "").length);
    setToplam(baseTableData.length);
  }, [tableData, baseTableData, setTamamlanan, setToplam]);

  const colHeaders = useMemo(
    () => ["No", "Hesap", "Kontrol Sorusu", "Standart", "Risk Boyutu", "Yanıt", "Açıklama / Tespit", "Önerilen Prosedür", "Risk", "Takip"],
    []
  );

  const columns = useMemo(
    () => [
      { type: "text" as const, readOnly: true, width: 40 }, // 0: No
      { type: "text" as const, readOnly: true, width: 100, renderer: islemRenderer }, // 1: Hesap
      { type: "text" as const, readOnly: true, width: 220, renderer: islemRenderer }, // 2: Soru
      { type: "text" as const, readOnly: true, width: 80, renderer: bdsRefRenderer }, // 3: Standart
      { type: "text" as const, readOnly: true, width: 90, renderer: islemRenderer }, // 4: Boyut
      {
        type: "dropdown" as const,
        source: ["", "Evet", "Hayır", "Kapsam Dışı"],
        width: 100,
        renderer: durumRenderer,
      }, // 5: Yanıt
      {
        type: "text" as const,
        width: 300,
        renderer: tespitRenderer,
        editor: "speech-text",
      }, // 6: Açıklama Metni
      { type: "text" as const, readOnly: true, width: 150, renderer: islemRenderer }, // 7: Prosedür
      { type: "text" as const, readOnly: true, width: 90, renderer: riskRenderer }, // 8: Risk
      { type: "text" as const, readOnly: true, width: 70, renderer: takipRenderer }, // 9: Takip
    ],
    []
  );

  const hotData = useMemo(
    () =>
      tableData.map((row) => [
        row.satirNo,
        row.hesapAdi,
        row.islem,
        row.standartReferans,
        row.riskBoyutu,
        row.durum,
        row.tespit,
        row.onerilenProsedur,
        row.riskSeviyesi,
        row.takipGerekli,
        row.id,
        row.yuksekRiskTetikleyici,
        row.yuksekRiskSkoru,
      ]),
    [tableData]
  );

  const stats = useMemo(() => {
    const yuksekCount = baseTableData.filter((r) => r.riskSeviyesi === "Yüksek").length;
    const takipCount = baseTableData.filter((r) => r.takipGerekli === "Evet").length;
    return { yuksekCount, takipCount, toplam: baseTableData.length };
  }, [baseTableData]);

  // ── Sayfa terk uyarısı ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isHotDirty) return;
    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor || !anchor.getAttribute("href")?.startsWith("/")) return;
      e.preventDefault();
      setTargetUrl(anchor.getAttribute("href")!);
      setConfirmDialogOpen(true);
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", handleAnchorClick, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, [isHotDirty]);

  // ── Handsontable event handlers ───────────────────────────────────────────────

  const handleAfterChange = useCallback(
    function (this: any, change: any[] | null, source: string) {
      if (!change || !change.length || source === "loadData") return;
      setIsHotDirty(true);
      
      const hot = this;
      change.forEach(([row, prop, oldValue, newValue]: [number, any, any, any]) => {
        // prop string ("5") veya sayı (5) gelebilir
        const colIndex = typeof prop === "number" ? prop : parseInt(prop, 10);
        
        const rowData = tableDataRef.current[row];
        if (rowData?.id) {
          changedRowIdsRef.current.add(rowData.id);
        }

        // Yanıt değiştikçe Risk ve Takip hesapla
        if (colIndex === COL_DURUM) {
          const tetikleyici = hot.getDataAtCell(row, 11); // yuksekRiskTetikleyici
          const yuksekSkor = hot.getDataAtCell(row, 12); // yuksekRiskSkoru
          
          const skor = hesaplaRiskSkoru(newValue, tetikleyici, yuksekSkor);
          const seviye = hesaplaRiskSeviyesi(skor);
          const takip = hesaplaTakipGerekli(seviye);

          hot.setDataAtCell(row, COL_RISK, seviye, "internal");
          hot.setDataAtCell(row, COL_TAKIP, takip, "internal");
        }
      });
    },
    []
  );

  const handleAfterCreateRow = useCallback(
    function (this: any, index: number, amount: number) {
      setIsHotDirty(true);
      const hot = this;
      
      // Yeni eklenen satırlara varsayılan değerler ata
      for (let i = 0; i < amount; i++) {
        const rowIdx = index + i;
        hot.setDataAtCell(rowIdx, 10, 0, "internal"); // ID: 0 (Yeni kayıt)
        hot.setDataAtCell(rowIdx, 12, 3, "internal"); // YuksekRiskSkoru: 3 (Varsayılan)
      }

      // Tüm satır numaralarını güncelle
      const rowCount = hot.countRows();
      for (let i = 0; i < rowCount; i++) {
        hot.setDataAtCell(i, COL_SATIR_NO, i + 1, "internal");
      }
    },
    []
  );

  const handleAfterRemoveRow = useCallback(
    function (this: any) {
      setIsHotDirty(true);
      const hot = this;
      // Tüm satır numaralarını güncelle
      const rowCount = hot.countRows();
      for (let i = 0; i < rowCount; i++) {
        hot.setDataAtCell(i, COL_SATIR_NO, i + 1, "internal");
      }
    },
    []
  );

  // ── Kaydet ───────────────────────────────────────────────────────────────────

  const handleKaydet = useCallback(async () => {
    if (!user.denetciId || !user.denetlenenId || !user.yil) return;
    const hot = hotRef.current?.hotInstance;
    if (!hot) return;
    setSaving(true);
    try {
      const sourceData = hot.getSourceData() as any[][];
      
      // Tüm satırları gönder (Ekleme/Silme/Taşıma desteği için tam liste gerekli)
      const satirlar = sourceData.map((rowArr) => ({
        id: Number(rowArr[10] || 0),
        durum: (rowArr[COL_DURUM] ?? "").toString(),
        tespit: (rowArr[COL_TESPIT] ?? "").toString(),
      }));
      
      if (satirlar.length === 0 && rows.length === 0) {
        enqueueSnackbar("Değişiklik yapılmadı", { variant: "info" });
        setSaving(false);
        return;
      }

      const ok = await kaydetHesaplaraIliskinIcKontrolTespit({
        denetciId: user.denetciId,
        denetlenenId: user.denetlenenId,
        yil: user.yil,
        satirlar,
      });

      if (ok) {
        setIsHotDirty(false);
        changedRowIdsRef.current.clear();
        enqueueSnackbar("Veriler başarıyla kaydedildi", { variant: "success" });
        await fetchData();
      } else {
        enqueueSnackbar("Veriler kaydedilemedi", { variant: "error" });
      }
    } catch {
      enqueueSnackbar("Bir hata oluştu", { variant: "error" });
    } finally {
      setSaving(false);
    }
  }, [user, rows.length, fetchData, enqueueSnackbar]);

  // ── Render ────────────────────────────────────────────────────────────────────

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", bgcolor: "#ffffff" }}>
      {/* İstatistik Kartları */}
      <Grid container spacing={2} mb={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#e3f2fd" }}>
            <Typography variant="h5" fontWeight={700}>{stats.toplam}</Typography>
            <Typography variant="caption" color="text.secondary">Toplam Soru</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#ffebee" }}>
            <Typography variant="h5" fontWeight={700} color="error.main">{stats.yuksekCount}</Typography>
            <Typography variant="caption" color="text.secondary">Yüksek Risk</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#fce4ec" }}>
            <Typography variant="h5" fontWeight={700} color="#c62828">{stats.takipCount}</Typography>
            <Typography variant="caption" color="text.secondary">Takip Gerekli</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ display: "flex", height: "100%", alignItems: "center", justifyContent: { xs: "center", md: "flex-end" }, mt: { xs: 1, md: 0 } }}>
             <Button
                onClick={handleKaydet}
                disabled={saving || (!isHotDirty && changedRowIdsRef.current.size === 0)}
                variant="contained"
                color={isHotDirty ? "warning" : "primary"}
                size="large"
              >
                {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Filtreler */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2} alignItems={{ xs: "stretch", sm: "center" }}>
        <TextField
          size="small"
          placeholder="Hızlı ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: "text.disabled" }} /> }}
          sx={{ width: { xs: "100%", sm: 250 } }}
        />
        <FormControl size="small" sx={{ width: { xs: "100%", sm: 150 } }}>
          <InputLabel>Risk Filtresi</InputLabel>
          <Select label="Risk Filtresi" value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
            {["Tümü", "Yüksek", "Orta", "Düşük", "Kapsam Dışı"].map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>

      {/* Tablo */}
      <Box sx={{ minHeight: "60vh", width: "100%", overflowX: "auto" }}>
        <CalismaKagitiHotTable
          ref={hotRef}
          data={hotData}
          colHeaders={colHeaders}
          columns={columns}
          rowHeaders={false}
          manualColumnResize={true}
          manualRowResize={false}
          afterChange={handleAfterChange}
          afterCreateRow={handleAfterCreateRow}
          afterRemoveRow={handleAfterRemoveRow}
          height={650}
        />
      </Box>

      {/* Alt Bölümler */}
      <Box mt={4}>
        <FormOnayBolumu
          controller="HesaplaraIliskinIcKontrolTespit"
          showKaliteKontrol={true}
          onHazirlayanChange={fetchData}
          onOnaylayanChange={fetchData}
        />
        <Box mt={2}>
          <IslemlerCardHtml 
            controller="HesaplaraIliskinIcKontrolTespit"
            previewEndpoint="/ArsivIslemleri/WordDosyasiniPdfOlarakOnizleHtml"
          />
        </Box>
      </Box>

      {/* Terk Onay Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Değişiklikler Kaybolacak</DialogTitle>
        <DialogContent><DialogContentText>Sayfadan ayrılmak istiyor musunuz?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>İptal</Button>
          <Button onClick={() => { setConfirmDialogOpen(false); router.push(targetUrl); }} color="error">Ayrıl</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HesaplaraIliskinIcKontrolTespitTableHandson;
