"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import { Grid } from "@mui/material";
import ProtectedRoute from "@/app/ProtectedRoute";
import SurekliEgitimBilgileriEkleForm from "@/app/(Uygulama)/components/Kullanici/SurekliEgitimBilgileri/SurekliEgitimBilgileriEkleForm";

const BCrumb = [
  {
    to: "/Kullanici",
    title: "Kullanıcı",
  },
  {
    to: "/Kullanici/SurekliEgitimBilgileri",
    title: "Sürekli Eğitim Bilgileri",
  },
  {
    to: "/Kullanici/SurekliEgitimBilgileri/SurekliEgitimBilgileriEkle",
    title: "Sürekli Eğitim Bilgileri Ekle",
  },
];

const Page = () => {
  return (
    <ProtectedRoute allowedRoles={["DenetciAdmin"]}>
      <PageContainer
        title="Sürekli Eğitim Bilgileri Ekle"
        description="this is Sürekli Eğitim Bilgileri Ekle"
      >
        <Breadcrumb title="Sürekli Eğitim Bilgileri Ekle" items={BCrumb} />
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ParentCard title="Yeni Sürekli Eğitim Bilgileri">
              <SurekliEgitimBilgileriEkleForm />
            </ParentCard>
          </Grid>
        </Grid>
      </PageContainer>
    </ProtectedRoute>
  );
};

export default Page;
