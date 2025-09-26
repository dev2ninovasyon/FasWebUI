"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import DonusumIslemiStepper from "@/app/(Uygulama)/components/Donusum/DonusumIslemi/DonusumIslemiStepper";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ProtectedPage from "@/app/ProtectedPage";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Grid } from "@mui/material";
const BCrumb = [
  {
    to: "/Konsolidasyon",
    title: "Konsolidasyon",
  },
  {
    to: "/Konsolidasyon/DonusumIslemi",
    title: "Dönüşüm İşlemi",
  },
];

const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  return (
    <ProtectedPage allowed={user?.konsolidemi || false}>
      <PageContainer
        title="Dönüşüm İşlemi"
        description="this is Dönüşüm İşlemi"
      >
        <Breadcrumb title="Dönüşüm İşlemi" items={BCrumb} />
        <Grid container>
          <Grid item xs={12} lg={12}>
            <DonusumIslemiStepper konsolidasyonMu={true} />
          </Grid>
        </Grid>
      </PageContainer>
    </ProtectedPage>
  );
};

export default Page;
