"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Grid } from "@mui/material";
import FisDetaylari from "./FisDetaylari";

const BCrumb = [
  {
    to: "/DenetimKanitlari",
    title: "Denetim Kanıtları",
  },
  {
    to: "/DenetimKanitlari/Onemlilik",
    title: "Önemlilik",
  },
  {
    to: "/DenetimKanitlari/Onemlilik/Orneklem",
    title: "Örneklem",
  },
  {
    to: "/DenetimKanitlari/Onemlilik/Orneklem/OrneklemFisleri",
    title: "Fiş Detayları",
  },
  {
    to: "/DenetimKanitlari/Onemlilik/Orneklem/OrneklemFisleri/FisDetaylari",
    title: "Fiş Detayları",
  },
];

const Page = () => {
  return (
    <PageContainer title="Fiş Detayları" description="this is Fiş Detayları">
      <Breadcrumb title="Fiş Detayları" items={BCrumb} />

      <Grid container marginTop={3}>
        <Grid item xs={12} lg={12}>
          <FisDetaylari />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
