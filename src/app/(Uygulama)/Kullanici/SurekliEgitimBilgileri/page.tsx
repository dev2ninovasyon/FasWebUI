"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import { Box, Grid } from "@mui/material";
import SurekliEgitimBilgileriLayout from "./SurekliEgitimBilgileriLayout";
import SurekliEgitimBilgileriEkleButton from "@/app/(Uygulama)/components/Kullanici/SurekliEgitimBilgileri/SurekliEgitimBilgileriEkleButton";
import SurekliEgitimBilgileriTable from "@/app/(Uygulama)/components/Kullanici/SurekliEgitimBilgileri/SurekliEgitimBilgileriTable";

const Page = () => {
  return (
    <SurekliEgitimBilgileriLayout>
      <PageContainer
        title="Sürekli Eğitim Bilgileri"
        description="this is Sürekli Eğitim Bilgileri"
      >
        <ParentCard title="Sürekli Eğitim Bilgileri">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <SurekliEgitimBilgileriEkleButton />
              <Box>
                <SurekliEgitimBilgileriTable />
              </Box>
            </Grid>
          </Grid>
        </ParentCard>
      </PageContainer>
    </SurekliEgitimBilgileriLayout>
  );
};

export default Page;
