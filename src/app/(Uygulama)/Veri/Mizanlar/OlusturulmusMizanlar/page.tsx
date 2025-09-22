"use client";

import React, { useState } from "react";
import { Grid, MenuItem, Typography } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import CustomSelect from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSelect";
import OlusturulmusMizanlar from "@/app/(Uygulama)/components/Veri/Mizan/OlusturulmusMizanlar";
import OlusturulmusProgramVukMizanlar from "@/app/(Uygulama)/components/Veri/Mizan/OlusturulmusProgramVukMizanlar";

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
    to: "/Veri/Mizanlar/OlusturulmusMizanlar",
    title: "Oluşturulmuş Mizanlar",
  },
];

const Page: React.FC = () => {
  const [type1, setType1] = useState("E-Defter");
  const [type2, setType2] = useState("AnaHesap");
  return (
    <PageContainer
      title="Oluşturulmuş Mizanlar"
      description="this is Oluşturulmuş Mizanlar"
    >
      <Breadcrumb title="Oluşturulmuş Mizanlar" items={BCrumb} />

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <CustomSelect
            labelId="type1"
            id="type1"
            size="small"
            value={type1}
            onChange={(e: any) => {
              setType1(e.target.value);
            }}
            height={"36px"}
            sx={{ width: "100%" }}
          >
            <MenuItem value={"E-Defter"}>E-Defter Mizan</MenuItem>
            <MenuItem value={"VukMizan"}>Vuk Mizan</MenuItem>
          </CustomSelect>
        </Grid>
        <Grid item xs={12} lg={6}>
          <CustomSelect
            labelId="type2"
            id="type2"
            size="small"
            value={type2}
            onChange={(e: any) => {
              setType2(e.target.value);
            }}
            height={"36px"}
            sx={{ width: "100%" }}
          >
            <MenuItem value={"AnaHesap"}>Ana Hesap</MenuItem>
            <MenuItem value={"DetayHesap"}>Detay Hesap</MenuItem>
          </CustomSelect>
        </Grid>
        <Grid item xs={12} lg={12}>
          <OlusturulmusMizanlar type1={type1} type2={type2} />
        </Grid>
        <Grid item xs={12} md={12} lg={12}>
          <Typography variant="h6" textAlign="left" mb={1}>
            Program Vuk Mizan:
          </Typography>
        </Grid>
        <Grid item xs={12} lg={12}>
          <OlusturulmusProgramVukMizanlar type1={type1} />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
