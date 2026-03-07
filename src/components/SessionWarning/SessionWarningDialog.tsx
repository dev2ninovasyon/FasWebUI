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

import { LogoutReason } from "@/utils/sessionConfig";

interface SessionWarningDialogProps {
  open: boolean;
  secondsRemaining: number;
  onKeepSession: () => void;
  onLogout: () => void;
  maxSeconds?: number;
  reason?: LogoutReason | null;
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
  reason = LogoutReason.TIMEOUT,
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

  const isInactivity = reason === LogoutReason.INACTIVITY;
  const title = isInactivity ? "İşlemsizlik Uyarısı" : "Oturum Süresi Doluyor";
  const mainMessage = isInactivity
    ? "30 dakikadır işlem yapmadığınız tespit edildi."
    : "Oturum süreniz dolmak üzere. İşleme devam etmek istiyor musunuz?";
  const subMessage = isInactivity
    ? "Güvenliğiniz için oturumunuz birazdan sonlandırılacaktır."
    : "Güvenliğiniz için oturumunuz kapatılacaktır.";

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        // Prevent closing by clicking backdrop
        if (reason === "backdropClick") {
          return;
        }
      }}
      maxWidth="xs"
      fullWidth
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.3)",
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(15, 20, 30, 0.98)'
              : 'rgba(255, 255, 255, 1)',
          backgroundImage: "none"
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: (theme) => theme.palette.mode === 'dark'
            ? 'rgba(237, 108, 0, 0.1)'
            : 'rgba(237, 108, 0, 0.05)',
          color: (theme) => theme.palette.mode === 'dark'
            ? '#FF9800'
            : '#ED6C00',
          fontWeight: 800,
          fontSize: "1.4rem",
          pt: 3,
          pb: 2,
          textAlign: "center"
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          <WarningAmberIcon sx={{ fontSize: "3rem", mb: 1 }} />
          {title}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 4, px: 4 }}>
        <Stack spacing={3}>
          <Typography variant="h6" align="center" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
            {mainMessage}
          </Typography>

          <Alert severity="info" variant="outlined" icon={false} sx={{
            borderColor: "warning.main",
            backgroundColor: "transparent",
            "& .MuiAlert-message": { width: "100%", textAlign: "center" }
          }}>
            <Typography variant="body2" color="text.secondary">
              {subMessage}
            </Typography>
          </Alert>

          {/* Countdown Display */}
          <CountdownBox>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 500, color: "text.secondary", mb: 1 }}
            >
              Kalan Süre
            </Typography>
            <Box
              sx={{
                fontSize: "56px",
                fontWeight: 800,
                color: "warning.main",
                lineHeight: 1,
                fontFamily: "monospace",
                letterSpacing: 2
              }}
            >
              {timeString}
            </Box>
          </CountdownBox>

          {/* Progress Bar */}
          <Box>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: progressPercentage > 40 ? "warning.main" : "error.main",
                  borderRadius: 5,
                  transition: "transform 0.4s linear"
                },
              }}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: 4,
          pt: 2,
          justifyContent: "center",
          gap: 2
        }}
      >
        <Button
          onClick={handleLogout}
          variant="text"
          color="inherit"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            color: "text.secondary",
            px: 3,
            '&:hover': {
              backgroundColor: "rgba(0,0,0,0.05)"
            }
          }}
        >
          Çıkış Yap
        </Button>
        <Button
          onClick={handleKeepSession}
          variant="contained"
          size="large"
          sx={{
            textTransform: "none",
            fontWeight: 700,
            px: 4,
            py: 1.5,
            borderRadius: 2,
            backgroundColor: "#ED6C00",
            '&:hover': {
              backgroundColor: "#CC5C00",
              boxShadow: "0 8px 24px rgba(237, 108, 0, 0.4)"
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
