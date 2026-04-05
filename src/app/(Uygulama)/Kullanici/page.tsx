"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import KullaniciLayout from "./KullaniciLayout";
import KullaniciTopCard from "@/app/(Uygulama)/components/Cards/KullaniciTopCard";
import ProtectedRoute from "@/app/ProtectedRoute";
import { usePageTitle } from "@/hooks/usePageTitle";

const Page = () => {
  usePageTitle("Kullanıcı");
  return (
    <KullaniciLayout>
      <PageContainer title="Kullanıcı" description="this is Kullanıcı">
        <Box>
          <KullaniciTopCard />
        </Box>
      </PageContainer>
    </KullaniciLayout>
  );
};

export default Page;
