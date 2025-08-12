"use client";

import React, { useState } from "react";
import { Divider, Grid, Tab } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import EDefterMizanStepper from "@/app/(Uygulama)/components/Veri/EDefterMizan/EDefterMizanStepper";
import EDefterMizanEnflasyonHaricStepper from "@/app/(Uygulama)/components/Veri/EDefterMizan/EDefterMizanEnflasyonHaricStepper";
import EDefterMizanEnflasyonDahilStepper from "@/app/(Uygulama)/components/Veri/EDefterMizan/EDefterMizanEnflasyonDahilStepper";

const BCrumb = [
  {
    to: "/Veri",
    title: "Veri",
  },
  {
    to: "/Veri/Mizanlar",
    title: "Mizanlar",
  },
  {
    to: "/Veri/Mizanlar/EDefterMizan",
    title: "E-Defter Mizan Oluşturma",
  },
];

const Page: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [tip, setTip] = useState("EnflasyonHaric");
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTip(newValue);
  };
  return (
    <PageContainer
      title="E-Defter Mizan Oluşturma"
      description="this is E-Defter Mizan Oluşturma"
    >
      <Breadcrumb title="E-Defter Mizan Oluşturma" items={BCrumb} />

      {user.yil == 2024 ? (
        <TabContext value={tip}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Enflasyon Hariç Mizan" value="EnflasyonHaric" />
            <Tab label="Enflasyon Dahil Mizan" value="EnflasyonDahil" />
          </TabList>
          <Divider />
          <TabPanel value="EnflasyonHaric" sx={{ paddingX: 0 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={12}>
                <EDefterMizanEnflasyonHaricStepper />
              </Grid>
            </Grid>
          </TabPanel>
          <TabPanel value="EnflasyonDahil" sx={{ paddingX: 0 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={12}>
                <EDefterMizanEnflasyonDahilStepper />
              </Grid>
            </Grid>
          </TabPanel>
        </TabContext>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={12}>
            <EDefterMizanStepper />
          </Grid>
        </Grid>
      )}
    </PageContainer>
  );
};

export default Page;
