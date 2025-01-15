"use client";

import { Grid } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import FisDetaylari from "./FisDetaylari";

const BCrumb = [
  {
    to: "/Veri",
    title: "Veri",
  },
  {
    to: "/Veri/EDefterInceleme",
    title: "E-Defter İnceleme",
  },
];

const Page = () => {
  return (
    <PageContainer title="Fiş Detayları" description="this is Fiş Detayları">
      <Breadcrumb title="Fiş Detayları" items={BCrumb} />

      <Grid container marginTop={3}>
        <Grid item xs={12} lg={12}>
          <FisDetaylari />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
