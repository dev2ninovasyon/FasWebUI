"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box, Button, Grid, Typography } from "@mui/material";
import { useState } from "react";
import DogrulamaMektuplarinaAlinanYanitlar from "@/app/(Uygulama)/components/CalismaKagitlari/DogrulamaMektuplarinaAlinanYanitlar";

const BCrumb = [
  {
    to: "/DenetimKanitlari",
    title: "Denetim Kanıtları",
  },
  {
    to: "/DenetimKanitlari/Mutabakat",
    title: "Mutabakat",
  },
  {
    to: "/DenetimKanitlari/Mutabakat/DogrulamaMektuplarinaAlinanYanitlar",
    title: "Doğrulama Mektuplarına Alınan Yanıtlar",
  },
];

const Page = () => {
  const [isClickedVarsayilanaDon, setIsClickedVarsayilanaDon] = useState(false);

  const [tamamlanan, setTamamlanan] = useState(0);
  const [toplam, setToplam] = useState(0);

  const controller = "DogrulamaMektuplarinaAlinanYanitlar";

  return (
    <>
      <Breadcrumb title="Doğrulama Mektuplarına Alınan Yanıtlar" items={BCrumb}>
        <>
          <Grid
            container
            sx={{
              width: "95%",
              height: "100%",
              margin: "0 auto",
              justifyContent: "space-between",
            }}
          >
            <Grid
              item
              xs={12}
              md={3.8}
              lg={3.8}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  overflowWrap: "break-word",
                  wordWrap: "break-word",
                  textAlign: "center",
                }}
              >
                {tamamlanan}/{toplam} Tamamlandı
              </Typography>
            </Grid>
            <Grid
              item
              xs={5.8}
              md={3.8}
              lg={3.8}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Button
                size="medium"
                variant="outlined"
                color="primary"
                sx={{ width: "100%" }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    overflowWrap: "break-word",
                    wordWrap: "break-word",
                  }}
                >
                  Ek Belge Yükle
                </Typography>
              </Button>
            </Grid>
            <Grid
              item
              xs={5.8}
              md={3.8}
              lg={3.8}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Button
                size="medium"
                variant="outlined"
                color="primary"
                onClick={() => setIsClickedVarsayilanaDon(true)}
                sx={{ width: "100%" }}
              >
                <Typography
                  variant="body1"
                  sx={{ overflowWrap: "break-word", wordWrap: "break-word" }}
                >
                  Varsayılana Dön
                </Typography>
              </Button>
            </Grid>
          </Grid>
        </>
      </Breadcrumb>
      <PageContainer
        title="Doğrulama Mektuplarına Alınan Yanıtlar"
        description="this is Doğrulama Mektuplarına Alınan Yanıtlar"
      >
        <Box>
          <DogrulamaMektuplarinaAlinanYanitlar
            controller={controller}
            isClickedVarsayilanaDon={isClickedVarsayilanaDon}
            setIsClickedVarsayilanaDon={setIsClickedVarsayilanaDon}
            setTamamlanan={setTamamlanan}
            setToplam={setToplam}
          />
        </Box>
      </PageContainer>
    </>
  );
};

export default Page;
