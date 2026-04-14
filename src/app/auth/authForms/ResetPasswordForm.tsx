"use client";

import { apiFetch } from "@/api/apiBase";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import PasswordPolicyChecker from "@/components/PasswordPolicy/PasswordPolicyChecker";
import { validatePassword } from "@/utils/passwordPolicy";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Popper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { IconArrowLeft, IconInfoCircle, IconKey, IconLock } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import { useEffect, useMemo, useRef, useState } from "react";

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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const token = searchParams.get("token")?.trim() || "";
  const email = searchParams.get("email")?.trim() || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validation, setValidation] = useState<ValidationState>({ checked: false, valid: false });
  const [successMessage, setSuccessMessage] = useState("");
  const [policyAnchorEl, setPolicyAnchorEl] = useState<HTMLElement | null>(null);
  const passwordFieldRef = useRef<HTMLDivElement | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  const passwordValidationMessage = useMemo(
    () => (newPassword ? validatePassword(newPassword, email) : ""),
    [email, newPassword]
  );

  const passwordsMatch = useMemo(
    () => !confirmPassword || newPassword === confirmPassword,
    [newPassword, confirmPassword]
  );

  const isPolicyOpen = Boolean(policyAnchorEl);

  const handlePolicyOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setPolicyAnchorEl(passwordFieldRef.current ?? event.currentTarget);
    requestAnimationFrame(() => {
      passwordInputRef.current?.focus();
    });
  };

  const handlePolicyClose = () => {
    setPolicyAnchorEl(null);
  };

  const handleConfirmPasswordFocus = () => {
    if (isMobile) {
      handlePolicyClose();
    }
  };

  useEffect(() => {
    const shouldAutoOpenPolicy =
      !!newPassword && passwordFieldRef.current && (!isMobile || !!passwordValidationMessage);

    if (shouldAutoOpenPolicy) {
      setPolicyAnchorEl(passwordFieldRef.current);
      return;
    }

    setPolicyAnchorEl(null);
  }, [isMobile, newPassword, passwordValidationMessage]);

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
        let errorMessage = "Bağlantı doğrulanamadı.";

        if (!response.ok) {
          let text = "";

          try {
            text = await response.text();
          } catch {
            errorMessage = "Yanıt okunamadı.";
            setValidation({ checked: true, valid: false, message: errorMessage });
            return;
          }

          if (text) {
            try {
              const errorParsed = JSON.parse(text);
              errorMessage = errorParsed?.message || errorParsed?.Message || text.substring(0, 100);
            } catch {
              errorMessage = text.substring(0, 100) || "Sunucu hatası.";
            }
          } else {
            errorMessage = "Sunucu boş yanıt verdi.";
          }

          setValidation({ checked: true, valid: false, message: errorMessage });
          return;
        }

        try {
          parsed = await response.json();
        } catch {
          errorMessage = "Yanıt ayrıştırılamadı.";
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
          message: error?.message || "Bağlantı doğrulanırken bir hata oluştu.",
        });
      }
    };

    void validateToken();
  }, [token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validation.valid) {
      enqueueSnackbar("Şifre sıfırlama bağlantısı geçerli değil.", {
        variant: "warning",
        autoHideDuration: 4000,
      });
      return;
    }

    if (!newPassword || !confirmPassword) {
      enqueueSnackbar("Lütfen yeni şifrenizi ve tekrarını girin.", {
        variant: "warning",
        autoHideDuration: 4000,
      });
      return;
    }

    if (!passwordsMatch) {
      enqueueSnackbar("Şifreler birbiriyle uyuşmuyor.", {
        variant: "warning",
        autoHideDuration: 4000,
      });
      return;
    }

    if (passwordValidationMessage) {
      enqueueSnackbar(passwordValidationMessage, {
        variant: "warning",
        autoHideDuration: 5000,
      });
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
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Button
              variant="text"
              startIcon={<IconArrowLeft size={18} />}
              size="small"
              sx={{
                px: 0,
                minWidth: 0,
                color: "text.secondary",
                fontWeight: 400,
                textTransform: "none",
                backgroundColor: "transparent",
                "&:hover": {
                  backgroundColor: "transparent",
                  color: "text.primary",
                  textDecoration: "underline",
                },
                "&.Mui-focusVisible": {
                  backgroundColor: "transparent",
                },
              }}
            >
              Girişe Dön
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
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <Button
                variant="text"
                startIcon={<IconArrowLeft size={18} />}
                size="small"
                sx={{
                  px: 0,
                  minWidth: 0,
                  color: "text.secondary",
                  fontWeight: 400,
                  textTransform: "none",
                  backgroundColor: "transparent",
                  "&:hover": {
                    backgroundColor: "transparent",
                    color: "text.primary",
                    textDecoration: "underline",
                  },
                  "&.Mui-focusVisible": {
                    backgroundColor: "transparent",
                  },
                }}
              >
                Girişe Dön
              </Button>
            </Link>
          </Box>
        </Box>
      ) : (
        <form onSubmit={handleSubmit}>
          <Stack spacing={1.5}>
            {email ? (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                {email} hesabı için yeni şifre belirliyorsunuz.
              </Alert>
            ) : null}

            <Box ref={passwordFieldRef}>
              <CustomFormLabel htmlFor="new-password">Yeni Şifre</CustomFormLabel>
              <CustomTextField
                id="new-password"
                variant="outlined"
                fullWidth
                inputRef={passwordInputRef}
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
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Şifre kriterlerini göster">
                        <IconButton
                          edge="end"
                          size="small"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={handlePolicyOpen}
                        >
                          <IconInfoCircle size={18} />
                        </IconButton>
                      </Tooltip>
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
                onFocus={handleConfirmPasswordFocus}
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

            {!passwordsMatch && confirmPassword ? (
              <Alert severity="warning" sx={{ py: 0.5 }}>
                Şifreler uyuşmuyor
              </Alert>
            ) : null}

            {passwordValidationMessage ? (
              <Alert severity="warning" sx={{ py: 0.5 }}>
                {passwordValidationMessage}
              </Alert>
            ) : null}

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

            <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
              <Link href="/" style={{ textDecoration: "none" }}>
                <Button
                  variant="text"
                  startIcon={<IconArrowLeft size={18} />}
                  size="small"
                  sx={{
                    px: 0,
                    minWidth: 0,
                    color: "text.secondary",
                    fontWeight: 400,
                    textTransform: "none",
                    backgroundColor: "transparent",
                    "&:hover": {
                      backgroundColor: "transparent",
                      color: "text.primary",
                      textDecoration: "underline",
                    },
                    "&.Mui-focusVisible": {
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  Girişe Dön
                </Button>
              </Link>
            </Box>
          </Stack>
        </form>
      )}

      <Popper
        open={isPolicyOpen}
        anchorEl={policyAnchorEl}
        placement={isMobile ? "top-start" : "right-start"}
        modifiers={[
          {
            name: "offset",
            options: {
              offset: isMobile ? [0, -8] : [12, 0],
            },
          },
        ]}
        sx={{
          zIndex: theme.zIndex.modal + 1,
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            p: 1,
            width: isMobile ? "min(calc(100vw - 32px), 420px)" : 420,
            maxWidth: isMobile ? "calc(100vw - 32px)" : 420,
            borderRadius: 3,
            boxShadow: "0 20px 50px rgba(15, 23, 42, 0.18)",
            overflow: "hidden",
            bgcolor: "background.paper",
          }}
        >
          <PasswordPolicyChecker password={newPassword} email={email} showEmail={true} borderless />
        </Box>
      </Popper>
    </>
  );
}
