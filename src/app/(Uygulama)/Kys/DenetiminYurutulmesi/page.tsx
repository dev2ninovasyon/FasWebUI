"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
const BCrumb = [
  { to: "/Kys", title: "KYS" },

];
const Page = () => {
  return (
    <PageContainer
      title="6. Denetimin Yürütülmesi"
      description="Denetimin Yürütülmesi"
    >
      <Breadcrumb title="Denetimin Yürütülmesi" items={BCrumb} />
      <Box>
        <TopCards title="6. Denetimin Yürütülmesi" />
      </Box>
    </PageContainer>
  );
};

export default Page;
