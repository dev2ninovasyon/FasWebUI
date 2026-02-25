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
import type { OldDenetlenenListItemDto } from "@/api/Musteri/MusteriIslemleriDtos";
import { enqueueSnackbar } from "notistack";

const BCrumb = [
  { to: "/Musteri", title: "Müşteri" },
  { to: "/Musteri/MusteriIslemleri", title: "Müşteri İşlemleri" },
  { to: "/Musteri/MusteriIslemleri/ImportFromOld", title: "Müşteri Taşı" },
];

// Taşınacak veri listesi — ✔ olanlar hazır, olmayanlar henüz dahil değil
const TASIMA_KALEMLERI = [
  { label: "Yaşlandırma", hazir: true },
  { label: "Kıdem Tazminatı", hazir: true },
  { label: "Amortisman", hazir: true },
  { label: "Kredi", hazir: true },
  { label: "Çek / Senet Reeskont", hazir: true },
  { label: "Dava Karşılıkları", hazir: true },
  { label: "Ertelenmiş Vergi Hesabı", hazir: false },
  { label: "Mizan", hazir: true },
];

const Page = () => {
  // ── Liste ──────────────────────────────────────────────────────────────
  const [oldList, setOldList] = useState<OldDenetlenenListItemDto[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // ── Seçim & detay ──────────────────────────────────────────────────────
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
        const sorted = Array.isArray(data)
          ? [...data].sort((a, b) =>
            (a.firmaAdi ?? "").localeCompare(b.firmaAdi ?? "", "tr", {
              sensitivity: "base",
            })
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

      {/* ── Onay Dialogu ───────────────────────────────────────────── */}
      <Dialog
        open={confirmOpen}
        onClose={handleConfirmNo}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Veri Taşıma Onayı</DialogTitle>

        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Aşağıdaki veriler yeni sisteme taşınacaktır:
          </Typography>

          <List dense disablePadding>
            {TASIMA_KALEMLERI.map((kalem) => (
              <ListItem key={kalem.label} disableGutters sx={{ py: 0.25 }}>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                    >
                      {kalem.hazir ? (
                        <Box
                          component="span"
                          sx={{ color: "success.main", fontWeight: 700 }}
                        >
                          ✔
                        </Box>
                      ) : (
                        <Box
                          component="span"
                          sx={{ color: "text.disabled", fontWeight: 700 }}
                        >
                          –
                        </Box>
                      )}
                      {kalem.label}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>

          <Typography variant="body1" fontWeight={600} mt={2}>
            Onaylıyor musunuz?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleConfirmNo} variant="outlined" color="inherit">
            Hayır
          </Button>
          <Button onClick={handleConfirmYes} variant="contained" color="primary">
            Evet
          </Button>
        </DialogActions>
      </Dialog>
    </MusteriIslemleriLayout>
  );
};

export default Page;
