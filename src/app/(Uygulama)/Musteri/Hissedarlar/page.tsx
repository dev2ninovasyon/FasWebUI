"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import { Box, Grid } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import HissedarlarLayout from "./HissedarlarLayout";
import HissedarEkleButton from "@/app/(Uygulama)/components/Musteri/Hissedarlar/HissedarEkleButton";
import HissedarlarTable from "@/app/(Uygulama)/components/Musteri/Hissedarlar/HissedarlarTable";
import MizandanHissedarEkleButton from "@/app/(Uygulama)/components/Musteri/Hissedarlar/MizandanHissedarEkleButton";
import { useState } from "react";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const title = `${user.denetlenenFirmaAdi} Hissedarlar`;

  const [isClickedMizandanHissedarEkle, setIsClickedMizandanHissedarEkle] =
    useState(false);

  return (
    <HissedarlarLayout>
      <PageContainer title="Hissedarlar" description="this is Hissedarlar">
        <ParentCard title={title}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12} mb={1}>
              <HissedarEkleButton />
              <MizandanHissedarEkleButton
                setIsClickedMizandanHissedarEkle={
                  setIsClickedMizandanHissedarEkle
                }
              />
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
              <Box>
                <HissedarlarTable
                  isClickedMizandanHissedarEkle={isClickedMizandanHissedarEkle}
                  setIsClickedMizandanHissedarEkle={
                    setIsClickedMizandanHissedarEkle
                  }
                />
              </Box>
            </Grid>
          </Grid>
        </ParentCard>
      </PageContainer>
    </HissedarlarLayout>
  );
};

export default Page;
