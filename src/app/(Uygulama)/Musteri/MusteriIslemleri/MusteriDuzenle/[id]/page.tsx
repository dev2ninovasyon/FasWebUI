"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import { Grid } from "@mui/material";
import MusteriDuzenleForm from "@/app/(Uygulama)/components/Musteri/MusteriIslemleri/MusteriDuzenleForm";
import ProtectedRoute from "@/app/ProtectedRoute";

const BCrumb = [
  {
    to: "/Musteri",
    title: "Müşteri",
  },
  {
    to: "/Musteri/MusteriIslemleri",
    title: "Müşteri İşlemleri",
  },
];

const Page = () => {
  return (
    <ProtectedRoute allowedRoles={["DenetciAdmin"]}>
      <PageContainer
        title="Müşteri Düzenle"
        description="this is Müşteri Düzenle"
      >
        <Breadcrumb title="Müşteri Düzenle" items={BCrumb} />
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ParentCard title="Müşteri Düzenle">
              <MusteriDuzenleForm />
            </ParentCard>
          </Grid>
        </Grid>
      </PageContainer>
    </ProtectedRoute>
  );
};

export default Page;
