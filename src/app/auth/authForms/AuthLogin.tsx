import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import { Box, Typography, Button, Stack, useTheme, InputAdornment } from "@mui/material";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@mui/lab";
import { IconTrash, IconMail, IconLock } from "@tabler/icons-react";
import { useDispatch, useSelector } from "@/store/hooks";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import {
  setDenetciId,
  setId,
  setKullaniciAdi,
  setToken,
  setRefreshToken,  // ✅ Yeni import
  setYetki,
  setMail,
  setUnvan,
  setRol,
  setBddkmi,
  setDenetciFirmaAdi,
  setDenetlenenId,
  setDenetlenenFirmaAdi,
  setYil,
  setDenetimTuru,
  setBobimi,
  setTfrsmi,
  setEnflasyonmu,
  setKonsolidemi,
  setKurulumTamamlandi,
  setKurulumAdimi,
  setSetupWizardProgress,
  setSonSecilenDenetlenenId,
  setSonSecilenYil,
  setSonSecilenDenetlenenFirmaAdi,
  setSonSecilenDenetimTuru,
  setSonSecilenBobimi,
  setSonSecilenTfrsmi,
  setSonSecilenEnflasyonmu,
  setSonSecilenKonsolidemi,
  setSonSecilenBddkmi,
  setTurTamamlandi,
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
      token = await executeRecaptcha("login");
    } catch (error: any) {
      console.error("Recaptcha hatası:", error);
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
      const response = await apiFetch(`/Auth/login`, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, captchaToken: token }),
      });
      if (response.ok) {
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

        dispatch(setToken(userToken));
        if (userRefreshToken) {
          dispatch(setRefreshToken(userRefreshToken));
        }
        dispatch(setId(userId));
        dispatch(setDenetciId(userDenetciId));
        dispatch(setDenetciFirmaAdi(userDenetciFirmaAdi));
        dispatch(setYetki(yetki));
        dispatch(setRol(rol));
        dispatch(setKullaniciAdi(kullaniciAdi));
        dispatch(setMail(email));
        dispatch(setUnvan(unvan));
        dispatch(setKurulumTamamlandi(kurulumTamamlandi));
        dispatch(setKurulumAdimi(kurulumAdimi));
        dispatch(setSetupWizardProgress(setupWizardProgress));
        dispatch(setSonSecilenDenetlenenId(sonSecilenDenetlenenId));
        dispatch(setSonSecilenYil(sonSecilenYil));
        dispatch(setSonSecilenDenetlenenFirmaAdi(sonSecilenDenetlenenFirmaAdi));
        dispatch(setSonSecilenDenetimTuru(sonSecilenDenetimTuru));
        dispatch(setSonSecilenBobimi(sonSecilenBobimi));
        dispatch(setSonSecilenTfrsmi(sonSecilenTfrsmi));
        dispatch(setSonSecilenEnflasyonmu(sonSecilenEnflasyonmu));
        dispatch(setSonSecilenKonsolidemi(sonSecilenKonsolidemi));
        dispatch(setSonSecilenBddkmi(sonSecilenBddkmi));
        dispatch(setTurTamamlandi(turTamamlandi));
        dispatch(setBddkmi(bddkmi)); // Set it from auto-selected company initially

        // Restore session if available
        if (sonSecilenDenetlenenId && sonSecilenYil && sonSecilenDenetlenenFirmaAdi) {
          dispatch(setDenetlenenId(sonSecilenDenetlenenId));
          dispatch(setDenetlenenFirmaAdi(sonSecilenDenetlenenFirmaAdi));
          dispatch(setYil(sonSecilenYil));
          dispatch(setDenetimTuru(sonSecilenDenetimTuru));
          dispatch(setBobimi(sonSecilenBobimi));
          dispatch(setTfrsmi(sonSecilenTfrsmi));
          dispatch(setEnflasyonmu(sonSecilenEnflasyonmu));
          dispatch(setKonsolidemi(sonSecilenKonsolidemi));
          dispatch(setBddkmi(sonSecilenBddkmi));

          localStorage.setItem("fas_denetlenenId", sonSecilenDenetlenenId.toString());
          localStorage.setItem("fas_yil", sonSecilenYil.toString());
        }

        if (bddkmi !== undefined) {
          dispatch(setBddkmi(bddkmi));
        } else {
          const response2 = await getDenetciOdemeBilgileri(
            userToken,
            userDenetciId
          );
          if (response2.ok) {
            const data2 = await response2.json();
            const bddkmi2 = data2.bddkmi;

            dispatch(setBddkmi(bddkmi2));
          }
        }

        if (!sonSecilenDenetlenenId || !sonSecilenDenetlenenFirmaAdi) {
          // Clear if no persistent session
          dispatch(setDenetlenenId(undefined));
          dispatch(setDenetlenenFirmaAdi(undefined));
          dispatch(setYil(undefined));
          dispatch(setDenetimTuru(undefined));
          dispatch(setBobimi(undefined));
          dispatch(setTfrsmi(undefined));
          dispatch(setEnflasyonmu(undefined));
          dispatch(setKonsolidemi(undefined));
          localStorage.removeItem("fas_denetlenenId");
          localStorage.removeItem("fas_yil");
        }

        router.push("/Anasayfa");
      } else {
        setIsLoggedIn(false);
        enqueueSnackbar("Giriş Başarısız", {
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
    } catch (error) {
      console.error("Bir hata oluştu:", error);
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
          <LoadingButton
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
          </LoadingButton>
        </Box>
      </form>
      {subtitle}
    </>
  );
};

export default AuthLogin;
