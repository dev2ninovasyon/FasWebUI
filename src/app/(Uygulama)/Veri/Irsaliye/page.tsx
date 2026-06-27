"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  Box, Typography, Grid, Stack, LinearProgress, TextField, useTheme, Button,
  Card, CardContent,
  CircularProgress, Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { uploadIrsaliyeDosyalari, getIrsaliyeYuklemeIslemleri } from "@/api/Fatura/IrsaliyeApi";
import IrsaliyeDosyaTable from "@/app/(Uygulama)/components/Veri/Irsaliye/IrsaliyeDosyaTable";
import { enqueueSnackbar } from "notistack";

const BCrumb = [{ to: "/Veri", title: "Veri" }];

const Page: React.FC = () => {
  const theme = useTheme();
  const user = useSelector((s: AppState) => s.userReducer);

  const TR_AYLAR = useMemo(() => ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"], []);
  const defaultIslemAdi = useCallback(() => TR_AYLAR[(new Date().getMonth() - 2 + 12) % 12], [TR_AYLAR]);
  const [islemAdi, setIslemAdi] = useState(() => defaultIslemAdi());
  const [tip, setTip] = useState<"Alınan" | "Gönderilen">("Alınan");

  const [islemler, setIslemler] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [uploading, setUploading] = useState(false);
  const [progressInfos, setProgressInfos] = useState<{ fileName: string; percentage: number }[]>([]);
  const [uploadPhase, setUploadPhase] = useState<"idle" | "uploading" | "processing" | "completed">("idle");

  const toast = (msg: string, variant: "success" | "error" | "warning" | "info" = "info") =>
    enqueueSnackbar(msg, { variant, autoHideDuration: 3500, style: { maxWidth: 720 } });

  const stats = useMemo(() => ({
    islem: islemler.length,
    dosya: islemler.reduce((s: number, i: any) => s + (i.total ?? i.dosyaSayisi ?? 0), 0),
    basarili: islemler.reduce((s: number, i: any) => s + (i.basarili ?? i.basariliDosyaSayisi ?? 0), 0),
    hatali: islemler.reduce((s: number, i: any) => s + (i.hatali ?? i.hataliDosyaSayisi ?? 0), 0),
    mukerrer: 0,
  }), [islemler]);

  const stopPolling = useCallback(() => {
    if (pollRef.current !== null) { clearInterval(pollRef.current); pollRef.current = null; }
    setIsPolling(false);
  }, []);

  const fetchIslemler = useCallback(async () => {
    try {
      const data = await getIrsaliyeYuklemeIslemleri(user);
      const mapped = (data ?? []).map((x: any) => ({
        id: x.id ?? x.Id,
        adi: x.islemAdi ?? x.IslemAdi ?? "",
        tip: x.tip ?? x.Tip,
        total: Number(x.dosyaSayisi ?? x.DosyaSayisi ?? 0),
        basarili: Number(x.basariliDosyaSayisi ?? x.BasariliDosyaSayisi ?? 0),
        hatali: Number(x.hataliDosyaSayisi ?? x.HataliDosyaSayisi ?? 0),
        olusturulmaTarihi: new Date(x.islemTarihi ?? x.IslemTarihi).toLocaleDateString("tr-TR"),
        dosyalar: (x.dosyalar ?? x.Dosyalar ?? []).map((d: any) => ({
          id: d.id ?? d.Id,
          dosyaAdi: d.dosyaAdi ?? d.DosyaAdi ?? "",
          durum: d.durum ?? d.Durum ?? "",
          yuklemeTarihi: d.yuklemeTarihi ? new Date(d.yuklemeTarihi).toLocaleString("tr-TR") : (d.YuklemeTarihi ? new Date(d.YuklemeTarihi).toLocaleString("tr-TR") : "")
        }))
      }));
      setIslemler(mapped);
      return mapped;
    } catch { return undefined; }
  }, [user]);

  const loadIslemler = useCallback(async () => { setLoading(true); await fetchIslemler(); setLoading(false); }, [fetchIslemler]);

  const startPolling = useCallback(() => {
    if (pollRef.current !== null) return;
    setIsPolling(true);
    pollRef.current = setInterval(async () => {
      const data = await fetchIslemler();
      if (data) {
        const hasActive = data.some((i: any) => i.total > 0 && (i.basarili + i.hatali) < i.total);
        if (!hasActive) { stopPolling(); toast("Tüm irsaliye yükleme işlemleri tamamlandı.", "success"); }
      }
    }, 5000);
  }, [fetchIslemler, stopPolling]);

  const refreshAll = useCallback(async () => { await loadIslemler(); startPolling(); }, [loadIslemler, startPolling]);

  useEffect(() => { void loadIslemler(); }, [loadIslemler]);
  useEffect(() => () => stopPolling(), [stopPolling]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!islemAdi?.trim()) { toast("Lütfen işlem adını giriniz.", "warning"); return; }
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    setUploadPhase("uploading");
    setProgressInfos(acceptedFiles.map(f => ({ fileName: f.name, percentage: 0 })));

    try {
      await uploadIrsaliyeDosyalari(user, acceptedFiles, tip, islemAdi, (ev) => {
        const pct = typeof ev.progress === "number" ? Math.round(ev.progress * 100) : ev.total ? Math.round((100 * ev.loaded) / ev.total) : 1;
        setProgressInfos(infos => infos.map(i => ({ ...i, percentage: pct })));
      });
      setUploadPhase("processing");
      setProgressInfos(infos => infos.map(i => ({ ...i, percentage: 100 })));
      toast("Dosyalar yüklendi. Kuyrukta işleniyor.", "success");
      void refreshAll();
      setTimeout(() => { void refreshAll(); }, 15000);
    } catch (e) {
      console.log(e);
      toast("Yükleme sırasında hata oluştu.", "error");
      setUploadPhase("idle");
    } finally { setUploading(false); }
  }, [user, tip, islemAdi, refreshAll]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "application/pdf": [".pdf"], "application/xml": [".xml"], "application/zip": [".zip"] }
  });

  return (
    <PageContainer title="İrsaliye Yükleme" description="İrsaliye yükleme ve izleme">
      <Breadcrumb title="İrsaliye Yükleme" items={BCrumb} />

      {/* Upload Form */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>İrsaliye Dosyası Yükleme</Typography>
          <Grid container spacing={2} alignItems="end">
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>İrsaliye Tipi</InputLabel>
                <Select value={tip} label="İrsaliye Tipi" onChange={(e: any) => setTip(e.target.value)} disabled={uploading}>
                  <MenuItem value="Alınan">Alınan</MenuItem>
                  <MenuItem value="Gönderilen">Gönderilen</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth size="small" label="İşlem Adı" value={islemAdi} onChange={e => setIslemAdi(e.target.value)} disabled={uploading} />
            </Grid>
          </Grid>

          <Box {...getRootProps()} sx={{
            border: `2px dashed ${theme.palette.divider}`, borderRadius: 1, p: 4, mt: 2, textAlign: "center", cursor: "pointer",
            bgcolor: isDragActive ? "action.hover" : "transparent"
          }}>
            <input {...getInputProps()} />
            {uploading || uploadPhase !== "idle" ? (
              <Stack spacing={1}>
                {progressInfos.map((i, idx) => (
                  <Box key={idx}>
                    <Stack direction="row" justifyContent="space-between"><Typography variant="caption">{i.fileName}</Typography><Typography variant="caption" fontWeight="bold">{i.percentage}%</Typography></Stack>
                    <LinearProgress variant="determinate" value={i.percentage} sx={{ height: 4, borderRadius: 1 }} />
                  </Box>
                ))}
                {uploadPhase === "processing" && <Typography variant="caption" color="text.secondary">Dosyalar sunucuda işleniyor...</Typography>}
                {uploadPhase === "completed" && <Typography variant="caption" color="success.main">İşlem tamamlandı.</Typography>}
              </Stack>
            ) : (
              <>
                <Typography variant="body1">XML, PDF veya ZIP dosyalarını buraya bırakın</Typography>
                <Typography variant="caption" color="text.secondary">Çoklu dosya ve klasör seçimi desteklenir.</Typography>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: "İşlem", value: stats.islem, color: undefined },
          { label: "Dosya", value: stats.dosya, color: undefined },
          { label: "Başarılı", value: stats.basarili, color: "success.main" },
          { label: "Hatalı", value: stats.hatali, color: "error.main" },
          { label: "Mükerrer", value: stats.mukerrer, color: "warning.main" },
        ].map((s) => (
          <Grid key={s.label} size={{ xs: 12, sm: 6, md: 12 / 5 }}>
            <Card variant="outlined" sx={{ textAlign: "center", py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              <Typography variant="h5" fontWeight={600} sx={{ color: s.color ?? undefined }}>{s.value.toLocaleString("tr-TR")}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Table */}
      <Card variant="outlined">
        <IrsaliyeDosyaTable
          rows={islemler}
          initialLoading={loading}
          onRefresh={refreshAll}
        />
      </Card>
    </PageContainer>
  );
};

export default Page;
