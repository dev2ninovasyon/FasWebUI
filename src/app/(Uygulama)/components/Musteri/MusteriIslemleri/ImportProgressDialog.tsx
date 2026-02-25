import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link as MuiLink,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { apiFetch } from "@/api/apiBase";

interface ImportProgressDialogProps {
  open: boolean;
  jobId: string | null;
  onClose: () => void;
  onCompleted?: (status: string) => void;
}

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

interface NormalizedStageResult {
  tableKey: string;
  totalRecords: number;
  processedRecords: number;
  durationSeconds?: number;
  success: boolean;
  errorMessage?: string;
}

export default function ImportProgressDialog({
  open,
  jobId,
  onClose,
  onCompleted,
}: ImportProgressDialogProps) {
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [polling, setPolling] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (!open || !jobId) {
      setPolling(false);
      return;
    }

    setPolling(true);
    setCanClose(false);

    const interval = setInterval(async () => {
      try {
        const response = await apiFetch(`/DataTransfer/ImportJobStatus/${jobId}`);
        if (!response.ok) throw new Error("Job bulunamadı");

        const status = await response.json();
        setJobStatus(status);

        if (status.isUserInteractionPending) {
          setPolling(false);
          setErrorModalOpen(true);
        }

        if (
          status.status === "Succeeded" ||
          status.status === "Failed" ||
          status.status === "Cancelled"
        ) {
          clearInterval(interval);
          setPolling(false);
          setCanClose(true);

          if (onCompleted) {
            onCompleted(status.status);
          }

          if (status.status === "Succeeded") {
            enqueueSnackbar("✓ Import başarıyla tamamlandı!", { variant: "success" });
          } else if (status.status === "Failed") {
            enqueueSnackbar("✗ Import sırasında hata oluştu!", { variant: "error" });
          } else if (status.status === "Cancelled") {
            enqueueSnackbar("⊘ Import kullanıcı tarafından iptal edildi.", { variant: "warning" });
          }
        }
      } catch (e: any) {
        console.error("Polling hatası:", e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [open, jobId, onCompleted]);

  const handleErrorModalAction = async (action: "continue" | "skip" | "cancel") => {
    if (!jobId) return;
    setActionInProgress(true);

    try {
      const response = await apiFetch(`/DataTransfer/ImportJob/${jobId}/Resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) throw new Error("Resume hatası");

      setErrorModalOpen(false);
      setPolling(true);

      if (action === "continue") {
        enqueueSnackbar("Hatalı tablo atlandı, işlem diğer tablolara devam ediyor.", {
          variant: "warning",
        });
      } else {
        enqueueSnackbar(`İşlem "${action}" ile devam ediyor...`, { variant: "info" });
      }
    } catch (e: any) {
      enqueueSnackbar("Eylem gerçekleştirilirken hata: " + (e.message || "Bilinmeyen hata"), {
        variant: "error",
      });
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
        return "✓ Başarılı";
      case "Failed":
        return "✗ Başarısız";
      case "Cancelled":
        return "⊘ İptal Edildi";
      case "WaitingForUserInput":
        return "⏸ Onay Bekliyor";
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

  const normalizeStageResult = (result: any): NormalizedStageResult => ({
    tableKey: result?.tableKey ?? result?.TableKey ?? "",
    totalRecords: result?.totalRecords ?? result?.TotalRecords ?? 0,
    processedRecords: result?.processedRecords ?? result?.ProcessedRecords ?? 0,
    durationSeconds: result?.durationSeconds ?? result?.DurationSeconds,
    success: (result?.success ?? result?.Success ?? false) === true,
    errorMessage: result?.errorMessage ?? result?.ErrorMessage,
  });

  return (
    <>
      <Dialog
        open={open && !errorModalOpen}
        maxWidth="md"
        fullWidth
        onClose={() => canClose && onClose()}
        disableEscapeKeyDown={!canClose}
      >
        <DialogTitle>
          Müşteri Data Taşıma İşlemi
          {jobStatus && (
            <Chip
              label={getStatusLabel(jobStatus.status)}
              color={getStatusColor(jobStatus.status) as any}
              sx={{ ml: 2 }}
            />
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {!jobStatus ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {jobStatus.status === "Queued" && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    İşlem kuyruğa alındı, başlaması bekleniyor...
                  </Alert>
                )}
                {jobStatus.status === "Running" && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <CircularProgress size={20} sx={{ mr: 1, mb: -0.5 }} />
                    İşlem çalışıyor... Lütfen bekleyin.
                  </Alert>
                )}
                {jobStatus.status === "Succeeded" && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    ✓ İşlem başarıyla tamamlandı!
                  </Alert>
                )}
                {jobStatus.status === "Failed" && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    ✗ İşlem sırasında bir hata oluştu
                  </Alert>
                )}
                {jobStatus.status === "Cancelled" && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    ⊘ İşlem kullanıcı tarafından iptal edildi
                  </Alert>
                )}

                {jobStatus.errorMessage && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <strong>Hata:</strong> {jobStatus.errorMessage}
                  </Alert>
                )}

                {jobStatus.stageResults && jobStatus.stageResults.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <h4>Tablo Başına Sonuçlar:</h4>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                            <TableCell>
                              <strong>Tablo Adı</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>Toplam</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>İşlenen</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>Süre (sn)</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Durum</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Kontrol</strong>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {jobStatus.stageResults.map((rawResult: any, idx: number) => {
                            const result = normalizeStageResult(rawResult);
                            return (
                            <TableRow key={idx}>
                              <TableCell>{result.tableKey}</TableCell>
                              <TableCell align="right">{result.totalRecords}</TableCell>
                              <TableCell align="right">{result.processedRecords}</TableCell>
                              <TableCell align="right">
                                {result.durationSeconds?.toFixed(2) || "-"}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={result.success ? "✓" : "✗"}
                                  color={result.success ? "success" : "error"}
                                  size="small"
                                />
                              </TableCell>
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
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {jobStatus.notifications && jobStatus.notifications.length > 0 && (
                  <Box>
                    <h4>Ayrıntılı Log Mesajları:</h4>
                    <Box
                      sx={{
                        maxHeight: 250,
                        overflow: "auto",
                        backgroundColor: "#f9f9f9",
                        border: "1px solid #ddd",
                        p: 1.5,
                        borderRadius: 1,
                        fontFamily: "monospace",
                        fontSize: "0.8rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {jobStatus.notifications.slice(-50).map((notif: any, idx: number) => (
                        <Box
                          key={idx}
                          sx={{
                            mb: 0.5,
                            color:
                              notif.severity === "Error"
                                ? "#d32f2f"
                                : notif.severity === "Warning"
                                  ? "#f57c00"
                                  : "#1976d2",
                          }}
                        >
                          <span style={{ color: "#999" }}>
                            {new Date(notif.createdAt).toLocaleTimeString()}
                          </span>{" "}
                          <span>
                            {notif.message}
                            {notif.recordCount && ` [${notif.recordCount} kayıt]`}
                          </span>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {jobStatus.skippedTables && jobStatus.skippedTables.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="warning" sx={{ mb: 1 }}>
                      Atlanan Tablolar: {jobStatus.skippedTables.join(", ")}
                    </Alert>
                    <Box sx={{ fontSize: "0.9rem" }}>
                      {jobStatus.skippedTables.map((tableKey) => (
                        <Box key={tableKey} sx={{ mb: 0.5 }}>
                          <strong>{tableKey}</strong>: Manuel kaynak: {getManualSourceHint(tableKey)}
                          {getManualRoute(tableKey) && (
                            <>
                              {" "}
                              |{" "}
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
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          {canClose || jobStatus?.status === "Succeeded" ? (
            <Button onClick={onClose} variant="contained">
              Kapat
            </Button>
          ) : (
            <Box sx={{ color: "#999", fontSize: "0.9rem" }}>
              İşlem tamamlanıncaya kadar bekleyin...
            </Box>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={errorModalOpen} maxWidth="sm" fullWidth disableEscapeKeyDown>
        <DialogTitle>⚠ İşlem Duraklatıldı - Onay Gerekli</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {jobStatus?.pendingTableKey && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <strong>{jobStatus.pendingTableKey}</strong> tablosunda hata oluştu:
              </Alert>
            )}

            {jobStatus?.stageResults
              ?.map((r: any) => normalizeStageResult(r))
              .find((r) => r.tableKey === jobStatus.pendingTableKey)?.errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {
                  jobStatus.stageResults
                    .map((r: any) => normalizeStageResult(r))
                    .find((r) => r.tableKey === jobStatus.pendingTableKey)?.errorMessage
                }
              </Alert>
            )}

            <Box sx={{ mb: 2 }}>
              <p>
                <strong>Ne yapmak istiyorsunuz?</strong>
              </p>
              <ul style={{ marginLeft: 20 }}>
                <li>
                  <strong>Devam Et:</strong> Hata alınan bu tablo atlanır ve işlem diğer tablolara
                  devam eder
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
    </>
  );
}
