"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React from "react";
import { Grid, useTheme } from "@mui/material";
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
    to: "/Enflasyon/Asamalar",
    title: "Aşamalar",
  },
];

import { generateSignature } from "@/utils/crypto";

const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const theme = useTheme();

  // Kullanıcı bilgileri henüz yüklenmediyse render etme veya loading göster
  if (!user || !user.kullaniciAdi) {
    return <div>Yükleniyor...</div>;
  }

  const signature = generateSignature(
    user.kullaniciAdi || "",
    (user.denetciId || 0).toString(),
    (user.id || 0).toString(),
    (user.denetlenenId || 0).toString(),
    (user.yil || 0).toString()
  );

  // URL encode signature because it contains special characters like + and /
  const encodedSignature = encodeURIComponent(signature);

  return (
    <ProtectedPage allowed={user?.enflasyonmu || false}>
      <PageContainer title="Aşamalar" description="this is Aşamalar">
        <Breadcrumb title="Aşamalar" items={BCrumb} />
        <Grid container spacing={3}>
          <Grid
            size={{
              xs: 12,
              sm: 12,
              lg: 12
            }}>
            <iframe
              src={`${ENFLASYON_BASE_URL}/EnflasyonDuzeltmesi/Index?username=${user.kullaniciAdi || ""}&denetciId=${user.denetciId || 0}&kullaniciId=${user.id || 0}&denetlenenId=${user.denetlenenId || 0}&yil=${user.yil || 0}&signature=${encodedSignature}`}
              style={{
                background: theme.palette.common.white,
                border: "0px",
                width: "100%",
                height: 700,
              }}
            ></iframe>
          </Grid>
        </Grid>
      </PageContainer>
    </ProtectedPage>
  );
};

export default Page;
