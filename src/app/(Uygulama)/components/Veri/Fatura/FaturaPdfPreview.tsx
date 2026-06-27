"use client";
import React from "react";
import { Dialog, DialogContent, DialogTitle, IconButton, Typography, Box, Button, CircularProgress, Stack } from "@mui/material";
import { IconX, IconDownload } from "@tabler/icons-react";

interface FaturaPdfPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewUrl: string | null;
  loading: boolean;
  dosyaAdi?: string;
  onDownload?: () => void;
}

export function FaturaPdfPreview({ open, onOpenChange, previewUrl, loading, dosyaAdi, onDownload }: FaturaPdfPreviewProps) {
  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} maxWidth={false} fullWidth sx={{ "& .MuiDialog-paper": { width: "95vw", height: "92vh", maxWidth: "95vw" } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" px={2} py={1} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Box>
          <DialogTitle sx={{ p: 0, fontSize: 14, fontWeight: 600 }}>Fatura Önizleme</DialogTitle>
          <Typography variant="caption" color="text.secondary">{dosyaAdi || "Dosya hazırlanıyor"}</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" startIcon={<IconDownload size={16} />} onClick={onDownload} disabled={!previewUrl || loading}>
            İndir
          </Button>
          <IconButton size="small" onClick={() => onOpenChange(false)}><IconX size={18} /></IconButton>
        </Stack>
      </Stack>
      <DialogContent sx={{ p: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "grey.100", overflow: "auto", flex: 1 }}>
        {loading ? (
          <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
            <CircularProgress size={20} />
            <Typography>Hazırlanıyor</Typography>
          </Stack>
        ) : previewUrl ? (
          <iframe title="Fatura Önizleme" src={previewUrl} style={{ width: "100%", height: "82vh", border: "none", backgroundColor: "white" }} />
        ) : (
          <Typography color="text.secondary">Önizlenecek içerik bulunamadı</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
