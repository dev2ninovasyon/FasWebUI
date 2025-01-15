"use client";

import React from "react";
import { Grid } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import VadeliBankaMevduatiFaizTahakkuk from "./VadeliBankaMevduatiFaizTahakkuk";

const BCrumb = [
  {
    to: "/Hesaplamalar",
    title: "Hesaplamalar",
  },
  {
    to: "/Hesaplamalar/VadeliBankaMevduati",
    title: "Vadeli Banka Mevduatı",
  },
  {
    to: "/Hesaplamalar/VadeliBankaMevduati/VadeliBankaMevduatiFaizTahakkuk",
    title: "Vadeli Banka Mevduatı Faiz Tahakkuk",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="Vadeli Banka Mevduatı Faiz Tahakkuk"
      description="this is Vadeli Banka Mevduatı Faiz Tahakkuk"
    >
      <Breadcrumb title="Vadeli Banka Mevduatı Faiz Tahakkuk" items={BCrumb} />
      <Grid container>
        <Grid item xs={12} lg={12}>
          <VadeliBankaMevduatiFaizTahakkuk />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
