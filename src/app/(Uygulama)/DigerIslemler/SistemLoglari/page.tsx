"use client";

import React, { useMemo, useState, useEffect } from "react";
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
  Tabs,
  Tab,
  IconButton,
  Alert
} from "@mui/material";
import {
  IconRefresh,
  IconBug,
  IconTerminal2,
  IconEye,
  IconAlertTriangle,
  IconChevronRight,
  IconDownload,
  IconTrash,
  IconAdjustmentsHorizontal
} from "@tabler/icons-react";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import ProtectedPage from "@/app/ProtectedPage";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { createAuthorizedAxiosConfig } from "@/utils/authSession";
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
import { ENFLASYON_BASE_URL } from "@/config/enflasyonConfig";
import { generateSignature } from "@/utils/crypto";

const BCrumb = [
  { to: "/DigerIslemler", title: "Diger Islemler" },
  { to: "/DigerIslemler/SistemLoglari", title: "Sistem Loglari" },
];

const levelLabelMap: Record<ClientLogLevel, string> = {
  error: "Error",
  warn: "Warn",
  info: "Info",
  debug: "Debug",
};

const sourceLabelMap: Record<ClientLogSource, string> = {
  api: "API", ui: "UI", window: "Window", network: "Network", system: "System",
};

const levelColorMap: Record<ClientLogLevel, "error" | "warning" | "info" | "default"> = {
  error: "error", warn: "warning", info: "info", debug: "default",
};

