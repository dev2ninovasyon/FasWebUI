"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import MusteriIslemleriLayout from "./MusteriIslemleriLayout";
import { Box, Grid } from "@mui/material";
import MusteriTable from "@/app/(Uygulama)/components/Musteri/MusteriIslemleri/MusteriTable";
import MusteriEkleButton from "@/app/(Uygulama)/components/Musteri/MusteriIslemleri/MusteriEkleButton";

const Page = () => {
  return (
    <MusteriIslemleriLayout>
      <PageContainer
        title="Müşteri İşlemleri"
        description="this is Müşteri İşlemleri"
      >
        <ParentCard title="Müşteriler">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MusteriEkleButton />
              <Box>
                <MusteriTable />
              </Box>
            </Grid>
          </Grid>
        </ParentCard>
      </PageContainer>
    </MusteriIslemleriLayout>
  );
};

export default Page;
