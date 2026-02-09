import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import { Box, Typography, Button, Stack, useTheme, InputAdornment } from "@mui/material";
import { useState, useRef } from "react";
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

import { enqueueSnackbar } from "notistack";
import { AppState } from "@/store/store";
import { getDenetciOdemeBilgileri } from "@/api/Denetci/Denetci";

interface loginType {
  title?: string;
  subtitle?: JSX.Element | JSX.Element[];
  subtext?: JSX.Element | JSX.Element[];
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

  const handleLogin = async () => {
    // console.time("Giriş İşlemi Toplam Süre");
    if (!executeRecaptcha) {
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
      // console.time("ReCAPTCHA Doğrulaması");
      token = await executeRecaptcha("login");
      // console.timeEnd("ReCAPTCHA Doğrulaması");
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
        // console.time("Veri İşleme ve Yönlendirme");
        const data = await response.json();
        const userToken = data.token;
        const userRefreshToken = data.refreshToken;
        const userId = data.userId || data.kullaniciId || data.Id || 0;

        const userDenetciId = data.denetciId || data.denetciId || 0;
        const userDenetciFirmaAdi = data.denetciFirmaAdi || "";
        const yetki = data.yetki;
        const rol = data.rol;
        const kullaniciAdi = data.kullaniciAdi;
        const unvan = data.unvan;
        const kurulumTamamlandi = data.kurulumTamamlandi;
        const kurulumAdimi = data.kurulumAdimi;
        const setupWizardProgress = data.setupWizardProgress;
        const sonSecilenDenetlenenId = data.sonSecilenDenetlenenId;
        const sonSecilenYil = data.sonSecilenYil;
        const sonSecilenDenetlenenFirmaAdi = data.sonSecilenDenetlenenFirmaAdi;
        const sonSecilenDenetimTuru = data.sonSecilenDenetimTuru;
        const sonSecilenBobimi = data.sonSecilenBobimi;
        const sonSecilenTfrsmi = data.sonSecilenTfrsmi;
        const sonSecilenEnflasyonmu = data.sonSecilenEnflasyonmu;
        const sonSecilenKonsolidemi = data.sonSecilenKonsolidemi;
        const sonSecilenBddkmi = data.sonSecilenBddkmi;
        const bddkmi = data.bddkmi;
        const turTamamlandi = data.turTamamlandi;

        const userData = {
          token: userToken,
          refreshToken: userRefreshToken,
          id: userId,
          denetciId: userDenetciId,
          denetciFirmaAdi: userDenetciFirmaAdi,
          yetki: yetki,
          rol: rol,
          kullaniciAdi: kullaniciAdi,
          mail: email,
          unvan: unvan,
          kurulumTamamlandi: kurulumTamamlandi,
          kurulumAdimi: kurulumAdimi,
          setupWizardProgress: setupWizardProgress,
          sonSecilenDenetlenenId: sonSecilenDenetlenenId,
          sonSecilenYil: sonSecilenYil,
          sonSecilenDenetlenenFirmaAdi: sonSecilenDenetlenenFirmaAdi,
          sonSecilenDenetimTuru: sonSecilenDenetimTuru,
          sonSecilenBobimi: sonSecilenBobimi,
          sonSecilenTfrsmi: sonSecilenTfrsmi,
          sonSecilenEnflasyonmu: sonSecilenEnflasyonmu,
          sonSecilenKonsolidemi: sonSecilenKonsolidemi,
          sonSecilenBddkmi: sonSecilenBddkmi,
          turTamamlandi: turTamamlandi,
          bddkmi: bddkmi
        };
        console.log("UserData constructed");

        if (sonSecilenDenetlenenId && sonSecilenYil && sonSecilenDenetlenenFirmaAdi) {
          Object.assign(userData, {
            denetlenenId: sonSecilenDenetlenenId,
            denetlenenFirmaAdi: sonSecilenDenetlenenFirmaAdi,
            yil: sonSecilenYil,
            denetimTuru: sonSecilenDenetimTuru,
            bobimi: sonSecilenBobimi,
            tfrsmi: sonSecilenTfrsmi,
            enflasyonmu: sonSecilenEnflasyonmu,
            konsolidemi: sonSecilenKonsolidemi,
            bddkmi: sonSecilenBddkmi
          });

          localStorage.setItem("fas_denetlenenId", sonSecilenDenetlenenId.toString());
          localStorage.setItem("fas_yil", sonSecilenYil.toString());
        }

        // ✅ Token'lar artık sadece backend tarafından HttpOnly Cookie olarak set ediliyor.
        // Güvenlik nedeniyle localStorage üzerine yazılmıyor (XSS koruması).

        console.log("Before Dispatch");
        dispatch(setUserData(userData));
        console.log("After Dispatch");
        console.log("bddkmi value:", bddkmi);

        if (bddkmi === undefined) {
          console.time("Ek Bilgi API İsteği (bddkmi)");
          const data2 = await getDenetciOdemeBilgileri(
            userDenetciId
          );
          if (data2 && data2.bddkmi !== undefined) {
            dispatch(setBddkmi(data2.bddkmi));
          }
          console.timeEnd("Ek Bilgi API İsteği (bddkmi)");
        }

        if (!sonSecilenDenetlenenId || !sonSecilenDenetlenenFirmaAdi) {
          localStorage.removeItem("fas_denetlenenId");
          localStorage.removeItem("fas_yil");
        }

        console.timeEnd("Veri İşleme ve Yönlendirme");
        console.timeEnd("Giriş İşlemi Toplam Süre");
        router.push("/Anasayfa");
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
      console.timeEnd("Giriş İşlemi Toplam Süre");
      console.log("Bir hata oluştu:", error);
      if (error.message === "Failed to fetch") {
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
