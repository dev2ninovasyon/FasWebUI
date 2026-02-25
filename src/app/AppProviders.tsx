"use client";

import React, { useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeSettings } from "@/utils/theme/Theme";
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
import useAutoLogout from "@/utils/useAutoLogOut";
import { LoadingProvider } from "@/contexts/LoadingContext";
import SessionWarningDialog from "@/components/SessionWarning/SessionWarningDialog";
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
  const { showWarning, secondsBeforeLogout, onKeepSession, onLogout } =
    useAutoLogout(90 * 60 * 1000, 45 * 60 * 1000, 60 * 1000);

  const user = useSelector((state: AppState) => state.userReducer);
  const theme = ThemeSettings();
  const customizer = useSelector((state: AppState) => state.customizer);
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
              category: "MaddiDogrulama",
              href: `/DenetimKanitlari/MaddiDogrulamaProsedurleri/${removeTurkishChars(
                item.name
              )}?title=${encodeURIComponent(item.name)}`,
              children:
                item.children?.map((child: any) => ({
                  id: child.id,
                  name: child.name,
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
        secondsRemaining={secondsBeforeLogout}
        onKeepSession={onKeepSession}
        onLogout={onLogout}
        maxSeconds={60}
      />
      <NextAppDirEmotionCacheProvider
        options={{ key: "financial-audit-software" }}
      >
        <SnackbarProvider anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <ThemeProvider theme={theme}>
            <LoadingProvider>
              <RTL direction={customizer.activeDir}>
                <CssBaseline />
                {children}
              </RTL>
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
        <InnerProviders>{children}</InnerProviders>
      </PersistGate>
    </Provider>
  );
}
