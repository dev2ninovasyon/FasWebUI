import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import { Box, Typography, Button, Stack, useTheme } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@mui/lab";
import { IconTrash } from "@tabler/icons-react";
import { useDispatch, useSelector } from "@/store/hooks";
import {
  setDenetciId,
  setId,
  setKullaniciAdi,
  setToken,
  setYetki,
  setMail,
  setUnvan,
  setRol,
  setBddkmi,
} from "@/store/user/UserSlice";
import { url } from "@/api/apiBase";
import { enqueueSnackbar } from "notistack";
import { AppState } from "@/store/store";
import { getDenetciOdemeBilgileri } from "@/api/Kullanici/KullaniciIslemleri";

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

  const handleLogin = async () => {
    try {
      const response = await fetch(`${url}/Auth/login`, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        const userToken = data.token;
        const userId = data.kullaniciId;
        const userDenetciId = data.denetciId;
        const yetki = data.yetki;
        const rol = data.rol;
        const kullaniciAdi = data.kullaniciAdi;
        const unvan = data.unvan;

        dispatch(setToken(userToken));
        dispatch(setId(userId));
        dispatch(setDenetciId(userDenetciId));
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
    }
  };

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h3" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      <Stack mb={3}>
        <Box>
          <CustomFormLabel htmlFor="username">Email</CustomFormLabel>
          <CustomTextField
            id="username"
            variant="outlined"
            fullWidth
            onChange={(e: any) => setEmail(e.target.value)}
          />
        </Box>
        <Box>
          <CustomFormLabel htmlFor="password">Şifre</CustomFormLabel>
          <CustomTextField
            id="password"
            type="password"
            variant="outlined"
            fullWidth
            onChange={(e: any) => setPassword(e.target.value)}
          />
        </Box>
      </Stack>
      <Box>
        {!isLoggedIn && (
          <Button
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            onClick={() => {
              setIsLoggedIn(true);
              handleLogin();
            }}
          >
            Giriş
          </Button>
        )}
        {isLoggedIn && (
          <LoadingButton
            loading
            color="secondary"
            variant="contained"
            size="large"
            fullWidth
            endIcon={<IconTrash width={18} />}
          ></LoadingButton>
        )}
      </Box>
      {subtitle}
    </>
  );
};

export default AuthLogin;
