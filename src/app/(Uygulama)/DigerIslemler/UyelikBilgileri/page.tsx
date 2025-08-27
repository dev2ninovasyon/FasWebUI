"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Grid } from "@mui/material";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import OdemeBilgileriTable from "@/app/(Uygulama)/components/DigerIslemler/UyelikBilgileri/OdemeBilgileriTable";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

const BCrumb = [
  {
    to: "/DigerIslemler",
    title: "Diğer İşlemler",
  },
  {
    to: "/DigerIslemler/UyelikBilgileri",
    title: "Üyelik Bilgileri",
  },
];

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  return (
    <PageContainer
      title="Üyelik Bilgileri"
      description="this is Üyelik Bilgileri"
    >
      <Breadcrumb title="Üyelik Bilgileri" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={12} lg={12}>
          <ParentCard title={`${user.denetciFirmaAdi} Üyelik Bilgileri`}>
            <OdemeBilgileriTable />
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
