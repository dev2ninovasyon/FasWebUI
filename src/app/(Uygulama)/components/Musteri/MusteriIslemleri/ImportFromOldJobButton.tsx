import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Link as MuiLink,
} from "@mui/material";
import { startImportFromOldPipelineJob, getImportPipelineJobStatus } from "@/api/Musteri/MusteriIslemleri";
import { apiFetch } from "@/api/apiBase";
import { enqueueSnackbar } from "notistack";
import { usePendingImports } from "../../../hooks/usePendingImports";
import { PendingImportDialog } from "../../Admin/PendingImportDialog";

interface JobStatus {
  jobId: string;
  status: string;
  errorMessage?: string;
  isUserInteractionPending?: boolean;
  pendingTableKey?: string;
  skippedTables?: string[];
  notifications?: any[];
  stageResults?: any[];
}

export default function ImportFromOldJobButton({
  denetciId,
  denetlenenId,
  yil,
}: {
  denetciId: number;
  denetlenenId: number;
  yil: number;
}) {
  // Hook ile duraklamış işleri kontrol et
  const { firstPendingJob, hasPendingJobs } = usePendingImports();
  
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [pendingDialogOpen, setPendingDialogOpen] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Duraklamış işi göster
  useEffect(() => {
    if (hasPendingJobs && firstPendingJob) {
      setPendingDialogOpen(true);
    }
  }, [hasPendingJobs, firstPendingJob]);

  const handleImportClick = async () => {
    // Eğer duraklamış işlem varsa, onu önce aç
    if (hasPendingJobs && firstPendingJob) {
      setPendingDialogOpen(true);
      return;
    }

    // Yoksa yeni işlem başlat
    await handleImport();
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      const { jobId, alreadyQueued } = await startImportFromOldPipelineJob({
        TableKey: "ImportFromOldPipeline",
        DenetciId: denetciId,
        DenetlenenId: denetlenenId,
        Yil: yil,
      });
      setJobId(jobId);
      setPolling(true);
      enqueueSnackbar(
        alreadyQueued ? "Zaten kuyruğa alınmış." : "Kuyruğa alındı",
        { variant: "info" }
      );
    } catch (e: any) {
      enqueueSnackbar(e.message || "Kuyruğa alınamadı", { variant: "error" });
      setLoading(false);
    }
  };

  // Polling effect
  useEffect(() => {
    if (!jobId || !polling) return;

    const interval = setInterval(async () => {
      try {
        const status = await getImportPipelineJobStatus(jobId);
        setJobStatus(status);

        // Check if user interaction is needed
        if (status.isUserInteractionPending) {
          setErrorModalOpen(true);
        }

        // Job completed
        if (
          status.status === "Succeeded" ||
          status.status === "Failed" ||
          status.status === "Cancelled"
        ) {
          clearInterval(interval);
          setPolling(false);
          setLoading(false);
          setReportModalOpen(true);

          if (status.status === "Succeeded") {
            enqueueSnackbar("Import başarıyla tamamlandı!", {
              variant: "success",
            });
          } else if (status.status === "Failed") {
            enqueueSnackbar("Import sırasında hata oluştu!", {
              variant: "error",
            });
          } else if (status.status === "Cancelled") {
            enqueueSnackbar("Import kullanıcı tarafından iptal edildi.", {
              variant: "warning",
            });
          }
        }
      } catch (e) {
        console.error("Polling hatası:", e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, polling]);

 const handleErrorModalAction = async (action: "continue" | "skip" | "cancel") => {
    if (!jobId) return;
    setActionInProgress(true);

    try {
      await apiFetch(`/DataTransfer/ImportJob/${jobId}/Resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      setErrorModalOpen(false);
      if (action === "continue") {
        enqueueSnackbar("Hatalı tablo atlandı, işlem diğer tablolarla devam ediyor.", {
          variant: "warning",
        });
      } else {
        enqueueSnackbar(`İşlem "${action}" ile devam ediyor...`, {
          variant: "info",
        });
      }
    } catch (e: any) {
      enqueueSnackbar(
        "Eylem gerçekleştirilirken hata: " + (e.message || "Bilinmeyen hata"),
        { variant: "error" }
      );
    } finally {
      setActionInProgress(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Succeeded":
        return "success";
      case "Failed":
      case "Cancelled":
        return "error";
      case "Running":
      case "WaitingForUserInput":
        return "info";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Queued":
        return "Kuyruğa Alındı";
      case "Running":
        return "Çalışıyor";
      case "Succeeded":
        return "Başarılı";
      case "Failed":
        return "Başarısız";
      case "Cancelled":
        return "İptal Edildi";
      case "WaitingForUserInput":
        return "Kullanıcı Onayı Bekliyor";
      default:
        return status;
    }
  };

  const getManualSourceHint = (tableKey: string) => {
    switch (tableKey) {
      case "DonusumMizan":
        return "OldDb: DonusumBobiDetayMizan / DonusumTfrsDetayMizan";
      case "Amortisman":
        return "OldDb: AmortismanHesaplamaV3";
      case "CekSenetReeskont":
        return "OldDb: CekSenetReeskontKayitlari";
      case "DavaKarsiliklari":
        return "OldDb: DavaKarsiliklariHesaplanan";
      case "KidemTazminati":
        return "OldDb: KidemTazminatiVerileriV2";
      case "KrediHesaplama":
        return "OldDb: KrediHesaplama";
      case "Yaslandirma":
        return "OldDb: YaslandirmaKayitlariV3";
      default:
        return "OldDb ilgili kaynak tablo";
    }
  };

  const getManualRoute = (tableKey: string) => {
    switch (tableKey) {
      case "DonusumMizan":
        return "/DenetimKanitlari/MizanKontrol/DonusumMizanKontrol";
      case "Amortisman":
        return "/Hesaplamalar/Amortisman";
      case "CekSenetReeskont":
        return "/Hesaplamalar/CekSenetReeskont";
      case "DavaKarsiliklari":
        return "/Hesaplamalar/DavaKarsiliklari";
      case "KidemTazminati":
        return "/Hesaplamalar/KidemTazminatiBobi";
      case "KrediHesaplama":
        return "/Hesaplamalar/KrediHesaplama";
      case "Yaslandirma":
        return "/Hesaplamalar/Yaslandirma";
      default:
        return null;
    }
  };

  const getControlRoute = (tableKey: string) => {
    switch (tableKey) {
      case "DonusumMizan":
        return "/DenetimKanitlari/MizanKontrol/DonusumMizanKontrol";
      case "Amortisman":
        return "/Hesaplamalar/Amortisman";
      case "CekSenetReeskont":
        return "/Hesaplamalar/CekSenetReeskont";
      case "DavaKarsiliklari":
        return "/Hesaplamalar/DavaKarsiliklari";
      case "KidemTazminati":
        return "/Hesaplamalar/KidemTazminatiBobi";
      case "KrediHesaplama":
        return "/Hesaplamalar/KrediHesaplama";
      case "Yaslandirma":
        return "/Hesaplamalar/Yaslandirma";
      default:
        return null;
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color={hasPendingJobs ? "warning" : "primary"}
        onClick={handleImportClick}
        disabled={loading || polling}
      >
        {loading || polling ? (
          <>
            <CircularProgress size={20} sx={{ mr: 1 }} /> İşlem Devam Ediyor...
          </>
        ) : hasPendingJobs ? (
          "⚠️ Duraklamış İşi Devam Et"
        ) : (
          "Müşteri Taşı"
        )}
      </Button>

      {/* PendingImport Dialog */}
      <PendingImportDialog
        open={pendingDialogOpen}
        job={firstPendingJob}
        onClose={() => setPendingDialogOpen(false)}
        onActionComplete={() => {
          // Sayfayı yenile
          window.location.reload();
        }}
      />

      {/* Error/Waiting Modal */}
      <Dialog
        open={errorModalOpen}
        maxWidth="sm"
        fullWidth
        onClose={() => !actionInProgress && setErrorModalOpen(false)}
      >
        <DialogTitle>⚠️ Import İşlemi - Kullanıcı Onayı Gerekli</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {jobStatus?.pendingTableKey && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <strong>{jobStatus.pendingTableKey}</strong> tablosunda hata
                oluştu:
              </Alert>
            )}

            <Alert severity="error" sx={{ mb: 2 }}>
              {jobStatus?.stageResults?.find(
                (r: any) => r.tableKey === jobStatus.pendingTableKey
              )?.errorMessage ||
                "Detay bilgisi yüklemede hata"}
            </Alert>

            <Box sx={{ mb: 2 }}>
              <p>
                <strong>Seçeneğiniz:</strong>
              </p>
              <ul>
                <li>
                  <strong>Devam Et:</strong> Hata alınan bu tablo atlanır ve işlem
                  diğer tablolara devam eder
                </li>
                <li>
                  <strong>İptal Et:</strong> Tüm işlemi iptal edin
                </li>
              </ul>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handleErrorModalAction("continue")}
            variant="outlined"
            disabled={actionInProgress}
          >
            {actionInProgress ? <CircularProgress size={20} /> : "Devam Et (Tabloyu Atla)"}
          </Button>
          <Button
            onClick={() => handleErrorModalAction("cancel")}
            variant="contained"
            color="error"
            disabled={actionInProgress}
          >
            İptal Et
          </Button>
        </DialogActions>
      </Dialog>

      {/* Final Report Modal */}
      <Dialog
        open={reportModalOpen}
        maxWidth="md"
        fullWidth
        onClose={() => setReportModalOpen(false)}
      >
        <DialogTitle>
          📊 Import İşlemi Sonuç Raporu
          <Chip
            label={getStatusLabel(jobStatus?.status || "")}
            color={getStatusColor(jobStatus?.status || "") as any}
            sx={{ ml: 2 }}
          />
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {jobStatus?.status === "Succeeded" ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                ✓ İşlem başarıyla tamamlandı
              </Alert>
            ) : jobStatus?.status === "Failed" ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                ✗ İşlem sırasında hata oluştu
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ mb: 2 }}>
                ⊘ İşlem iptal edildi
              </Alert>
            )}

            {jobStatus?.errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <strong>Hata Detayları:</strong> {jobStatus.errorMessage}
              </Alert>
            )}

            <Box sx={{ mt: 2 }}>
              <h4>Tablo Başına Sonuçlar:</h4>
              {jobStatus?.stageResults && jobStatus.stageResults.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                        <TableCell>
                          <strong>Tablo Adı</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>Toplam Kayıt</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>İşlenen Kayıt</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>Süre (sn)</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Durum</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Hata Mesajı</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Kontrol</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {jobStatus.stageResults.map(
                        (result: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell>{result.tableKey}</TableCell>
                            <TableCell align="right">
                              {result.totalRecords}
                            </TableCell>
                            <TableCell align="right">
                              {result.processedRecords}
                            </TableCell>
                            <TableCell align="right">
                              {result.durationSeconds?.toFixed(2) || "-"}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={result.success ? "✓ Başarı" : "✗ Hata"}
                                color={result.success ? "success" : "error"}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{result.errorMessage || "-"}</TableCell>
                            <TableCell>
                              {result.success && getControlRoute(result.tableKey) ? (
                                <MuiLink href={getControlRoute(result.tableKey)!} underline="hover">
                                  Kontrole Git
                                </MuiLink>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">Tablo bilgisi yüklemede</Alert>
              )}
            </Box>

            {jobStatus?.notifications && jobStatus.notifications.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <h4>Detaylı Log:</h4>
                <Box
                  sx={{
                    maxHeight: 300,
                    overflow: "auto",
                    backgroundColor: "#f9f9f9",
                    p: 2,
                    borderRadius: 1,
                    fontFamily: "monospace",
                    fontSize: "0.85rem",
                  }}
                >
                  {jobStatus.notifications.map(
                    (notif: any, idx: number) => (
                      <Box key={idx} sx={{ mb: 1 }}>
                        <span style={{ color: "#666" }}>
                          [{new Date(notif.createdAt).toLocaleTimeString()}]
                        </span>{" "}
                        <span
                          style={{
                            color:
                              notif.severity === "Error"
                                ? "#d32f2f"
                                : notif.severity === "Warning"
                                  ? "#f57c00"
                                  : "#1976d2",
                          }}
                        >
                          {notif.severity}
                        </span>
                        :{" "}
                        <span>
                          {notif.message}
                          {notif.recordCount &&
                            ` [${notif.recordCount} kayıt]`}
                        </span>
                      </Box>
                    )
                  )}
                </Box>
              </Box>
            )}

            {jobStatus?.skippedTables && jobStatus.skippedTables.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Alert severity="warning" sx={{ mb: 1 }}>
                  Atlanan Tablolar: {jobStatus.skippedTables.join(", ")}
                </Alert>
                <Box sx={{ fontSize: "0.9rem" }}>
                  {jobStatus.skippedTables.map((tableKey) => (
                    <Box key={tableKey} sx={{ mb: 0.5 }}>
                      <strong>{tableKey}</strong>: Manuel kaynak: {getManualSourceHint(tableKey)}
                      {getManualRoute(tableKey) && (
                        <>
                          {" "} |{" "}
                          <MuiLink href={getManualRoute(tableKey)!} underline="hover">
                            İlgili Ekrana Git
                          </MuiLink>
                        </>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setReportModalOpen(false)}
            variant="contained"
          >
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
