"use client";

import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  TextField,
  Button,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Backdrop,
  CircularProgress,
  Divider,
  Stack,
  Alert,
} from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { enqueueSnackbar } from "notistack";
import {
  getMigrationOldCustomers,
  migrateCustomer,
  OldSystemCustomerDto,
  MigrationLogDto,
} from "@/api/DataTransfer/DataTransfer";

// ── Log Satırı yardımcı bileşeni ─────────────────────────────────────────────

const LogRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      py: 0.75,
    }}
  >
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 220 }}>
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600} textAlign="right">
      {value ?? "-"}
    </Typography>
  </Box>
);

// ── Ana Bileşen ───────────────────────────────────────────────────────────────

const VeriTasimaSection = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const yil: number = user.yil || new Date().getFullYear();

  // Müşteri listesi
  const [customers, setCustomers] = useState<OldSystemCustomerDto[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Seçim
  const [selectedCustomer, setSelectedCustomer] =
    useState<OldSystemCustomerDto | null>(null);

  // Akış state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [migrating, setMigrating] = useState(false);

  // Log modalı
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [migrationLog, setMigrationLog] = useState<MigrationLogDto | null>(
    null
  );

  // ── Veri yükleme ────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const data = await getMigrationOldCustomers();
      // Taşınmış olanları çıkar, kalanları Türkçe alfabetik sırala
      const filtered = data.filter((c) => !c.migrated);
      filtered.sort((a, b) =>
        a.firmaAdi.localeCompare(b.firmaAdi, "tr", { sensitivity: "base" })
      );
      setCustomers(filtered);
    } catch (error) {
      console.error("VeriTasimaSection fetchCustomers hata:", error);
      enqueueSnackbar("Müşteri listesi yüklenirken hata oluştu.", {
        variant: "error",
        autoHideDuration: 4000,
      });
    } finally {
      setLoadingCustomers(false);
    }
  };

  // ── Taşı butonu ─────────────────────────────────────────────────────────────

  const handleTasiClick = () => {
    if (!selectedCustomer) return;
    setConfirmOpen(true);
  };

  // ── Onay diyaloğu ───────────────────────────────────────────────────────────

  const handleConfirmClose = () => {
    setConfirmOpen(false);
  };

  const handleConfirmMigrate = async () => {
    if (!selectedCustomer) return;
    setConfirmOpen(false);
    setMigrating(true);

    try {
      const log = await migrateCustomer({
        oldCustomerId: selectedCustomer.id,
        year: yil,
      });
      setMigrationLog(log);

      // Taşınan müşteriyi listeden kaldır ve seçimi sıfırla
      setCustomers((prev) => prev.filter((c) => c.id !== selectedCustomer.id));
      setSelectedCustomer(null);

      if (log.basarili) {
        enqueueSnackbar("Veri taşıma başarıyla tamamlandı.", {
          variant: "success",
          autoHideDuration: 4000,
        });
      }
    } catch (error: any) {
      const errorMsg = error?.message || "Bilinmeyen bir hata oluştu.";
      setMigrationLog({
        basarili: false,
        mesaj: errorMsg,
      });
      enqueueSnackbar("Veri taşıma sırasında bir hata oluştu.", {
        variant: "error",
        autoHideDuration: 5000,
      });
    } finally {
      setMigrating(false);
      setLogModalOpen(true);
    }
  };

  // ── Log modalı kapat ────────────────────────────────────────────────────────

  const handleLogModalClose = () => {
    setLogModalOpen(false);
    setMigrationLog(null);
  };

  // ── Yardımcılar ─────────────────────────────────────────────────────────────

  const formatNumber = (val?: number) => {
    if (val === undefined || val === null) return "-";
    return val.toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Taşıma sırasında tam sayfa overlay – tıklanarak kapanmaz */}
      <Backdrop
        open={migrating}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 200 }}
      >
        <Box textAlign="center">
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6" color="white" mt={2}>
            Veri taşınıyor, lütfen bekleyiniz...
          </Typography>
        </Box>
      </Backdrop>

      {/* İçerik – taşıma süresince etkileşilemez */}
      <Box
        sx={{
          pointerEvents: migrating ? "none" : "auto",
          opacity: migrating ? 0.5 : 1,
          transition: "opacity 0.2s",
        }}
      >
        <Typography variant="body2" color="text.secondary" mb={2}>
          Eski sistem müşterilerini yeni sisteme aktarmak için aşağıdan şirket
          seçin ve <b>Taşı</b> butonuna tıklayın.
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ sm: "center" }}
        >
          <Autocomplete
            options={customers}
            getOptionLabel={(option) => option.firmaAdi}
            value={selectedCustomer}
            onChange={(_, newValue) => setSelectedCustomer(newValue)}
            loading={loadingCustomers}
            disabled={migrating}
            sx={{ minWidth: 320, flex: 1 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Eski Sistem Müşterisi"
                placeholder="Şirket adı ile arama yapın..."
                size="small"
              />
            )}
            noOptionsText="Taşınacak müşteri bulunamadı"
            loadingText="Yükleniyor..."
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />

          <Button
            variant="contained"
            color="primary"
            disabled={!selectedCustomer || migrating}
            onClick={handleTasiClick}
            sx={{ whiteSpace: "nowrap", minWidth: 100 }}
          >
            Taşı
          </Button>
        </Stack>
      </Box>

      {/* ── Onay Diyaloğu ──────────────────────────────────────────────────── */}
      <Dialog
        open={confirmOpen}
        onClose={handleConfirmClose}
        aria-labelledby="confirm-migration-title"
      >
        <DialogTitle id="confirm-migration-title">
          Veri Taşıma Onayı
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <b>{selectedCustomer?.firmaAdi}</b> şirketinin{" "}
            <b>{yil}</b> yılı verilerini taşımayı onaylıyor musunuz?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose} color="inherit">
            İptal
          </Button>
          <Button
            onClick={handleConfirmMigrate}
            variant="contained"
            color="primary"
            autoFocus
          >
            Evet, Taşı
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── İşlem Logları Modalı ───────────────────────────────────────────── */}
      <Dialog
        open={logModalOpen}
        onClose={handleLogModalClose}
        maxWidth="sm"
        fullWidth
        aria-labelledby="log-modal-title"
      >
        <DialogTitle id="log-modal-title">İşlem Logları</DialogTitle>

        <DialogContent dividers>
          {migrationLog && (
            <Box>
              {/* Durum mesajı */}
              <Alert
                severity={migrationLog.basarili ? "success" : "error"}
                sx={{ mb: 2 }}
              >
                {migrationLog.basarili
                  ? "İşlem başarıyla tamamlandı."
                  : migrationLog.mesaj || "İşlem sırasında bir hata oluştu."}
              </Alert>

              <Typography variant="subtitle1" fontWeight={700} mb={1}>
                İşlem Özeti
              </Typography>
              <Divider sx={{ mb: 1 }} />

              <LogRow label="Dosya Adı" value={migrationLog.dosyaAdi} />
              <LogRow
                label="Toplam Fiş Başlığı"
                value={migrationLog.toplamFisBasligi}
              />
              <LogRow
                label="Toplam Detay Kayıt"
                value={migrationLog.toplamDetayKayit}
              />
              <LogRow
                label="Toplam Borç"
                value={formatNumber(migrationLog.toplamBorc)}
              />
              <LogRow
                label="Toplam Alacak"
                value={formatNumber(migrationLog.toplamAlacak)}
              />
              <LogRow
                label="Net Fark (Borç - Alacak)"
                value={
                  <Typography
                    component="span"
                    variant="body2"
                    fontWeight={600}
                    color={
                      migrationLog.netFark !== undefined &&
                      migrationLog.netFark !== null &&
                      migrationLog.netFark !== 0
                        ? "error.main"
                        : "success.main"
                    }
                  >
                    {formatNumber(migrationLog.netFark)}
                  </Typography>
                }
              />
              <LogRow
                label="Detay İşleme Hızı (kayıt/sn)"
                value={
                  migrationLog.detayIslemHizi !== undefined &&
                  migrationLog.detayIslemHizi !== null
                    ? `${migrationLog.detayIslemHizi.toLocaleString("tr-TR")} kayıt/sn`
                    : undefined
                }
              />
              <LogRow
                label="İşlem Süresi"
                value={migrationLog.islemSuresi}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleLogModalClose}
            variant="contained"
            color="primary"
          >
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VeriTasimaSection;
