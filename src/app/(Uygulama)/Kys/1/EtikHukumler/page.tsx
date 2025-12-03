"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/Kys",
    title: "KYS",
  },
  {
    to: "/Kys/1",
    title: "KYS-1",
  },
  {
    to: "/Kys/1/EtikHukumler",
    title: "Etik Hükümler",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="4. Etik Hükümler"
      description="Etik Hükümler"
    >
      <Breadcrumb title="Etik Hükümler" items={BCrumb} />
      <Box>
        <TopCards title="4. Etik Hükümler" />
      </Box>
    </PageContainer>
  );
};

export default Page;
