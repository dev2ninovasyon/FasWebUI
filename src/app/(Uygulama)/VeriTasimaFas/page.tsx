"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Typography,
    CircularProgress,
    Container,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Paper,
    Stepper,
    Step,
    StepLabel,
    IconButton,
    Tooltip,
    Fade,
    useTheme,
    Alert,
    LinearProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import CloudSyncIcon from "@mui/icons-material/CloudSync";
import BusinessIcon from "@mui/icons-material/Business";
import StorageIcon from "@mui/icons-material/Storage";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RefreshIcon from "@mui/icons-material/Refresh";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/api/apiBase";
import MigrationConfirmDialog from "@/app/(Uygulama)/components/DataMigration/MigrationConfirmDialog";

const steps = ["Şirket Seçimi", "Tablo Seçimi", "Onay ve Taşıma"];

type Company = {
    id: number;
    unvan: string;
};

type MigrationTableOption = {
    key: string;
    displayName: string;
};

type MigrationResult = {
    key: string;
    displayName: string;
    status: "success" | "error";
    message: string;
};

export default function DataMigrationPage() {
    const theme = useTheme();
    const [activeStep, setActiveStep] = useState(0);

    const [oldCompanies, setOldCompanies] = useState<Company[]>([]);
    const [newCompanies, setNewCompanies] = useState<Company[]>([]);
    const [tables, setTables] = useState<MigrationTableOption[]>([]);

    const [selectedOldCompanyId, setSelectedOldCompanyId] = useState<number | "">("");
    const [selectedNewCompanyId, setSelectedNewCompanyId] = useState<number | "">("");
    const [selectedYears, setSelectedYears] = useState<number[]>([]);
    const [selectedTableKeys, setSelectedTableKeys] = useState<string[]>([]);

    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [loadingYears, setLoadingYears] = useState(false);

    const [loadingData, setLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [results, setResults] = useState<MigrationResult[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

    const loadData = useCallback(async () => {
        setLoadingData(true);
        setErrorMsg(null);
        try {
            const [oldRes, newRes, tablesRes] = await Promise.all([
                apiFetch("/DataMigration/old-companies"),
                apiFetch("/DataMigration/new-companies"),
                apiFetch("/DataMigration/tables"),
            ]);

            if (oldRes.ok && newRes.ok && tablesRes.ok) {
                const [oldData, newData, tablesData] = await Promise.all([
                    oldRes.json(),
                    newRes.json(),
                    tablesRes.json(),
                ]);
                setOldCompanies(oldData || []);
                setNewCompanies(newData || []);
                setTables(tablesData || []);
            } else {
                throw new Error("Veriler yüklenirken bir hata oluştu.");
            }
        } catch (error: any) {
            console.error("Veri yükleme hatası:", error);
            setErrorMsg("Backend'e ulaşılamıyor veya veriler çekilemedi.");
        } finally {
            setLoadingData(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        const fetchYears = async () => {
            if (selectedOldCompanyId) {
                setLoadingYears(true);
                setSelectedYears([]);
                try {
                    const res = await apiFetch(`/DataMigration/old-company-years/${selectedOldCompanyId}`);
                    if (res.ok) {
                        const data = await res.json();
                        setAvailableYears(data || []);
                    }
                } catch (error) {
                    console.error("Yıl çekme hatası:", error);
                } finally {
                    setLoadingYears(false);
                }
            } else {
                setAvailableYears([]);
                setSelectedYears([]);
            }
        };

        fetchYears();
    }, [selectedOldCompanyId]);

    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);
    const handleReset = () => {
        setActiveStep(0);
        setSelectedTableKeys([]);
        setResults([]);
    };

    const handleStartMigration = () => {
        setOpenConfirmDialog(true);
    };

    const handleConfirmMigration = async () => {
        setOpenConfirmDialog(false);
        await handleSubmit();
    };

    const handleSubmit = async () => {
        if (!selectedOldCompanyId || !selectedNewCompanyId || selectedTableKeys.length === 0) return;

        setIsSubmitting(true);
        setResults([]);
        try {
            const payload = {
                oldCompanyId: selectedOldCompanyId,
                newCompanyId: selectedNewCompanyId,
                years: selectedYears,
                tableKeys: selectedTableKeys,
            };

            const res = await apiFetch("/DataMigration/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.text();
                throw new Error(err);
            }

            const data = await res.json();
            const newResults: MigrationResult[] = data.results.map((r: any) => {
                const tableOption = tables.find((t) => t.key === r.tableKey);
                return {
                    key: r.tableKey,
                    displayName: tableOption ? tableOption.displayName : r.tableKey,
                    status: r.success ? "success" : "error",
                    message: r.success
                        ? `Başarılı. Eklenen: ${r.insertedCount}`
                        : `Hata: ${r.errorMessage}`,
                };
            });
            setResults(newResults);
            handleNext();
        } catch (error: any) {
            setErrorMsg(`Taşıma işlemi sırasında hata: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isStepSkiped = (step: number) => false;

    const MotionCard = motion(Card);

    // Form validation for next buttons
    const step1Valid = selectedOldCompanyId !== "" && selectedNewCompanyId !== "" && selectedYears.length > 0;
    const step2Valid = selectedTableKeys.length > 0;

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box textAlign="center" mb={6}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Typography variant="h3" fontWeight="800" sx={{
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        mb: 1
                    }}>
                        Fas Veri Taşıma Asistanı
                    </Typography>
                    <Typography variant="body1" color="text.secondary" maxWidth="600px" mx="auto">
                        Eski projelerinizdeki verileri güvenle yeni mimariye taşıyın.
                    </Typography>
                </motion.div>
            </Box>

            <Stepper activeStep={activeStep} sx={{ mb: 6 }} alternativeLabel>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <AnimatePresence mode="wait">
                {errorMsg && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{ marginBottom: "2rem" }}
                    >
                        <Alert
                            severity="error"
                            action={
                                <Button color="inherit" size="small" onClick={loadData} startIcon={<RefreshIcon />}>
                                    Yenile
                                </Button>
                            }
                        >
                            {errorMsg}
                        </Alert>
                    </motion.div>
                )}

                {loadingData ? (
                    <Box display="flex" flexDirection="column" alignItems="center" py={10}>
                        <CircularProgress size={60} thickness={4} />
                        <Typography variant="body1" sx={{ mt: 2, color: "text.secondary" }}>
                            Sistem verileri yükleniyor...
                        </Typography>
                    </Box>
                ) : (
                    <MotionCard
                        key={activeStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        elevation={0}
                        sx={{
                            borderRadius: 4,
                            background: "rgba(255, 255, 255, 0.02)",
                            backdropFilter: "blur(10px)",
                            border: `1px solid ${theme.palette.divider}`,
                            overflow: "visible"
                        }}
                    >
                        <CardContent sx={{ p: 4 }}>
                            {activeStep === 0 && (
                                <Box>
                                    <Typography variant="h6" display="flex" alignItems="center" mb={4} sx={{ color: 'text.primary', fontWeight: 600 }}>
                                        <BusinessIcon sx={{ mr: 1, color: "primary.main" }} /> Kaynak ve Hedef Şirketler
                                    </Typography>
                                    <Grid container spacing={3} sx={{ width: '100%', m: 0 }}>
                                        <Grid size={{ xs: 12, md: 6 }} sx={{ pl: '0 !important', pt: '0 !important', mb: { xs: 2, md: 0 } }}>
                                            <FormControl fullWidth variant="outlined" sx={{ minWidth: 200 }}>
                                                <InputLabel id="old-company-label">Eski Şirket (Kaynak)</InputLabel>
                                                <Select
                                                    labelId="old-company-label"
                                                    value={selectedOldCompanyId}
                                                    label="Eski Şirket (Kaynak)"
                                                    onChange={(e) => setSelectedOldCompanyId(Number(e.target.value))}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    <MenuItem value=""><em>Seçiniz</em></MenuItem>
                                                    {oldCompanies.map((c) => (
                                                        <MenuItem key={c.id} value={c.id}>{c.unvan}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }} sx={{ pl: { xs: 0, md: 2 } + ' !important', pt: '0 !important' }}>
                                            <FormControl fullWidth variant="outlined" sx={{ minWidth: 200 }}>
                                                <InputLabel id="new-company-label">Yeni Şirket (Hedef)</InputLabel>
                                                <Select
                                                    labelId="new-company-label"
                                                    value={selectedNewCompanyId}
                                                    label="Yeni Şirket (Hedef)"
                                                    onChange={(e) => setSelectedNewCompanyId(Number(e.target.value))}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    <MenuItem value=""><em>Seçiniz</em></MenuItem>
                                                    {newCompanies.map((c) => (
                                                        <MenuItem key={c.id} value={c.id}>{c.unvan}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid size={{ xs: 12 }} sx={{ pl: '0 !important', pt: '2 !important' }}>
                                            <FormControl fullWidth variant="outlined" disabled={!selectedOldCompanyId || loadingYears}>
                                                <InputLabel id="year-select-label">
                                                    {loadingYears ? "Yıllar Yükleniyor..." : "Taşınacak Yıllar"}
                                                </InputLabel>
                                                <Select
                                                    labelId="year-select-label"
                                                    multiple
                                                    value={selectedYears}
                                                    label={loadingYears ? "Yıllar Yükleniyor..." : "Taşınacak Yıllar"}
                                                    onChange={(e) => {
                                                        const { value } = e.target;
                                                        setSelectedYears(typeof value === 'string' ? value.split(',').map(Number) : value as number[]);
                                                    }}
                                                    renderValue={(selected) => (
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                            {selected.map((value) => (
                                                                <Chip key={value} label={value} size="small" />
                                                            ))}
                                                        </Box>
                                                    )}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    {availableYears.length > 0 ? (
                                                        availableYears.map((year) => (
                                                            <MenuItem key={year} value={year}>{year}</MenuItem>
                                                        ))
                                                    ) : (
                                                        <MenuItem disabled>Veri bulunan yıl yok</MenuItem>
                                                    )}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                    <Box mt={6} display="flex" justifyContent="flex-end">
                                        <Button
                                            disabled={!step1Valid}
                                            variant="contained"
                                            size="large"
                                            onClick={handleNext}
                                            endIcon={<ArrowForwardIcon />}
                                            sx={{
                                                borderRadius: 3,
                                                px: 4,
                                                py: 1.5,
                                                boxShadow: theme.shadows[4],
                                                textTransform: 'none',
                                                fontWeight: 600
                                            }}
                                        >
                                            Sonraki Adım
                                        </Button>
                                    </Box>
                                </Box>
                            )}

                            {activeStep === 1 && (
                                <Box>
                                    <Typography variant="h6" display="flex" alignItems="center" mb={4}>
                                        <StorageIcon sx={{ mr: 1, color: "primary.main" }} /> Taşınacak Tablolar
                                    </Typography>
                                    <Box display="flex" flexWrap="wrap" gap={2} mb={4}>
                                        {tables.map((table) => (
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} key={table.key}>
                                                <Chip
                                                    label={table.displayName}
                                                    clickable
                                                    color={selectedTableKeys.includes(table.key) ? "primary" : "default"}
                                                    variant={selectedTableKeys.includes(table.key) ? "filled" : "outlined"}
                                                    onClick={() => {
                                                        setSelectedTableKeys(prev =>
                                                            prev.includes(table.key)
                                                                ? prev.filter(k => k !== table.key)
                                                                : [...prev, table.key]
                                                        );
                                                    }}
                                                    sx={{ py: 2, px: 1, borderRadius: 2, height: "40px", fontSize: "1rem" }}
                                                />
                                            </motion.div>
                                        ))}
                                    </Box>
                                    <Box mt={4} display="flex" justifyContent="space-between">
                                        <Button
                                            variant="outlined"
                                            size="large"
                                            onClick={handleBack}
                                            startIcon={<ArrowBackIcon />}
                                            sx={{ borderRadius: 2, px: 4 }}
                                        >
                                            Geri
                                        </Button>
                                        <Button
                                            disabled={!step2Valid}
                                            variant="contained"
                                            size="large"
                                            onClick={handleNext}
                                            endIcon={<ArrowForwardIcon />}
                                            sx={{ borderRadius: 2, px: 4 }}
                                        >
                                            İncele ve Başlat
                                        </Button>
                                    </Box>
                                </Box>
                            )}

                            {activeStep === 2 && (
                                <Box>
                                    <Typography variant="h6" display="flex" alignItems="center" mb={4}>
                                        <CloudSyncIcon sx={{ mr: 1, color: "primary.main" }} /> Taşıma Özeti
                                    </Typography>

                                    <Paper variant="outlined" sx={{ p: 3, mb: 4, bgcolor: "rgba(0,0,0,0.02)", borderRadius: 3 }}>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, sm: 4 }}>
                                                <Typography variant="caption" color="text.secondary">Kaynak Şirket</Typography>
                                                <Typography fontWeight="700">
                                                    {oldCompanies.find(c => c.id === selectedOldCompanyId)?.unvan || "-"}
                                                </Typography>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 4 }}>
                                                <Typography variant="caption" color="text.secondary">Hedef Şirket</Typography>
                                                <Typography fontWeight="700">
                                                    {newCompanies.find(c => c.id === selectedNewCompanyId)?.unvan || "-"}
                                                </Typography>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 4 }}>
                                                <Typography variant="caption" color="text.secondary">Seçilen Tablolar</Typography>
                                                <Typography fontWeight="700">{selectedTableKeys.length} Tablo</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 4 }}>
                                                <Typography variant="caption" color="text.secondary">Seçilen Yıllar</Typography>
                                                <Typography fontWeight="700">{selectedYears.join(', ')}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>

                                    {isSubmitting && (
                                        <Box mb={4}>
                                            <Typography variant="body2" gutterBottom align="center">Veriler taşınıyor, lütfen bekleyiniz...</Typography>
                                            <LinearProgress />
                                        </Box>
                                    )}

                                    <Box display="flex" justifyContent="space-between">
                                        <Button
                                            disabled={isSubmitting}
                                            variant="outlined"
                                            size="large"
                                            onClick={handleBack}
                                            startIcon={<ArrowBackIcon />}
                                            sx={{ borderRadius: 2, px: 4 }}
                                        >
                                            Vazgeç
                                        </Button>
                                        <Button
                                            disabled={isSubmitting}
                                            variant="contained"
                                            color="success"
                                            size="large"
                                            onClick={handleStartMigration}
                                            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                                            sx={{ borderRadius: 2, px: 4, fontWeight: "bold" }}
                                        >
                                            Şimdi Taşıyı Başlat
                                        </Button>
                                    </Box>
                                </Box>
                            )}

                            {activeStep === 3 && (
                                <Box textAlign="center" py={4}>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                    >
                                        <CheckCircleIcon color="success" sx={{ fontSize: 100, mb: 2 }} />
                                    </motion.div>
                                    <Typography variant="h4" fontWeight="800" gutterBottom>
                                        İşlem Tamamlandı!
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" mb={4}>
                                        Veri taşıma süreci sona erdi. Aşağıdaki sonuçları inceleyebilirsiniz.
                                    </Typography>

                                    <Paper variant="outlined" sx={{ mb: 4, borderRadius: 3, mx: "auto", maxWidth: "600px", overflow: "hidden" }}>
                                        <List disablePadding>
                                            {results.map((res, index) => (
                                                <ListItem key={res.key} divider={index < results.length - 1}>
                                                    <ListItemIcon>
                                                        {res.status === "success" ? <CheckCircleIcon color="success" /> : <ErrorIcon color="error" />}
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={res.displayName}
                                                        secondary={res.message}
                                                        primaryTypographyProps={{ fontWeight: "bold" }}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Paper>

                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={handleReset}
                                        startIcon={<RefreshIcon />}
                                        sx={{ borderRadius: 2, px: 6 }}
                                    >
                                        Yeni İşlem Başlat
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </MotionCard>
                )}
            </AnimatePresence>
        </Container>

        <MigrationConfirmDialog
            open={openConfirmDialog}
            selectedTables={tables.filter(t => selectedTableKeys.includes(t.key))}
            onConfirm={handleConfirmMigration}
            onCancel={() => setOpenConfirmDialog(false)}
            isLoading={isSubmitting}
            autoConfirmSeconds={0}
        />
    );
}
