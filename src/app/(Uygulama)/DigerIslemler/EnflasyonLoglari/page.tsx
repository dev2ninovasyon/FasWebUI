"use client";

import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
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
    Tabs,
    Tab,
    IconButton,
    Alert
} from "@mui/material";
import {
    IconRefresh,
    IconBug,
    IconTerminal2,
    IconAlertTriangle,
    IconChevronRight
} from "@tabler/icons-react";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import ProtectedPage from "@/app/ProtectedPage";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { ENFLASYON_BASE_URL } from "@/config/enflasyonConfig";
import { generateSignature } from "@/utils/crypto";

const BCrumb = [
    { to: "/DigerIslemler", title: "Diğer İşlemler" },
    { to: "/DigerIslemler/EnflasyonLoglari", title: "Enflasyon Logları" },
];

const Page = () => {
    const user = useSelector((state: AppState) => state.userReducer);
    const [activeTab, setActiveTab] = useState("Latest");

    const isFasAdmin = user?.yetki === "FasAdmin" || user?.rol?.includes("FasAdmin") || false;

    const [enflasyonLogs, setEnflasyonLogs] = useState<string[]>([]);
    const [loadingEnf, setLoadingEnf] = useState(false);
    const [enfError, setEnfError] = useState<string | null>(null);
    const [selectedEnfLog, setSelectedEnfLog] = useState<string | null>(null);

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
        fetchEnflasyonLogs(activeTab as any);
    }, [activeTab, user.denetlenenId, user.yil]);

    const getEnfLogColor = (log: string) => {
        if (log.includes("[Error]") || log.includes("fail:") || log.includes("Exception")) return "error";
        if (log.includes("[Warning]") || log.includes("warn:")) return "warning";
        if (log.includes("[Information]") || log.includes("info:")) return "info";
        return "default";
    };

    return (
        <ProtectedPage allowed={isFasAdmin}>
            <Breadcrumb title="Enflasyon Logları" items={BCrumb} />
            <PageContainer title="Enflasyon Logları" description="Enflasyon projesine ait log takip ekranı">
                <Paper sx={{ mb: 2 }}>
                    <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth" indicatorColor="primary" textColor="primary">
                        <Tab label="Uygulama Logları (Latest)" value="Latest" icon={<IconBug size="20" />} iconPosition="start" />
                        <Tab label="Sunucu Logları (Stdout)" value="Stdout" icon={<IconTerminal2 size="20" />} iconPosition="start" />
                    </Tabs>
                </Paper>

                <Stack spacing={2}>
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <IconButton onClick={() => fetchEnflasyonLogs(activeTab as any)} color="primary">
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
                                                <Chip label={getEnfLogColor(log).toUpperCase()} color={getEnfLogColor(log) as any} size="small" variant="outlined" />
                                            </TableCell>
                                            <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "800px" }}>{log}</TableCell>
                                            <TableCell><IconButton size="small" onClick={() => setSelectedEnfLog(log)}><IconChevronRight size="18" /></IconButton></TableCell>
                                        </TableRow>
                                    ))}
                                    {enflasyonLogs.length === 0 && <TableRow><TableCell colSpan={3} align="center" sx={{ py: 3 }}>Kayıt bulunamadı.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        )}
                    </TableContainer>
                </Stack>
            </PageContainer>

            <Dialog open={!!selectedEnfLog} onClose={() => setSelectedEnfLog(null)} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}><IconAlertTriangle color="#ff9800" />Enflasyon Log Detayı</DialogTitle>
                <DialogContent dividers>
                    <Box component="pre" sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === "dark" ? "#1e293b" : "#f1f5f9", borderRadius: 1, overflowX: "auto", fontSize: 13, whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
                        {selectedEnfLog}
                    </Box>
                </DialogContent>
                <DialogActions><Button onClick={() => setSelectedEnfLog(null)}>Kapat</Button></DialogActions>
            </Dialog>
        </ProtectedPage>
    );
};

export default Page;
