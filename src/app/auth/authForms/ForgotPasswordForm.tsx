"use client";

import { apiFetch } from "@/api/apiBase";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import { Box, Button, InputAdornment, Stack, Typography, useTheme } from "@mui/material";
import { IconArrowLeft, IconMail, IconSend } from "@tabler/icons-react";
import Link from "next/link";
import { enqueueSnackbar } from "notistack";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const defaultSuccessMessage =
  "Eğer e-posta adresi sistemde kayıtlıysa, şifre sıfırlama bağlantısı gönderilecektir.";

export default function ForgotPasswordForm() {
  const theme = useTheme();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const emailIsValid = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email.trim()) {
      enqueueSnackbar("Lütfen e-posta adresinizi girin.", { variant: "warning", autoHideDuration: 4000 });
      return;
    }

    if (!emailIsValid) {
      enqueueSnackbar("Lütfen geçerli bir e-posta adresi girin.", {
        variant: "warning",
        autoHideDuration: 4000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiFetch("/Auth/forgot-password", {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
        suppressErrorLog: true,
      });

      let parsedResponse: any = null;
      let errorMessage = "Şifre sıfırlama bağlantısı gönderilemedi.";

      try {
        parsedResponse = await response.clone().json();
        errorMessage = parsedResponse?.message || parsedResponse?.Message || errorMessage;
      } catch {
        try {
          const rawText = await response.clone().text();
          errorMessage = rawText || errorMessage;
        } catch {
          // Varsayılan mesaj kullanılacak.
        }
      }

      if (!response.ok) {
        throw new Error(errorMessage);
      }

      const nextSuccessMessage = errorMessage || defaultSuccessMessage;
      setSuccessMessage(nextSuccessMessage);
      setSubmittedEmail(email.trim());
      enqueueSnackbar(nextSuccessMessage, { variant: "success", autoHideDuration: 5000 });
    } catch (error: any) {
      enqueueSnackbar(error?.message || "Şifre sıfırlama bağlantısı gönderilemedi.", {
        variant: "error",
        autoHideDuration: 5000,
        style: {
          backgroundColor: theme.palette.error.main,
          maxWidth: "720px",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          <Box>
            <CustomFormLabel htmlFor="forgot-password-email">E-posta</CustomFormLabel>
            <CustomTextField
              id="forgot-password-email"
              variant="outlined"
              fullWidth
              placeholder="Kayıtlı e-posta adresiniz"
              value={email}
              onChange={(event: any) => setEmail(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconMail size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
            Şifre sıfırlama bağlantısını kayıtlı e-posta adresinize göndereceğiz. Linke tıklayarak
            yeni şifrenizi güvenli şekilde belirleyebilirsiniz.
          </Typography>

          {successMessage ? (
            <Box
              sx={{
                borderRadius: 3,
                px: 2,
                py: 1.75,
                backgroundColor: "rgba(34, 197, 94, 0.10)",
                border: "1px solid rgba(34, 197, 94, 0.24)",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#166534", mb: 0.5 }}>
                Mail gönderimi tamamlandı
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {submittedEmail || email.trim()} adresini kontrol edin. Mail birkaç dakika içinde gelmezse
                spam klasörüne de bakın.
              </Typography>
            </Box>
          ) : null}

          <Button
            type="submit"
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            disabled={isSubmitting}
            startIcon={<IconSend size={18} />}
          >
            {isSubmitting ? "Gönderiliyor..." : "Şifre Sıfırlama Bağlantısı Gönder"}
          </Button>
        </Stack>
      </form>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mt: 4 }}>
        <Link href="/">
          <Button
            variant="text"
            startIcon={<IconArrowLeft size={18} />}
            size="small"
            sx={{
              color: "primary.main",
              fontWeight: 500,
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "rgba(33, 150, 243, 0.08)",
                transform: "translateX(-2px)",
              },
            }}
          >
            Girişe Dön
          </Button>
        </Link>
      </Box>
    </>
  );
}
