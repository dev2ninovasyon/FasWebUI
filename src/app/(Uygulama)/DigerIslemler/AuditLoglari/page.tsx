"use client";

import React, { useState, useEffect } from "react";
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
import { IconRefresh, IconDatabase } from "@tabler/icons-react";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import ProtectedPage from "@/app/ProtectedPage";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useSnackbar } from "notistack";
import { getUserRecentActions, UserActionDto } from "@/api/AnaSayfa/AnaSayfa";

const BCrumb = [
    { to: "/DigerIslemler", title: "Diğer İşlemler" },
    { to: "/DigerIslemler/AuditLoglari", title: "Sistem İşlem Logları" },
];

const formatDate = (isoDate: string) => new Date(isoDate).toLocaleString("tr-TR");

const Page = () => {
    const user = useSelector((state: AppState) => state.userReducer);
    const { enqueueSnackbar } = useSnackbar();
    const isFasAdmin = user?.yetki === "FasAdmin" || user?.rol?.includes("FasAdmin") || false;

    const [auditLogs, setAuditLogs] = useState<UserActionDto[]>([]);
    const [loadingAudit, setLoadingAudit] = useState(false);

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

    useEffect(() => {
        fetchAuditLogs();
    }, [user.denetlenenId, user.yil]);

    return (
        <ProtectedPage allowed={isFasAdmin}>
            <Breadcrumb title="Sistem İşlem Logları" items={BCrumb} />
            <PageContainer title="Sistem İşlem Logları" description="Tüm modüller için kullanıcı işlem geçmişi (Audit)">
                <Stack spacing={2}>
                    <Paper sx={{ p: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" spacing={1} alignItems="center">
                                <IconDatabase size={24} color="#1976d2" />
                                <Typography variant="subtitle1" fontWeight={600}>Audit Logları (Son 150 İşlem)</Typography>
                            </Stack>
                            <IconButton onClick={fetchAuditLogs} color="primary" disabled={loadingAudit}>
                                <IconRefresh />
                            </IconButton>
                        </Stack>
                    </Paper>
                    <TableContainer component={Paper} sx={{ maxHeight: "70vh" }}>
                        {loadingAudit ? (
                            <Box sx={{ p: 5, textAlign: "center" }}>
                                <CircularProgress />
                                <Typography sx={{ mt: 1 }}>Veriler çekiliyor...</Typography>
                            </Box>
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
            </PageContainer>
        </ProtectedPage>
    );
};

export default Page;
