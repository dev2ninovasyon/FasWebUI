"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import BulguRiskiBelirlemeStepper from "@/app/(Uygulama)/components/CalismaKagitlari/BulguRiskiBelirlemeStepper";
import { Box, Typography } from "@mui/material";

const BCrumb = [
  {
    to: "/PlanVeProgram",
    title: "Plan ve Program",
  },
  {
    title: "Bulgu Riski Belirleme",
  },
];

const Page = () => {
  return (
    <>
      <Breadcrumb title="Bulgu Riski Belirleme" items={BCrumb}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            BDS 200 §A38-A42 (Denetim Riski Modeli) | BDS 320 §10-11 (Önemlilik)
          </Typography>
        </Box>
      </Breadcrumb>
      <PageContainer title="Bulgu Riski Belirleme" description="Bulgu Riski Belirleme">
        <BulguRiskiBelirlemeStepper />
      </PageContainer>
    </>
  );
};

export default Page;
