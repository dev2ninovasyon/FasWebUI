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
    to: "/Kys/1/BilgiVeIletisim",
    title: "Bilgi ve İletişim",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="8. Bilgi ve İletişim"
      description="Bilgi ve İletişim"
    >
      <Breadcrumb title="Bilgi ve İletişim" items={BCrumb} />
      <Box>
        <TopCards title="8. Bilgi ve İletişim" />
      </Box>
    </PageContainer>
  );
};

export default Page;
