"use client";

import React, { useEffect, useState } from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import MusteriIslemleriLayout from "../MusteriIslemleriLayout";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import MusteriEkleForm from "@/app/(Uygulama)/components/Musteri/MusteriIslemleri/MusteriEkleForm";
import ImportProgressDialog from "@/app/(Uygulama)/components/Musteri/MusteriIslemleri/ImportProgressDialog";
import { PendingImportDialog } from "@/app/(Uygulama)/components/Admin/PendingImportDialog";
import { usePendingImports } from "@/app/(Uygulama)/hooks/usePendingImports";
import {
  getOldDenetlenenDetay,
  getOldDenetlenenForCurrentDenetci,
  getTransferredDenetlenenIdsByDenetciId,
  mapOldDenetlenenToFormData,
} from "@/api/Musteri/MusteriIslemleri";
import type {
  OldDenetlenenDetayDto,
  OldDenetlenenListItemDto,
} from "@/api/Musteri/MusteriIslemleriDtos";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

const BCrumb = [
  { to: "/Musteri", title: "Müşteri" },
  { to: "/Musteri/MusteriIslemleri", title: "Müşteri İşlemleri" },
  { to: "/Musteri/MusteriIslemleri/ImportFromOld", title: "Müşteri Taşı" },
];

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const [oldList, setOldList] = useState<OldDenetlenenListItemDto[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [selected, setSelected] = useState<OldDenetlenenListItemDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any> | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<OldDenetlenenDetayDto | null>(null);
  const [progressOpen, setProgressOpen] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [pendingDialogOpen, setPendingDialogOpen] = useState(false);

  const { firstPendingJob, hasPendingJobs, refetch: refetchPendingImports } = usePendingImports();

  const loadList = async () => {
    try {
      setListLoading(true);
      setListError(null);
      const denetciId = user?.denetciId || 0;
      const [data, transferredIds] = await Promise.all([
        getOldDenetlenenForCurrentDenetci(),
        denetciId > 0 ? getTransferredDenetlenenIdsByDenetciId(denetciId) : Promise.resolve([]),
      ]);
      const transferredSet = new Set((transferredIds || []).map((x) => Number(x)));
      const filtered = (Array.isArray(data) ? data : []).filter((item: any) => {
        const id = Number(item?.id ?? item?.Id ?? 0);
        return !transferredSet.has(id);
      });
      const sorted = Array.isArray(filtered)
        ? [...filtered].sort((a, b) =>
            (a.firmaAdi ?? "").localeCompare(b.firmaAdi ?? "", "tr", { sensitivity: "base" })
          )
        : [];
      setOldList(sorted);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu";
      setListError(msg);
      enqueueSnackbar("Müşteriler yüklenemedi: " + msg, { variant: "error" });
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, [user?.denetciId]);

  useEffect(() => {
    if (hasPendingJobs && firstPendingJob) {
      setPendingDialogOpen(true);
    }
  }, [hasPendingJobs, firstPendingJob]);

  const handlePrepareTransfer = async () => {
    if (!selected) {
      enqueueSnackbar("Lütfen önce bir müşteri seçiniz.", { variant: "warning" });
      return;
    }

    try {
      setDetailLoading(true);
      setDetailError(null);
      const detailData = await getOldDenetlenenDetay(selected.id);
      setSelectedDetail(detailData);
      setConfirmOpen(true);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu";
      setDetailError(errorMsg);
      enqueueSnackbar("Firma detayları yüklenemedi: " + errorMsg, { variant: "error" });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleConfirmTransfer = () => {
    if (!selectedDetail || !selected) {
      setConfirmOpen(false);
      return;
    }

    setFormData(mapOldDenetlenenToFormData(selectedDetail));
    setDetailError(null);
    setConfirmOpen(false);
    enqueueSnackbar(`${selected.firmaAdi} için firma detayları dolduruldu.`, { variant: "success" });
  };

  const handleImportCompleted = async () => {
    await loadList();
    setSelected(null);
    setFormData(null);
    await refetchPendingImports();
  };

  return (
    <MusteriIslemleriLayout title="Müşteri Taşı" items={BCrumb}>
      <PageContainer title="Müşteri Taşı" description="Eski veriler aktarılıyor">
        <Stack spacing={3}>
          <ParentCard title="Önceki Versiyonda Kayıtlı Müşteriler">
            <Stack spacing={3}>
              {listLoading ? (
                <Box display="flex" justifyContent="center" py={3}>
                  <CircularProgress size={40} />
                </Box>
              ) : listError ? (
                <Alert severity="error">{listError}</Alert>
              ) : (
                <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems="center">
                  <Autocomplete
                    options={oldList}
                    getOptionLabel={(opt: OldDenetlenenListItemDto) => opt.firmaAdi || ""}
                    value={selected}
                    onChange={(_e, val) => {
                      setSelected(val);
                      setFormData(null);
                      setDetailError(null);
                      setSelectedDetail(null);
                      setConfirmOpen(false);
                    }}
                    fullWidth
                    sx={{ width: { xs: "100%", md: 520 }, maxWidth: "100%" }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Önceki versiyonda kayıtlı müşteri seçiniz"
                        variant="outlined"
                        fullWidth
                      />
                    )}
                    noOptionsText="Müşteri bulunamadı"
                    isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handlePrepareTransfer}
                    disabled={!selected || detailLoading}
                    sx={{ minWidth: 120, height: 56, whiteSpace: "nowrap" }}
                  >
                    {detailLoading ? "Yükleniyor..." : "Taşı"}
                  </Button>
                </Stack>
              )}
            </Stack>
          </ParentCard>

          {hasPendingJobs && (
            <Alert severity="warning">
              Yarım kalan bir taşıma işlemi bulundu. Devam ettirebilir veya iptal edebilirsiniz.
            </Alert>
          )}

          {detailError && <Alert severity="error">{detailError}</Alert>}

          {formData && selected && (
            <ParentCard title="Firma Detaylari">
              <Stack spacing={2}>
                <Alert severity="info">
                  <strong>{selected.firmaAdi}</strong> bilgileri yüklendi. Gerekirse düzenleyip taşıma işlemini başlatabilirsiniz.
                </Alert>
                <MusteriEkleForm
                  key={`import-${selected.id}`}
                  initialData={formData}
                  showPdfUpload={false}
                  isImportMode={true}
                  submitAlign="end"
                  onImportJobStarted={(startedJobId) => {
                    setJobId(startedJobId);
                    setProgressOpen(true);
                  }}
                />
              </Stack>
            </ParentCard>
          )}
        </Stack>

        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
            Firma Taşıma Onayı
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} mt={1}>
              <Typography variant="body2" color="text.secondary">
                Aşağıdaki firmaya ait detaylı bilgiler taşımaya hazırlanacaktır. Lütfen bilgileri kontrol ediniz.
              </Typography>

              <Box
                sx={{
                  bgcolor: "rgba(25, 118, 210, 0.05)",
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid rgba(25, 118, 210, 0.2)",
                }}
              >
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "primary.main" }}>
                    Şirket Bilgileri
                  </Typography>
                  <Typography variant="body2">
                    <strong>Şirket Adı:</strong> {selectedDetail?.firmaAdi || selected?.firmaAdi || "-"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Yetkili Kisi:</strong> {selectedDetail?.yetkili || "-"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Vergi No:</strong> {selectedDetail?.vergiNo || "-"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Telefon:</strong> {selectedDetail?.tel || "-"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {selectedDetail?.email || "-"}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button onClick={() => setConfirmOpen(false)} variant="outlined">
              İptal
            </Button>
            <Button variant="contained" color="secondary" onClick={handleConfirmTransfer}>
              Onayla
            </Button>
          </DialogActions>
        </Dialog>

        <PendingImportDialog
          open={pendingDialogOpen}
          job={firstPendingJob}
          onClose={() => setPendingDialogOpen(false)}
          onActionComplete={async (action) => {
            await refetchPendingImports();
            if (action === "continue" && firstPendingJob?.jobId) {
              setJobId(firstPendingJob.jobId);
              setProgressOpen(true);
            }
            if (action === "cancel") {
              await loadList();
            }
          }}
        />

        <ImportProgressDialog
          open={progressOpen}
          jobId={jobId}
          onClose={() => setProgressOpen(false)}
          onCompleted={handleImportCompleted}
        />
      </PageContainer>
    </MusteriIslemleriLayout>
  );
};

export default Page;
