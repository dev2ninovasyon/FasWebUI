"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import { Box, Grid } from "@mui/material";
import KullaniciIslemleriLayout from "./KullaniciIslemleriLayout";
import KullaniciTable from "@/app/(Uygulama)/components/Kullanici/KullaniciIslemleri/KullaniciTable";
import KullaniciEkleButton from "@/app/(Uygulama)/components/Kullanici/KullaniciIslemleri/KullaniciEkleButton";

const Page = () => {
  return (
    <KullaniciIslemleriLayout>
      <PageContainer
        title="Kullanıcı İşlemleri"
        description="this is Kullanıcı İşlemleri"
      >
        <ParentCard title="Kullanıcılar">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <KullaniciEkleButton />
              <Box>
                <KullaniciTable />
              </Box>
            </Grid>
          </Grid>
        </ParentCard>
      </PageContainer>
    </KullaniciIslemleriLayout>
  );
};

export default Page;
