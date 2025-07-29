"use client";
import React, { useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeSettings } from "@/utils/theme/Theme";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Provider } from "react-redux";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import "@/app/api/index";
import "@/utils/i18n";
import { NextAppDirEmotionCacheProvider } from "@/utils/theme/EmotionCache";
import "react-quill/dist/quill.snow.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store/storeConfig";
import { enqueueSnackbar, SnackbarProvider } from "notistack";
import RTL from "./(Uygulama)/components/Layout/Shared/Customizer/RTL";
import { usePathname, useRouter } from "next/navigation";

export const MyApp = ({ children }: { children: React.ReactNode }) => {
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
      pathname === "/TemaAyarlari" ||
      pathname === "/Musteri" ||
      pathname === "/Musteri/MusteriIslemleri"
    )
      return;

    const isNotProtected = NOT_PROTECTED_ROUTES.some((route) =>
      pathname.startsWith(route)
    );

    if (
      (!isNotProtected && !user.denetlenenId) ||
      (pathname === "/Kullanici/DenetciYillikTaahutname" && !user.denetlenenId)
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
  }, [pathname, user.denetlenenId]);

  return (
    <>
      <NextAppDirEmotionCacheProvider options={{ key: "modernize" }}>
        <ThemeProvider theme={theme}>
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
        </ThemeProvider>
      </NextAppDirEmotionCacheProvider>
    </>
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    setTimeout(() => setLoading(true), 3000);
  }, []);
  return (
    <html suppressHydrationWarning>
      <body>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            {loading ? (
              // eslint-disable-next-line react/no-children-prop
              <MyApp children={children} />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  height: "100vh",
                }}
              >
                <CircularProgress />
              </Box>
            )}
          </PersistGate>
        </Provider>
      </body>
    </html>
  );
}
