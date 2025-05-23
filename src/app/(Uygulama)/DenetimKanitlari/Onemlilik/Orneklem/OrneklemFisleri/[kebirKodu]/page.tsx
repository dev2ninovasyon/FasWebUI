"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Grid } from "@mui/material";
import OrneklemFisleri from "./OrneklemFisleri";

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
    title: "Örneklem Fişleri",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="Örneklem Fişleri"
      description="this is Örneklem Fişleri"
    >
      <Breadcrumb title="Örneklem Fişleri" items={BCrumb} />

      <Grid container marginTop={3}>
        <Grid item xs={12} lg={12}>
          <OrneklemFisleri />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
