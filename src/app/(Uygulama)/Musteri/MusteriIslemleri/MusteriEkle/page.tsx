"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import { Grid } from "@mui/material";
import MusteriEkleForm from "@/app/(Uygulama)/components/Musteri/MusteriIslemleri/MusteriEkleForm";
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
  {
    to: "/Musteri/MusteriIslemleri/MusteriEkle",
    title: "Müşteri Ekle",
  },
];

const Page = () => {
  return (
    <ProtectedRoute allowedRoles={["DenetciAdmin"]}>
      <PageContainer title="Müşteri Ekle" description="this is Müşteri Ekle">
        <Breadcrumb title="Müşteri Ekle" items={BCrumb} />
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ParentCard title="Yeni Müşteri">
              <MusteriEkleForm />
            </ParentCard>
          </Grid>
        </Grid>
      </PageContainer>
    </ProtectedRoute>
  );
};

export default Page;
