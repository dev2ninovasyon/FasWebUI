// src/app/(Uygulama)/dashboard/page.tsx
"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box } from "@mui/material";
import dynamic from "next/dynamic";
import { usePageTitle } from "@/hooks/usePageTitle";
const SonIslemlerKartlari = dynamic(() => import("@/app/(Uygulama)/components/AnaSayfa/SonIslemlerKartlari").then(m => m.SonIslemlerKartlari), { ssr: false });
const SirketArsivOzetKartlari = dynamic(() => import("@/app/(Uygulama)/components/AnaSayfa/SirketArsivOzetKartlari").then(m => m.SirketArsivOzetKartlari), { ssr: false });
import DriverTour from "@/app/(Uygulama)/components/Dashboards/DriverTour";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "@/store/hooks";
import { AppState } from "@/store/store";
import { updateTurTamamlandi } from "@/api/Kullanici/KullaniciAyarlar";
import { setTurTamamlandi as setTurTamamlandiRedux } from "@/store/user/UserSlice";

const BCrumb = [
  {
    to: "/",
    title: "Ana Sayfa",
  },
];

export default function DashboardPage() {
  usePageTitle("Ana Sayfa");
  const user = useSelector((state: AppState) => state.userReducer);
  const dispatch = useDispatch();
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    // console.time("Anasayfa Toplam Yüklenme");
    if (user.turTamamlandi === false) {
      setRunTour(true);
    }
    return () => { /* console.timeEnd("Anasayfa Toplam Yüklenme"); */ };
  }, [user.turTamamlandi]);

  const handleCloseTour = async () => {
    setRunTour(false);
    if (user.turTamamlandi === false) {
      try {
        await updateTurTamamlandi(user.id || 0, true);
        dispatch(setTurTamamlandiRedux(true));
      } catch (error) {
        console.log("Tur durumu güncellenirken hata oluştu:", error);
      }
    }
  };

  return (
    <PageContainer title="Dashboard" description="Genel Bakış">
      <Breadcrumb title="Ana Sayfa" items={BCrumb} />
      <Box mt={2}>
        {/* Diğer dashboard bileşenlerinin üstüne/altına koyabilirsin */}
        <DriverTour run={runTour} onClose={handleCloseTour} />
        <SonIslemlerKartlari />
        <SirketArsivOzetKartlari />
      </Box>
    </PageContainer>
  );
}
