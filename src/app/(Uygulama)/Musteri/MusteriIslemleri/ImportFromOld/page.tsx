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
  { to: "/Musteri", title: "Musteri" },
  { to: "/Musteri/MusteriIslemleri", title: "Musteri Islemleri" },
  { to: "/Musteri/MusteriIslemleri/ImportFromOld", title: "Musteri Tasi" },
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
      const msg = error instanceof Error ? error.message : "Bilinmeyen bir hata olustu";
      setListError(msg);
      enqueueSnackbar("Musteriler yuklenemedi: " + msg, { variant: "error" });
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
      enqueueSnackbar("Lutfen once bir musteri seciniz.", { variant: "warning" });
      return;
    }

    try {
      setDetailLoading(true);
      setDetailError(null);
      const detailData = await getOldDenetlenenDetay(selected.id);
      setSelectedDetail(detailData);
      setConfirmOpen(true);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Bilinmeyen bir hata olustu";
      setDetailError(errorMsg);
      enqueueSnackbar("Firma detaylari yuklenemedi: " + errorMsg, { variant: "error" });
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
    enqueueSnackbar(`${selected.firmaAdi} icin firma detaylari dolduruldu.`, { variant: "success" });
  };

  const handleImportCompleted = async () => {
    await loadList();
    setSelected(null);
    setFormData(null);
    await refetchPendingImports();
  };

  return (
    <MusteriIslemleriLayout title="Musteri Tasi" items={BCrumb}>
      <PageContainer title="Musteri Tasi" description="Eski veriler aktariliyor">
        <Stack spacing={3}>
          <ParentCard title="Onceki Versiyonda Kayitli Musteriler">
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
                        label="Onceki versiyonda kayitli musteri seciniz"
                        variant="outlined"
                        fullWidth
                      />
                    )}
                    noOptionsText="Musteri bulunamadi"
                    isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  />
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handlePrepareTransfer}
                    disabled={!selected || detailLoading}
                    sx={{ minWidth: 120, height: 56, whiteSpace: "nowrap" }}
                  >
                    {detailLoading ? "Yukleniyor..." : "Tasi"}
                  </Button>
                </Stack>
              )}
            </Stack>
          </ParentCard>

          {hasPendingJobs && (
            <Alert severity="warning">
              Yarim kalan bir tasima islemi bulundu. Devam ettirebilir veya iptal edebilirsiniz.
            </Alert>
          )}

          {detailError && <Alert severity="error">{detailError}</Alert>}

          {formData && selected && (
            <ParentCard title="Firma Detaylari">
              <Stack spacing={2}>
                <Alert severity="info">
                  <strong>{selected.firmaAdi}</strong> bilgileri yuklendi. Gerekirse duzenleyip tasima islemini baslatabilirsiniz.
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
            Firma Tasima Onayi
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} mt={1}>
              <Typography variant="body2" color="text.secondary">
                Asagidaki firmaya ait detayli bilgiler tasimaya hazirlanacaktir. Lutfen bilgileri kontrol ediniz.
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
                    Sirket Bilgileri
                  </Typography>
                  <Typography variant="body2">
                    <strong>Sirket Adi:</strong> {selectedDetail?.firmaAdi || selected?.firmaAdi || "-"}
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
              Iptal
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
