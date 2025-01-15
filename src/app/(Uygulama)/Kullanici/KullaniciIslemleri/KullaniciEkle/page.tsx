"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import { Grid } from "@mui/material";
import KullaniciEkleForm from "@/app/(Uygulama)/components/Kullanici/KullaniciIslemleri/KullaniciEkleForm";
import ProtectedRoute from "@/app/ProtectedRoute";

const BCrumb = [
  {
    to: "/Kullanici",
    title: "Kullanıcı",
  },
  {
    to: "/Kullanici/KullaniciIslemleri",
    title: "Kullanıcı İşlemleri",
  },
  {
    to: "/Kullanici/KullaniciIslemleri/KullaniciEkle",
    title: "Kullanıcı Ekle",
  },
];

const Page = () => {
  return (
    <ProtectedRoute allowedRoles={["DenetciAdmin"]}>
      <PageContainer
        title="Kullanıcı Ekle"
        description="this is Kullanıcı Ekle"
      >
        <Breadcrumb title="Kullanıcı Ekle" items={BCrumb} />
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ParentCard title="Yeni Kullanıcı">
              <KullaniciEkleForm />
            </ParentCard>
          </Grid>
        </Grid>
      </PageContainer>
    </ProtectedRoute>
  );
};

export default Page;
