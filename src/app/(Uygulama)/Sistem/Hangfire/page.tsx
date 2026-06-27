"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Box, Card, CardContent, Grid, Stack, Typography, Button, CircularProgress, Chip, IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getHangfireStats, clearQueues, clearFailed, resetStuckPackets } from "@/api/Hangfire/HangfireApi";
import type { HangfireStats } from "@/api/Hangfire/HangfireApi";
import { enqueueSnackbar } from "notistack";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const BCrumb = [{ to: "/Sistem/Hangfire", title: "Hangfire" }];

const STATS_API_URL = typeof window !== "undefined"
  ? `${window.location.protocol}//${window.location.hostname}:5080/hangfire`
  : "http://localhost:5080/hangfire";

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <Card variant="outlined" sx={{ flex: 1, minWidth: 120 }}>
      <CardContent sx={{ py: 2, textAlign: "center", "&:last-child": { pb: 2 } }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="h5" fontWeight={700} sx={{ color: color ?? undefined }}>
          {value.toLocaleString("tr-TR")}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function HangfirePage() {
  const theme = useTheme();
  const user = useSelector((s: AppState) => s.userReducer);
  const [stats, setStats] = useState<HangfireStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHangfireStats(user);
      setStats(data);
    } catch {
      enqueueSnackbar("Hangfire istatistikleri alınamadı", { variant: "error", autoHideDuration: 3000 });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { void fetchStats(); }, [fetchStats]);

  const handleAction = async (action: string, fn: () => Promise<any>) => {
    setActionLoading(action);
    try {
      const res = await fn();
      enqueueSnackbar(res.message, { variant: "success", autoHideDuration: 4000 });
      void fetchStats();
    } catch (e: any) {
      enqueueSnackbar(e.message || "İşlem başarısız", { variant: "error", autoHideDuration: 4000 });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <PageContainer title="Hangfire Yönetimi" description="Hangfire Kuyruk Yönetim Paneli">
      <Breadcrumb title="Hangfire Yönetimi" items={BCrumb} />
      <Box mt={2}>
        {/* Stats Cards */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6">Kuyruk İstatistikleri</Typography>
              <IconButton size="small" onClick={fetchStats} disabled={loading}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Stack>
            {loading && !stats ? (
              <Box textAlign="center" py={4}><CircularProgress size={24} /></Box>
            ) : stats ? (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <StatCard label="Kuyrukta" value={stats.enqueued} color={theme.palette.info.main} />
                <StatCard label="İşleniyor" value={stats.processing} color={theme.palette.warning.main} />
                <StatCard label="Başarısız" value={stats.failed} color={theme.palette.error.main} />
                <StatCard label="Zamanlanmış" value={stats.scheduled} color={theme.palette.secondary.main} />
                <StatCard label="Tamamlanmış" value={stats.succeeded} color={theme.palette.success.main} />
              </Stack>
            ) : (
              <Typography color="error">İstatistikler alınamadı.</Typography>
            )}
          </CardContent>
        </Card>

        {/* Fatura Channel Worker Status */}
        {stats && stats.faturaStatuses && stats.faturaStatuses.length > 0 && (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" mb={2}>Fatura İşleme Durumu</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {stats.faturaStatuses.map((s) => (
                  <Card key={s.status} variant="outlined" sx={{ flex: 1, minWidth: 100 }}>
                    <CardContent sx={{ py: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
                      <Typography variant="caption" color="text.secondary">
                        <Chip label={s.status} size="small" sx={{ fontSize: 10 }} color={
                          s.status === "Completed" ? "success"
                          : s.status === "Processing" ? "warning"
                          : s.status === "Failed" ? "error"
                          : "default"
                        } />
                      </Typography>
                      <Typography variant="h6" fontWeight={700} mt={0.5}>
                        {s.count.toLocaleString("tr-TR")}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* İrsaliye Channel Worker Status */}
        {stats && stats.irsaliyeStatuses && stats.irsaliyeStatuses.length > 0 && (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" mb={2}>İrsaliye İşleme Durumu</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {stats.irsaliyeStatuses.map((s) => (
                  <Card key={s.status} variant="outlined" sx={{ flex: 1, minWidth: 100 }}>
                    <CardContent sx={{ py: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
                      <Typography variant="caption" color="text.secondary">
                        <Chip label={s.status} size="small" sx={{ fontSize: 10 }} color={
                          s.status === "Başarılı" || s.status === "Tamamlandi" ? "success"
                          : s.status === "İşleniyor" ? "warning"
                          : s.status === "Hata Oluştu" ? "error"
                          : "default"
                        } />
                      </Typography>
                      <Typography variant="h6" fontWeight={700} mt={0.5}>
                        {s.count.toLocaleString("tr-TR")}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Queue Details */}
        {stats && stats.queues.length > 0 && (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" mb={2}>Hangfire Kuyruk Detayları</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {stats.queues.map((q) => (
                  <Card key={q.queue} variant="outlined" sx={{ flex: 1, minWidth: 140 }}>
                    <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                      <Typography variant="caption" color="text.secondary">
                        <Chip label={q.queue} size="small" sx={{ fontSize: 10, mr: 0.5 }} />
                      </Typography>
                      <Box mt={0.5}>
                        <Typography variant="body2" fontWeight={600}>
                          Kuyrukta: {q.enqueued.toLocaleString("tr-TR")}
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          İşlenen: {q.fetched.toLocaleString("tr-TR")}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Management Actions */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>Yönetim İşlemleri</Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <Button
                variant="outlined" color="warning" size="small"
                startIcon={actionLoading === "clearQueues" ? <CircularProgress size={14} /> : <DeleteSweepIcon />}
                disabled={actionLoading !== null}
                onClick={() => handleAction("clearQueues", () => clearQueues(user))}
              >
                Kuyruğu Temizle
              </Button>
              <Button
                variant="outlined" color="error" size="small"
                startIcon={actionLoading === "clearFailed" ? <CircularProgress size={14} /> : <ErrorOutlineIcon />}
                disabled={actionLoading !== null}
                onClick={() => handleAction("clearFailed", () => clearFailed(user))}
              >
                Başarısızları Sil
              </Button>
              <Button
                variant="outlined" color="info" size="small"
                startIcon={actionLoading === "resetStuck" ? <CircularProgress size={14} /> : <RestartAltIcon />}
                disabled={actionLoading !== null}
                onClick={() => handleAction("resetStuck", () => resetStuckPackets(user))}
              >
                Takılı Paketleri Sıfırla
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Hangfire Dashboard Iframe */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" mb={2}>Hangfire Dashboard</Typography>
            <Box sx={{ width: "100%", height: 600, border: 1, borderColor: "divider", borderRadius: 1, overflow: "hidden" }}>
              <iframe
                src={STATS_API_URL}
                title="Hangfire Dashboard"
                width="100%"
                height="100%"
                style={{ border: "none" }}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </PageContainer>
  );
}
