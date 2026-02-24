"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Grid } from "@mui/material";
import FisListesi from "./FisListesi";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import ProtectedPage from "@/app/ProtectedPage";

const BCrumb = [
  {
    to: "/Enflasyon",
    title: "Enflasyon",
  },
  {
    to: "/Enflasyon/DuzeltmeIslemleri",
    title: "Düzeltme İşlemleri",
  },
  {
    to: "/Enflasyon/DuzeltmeIslemleri/FisIslemleri",
    title: "Fiş İşlemleri",
  },
];

const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  return (
    <ProtectedPage allowed={user?.enflasyonmu || false}>
      <PageContainer title="Fiş İşlemleri" description="this is Fiş İşlemleri">
        <Breadcrumb title="Fiş İşlemleri" items={BCrumb} />
        <Grid container>
          <Grid
            size={{
              xs: 12,
              lg: 12,
            }}
          >
            <FisListesi />
          </Grid>
        </Grid>
      </PageContainer>
    </ProtectedPage>
  );
};

export default Page;
