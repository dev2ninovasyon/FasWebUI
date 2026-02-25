import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CancelIcon from "@mui/icons-material/Cancel";
import { apiFetch } from "@/api/apiBase";
import { enqueueSnackbar } from "notistack";
import type { PendingImportJob } from "../../hooks/usePendingImports";

interface PendingImportDialogProps {
  open: boolean;
  job: PendingImportJob | null;
  onClose: () => void;
  onActionComplete?: (action?: "continue" | "cancel") => void;
}

export const PendingImportDialog: React.FC<PendingImportDialogProps> = ({
  open,
  job,
  onClose,
  onActionComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  if (!job) return null;

  const handleContinue = async () => {
    setLoading(true);
    setActionInProgress("continue");

    try {
      const response = await apiFetch(
        `/DataTransfer/ImportJob/${job.jobId}/Resume`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "continue" }),
        }
      );

      if (response) {
        enqueueSnackbar("âœ… Ä°ÅŸlem devam ediyor...", { variant: "success" });
        onActionComplete?.("continue");
        onClose();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ä°ÅŸlem baÅŸarÄ±sÄ±z";
      enqueueSnackbar(`âŒ Hata: ${errorMessage}`, { variant: "error" });
    } finally {
      setLoading(false);
      setActionInProgress(null);
    }
  };

  const handleCancel = async () => {
    if (
      !window.confirm(
        "âš ï¸ TÃ¼m taÅŸÄ±ma iÅŸlemini iptal etmek istediÄŸinize emin misiniz? Bu iÅŸlem geri alÄ±namaz."
      )
    ) {
      return;
    }

    setLoading(true);
    setActionInProgress("cancel");

    try {
      const response = await apiFetch(
        `/DataTransfer/ImportJob/${job.jobId}/Resume`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "cancel" }),
        }
      );

      if (response) {
        enqueueSnackbar("ğŸ›‘ Ä°ÅŸlem iptal edildi", { variant: "info" });
        onActionComplete?.("cancel");
        onClose();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ä°ÅŸlem baÅŸarÄ±sÄ±z";
      enqueueSnackbar(`âŒ Hata: ${errorMessage}`, { variant: "error" });
    } finally {
      setLoading(false);
      setActionInProgress(null);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <ErrorIcon sx={{ color: "warning.main", fontSize: 28 }} />
        DuraklamÄ±ÅŸ TaÅŸÄ±ma Ä°ÅŸlemi
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* UyarÄ± KartÄ± */}
          <Alert severity="warning" icon={<ErrorIcon />}>
            <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
              Ã–nceki taÅŸÄ±ma iÅŸleminde hata oluÅŸtu!
            </Typography>
            <Typography variant="caption">
              Ä°ÅŸlemi devam ettirebilir veya tamamen iptal edebilirsiniz.
            </Typography>
          </Alert>

          {/* Ä°ÅŸlem DetaylarÄ± */}
          <Box sx={{ backgroundColor: "#f5f5f5", p: 2, borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              ğŸ“Š Ä°ÅŸlem Durumu
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">Tablolar:</Typography>
                <Chip
                  label={`${job.completedTables}/${job.totalTables}`}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">Sorun YaÅŸanan Tablo:</Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", color: "error.main" }}
                >
                  {job.tableDisplayName}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">Durum:</Typography>
                <Chip
                  label={job.status}
                  color="error"
                  size="small"
                  variant="outlined"
                />
              </Box>

              {/* Pending Table Details */}
              <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid #ddd" }}>
                <Typography variant="caption" sx={{ color: "#666", fontWeight: "bold", display: "block", mb: 0.5 }}>
                  ğŸ“‹ {job.tableDisplayName} - Tablo DetaylarÄ±:
                </Typography>

                <Box sx={{ display: "flex", justifyContent: "space-between", ml: 1.5 }}>
                  <Typography variant="caption">Ä°ÅŸlenen KayÄ±t:</Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ fontWeight: "bold", color: "warning.main" }}
                  >
                    {job.pendingTableProcessedRecords}/{job.pendingTableTotalRecords}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", ml: 1.5 }}>
                  <Typography variant="caption">Kalan KayÄ±t:</Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ fontWeight: "bold", color: "error.main" }}
                  >
                    {job.pendingTableTotalRecords - job.pendingTableProcessedRecords}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Hata DetayÄ± */}
          {job.errorMessage && (
            <Alert severity="error">
              <Typography variant="caption" component="div">
                <strong>Hata MesajÄ±:</strong>
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 0.5,
                  wordBreak: "break-word",
                  fontFamily: "monospace",
                }}
              >
                {job.errorMessage}
              </Typography>
            </Alert>
          )}

          {/* SeÃ§enekler AÃ§Ä±klamasÄ± */}
          <Box sx={{ backgroundColor: "#e8f5e9", p: 2, borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              ğŸ”§ Ne Yapabilirim?
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                  âœ… DEVAM ET
                </Typography>
                <Typography variant="caption" sx={{ display: "block", color: "#555", mt: 0.25 }}>
                  {job.tableDisplayName}'Ä± atla, kalan tablolara ({job.totalTables - job.completedTables - 1} adet) devam et.
                </Typography>
                <Typography variant="caption" sx={{ display: "block", color: "#ff9800", fontWeight: "bold", mt: 0.25 }}>
                  âš ï¸ {job.tableDisplayName}'daki {job.pendingTableTotalRecords} kayÄ±t iÅŸlenmeyecek!
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                  ğŸ›‘ Ä°PTAL ET
                </Typography>
                <Typography variant="caption" sx={{ display: "block", color: "#555", mt: 0.25 }}>
                  TÃ¼m iÅŸlemi durdur. Sadece {job.tableDisplayName} tablosu silinir.
                </Typography>
                <Typography variant="caption" sx={{ display: "block", color: "#4caf50", fontWeight: "bold", mt: 0.25 }}>
                  âœ“ {job.completedTables} tablo baÅŸarÄ±lÄ± kaydedilir (kaybolmaz)
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          variant="text"
        >
          Kapat
        </Button>

        <Button
          onClick={handleCancel}
          startIcon={
            actionInProgress === "cancel" ? (
              <CircularProgress size={20} />
            ) : (
              <CancelIcon />
            )
          }
          color="error"
          variant="outlined"
          disabled={loading}
        >
          Ä°ptal Et
        </Button>

        <Button
          onClick={handleContinue}
          startIcon={
            actionInProgress === "continue" ? (
              <CircularProgress size={20} />
            ) : (
              <RestartAltIcon />
            )
          }
          color="success"
          variant="contained"
          disabled={loading}
        >
          Devam Et
        </Button>
      </DialogActions>
    </Dialog>
  );
};


