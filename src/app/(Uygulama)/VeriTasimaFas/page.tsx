// app/data-migration/page.tsx
"use client";

import { useEffect, useState } from "react";
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
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

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
    const [oldCompanies, setOldCompanies] = useState<Company[]>([]);
    const [newCompanies, setNewCompanies] = useState<Company[]>([]);
    const [tables, setTables] = useState<MigrationTableOption[]>([]);

    const [selectedOldCompanyId, setSelectedOldCompanyId] = useState<number | "">("");
    const [selectedNewCompanyId, setSelectedNewCompanyId] = useState<number | "">("");
    const [selectedTableKeys, setSelectedTableKeys] = useState<string[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [results, setResults] = useState<MigrationResult[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [oldRes, newRes, tablesRes] = await Promise.all([
                    fetch("https://localhost:5001/api/DataMigration/old-companies"),
                    fetch("https://localhost:5001/api/DataMigration/new-companies"),
                    fetch("https://localhost:5001/api/DataMigration/tables"),
                ]);

                const oldCompaniesJson = await oldRes.json();
                const newCompaniesJson = await newRes.json();
                const tablesJson = await tablesRes.json();

                setOldCompanies(oldCompaniesJson);
                setNewCompanies(newCompaniesJson);
                setTables(tablesJson);

                if (tablesJson.length === 1) {
                    setSelectedTableKeys([tablesJson[0].key]);
                }
            } catch (error) {
                console.error("Veri yüklenirken hata oluştu:", error);
            }
        };

        loadData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setResults([]);

        if (!selectedOldCompanyId || !selectedNewCompanyId || selectedTableKeys.length === 0) {
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                oldCompanyId: selectedOldCompanyId,
                newCompanyId: selectedNewCompanyId,
                tableKeys: selectedTableKeys,
            };

            const res = await fetch("https://localhost:5001/api/DataMigration/run", {
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
                const displayName = tableOption ? tableOption.displayName : r.tableKey;

                return {
                    key: r.tableKey,
                    displayName,
                    status: r.success ? "success" : "error",
                    message: r.success
                        ? `Başarılı. Eklenen: ${r.insertedCount}`
                        : `Hata: ${r.errorMessage}`,
                };
            });

            setResults(newResults);
        } catch (error: any) {
            const errorResults: MigrationResult[] = selectedTableKeys.map((key) => {
                const tableOption = tables.find((t) => t.key === key);
                return {
                    key,
                    displayName: tableOption ? tableOption.displayName : key,
                    status: "error",
                    message: `Hata: ${error.message}`,
                };
            });
            setResults(errorResults);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Card elevation={3}>
                <CardContent>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
                        Veri Taşıma Paneli
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                        Eski projedeki şirketten, yeni projedeki şirkete seçilen tabloları taşıyabilirsiniz.
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="old-company-label">Eski Şirket (Kaynak)</InputLabel>
                                    <Select
                                        labelId="old-company-label"
                                        value={selectedOldCompanyId}
                                        label="Eski Şirket (Kaynak)"
                                        onChange={(e) => setSelectedOldCompanyId(e.target.value ? Number(e.target.value) : "")}
                                    >
                                        <MenuItem value="">
                                            <em>Seçiniz</em>
                                        </MenuItem>
                                        {oldCompanies.map((c) => (
                                            <MenuItem key={c.id} value={c.id}>
                                                {c.unvan}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="new-company-label">Yeni Şirket (Hedef)</InputLabel>
                                    <Select
                                        labelId="new-company-label"
                                        value={selectedNewCompanyId}
                                        label="Yeni Şirket (Hedef)"
                                        onChange={(e) => setSelectedNewCompanyId(e.target.value ? Number(e.target.value) : "")}
                                    >
                                        <MenuItem value="">
                                            <em>Seçiniz</em>
                                        </MenuItem>
                                        {newCompanies.map((c) => (
                                            <MenuItem key={c.id} value={c.id}>
                                                {c.unvan}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="table-select-label">Taşınacak Veriler</InputLabel>
                                    <Select
                                        labelId="table-select-label"
                                        multiple
                                        value={selectedTableKeys}
                                        label="Taşınacak Veriler"
                                        onChange={(e) => {
                                            const { value } = e.target;
                                            setSelectedTableKeys(typeof value === 'string' ? value.split(',') : value);
                                        }}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => {
                                                    const option = tables.find(t => t.key === value);
                                                    return <Chip key={value} label={option ? option.displayName : value} />;
                                                })}
                                            </Box>
                                        )}
                                    >
                                        {tables.map((t) => (
                                            <MenuItem key={t.key} value={t.key}>
                                                {t.displayName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    fullWidth
                                    disabled={isSubmitting || !selectedOldCompanyId || !selectedNewCompanyId || selectedTableKeys.length === 0}
                                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                                    sx={{ mt: 2, height: 56 }}
                                >
                                    {isSubmitting ? "İşlem Yapılıyor..." : "Seçilen Verileri Taşı"}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>

                    {results.length > 0 && (
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="h6" gutterBottom>
                                İşlem Sonuçları
                            </Typography>
                            <Paper variant="outlined">
                                <List>
                                    {results.map((res, index) => (
                                        <div key={res.key}>
                                            <ListItem>
                                                <ListItemIcon>
                                                    {res.status === "success" ? (
                                                        <CheckCircleIcon color="success" />
                                                    ) : (
                                                        <ErrorIcon color="error" />
                                                    )}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={res.displayName}
                                                    secondary={res.message}
                                                    primaryTypographyProps={{
                                                        color: res.status === "success" ? "success.main" : "error.main",
                                                        fontWeight: "medium",
                                                    }}
                                                />
                                            </ListItem>
                                            {index < results.length - 1 && <Divider />}
                                        </div>
                                    ))}
                                </List>
                            </Paper>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
}
