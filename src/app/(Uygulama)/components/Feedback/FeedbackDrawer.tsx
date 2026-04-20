"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
  Snackbar,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { BarChart2, MessageSquareDot, X } from "lucide-react";
import type {
  FeedbackCreateRequest,
  FeedbackPageStats,
  FeedbackResponse,
  FeedbackSentiment,
} from "@/api/Feedback/feedback.types";
import { SENTIMENT_OPTIONS } from "@/api/Feedback/feedback.types";
import { getMyFeedback, getPageStats, submitFeedback } from "@/api/Feedback/feedbackApi";
import FeedbackForm from "./FeedbackForm";
import AppIcon from "./AppIcon";
import { TrendingUp } from "lucide-react";

interface FeedbackDrawerProps {
  open: boolean;
  onClose: () => void;
  pageTitle: string;
  pageKey: string;
  route: string;
}

const FeedbackDrawer: React.FC<FeedbackDrawerProps> = ({
  open,
  onClose,
  pageTitle,
  pageKey,
  route,
}) => {
  const theme = useTheme();

  const [existing, setExisting] = useState<FeedbackResponse | null>(null);
  const [stats, setStats] = useState<FeedbackPageStats | null>(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successSnack, setSuccessSnack] = useState(false);

  const loadData = useCallback(async () => {
    if (!pageKey) return;
    setIsLoadingExisting(true);
    try {
      const [myFeedback, pageStatsData] = await Promise.all([
        getMyFeedback(pageKey),
        getPageStats(pageKey),
      ]);
      setExisting(myFeedback);
      setStats(pageStatsData);
    } catch {
      // non-critical, silently ignore
    } finally {
      setIsLoadingExisting(false);
    }
  }, [pageKey]);

  useEffect(() => {
    if (open) loadData();
  }, [open, loadData]);

  const handleSubmit = async (dto: FeedbackCreateRequest) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitFeedback(dto);
      setExisting(result);
      setSuccessSnack(true);
      await getPageStats(pageKey).then((s) => setStats(s));
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Geri bildirim gönderilemedi."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const sentimentColor = existing
    ? SENTIMENT_OPTIONS.find((s) => s.value === existing.sentiment)?.colorVariant ?? "neutral"
    : undefined;

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: { xs: "100vw", sm: 420 },
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            background:
              theme.palette.mode === "dark"
                ? theme.palette.background.default
                : theme.palette.primary.light,
          }}
        >
          <AppIcon icon={MessageSquareDot} colorVariant="primary" size="medium" />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              Sayfa Geri Bildirimi
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {pageTitle}
            </Typography>
          </Box>
          {existing && sentimentColor && (
            <Chip
              label={
                SENTIMENT_OPTIONS.find((s) => s.value === existing.sentiment)?.label ?? ""
              }
              size="small"
              sx={{
                backgroundColor:
                  theme.palette[
                    sentimentColor === "neutral" ? "action" : sentimentColor
                  ]?.[sentimentColor === "neutral" ? "hover" : "main"] ?? undefined,
                color:
                  sentimentColor === "neutral"
                    ? theme.palette.text.secondary
                    : "#fff",
                fontWeight: 600,
                fontSize: "0.7rem",
              }}
            />
          )}
          <IconButton size="small" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </Box>

        {isLoadingExisting && <LinearProgress />}

        {/* Body */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: 2.5,
            py: 2.5,
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Bu sayfa hakkındaki görüşünüzü paylaşın. Geri bildiriminiz ürün
            geliştiricilerimize iletilecektir.
          </Typography>

          {!isLoadingExisting && (
            <FeedbackForm
              pageKey={pageKey}
              pageTitle={pageTitle}
              route={route}
              existing={existing}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitError={submitError}
            />
          )}

          {/* Anonim istatistikler */}
          {stats && stats.totalCount > 2 && (
            <>
              <Divider />
              <Box>
                <Stack direction="row" alignItems="center" gap={0.75} mb={1}>
                  <AppIcon icon={BarChart2} colorVariant="info" size="small" />
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    BU SAYFAYLA İLGİLİ ANONİM İSTATİSTİKLER
                  </Typography>
                </Stack>

                <Stack gap={0.75}>
                  <StatRow
                    label="Toplam değerlendirme"
                    value={`${stats.totalCount} kişi`}
                  />
                  <StatRow
                    label="Ortalama memnuniyet"
                    value={
                      <Stack direction="row" alignItems="center" gap={0.5}>
                        <AppIcon
                          icon={TrendingUp}
                          colorVariant={
                            stats.averageSentiment >= 4
                              ? "success"
                              : stats.averageSentiment >= 3
                              ? "primary"
                              : "warning"
                          }
                          size="small"
                        />
                        <span>
                          {stats.averageSentiment.toFixed(1)} / 5
                        </span>
                      </Stack>
                    }
                  />
                  {stats.mostCommonFeedbackType && (
                    <StatRow
                      label="En çok bildirilen konu"
                      value={
                        {
                          KullanimKolayligi: "Kullanım Kolaylığı",
                          GorselTasarim: "Görsel Tasarım",
                          HizPerformans: "Hız / Performans",
                          VeriDogrulugu: "Veri Doğruluğu",
                          EksikOzellik: "Eksik Özellik",
                          HataBug: "Hata / Bug",
                          Oneri: "Öneri",
                          Diger: "Diğer",
                        }[stats.mostCommonFeedbackType] ??
                          stats.mostCommonFeedbackType
                      }
                    />
                  )}

                  {/* Sentiment bar */}
                  <Box mt={0.5}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Memnuniyet dağılımı
                    </Typography>
                    <SentimentBar
                      distribution={stats.sentimentDistribution}
                      total={stats.totalCount}
                    />
                  </Box>
                </Stack>
              </Box>
            </>
          )}
        </Box>
      </Drawer>

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
          Geri bildiriminiz başarıyla kaydedildi!
        </Alert>
      </Snackbar>
    </>
  );
};

function StatRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="caption" fontWeight={600}>
        {value}
      </Typography>
    </Box>
  );
}

function SentimentBar({
  distribution,
  total,
}: {
  distribution: Record<string, number>;
  total: number;
}) {
  const theme = useTheme();

  const segments: Array<{ value: FeedbackSentiment; color: string; pct: number }> = [
    { value: 5, color: theme.palette.success.main },
    { value: 4, color: theme.palette.primary.main },
    { value: 3, color: theme.palette.text.disabled },
    { value: 2, color: theme.palette.warning.main },
    { value: 1, color: theme.palette.error.main },
  ].map((s) => ({
    ...s,
    pct: total > 0 ? ((distribution[String(s.value)] ?? 0) / total) * 100 : 0,
  }));

  return (
    <Box sx={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", gap: "1px" }}>
      {segments.map((seg) =>
        seg.pct > 0 ? (
          <Box
            key={seg.value}
            sx={{
              width: `${seg.pct}%`,
              backgroundColor: seg.color,
              transition: "width 0.5s ease",
            }}
          />
        ) : null
      )}
    </Box>
  );
}

export default FeedbackDrawer;
