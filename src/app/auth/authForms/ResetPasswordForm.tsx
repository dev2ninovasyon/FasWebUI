"use client";

import { apiFetch } from "@/api/apiBase";
import { passwordRules, validatePassword } from "@/utils/passwordPolicy";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Link as MuiLink,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { IconArrowLeft, IconKey, IconLock } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import { useEffect, useMemo, useState } from "react";

interface ValidationState {
  checked: boolean;
  valid: boolean;
  expiresAt?: string | null;
  message?: string;
}

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const token = searchParams.get("token")?.trim() || "";
  const email = searchParams.get("email")?.trim() || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validation, setValidation] = useState<ValidationState>({ checked: false, valid: false });
  const [successMessage, setSuccessMessage] = useState("");
  const passwordValidationMessage = useMemo(
    () => (newPassword ? validatePassword(newPassword, email) : ""),
    [email, newPassword]
  );
  const passwordsMatch = useMemo(
    () => !confirmPassword || newPassword === confirmPassword,
    [newPassword, confirmPassword]
  );

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setValidation({
          checked: true,
          valid: false,
          message: "Şifre sıfırlama bağlantısı eksik veya hatalı görünüyor.",
        });
        return;
      }

      try {
        const response = await apiFetch("/Auth/validate-reset-password-token", {
          method: "POST",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
          suppressErrorLog: true,
        });

        let parsed: any = null;
        let errorMessage = "Baglanti dogrulanamadi.";

        // Response OK değilse, text veya JSON read
        if (!response.ok) {
          try {
            const text = await response.text();
            
            // Text'i JSON'a çevirmeyi dene
            try {
              const errorParsed = JSON.parse(text);
              errorMessage = errorParsed?.message || errorParsed?.Message || text.substring(0, 100);
            } catch {
              // JSON değilse, text'in ilk 100 karakterini mesaj yap
              errorMessage = text.substring(0, 100) || "Sunucu hatasi.";
            }
          } catch {
            errorMessage = "Yanit ayristirilamadi.";
          }
          
          setValidation({ checked: true, valid: false, message: errorMessage });
          return;
        }

        // Response OK ise, JSON oku
        try {
          parsed = await response.json();
        } catch {
          errorMessage = "Yanit ayristirilamadi.";
        }

        setValidation({
          checked: true,
          valid: !!parsed?.isValid,
          expiresAt: parsed?.expiresAt,
        });
      } catch (error: any) {
        setValidation({
          checked: true,
          valid: false,
          message: error?.message || "Baglanti dogrulanirken bir hata olustu.",
        });
      }
    };

    void validateToken();
  }, [token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validation.valid) {
      enqueueSnackbar("Şifre sıfırlama bağlantısı geçerli değil.", { variant: "warning", autoHideDuration: 4000 });
      return;
    }

    if (!newPassword || !confirmPassword) {
      enqueueSnackbar("Lütfen yeni şifrenizi ve tekrarını girin.", { variant: "warning", autoHideDuration: 4000 });
      return;
    }

    if (!passwordsMatch) {
      enqueueSnackbar("Şifreler birbiriyle uyuşmuyor.", { variant: "warning", autoHideDuration: 4000 });
      return;
    }

    if (passwordValidationMessage) {
      enqueueSnackbar(passwordValidationMessage, { variant: "warning", autoHideDuration: 5000 });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiFetch("/Auth/reset-password", {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword,
        }),
        suppressErrorLog: true,
      });

      let parsedMessage = "";

      try {
        const parsed = await response.json();
        parsedMessage = parsed.message || parsed.Message || "";
      } catch {
        parsedMessage = "";
      }

      if (!response.ok) {
        throw new Error(parsedMessage || "Şifre güncellenemedi.");
      }

      const message = parsedMessage || "Şifreniz başarıyla güncellendi.";
      setSuccessMessage(message);
      enqueueSnackbar(message, { variant: "success", autoHideDuration: 5000 });

      setTimeout(() => {
        router.replace("/");
      }, 1800);
    } catch (error: any) {
      enqueueSnackbar(error?.message || "Şifre güncellenemedi.", {
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

  if (!validation.checked) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={4}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Şifre sıfırlama bağlantısı doğrulanıyor...
        </Typography>
      </Box>
    );
  }

  if (!validation.valid) {
    return (
      <Box display="flex" flexDirection="column" gap={2}>
        <Alert severity="error">{validation.message}</Alert>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Link href="/login">
            <Button
              variant="text"
              startIcon={<IconArrowLeft size={18} />}
              size="small"
            >
              Girişe Geri Dön
            </Button>
          </Link>
        </Box>
      </Box>
    );
  }

  return (
    <>
      {successMessage ? (
        <Box display="flex" flexDirection="column" gap={2}>
          <Alert severity="success">{successMessage}</Alert>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Link href="/login">
              <Button
                variant="text"
                startIcon={<IconArrowLeft size={18} />}
                size="small"
              >
                Girişe Geri Dön
              </Button>
            </Link>
          </Box>
        </Box>
      ) : (
        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <Box>
              <CustomFormLabel htmlFor="new-password">Yeni Şifre</CustomFormLabel>
              <CustomTextField
                id="new-password"
                variant="outlined"
                fullWidth
                placeholder="Yeni şifreniz"
                type="password"
                disabled={isSubmitting}
                required
                value={newPassword}
                onChange={(event: any) => setNewPassword(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconLock size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box>
              <CustomFormLabel htmlFor="confirm-password">Şifre Onayla</CustomFormLabel>
              <CustomTextField
                id="confirm-password"
                variant="outlined"
                fullWidth
                placeholder="Şifrenizi tekrar girin"
                type="password"
                disabled={isSubmitting}
                required
                value={confirmPassword}
                onChange={(event: any) => setConfirmPassword(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconKey size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {!passwordsMatch && confirmPassword && (
              <Alert severity="warning">Şifreler uyuşmuyor</Alert>
            )}

            {passwordValidationMessage && (
              <Alert severity="warning">{passwordValidationMessage}</Alert>
            )}

            <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
              Şifre kriterleri:
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {passwordRules.map((rule: string, index: number) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  • {rule}
                </Typography>
              ))}
            </Box>

            <Button
              type="submit"
              color="primary"
              variant="contained"
              size="large"
              fullWidth
              disabled={isSubmitting || !passwordsMatch || !!passwordValidationMessage}
              startIcon={isSubmitting ? <CircularProgress size={18} /> : <IconKey size={18} />}
            >
              {isSubmitting ? "Güncelleniyor..." : "Şifre Güncelle"}
            </Button>
          </Stack>
        </form>
      )}

      {!successMessage && (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mt: 3 }}>
          <Link href="/login">
            <Button
              variant="text"
              startIcon={<IconArrowLeft size={18} />}
              size="small"
            >
              Girişe Geri Dön
            </Button>
          </Link>
        </Box>
      )}
    </>
  );
}
