"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import MusteriIslemleriLayout from "./MusteriIslemleriLayout";
import { Box, Grid, Stack } from "@mui/material";
import MusteriTable from "@/app/(Uygulama)/components/Musteri/MusteriIslemleri/MusteriTable";
import MusteriEkleButton from "@/app/(Uygulama)/components/Musteri/MusteriIslemleri/MusteriEkleButton";
import MusteriImportOldButton from "@/app/(Uygulama)/components/Musteri/MusteriIslemleri/MusteriImportOldButton";

const Page = () => {
  return (
    <MusteriIslemleriLayout>
      <PageContainer
        title="Müşteri İşlemleri"
        description="this is Müşteri İşlemleri"
      >
        <Grid container spacing={3}>
          {/* Mevcut müşteri listesi */}
          <Grid size={12}>
            <ParentCard title="Müşteriler">
              <Grid container spacing={3}>
                <Grid size={12}>
                  <Stack spacing={1} direction="row" justifyContent="start" marginBottom={4}>
                    <MusteriEkleButton />
                    <MusteriImportOldButton />
                  </Stack>
                  <Box>
                    <MusteriTable />
                  </Box>
                </Grid>
              </Grid>
            </ParentCard>
          </Grid>

        </Grid>
      </PageContainer>
    </MusteriIslemleriLayout>
  );
};

export default Page;
