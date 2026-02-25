"use client";

import React, { useEffect, useState, useRef } from "react";
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
  List,
  ListItem,
  ListItemText,
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

  // ── Onay dialogu ───────────────────────────────────────────────────────
  const [confirmOpen, setConfirmOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // ── Firma listesini yükle ──────────────────────────────────────────────
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

  // ── Seçim değişince formu sıfırla (otomatik yüklemeden) ──────────────
  const handleSelectionChange = (val: OldDenetlenenListItemDto | null) => {
    // Önceki isteği iptal et
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setSelected(val);
    setFormData(null);
    setDetailError(null);
  };

  // ── Firma detayını yükle (onay sonrası çağrılır) ──────────────────────
  const loadDetail = async (id: number) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setDetailLoading(true);
      setDetailError(null);

      const detailData = await getOldDenetlenenDetay(id);

      if (abortControllerRef.current?.signal.aborted) return;

      setFormData(mapOldDenetlenenToFormData(detailData));
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      const msg = error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu";
      setDetailError(msg);
      enqueueSnackbar("Firma detayları yüklenemedi: " + msg, { variant: "error" });
    } finally {
      setDetailLoading(false);
    }
  };

  // ── "Taşı" butonuna tıklandı → dialogu aç ────────────────────────────
  const handleTasiClick = () => {
    if (!selected) return;
    setConfirmOpen(true);
  };

  // ── Onay: Evet ────────────────────────────────────────────────────────
  const handleConfirmYes = () => {
    setConfirmOpen(false);
    if (selected) loadDetail(selected.id);
  };

  // ── Onay: Hayır ───────────────────────────────────────────────────────
  const handleConfirmNo = () => {
    setConfirmOpen(false);
  };

  // ── Unmount temizliği ─────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return (
    <MusteriIslemleriLayout title="Müşteri Taşı" items={BCrumb}>
      <PageContainer title="Müşteri Taşı" description="Eski veriler aktarılıyor">
        <Stack spacing={3}>

          {/* ── Müşteri Seç ─────────────────────────────────────────── */}
          <ParentCard title="Müşteri Seç">
            {listLoading ? (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress size={40} />
              </Box>
            ) : listError ? (
              <Alert severity="error">{listError}</Alert>
            ) : (
              <Box display="flex" alignItems="center" gap={2}>
                <Autocomplete
                  options={oldList}
                  getOptionLabel={(opt) => opt.firmaAdi || ""}
                  value={selected}
                  onChange={(_, val) => handleSelectionChange(val)}
                  sx={{ flex: 1, maxWidth: 600 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Müşteri Seçiniz"
                      variant="outlined"
                    />
                  )}
                  noOptionsText="Müşteri bulunamadı"
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                />
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!selected}
                  onClick={handleTasiClick}
                  sx={{ whiteSpace: "nowrap", height: 56 }}
                >
                  Taşı
                </Button>
              </Box>
            )}
          </ParentCard>

          {/* ── Firma Detayları (yalnızca onaydan sonra) ────────────── */}
          {selected && (detailLoading || detailError || formData) && (
            <ParentCard title="Firma Detayları">
              <Stack spacing={2}>
                {detailLoading ? (
                  <Box display="flex" justifyContent="center" py={5}>
                    <CircularProgress size={40} />
                  </Box>
                ) : detailError ? (
                  <Alert severity="error">{detailError}</Alert>
                ) : formData ? (
                  <MusteriEkleForm
                    key={`import-${selected.id}`}
                    initialData={formData}
                    showPdfUpload={false}
                    isImportMode={true}
                  />
                ) : null}
              </Stack>
            </ParentCard>
          )}

        </Stack>
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
