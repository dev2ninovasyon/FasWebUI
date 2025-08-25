"use client";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled, useTheme } from "@mui/material/styles";
import React, { useState } from "react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import Sidebar from "./components/Layout/Vertical/Sidebar/Sidebar";
import Header from "./components/Layout/Vertical/Header/Header";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
  useEffect(() => {
    // Sadece client-side'da çalışmasını sağla
    if (typeof window !== "undefined") {
      // Eğer token yoksa kullanıcıyı login sayfasına yönlendir
      if (!user.token) {
        router.push("/");
      } else {
        setControl(true);
      }
    }
  }, [user.token]);
  return (
    <>
      {control && (
        <MainWrapper>
          {/* ------------------------------------------- */}
          {/* Sidebar */}
          {/* ------------------------------------------- */}
          <Sidebar
            isSidebarHover={isSidebarHover}
            setIsSidebarHover={setIsSidebarHover}
          />
          {/* ------------------------------------------- */}
          {/* Main Wrapper */}
          {/* ------------------------------------------- */}
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
            {/* ------------------------------------------- */}
            {/* Header */}
            {/* ------------------------------------------- */}
            <Header isSidebarHover={isSidebarHover} />
            {/* PageContent */}
            <Container
              sx={{
                maxWidth:
                  customizer.isLayout === "boxed" ? "lg" : "100% !important",
              }}
            >
              {/* ------------------------------------------- */}
              {/* PageContent */}
              {/* ------------------------------------------- */}
              <Box sx={{ minHeight: "calc(100vh - 170px)" }}>
                {/* <Outlet /> */}
                {children}
                {/* <Index /> */}
              </Box>
              {/* ------------------------------------------- */}
              {/* End Page */}
              {/* ------------------------------------------- */}
            </Container>
          </PageWrapper>
        </MainWrapper>
      )}
    </>
  );
}
