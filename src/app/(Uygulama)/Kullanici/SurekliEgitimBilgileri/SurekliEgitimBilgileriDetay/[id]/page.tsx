"use client";

import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Grid } from "@mui/material";
import ProtectedRoute from "@/app/ProtectedRoute";
import SurekliEgitimBilgileriDetay from "@/app/(Uygulama)/components/Kullanici/SurekliEgitimBilgileri/SurekliEgitimBilgileriDetay";

const BCrumb = [
  {
    to: "/Kullanici",
    title: "Kullanıcı",
  },
  {
    to: "/Kullanici/SurekliEgitimBilgileri",
    title: "Sürekli Eğitim Bilgileri",
  },
];

const Page = () => {
  return (
    <ProtectedRoute allowedRoles={["DenetciAdmin"]}>
      <PageContainer
        title="Sürekli Eğitim Bilgileri Detay"
        description="this is Sürekli Eğitim Bilgileri Detay"
      >
        <Breadcrumb title="Sürekli Eğitim Bilgileri Detay" items={BCrumb} />
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ParentCard title="Sürekli Eğitim Bilgileri Detay">
              <SurekliEgitimBilgileriDetay />
            </ParentCard>
          </Grid>
        </Grid>
      </PageContainer>
    </ProtectedRoute>
  );
};

export default Page;
