import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import { Box, Typography, Button, Stack, useTheme, InputAdornment } from "@mui/material";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
// LoadingButton import removed
import { IconTrash, IconMail, IconLock } from "@tabler/icons-react";
import { useDispatch, useSelector } from "@/store/hooks";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import {
  setSonSecilenBddkmi,
  setTurTamamlandi,
  setUserData,
  setBddkmi
} from "@/store/user/UserSlice";
import { apiFetch } from "@/api/apiBase";
import { persistSessionTokens, syncSelectionStorageFromUserData, mapAuthPayloadToUserData } from "@/utils/authSession";

import { enqueueSnackbar } from "notistack";
import { AppState } from "@/store/store";
import { getDenetciOdemeBilgileri } from "@/api/Denetci/Denetci";
import Link from "next/link";

interface loginType {
  title?: string;
  subtitle?: React.ReactNode;
  subtext?: React.ReactNode;
}

const AuthLogin: React.FC<loginType> = ({ title, subtitle, subtext }) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVerifyingCaptcha, setIsVerifyingCaptcha] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const isLocalHost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  const handleLogin = async () => {
    // console.time("Giriş İşlemi Toplam Süre");
    if (!isLocalHost && !executeRecaptcha) {
      enqueueSnackbar("Recaptcha yüklenemedi, lütfen sayfayı yenileyin.", {
        variant: "warning",
        autoHideDuration: 3000,
      });
      setIsLoggedIn(false);
      return;
    }

    setIsVerifyingCaptcha(true);
    let token = "";
    try {
      if (isLocalHost) {
        token = "BYPASS_RECAPTCHA_TEST";
      } else {
        const runRecaptcha = executeRecaptcha;
        if (!runRecaptcha) {
          throw new Error("Recaptcha fonksiyonu hazir degil.");
        }
        // console.time("ReCAPTCHA Doğrulaması");
        token = await runRecaptcha("login");
        // console.timeEnd("ReCAPTCHA Doğrulaması");
      }
    } catch (error: any) {
      console.log("Recaptcha hatası:", error);
      let errorMessage = "Güvenlik doğrulaması sırasında bir hata oluştu.";

      if (error?.message?.includes("message channel closed")) {
        errorMessage = "Tarayıcı eklentileriniz güvenlik doğrulamasını engelliyor olabilir. Lütfen reklam engelleyici veya benzeri eklentileri kapatıp tekrar deneyin.";
      }

      enqueueSnackbar(errorMessage, {
        variant: "error",
        autoHideDuration: 5000,
      });
      setIsVerifyingCaptcha(false);
      setIsLoggedIn(false);
      return;
    }
    setIsVerifyingCaptcha(false);

    if (!token) {
      enqueueSnackbar("Recaptcha doğrulaması başarısız.", {
        variant: "warning",
        autoHideDuration: 3000,
      });
      setIsLoggedIn(false);
      return;
    }

    try {
      // console.time("Login API İsteği");
      const response = await apiFetch(`/Auth/login`, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, CaptchaToken: token }),
      });
      // console.timeEnd("Login API İsteği");

      if (response.ok) {
        const data = await response.json();
        const userData = mapAuthPayloadToUserData(data, {
          accessToken: data.token || data.Token,
          refreshToken: data.refreshToken || data.RefreshToken,
          mail: email,
        });

        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem("fas_logout_intent");
          persistSessionTokens(userData.token, userData.refreshToken);
        }

        syncSelectionStorageFromUserData(userData);
        dispatch(setUserData(userData));

        if (userData.bddkmi === undefined) {
          const data2 = await getDenetciOdemeBilgileri(userData.denetciId);
          if (data2 && data2.bddkmi !== undefined) {
            dispatch(setBddkmi(data2.bddkmi));
          }
        }

        const navigateToHome =
          typeof router.replace === "function" ? router.replace.bind(router) : router.push.bind(router);
        navigateToHome("/Anasayfa");
      } else {
        // console.timeEnd("Giriş İşlemi Toplam Süre");
        setIsLoggedIn(false);

        let errorMessage = "Giriş Başarısız";
        try {
          const errorData = await response.text();
          if (errorData) {
            // Eğer response bir JSON (ApiResult) ise Message alanını çekelim
            if (errorData.trim().startsWith('{')) {
              try {
                const parsed = JSON.parse(errorData);
                errorMessage = parsed.Message || parsed.message || errorData;
              } catch {
                errorMessage = errorData;
              }
            } else {
              errorMessage = errorData;
            }
          }
        } catch (e) {
          console.error("Hata mesajı okunamadı:", e);
        }

        enqueueSnackbar(errorMessage, {
          variant: "error",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.error.light
                : theme.palette.error.main,
            maxWidth: "720px",
          },
        });
      }
    } catch (error: any) {
      console.log("Bir hata oluştu:", error);
      if (error.message === "Failed to fetch" || error.message.includes("Sunucuya ulaşılamıyor")) {
        enqueueSnackbar("Bağlantı hatası: Sisteme şu an ulaşılamıyor. Lütfen daha sonra tekrar deneyiniz.", {
          variant: "error",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.error.light
                : theme.palette.error.main,
            maxWidth: "720px",
          },
        });
      } else {
        enqueueSnackbar(`Giriş sırasında bir hata oluştu: ${error.message || "Bilinmeyen hata"}`, {
          variant: "error",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.error.light
                : theme.palette.error.main,
            maxWidth: "720px",
          },
        });
      }
      setIsLoggedIn(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
    handleLogin();
  };

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h3" mb={1} color="primary.main">
          {title}
        </Typography>
      ) : null}

      {subtext}

      <form onSubmit={handleSubmit}>
        <Stack mb={3} spacing={2}>
          <Box>
            <CustomFormLabel htmlFor="username">Email</CustomFormLabel>
            <CustomTextField
              id="username"
              variant="outlined"
              fullWidth
              placeholder="Email adresiniz"
              onChange={(e: any) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconMail size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box>
            <CustomFormLabel htmlFor="password">Şifre</CustomFormLabel>
            <CustomTextField
              id="password"
              type="password"
              variant="outlined"
              fullWidth
              placeholder="Şifreniz"
              onChange={(e: any) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconLock size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box display="flex" justifyContent="center">
            {/* ReCAPTCHA v3 is invisible */}
          </Box>

        </Stack>
        
        {/* Forgot Password Link */}
        <Box mb={2} display="flex" justifyContent="flex-end">
          <Link href={`/auth/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ""}`} style={{ textDecoration: "none" }}>
            <Typography sx={{ color: "primary.main", fontSize: "0.9rem", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>Şifremi Unuttum?</Typography>
          </Link>
        </Box>

        <Box>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            loading={isVerifyingCaptcha || isLoggedIn}
            sx={{
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
              color: "white",
              height: 48,
              padding: "0 30px",
              fontSize: "1.1rem",
              textTransform: "none",
              borderRadius: "10px"
            }}
          >
            {isVerifyingCaptcha ? "Güvenlik Doğrulaması..." : isLoggedIn ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </Button>
        </Box>
      </form>
      {subtitle}
    </>
  );
};

export default AuthLogin;
