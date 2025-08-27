"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Grid } from "@mui/material";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import DenetciDuzenleForm from "@/app/(Uygulama)/components/DigerIslemler/DenetciFirmaBilgileri/DenetciDuzenleForm";
import LogoDuzenleForm from "@/app/(Uygulama)/components/DigerIslemler/DenetciFirmaBilgileri/LogoDuzenleForm";
import ProtectedRoute from "@/app/ProtectedRoute";

const BCrumb = [
  {
    to: "/DigerIslemler",
    title: "Diğer İşlemler",
  },
  {
    to: "/DigerIslemler/DenetciFirmaBilgileri",
    title: "Denetçi Firma Bilgileri",
  },
];

const Page = () => {
  return (
    <ProtectedRoute allowedRoles={["DenetciAdmin"]}>
      <PageContainer
        title="Denetçi Firma Bilgileri"
        description="this is Denetçi Firma Bilgileri"
      >
        <Breadcrumb title="Denetçi Firma Bilgileri" items={BCrumb} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={12}>
            <ParentCard title="Logo">
              <LogoDuzenleForm />
            </ParentCard>
          </Grid>
          <Grid item xs={12} md={12} lg={12}>
            <ParentCard title="Denetçi">
              <DenetciDuzenleForm />
            </ParentCard>
          </Grid>
        </Grid>
      </PageContainer>
    </ProtectedRoute>
  );
};

export default Page;
