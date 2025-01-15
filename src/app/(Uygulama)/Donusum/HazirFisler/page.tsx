"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Grid } from "@mui/material";
import HazirFisListesi from "./HazirFisListesi";
const BCrumb = [
  {
    to: "/Donusum",
    title: "Dönüşüm",
  },
  {
    to: "/Donusum/HazirFisler",
    title: "Hazır Fişler",
  },
];

const Page: React.FC = () => {
  return (
    <PageContainer title="Hazır Fişler" description="this is Hazır Fişler">
      <Breadcrumb title="Hazır Fişler" items={BCrumb} />
      <Grid container>
        <Grid item xs={12} lg={12}>
          <HazirFisListesi />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
