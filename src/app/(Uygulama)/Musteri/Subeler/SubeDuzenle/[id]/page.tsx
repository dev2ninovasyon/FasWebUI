"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import SubeDuzenleForm from "@/app/(Uygulama)/components/Musteri/Subeler/SubeDuzenleForm";
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
    to: "/Musteri/Subeler/SubeDuzenle",
    title: "Şube Düzenle",
  },
];

const Page = () => {
  return (
    <PageContainer title="Şube Düzenle" description="this is Şube Düzenle">
      <Breadcrumb title="Şube Düzenle" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ParentCard title="Şube Düzenle">
            <SubeDuzenleForm />
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
