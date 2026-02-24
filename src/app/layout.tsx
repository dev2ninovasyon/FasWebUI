"use client";
import React, { useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeSettings } from "@/utils/theme/Theme";
import { useSelector, useDispatch } from "@/store/hooks";
import { AppState } from "@/store/store";
import { resetToNull } from "@/store/user/UserSlice";
import { isTokenExpired } from "@/utils/tokenUtils";
import { setMaddiDogrulamaItems } from "@/store/dynamicMenu/DynamicMenuSlice";
import { getMaddiDogrulama } from "@/api/MaddiDogrulama/MaddiDogrulama";
import { Provider } from "react-redux";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import "@/app/api/index";
import "@/lib/handsontableSetup";
import "./global.css";
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
import SessionWarningDialog from "@/components/SessionWarning/SessionWarningDialog";

// Turkish character removal helper function
const removeTurkishChars = (str: string | undefined | null) => {
  if (!str) return "";
  return str
    .replace(/\s/g, "")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ç/g, "c")
    .replace(/İ/g, "I").replace(/Ö/g, "O").replace(/Ü/g, "U")
    .replace(/Ş/g, "S").replace(/Ğ/g, "G").replace(/Ç/g, "C");
};

const MyApp = ({ children }: { children: React.ReactNode }) => {
  const {
    showWarning,
    secondsBeforeLogout,
    onKeepSession,
    onLogout,
  } = useAutoLogout(
    90 * 60 * 1000,  // 90 dakika idle timeout
    45 * 60 * 1000,  // 45 dakikada bir token yenile
    60 * 1000        // 60 saniye kala popup göster
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

  // NOT: Token expiry useAutoLogout hook tarafından yönetilmektedir.
  // isTokenExpired(user.token) burada çağrılmıyor — sayfa yenilendiğinde Redux
  // state boş token döndürebilir ve bu yanlışlıkla logout tetikliyor.


  // Kullanıcı giriş yaptığında MaddiDogrulama verilerini yükle
  useEffect(() => {
    if (user.token && user.denetlenenId && user.yil) {
      const loadMaddiDogrulamaData = async () => {
        try {
          // Check if we already have the data in store for this denetlenenId and yil
          const cachedString = localStorage.getItem("maddiDogrulamaData");
          const cachedMetadataStr = localStorage.getItem("maddiDogrulamaMetadata");

          let shouldFetch = true;

          if (cachedString && cachedMetadataStr) {
            try {
              const metadata = JSON.parse(cachedMetadataStr);
              if (metadata.denetlenenId === user.denetlenenId && metadata.yil === user.yil && metadata.denetimTuru === user.denetimTuru) {
                shouldFetch = false;
                // Dispatch cached data to store if it is not already set
                dispatch(setMaddiDogrulamaItems(JSON.parse(cachedString)));
              }
            } catch (e) {
              console.warn("Error parsing cache metadata", e);
            }
          }

          if (!shouldFetch) {
            console.log("📦 [MaddiDogrulama] Using cached data for current company/year");
            return;
          }

          console.log("📥 [MaddiDogrulama] Loading data...", {
            denetimTuru: user.denetimTuru,
            denetlenenId: user.denetlenenId,
            yil: user.yil
          });

          const data = await getMaddiDogrulama(
            user.denetimTuru || "",
            user.denetlenenId || 0,
            user.yil || 0
          );

          // Veriyi dönüştür ve store'a kaydet
          const transformedData = data?.map((item: any) => ({
            id: item.id,
            name: item.name,
            category: "MaddiDogrulama",
            href: `/DenetimKanitlari/MaddiDogrulamaProsedurleri/${removeTurkishChars(item.name)}?title=${encodeURIComponent(item.name)}`,
            children: item.children?.map((child: any) => ({
              id: child.id,
              name: child.name,
              parentName: item.name,
              category: "MaddiDogrulama",
              href: `/DenetimKanitlari/MaddiDogrulamaProsedurleri/${removeTurkishChars(item.name)}/${removeTurkishChars(child.name)}?title=${encodeURIComponent(child.name)}`,
            })) || [],
          })) || [];

          dispatch(setMaddiDogrulamaItems(transformedData));

          // localStorage'a kaydet
          localStorage.setItem("maddiDogrulamaData", JSON.stringify(transformedData));
          localStorage.setItem("maddiDogrulamaMetadata", JSON.stringify({
            denetlenenId: user.denetlenenId,
            yil: user.yil,
            denetimTuru: user.denetimTuru
          }));

          console.log("✅ [MaddiDogrulama] Data loaded successfully:", transformedData.length, "items");
        } catch (error: any) {
          console.error("❌ [MaddiDogrulama] Error loading data:", {
            message: error?.message,
            stack: error?.stack,
            user: { denetlenenId: user.denetlenenId, yil: user.yil }
          });

          // localStorage'dan fallback veri yükle
          try {
            const cached = localStorage.getItem("maddiDogrulamaData");
            if (cached) {
              console.log("📦 [MaddiDogrulama] Using fallback cached data after error");
              dispatch(setMaddiDogrulamaItems(JSON.parse(cached)));
            }
          } catch (cacheError) {
            console.warn("⚠️ [MaddiDogrulama] No cached data available");
          }
        }
      };

      loadMaddiDogrulamaData();
    }
  }, [user.token, user.denetlenenId, user.yil, user.denetimTuru, dispatch]);


  return (
    <>
      <SessionWarningDialog
        open={showWarning}
        secondsRemaining={secondsBeforeLogout}
        onKeepSession={onKeepSession}
        onLogout={onLogout}
        maxSeconds={60}
      />
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
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://www.google.com" />
        <link rel="preconnect" href="https://www.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Script
          src="/libs/html-docx.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://www.google.com/recaptcha/api.js?render=6Ld2CyEsAAAAALNU5rSOM_Q2RAWkQ2RADbsS5NQW"
          strategy="afterInteractive"
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
