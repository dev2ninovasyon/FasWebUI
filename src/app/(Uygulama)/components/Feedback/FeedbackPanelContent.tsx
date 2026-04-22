"use client";
import React, { useState } from "react";
import {
  Alert,
  Box,
  Paper,
  Snackbar,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { MessageSquareDot, ShieldCheck } from "lucide-react";
import type { FeedbackCreateRequest } from "@/api/Feedback/feedback.types";
import { submitFeedback } from "@/api/Feedback/feedbackApi";
import FeedbackForm from "./FeedbackForm";

interface FeedbackPanelContentProps {
  pageKey: string;
  pageTitle: string;
  route: string;
  isActive: boolean;
}

const FeedbackPanelContent: React.FC<FeedbackPanelContentProps> = ({
  pageKey,
  pageTitle,
  route,
  isActive: _isActive,
}) => {
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successSnack, setSuccessSnack] = useState(false);

  const handleSubmit = async (dto: FeedbackCreateRequest) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitFeedback(dto);
      setSuccessSnack(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Geri bildirim gönderilemedi."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          px: { xs: 2.5, md: 3.5 },
          py: 2.5,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2.5,
            border: `1px solid ${theme.palette.divider}`,
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)"
                : "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "primary.main",
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(144, 202, 249, 0.10)"
                    : "rgba(25, 118, 210, 0.08)",
                flexShrink: 0,
              }}
            >
              <MessageSquareDot size={18} />
            </Box>
            <Stack spacing={0.75} sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Geri Bildirim Gönderin
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                <strong>{pageTitle}</strong> sayfasına ilişkin görüş, öneri veya sorun
                bildirimlerinizi bu alandan iletebilirsiniz. Her gönderim yeni kayıt
                olarak değerlendirilir ve gerektiğinde ekibimiz tarafından incelenir.
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <ShieldCheck size={14} color={theme.palette.text.secondary} />
                  <Typography variant="caption" color="text.secondary">
                    Bildirimler kayıt altına alınır
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.disabled">
                  •
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Bilgilendirme e-postası otomatik gönderilir
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 2.5,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: "background.paper",
          }}
        >
          <FeedbackForm
            pageKey={pageKey}
            pageTitle={pageTitle}
            route={route}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        </Paper>
      </Box>

      <Snackbar
        open={successSnack}
        autoHideDuration={3500}
        onClose={() => setSuccessSnack(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          onClose={() => setSuccessSnack(false)}
          sx={{ width: "100%" }}
        >
          Geri bildiriminiz başarıyla kaydedildi. Bilgilendirme e-postası gönderildi.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FeedbackPanelContent;
