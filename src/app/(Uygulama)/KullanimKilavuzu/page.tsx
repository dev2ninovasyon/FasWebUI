"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { Grid, Box } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import KullanimKilavuzuLayout from "./KullanimKilavuzuLayout";

const Page = () => {
  usePageTitle("Kullanım Kılavuzu");
  return (
    <KullanimKilavuzuLayout>
      <PageContainer
        title="Kullanım Kılavuzu"
        description="this is Kullanım Kılavuzu"
      >
        <Box sx={{
          width: "calc(100% + 16px)",
          marginLeft: "-16px",
          marginRight: "-16px"
        }}>
          <Grid container spacing={0}>
            <Grid
              size={{
                xs: 12,
                sm: 12,
                lg: 12
              }}>
              <iframe
                src={`/pdfs/Kullanim_Kilavuzu_hesapayarlari_temaayarlari_kullanici.pdf`}
                sandbox="allow-same-origin allow-scripts allow-forms"
                style={{
                  border: "0px",
                  width: "100%",
                  height: 700,
                }}
              ></iframe>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 12,
                lg: 12
              }}>
              <iframe
                src={`/pdfs/Kullanim_Kilavuzu_müsteri.pdf`}
                sandbox="allow-same-origin allow-scripts allow-forms"
                style={{
                  border: "0px",
                  width: "100%",
                  height: 700,
                }}
              ></iframe>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 12,
                lg: 12
              }}>
              <iframe
                src={`/pdfs/Kullanim_Kilavuzu_sozlesme.pdf`}
                sandbox="allow-same-origin allow-scripts allow-forms"
                style={{
                  border: "0px",
                  width: "100%",
                  height: 700,
                }}
              ></iframe>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 12,
                lg: 12
              }}>
              <iframe
                src={`/pdfs/Kullanim_Kilavuzu_veriyukleme.pdf`}
                sandbox="allow-same-origin allow-scripts allow-forms"
                style={{
                  border: "0px",
                  width: "100%",
                  height: 700,
                }}
              ></iframe>
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
    </KullanimKilavuzuLayout>
  );
};

export default Page;
