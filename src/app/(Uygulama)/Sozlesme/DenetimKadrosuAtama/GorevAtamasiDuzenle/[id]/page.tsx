"use client";

import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Grid } from "@mui/material";
import DenetimKadrosuDuzenleForm from "@/app/(Uygulama)/components/Sozlesme/DenetimKadrosuAtama/DenetimKadrosuDuzenleForm";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";

const BCrumb = [
  {
    to: "/Sozlesme",
    title: "Sözleşme",
  },
  {
    to: "/Sozlesme/DenetimKadrosuAtama",
    title: "Denetim Kadrosu Atama",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="Görev Ataması Düzenle"
      description="this is Görev Ataması Düzenle"
    >
      <Breadcrumb title="Görev Ataması Düzenle" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ParentCard title="Görev Ataması Düzenle">
            <DenetimKadrosuDuzenleForm />
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
