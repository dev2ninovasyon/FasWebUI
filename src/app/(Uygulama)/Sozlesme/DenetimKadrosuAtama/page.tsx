"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import { Box, Grid } from "@mui/material";
import DenetimKadrosuAtamaLayout from "./DenetimKadrosuAtamaLayout";
import DenetimKadrosuTable from "@/app/(Uygulama)/components/Sozlesme/DenetimKadrosuAtama/DenetimKadrosuTable";
import DenetimKadrosuEkleButton from "@/app/(Uygulama)/components/Sozlesme/DenetimKadrosuAtama/DenetimKadrosuEkleButton";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  return (
    <DenetimKadrosuAtamaLayout>
      <PageContainer
        title="Denetim Kadrosu Atama"
        description="this is Denetim Kadrosu Atama"
      >
        <ParentCard
          title={`${user.denetlenenFirmaAdi} Denetim Kadrosu (${user.yil})`}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <DenetimKadrosuEkleButton />
              <Box>
                <DenetimKadrosuTable />
              </Box>
            </Grid>
          </Grid>
        </ParentCard>
      </PageContainer>
    </DenetimKadrosuAtamaLayout>
  );
};

export default Page;
