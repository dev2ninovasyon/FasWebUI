"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import { Grid } from "@mui/material";
import MusteriDetay from "@/app/(Uygulama)/components/Musteri/MusteriIslemleri/MusteriDetay";

const BCrumb = [
  {
    to: "/Musteri",
    title: "Müşteri",
  },
  {
    to: "/Musteri/MusteriIslemleri",
    title: "Müşteri İşlemleri",
  },
];

const Page = () => {
  return (
    <PageContainer title="Müşteri Detay" description="this is Müşteri Detay">
      <Breadcrumb title="Müşteri Detay" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ParentCard title="Müşteri Detay">
            <MusteriDetay />
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
