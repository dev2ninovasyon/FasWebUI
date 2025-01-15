"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Grid } from "@mui/material";
import FisListesi from "./FisListesi";
const BCrumb = [
  {
    to: "/Donusum",
    title: "Dönüşüm",
  },
  {
    to: "/Donusum/FisListesi",
    title: "Fiş Listesi",
  },
];

const Page: React.FC = () => {
  return (
    <PageContainer title="Fiş Listesi" description="this is Fiş Listesi">
      <Breadcrumb title="Fiş Listesi" items={BCrumb} />
      <Grid container>
        <Grid item xs={12} lg={12}>
          <FisListesi />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
