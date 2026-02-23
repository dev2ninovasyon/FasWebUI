"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

interface SessionWarningDialogProps {
  open: boolean;
  secondsRemaining: number;
  onKeepSession: () => void;
  onLogout: () => void;
  maxSeconds?: number;
}

const WarningBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(237, 108, 0, 0.15)' 
    : 'rgba(237, 108, 0, 0.1)',
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
}));

const CountdownBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.mode === 'dark'
    ? 'rgba(237, 108, 0, 0.08)'
    : 'rgba(237, 108, 0, 0.05)',
  border: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(237, 108, 0, 0.4)' : 'rgba(237, 108, 0, 0.3)'}`,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
}));

export default function SessionWarningDialog({
  open,
  secondsRemaining,
  onKeepSession,
  onLogout,
  maxSeconds = 60,
}: SessionWarningDialogProps) {
  const [isCountingDown, setIsCountingDown] = useState(false);
  const progressPercentage = (secondsRemaining / maxSeconds) * 100;

  useEffect(() => {
    if (open) {
      setIsCountingDown(true);
    }
  }, [open]);

  // Auto logout when time runs out
  useEffect(() => {
    if (open && secondsRemaining <= 0) {
      setIsCountingDown(false);
      // Wait a moment then logout
      const timeout = setTimeout(() => {
        onLogout();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [open, secondsRemaining, onLogout]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const handleKeepSession = () => {
    setIsCountingDown(false);
    onKeepSession();
  };

  const handleLogout = () => {
    setIsCountingDown(false);
    onLogout();
  };

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        // Prevent closing by clicking backdrop
        if (reason === "backdropClick") {
          return;
        }
      }}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 12px 48px rgba(0, 0, 0, 0.25)",
          backgroundColor: (theme) => 
            theme.palette.mode === 'dark' 
              ? 'rgba(20, 25, 35, 0.95)'
              : 'rgba(255, 255, 255, 0.98)',
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: (theme) => theme.palette.mode === 'dark' 
            ? 'rgba(237, 108, 0, 0.2)'
            : 'rgba(237, 108, 0, 0.12)',
          color: (theme) => theme.palette.mode === 'dark'
            ? '#ED6C00'
            : '#D66B00',
          fontWeight: 700,
          fontSize: "1.35rem",
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderBottom: (theme) => `1px solid ${
            theme.palette.mode === 'dark' 
              ? 'rgba(237, 108, 0, 0.15)'
              : 'rgba(237, 108, 0, 0.1)'
          }`,
        }}
      >
        <WarningAmberIcon sx={{ fontSize: "1.5rem" }} />
        Oturum Zaman Aşımı
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={2}>
          {/* Warning Alert */}
          <Alert severity="warning" icon={false}>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
              ⚠️ Belirtilen süredir işlem yapmıyorsunuz
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Güvenliğiniz için oturumunuz kapatılacaktır.
            </Typography>
          </Alert>

          {/* Countdown Display */}
          <CountdownBox>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 500, color: "text.secondary" }}
            >
              Oturumu kapatılmaya kadar kalan süre:
            </Typography>
            <Box
              sx={{
                fontSize: "48px",
                fontWeight: "bold",
                color: "warning.main",
                lineHeight: 1,
              }}
            >
              {timeString}
            </Box>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", textAlign: "center" }}
            >
              {secondsRemaining === 1
                ? "1 saniye kaldı"
                : `${secondsRemaining} saniye kaldı`}
            </Typography>
          </CountdownBox>

          {/* Progress Bar */}
          <Box>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "action.disabled",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: progressPercentage > 30 ? "warning.main" : "error.main",
                  borderRadius: 4,
                },
              }}
            />
          </Box>

          {/* Instructions */}
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", textAlign: "center" }}
          >
            Oturumunuzu devam ettirmek için "Oturumu Devam Et" düğmesine tıklayınız.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          padding: 2,
          gap: 1,
          backgroundColor: "action.hover",
        }}
      >
        <Button
          onClick={handleLogout}
          variant="outlined"
          color="inherit"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderColor: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(237, 108, 0, 0.3)'
              : 'rgba(237, 108, 0, 0.2)',
            color: (theme) => theme.palette.mode === 'dark'
              ? '#ED6C00'
              : '#D66B00',
            '&:hover': {
              backgroundColor: (theme) => theme.palette.mode === 'dark'
                ? 'rgba(237, 108, 0, 0.1)'
                : 'rgba(237, 108, 0, 0.08)',
            }
          }}
        >
          Çıkış Yap
        </Button>
        <Button
          onClick={handleKeepSession}
          variant="contained"
          sx={{
            textTransform: "none",
            fontWeight: 700,
            backgroundColor: (theme) => theme.palette.mode === 'dark'
              ? '#ED6C00'
              : '#F57C00',
            color: '#fff',
            '&:hover': {
              backgroundColor: (theme) => theme.palette.mode === 'dark'
                ? '#F58400'
                : '#FF9100',
            }
          }}
          autoFocus
        >
          Oturumu Devam Et
        </Button>
      </DialogActions>
    </Dialog>
  );
}
