"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import TanimlamaDuzenleForm from "@/app/(Uygulama)/components/Konsolidasyon/TanimlamaDuzenleForm";
import { Grid } from "@mui/material";

const BCrumb = [
  {
    to: "/Konsolidasyon",
    title: "Konsolidasyon",
  },
  {
    to: "/Konsolidasyon/Tanimlamalar",
    title: "Tanımlamalar",
  },
  {
    to: "/Konsolidasyon/Tanimlamalar/TanimlamaDuzenle",
    title: "Tanımlama Düzenle",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="Tanımlama Düzenle"
      description="this is Tanımlama Düzenle"
    >
      <Breadcrumb title="Tanımlama Düzenle" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ParentCard title="Tanımlama Düzenle">
            <TanimlamaDuzenleForm />
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
