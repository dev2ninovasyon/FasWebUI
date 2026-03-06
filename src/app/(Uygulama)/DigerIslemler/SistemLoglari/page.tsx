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
  IconChevronRight
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

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);

  const isFasAdmin = user?.yetki === "FasAdmin" || user?.rol?.includes("FasAdmin") || false;

  // Client Log States
  const [logs, setLogs] = useState<ClientLogEntry[]>([]);
  const [levelFilter, setLevelFilter] = useState<"all" | ClientLogLevel>("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | ClientLogSource>("all");
  const [search, setSearch] = useState("");
  const [selectedClientLog, setSelectedClientLog] = useState<ClientLogEntry | null>(null);

  // Enflasyon Log States
  const [enflasyonLogs, setEnflasyonLogs] = useState<string[]>([]);
  const [loadingEnf, setLoadingEnf] = useState(false);
  const [enfError, setEnfError] = useState<string | null>(null);
  const [selectedEnfLog, setSelectedEnfLog] = useState<string | null>(null);

  useEffect(() => {
    setLogs(getClientLogs());
    return subscribeClientLogs(() => setLogs(getClientLogs()));
  }, []);

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
      if (data.success) setEnflasyonLogs(data.logs || []);
      else setEnfError(data.message || "Loglar alınamadı.");
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
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth" indicatorColor="primary" textColor="primary">
            <Tab label="İstemci Logları (UI)" icon={<IconEye size="20" />} iconPosition="start" />
            <Tab label="Enflasyon Uygulama Logları" icon={<IconBug size="20" />} iconPosition="start" />
            <Tab label="Enflasyon Sunucu Logları" icon={<IconTerminal2 size="20" />} iconPosition="start" />
          </Tabs>
        </Paper>

        {activeTab === 0 && (
          <Stack spacing={2}>
            <Paper sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1}>
                  <Chip label={`Toplam: ${logs.length}`} variant="outlined" />
                  <Chip label={`Error: ${logs.filter(l => l.level === "error").length}`} color="error" variant="outlined" />
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" color="error" onClick={() => clearClientLogs()} disabled={logs.length === 0}>Loglari Temizle</Button>
                </Stack>
              </Stack>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Stack direction="row" spacing={2}>
                <FormControl size="small" sx={{ minWidth: 150 }}><InputLabel>Seviye</InputLabel><Select label="Seviye" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value as any)}><MenuItem value="all">Tümü</MenuItem><MenuItem value="error">Error</MenuItem><MenuItem value="warn">Warn</MenuItem><MenuItem value="info">Info</MenuItem></Select></FormControl>
                <TextField size="small" label="Ara..." value={search} onChange={(e) => setSearch(e.target.value)} fullWidth />
              </Stack>
            </Paper>
            <TableContainer component={Paper} sx={{ maxHeight: "60vh" }}>
              <Table stickyHeader size="small">
                <TableHead><TableRow><TableCell>Zaman</TableCell><TableCell>Seviye</TableCell><TableCell>Mesaj</TableCell><TableCell align="right">Detay</TableCell></TableRow></TableHead>
                <TableBody>
                  {filteredClientLogs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>{formatDate(log.timestamp)}</TableCell>
                      <TableCell><Chip label={log.level} color={levelColorMap[log.level]} size="small" /></TableCell>
                      <TableCell sx={{ maxWidth: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.message}</TableCell>
                      <TableCell align="right"><Button size="small" onClick={() => setSelectedClientLog(log)}>Gör</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        )}

        {(activeTab === 1 || activeTab === 2) && (
          <Stack spacing={2}>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <IconButton onClick={() => fetchEnflasyonLogs(activeTab === 1 ? "Latest" : "Stdout")} color="primary"><IconRefresh /></IconButton>
            </Box>
            {enfError && <Alert severity="error">{enfError}</Alert>}
            <TableContainer component={Paper} sx={{ maxHeight: "60vh" }}>
              {loadingEnf ? <Box sx={{ p: 5, textAlign: "center" }}><CircularProgress /><Typography>Yükleniyor...</Typography></Box> : (
                <Table stickyHeader size="small">
                  <TableHead><TableRow><TableCell width="100">Tür</TableCell><TableCell>Mesaj</TableCell><TableCell width="50"></TableCell></TableRow></TableHead>
                  <TableBody>
                    {enflasyonLogs.map((log, i) => (
                      <TableRow key={i} hover>
                        <TableCell><Chip label={getEnfLogColor(log).toUpperCase()} color={getEnfLogColor(log) as any} size="small" variant="outlined" /></TableCell>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "800px" }}>{log}</TableCell>
                        <TableCell><IconButton size="small" onClick={() => setSelectedEnfLog(log)}><IconChevronRight size="18" /></IconButton></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TableContainer>
          </Stack>
        )}
      </PageContainer>

      {/* Detay Dialoğu */}
      <Dialog open={!!selectedClientLog || !!selectedEnfLog} onClose={() => { setSelectedClientLog(null); setSelectedEnfLog(null); }} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}><IconAlertTriangle color="#ff9800" /> Log Detayı</DialogTitle>
        <DialogContent dividers>
          <Box component="pre" sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === "dark" ? "#1e293b" : "#f1f5f9", borderRadius: 1, overflowX: "auto", fontFamily: "monospace", fontSize: "0.9rem", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {selectedClientLog ? selectedClientLog.detail : selectedEnfLog}
          </Box>
        </DialogContent>
        <DialogActions><Button onClick={() => { setSelectedClientLog(null); setSelectedEnfLog(null); }}>Kapat</Button></DialogActions>
      </Dialog>
    </ProtectedPage>
  );
};

export default Page;
