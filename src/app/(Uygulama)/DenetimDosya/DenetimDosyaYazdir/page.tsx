"use client";

import { Grid } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import DenetimDosyaYazdirTable from "./DenetimDosyaYazdirTable";

const BCrumb = [
  {
    to: "/DenetimDosya",
    title: "Denetim Dosya",
  },
  {
    to: "/DenetimDosya/DenetimDosyaYazdir",
    title: "Denetim Dosya Yazdır",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="Denetim Dosya Yazdır"
      description="this is Denetim Dosya Yazdır"
    >
      <Breadcrumb title="Denetim Dosya Yazdır" items={BCrumb} />
      <Grid container>
        <Grid item xs={12} lg={12} mb={3}>
          <DenetimDosyaYazdirTable />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
