"use client";

import React, { useState } from "react";
import { Grid } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import VadeliBankaMevduatiFaizTahakkuk from "./VadeliBankaMevduatiFaizTahakkuk";
import { FloatingButtonFisler } from "@/app/(Uygulama)/components/Hesaplamalar/FloatingButtonFisler";

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
  const [hasData, setHasData] = useState(false);

  const handleDataCount = (count: number) => {
    if (count > 0) {
      setHasData(true);
    } else {
      setHasData(false);
    }
  };

  return (
    <PageContainer
      title="Vadeli Banka Mevduatı Faiz Tahakkuk"
      description="this is Vadeli Banka Mevduatı Faiz Tahakkuk"
    >
      <Breadcrumb title="Vadeli Banka Mevduatı Faiz Tahakkuk" items={BCrumb} />
      <Grid container>
        <Grid
          size={{
            xs: 12,
            lg: 12
          }}>
          <VadeliBankaMevduatiFaizTahakkuk onDataCount={handleDataCount} />
        </Grid>
        {hasData && <FloatingButtonFisler handleClick={() => { }} />}
      </Grid>
    </PageContainer>
  );
};

export default Page;