const formatDate = (isoDate: string) => new Date(isoDate).toLocaleString("tr-TR");

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
  const [activeTab, setActiveTab] = useState(0);

  const isFasAdmin = user?.yetki === "FasAdmin" || user?.rol?.includes("FasAdmin") || false;

  // --- Orijinal Istemci Log States ---
  const [logs, setLogs] = useState<ClientLogEntry[]>([]);
  const [levelFilter, setLevelFilter] = useState<"all" | ClientLogLevel>("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | ClientLogSource>("all");
  const [search, setSearch] = useState("");
  const [selectedClientLog, setSelectedClientLog] = useState<ClientLogEntry | null>(null);

  // --- Orijinal Server Log State (Dialog) ---
  const [serverLogOpen, setServerLogOpen] = useState(false);
  const [serverLogContent, setServerLogContent] = useState("");
  const [loadingServerLog, setLoadingServerLog] = useState(false);

  // --- Yeni Enflasyon Log States ---
  const [enflasyonLogs, setEnflasyonLogs] = useState<string[]>([]);
  const [loadingEnf, setLoadingEnf] = useState(false);
  const [enfError, setEnfError] = useState<string | null>(null);
  const [selectedEnfLog, setSelectedEnfLog] = useState<string | null>(null);

  // Orijinal Istemci Log Aboneligi
  useEffect(() => {
    setLogs(getClientLogs());
    return subscribeClientLogs(() => setLogs(getClientLogs()));
  }, []);

  // Orijinal Sunucu Loglarini Getirme İşlemi
  const handleFetchServerLog = async () => {
    setLoadingServerLog(true);
    setServerLogOpen(true);
    try {
      const response = await axios.get(
        `${url}/Audit/DownloadServerLog`,
        createAuthorizedAxiosConfig({ responseType: "text" }, user.token)
      );
      setServerLogContent(response.data);
    } catch (error: any) {
      console.error("Server log fetch error:", error);
      enqueueSnackbar("Sunucu logları getirilemedi.", { variant: "error" });
      setServerLogOpen(false);
    } finally {
      setLoadingServerLog(false);
    }
  };

  // Enflasyon Loglarini Getirme İşlemi
  const fetchEnflasyonLogs = async (type: "Latest" | "Stdout") => {
    setLoadingEnf(true);
    setEnfError(null);
    try {
      if (!user) throw new Error("Kullanıcı bilgisi bulunamadı.");
      const signature = generateSignature(
        user.kullaniciAdi || "",
        (user.denetciId || 0).toString(),
        (user.id || 0).toString(),
        (user.denetlenenId || 0).toString(),
        (user.yil || 0).toString()
      );
      const enfUrl = `${ENFLASYON_BASE_URL}/Logs/${type}?username=${user.kullaniciAdi}&denetciId=${user.denetciId}&kullaniciId=${user.id}&denetlenenId=${user.denetlenenId}&yil=${user.yil}&signature=${signature}`;
      const response = await fetch(enfUrl, { credentials: "include" });
      const data = await response.json();
      if (data.success) {
        setEnflasyonLogs(data.logs || []);
      } else {
        setEnfError(data.message || "Loglar alınamadı.");
      }
    } catch (err: any) {
      setEnfError("Bağlantı hatası: " + err.message);
    } finally {
      setLoadingEnf(false);
    }
  };

  useEffect(() => {
    if (activeTab === 1) fetchEnflasyonLogs("Latest");
    else if (activeTab === 2) fetchEnflasyonLogs("Stdout");
  }, [activeTab, user]);

  const filteredClientLogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return logs.filter((log) => {
      if (levelFilter !== "all" && log.level !== levelFilter) return false;
      if (sourceFilter !== "all" && log.source !== sourceFilter) return false;
      if (!query) return true;
      const haystack = [log.message, log.route, log.requestPath, log.statusCode?.toString(), log.detail].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [logs, levelFilter, sourceFilter, search]);

  const getEnfLogColor = (log: string) => {
    if (log.includes("[Error]") || log.includes("fail:") || log.includes("Exception")) return "error";
    if (log.includes("[Warning]") || log.includes("warn:")) return "warning";
    if (log.includes("[Information]") || log.includes("info:")) return "info";
    return "default";
  };

  return (
    <ProtectedPage allowed={isFasAdmin}>
      <Breadcrumb title="Sistem Loglari" items={BCrumb} />
      <PageContainer title="Sistem Loglari" description="Sistem ve Enflasyon log takip ekranı">
        <Paper sx={{ mb: 2 }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth" indicatorColor="primary" textColor="primary" sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="İstemci Logları (UI / API)" icon={<IconEye size="20" />} iconPosition="start" />
            <Tab label="Enflasyon Uygulama Logları" icon={<IconBug size="20" />} iconPosition="start" />
            <Tab label="Enflasyon Sunucu Logları" icon={<IconTerminal2 size="20" />} iconPosition="start" />
          </Tabs>
        </Paper>

        {activeTab === 0 && (
          <Stack spacing={2}>
            {/* Orijinal Istemci Log İstatistik ve Butonları */}
            <Paper sx={{ p: 2 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Chip label={`Toplam: ${logs.length}`} variant="outlined" />
                  <Chip label={`Error: ${logs.filter(l => l.level === "error").length}`} color="error" variant="outlined" />
                  <Chip label={`Warn: ${logs.filter(l => l.level === "warn").length}`} color="warning" variant="outlined" />
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <Button variant="outlined" color="info" onClick={handleFetchServerLog}>Sunucu Loglarını Getir</Button>
                  <Button variant="outlined" startIcon={<IconDownload size="18" />} onClick={() => downloadAsJson(filteredClientLogs)} disabled={filteredClientLogs.length === 0}>JSON Dışa Aktar</Button>
                  <Button variant="contained" color="error" startIcon={<IconTrash size="18" />} onClick={() => clearClientLogs()} disabled={logs.length === 0}>Logları Temizle</Button>
                </Stack>
              </Stack>
            </Paper>

            {/* Orijinal Filtre Paneli */}
            <Paper sx={{ p: 2 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Seviye</InputLabel>
                  <Select label="Seviye" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value as any)}>
                    <MenuItem value="all">Tümü</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                    <MenuItem value="warn">Warn</MenuItem>
                    <MenuItem value="info">Info</MenuItem>
                    <MenuItem value="debug">Debug</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Kaynak</InputLabel>
                  <Select label="Kaynak" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as any)}>
                    <MenuItem value="all">Tümü</MenuItem>
                    <MenuItem value="api">API</MenuItem>
                    <MenuItem value="network">Network</MenuItem>
                    <MenuItem value="ui">UI</MenuItem>
                    <MenuItem value="window">Window</MenuItem>
                    <MenuItem value="system">System</MenuItem>
                  </Select>
                </FormControl>
                <TextField size="small" label="Mesaj / Path içinde ara..." value={search} onChange={(e) => setSearch(e.target.value)} fullWidth />
              </Stack>
            </Paper>

            {/* Orijinal Tablo */}
            <Paper sx={{ p: 0 }}>
              <TableContainer sx={{ maxHeight: "60vh" }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Zaman</TableCell>
                      <TableCell>Seviye</TableCell>
                      <TableCell>Kaynak</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Mesaj</TableCell>
                      <TableCell align="right">Detay</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredClientLogs.map((log) => (
                      <TableRow key={log.id} hover>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(log.timestamp)}</TableCell>
                        <TableCell><Chip label={levelLabelMap[log.level]} color={levelColorMap[log.level]} size="small" /></TableCell>
                        <TableCell>{sourceLabelMap[log.source]}</TableCell>
                        <TableCell>{log.statusCode ?? "-"}</TableCell>
                        <TableCell sx={{ maxWidth: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.message}</TableCell>
                        <TableCell align="right"><Button size="small" onClick={() => setSelectedClientLog(log)}>Gör</Button></TableCell>
                      </TableRow>
                    ))}
                    {filteredClientLogs.length === 0 && (
                      <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}>Kayıt bulunamadı.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Stack>
        )}

        {/* --- Enflasyon Log Sekmeleri --- */}
        {(activeTab === 1 || activeTab === 2) && (
          <Stack spacing={2}>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <IconButton onClick={() => fetchEnflasyonLogs(activeTab === 1 ? "Latest" : "Stdout")} color="primary">
                <IconRefresh />
              </IconButton>
            </Box>
            {enfError && <Alert severity="error">{enfError}</Alert>}
            <TableContainer component={Paper} sx={{ maxHeight: "65vh" }}>
              {loadingEnf ? (
                <Box sx={{ p: 5, textAlign: "center" }}><CircularProgress /><Typography sx={{ mt: 2 }}>Loglar getiriliyor...</Typography></Box>
              ) : (
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width="100">Tür</TableCell>
                      <TableCell>Mesaj</TableCell>
                      <TableCell width="50"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {enflasyonLogs.length === 0 ? (
                      <TableRow><TableCell colSpan={3} align="center" sx={{ py: 3 }}>Log kaydı bulunamadı.</TableCell></TableRow>
                    ) : (
                      enflasyonLogs.map((log, i) => (
                        <TableRow key={i} hover>
                          <TableCell>
                            <Chip label={getEnfLogColor(log).toUpperCase()} color={getEnfLogColor(log) as any} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "800px" }}>{log}</TableCell>
                          <TableCell><IconButton size="small" onClick={() => setSelectedEnfLog(log)}><IconChevronRight size="18" /></IconButton></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </TableContainer>
          </Stack>
        )}
      </PageContainer>

      {/* --- Dialoglar --- */}

      {/* Client Log Detail Dialog */}
      <Dialog open={!!selectedClientLog} onClose={() => setSelectedClientLog(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>Log Detayı</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" mb={2}>{selectedClientLog?.message}</Typography>
          <Paper variant="outlined" sx={{ p: 2, backgroundColor: (theme) => theme.palette.mode === "dark" ? "#1e293b" : "#f1f5f9" }}>
            <Box component="pre" sx={{ m: 0, overflowX: "auto", fontSize: 13, fontFamily: 'monospace', whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {selectedClientLog?.detail || "Detay yok"}
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions><Button onClick={() => setSelectedClientLog(null)}>Kapat</Button></DialogActions>
      </Dialog>

      {/* Enflasyon Log Detail Dialog */}
      <Dialog open={!!selectedEnfLog} onClose={() => setSelectedEnfLog(null)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}><IconAlertTriangle color="#ff9800" />Enflasyon Log Detayı</DialogTitle>
        <DialogContent dividers>
          <Box component="pre" sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === "dark" ? "#1e293b" : "#f1f5f9", borderRadius: 1, overflowX: "auto", fontFamily: "monospace", fontSize: "0.9rem", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {selectedEnfLog}
          </Box>
        </DialogContent>
        <DialogActions><Button onClick={() => setSelectedEnfLog(null)}>Kapat</Button></DialogActions>
      </Dialog>

      {/* Orijinal Sunucu İşlem Logları Dialog */}
      <Dialog open={serverLogOpen} onClose={() => setServerLogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Sunucu İşlem Logları (FasWebAPI Son Dosya)</DialogTitle>
        <DialogContent dividers>
          {loadingServerLog ? (
            <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>
          ) : (
            <Paper variant="outlined" sx={{ p: 2, backgroundColor: "#1e1e1e", color: "#d4d4d4" }}>
              <Box component="pre" sx={{ m: 0, overflowX: "auto", fontSize: 13, fontFamily: 'Consolas, monospace', whiteSpace: "pre-wrap", wordBreak: "break-all", maxHeight: "70vh" }}>
                {serverLogContent || "Sunucuda log dosyası bulunamadı."}
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
