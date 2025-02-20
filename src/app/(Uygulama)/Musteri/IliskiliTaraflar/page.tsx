"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import { Box, Grid } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import IliskiliTaraflarLayout from "./IliskiliTaraflarLayout";
import IliskiliTaraflarTable from "@/app/(Uygulama)/components/Musteri/IliskiliTaraflar/IliskiliTaraflarTable";
import IliskiliTarafTanimlaButton from "@/app/(Uygulama)/components/Musteri/IliskiliTaraflar/IliskiliTarafTanimlaButton";
import MizandanIliskiliTarafTanimlaButton from "@/app/(Uygulama)/components/Musteri/IliskiliTaraflar/MizandanIliskiliTarafTanimlaButton";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const title = `${user.denetlenenFirmaAdi} İlişkili Taraflar`;
  return (
    <IliskiliTaraflarLayout>
      <PageContainer
        title="İlişkili Taraflar"
        description="this is İlişkili Taraflar"
      >
        <ParentCard title={title}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12} mb={1}>
              <IliskiliTarafTanimlaButton />
              <MizandanIliskiliTarafTanimlaButton />
            </Grid>
            <Grid item xs={12}>
              <Box>
                <IliskiliTaraflarTable />
              </Box>
            </Grid>
          </Grid>
        </ParentCard>
      </PageContainer>
    </IliskiliTaraflarLayout>
  );
};

export default Page;
