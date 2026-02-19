"use client";

import React, { useEffect, useState } from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import MusteriIslemleriLayout from "../MusteriIslemleriLayout";
import { Box, Grid, TextField } from "@mui/material";
import { Autocomplete } from "@mui/material";
import MusteriEkleForm from "@/app/(Uygulama)/components/Musteri/MusteriIslemleri/MusteriEkleForm";
import { getOldDenetlenenForCurrentDenetci } from "@/api/Musteri/MusteriIslemleri";
import { enqueueSnackbar } from "notistack";

const Page = () => {
  const [oldList, setOldList] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getOldDenetlenenForCurrentDenetci();
        setOldList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("ImportFromOld fetch error:", err);
        enqueueSnackbar("Müşteriler yüklenemedi.", { variant: "error" });
      }
    };
    fetch();
  }, []);

  return (
    <MusteriIslemleriLayout>
      <PageContainer title="Müşterileri İçe Aktar" description="Eski veritabanından seçili şirketi yeni veritabanına taşı">
        <Grid container spacing={3}>
          <Grid size={12}>
            <ParentCard title="Müşteri Seç">
              <Grid container spacing={3}>
                <Grid size={12}>
                  <Autocomplete
                    options={oldList}
                    getOptionLabel={(opt: any) => opt.firmaAdi || opt.FirmaAdi || ""}
                    onChange={(e, val) => setSelected(val)}
                    renderInput={(params) => <TextField {...params} label="Müşteri Seçiniz" variant="outlined" />}
                  />
                </Grid>

                <Grid size={12}>
                  <Box>
                    <MusteriEkleForm key={selected?.id || selected?.Id || "empty"} initialData={selected} />
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
