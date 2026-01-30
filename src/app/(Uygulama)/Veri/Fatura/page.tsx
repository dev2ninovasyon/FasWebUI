"use client";

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
import { uploadFaturaDosyalari, getYuklemeIslemleri } from "@/api/Fatura/FaturaApi";
import DosyaTable from "@/app/(Uygulama)/components/Veri/Fatura/FaturaDosyaTable";
import { enqueueSnackbar, closeSnackbar } from "notistack";

const BCrumb = [
  { to: "/Veri", title: "Veri" },
];

type FaturaDosyaRow = { id: string; dosyaAdi: string; durum: string; yuklemeTarihi: string; };
type YuklemeSatiri = {
  id: string;
  adi: string;
  olusturulmaTarihi: string;
  tip?: string;
  // sunucu alanları (esnek mapâ€™liyoruz):
  inProgress: boolean;
  total: number;
  processed: number;
  failed: number;
  durum: string; // "processed/total"
  faturaDosyalari?: FaturaDosyaRow[];
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

  const [rows, setRows] = useState<YuklemeSatiri[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [progressInfos, setProgressInfos] = useState<{ fileName: string; percentage: number }[]>([]);

  const processingSnackRef = React.useRef<string | number | undefined>(undefined);

  const toast = (
    msg: string,
    variant: "success" | "error" | "warning" | "info" = "info"
  ) => enqueueSnackbar(msg, { variant, autoHideDuration: 3500, style: { maxWidth: 720 } });

  const anyInProgress = (items: YuklemeSatiri[]) =>
    items.some(r => r.inProgress || (r.total > 0 && r.processed < r.total));

  const openProcessingSnack = () => {
    if (processingSnackRef.current) {
      closeSnackbar(processingSnackRef.current);
    }
    processingSnackRef.current = enqueueSnackbar("İşlem kuyruğa alındı, dosyalar işleniyor…", {
      variant: "info",
      persist: true,
      action: () => (
        <Button size="small" onClick={() => void fetchRows({ tryCloseSnack: true })}>
          Yenile
        </Button>
      ),
      style: {
        backgroundColor: customizer.activeMode === "dark" ? theme.palette.info.dark : theme.palette.info.main,
        color: "#fff",
        maxWidth: 720
      }
    });
  };
  const closeProcessingSnack = () => {
    if (processingSnackRef.current) {
      closeSnackbar(processingSnackRef.current);
      processingSnackRef.current = undefined;
    }
  };

  const mapYukleme = (x: any): YuklemeSatiri => {
    const processed = Number(
      x.processedFiles ?? x.ProcessedFiles ?? x.basariliDosyaSayisi ?? x.BasariliDosyaSayisi ?? 0
    );
    const total = Number(
      x.totalFiles ?? x.TotalFiles ?? x.dosyaSayisi ?? x.DosyaSayisi ?? 0
    );
    const failed = Number(
      x.failedFiles ?? x.FailedFiles ?? 0
    );
    const inProgress = Boolean(
      (x.isInProgress ?? x.IsInProgress) ??
      (total > 0 && processed < total)
    );

    const childRaw = (x.faturaDosyalari ?? x.FaturaDosyalari ?? []) as any[];
    const faturaDosyalari: FaturaDosyaRow[] = childRaw.map((d: any) => ({
      id: d.id ?? d.Id,
      dosyaAdi: d.dosyaAdi ?? d.DosyaAdi ?? "",
      durum: d.durum ?? d.Durum ?? "",
      yuklemeTarihi: d.yuklemeTarihi
        ? new Date(d.yuklemeTarihi).toLocaleString("tr-TR")
        : (d.YuklemeTarihi ? new Date(d.YuklemeTarihi).toLocaleString("tr-TR") : "")
    }));

    return {
      id: x.id ?? x.Id,
      adi: x.islemAdi ?? x.IslemAdi,
      tip: x.tip ?? x.Tip,
      olusturulmaTarihi: new Date(x.islemTarihi ?? x.IslemTarihi).toLocaleDateString("tr-TR"),
      inProgress,
      total,
      processed,
      failed,
      durum: `${processed}/${total}`,
      faturaDosyalari
    };
  };

  const fetchRows = useCallback(async (opts?: { initial?: boolean; tryCloseSnack?: boolean }) => {
    try {
      if (opts?.initial) setInitialLoading(true);
      const data = await getYuklemeIslemleri(user);
      const mapped = (data ?? []).map(mapYukleme);
      setRows(mapped);

      if (opts?.tryCloseSnack) {
        if (!anyInProgress(mapped)) {
          closeProcessingSnack();
          toast("İşlem tamamlandı.", "success");
        }
      }
    } catch (e) {
      console.log(e);
      toast("Kayıtlar çekilemedi.", "error");
    } finally {
      if (opts?.initial) setInitialLoading(false);
    }
  }, [user]);

  // ilk açılışta 1 kez çek
  useEffect(() => { void fetchRows({ initial: true }); }, [fetchRows]);

  // Dropzone
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!islemAdi?.trim()) { toast("Lütfen işlem adını giriniz.", "warning"); return; }
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setProgressInfos(acceptedFiles.map(f => ({ fileName: f.name, percentage: 0 })));
    openProcessingSnack();

    try {
      await uploadFaturaDosyalari(user, acceptedFiles, tip, islemAdi, (ev) => {
        const pct = typeof ev.progress === "number"
          ? Math.round(ev.progress * 100)
          : ev.total
            ? Math.round((100 * ev.loaded) / ev.total)
            : 1;
        setProgressInfos(infos => infos.map(i => ({ ...i, percentage: pct })));
      });

      toast("Dosyalar yüklendi. Kuyrukta işleniyor.", "success");

      // upload biter bitmez 1 kez durum çek
      void fetchRows({ tryCloseSnack: true });

      // mini bir â€œtek-sefer kontrolâ€ daha (ör. 15sn sonra)
      setTimeout(() => { void fetchRows({ tryCloseSnack: true }); }, 15000);
    } catch (e) {
      console.log(e);
      toast("Yükleme sırasında hata oluştu.", "error");
    } finally {
      setUploading(false);
    }
  }, [user, tip, islemAdi, fetchRows]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "application/xml": [".xml"], "application/zip": [".zip"] }
  });

  return (
    <PageContainer title="Fatura Yükleme" description="Fatura yükleme ve izleme">
      <Breadcrumb title="Fatura Yükleme" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid
          size={{
            xs: 12,
            lg: 5
          }}>
          <Box sx={{ height: 560, border: `1px solid ${borderColor}`, borderRadius: `${borderRadius}/5` }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h5" p={2}>Dosya Yükle</Typography>
              <CustomSelect size="small" value={tip} onChange={(e: any) => setTip(e.target.value)} sx={{ mr: 2, minWidth: 140 }}>
                <MenuItem value={"Alınan"}>Alınan</MenuItem>
                <MenuItem value={"Gönderilen"}>Gönderilen</MenuItem>
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
                  <Typography>Dosyaları buraya bırakınâ€¦</Typography>
                </Grid>
              ) : (
                <Grid container sx={{ height: "100%" }} alignItems="center" justifyContent="center">
                  <Grid textAlign="center" size={12}>
                    {uploading ? (
                      <Stack spacing={2} p={2} maxHeight={260} overflow="auto">
                        {progressInfos.map((i, idx) => (
                          <Box key={idx}>
                            <Typography>{i.fileName}</Typography>
                            <LinearProgress variant="indeterminate" />
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

        <Grid
          size={{
            xs: 12,
            lg: 7
          }}>
          <Box sx={{ height: smDown ? 610 : 560, border: `1px solid ${borderColor}`, borderRadius: `${borderRadius}/5` }}>
            <DosyaTable
              rows={rows}
              initialLoading={initialLoading}
              dosyaYuklendiMi={true}
              setDosyaYuklendiMi={() => { }}
              tip={tip}
              onRefresh={() => fetchRows({ tryCloseSnack: true })}
            />
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
