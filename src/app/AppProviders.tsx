"use client";

import React, { useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useThemeSettings } from "@/utils/theme/Theme";
import { useSelector, useDispatch } from "@/store/hooks";
import { AppState } from "@/store/store";
import { setMaddiDogrulamaItems } from "@/store/dynamicMenu/DynamicMenuSlice";
import { getMaddiDogrulama } from "@/api/MaddiDogrulama/MaddiDogrulama";
import { Provider } from "react-redux";
import { NextAppDirEmotionCacheProvider } from "@/utils/theme/EmotionCache";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store/storeConfig";
import { enqueueSnackbar, SnackbarProvider } from "notistack";
import RTL from "./(Uygulama)/components/Layout/Shared/Customizer/RTL";
import { usePathname, useRouter } from "next/navigation";
import useSessionManagement from "@/utils/useSessionManagement";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { PageTitleProvider } from "@/contexts/PageTitleContext";
import { AuthSessionProvider, useAuthSession } from "@/contexts/AuthSessionContext";
import SessionWarningDialog from "@/components/SessionWarning/SessionWarningDialog";
import { resolveIconNameByMenuTitle } from "@/utils/menuIconResolver";
import GlobalStyles from "@mui/material/GlobalStyles";
import "@/app/api/index";
import "@/utils/i18n";

const removeTurkishChars = (str: string | undefined | null) => {
  if (!str) return "";
  return str
    .replace(/\s/g, "")
    .replace(/\u0131/g, "i")
    .replace(/\u00F6/g, "o")
    .replace(/\u00FC/g, "u")
    .replace(/\u015F/g, "s")
    .replace(/\u011F/g, "g")
    .replace(/\u00E7/g, "c")
    .replace(/\u0130/g, "I")
    .replace(/\u00D6/g, "O")
    .replace(/\u00DC/g, "U")
    .replace(/\u015E/g, "S")
    .replace(/\u011E/g, "G")
    .replace(/\u00C7/g, "C");
};

