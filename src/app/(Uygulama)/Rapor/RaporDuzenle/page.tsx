"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React, { useState } from "react";
import {
  Button,
  Divider,
  Grid,
  Tab,
  Typography,
  useTheme,
} from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "react-redux";
import RaporDipnot from "@/app/(Uygulama)/components/Rapor/RaporDipnot/RaporDipnot";
import { TabContext, TabList, TabPanel } from "@mui/lab";

const BCrumb = [
  {
    to: "/Rapor",
    title: "Rapor",
  },
  {
    to: "/Rapor/RaporDuzenle",
    title: "Rapor Düzenle",
  },
];

const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [isClickedVarsayılanaDon, setIsClickedVarsayılanaDon] = useState(false);

  const [tip, setTip] = useState("BagimsizDenetciRaporu");
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTip(newValue);
  };

  return (
    <PageContainer title="Rapor Düzenle" description="Rapor Düzenle">
      <Breadcrumb title="Rapor Düzenle" items={BCrumb}>
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
              md={12}
              lg={12}
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
                onClick={() => setIsClickedVarsayılanaDon(true)}
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
      <Grid container spacing={3}>
        <Grid item xs={12} lg={12}>
          <TabContext value={tip}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              <Tab
                label="Bağımsız Denetçi Raporu"
                value="BagimsizDenetciRaporu"
              />
              <Tab
                label="Faaliyet Raporuna İlişkin Bağımsız Denetçi Raporu"
                value="FaaliyetRaporunaIliskinBagimsizDenetciRaporu"
              />
            </TabList>
            <Divider />
            <TabPanel value="BagimsizDenetciRaporu" sx={{ paddingX: 0 }}>
              <Grid container>
                <Grid
                  item
                  xs={12}
                  lg={12}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    mb: 2,
                  }}
                >
                  <RaporDipnot
                    tip={tip}
                    isClickedVarsayılanaDon={isClickedVarsayılanaDon}
                    setIsClickedVarsayılanaDon={setIsClickedVarsayılanaDon}
                  />
                </Grid>
              </Grid>
            </TabPanel>
            <TabPanel
              value="FaaliyetRaporunaIliskinBagimsizDenetciRaporu"
              sx={{ paddingX: 0 }}
            >
              <Grid container>
                <Grid
                  item
                  xs={12}
                  lg={12}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    mb: 2,
                  }}
                >
                  <RaporDipnot
                    tip={tip}
                    isClickedVarsayılanaDon={isClickedVarsayılanaDon}
                    setIsClickedVarsayılanaDon={setIsClickedVarsayılanaDon}
                  />
                </Grid>
              </Grid>
            </TabPanel>
          </TabContext>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
