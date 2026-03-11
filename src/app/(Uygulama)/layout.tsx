"use client";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";
import { styled, useTheme } from "@mui/material/styles";
import React, { useState } from "react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import Sidebar from "./components/Layout/Vertical/Sidebar/Sidebar";
import Header from "./components/Layout/Vertical/Header/Header";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PageLoadingOverlay from "@/components/shared/PageLoadingOverlay";
import { setKurulumTamamlandi, setRol as setStoreRol, setDenetlenen } from "@/store/user/UserSlice";
import { updateSonSecilenAyarlari } from "@/api/Kullanici/KullaniciAyarlar";
import MandatoryFlow from "./components/Layout/Mandatory/MandatoryFlow";
import { useDispatch } from "@/store/hooks";
import { getDenetlenenByRolForSelection, getDenetlenenByDenetciIdForSelection } from "@/api/Musteri/MusteriIslemleri";
import { getRol } from "@/api/Sozlesme/DenetimKadrosuAtama";
import { useAuthSession } from "@/contexts/AuthSessionContext";
import Logger from "@/utils/Logger";
import { LOGOUT_INTENT_KEY } from "@/utils/authSession";

const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100dvh",
  width: "100%",
}));

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  paddingBottom: "0px", // footer spacing handled by inner Box via --footer-height
  flexDirection: "column",
  zIndex: 1,
  width: "100%",
  backgroundColor: "transparent",
}));

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customizer = useSelector((state: AppState) => state.customizer); // Global error logging
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      Logger.error(`Window Error: ${event.message}`, event.error ?? {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }, { source: "window" });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      Logger.error(
        `Unhandled Rejection: ${event.reason?.message || String(event.reason)}`,
        event.reason,
        { source: "window" }
      );
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  const theme = useTheme();
  const router = useRouter();
  const user = useSelector((state: AppState) => state.userReducer);
  const { status: authStatus, refreshSession } = useAuthSession();
  const [isSidebarHover, setIsSidebarHover] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [noCompanyWarning, setNoCompanyWarning] = useState(false);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

  const dispatch = useDispatch();
  const hasLogoutIntent = () => {
    if (typeof window === "undefined") return false;
    return !!window.sessionStorage.getItem(LOGOUT_INTENT_KEY);
  };
  const clearLogoutIntent = () => {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(LOGOUT_INTENT_KEY);
  };

  useEffect(() => {
    let cancelled = false;

    const checkFlow = async () => {
      if (authStatus !== "authenticated") {
        setIsLoadingCompanies(false);
        setIsWizardOpen(false);
        setIsSelectionModalOpen(false);
        setNoCompanyWarning(false);
        return;
      }

      clearLogoutIntent();

      if (user.denetlenenId && user.yil && user.denetlenenFirmaAdi) {
        setIsWizardOpen(false);
        setIsSelectionModalOpen(false);
        setNoCompanyWarning(false);
        return;
      }

      setIsLoadingCompanies(true);
      try {
        let companies = [];
        if (user.yetki === "DenetciAdmin") {
          companies = await getDenetlenenByDenetciIdForSelection(user.denetciId || 0);
        } else {
          companies = await getDenetlenenByRolForSelection(user.denetciId || 0, user.id || 0);
        }
        if (cancelled) return;

        const hasCompanies = companies && companies.length > 0;
        if (user.yetki === "DenetciAdmin") {
          setIsWizardOpen(!hasCompanies);
          setIsSelectionModalOpen(hasCompanies);
          setNoCompanyWarning(false);
        } else {
          setNoCompanyWarning(!hasCompanies);
          setIsSelectionModalOpen(hasCompanies);
          setIsWizardOpen(false);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn("Flow check error:", error);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingCompanies(false);
        }
      }
    };

    checkFlow();
    return () => { cancelled = true; };
  }, [authStatus, user.denetlenenId, user.yil, user.denetlenenFirmaAdi, user.yetki, user.denetciId, user.id]);


  useEffect(() => {
    if (authStatus !== "unauthenticated") return;
    if (typeof window === 'undefined') return;
    if (hasLogoutIntent()) clearLogoutIntent();
    if (window.location.pathname !== '/') {
      Logger.warn("Layout: Oturum yok, giriş sayfasına yönlendiriliyor.", undefined, { source: "system" });
      router.replace('/');
    }
  }, [authStatus, router]);

  // Handle selection from MandatoryFlow
  const handleSelection = async (data: any) => {


    dispatch(setDenetlenen(data));

    localStorage.setItem("fas_denetlenenId", data.id.toString());
    localStorage.setItem("fas_yil", data.year.toString());

    try {
      const rolVerileri = await getRol(user.id!, data.id, data.year);
      if (rolVerileri) {
        dispatch(setStoreRol(rolVerileri.rol));
      }

      if (user.token && user.id && user.id !== 0) {
        await updateSonSecilenAyarlari(user.id, data.id, data.year);
        await refreshSession({ forceRefresh: true });
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.warn("Layout - Seçim işleme hatası:", e);
      }
    }

    // Modal state update is not needed here as it's triggered by Redux and useEffect,
    // and followed by a full page reload anyway.
    // Persistence sync için çok kısa bir bekleme (50ms)
    setTimeout(() => {
      window.location.reload();
    }, 50);
  };

  const requiresMandatoryFlow =
    authStatus === "authenticated" &&
    (!user.denetlenenId || !user.yil || !user.denetlenenFirmaAdi);
  const shouldHoldAppShell =
    requiresMandatoryFlow &&
    !isWizardOpen &&
    !isSelectionModalOpen &&
    !noCompanyWarning;

  if (authStatus === "loading" || isLoadingCompanies || shouldHoldAppShell) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100dvh", width: "100dvw" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (authStatus === "authenticated" && (isWizardOpen || isSelectionModalOpen || noCompanyWarning)) {
    return (
      <MandatoryFlow
        type={isWizardOpen ? "wizard" : noCompanyWarning ? "warning" : "selection"}
        userRole={user.yetki || ""}
        initialCompanyId={user.sonSecilenDenetlenenId || user.denetlenenId}
        initialYear={user.sonSecilenYil || user.yil}
        onComplete={() => {
          setIsWizardOpen(false);
          dispatch(setKurulumTamamlandi(true));
        }}
        onSelect={handleSelection}
      />
    );
  }

  return (
    authStatus === "authenticated" ? (
      <MainWrapper>
        {/* Sidebar */}
        <Sidebar
          isSidebarHover={isSidebarHover}
          setIsSidebarHover={setIsSidebarHover}
        />
        {/* Main Wrapper */}
        <PageWrapper
          className="page-wrapper"
          style={{ ['--appbar-height' as any]: `${customizer.TopbarHeight}px`, ['--footer-height' as any]: '60px' }}
          sx={{
            ...(customizer.isCollapse && {
              [theme.breakpoints.up("lg")]: {
                ml: `${customizer.MiniSidebarWidth}px`,
              },
            }),
          }}
        >
          {/* Header */}
          <Header isSidebarHover={isSidebarHover} />
          {/* PageContent */}
          <Container
            sx={{
              maxWidth:
                customizer.isLayout === "boxed" ? "lg" : "100% !important",
              position: "relative",
            }}
          >
            {/* Page Loading Overlay */}
            <PageLoadingOverlay />

            <Box sx={{ minHeight: "calc(100dvh - var(--appbar-height) - var(--footer-height))" }}>
              {children}
            </Box>

            {/* End Page */}
          </Container>
        </PageWrapper>
      </MainWrapper>
    ) : (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100vw",
        }}
      >
        <CircularProgress />
      </Box>
    )
  );
}
