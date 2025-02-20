"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import SubeEkleForm from "@/app/(Uygulama)/components/Musteri/Subeler/SubeEkleForm";
import { Grid } from "@mui/material";

const BCrumb = [
  {
    to: "/Musteri",
    title: "Müşteri",
  },
  {
    to: "/Musteri/Subeler",
    title: "Şubeler",
  },
  {
    to: "/Musteri/Subeler/SubeEkle",
    title: "Şube Ekle",
  },
];

const Page = () => {
  return (
    <PageContainer title="Şube Ekle" description="this is Şube Ekle">
      <Breadcrumb title="Şube Ekle" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ParentCard title="Yeni Şube">
            <SubeEkleForm />
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
