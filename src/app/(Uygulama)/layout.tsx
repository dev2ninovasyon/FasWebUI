"use client";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { styled, useTheme } from "@mui/material/styles";
import React, { useState } from "react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import Sidebar from "./components/Layout/Vertical/Sidebar/Sidebar";
import Header from "./components/Layout/Vertical/Header/Header";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PageLoadingOverlay from "@/components/shared/PageLoadingOverlay";
import { setKurulumTamamlandi, setDenetlenenId, setDenetlenenFirmaAdi, setYil, setDenetimTuru, setBobimi, setTfrsmi, setEnflasyonmu, setKonsolidemi, setRol as setStoreRol, setDenetlenen, setToken, setRefreshToken } from "@/store/user/UserSlice";
import { updateSonSecilenAyarlari } from "@/api/Kullanici/KullaniciAyarlar";
import MandatoryFlow from "./components/Layout/Mandatory/MandatoryFlow";
import { useDispatch } from "@/store/hooks";
import { getDenetlenenByRolForSelection, getDenetlenenByDenetciIdForSelection } from "@/api/Musteri/MusteriIslemleri";
import { getRol } from "@/api/Sozlesme/DenetimKadrosuAtama";
import { apiFetch } from "@/api/apiBase";
import Logger from "@/utils/Logger";

const LOGOUT_INTENT_KEY = "fas_logout_intent";

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

interface Props {
  children: React.ReactNode;
}

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
  const [isSidebarHover, setIsSidebarHover] = useState(false);
  const [control, setControl] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
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

  // Initial authentication check & Role-based flow
  useEffect(() => {
    const checkFlow = async () => {
      if (typeof window !== "undefined" && user.token) {
        clearLogoutIntent();
        setControl(true);
        setIsChecking(false);

        // If company is already selected, everything is fine
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

          const hasCompanies = companies && companies.length > 0;
          console.log("Layout - Companies found:", companies?.length, { hasCompanies, yetki: user.yetki });

          if (user.yetki === "DenetciAdmin") {
            if (!hasCompanies) {
              // No companies and is Admin -> Must use Wizard
              setIsWizardOpen(true);
            } else {
              // Has companies but none selected -> Mandatory Selection
              setIsSelectionModalOpen(true);
            }
          } else {
            // Not Admin
            if (!hasCompanies) {
              // No companies and NOT Admin -> Show Warning
              setNoCompanyWarning(true);
            } else {
              // Has companies and NOT Admin -> Mandatory Selection
              setIsSelectionModalOpen(true);
            }
          }
        } catch (error) {
          console.log("Flow check error:", error);
        } finally {
          setIsLoadingCompanies(false);
        }
      } else if (typeof window !== "undefined" && !user.token) {
        const sessionToken = window.sessionStorage.getItem("fas_session_token");
        const sessionRefreshToken = window.sessionStorage.getItem("fas_session_refreshToken");
        if (sessionToken) {
          dispatch(setToken(sessionToken));
          if (sessionRefreshToken) {
            dispatch(setRefreshToken(sessionRefreshToken));
          }
          setIsChecking(false);
          return;
        }

        // Cookie bazlı session varsa login'e atmadan önce tek sefer refresh dene.
        try {
          const currentRefreshToken = window.sessionStorage.getItem("fas_session_refreshToken");
          if (!currentRefreshToken) {
            throw new Error("Refresh token yok");
          }
          const refreshResponse = await apiFetch("/Auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: currentRefreshToken, RefreshToken: currentRefreshToken }),
            ignoreCustomHeaders: true,
            suppressErrorLog: true,
          });

          if (refreshResponse?.ok) {
            const refreshData = await refreshResponse.json().catch(() => null);
            const token = refreshData?.token || refreshData?.Token;
            const refreshToken = refreshData?.refreshToken || refreshData?.RefreshToken;
            if (token) {
              window.sessionStorage.setItem("fas_session_token", token);
              dispatch(setToken(token));
            }
            if (refreshToken) {
              window.sessionStorage.setItem("fas_session_refreshToken", refreshToken);
              dispatch(setRefreshToken(refreshToken));
            }
            setIsChecking(false);
            return;
          }
        } catch {
          // refresh başarısızsa login'e yönlendirilecek
        }

        setIsWizardOpen(false);
        setIsSelectionModalOpen(false);
        setNoCompanyWarning(false);
        setIsChecking(false);
        if (hasLogoutIntent()) {
          clearLogoutIntent();
          router.push("/");
        } else {
          console.warn("⚠️ Layout: logout intent yok, login redirect atlandı.");
          setControl(true);
        }
      }
    };

    checkFlow();
  }, [user.token, user.denetlenenId, user.yil, user.yetki, user.kurulumTamamlandi, router, control]);

  // Handle logout scenario
  useEffect(() => {
    if (control && !user.token) {
      if (hasLogoutIntent()) {
        clearLogoutIntent();
        setIsWizardOpen(false);
        setIsSelectionModalOpen(false);
        setNoCompanyWarning(false);
        router.push("/");
        setControl(false);
      } else {
        console.warn("⚠️ Layout: token yok ama logout intent yok, login'e yönlendirme yapılmadı.");
      }
    }
  }, [user.token, control, router]);
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

        // 🔄 TOKEN REFRESH: DB güncellendikten sonra yeni token al
        try {
          const currentRefreshToken = window.sessionStorage.getItem("fas_session_refreshToken");
          if (!currentRefreshToken) {
            console.warn("⚠️ Layout - Refresh token yok, token refresh atlandı.");
            return;
          }
          await apiFetch("/Auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: currentRefreshToken, RefreshToken: currentRefreshToken }),
            suppressErrorLog: true,
          });
          console.log("✅ Layout - Cookie session refresh successful.");
        } catch (refreshErr) {
          console.warn("⚠️ Layout - Token refresh hatası:", refreshErr);
        }
      }
    } catch (e) {
      console.log("Layout - Error during selection processing:", e);
    }

    // Modal state update is not needed here as it's triggered by Redux and useEffect,
    // and followed by a full page reload anyway.
    // Persistence sync için çok kısa bir bekleme (50ms)
    setTimeout(() => {
      window.location.reload();
    }, 50);
  };

  if (isChecking || isLoadingCompanies) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100dvh",
          width: "100dvw",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (user.token && (isWizardOpen || isSelectionModalOpen || noCompanyWarning)) {
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
    control ? (
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
