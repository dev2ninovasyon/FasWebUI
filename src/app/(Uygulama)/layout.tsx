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
import { setKurulumTamamlandi, setDenetlenenId, setDenetlenenFirmaAdi, setYil, setDenetimTuru, setBobimi, setTfrsmi, setEnflasyonmu, setKonsolidemi, setRol as setStoreRol } from "@/store/user/UserSlice";
import { updateSonSecilenAyarlari } from "@/api/Kullanici/KullaniciAyarlar";
import MandatoryFlow from "./components/Layout/Mandatory/MandatoryFlow";
import { useDispatch } from "@/store/hooks";
import { getDenetlenenByRol, getDenetlenenByDenetciId } from "@/api/Musteri/MusteriIslemleri";
import { getRol } from "@/api/Sozlesme/DenetimKadrosuAtama";

const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
}));

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  paddingBottom: "60px",
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
  const customizer = useSelector((state: AppState) => state.customizer);
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
            companies = await getDenetlenenByDenetciId(user.token, user.denetciId || 0);
          } else {
            companies = await getDenetlenenByRol(user.token, user.denetciId || 0, user.id || 0);
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
          console.error("Flow check error:", error);
        } finally {
          setIsLoadingCompanies(false);
        }
      } else if (typeof window !== "undefined" && !user.token) {
        // Token yoksa login'e yönlendir
        router.push("/");
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
    dispatch(setDenetlenenId(data.id));
    dispatch(setDenetlenenFirmaAdi(data.adi));
    dispatch(setYil(data.year));
    dispatch(setDenetimTuru(data.denetimTuru));
    dispatch(setBobimi(data.bobimi));
    dispatch(setTfrsmi(data.tfrsmi));
    dispatch(setEnflasyonmu(data.enflasyonmu));
    dispatch(setKonsolidemi(data.konsolidemi));

    localStorage.setItem("fas_denetlenenId", data.id.toString());
    localStorage.setItem("fas_yil", data.year.toString());

    try {
      const rolVerileri = await getRol(user.token!, user.id!, data.id, data.year);
      if (rolVerileri) {
        dispatch(setStoreRol(rolVerileri.rol));
      }

      if (user.token && user.id && user.id !== 0) {
        console.log(`Layout - Persisting selection for user ${user.id}: Company=${data.id}, Year=${data.year}`);
        await updateSonSecilenAyarlari(user.token, user.id, data.id, data.year);
        console.log("Layout - Persistence update successful.");
      } else {
        console.warn("Layout - Skipping persistence update: Invalid user state.", { token: !!user.token, id: user.id });
      }
    } catch (e) {
      console.error("Layout - Error during selection processing:", e);
    }

    setIsSelectionModalOpen(false);
    // Force reload to apply session
    window.location.reload();
  };

  if (isChecking || isLoadingCompanies) {
    return (
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

            <Box sx={{ minHeight: "calc(100vh - 170px)" }}>
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
