"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import MusteriIslemleriLayout from "./MusteriIslemleriLayout";
import { Box, Grid, Stack, TextField } from "@mui/material";
import MusteriTable from "@/app/(Uygulama)/components/Musteri/MusteriIslemleri/MusteriTable";
import MusteriEkleButton from "@/app/(Uygulama)/components/Musteri/MusteriIslemleri/MusteriEkleButton";
import MusteriImportOldButton from "@/app/(Uygulama)/components/Musteri/MusteriIslemleri/MusteriImportOldButton";
import { useState } from "react";

const Page = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <MusteriIslemleriLayout>
      <PageContainer
        title="Müşteri İşlemleri"
        description="this is Müşteri İşlemleri"
      >
        <ParentCard title="Müşteriler">
          <Grid container spacing={3}>
            <Grid size={12}>
              <Stack
                spacing={2}
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                marginBottom={4}
              >
                <Stack spacing={1} direction="row" justifyContent="start">
                  <MusteriEkleButton />
                  <MusteriImportOldButton
                    onImportCompleted={() => setRefreshKey((prev) => prev + 1)}
                  />
                </Stack>
                <TextField
                  size="small"
                  placeholder="Şirket adına göre filtrele"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ minWidth: { xs: "100%", md: 300 } }}
                />
              </Stack>
              <Box>
                <MusteriTable refreshKey={refreshKey} searchTerm={searchTerm} />
              </Box>
            </Grid>
          </Grid>
        </ParentCard>
      </PageContainer>
    </MusteriIslemleriLayout>
  );
};

export default Page;
