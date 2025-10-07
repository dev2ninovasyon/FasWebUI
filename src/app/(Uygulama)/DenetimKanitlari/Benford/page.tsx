"use client";

import React, { useState } from "react";
import { Button, Grid, useTheme } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { IconChartBar, IconTable } from "@tabler/icons-react";
import { enqueueSnackbar } from "notistack";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import BenfordAnaliz from "@/app/(Uygulama)/components/DenetimKanitlari/Analizler/BenfordAnaliz";


const BCrumb = [
  { to: "/DenetimKanitlari", title: "Denetim Kanıtları" },

  {
    to: "/DenetimKanitlari/Benford",
    title: "Benford Analizi",
  },
];

const Page = () => {
  const user = useSelector((s: AppState) => s.userReducer);
  const customizer = useSelector((s: AppState) => s.customizer);
  const theme = useTheme();

  const [showGraph, setShowGraph] = useState(false);

  const toast = (msg: string, ok = true) =>
    enqueueSnackbar(msg, {
      variant: ok ? "success" : "error",
      autoHideDuration: 4000,
      style: {
        backgroundColor: ok
          ? customizer.activeMode === "dark"
            ? theme.palette.success.light
            : theme.palette.success.main
          : customizer.activeMode === "dark"
          ? theme.palette.error.light
          : theme.palette.error.main,
      },
    });

  return (
    <PageContainer title="Benford Analizi" description="Benford ilk basamak analizi">
      <Breadcrumb title="Benford Analizi" items={BCrumb} />
      <Grid container>
        <Grid item xs={12} lg={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={() => setShowGraph((p) => !p)}>
            {showGraph ? <IconTable size={24} /> : <IconChartBar size={24} />}
          </Button>
        </Grid>

        <Grid item xs={12} lg={12}>
          <BenfordAnaliz showGraph={showGraph} toast={toast} />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
