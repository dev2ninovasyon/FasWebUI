"use client";

import React, { useEffect, useState } from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import MusteriIslemleriLayout from "../MusteriIslemleriLayout";
import {
  Box,
  Stack,
  TextField,
  Autocomplete,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import MusteriEkleForm from "@/app/(Uygulama)/components/Musteri/MusteriIslemleri/MusteriEkleForm";
import {
  getOldDenetlenenForCurrentDenetci,
  getOldDenetlenenDetay,
  mapOldDenetlenenToFormData,
} from "@/api/Musteri/MusteriIslemleri";
import type {
  OldDenetlenenListItemDto,
  OldDenetlenenDetayDto,
} from "@/api/Musteri/MusteriIslemleriDtos";
import { enqueueSnackbar } from "notistack";

const BCrumb = [
  { to: "/Musteri", title: "Müşteri" },
  { to: "/Musteri/MusteriIslemleri", title: "Müşteri İşlemleri" },
  { to: "/Musteri/MusteriIslemleri/ImportFromOld", title: "Müşteri Taşı" },
];

const Page = () => {
  const [oldList, setOldList] = useState<OldDenetlenenListItemDto[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [selected, setSelected] = useState<OldDenetlenenListItemDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any> | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<OldDenetlenenDetayDto | null>(null);

  useEffect(() => {
    const loadList = async () => {
      try {
        setListLoading(true);
        setListError(null);
        const data = await getOldDenetlenenForCurrentDenetci();
        setOldList(Array.isArray(data) ? data : []);
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu";
        setListError(errorMsg);
        enqueueSnackbar("Müşteriler yüklenemedi: " + errorMsg, {
          variant: "error",
        });
      } finally {
        setListLoading(false);
      }
    };

    loadList();
  }, []);

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
      const errorMsg =
        error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu";
      setDetailError(errorMsg);
      enqueueSnackbar("Firma detayları yüklenemedi: " + errorMsg, {
        variant: "error",
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleConfirmTransfer = () => {
    if (!selectedDetail || !selected) {
      setConfirmOpen(false);
      return;
    }

    const mapped = mapOldDenetlenenToFormData(selectedDetail);
    setFormData(mapped);
    setDetailError(null);
    setConfirmOpen(false);
    enqueueSnackbar(`${selected.firmaAdi} için firma detayları dolduruldu.`, {
      variant: "success",
    });
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
                    onChange={(e, val) => {
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
                    color="secondary"
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

          {detailError && <Alert severity="error">{detailError}</Alert>}

          {formData && selected && (
            <ParentCard title="Firma Detayları">
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

              <Box sx={{ 
                bgcolor: "rgba(25, 118, 210, 0.05)", 
                p: 2, 
                borderRadius: 2,
                border: "1px solid rgba(25, 118, 210, 0.2)"
              }}>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "primary.main" }}>
                    Şirket Bilgileri
                  </Typography>
                  <Typography variant="body2">
                    <strong>Şirket Adı:</strong> {selectedDetail?.firmaAdi || selected?.firmaAdi || "-"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Yetkili Kişi:</strong> {selectedDetail?.yetkili || "-"}
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

              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="body2">
                  ℹ️ <strong>Bilgi:</strong> Onay sonrasında firma bilgilerinde ihtiyaç duyduğunuz değişiklikleri yapabileceksiniz.
                </Typography>
              </Alert>
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
      </PageContainer>
    </MusteriIslemleriLayout>
  );
};

export default Page;
