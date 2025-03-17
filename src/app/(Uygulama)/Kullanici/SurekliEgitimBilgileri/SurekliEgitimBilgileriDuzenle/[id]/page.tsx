"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import { Grid } from "@mui/material";
import ProtectedRoute from "@/app/ProtectedRoute";
import SurekliEgitimBilgileriDuzenleForm from "@/app/(Uygulama)/components/Kullanici/SurekliEgitimBilgileri/SurekliEgitimBilgileriDuzenleForm";

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
        title="Sürekli Eğitim Bilgileri Düzenle"
        description="this is Sürekli Eğitim Bilgileri Düzenle"
      >
        <Breadcrumb title="Sürekli Eğitim Bilgileri Düzenle" items={BCrumb} />
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ParentCard title="Sürekli Eğitim Bilgileri Düzenle">
              <SurekliEgitimBilgileriDuzenleForm />
            </ParentCard>
          </Grid>
        </Grid>
      </PageContainer>
    </ProtectedRoute>
  );
};

export default Page;
