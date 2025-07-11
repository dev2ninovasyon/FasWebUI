"use client";

import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Grid } from "@mui/material";
import DenetimKadrosuEkleForm from "@/app/(Uygulama)/components/Sozlesme/DenetimKadrosuAtama/DenetimKadrosuEkleForm";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import ProtectedRoute from "@/app/ProtectedRoute";

const BCrumb = [
  {
    to: "/Sozlesme",
    title: "Sözleşme",
  },
  {
    to: "/Sozlesme/DenetimKadrosuAtama",
    title: "Denetim Kadrosu Atama",
  },
  {
    to: "/Sozlesme/DenetimKadrosuAtama/GorevAtamasiEkle",
    title: "Görev Ataması Ekle",
  },
];

const Page = () => {
  return (
    <ProtectedRoute allowedRoles={["DenetciAdmin"]}>
      <PageContainer
        title="Görev Ataması Ekle"
        description="this is Görev Ataması Ekle"
      >
        <Breadcrumb title="Görev Ataması Ekle" items={BCrumb} />
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ParentCard title="Yeni Görev Ataması">
              <DenetimKadrosuEkleForm />
            </ParentCard>
          </Grid>
        </Grid>
      </PageContainer>
    </ProtectedRoute>
  );
};

export default Page;
