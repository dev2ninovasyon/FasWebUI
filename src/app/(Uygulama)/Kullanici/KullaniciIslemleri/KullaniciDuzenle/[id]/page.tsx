"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import { Grid } from "@mui/material";
import KullaniciDuzenleForm from "@/app/(Uygulama)/components/Kullanici/KullaniciIslemleri/KullaniciDuzenleForm";
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
];

const Page = () => {
  return (
    <ProtectedRoute allowedRoles={["DenetciAdmin"]}>
      <PageContainer
        title="Kullanıcı Düzenle"
        description="this is Kullanıcı Düzenle"
      >
        <Breadcrumb title="Kullanıcı Düzenle" items={BCrumb} />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ParentCard title="Kullanıcı Düzenle">
              <KullaniciDuzenleForm />
            </ParentCard>
          </Grid>
        </Grid>
      </PageContainer>
    </ProtectedRoute>
  );
};

export default Page;
