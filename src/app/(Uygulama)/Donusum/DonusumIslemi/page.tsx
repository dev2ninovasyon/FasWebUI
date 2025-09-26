"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import DonusumIslemiStepper from "@/app/(Uygulama)/components/Donusum/DonusumIslemi/DonusumIslemiStepper";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Grid } from "@mui/material";
const BCrumb = [
  {
    to: "/Donusum",
    title: "Dönüşüm",
  },
  {
    to: "/Donusum/DonusumIslemi",
    title: "Dönüşüm İşlemi",
  },
];

const Page: React.FC = () => {
  return (
    <PageContainer title="Dönüşüm İşlemi" description="this is Dönüşüm İşlemi">
      <Breadcrumb title="Dönüşüm İşlemi" items={BCrumb} />
      <Grid container>
        <Grid item xs={12} lg={12}>
          <DonusumIslemiStepper konsolidasyonMu={false} />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
