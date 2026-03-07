"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import ProtectedPage from "@/app/ProtectedPage";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  clearClientLogs,
  ClientLogEntry,
  ClientLogLevel,
  ClientLogSource,
  getClientLogs,
  subscribeClientLogs,
} from "@/utils/clientLogStore";
import axios from "axios";
import { url } from "@/api/apiBase";
import { useSnackbar } from "notistack";

const BCrumb = [
  {
    to: "/DigerIslemler",
    title: "Diger Islemler",
  },
  {
    to: "/DigerIslemler/SistemLoglari",
    title: "Sistem Loglari",
  },
];

const levelLabelMap: Record<ClientLogLevel, string> = {
  error: "Error",
  warn: "Warn",
  info: "Info",
  debug: "Debug",
};

const sourceLabelMap: Record<ClientLogSource, string> = {
  api: "API",
  ui: "UI",
  window: "Window",
  network: "Network",
  system: "System",
};

const levelColorMap: Record<ClientLogLevel, "error" | "warning" | "info" | "default"> = {
  error: "error",
  warn: "warning",
  info: "info",
  debug: "default",
};

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleString("tr-TR");
};

const downloadAsJson = (logs: ClientLogEntry[]) => {
  const blob = new Blob([JSON.stringify(logs, null, 2)], {
    type: "application/json",
  });
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  a.href = objectUrl;
  a.download = `fas-client-logs-${timestamp}.json`;
  a.click();
  URL.revokeObjectURL(objectUrl);
};

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const { enqueueSnackbar } = useSnackbar();

  const isFasAdmin =
    user?.yetki === "FasAdmin" || user?.rol?.includes("FasAdmin") || false;

  const [logs, setLogs] = useState<ClientLogEntry[]>([]);
  const [levelFilter, setLevelFilter] = useState<"all" | ClientLogLevel>("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | ClientLogSource>("all");
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<ClientLogEntry | null>(null);

  // Server Log State
  const [serverLogOpen, setServerLogOpen] = useState(false);
  const [serverLogContent, setServerLogContent] = useState("");
  const [loadingServerLog, setLoadingServerLog] = useState(false);

  useEffect(() => {
    setLogs(getClientLogs());
    return subscribeClientLogs(() => {
      setLogs(getClientLogs());
    });
  }, []);

  const handleFetchServerLog = async () => {
    setLoadingServerLog(true);
    setServerLogOpen(true);
    try {
      const response = await axios.get(`${url}/Audit/DownloadServerLog`, {
        responseType: "text",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setServerLogContent(response.data);
    } catch (error: any) {
      console.error("Server log fetch error:", error);
      enqueueSnackbar("Sunucu loglar─▒ getirilemedi.", { variant: "error" });
      setServerLogOpen(false);
    } finally {
      setLoadingServerLog(false);
    }
  };

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return logs.filter((log) => {
      if (levelFilter !== "all" && log.level !== levelFilter) return false;
      if (sourceFilter !== "all" && log.source !== sourceFilter) return false;

      if (!query) return true;

      const haystack = [
        log.message,
        log.route,
        log.requestPath,
        log.statusCode?.toString(),
        log.detail,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [logs, levelFilter, sourceFilter, search]);

  const errorCount = logs.filter((item) => item.level === "error").length;
  const warnCount = logs.filter((item) => item.level === "warn").length;

  return (
    <ProtectedPage allowed={isFasAdmin}>
      <Breadcrumb title="Sistem Loglari" items={BCrumb} />
      <PageContainer title="Sistem Loglari" description="Istemci log kayit ekrani">
        <Stack spacing={2}>
          <Paper sx={{ p: 2 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Chip label={`Toplam: ${logs.length}`} variant="outlined" />
                <Chip label={`Error: ${errorCount}`} color="error" variant="outlined" />
                <Chip label={`Warn: ${warnCount}`} color="warning" variant="outlined" />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button
                  variant="outlined"
                  color="info"
                  onClick={handleFetchServerLog}
                >
                  Sunucu Loglar─▒n─▒ Getir
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => downloadAsJson(filteredLogs)}
                  disabled={filteredLogs.length === 0}
                >
                  JSON Disa Aktar
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => clearClientLogs()}
                  disabled={logs.length === 0}
                >
                  Loglari Temizle
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="level-filter-label">Seviye</InputLabel>
                <Select
                  labelId="level-filter-label"
                  label="Seviye"
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value as "all" | ClientLogLevel)}
                >
                  <MenuItem value="all">Tumu</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="warn">Warn</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="debug">Debug</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="source-filter-label">Kaynak</InputLabel>
                <Select
                  labelId="source-filter-label"
                  label="Kaynak"
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value as "all" | ClientLogSource)}
                >
                  <MenuItem value="all">Tumu</MenuItem>
                  <MenuItem value="api">API</MenuItem>
                  <MenuItem value="network">Network</MenuItem>
                  <MenuItem value="ui">UI</MenuItem>
                  <MenuItem value="window">Window</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                </Select>
              </FormControl>

              <TextField
                size="small"
                label="Mesaj/Path icinde ara"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
              />
            </Stack>
          </Paper>

          <Paper sx={{ p: 0 }}>
            <TableContainer sx={{ maxHeight: "65vh" }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Zaman</TableCell>
                    <TableCell>Seviye</TableCell>
                    <TableCell>Kaynak</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Route</TableCell>
                    <TableCell>API Path</TableCell>
                    <TableCell>Mesaj</TableCell>
                    <TableCell align="right">Detay</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatDate(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={levelLabelMap[log.level]}
                          color={levelColorMap[log.level]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{sourceLabelMap[log.source]}</TableCell>
                      <TableCell>{log.statusCode ?? "-"}</TableCell>
                      <TableCell>{log.route ?? "-"}</TableCell>
                      <TableCell>{log.requestPath ?? "-"}</TableCell>
                      <TableCell sx={{ maxWidth: 420 }}>{log.message}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="text"
                          disabled={!log.detail}
                          onClick={() => setSelectedLog(log)}
                        >
                          Gor
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <Box py={4} textAlign="center">
                          <Typography color="text.secondary">
                            Secili filtre icin log bulunamadi.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Stack>
      </PageContainer>

      {/* Client Log Detail Dialog */}
      <Dialog
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Log Detayi</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" mb={2}>
            {selectedLog?.message}
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, backgroundColor: "grey.100" }}>
            <Box
              component="pre"
              sx={{
                m: 0,
                overflowX: "auto",
                fontSize: 12,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {selectedLog?.detail || "Detay yok"}
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedLog(null)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Server Log Dialog */}
      <Dialog
        open={serverLogOpen}
        onClose={() => setServerLogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Sunucu ─░┼şlem Loglar─▒ (Son Dosya)</DialogTitle>
        <DialogContent dividers>
          {loadingServerLog ? (
            <Box display="flex" justifyContent="center" py={10}>
              <CircularProgress />
            </Box>
          ) : (
            <Paper variant="outlined" sx={{ p: 2, backgroundColor: "#1e1e1e", color: "#d4d4d4" }}>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  overflowX: "auto",
                  fontSize: 13,
                  fontFamily: 'Consolas, "Courier New", monospace',
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  maxHeight: "70vh",
                }}
              >
                {serverLogContent || "Sunucuda log dosyas─▒ bulunamad─▒."}
              </Box>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFetchServerLog} disabled={loadingServerLog}>Yenile</Button>
          <Button onClick={() => setServerLogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </ProtectedPage>
  );
};

export default Page;
