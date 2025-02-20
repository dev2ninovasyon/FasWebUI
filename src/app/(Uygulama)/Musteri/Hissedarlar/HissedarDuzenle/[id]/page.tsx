"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import HissedarDuzenleForm from "@/app/(Uygulama)/components/Musteri/Hissedarlar/HissedarDuzenleForm";
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
    to: "/Musteri/Hissedarlar/HissedarDuzenle",
    title: "Hissedar Düzenle",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="Hissedar Düzenle"
      description="this is Hissedar Düzenle"
    >
      <Breadcrumb title="Hissedar Düzenle" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ParentCard title="Hissedar Düzenle">
            <HissedarDuzenleForm />
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
