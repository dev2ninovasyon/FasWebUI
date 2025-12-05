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
    const token = await executeRecaptcha("login");
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
        const userRefreshToken = data.refreshToken;  // ✅ Backend'den al
        const userId = data.kullaniciId;
        const userDenetciId = data.denetciId;
        const userDenetciFirmaAdi = data.denetciFirmaAdi;
        const yetki = data.yetki;
        const rol = data.rol;
        const kullaniciAdi = data.kullaniciAdi;
        const unvan = data.unvan;

        dispatch(setToken(userToken));
        if (userRefreshToken) {  // ✅ Varsa kaydet
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

        const response2 = await getDenetciOdemeBilgileri(
          userToken,
          userDenetciId
        );
        if (response2.ok) {
          const data2 = await response2.json();
          const bddkmi = data2.bddkmi;

          dispatch(setBddkmi(bddkmi));
        }

        // Şirket seçimi bilgilerini temizle - her login'de fresh başlasın
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

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h3" mb={1} color="primary.main">
          {title}
        </Typography>
      ) : null}

      {subtext}

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
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          loading={isVerifyingCaptcha || isLoggedIn}
          onClick={() => {
            setIsLoggedIn(true);
            handleLogin();
          }}
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
      {subtitle}
    </>
  );
};

export default AuthLogin;
