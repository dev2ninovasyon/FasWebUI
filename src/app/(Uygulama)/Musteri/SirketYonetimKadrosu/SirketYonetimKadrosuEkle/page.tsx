"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import { Grid } from "@mui/material";
import SirketYonetimKadrosuEkleForm from "@/app/(Uygulama)/components/Musteri/SirketYonetimKadrosu/SirketYonetimKadrosuEkleForm";

const BCrumb = [
  {
    to: "/Musteri",
    title: "Müşteri",
  },
  {
    to: "/Musteri/SirketYonetimKadrosu",
    title: "Şirket Yönetim Kadrosu",
  },
  {
    to: "/Musteri/SirketYonetimKadrosu/SirketYonetimKadrosuEkle",
    title: "Şirket Yönetim Kadrosu Ekle",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="Şirket Yönetim Kadrosu Ekle"
      description="this is Şirket Yönetim Kadrosu Ekle"
    >
      <Breadcrumb title="Şirket Yönetim Kadrosu Ekle" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ParentCard title="Yeni Şirket Yönetim Kadrosu">
            <SirketYonetimKadrosuEkleForm />
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
