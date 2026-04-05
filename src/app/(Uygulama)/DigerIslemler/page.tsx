"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import DigerIslemlerLayout from "./DigerIslemlerLayout";

const Page = () => {
  usePageTitle("Diğer İşlemler");
  return (
    <DigerIslemlerLayout>
      <PageContainer
        title="Diğer İşlemler"
        description="this is Diğer İşlemler"
      >
        <Box>
          <TopCards title="DİĞER İŞLEMLER" />
        </Box>
      </PageContainer>
    </DigerIslemlerLayout>
  );
};

export default Page;
