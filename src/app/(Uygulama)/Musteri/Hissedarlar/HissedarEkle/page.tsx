"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import HissedarEkleForm from "@/app/(Uygulama)/components/Musteri/Hissedarlar/HissedarEkleForm";
import { Grid } from "@mui/material";

const BCrumb = [
  {
    to: "/Musteri",
    title: "Müşteri",
  },
  {
    to: "/Musteri/Hissedarlar",
    title: "Hissedarlar",
  },
  {
    to: "/Musteri/Hissedarlar/HissedarEkle",
    title: "Hissedar Ekle",
  },
];

const Page = () => {
  return (
    <PageContainer title="Hissedar Ekle" description="this is Hissedar Ekle">
      <Breadcrumb title="Hissedar Ekle" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ParentCard title="Yeni Hissedar">
            <HissedarEkleForm />
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
