"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React from "react";
import { Grid } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import ProtectedPage from "@/app/ProtectedPage";
import { ENFLASYON_BASE_URL } from "@/config/enflasyonConfig";

const BCrumb = [
  {
    to: "/Enflasyon",
    title: "Enflasyon",
  },
  {
    to: "/Enflasyon/Rapor",
    title: "Rapor",
  },
  {
    to: "/Enflasyon/Rapor/Dipnotlar",
    title: "Dipnotlar",
  },
];

const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  return (
    <ProtectedPage allowed={user?.enflasyonmu || false}>
      <PageContainer title="Dipnotlar" description="this is Dipnotlar">
        <Breadcrumb title="Dipnotlar" items={BCrumb} />
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12} lg={12}>
            {user.denetimTuru == "Bobi" ? (
              <iframe
                src={`${ENFLASYON_BASE_URL}/EnflasyonDuzeltmesi/DipnotlarBobi?username=${user.kullaniciAdi}&denetciId=${user.denetciId}&kullaniciId=${user.id}&denetlenenId=${user.denetlenenId}&yil=${user.yil}`}
                style={{
                  border: "0px",
                  width: "100%",
                  height: 700,
                }}
              ></iframe>
            ) : (
              <iframe
                src={`${ENFLASYON_BASE_URL}/EnflasyonDuzeltmesi/Dipnotlar?username=${user.kullaniciAdi}&denetciId=${user.denetciId}&kullaniciId=${user.id}&denetlenenId=${user.denetlenenId}&yil=${user.yil}`}
                style={{
                  border: "0px",
                  width: "100%",
                  height: 700,
                }}
              ></iframe>
            )}
          </Grid>
        </Grid>
      </PageContainer>
    </ProtectedPage>
  );
};

export default Page;