const InnerProviders = ({ children }: { children: React.ReactNode }) => {
  const { status: authStatus } = useAuthSession();
  const {
    showWarning,
    secondsRemaining,
    maxSeconds,
    onKeepSession,
    onLogout,
    warningReason
  } = useSessionManagement();

  const user = useSelector((state: AppState) => state.userReducer);
  const theme = useThemeSettings();
  const customizer = useSelector(
    (state: AppState) =>
      state.customizer ?? {
        activeMode: "light",
        activeDir: "ltr",
      }
  );
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

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
    ) {
      return;
    }

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
      enqueueSnackbar("Denetlenen Firma Se\u00E7melisiniz", {
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
  }, [user, pathname, router, customizer.activeMode, theme.palette.warning]);

  useEffect(() => {
    if (user.token && user.denetlenenId && user.yil) {
      const loadMaddiDogrulamaData = async () => {
        try {
          const cachedString = localStorage.getItem("maddiDogrulamaData");
          const cachedMetadataStr = localStorage.getItem(
            "maddiDogrulamaMetadata"
          );

          let shouldFetch = true;

          if (cachedString && cachedMetadataStr) {
            try {
              const metadata = JSON.parse(cachedMetadataStr);
              if (
                metadata.denetlenenId === user.denetlenenId &&
                metadata.yil === user.yil &&
                metadata.denetimTuru === user.denetimTuru
              ) {
                shouldFetch = false;
                dispatch(setMaddiDogrulamaItems(JSON.parse(cachedString)));
              }
            } catch (e) {
              console.warn("Error parsing cache metadata", e);
            }
          }

          if (!shouldFetch) {
            return;
          }

          const data = await getMaddiDogrulama(
            user.denetimTuru || "",
            user.denetlenenId || 0,
            user.yil || 0
          );

          const transformedData =
            data?.map((item: any) => ({
              id: item.id,
              name: item.name,
              icon: resolveIconNameByMenuTitle(item.name),
              category: "MaddiDogrulama",
              href: `/DenetimKanitlari/MaddiDogrulamaProsedurleri/${removeTurkishChars(
                item.name
              )}?title=${encodeURIComponent(item.name)}`,
              children:
                item.children?.map((child: any) => ({
                  id: child.id,
                  name: child.name,
                  icon: resolveIconNameByMenuTitle(child.name),
                  parentName: item.name,
                  category: "MaddiDogrulama",
                  href: `/DenetimKanitlari/MaddiDogrulamaProsedurleri/${removeTurkishChars(
                    item.name
                  )}/${removeTurkishChars(
                    child.name
                  )}?title=${encodeURIComponent(child.name)}`,
                })) || [],
            })) || [];

          dispatch(setMaddiDogrulamaItems(transformedData));

          localStorage.setItem(
            "maddiDogrulamaData",
            JSON.stringify(transformedData)
          );
          localStorage.setItem(
            "maddiDogrulamaMetadata",
            JSON.stringify({
              denetlenenId: user.denetlenenId,
              yil: user.yil,
              denetimTuru: user.denetimTuru,
            })
          );
        } catch (error: any) {
          console.error("MaddiDogrulama load error:", error?.message);
          try {
            const cached = localStorage.getItem("maddiDogrulamaData");
            if (cached) {
              dispatch(setMaddiDogrulamaItems(JSON.parse(cached)));
            }
          } catch {
            console.warn("No cached MaddiDogrulama data available");
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
        secondsRemaining={secondsRemaining}
        onKeepSession={onKeepSession}
        onLogout={onLogout}
        maxSeconds={maxSeconds}
        reason={warningReason}
      />
      <NextAppDirEmotionCacheProvider
        options={{ key: "financial-audit-software" }}
      >
        <SnackbarProvider anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <ThemeProvider theme={theme}>
            <GlobalStyles styles={{
              '.ht-theme-horizon': {
                '--ht-interactive-active-color': `${theme.palette.primary.main} !important`,
                '--ht-primary-color': `${theme.palette.primary.main} !important`,
                '--ht-colors-primary-500': `${theme.palette.primary.main} !important`,
                '--ht-colors-primary-600': `${theme.palette.primary.main} !important`,
                '--ht-colors-success-500': `${theme.palette.primary.main} !important`,
                '--ht-colors-success-600': `${theme.palette.primary.main} !important`,
                '--ht-button-primary-background-color': `transparent !important`,
              },
              '.ht-theme-horizon .changeType': {
                backgroundImage: 'none !important',
                display: 'flex !important',
                alignItems: 'center !important',
                justifyContent: 'center !important',
                transition: 'transform 0.2s ease !important',
                backgroundColor: 'transparent !important',
                borderRadius: '0 !important',
                border: 'none !important',
                outline: 'none !important',
                boxShadow: 'none !important'
              },
              '.ht-theme-horizon .changeType:hover, .ht-theme-horizon .changeType:focus, .ht-theme-horizon .changeType:active': {
                backgroundColor: 'transparent !important',
                transform: 'scale(1.3) !important',
                border: 'none !important',
                outline: 'none !important',
                boxShadow: 'none !important'
              },
              '.ht-theme-horizon .changeType::before, .ht-theme-horizon .changeType:hover::before': {
                content: '""',
                display: 'block !important',
                width: '12px !important',
                height: '12px !important',
                backgroundColor: 'currentColor !important',
                maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolygon points='22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3'/%3E%3C/svg%3E")`,
                WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolygon points='22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3'/%3E%3C/svg%3E")`,
                maskSize: 'contain !important',
                WebkitMaskSize: 'contain !important',
                maskRepeat: 'no-repeat !important',
                WebkitMaskRepeat: 'no-repeat !important',
              },
              '.ht-theme-horizon .htFiltersMenuCondition a': {
                color: `${theme.palette.primary.main} !important`,
                fontWeight: 'bold !important'
              },
              '.ht-theme-horizon .htUIBtn': {
                backgroundColor: `transparent !important`,
                borderColor: `${theme.palette.primary.main} !important`,
                color: `black !important`,
                borderWidth: '1px !important',
                borderStyle: 'solid !important',
                boxShadow: 'none !important'
              },
              '.ht-theme-horizon .htUIBtn:hover': {
                backgroundColor: `rgba(0,0,0,0.05) !important`,
                color: `black !important`
              },
              '.ht-theme-horizon .htUIBtn.htUIBtn-primary': {
                backgroundColor: `transparent !important`,
                borderColor: `${theme.palette.primary.main} !important`,
                color: `black !important`
              },
              // Sadece seçili durumlarda (aktif/highlight) tablodan gelen temanın rengini almasını sağlayan blok:
              '.handsontable th.ht__active_highlight, .handsontable th.ht__highlight': {
                backgroundColor: `${theme.palette.primary.light} !important`,
                color: `${theme.palette.primary.main} !important`
              }
            }} />
            <LoadingProvider>
              <PageTitleProvider>
                <RTL direction={customizer.activeDir}>
                  <CssBaseline />
                  {children}
                </RTL>
              </PageTitleProvider>
            </LoadingProvider>
          </ThemeProvider>
        </SnackbarProvider>
      </NextAppDirEmotionCacheProvider>
    </>
  );
};

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthSessionProvider>
          <InnerProviders>{children}</InnerProviders>
        </AuthSessionProvider>
      </PersistGate>
    </Provider>
  );
}
