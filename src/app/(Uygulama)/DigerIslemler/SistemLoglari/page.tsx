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
  IconDatabase
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
import { getUserRecentActions, UserActionDto } from "@/api/AnaSayfa/AnaSayfa";

const BCrumb = [
  { to: "/DigerIslemler", title: "Diğer İşlemler" },
  { to: "/DigerIslemler/SistemLoglari", title: "Sistem Logları" },
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

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);

  const isFasAdmin = user?.yetki === "FasAdmin" || user?.rol?.includes("FasAdmin") || false;

  // --- Audit (FasWebAPI) Log States ---
  const [auditLogs, setAuditLogs] = useState<UserActionDto[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // --- Client Log States ---
  const [clientLogs, setClientLogs] = useState<ClientLogEntry[]>([]);
  const [levelFilter, setLevelFilter] = useState<"all" | ClientLogLevel>("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | ClientLogSource>("all");
  const [search, setSearch] = useState("");
  const [selectedClientLog, setSelectedClientLog] = useState<ClientLogEntry | null>(null);

  // --- Server Log State (Dialog) ---
  const [serverLogOpen, setServerLogOpen] = useState(false);
  const [serverLogContent, setServerLogContent] = useState("");
  const [loadingServerLog, setLoadingServerLog] = useState(false);

  // --- Enflasyon Log States ---
  const [enflasyonLogs, setEnflasyonLogs] = useState<string[]>([]);
  const [loadingEnf, setLoadingEnf] = useState(false);
  const [enfError, setEnfError] = useState<string | null>(null);
  const [selectedEnfLog, setSelectedEnfLog] = useState<string | null>(null);

  // Audit Logları Getir
  const fetchAuditLogs = async () => {
    if (!user.id || !user.denetlenenId || !user.yil) return;
    setLoadingAudit(true);
    try {
      const data = await getUserRecentActions(
        user.id,
        user.denetlenenId,
        user.yil,
        150
      );
      setAuditLogs(data || []);
    } catch (err: any) {
      console.error("Audit logs fetch error:", err);
      enqueueSnackbar("Sistem işlem logları getirilemedi.", { variant: "error" });
    } finally {
      setLoadingAudit(false);
    }
  };

  // Client Log Aboneliği
  useEffect(() => {
    setClientLogs(getClientLogs());
    return subscribeClientLogs(() => setClientLogs(getClientLogs()));
  }, []);

  // Sunucu Log Dosyasını Getir (FasWebAPI log-*.txt)
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
      enqueueSnackbar("Sunucu logları dosyası getirilemedi.", { variant: "error" });
      setServerLogOpen(false);
    } finally {
      setLoadingServerLog(false);
    }
  };

  // Enflasyon Loglarını Getir
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
    if (activeTab === 0) fetchAuditLogs();
    else if (activeTab === 2) fetchEnflasyonLogs("Latest");
    else if (activeTab === 3) fetchEnflasyonLogs("Stdout");
  }, [activeTab, user.denetlenenId, user.yil]);

  const filteredClientLogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return clientLogs.filter((log) => {
      if (levelFilter !== "all" && log.level !== levelFilter) return false;
      if (sourceFilter !== "all" && log.source !== sourceFilter) return false;
      if (!query) return true;
      const haystack = [log.message, log.route, log.requestPath, log.statusCode?.toString(), log.detail].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [clientLogs, levelFilter, sourceFilter, search]);

  const getEnfLogColor = (log: string) => {
    if (log.includes("[Error]") || log.includes("fail:") || log.includes("Exception")) return "error";
    if (log.includes("[Warning]") || log.includes("warn:")) return "warning";
    if (log.includes("[Information]") || log.includes("info:")) return "info";
    return "default";
  };

  return (
    <ProtectedPage allowed={isFasAdmin}>
      <Breadcrumb title="Sistem Logları" items={BCrumb} />
      <PageContainer title="Sistem Logları" description="Tüm modüller için merkezi log takip ekranı">
        <Paper sx={{ mb: 2 }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto" indicatorColor="primary" textColor="primary" sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Sistem İşlem Logları (FasWebAPI)" icon={<IconDatabase size="20" />} iconPosition="start" />
            <Tab label="İstemci Logları (UI)" icon={<IconEye size="20" />} iconPosition="start" />
            <Tab label="Enflasyon Uygulama Logları" icon={<IconBug size="20" />} iconPosition="start" />
            <Tab label="Enflasyon Sunucu Logları" icon={<IconTerminal2 size="20" />} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* --- TAB 0: Audit Logs (FasWebAPI) --- */}
        {activeTab === 0 && (
          <Stack spacing={2}>
            <Paper sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" fontWeight={600}>Audit Logları (İşlem Geçmişi)</Typography>
                <IconButton onClick={fetchAuditLogs} color="primary" disabled={loadingAudit}><IconRefresh /></IconButton>
              </Stack>
            </Paper>
            <TableContainer component={Paper} sx={{ maxHeight: "60vh" }}>
              {loadingAudit ? (
                <Box sx={{ p: 5, textAlign: "center" }}><CircularProgress /><Typography sx={{ mt: 1 }}>Veriler çekiliyor...</Typography></Box>
              ) : (
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width="120">Tarih</TableCell>
                      <TableCell width="150">Kullanıcı</TableCell>
                      <TableCell>İşlem / Sayfa</TableCell>
                      <TableCell width="100">Durum</TableCell>
                      <TableCell align="right">Path</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {auditLogs.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell sx={{ fontSize: "0.85rem" }}>{formatDate(item.createdAt)}</TableCell>
                        <TableCell>{item.userName}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip label={item.httpMethod} size="small" variant="outlined" color={item.httpMethod === "POST" ? "primary" : "default"} />
                            <Typography variant="body2" fontWeight={500}>{item.friendlyTitle || item.actionName}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.statusCode}
                            size="small"
                            color={item.isError ? "error" : "success"}
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ color: "text.secondary", fontSize: "0.75rem", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>{item.path}</TableCell>
                      </TableRow>
                    ))}
                    {auditLogs.length === 0 && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}>İşlem kaydı bulunamadı.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              )}
            </TableContainer>
          </Stack>
        )}

        {/* --- TAB 1: Client Logs --- */}
        {activeTab === 1 && (
          <Stack spacing={2}>
            <Paper sx={{ p: 2 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1}>
                  <Chip label={`Toplam: ${clientLogs.length}`} variant="outlined" />
                  <Button variant="outlined" size="small" onClick={handleFetchServerLog}>Sunucu Log Dosyası</Button>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" size="small" color="error" startIcon={<IconTrash size="18" />} onClick={() => clearClientLogs()}>Logları Temizle</Button>
                </Stack>
              </Stack>
              <TextField size="small" label="Loglarda ara (mesaj, path, status...)" value={search} onChange={(e) => setSearch(e.target.value)} fullWidth sx={{ mt: 2 }} />
            </Paper>
            <TableContainer component={Paper} sx={{ maxHeight: "55vh" }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Zaman</TableCell>
                    <TableCell>Tür</TableCell>
                    <TableCell>Mesaj</TableCell>
                    <TableCell align="right">Ayrıntı</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredClientLogs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell sx={{ fontSize: "0.85rem" }}>{formatDate(log.timestamp)}</TableCell>
                      <TableCell><Chip label={log.level.toUpperCase()} color={levelColorMap[log.level]} size="small" /></TableCell>
                      <TableCell sx={{ fontSize: "0.85rem", maxWidth: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.message}</TableCell>
                      <TableCell align="right"><IconButton size="small" onClick={() => setSelectedClientLog(log)}><IconChevronRight size="18" /></IconButton></TableCell>
                    </TableRow>
                  ))}
                  {filteredClientLogs.length === 0 && <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3 }}>İstemci logu bulunamadı.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        )}

        {/* --- TAB 2 & 3: Enflasyon Logs --- */}
        {(activeTab === 2 || activeTab === 3) && (
          <Stack spacing={2}>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <IconButton onClick={() => fetchEnflasyonLogs(activeTab === 2 ? "Latest" : "Stdout")} color="primary">
                <IconRefresh />
              </IconButton>
            </Box>
            {enfError && <Alert severity="error">{enfError}</Alert>}
            <TableContainer component={Paper} sx={{ maxHeight: "65vh" }}>
              {loadingEnf ? (
                <Box sx={{ p: 5, textAlign: "center" }}><CircularProgress /><Typography sx={{ mt: 1 }}>Loglar çekiliyor...</Typography></Box>
              ) : (
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width="120">Tür</TableCell>
                      <TableCell>Mesaj</TableCell>
                      <TableCell width="50"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {enflasyonLogs.map((log, i) => (
                      <TableRow key={i} hover>
                        <TableCell>
                          <Chip
                            label={getEnfLogColor(log).toUpperCase()}
                            color={getEnfLogColor(log) as any}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "800px" }}>{log}</TableCell>
                        <TableCell><IconButton size="small" onClick={() => setSelectedEnfLog(log)}><IconChevronRight size="18" /></IconButton></TableCell>
                      </TableRow>
                    ))}
                    {enflasyonLogs.length === 0 && <TableRow><TableCell colSpan={3} align="center" sx={{ py: 3 }}>Enflasyon projesine ait log bulunamadı.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              )}
            </TableContainer>
          </Stack>
        )}
      </PageContainer>

      {/* --- Modals / Dialogs --- */}
      <Dialog open={!!selectedClientLog} onClose={() => setSelectedClientLog(null)} maxWidth="md" fullWidth>
        <DialogTitle>Log Ayrıntısı</DialogTitle>
        <DialogContent dividers>
          <Box component="pre" sx={{ p: 2, bgcolor: "#f1f1f1", borderRadius: 1, overflowX: "auto", fontSize: 13, fontFamily: "monospace" }}>
            {selectedClientLog?.message}{"\n\n"}{selectedClientLog?.detail || "Ek ayrıntı yok."}
          </Box>
        </DialogContent>
        <DialogActions><Button onClick={() => setSelectedClientLog(null)}>Kapat</Button></DialogActions>
      </Dialog>

      <Dialog open={!!selectedEnfLog} onClose={() => setSelectedEnfLog(null)} maxWidth="lg" fullWidth>
        <DialogTitle>Enflasyon Log Detayı</DialogTitle>
        <DialogContent dividers>
          <Box component="pre" sx={{ p: 2, bgcolor: "#f1f1f1", borderRadius: 1, overflowX: "auto", fontSize: 13, whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
            {selectedEnfLog}
          </Box>
        </DialogContent>
        <DialogActions><Button onClick={() => setSelectedEnfLog(null)}>Kapat</Button></DialogActions>
      </Dialog>

      <Dialog open={serverLogOpen} onClose={() => setServerLogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>FasWebAPI Sunucu Log Dosyası</DialogTitle>
        <DialogContent dividers>
          {loadingServerLog ? (
            <Box sx={{ p: 5, textAlign: "center" }}><CircularProgress /></Box>
          ) : (
            <Box component="pre" sx={{ p: 2, bgcolor: "#1e1e1e", color: "#ddd", borderRadius: 1, overflowX: "auto", fontSize: 12, maxHeight: "70vh", fontFamily: "Consolas, monospace" }}>
              {serverLogContent || "Dosya boş veya sunucuda dosya bulunamadı."}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFetchServerLog} color="primary">Yenile</Button>
          <Button onClick={() => setServerLogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </ProtectedPage>
  );
};

export default Page;
