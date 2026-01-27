"use client";
import React, { useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeSettings } from "@/utils/theme/Theme";
import { useSelector, useDispatch } from "@/store/hooks";
import { AppState } from "@/store/store";
import { resetToNull } from "@/store/user/UserSlice";
import { isTokenExpired } from "@/utils/tokenUtils";
import { Provider } from "react-redux";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import "@/app/api/index";
import "@/utils/i18n";
import { NextAppDirEmotionCacheProvider } from "@/utils/theme/EmotionCache";
import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
import "../../public/styles/slick-theme-fixed.css";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store/storeConfig";
import { enqueueSnackbar, SnackbarProvider } from "notistack";
import RTL from "./(Uygulama)/components/Layout/Shared/Customizer/RTL";
import { usePathname, useRouter } from "next/navigation";
import useAutoLogout from "@/utils/useAutoLogOut";
import { LoadingProvider } from "@/contexts/LoadingContext";

export const MyApp = ({ children }: { children: React.ReactNode }) => {
  useAutoLogout(
    40 * 60 * 1000, // 45 dakika idle süresi
    999 * 60 * 1000  // Token yenileme devre dışı (çok yüksek değer)
  );

  const user = useSelector((state: AppState) => state.userReducer);

  const theme = ThemeSettings();

  const customizer = useSelector((state: AppState) => state.customizer);

  const router = useRouter();

  const pathname = usePathname();

  const NOT_PROTECTED_ROUTES = [
    "/Anasayfa",
    "/Kullanici",
    "/DigerIslemler",
    "/KullanimKilavuzu",
  ];

  useEffect(() => {
    if (
      pathname === "/" ||
      pathname === "/HesapAyarlari" ||
      pathname === "/Musteri" ||
      pathname === "/Musteri/MusteriIslemleri" ||
      pathname.startsWith("/Musteri/MusteriIslemleri/MusteriDetay") ||
      pathname.startsWith("/Musteri/MusteriIslemleri/MusteriDuzenle") ||
      pathname === "/Musteri/MusteriIslemleri/MusteriEkle" ||
      pathname === "/TemaAyarlari"
    )
      return;

    const isNotProtected = NOT_PROTECTED_ROUTES.some((route) =>
      pathname.startsWith(route)
    );

    if (
      user.token &&
      !user.denetlenenId &&
      (!isNotProtected ||
        pathname === "/Kullanici/DenetciYillikTaahutname" ||
        pathname === "/DigerIslemler/Arsiv")
    ) {
      router.push("/Anasayfa");

      enqueueSnackbar("Denetlenen Firma Seçmelisiniz", {
        variant: "warning",
        autoHideDuration: 5000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.warning.dark
              : theme.palette.warning.main,
          maxWidth: "720px",
        },
      });
    }
  }, [user, pathname]);

  const dispatch = useDispatch();

  useEffect(() => {
    if (user.token && isTokenExpired(user.token)) {
      dispatch(resetToNull(""));
      router.push("/");
    }
  }, [user.token]);


  return (
    <>
      <NextAppDirEmotionCacheProvider
        options={{ key: "financial-audit-software" }}
      >
        <ThemeProvider theme={theme}>
          <LoadingProvider>
            <RTL direction={customizer.activeDir}>
              {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
              <CssBaseline />
              <SnackbarProvider
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
              >
                {children}
              </SnackbarProvider>
            </RTL>
          </LoadingProvider>
        </ThemeProvider>
      </NextAppDirEmotionCacheProvider>
    </>
  );
};
import Script from "next/script";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body>
        <Script
          src="/libs/html-docx.js"
          strategy="beforeInteractive"
        />
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <MyApp>{children}</MyApp>
          </PersistGate>
        </Provider>

      </body>
    </html>
  );
}
