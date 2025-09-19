"use client";

import { Grid } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import KullanimKilavuzuLayout from "./KullanimKilavuzuLayout";

const Page = () => {
  return (
    <KullanimKilavuzuLayout>
      <PageContainer
        title="Kullanım Kılavuzu"
        description="this is Kullanım Kılavuzu"
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12} lg={12}>
            <iframe
              src={`/pdfs/Kullanim_Kilavuzu_hesapayarlari_temaayarlari_kullanici.pdf`}
              style={{
                border: "0px",
                width: "100%",
                height: 700,
              }}
            ></iframe>
          </Grid>
          <Grid item xs={12} sm={12} lg={12}>
            <iframe
              src={`/pdfs/Kullanim_Kilavuzu_müsteri.pdf`}
              style={{
                border: "0px",
                width: "100%",
                height: 700,
              }}
            ></iframe>
          </Grid>
          <Grid item xs={12} sm={12} lg={12}>
            <iframe
              src={`/pdfs/Kullanim_Kilavuzu_sozlesme.pdf`}
              style={{
                border: "0px",
                width: "100%",
                height: 700,
              }}
            ></iframe>
          </Grid>
          <Grid item xs={12} sm={12} lg={12}>
            <iframe
              src={`/pdfs/Kullanim_Kilavuzu_veriyukleme.pdf`}
              style={{
                border: "0px",
                width: "100%",
                height: 700,
              }}
            ></iframe>
          </Grid>
        </Grid>
      </PageContainer>
    </KullanimKilavuzuLayout>
  );
};

export default Page;
