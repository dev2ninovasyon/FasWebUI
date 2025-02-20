"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import { Box, Grid } from "@mui/material";
import SirketYonetimKadrosuLayout from "./SirketYonetimKadrosuLayout";
import SirketYonetimKadrosuEkleButton from "@/app/(Uygulama)/components/Musteri/SirketYonetimKadrosu/SirketYonetimKadrosuEkleButton";
import SirketYonetimKadrosuTable from "@/app/(Uygulama)/components/Musteri/SirketYonetimKadrosu/SirketYonetimKadrosuTable";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const title = `${user.denetlenenFirmaAdi} Yönetim Kadrosu`;
  return (
    <SirketYonetimKadrosuLayout>
      <PageContainer
        title="Şirket Yönetim Kadrosu"
        description="this is Şirket Yönetim Kadrosu"
      >
        <ParentCard title={title}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <SirketYonetimKadrosuEkleButton />
              <Box>
                <SirketYonetimKadrosuTable />
              </Box>
            </Grid>
          </Grid>
        </ParentCard>
      </PageContainer>
    </SirketYonetimKadrosuLayout>
  );
};

export default Page;
