// src/app/(Uygulama)/dashboard/page.tsx
"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box } from "@mui/material";
import { SonIslemlerKartlari } from "@/app/(Uygulama)/components/AnaSayfa/SonIslemlerKartlari";
import { SirketArsivOzetKartlari } from "@/app/(Uygulama)/components/AnaSayfa/SirketArsivOzetKartlari";
import DriverTour from "@/app/(Uygulama)/components/Dashboards/DriverTour";
import { useState } from "react";

const BCrumb = [
  {
    to: "/",
    title: "Ana Sayfa",
  },
];

export default function DashboardPage() {
  const [runTour, setRunTour] = useState(true);
  return (
    <PageContainer title="Dashboard" description="Genel Bakış">
      <Breadcrumb title="Ana Sayfa" items={BCrumb} />
      <Box mt={2}>
        {/* Diğer dashboard bileşenlerinin üstüne/altına koyabilirsin */}
        <DriverTour run={runTour} onClose={() => setRunTour(false)} />
        <SonIslemlerKartlari />
        <SirketArsivOzetKartlari />
      </Box>
    </PageContainer>
  );
}
