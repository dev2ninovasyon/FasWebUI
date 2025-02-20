"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import { Grid } from "@mui/material";
import SirketYonetimKadrosuDuzenleForm from "@/app/(Uygulama)/components/Musteri/SirketYonetimKadrosu/SirketYonetimKadrosuDuzenleForm";

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
    to: "/Musteri/SirketYonetimKadrosu/SirketYonetimKadrosuDuzenle",
    title: "Şirket Yönetim Kadrosu Düzenle",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="Şirket Yönetim Kadrosu Düzenle"
      description="this is Şirket Yönetim Kadrosu Düzenle"
    >
      <Breadcrumb title="Şirket Yönetim Kadrosu Düzenle" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ParentCard title="Şirket Yönetim Kadrosu Düzenle">
            <SirketYonetimKadrosuDuzenleForm />
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
