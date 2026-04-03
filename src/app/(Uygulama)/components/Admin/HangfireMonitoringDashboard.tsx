import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Container,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import { apiFetch } from "@/api/apiBase";
import { enqueueSnackbar } from "notistack";

interface ServerStatus {
  name: string;
  workersCount: number;
  queues: string[];
  lastHeartbeat: string;
  isHealthy: boolean;
  uptime: number;
  status: string;
}

interface QueueStats {
  name: string;
  enqueued: number;
  processing: number;
  failed: number;
  succeeded: number;
  scheduled: number;
  total: number;
  priority: string;
}

interface Summary {
  status: string;
  timestamp: string;
  servers: {
    total: number;
    active: number;
    workers: number;
  };
  jobs: {
    enqueued: number;
    processing: number;
    succeeded: number;
    failed: number;
    scheduled: number;
    deleted: number;
  };
  queues: {
    dataImport: any;
    fileImport: any;
    default_: any;
  };
}

const DEFAULT_LOCAL_BACKEND_BASE_URL = "http://localhost:5080";

const getHangfireBaseUrl = () => {
  const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "";
  const normalizedConfiguredBaseUrl = configuredApiBaseUrl.trim().replace(/\/+$/, "");

  if (normalizedConfiguredBaseUrl) {
    return normalizedConfiguredBaseUrl.replace(/\/api$/i, "");
  }

  return DEFAULT_LOCAL_BACKEND_BASE_URL;
};

export default function HangfireMonitoringDashboard() {
  const hangfireBaseUrl = getHangfireBaseUrl();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [servers, setServers] = useState<ServerStatus[]>([]);
  const [queues, setQueues] = useState<QueueStats[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, serversRes, queuesRes, healthRes] = await Promise.all([
        apiFetch("/HangfireMonitoring/summary"),
        apiFetch("/HangfireMonitoring/servers"),
        apiFetch("/HangfireMonitoring/queues"),
        apiFetch("/HangfireMonitoring/health"),
      ]);

      if (!summaryRes.ok || !serversRes.ok || !queuesRes.ok || !healthRes.ok) {
        throw new Error("API yanıtı başarısız");
      }

      const [summaryData, serversData, queuesData, healthData] = await Promise.all([
        summaryRes.json(),
        serversRes.json(),
        queuesRes.json(),
        healthRes.json(),
      ]);

      setSummary(summaryData);
      setServers(serversData.servers || []);
      setQueues(queuesData.queues || []);
      setHealth(healthData);
      setLastUpdated(new Date());

      enqueueSnackbar("Veriler güncellendi", { variant: "success" });
    } catch (error) {
      console.error("Monitoring verisi hatası:", error);
      enqueueSnackbar(
        "Veri yüklemede hata: " + (error instanceof Error ? error.message : "Bilinmeyen hata"),
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh her 10 saniyede bir
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (isHealthy: boolean) => {
    return isHealthy ? "success" : "error";
  };

  const getQueueHealthColor = (stats: any) => {
    if (stats.failed > 0) return "warning";
    if (stats.enqueued > 50) return "info";
    return "success";
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <HealthAndSafetyIcon />
          Hangfire Monitoring
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
          disabled={loading}
        >
          {loading ? "Yükleniyor..." : "Yenile"}
        </Button>
      </Box>

      {health && (
        <Alert severity={health.status === "healthy" ? "success" : "warning"} sx={{ mb: 3 }}>
          {health.message} | Son güncelleme:{" "}
          {lastUpdated?.toLocaleTimeString("tr-TR")}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Summary Cards */}
          {summary && (
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardHeader title="🖥️ Server'lar" />
                  <CardContent>
                    <Typography variant="h4">
                      {summary.servers.active}/{summary.servers.total}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Aktif / Toplam
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Worker'lar: {summary.servers.workers}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardHeader title="⏳ Bekleyen İşler" />
                  <CardContent>
                    <Typography variant="h4" color="info.main">
                      {summary.jobs.enqueued}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Kuyruğa alınmış
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardHeader title="⚙️ İşlenen" />
                  <CardContent>
                    <Typography variant="h4" color="warning.main">
                      {summary.jobs.processing}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Şu anda çalışan
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardHeader title="✅ Başarılı / ❌ Başarısız" />
                  <CardContent>
                    <Typography variant="body2">
                      Başarılı: {summary.jobs.succeeded}
                    </Typography>
                    <Typography variant="body2" color="error.main">
                      Başarısız: {summary.jobs.failed}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Server Status Table */}
          <Card sx={{ mb: 3 }}>
            <CardHeader title="🖥️ Server Durumları" />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell>
                        <strong>Server Adı</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Worker'lar</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Queue'lar</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Uptime (dk)</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Durum</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {servers.map((server, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{server.name}</TableCell>
                        <TableCell align="center">
                          <Chip label={server.workersCount} color="primary" />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            {server.queues.map((q, i) => (
                              <Chip
                                key={i}
                                label={q}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          {server.uptime.toFixed(1)}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={server.status}
                            color={getStatusColor(server.isHealthy)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Queue Status Table */}
          <Card>
            <CardHeader title="📊 Queue Durumları" />
            <CardContent>
              <Grid container spacing={2}>
                {queues.map((queue, idx) => (
                  <Grid size={{ xs: 12, md: 6 }} key={idx}>
                    <Paper sx={{ p: 2, backgroundColor: "#f9f9f9" }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography variant="h6">{queue.name}</Typography>
                        <Chip
                          label={queue.priority}
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      <Grid container spacing={1}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="textSecondary">
                            Bekleyen
                          </Typography>
                          <Typography variant="h5" color="info.main">
                            {queue.enqueued}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="textSecondary">
                            İşlenen
                          </Typography>
                          <Typography variant="h5" color="warning.main">
                            {queue.processing}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="textSecondary">
                            Başarılı
                          </Typography>
                          <Typography variant="h5" color="success.main">
                            {queue.succeeded}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="textSecondary">
                            Başarısız
                          </Typography>
                          <Typography variant="h5" color="error.main">
                            {queue.failed}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Dashboard Links */}
          <Card sx={{ mt: 3 }}>
            <CardHeader title="📈 Hangfire Dashboard Bağlantıları" />
            <CardContent>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  href={`${hangfireBaseUrl}/hangfire`}
                  target="_blank"
                >
                  Ana Dashboard
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  href={`${hangfireBaseUrl}/hangfire/data-import`}
                  target="_blank"
                >
                  Data Import Queue
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  href={`${hangfireBaseUrl}/hangfire/file-import`}
                  target="_blank"
                >
                  File Import Queue
                </Button>
                <Button
                  variant="contained"
                  color="info"
                  href={`${hangfireBaseUrl}/hangfire/default`}
                  target="_blank"
                >
                  Default Queue
                </Button>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
}
