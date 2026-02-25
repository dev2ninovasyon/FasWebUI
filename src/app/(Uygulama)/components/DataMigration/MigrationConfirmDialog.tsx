"use client";

import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    LinearProgress,
    Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import { motion } from "framer-motion";

interface MigrationTableOption {
    key: string;
    displayName: string;
}

interface MigrationConfirmDialogProps {
    open: boolean;
    selectedTables: MigrationTableOption[];
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    autoConfirmSeconds?: number; // örneğin 30 saniye
}

export default function MigrationConfirmDialog({
    open,
    selectedTables,
    onConfirm,
    onCancel,
    isLoading = false,
    autoConfirmSeconds = 0, // 0 = kapalı
}: MigrationConfirmDialogProps) {
    const [remainingSeconds, setRemainingSeconds] = useState(autoConfirmSeconds);
    const [autoConfirmTriggered, setAutoConfirmTriggered] = useState(false);

    // Auto-confirm timer
    useEffect(() => {
        if (!open || autoConfirmSeconds <= 0 || autoConfirmTriggered) {
            return;
        }

        setRemainingSeconds(autoConfirmSeconds);
        const interval = setInterval(() => {
            setRemainingSeconds((prev) => {
                if (prev <= 1) {
                    setAutoConfirmTriggered(true);
                    onConfirm();
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [open, autoConfirmSeconds, autoConfirmTriggered, onConfirm]);

    // Reset states when dialog closes
    useEffect(() => {
        if (!open) {
            setAutoConfirmTriggered(false);
            setRemainingSeconds(autoConfirmSeconds);
        }
    }, [open, autoConfirmSeconds]);

    const handleCancelClick = () => {
        setAutoConfirmTriggered(false);
        onCancel();
    };

    const handleConfirmClick = () => {
        setAutoConfirmTriggered(false);
        onConfirm();
    };

    return (
        <Dialog
            open={open}
            onClose={handleCancelClick}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                }
            }}
        >
            <DialogTitle sx={{ pb: 1, fontWeight: "bold", fontSize: "1.25rem" }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <InfoIcon color="primary" />
                    Veri Taşıma Onayı
                </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                        Aşağıdaki veriler yeni sisteme taşınacaktır. Devam etmek istiyor musunuz?
                    </Typography>

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            mb: 3,
                            maxHeight: "300px",
                            overflow: "auto",
                            bgcolor: "rgba(0, 0, 0, 0.02)",
                            borderRadius: 2,
                        }}
                    >
                        <List disablePadding>
                            {selectedTables.map((table, index) => (
                                <motion.div
                                    key={table.key}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <ListItem
                                        disableGutters
                                        sx={{
                                            py: 1,
                                            px: 2,
                                            borderRadius: 1,
                                            mb: 0.5,
                                            bgcolor: "rgba(25, 118, 210, 0.05)",
                                            "&:hover": {
                                                bgcolor: "rgba(25, 118, 210, 0.1)",
                                            }
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 32 }}>
                                            <CheckCircleIcon
                                                sx={{
                                                    color: "success.main",
                                                    fontSize: "1.2rem"
                                                }}
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={table.displayName}
                                            primaryTypographyProps={{
                                                fontWeight: 500,
                                                fontSize: "0.95rem"
                                            }}
                                        />
                                    </ListItem>
                                </motion.div>
                            ))}
                        </List>
                    </Paper>

                    <Box
                        sx={{
                            p: 2,
                            bgcolor: "rgba(25, 118, 210, 0.1)",
                            border: "1px solid",
                            borderColor: "rgba(25, 118, 210, 0.3)",
                            borderRadius: 2,
                            mb: 2,
                        }}
                    >
                        <Typography variant="body2" sx={{ color: "rgba(25, 60, 110, 0.9)" }} fontWeight={500}>
                            💡 {selectedTables.length} tablo başarıyla taşınacak
                        </Typography>
                        {autoConfirmSeconds > 0 && !autoConfirmTriggered && (
                            <Typography variant="caption" sx={{ color: "rgba(25, 60, 110, 0.8)", mt: 1 }} display="block">
                                ⏱️ Onay yapılmazsa {remainingSeconds} saniye sonra otomatik olarak başlanacak.
                            </Typography>
                        )}
                    </Box>

                    {remainingSeconds > 0 && autoConfirmSeconds > 0 && !autoConfirmTriggered && (
                        <Box sx={{ mb: 2 }}>
                            <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                mb={1}
                            >
                                <Typography variant="caption" color="text.secondary">
                                    Otomatik başlama sayacı:
                                </Typography>
                                <Chip
                                    label={`${remainingSeconds}s`}
                                    size="small"
                                    variant="outlined"
                                    color="warning"
                                    icon={undefined}
                                />
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={(remainingSeconds / autoConfirmSeconds) * 100}
                                sx={{ height: 4, borderRadius: 2 }}
                            />
                        </Box>
                    )}
                </motion.div>
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button
                    onClick={handleCancelClick}
                    variant="outlined"
                    disabled={isLoading}
                    sx={{ borderRadius: 2 }}
                >
                    İptal
                </Button>
                <Button
                    onClick={handleConfirmClick}
                    variant="contained"
                    color="success"
                    disabled={isLoading}
                    sx={{ borderRadius: 2, fontWeight: "bold" }}
                >
                    {isLoading ? "İşleniyor..." : "Onayla"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
