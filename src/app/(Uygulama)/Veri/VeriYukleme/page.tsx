"use client";

import React, { useState } from "react";
import { 
  Box, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  useMediaQuery 
} from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import VukMizanVeriYuklemeWithStepper from "./components/VukMizanVeriYuklemeWithStepper";
import DonusturulmusMizanVeriYuklemeTab from "./components/DonusturulmusMizanVeriYuklemeTab";
import DonusumFisleriVeriYuklemeTab from "./components/DonusumFisleriVeriYuklemeTab";

const BCrumb = [
  {
    to: "/Veri",
    title: "Veri",
  },
  {
    to: "/Veri/VeriYukleme",
    title: "Veri Yükleme",
  },
];

const Page: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState("vuk-mizan");
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  return (
    <PageContainer
      title="Veri Yükleme"
      description="Veri yükleme sayfaları"
    >
      <Breadcrumb title="Veri Yükleme" items={BCrumb} />
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <FormControl sx={{ minWidth: 300, mb: 3 }}>
            <InputLabel id="veri-yukleme-select-label">
              Seçeneği Seçin
            </InputLabel>
            <Select
              labelId="veri-yukleme-select-label"
              id="veri-yukleme-select"
              value={selectedOption}
              label="Seçeneği Seçin"
              onChange={(e) => setSelectedOption(e.target.value)}
            >
              <MenuItem value="vuk-mizan">
                Vuk Mizan
              </MenuItem>
              <MenuItem value="donusturulmus-mizan">
                Dönüştürülmüş Mizan
              </MenuItem>
              <MenuItem value="donusum-fisleri">
                Dönüşüm Fişleri
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12 }}>
          {selectedOption === "vuk-mizan" && (
            <VukMizanVeriYuklemeWithStepper />
          )}

          {selectedOption === "donusturulmus-mizan" && (
            <DonusturulmusMizanVeriYuklemeTab />
          )}

          {selectedOption === "donusum-fisleri" && (
            <DonusumFisleriVeriYuklemeTab />
          )}
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
