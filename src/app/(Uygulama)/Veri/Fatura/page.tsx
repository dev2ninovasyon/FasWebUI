"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  Box, Typography, Grid, Stack, LinearProgress, TextField, useTheme, Button,
  Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { uploadFaturaDosyalari, getGroupedYuklemeGecmisi, deleteYuklemeIslemleri, previewFaturaHtmlNewTab } from "@/api/Fatura/FaturaApi";
import type { FaturaYuklemeGecmisiDto } from "@/api/Fatura/FaturaApi";
import DosyaTable from "@/app/(Uygulama)/components/Veri/Fatura/FaturaDosyaTable";
import { FaturaPdfPreview } from "@/app/(Uygulama)/components/Veri/Fatura/FaturaPdfPreview";
import { FaturaErrorBoundary } from "@/app/(Uygulama)/components/Veri/Fatura/FaturaErrorBoundary";
import { enqueueSnackbar } from "notistack";

const BCrumb = [{ to: "/Veri", title: "Veri" }];

const Page: React.FC = () => {
  const theme = useTheme();
  const user = useSelector((s: AppState) => s.userReducer);
  const customizer = useSelector((s: AppState) => s.customizer);

  const TR_AYLAR = useMemo(() => ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"], []);
  const defaultIslemAdi = useCallback(() => TR_AYLAR[(new Date().getMonth() - 2 + 12) % 12], [TR_AYLAR]);
  const [islemAdi, setIslemAdi] = useState(() => defaultIslemAdi());
  const [tip, setTip] = useState<"Alınan" | "Gönderilen">("Alınan");

  const [islemler, setIslemler] = useState<FaturaYuklemeGecmisiDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadProgressPct, setUploadProgressPct] = useState(0);
  const [uploadPhase, setUploadPhase] = useState<"idle" | "uploading" | "processing" | "completed">("idle");

  // PDF Preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewDosyaAdi, setPreviewDosyaAdi] = useState("");

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = (msg: string, variant: "success" | "error" | "warning" | "info" = "info") =>
    enqueueSnackbar(msg, { variant, autoHideDuration: 3500, style: { maxWidth: 720 } });

  const stats = useMemo(() => ({
    islem: islemler.length,
    dosya: islemler.reduce((s, i) => s + i.dosyaSayisi, 0),
    basarili: islemler.reduce((s, i) => s + i.basariliDosyaSayisi, 0),
    hatali: islemler.reduce((s, i) => s + (i.hataliDosyaSayisi ?? 0), 0),
    mukerrer: islemler.reduce((s, i) => s + (i.mukerrerDosyaSayisi ?? 0), 0),
  }), [islemler]);

  const stopPolling = useCallback(() => {
    if (pollRef.current !== null) { clearInterval(pollRef.current); pollRef.current = null; }
    setIsPolling(false);
  }, []);

  const fetchIslemler = useCallback(async () => {
    try { const d = await getGroupedYuklemeGecmisi(user); setIslemler(d); return d; }
    catch { stopPolling(); return undefined; }
  }, [user, stopPolling]);

  const loadIslemler = useCallback(async () => { setLoading(true); const data = await fetchIslemler(); setLoading(false); return data; }, [fetchIslemler]);

  const startPolling = useCallback(() => {
    if (pollRef.current !== null) return;
    setIsPolling(true);
    pollRef.current = setInterval(async () => {
      const data = await fetchIslemler();
      if (data) {
        const hasActive = data.some(i => i.durum === "Kuyrukta" || i.durum === "İşleniyor");
        if (!hasActive) { stopPolling(); toast("Tüm fatura yükleme işlemleri tamamlandı.", "success"); }
      }
    }, 5000);
  }, [fetchIslemler, stopPolling]);

  const refreshAll = useCallback(async () => {
    const data = await loadIslemler();
    const hasActive = data?.some(i => i.durum === "Kuyrukta" || i.durum === "Ä°ÅŸleniyor");
    if (hasActive) startPolling();
  }, [loadIslemler, startPolling]);

  useEffect(() => { void refreshAll(); }, [refreshAll]);
  useEffect(() => () => stopPolling(), [stopPolling]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!islemAdi?.trim()) { toast("Lütfen işlem adını giriniz.", "warning"); return; }
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    setUploadPhase("uploading");
    setUploadProgressPct(0);

    try {
      const result = await uploadFaturaDosyalari(user, acceptedFiles, tip, islemAdi, (pct) => {
        setUploadProgressPct(pct);
      });
      if (result.isSuccess) {
        setUploadPhase("processing");
        setUploadProgressPct(100);
        toast("Dosyalar yüklendi. Kuyrukta işleniyor.", "success");
        void refreshAll();
        setTimeout(() => { void refreshAll(); }, 15000);
      } else {
        toast(result.message || "Yükleme sırasında hata oluştu.", "error");
        setUploadPhase("idle");
      }
    } catch (e) {
      console.log(e);
      toast("Yükleme sırasında hata oluştu.", "error");
      setUploadPhase("idle");
    } finally { setUploading(false); }
  }, [user, tip, islemAdi, refreshAll]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "application/pdf": [".pdf"], "application/xml": [".xml"], "application/zip": [".zip"] }
  });

  const handleDelete = async () => {
    const validSessionIds = selectedSessionIds.filter((id) => id && id !== "00000000-0000-0000-0000-000000000000");
    if (validSessionIds.length === 0) {
      toast("Silinecek geçerli yükleme oturumu bulunamadı.", "warning");
      setSelectedSessionIds([]);
      setDeleteConfirmOpen(false);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteYuklemeIslemleri(user, validSessionIds);
      toast(`${validSessionIds.length} kayıt silindi.`, "success");
      setSelectedSessionIds([]);
      setDeleteConfirmOpen(false);
      void refreshAll();
    } catch { toast("Silme sırasında hata oluştu.", "error"); }
    finally { setIsDeleting(false); }
  };

  const handleViewDetail = async (dosyaId: string, dosyaAdi?: string) => {
    setPreviewLoading(true);
    setPreviewOpen(true);
    setPreviewDosyaAdi(dosyaAdi ?? "");
    try {
      const blob = await previewFaturaHtmlNewTab(user, dosyaId);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch { toast("Önizleme açılamadı.", "error"); setPreviewOpen(false); }
    finally { setPreviewLoading(false); }
  };

  return (
    <PageContainer title="Fatura Yükleme" description="Fatura yükleme ve izleme">
      <Breadcrumb title="Fatura Yükleme" items={BCrumb} />

      {/* Upload Form */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>Fatura Dosyası Yükleme</Typography>
          <Grid container spacing={2} alignItems="end">
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Fatura Tipi</InputLabel>
                <Select value={tip} label="Fatura Tipi" onChange={(e: any) => setTip(e.target.value)} disabled={uploading}>
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
                <Box>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption">{uploadPhase === "uploading" ? "Dosyalar yükleniyor..." : "Dosyalar sunucuda işleniyor..."}</Typography>
                    <Typography variant="caption" fontWeight="bold">{uploadPhase === "uploading" ? `${uploadProgressPct}%` : "İşleniyor"}</Typography>
                  </Stack>
                  {uploadPhase === "uploading" && <LinearProgress variant="determinate" value={uploadProgressPct} sx={{ height: 4, borderRadius: 1 }} />}
                  {uploadPhase === "processing" && <LinearProgress sx={{ height: 4, borderRadius: 1 }} />}
                </Box>
              </Stack>
            ) : (
              <>
                <Typography variant="body1">XML veya ZIP dosyalarını buraya bırakın</Typography>
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
        <DosyaTable
          islemler={islemler}
          loading={loading}
          isPolling={isPolling}
          selectedSessionIds={selectedSessionIds}
          onSelectChange={(id: string | undefined) => {
            if (!id || id === "00000000-0000-0000-0000-000000000000") return;
            setSelectedSessionIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
          }}
          onSelectAll={(checked: boolean, ids?: string[]) => setSelectedSessionIds(checked ? ids ?? islemler.map(i => i.uploadSessionId).filter((id): id is string => Boolean(id && id !== "00000000-0000-0000-0000-000000000000")) : [])}
          onRefresh={refreshAll}
          onDelete={() => selectedSessionIds.length > 0 && setDeleteConfirmOpen(true)}
          onViewDetail={handleViewDetail}
        />
      </Card>

      {/* PDF Preview Dialog */}
      <FaturaPdfPreview
        open={previewOpen}
        onOpenChange={(open) => { setPreviewOpen(open); if (!open) { if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); } }}
        previewUrl={previewUrl}
        loading={previewLoading}
        dosyaAdi={previewDosyaAdi}
        onDownload={() => {
          if (previewUrl) {
            const a = document.createElement("a"); a.href = previewUrl; a.download = "fatura.pdf"; a.click();
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => !isDeleting && setDeleteConfirmOpen(false)}>
        <DialogTitle>Silme Onayı</DialogTitle>
        <DialogContent>
          <Typography>{selectedSessionIds.length} yükleme işlemi ve ilişkili fatura kayıtları silinecek. Bu işlem geri alınamaz.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={isDeleting}>İptal</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

function PageWithErrorBoundary() {
  return (
    <FaturaErrorBoundary>
      <Page />
    </FaturaErrorBoundary>
  );
}

export default PageWithErrorBoundary;
