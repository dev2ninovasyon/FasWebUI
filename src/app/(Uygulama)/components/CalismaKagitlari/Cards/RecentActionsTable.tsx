"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { IconRefresh, IconHistory } from "@tabler/icons-react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getRecentActionsByController, UserActionDto } from "@/api/AnaSayfa/AnaSayfa";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";

interface Props {
  controller: string;
  actionFilter?: string;
  refreshKey?: number;
}

const formatDate = (isoDate: string) => {
  if (!isoDate) return "-";
  return new Date(isoDate).toLocaleString("tr-TR");
};

const RecentActionsTable: React.FC<Props> = ({ controller, actionFilter, refreshKey }) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const [logs, setLogs] = useState<UserActionDto[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    if (!user.denetlenenId || !user.yil || !controller) return;
    setLoading(true);
    try {
      const data = await getRecentActionsByController(
        user.denetlenenId,
        user.yil,
        controller,
        actionFilter,
        20
      );
      setLogs(data || []);
    } catch (error) {
      console.error("Failed to fetch recent actions:", error);
    } finally {
      setLoading(false);
    }
  }, [user.denetlenenId, user.yil, controller]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, refreshKey]);

  return (
    <ParentCard title="Son İşlemler">
      <TableContainer sx={{ minHeight: 200, maxHeight: 400 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tarih</TableCell>
                <TableCell>Kullanıcı</TableCell>
                <TableCell>İşlem</TableCell>
                <TableCell align="center">Durum</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{ fontSize: "0.8rem" }}>
                      {formatDate(log.createdAt)}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.85rem" }}>
                      {log.userName || "Sistem"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.85rem" }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={log.httpMethod}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: "0.7rem" }}
                        />
                        <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                          {log.friendlyMessage || log.actionName || "İşlem"}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={log.statusCode}
                        size="small"
                        color={log.isError ? "error" : "success"}
                        variant="filled"
                        sx={{ height: 20, fontSize: "0.7rem", minWidth: 40 }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    Henüz bir işlem kaydı bulunmuyor.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </ParentCard>
  );
};

export default RecentActionsTable;
