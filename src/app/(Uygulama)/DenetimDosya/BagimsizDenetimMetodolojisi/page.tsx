"use client";

import { Grid } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import BagimsizDenetimMetodolojisiTable from "./BagimsizDenetimMetodolojisiTable";

const BCrumb = [
  {
    to: "/DenetimDosya",
    title: "Denetim Dosya",
  },
  {
    to: "/DenetimDosya/BagimsizDenetimMetodolojisi",
    title: "Bağımsız Denetim Metodolojisi",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="Bağımsız Denetim Metodolojisi"
      description="this is Bağımsız Denetim Metodolojisi"
    >
      <Breadcrumb title="Bağımsız Denetim Metodolojisi" items={BCrumb} />
      <Grid container>
        <Grid item xs={12} lg={12} mb={3}>
          <BagimsizDenetimMetodolojisiTable />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
