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
import { url } from "@/api/apiBase";
import Logger from "@/utils/Logger";

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
  const customizer = useSelector((state: AppState) => state.customizer);  // Global error logging for development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const handleError = (event: ErrorEvent) => {
        Logger.error(`Window Error: ${event.message}`, event.error);
      };

      const handleRejection = (event: PromiseRejectionEvent) => {
        Logger.error(`Unhandled Rejection: ${event.reason?.message || event.reason}`, event.reason);
      };

      window.addEventListener("error", handleError);
      window.addEventListener("unhandledrejection", handleRejection);

      return () => {
        window.removeEventListener("error", handleError);
        window.removeEventListener("unhandledrejection", handleRejection);
      };
    }
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

  // Initial authentication check & Role-based flow
  useEffect(() => {
    const checkFlow = async () => {
      if (typeof window !== "undefined" && user.token) {
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
        // Token yoksa login'e yönlendir
        // ⚠️ ÖNEMLİ: Persist rehydration henüz tamamlanmamış olabilir
        const localToken = localStorage.getItem("fas_token");
        const localDenetlenenId = localStorage.getItem("fas_denetlenenId");

        if (!localToken) {
          router.push("/");
        } else {
          // Token localStorage'da var ama Redux'ta henüz yok
          // Persist rehydration devam ediyor, hiçbir yönlendirme yapma, bekle
          console.log("⏳ Persist rehydration bekleniyor (Token var)...");
        }
      }
    };

    checkFlow();
  }, [user.token, user.denetlenenId, user.yil, user.yetki, user.kurulumTamamlandi, router]);

  // Handle logout scenario
  useEffect(() => {
    if (control && !user.token) {
      router.push("/");
      setControl(false);
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
        const refreshToken = localStorage.getItem("fas_refreshToken");
        if (refreshToken) {
          try {
            const refreshResponse = await fetch(`${url.endsWith('/') ? url.slice(0, -1) : url}/Auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ RefreshToken: refreshToken }),
              credentials: 'include',
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              if (refreshData?.token) {
                localStorage.setItem("fas_token", refreshData.token);
                localStorage.setItem("fas_refreshToken", refreshData.refreshToken);
                dispatch(setToken(refreshData.token));
                dispatch(setRefreshToken(refreshData.refreshToken));
                console.log("✅ Layout - Token refresh successful.");
              }
            }
          } catch (refreshErr) {
            console.warn("⚠️ Layout - Token refresh hatası:", refreshErr);
          }
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

  if (isWizardOpen || isSelectionModalOpen || noCompanyWarning) {
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
