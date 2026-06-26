"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import CustomSelect from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSelect";
import React, { useState, useCallback, useEffect } from "react";
import {
  Box, Typography, Grid, MenuItem, Stack, LinearProgress,
  TextField, useTheme, useMediaQuery, Button
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { uploadIrsaliyeDosyalari, getIrsaliyeYuklemeIslemleri } from "@/api/Fatura/IrsaliyeApi";
import IrsaliyeDosyaTable from "@/app/(Uygulama)/components/Veri/Irsaliye/IrsaliyeDosyaTable";
import { enqueueSnackbar, closeSnackbar } from "notistack";

const BCrumb = [
  { to: "/Veri", title: "Veri" },
];

type IrsaliyeDosyaRow = { id: string; dosyaAdi: string; durum: string; yuklemeTarihi: string; };
type IrsaliyeSatiri = {
  id: string;
  adi: string;
  olusturulmaTarihi: string;
  tip?: string;
  total: number;
  basarili: number;
  hatali: number;
  durum: string;
  dosyalar?: IrsaliyeDosyaRow[];
};

const Page: React.FC = () => {
  const theme = useTheme();
  const smDown = useMediaQuery((t: any) => t.breakpoints.down("sm"));
  const borderColor = theme.palette.divider;
  const borderRadius = theme.shape.borderRadius;

  const user = useSelector((s: AppState) => s.userReducer);
  const customizer = useSelector((s: AppState) => s.customizer);

  const [islemAdi, setIslemAdi] = useState<string>("");
  const [tip, setTip] = useState<"Alınan" | "Gönderilen">("Alınan");

  const [rows, setRows] = useState<IrsaliyeSatiri[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [progressInfos, setProgressInfos] = useState<{ fileName: string; percentage: number }[]>([]);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);
  const [uploadPhase, setUploadPhase] = useState<"idle" | "uploading" | "processing" | "completed">("idle");

  const processingSnackRef = React.useRef<string | number | undefined>(undefined);

  const toast = (msg: string, variant: "success" | "error" | "warning" | "info" = "info") =>
    enqueueSnackbar(msg, { variant, autoHideDuration: 3500, style: { maxWidth: 720 } });

  const activeUploadRow = activeUploadId
    ? rows.find((r) => String(r.id).toLowerCase() === activeUploadId.toLowerCase())
    : undefined;

  const activePercent = uploadPhase === "uploading"
    ? progressInfos.length > 0
      ? Math.round(progressInfos.reduce((sum, item) => sum + item.percentage, 0) / progressInfos.length)
      : 0
    : activeUploadRow && activeUploadRow.total > 0
      ? Math.min(100, Math.max(0, Math.round(((activeUploadRow.basarili + activeUploadRow.hatali) / activeUploadRow.total) * 100)))
      : uploadPhase === "completed" ? 100 : 0;

  const activeStatusText = uploadPhase === "uploading"
    ? "Dosyalar sunucuya gönderiliyor"
    : uploadPhase === "processing"
      ? "Sunucuda işleniyor"
      : uploadPhase === "completed" ? "İşlem tamamlandı" : "";

  const openProcessingSnack = () => {
    if (processingSnackRef.current) closeSnackbar(processingSnackRef.current);
    processingSnackRef.current = enqueueSnackbar("İşlem kuyruğa alındı, dosyalar işleniyor...", {
      variant: "info", persist: true,
      action: () => <Button size="small" onClick={() => void fetchRows()}>Yenile</Button>,
      style: { backgroundColor: customizer.activeMode === "dark" ? theme.palette.info.dark : theme.palette.info.main, color: "#fff", maxWidth: 720 }
    });
  };
  const closeProcessingSnack = () => {
    if (processingSnackRef.current) { closeSnackbar(processingSnackRef.current); processingSnackRef.current = undefined; }
  };

  const mapIrsaliye = (x: any): IrsaliyeSatiri => {
    const childRaw = (x.dosyalar ?? x.Dosyalar ?? []) as any[];
    const dosyalar: IrsaliyeDosyaRow[] = childRaw.map((d: any) => ({
      id: d.id ?? d.Id,
      dosyaAdi: d.dosyaAdi ?? d.DosyaAdi ?? "",
      durum: d.durum ?? d.Durum ?? "",
      yuklemeTarihi: d.yuklemeTarihi ? new Date(d.yuklemeTarihi).toLocaleString("tr-TR") : (d.YuklemeTarihi ? new Date(d.YuklemeTarihi).toLocaleString("tr-TR") : "")
    }));
    const total = Number(x.dosyaSayisi ?? x.DosyaSayisi ?? dosyalar.length ?? 0);
    const basarili = Number(x.basariliDosyaSayisi ?? x.BasariliDosyaSayisi ?? 0);
    const hatali = Number(x.hataliDosyaSayisi ?? x.HataliDosyaSayisi ?? 0);
    return {
      id: x.id ?? x.Id,
      adi: x.islemAdi ?? x.IslemAdi ?? "",
      tip: x.tip ?? x.Tip,
      olusturulmaTarihi: new Date(x.islemTarihi ?? x.IslemTarihi).toLocaleDateString("tr-TR"),
      total, basarili, hatali,
      durum: `${basarili + hatali}/${total}`,
      dosyalar
    };
  };

  const fetchRows = useCallback(async () => {
    try {
      const data = await getIrsaliyeYuklemeIslemleri(user);
      const mapped = (data ?? []).map(mapIrsaliye);
      setRows(mapped);
      const anyInProgress = mapped.some(r => r.total > 0 && (r.basarili + r.hatali) < r.total);
      if (!anyInProgress && processingSnackRef.current) {
        closeProcessingSnack();
        toast("Tüm işlemler tamamlandı.", "success");
      }
    } catch (e) {
      console.log(e);
      toast("Kayıtlar çekilemedi.", "error");
    } finally {
      setInitialLoading(false);
    }
  }, [user]);

  useEffect(() => { void fetchRows(); }, [fetchRows]);

  useEffect(() => {
    const anyInProgress = rows.some(r => r.total > 0 && (r.basarili + r.hatali) < r.total);
    if (!anyInProgress) return;
    const intervalId = window.setInterval(() => void fetchRows(), 3000);
    return () => window.clearInterval(intervalId);
  }, [rows, fetchRows]);

  useEffect(() => {
    if (!activeUploadRow || uploadPhase !== "processing") return;
    const isDone = activeUploadRow.total > 0 && (activeUploadRow.basarili + activeUploadRow.hatali) >= activeUploadRow.total;
    if (isDone) {
      setUploadPhase("completed");
      closeProcessingSnack();
      toast("İşlem tamamlandı.", activeUploadRow.hatali > 0 ? "warning" : "success");
      window.setTimeout(() => { setActiveUploadId(null); setProgressInfos([]); setUploadPhase("idle"); }, 5000);
    }
  }, [activeUploadRow, uploadPhase]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!islemAdi?.trim()) { toast("Lütfen işlem adını giriniz.", "warning"); return; }
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setUploadPhase("uploading");
    setActiveUploadId(null);
    setProgressInfos(acceptedFiles.map(f => ({ fileName: f.name, percentage: 0 })));
    openProcessingSnack();

    try {
      const response = await uploadIrsaliyeDosyalari(user, acceptedFiles, tip, islemAdi, (ev) => {
        const pct = typeof ev.progress === "number" ? Math.round(ev.progress * 100)
          : ev.total ? Math.round((100 * ev.loaded) / ev.total) : 1;
        setProgressInfos(infos => infos.map(i => ({ ...i, percentage: pct })));
      });
      const responseData = response?.data ?? {};
      const islemId = responseData.islemId ?? responseData.IslemId;
      if (islemId) setActiveUploadId(String(islemId));
      setUploadPhase("processing");
      setProgressInfos(infos => infos.map(i => ({ ...i, percentage: 100 })));
      toast("Dosyalar yüklendi. Kuyrukta işleniyor.", "success");
      void fetchRows();
      setTimeout(() => void fetchRows(), 15000);
    } catch (e) {
      console.log(e);
      toast("Yükleme sırasında hata oluştu.", "error");
      setActiveUploadId(null);
      setUploadPhase("idle");
    } finally {
      setUploading(false);
    }
  }, [user, tip, islemAdi, fetchRows]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/xml": [".xml"], "application/zip": [".zip"] }
  });

  return (
    <PageContainer title="İrsaliye Yükleme" description="İrsaliye yükleme ve izleme">
      <Breadcrumb title="İrsaliye Yükleme" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ height: 560, border: `1px solid ${borderColor}`, borderRadius: `${borderRadius}/5` }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h5" p={2}>Dosya Yükle</Typography>
              <CustomSelect size="small" value={tip} onChange={(e: any) => setTip(e.target.value)} sx={{ mr: 2, minWidth: 140 }}>
                <MenuItem value="Alınan">Alınan</MenuItem>
                <MenuItem value="Gönderilen">Gönderilen</MenuItem>
              </CustomSelect>
            </Stack>

            <Stack direction="row" spacing={1} px={2}>
              <TextField fullWidth size="small" label="İşlem Adı" value={islemAdi} onChange={e => setIslemAdi(e.target.value)} />
            </Stack>

            <Box {...getRootProps()} sx={{
              border: `2px dashed ${borderColor}`, borderRadius: `${borderRadius}/5`,
              p: 2, m: 2, textAlign: "center", cursor: "pointer", height: 320, mt: 3
            }}>
              <input {...getInputProps()} />
              {isDragActive ? (
                <Grid container sx={{ height: "100%" }} alignItems="center" justifyContent="center">
                  <Typography>Dosyaları buraya bırakın...</Typography>
                </Grid>
              ) : (
                <Grid container sx={{ height: "100%" }} alignItems="center" justifyContent="center">
                  <Grid textAlign="center" size={12}>
                    {uploading || uploadPhase === "processing" || uploadPhase === "completed" ? (
                      <Stack spacing={2} p={2} maxHeight={260} overflow="auto">
                        <Box>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                            <Typography variant="body2" fontWeight={600}>{activeStatusText}</Typography>
                            <Typography variant="caption" sx={{ ml: 1, fontWeight: "bold", color: "primary.main" }}>{activePercent}%</Typography>
                          </Stack>
                          <LinearProgress variant="determinate" value={activePercent} sx={{ height: 8, borderRadius: 1 }} />
                          {activeUploadRow && (
                            <Typography variant="caption" color="text.secondary" display="block" mt={0.75}>
                              {activeUploadRow.basarili + activeUploadRow.hatali}/{activeUploadRow.total} dosya işlendi
                              {activeUploadRow.hatali > 0 ? `, ${activeUploadRow.hatali} hatalı` : ""}
                            </Typography>
                          )}
                        </Box>
                        {progressInfos.map((i, idx) => (
                          <Box key={idx}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                              <Typography variant="body2" sx={{ wordBreak: "break-word", flex: 1 }}>{i.fileName}</Typography>
                              <Typography variant="caption" sx={{ ml: 1, fontWeight: "bold", color: "primary.main" }}>{i.percentage}%</Typography>
                            </Stack>
                            <LinearProgress variant="determinate" value={i.percentage} sx={{ height: 6, borderRadius: 1 }} />
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <>
                        <Typography variant="h6" mb={1}>Dosyayı sürükle veya tıkla.</Typography>
                        <Typography variant="body2">XML / ZIP kabul edilir.</Typography>
                      </>
                    )}
                  </Grid>
                </Grid>
              )}
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: smDown ? 610 : 560, border: `1px solid ${borderColor}`, borderRadius: `${borderRadius}/5` }}>
            <IrsaliyeDosyaTable
              rows={rows}
              initialLoading={initialLoading}
              onRefresh={() => fetchRows()}
            />
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
