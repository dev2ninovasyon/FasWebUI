"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import { Box, Grid } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import SubelerLayout from "./SubelerLayout";
import SubeEkleButton from "@/app/(Uygulama)/components/Musteri/Subeler/SubeEkleButton";
import SubelerTable from "@/app/(Uygulama)/components/Musteri/Subeler/SubelerTable";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const title = `${user.denetlenenFirmaAdi} Şubeler`;
  return (
    <SubelerLayout>
      <PageContainer title="Şubeler" description="this is Şubeler">
        <ParentCard title={title}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <SubeEkleButton />
              <Box>
                <SubelerTable />
              </Box>
            </Grid>
          </Grid>
        </ParentCard>
      </PageContainer>
    </SubelerLayout>
  );
};

export default Page;
