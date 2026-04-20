"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  TextField,
  Typography,
  Alert,
  Divider,
} from "@mui/material";
import { Send, RotateCcw } from "lucide-react";
import type {
  FeedbackCreateRequest,
  FeedbackResponse,
  FeedbackSentiment,
  FeedbackType,
} from "@/api/Feedback/feedback.types";
import { FEEDBACK_TYPE_OPTIONS } from "@/api/Feedback/feedback.types";
import FeedbackSentimentSelector from "./FeedbackSentimentSelector";

const MAX_COMMENT = 1000;
const MIN_COMMENT_NEGATIVE = 10;

interface FeedbackFormProps {
  pageKey: string;
  pageTitle: string;
  route: string;
  existing?: FeedbackResponse | null;
  onSubmit: (dto: FeedbackCreateRequest) => Promise<void>;
  isSubmitting: boolean;
  submitError?: string | null;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  pageKey,
  pageTitle,
  route,
  existing,
  onSubmit,
  isSubmitting,
  submitError,
}) => {
  const [sentiment, setSentiment] = useState<FeedbackSentiment | null>(
    (existing?.sentiment as FeedbackSentiment) ?? null
  );
  const [feedbackType, setFeedbackType] = useState<FeedbackType | "">(
    (existing?.feedbackType as FeedbackType) ?? ""
  );
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [wantsContact, setWantsContact] = useState(existing?.wantsContact ?? false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isNegative = sentiment !== null && sentiment <= 2;
  const commentRequired = isNegative;
  const commentLength = comment.trim().length;

  useEffect(() => {
    if (existing) {
      setSentiment((existing.sentiment as FeedbackSentiment) ?? null);
      setFeedbackType((existing.feedbackType as FeedbackType) ?? "");
      setComment(existing.comment ?? "");
      setWantsContact(existing.wantsContact ?? false);
    }
  }, [existing]);

  const handleReset = () => {
    setSentiment(null);
    setFeedbackType("");
    setComment("");
    setWantsContact(false);
    setValidationError(null);
  };

  const handleSubmit = async () => {
    setValidationError(null);

    if (!sentiment) {
      setValidationError("Lütfen memnuniyet durumunuzu seçin.");
      return;
    }

    if (commentRequired && commentLength < MIN_COMMENT_NEGATIVE) {
      setValidationError(
        `Olumsuz değerlendirmelerde en az ${MIN_COMMENT_NEGATIVE} karakter yorum gereklidir.`
      );
      return;
    }

    if (commentLength > MAX_COMMENT) {
      setValidationError(`Yorum en fazla ${MAX_COMMENT} karakter olabilir.`);
      return;
    }

    const browserInfo =
      typeof navigator !== "undefined"
        ? `${navigator.userAgent.slice(0, 200)}`
        : undefined;

    const queryContext =
      typeof window !== "undefined" ? window.location.search.slice(0, 200) : undefined;

    await onSubmit({
      pageKey,
      pageTitle,
      route,
      sentiment,
      feedbackType: feedbackType || undefined,
      comment: comment.trim() || undefined,
      wantsContact,
      browserInfo,
      queryContext,
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {existing && (
        <Alert severity="info" sx={{ py: 0.5 }}>
          Daha önce bu sayfa için geri bildirim bıraktınız. Güncelleyebilirsiniz.
        </Alert>
      )}

      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
          Bu sayfadan ne kadar memnunsunuz?
          <Typography component="span" color="error.main" sx={{ ml: 0.3 }}>*</Typography>
        </Typography>
        <FeedbackSentimentSelector
          value={sentiment}
          onChange={setSentiment}
          disabled={isSubmitting}
        />
      </Box>

      <Divider />

      <TextField
        select
        label="Geri Bildirim Tipi"
        value={feedbackType}
        onChange={(e) => setFeedbackType(e.target.value as FeedbackType | "")}
        size="small"
        disabled={isSubmitting}
        fullWidth
      >
        <MenuItem value="">
          <em>Seçmek isterseniz...</em>
        </MenuItem>
        {FEEDBACK_TYPE_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>

      <Box>
        <TextField
          multiline
          rows={4}
          label={
            commentRequired
              ? "Yorumunuz (zorunlu)"
              : "Yorumunuz (isteğe bağlı)"
          }
          placeholder={
            isNegative
              ? "Yaşadığınız sorunu kısaca açıklayın, iyileştirmemize yardımcı olun..."
              : "Görüşlerinizi, önerilerinizi paylaşabilirsiniz..."
          }
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          size="small"
          fullWidth
          required={commentRequired}
          disabled={isSubmitting}
          inputProps={{ maxLength: MAX_COMMENT }}
          helperText={
            <Box
              component="span"
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>
                {commentRequired && commentLength < MIN_COMMENT_NEGATIVE
                  ? `En az ${MIN_COMMENT_NEGATIVE} karakter gerekli`
                  : ""}
              </span>
              <span>
                {commentLength} / {MAX_COMMENT}
              </span>
            </Box>
          }
        />
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            checked={wantsContact}
            onChange={(e) => setWantsContact(e.target.checked)}
            size="small"
            disabled={isSubmitting}
          />
        }
        label={
          <Typography variant="body2" color="text.secondary">
            Bu konu hakkında benimle iletişime geçilsin
          </Typography>
        }
      />

      {(validationError || submitError) && (
        <Alert severity="error" sx={{ py: 0.5 }}>
          {validationError || submitError}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
        <Button
          variant="text"
          color="inherit"
          size="small"
          startIcon={<RotateCcw size={14} />}
          onClick={handleReset}
          disabled={isSubmitting}
        >
          Temizle
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={
            isSubmitting ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <Send size={14} />
            )
          }
          onClick={handleSubmit}
          disabled={isSubmitting || !sentiment}
        >
          {existing ? "Güncelle" : "Gönder"}
        </Button>
      </Box>
    </Box>
  );
};

export default FeedbackForm;
