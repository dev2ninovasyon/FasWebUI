"use client";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { RotateCcw, Send } from "lucide-react";
import type {
  FeedbackCreateRequest,
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
  onSubmit: (dto: FeedbackCreateRequest) => Promise<void>;
  isSubmitting: boolean;
  submitError?: string | null;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  pageKey,
  pageTitle,
  route,
  onSubmit,
  isSubmitting,
  submitError,
}) => {
  const [sentiment, setSentiment] = useState<FeedbackSentiment | null>(null);
  const [feedbackType, setFeedbackType] = useState<FeedbackType | "">("");
  const [comment, setComment] = useState("");
  const [wantsContact, setWantsContact] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isNegative = sentiment === 1;
  const commentRequired = isNegative;
  const commentLength = comment.trim().length;

  const handleReset = () => {
    setSentiment(null);
    setFeedbackType("");
    setComment("");
    setWantsContact(false);
    setValidationError(null);
  };

  useEffect(() => {
    handleReset();
  }, [pageKey]);

  const handleSubmit = async () => {
    setValidationError(null);

    if (!sentiment) {
      setValidationError("Lütfen memnuniyet durumunuzu seçin.");
      return;
    }

    if (commentRequired && commentLength < MIN_COMMENT_NEGATIVE) {
      setValidationError(
        `Olumsuz değerlendirmelerde en az ${MIN_COMMENT_NEGATIVE} karakter açıklama gereklidir.`
      );
      return;
    }

    if (commentLength > MAX_COMMENT) {
      setValidationError(`Açıklama en fazla ${MAX_COMMENT} karakter olabilir.`);
      return;
    }

    const browserInfo =
      typeof navigator !== "undefined"
        ? navigator.userAgent.slice(0, 200)
        : undefined;

    const queryContext =
      typeof window !== "undefined"
        ? window.location.search.slice(0, 200)
        : undefined;

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

    handleReset();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Alert severity="info" sx={{ py: 0.75 }}>
        Daha önce gönderilmiş geri bildirimler bu ekranda listelenmez. Her iletim bağımsız kayıt olarak değerlendirilir.
      </Alert>

      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={600}>
          Genel değerlendirmeniz
          <Typography component="span" color="error.main" sx={{ ml: 0.3 }}>
            *
          </Typography>
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.25 }}>
          Bu ekranın kullanım deneyimini kısa bir memnuniyet seçimiyle değerlendirebilirsiniz.
        </Typography>
        <FeedbackSentimentSelector
          value={sentiment}
          onChange={setSentiment}
          disabled={isSubmitting}
        />
      </Box>

      <Divider />

      <Stack spacing={2}>
        <TextField
          select
          label="Geri Bildirim Kategorisi"
          value={feedbackType}
          onChange={(e) => setFeedbackType(e.target.value as FeedbackType | "")}
          size="small"
          disabled={isSubmitting}
          fullWidth
        >
          <MenuItem value="">
            <em>Kategori seçebilirsiniz</em>
          </MenuItem>
          {FEEDBACK_TYPE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          multiline
          rows={5}
          label={commentRequired ? "Açıklama" : "Açıklama / Öneri"}
          placeholder={
            isNegative
              ? "Karşılaştığınız sorunu, etkisini ve mümkünse hangi adımda oluştuğunu kısaca belirtin..."
              : "Geliştirme önerilerinizi, memnuniyetinizi veya dikkat çekmek istediğiniz noktaları paylaşabilirsiniz..."
          }
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          size="small"
          fullWidth
          required={commentRequired}
          disabled={isSubmitting}
          inputProps={{ maxLength: MAX_COMMENT }}
          helperText={
            <Box component="span" sx={{ display: "flex", justifyContent: "space-between" }}>
              <span>
                {commentRequired && commentLength < MIN_COMMENT_NEGATIVE
                  ? `En az ${MIN_COMMENT_NEGATIVE} karakter giriniz`
                  : " "}
              </span>
              <span>
                {commentLength} / {MAX_COMMENT}
              </span>
            </Box>
          }
        />
      </Stack>

      <FormControlLabel
        sx={{ m: 0 }}
        control={
          <Checkbox
            checked={wantsContact}
            onChange={(e) => setWantsContact(e.target.checked)}
            size="small"
            disabled={isSubmitting}
          />
        }
        label={
          <Box>
            <Typography variant="body2" color="text.primary" fontWeight={500}>
              Gerekirse benimle iletişime geçilsin
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Ek bilgi gerektiğinde kayıtlı e-posta adresiniz üzerinden dönüş yapılabilir.
            </Typography>
          </Box>
        }
      />

      {(validationError || submitError) && (
        <Alert severity="error" sx={{ py: 0.75 }}>
          {validationError || submitError}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 1.25, justifyContent: "flex-end" }}>
        <Button
          variant="text"
          color="inherit"
          size="small"
          startIcon={<RotateCcw size={14} />}
          onClick={handleReset}
          disabled={isSubmitting}
        >
          Formu Temizle
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
          Geri Bildirimi Gönder
        </Button>
      </Box>
    </Box>
  );
};

export default FeedbackForm;
