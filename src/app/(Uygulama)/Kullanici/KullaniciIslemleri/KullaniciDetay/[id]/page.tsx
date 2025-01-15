"use client";

import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Grid } from "@mui/material";
import KullaniciDetay from "@/app/(Uygulama)/components/Kullanici/KullaniciIslemleri/KullaniciDetay";
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
        title="Kullanıcı Detay"
        description="this is Kullanıcı Detay"
      >
        <Breadcrumb title="Kullanıcı Detay" items={BCrumb} />
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ParentCard title="Kullanıcı Detay">
              <KullaniciDetay />
            </ParentCard>
          </Grid>
        </Grid>
      </PageContainer>
    </ProtectedRoute>
  );
};

export default Page;
