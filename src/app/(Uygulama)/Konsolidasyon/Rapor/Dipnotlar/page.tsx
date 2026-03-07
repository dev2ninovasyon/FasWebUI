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
import { useSelector } from "@/store/hooks";
import RaporDipnot from "@/app/(Uygulama)/components/Rapor/RaporDipnot/RaporDipnot";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import ProtectedPage from "@/app/ProtectedPage";

const BCrumb = [
  {
    to: "/Rapor",
    title: "Rapor",
  },
  {
    to: "/Rapor/Dipnotlar",
    title: "Dipnotlar",
  },
];

const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [isClickedVarsayilanaDon, setIsClickedVarsayilanaDon] = useState(false);

  const [tip, setTip] = useState("BagimsizDenetciRaporu");
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTip(newValue);
  };

  return (
    <ProtectedPage allowed={user?.konsolidemi || false}>
      <PageContainer title="Dipnotlar" description="Dipnotlar">
        <Breadcrumb title="Dipnotlar" items={BCrumb}>
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
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                size={{
                  xs: 12,
                  md: 12,
                  lg: 12
                }}>
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
        <Grid container spacing={3}>
          <Grid
            size={{
              xs: 12,
              lg: 12
            }}>
            <TabContext value={tip}>
              <TabList
                onChange={handleChange}
                aria-label="lab API tabs example"
              >
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
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      mb: 2,
                    }}
                    size={{
                      xs: 12,
                      lg: 12
                    }}>
                    <RaporDipnot
                      tip={tip}
                      isClickedVarsayilanaDon={isClickedVarsayilanaDon}
                      setIsClickedVarsayilanaDon={setIsClickedVarsayilanaDon}
                      konsolide={true}
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
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      mb: 2,
                    }}
                    size={{
                      xs: 12,
                      lg: 12
                    }}>
                    <RaporDipnot
                      tip={tip}
                      isClickedVarsayilanaDon={isClickedVarsayilanaDon}
                      setIsClickedVarsayilanaDon={setIsClickedVarsayilanaDon}
                      konsolide={true}
                    />
                  </Grid>
                </Grid>
              </TabPanel>
            </TabContext>
          </Grid>
        </Grid>
      </PageContainer>
    </ProtectedPage>
  );
};

export default Page;
