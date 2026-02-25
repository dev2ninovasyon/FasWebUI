"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import {
  getOldDenetlenenDetay,
  getOldDenetlenenForCurrentDenetci,
  mapOldDenetlenenToFormData,
} from "@/api/Musteri/MusteriIslemleri";
import type {
  OldDenetlenenDetayDto,
  OldDenetlenenListItemDto,
} from "@/api/Musteri/MusteriIslemleriDtos";
import MusteriEkleForm from "./MusteriEkleForm";
import ImportProgressDialog from "./ImportProgressDialog";

interface Props {
  open: boolean;
  onClose: () => void;
  onImportCompleted?: () => void;
}

const TABLES_TO_TRANSFER = [
  "Dönüşüm Mizan",
  "Amortisman",
  "Çek Senet Reeskont",
  "Dava Karşılıkları",
  "Kıdem Tazminatı",
  "Kredi Hesaplama",
  "Yaşlandırma",
];

export default function MusteriImportOldWorkflowDialog({
  open,
  onClose,
  onImportCompleted,
}: Props) {
  const [oldList, setOldList] = useState<OldDenetlenenListItemDto[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [selected, setSelected] = useState<OldDenetlenenListItemDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any> | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [progressOpen, setProgressOpen] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const loadList = async () => {
      setListLoading(true);
      try {
        const data = await getOldDenetlenenForCurrentDenetci();
        setOldList(Array.isArray(data) ? data : []);
      } catch (error: any) {
        enqueueSnackbar(error?.message || "Eski müşteri listesi alınamadı.", {
          variant: "error",
        });
      } finally {
        setListLoading(false);
      }
    };
    loadList();
  }, [open]);

  useEffect(() => {
    if (!selected) {
      setFormData(null);
      setShowForm(false);
      return;
    }

    const loadDetail = async () => {
      setDetailLoading(true);
      setDetailError(null);
      try {
        const detailData: OldDenetlenenDetayDto = await getOldDenetlenenDetay(selected.id);
        setFormData(mapOldDenetlenenToFormData(detailData));
      } catch (error: any) {
        setFormData(null);
        setDetailError(error?.message || "Firma detayları alınamadı.");
      } finally {
        setDetailLoading(false);
      }
    };
    loadDetail();
  }, [selected]);

  const selectedCompanyName = useMemo(() => selected?.firmaAdi || "-", [selected]);

  const handleOpenConfirm = () => {
    if (!selected) {
      enqueueSnackbar("Önce taşınacak müşteriyi seçiniz.", { variant: "warning" });
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmTransfer = () => {
    setConfirmOpen(false);
    setShowForm(true);
  };

  const handleProgressCompleted = () => {
    onImportCompleted?.();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>Müşteri Taşı</DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={1}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
              <Autocomplete
                sx={{ flex: 1 }}
                options={oldList}
                getOptionLabel={(opt: OldDenetlenenListItemDto) => opt.firmaAdi || ""}
                value={selected}
                onChange={(_, val) => setSelected(val)}
                loading={listLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Müşteri Seç"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {listLoading ? <CircularProgress size={18} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                noOptionsText="Taşınacak müşteri bulunamadı"
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
              />
              <Button
                variant="contained"
                color="secondary"
                onClick={handleOpenConfirm}
                disabled={!selected || detailLoading}
              >
                Taşı
              </Button>
            </Stack>

            {detailLoading && (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress size={32} />
              </Box>
            )}
            {detailError && <Alert severity="error">{detailError}</Alert>}

            {showForm && formData && (
              <>
                <Alert severity="info">
                  <strong>{selectedCompanyName}</strong> için bilgiler yüklendi. Gerekirse düzenleyip sağ alttan taşıma işlemini başlatabilirsiniz.
                </Alert>
                <MusteriEkleForm
                  key={`transfer-${selected?.id}`}
                  initialData={formData}
                  isImportMode={true}
                  showPdfUpload={false}
                  submitLabel="Taşımayı Başlat"
                  submitAlign="end"
                  onImportJobStarted={(startedJobId) => {
                    setJobId(startedJobId);
                    setProgressOpen(true);
                  }}
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Kapat</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Taşıma Onayı</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            <strong>{selectedCompanyName}</strong> şirketi için aşağıdaki tablolar taşınacaktır:
          </Typography>
          <Box component="ul" sx={{ pl: 3, my: 0 }}>
            {TABLES_TO_TRANSFER.map((tableName) => (
              <li key={tableName}>{tableName}</li>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleConfirmTransfer}>
            Onayla
          </Button>
        </DialogActions>
      </Dialog>

      <ImportProgressDialog
        open={progressOpen}
        jobId={jobId}
        onClose={() => setProgressOpen(false)}
        onCompleted={handleProgressCompleted}
      />
    </>
  );
}

