"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import IliskiliTarafTanimlaForm from "@/app/(Uygulama)/components/Musteri/IliskiliTaraflar/IliskiliTarafTanimlaForm";
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
    to: "/Musteri/IliskiliTaraflar/IliskiliTarafTanimla",
    title: "İlişkili Taraf Tanımla",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="İlişkili Taraf Tanımla"
      description="this is İlişkili Taraf Tanımla"
    >
      <Breadcrumb title="İlişkili Taraf Tanimla" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ParentCard title="Yeni İlişkili Taraf">
            <IliskiliTarafTanimlaForm />
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
