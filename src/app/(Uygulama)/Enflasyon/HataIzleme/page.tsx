"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  IconRefresh,
  IconTerminal2,
  IconAlertTriangle,
  IconBug,
  IconChevronRight,
} from "@tabler/icons-react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { ENFLASYON_BASE_URL } from "@/config/enflasyonConfig";
import { generateSignature } from "@/utils/crypto";

const BCrumb = [
  {
    to: "/Enflasyon",
    title: "Enflasyon",
  },
  {
    to: "/Enflasyon/HataIzleme",
    title: "Hata İzleme",
  },
];

interface LogResponse {
  success: boolean;
  logs: string[];
  fileName: string;
  message?: string;
}

const HataIzlemePage = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [logType, setLogType] = useState<"Application" | "Stdout">("Application");

  const user = useSelector((state: AppState) => state.userReducer);

  const fetchLogs = async (type: "Application" | "Stdout" = "Application") => {
    setLoading(true);
    setError(null);
    setLogType(type);

    try {
      if (!user) throw new Error("Kullanıcı bilgisi bulunamadı.");

      const signature = generateSignature(
        user.kullaniciAdi || "",
        (user.denetciId || 0).toString(),
        (user.id || 0).toString(),
        (user.denetlenenId || 0).toString(),
        (user.yil || 0).toString()
      );

      const endpoint = type === "Application" ? "Latest" : "Stdout";
      const url = `${ENFLASYON_BASE_URL}/Logs/${endpoint}?username=${user.kullaniciAdi}&denetciId=${user.denetciId}&kullaniciId=${user.id}&denetlenenId=${user.denetlenenId}&yil=${user.yil}&signature=${signature}`;

      const response = await fetch(url, { credentials: "include" });
      const data: LogResponse = await response.json();

      if (data.success) {
        setLogs(data.logs || []);
      } else {
        setError(data.message || "Loglar alınamadı.");
      }
    } catch (err: any) {
      setError("Bağlantı hatası: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user]);

  const getLogColor = (log: string) => {
    if (log.includes("[Error]") || log.includes("fail:") || log.includes("Exception")) return "error";
    if (log.includes("[Warning]") || log.includes("warn:")) return "warning";
    if (log.includes("[Information]") || log.includes("info:")) return "info";
    return "default";
  };

  return (
    <PageContainer title="Hata İzleme" description="Enflasyon Projesi Hata Günlüğü">
      <Breadcrumb title="Hata İzleme" items={BCrumb} />

      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <Button
          variant={logType === "Application" ? "contained" : "outlined"}
          startIcon={<IconBug />}
          onClick={() => fetchLogs("Application")}
        >
          Uygulama Logları
        </Button>
        <Button
          variant={logType === "Stdout" ? "contained" : "outlined"}
          startIcon={<IconTerminal2 />}
          onClick={() => fetchLogs("Stdout")}
        >
          Sunucu (Stdout) Logları
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton onClick={() => fetchLogs(logType)} color="primary">
          <IconRefresh />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 350px)", bgcolor: "background.paper" }}>
        {loading ? (
          <Box sx={{ p: 5, textAlign: "center" }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Loglar getiriliyor...</Typography>
          </Box>
        ) : (
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell width="80">Tür</TableCell>
                <TableCell>Mesaj</TableCell>
                <TableCell width="50"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                    Log kaydı bulunamadı.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Chip
                        label={getLogColor(log).toUpperCase()}
                        color={getLogColor(log) as any}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      fontFamily: "monospace", 
                      fontSize: "0.85rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "800px"
                    }}>
                      {log}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => setSelectedLog(log)}>
                        <IconChevronRight size="18" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Log Detay Modalı */}
      <Dialog open={!!selectedLog} onClose={() => setSelectedLog(null)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconAlertTriangle color="#ff9800" />
          Log Detayı
        </DialogTitle>
        <DialogContent dividers>
          <Box
            component="pre"
            sx={{
              p: 2,
              bgcolor: (theme) => theme.palette.mode === "dark" ? "#1e293b" : "#f1f5f9",
              borderRadius: 1,
              overflowX: "auto",
              fontFamily: "monospace",
              fontSize: "0.9rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all"
            }}
          >
            {selectedLog}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedLog(null)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default HataIzlemePage;
