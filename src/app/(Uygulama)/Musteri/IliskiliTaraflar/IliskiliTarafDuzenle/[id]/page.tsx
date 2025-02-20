"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import IliskiliTarafDuzenleForm from "@/app/(Uygulama)/components/Musteri/IliskiliTaraflar/IliskiliTarafDuzenleForm";
import { Grid } from "@mui/material";

const BCrumb = [
  {
    to: "/Musteri",
    title: "Müşteri",
  },
  {
    to: "/Musteri/IliskiliTaraflar",
    title: "İlişkili Taraflar",
  },
  {
    to: "/Musteri/IliskiliTaraflar/IliskiliTarafDuzenle",
    title: "İlişkili Taraf Düzenle",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="İlişkili Taraf Düzenle"
      description="this is İlişkili Taraf Düzenle"
    >
      <Breadcrumb title="İlişkili Taraf Düzenle" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ParentCard title="İlişkili Taraf Düzenle">
            <IliskiliTarafDuzenleForm />
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
