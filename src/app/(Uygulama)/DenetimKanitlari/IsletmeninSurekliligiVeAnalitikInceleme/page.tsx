"use client";

import React, { useState } from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box, Button } from "@mui/material";
import IsletmeninSurekliliğiVeAnalitikIncelemeLayout from "./IsletmeninSurekliliğiVeAnalitikIncelemeLayout";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import FilteredMenu from "@/app/(Uygulama)/components/Tables/MenuTable";
import { IconLayoutGrid, IconList } from "@tabler/icons-react";

const Page = () => {
  const [showFilteredMenu, setShowFilteredMenu] = useState(false);

  const handleToggle = () => {
    setShowFilteredMenu((prev) => !prev);
  };

  return (
    <IsletmeninSurekliliğiVeAnalitikIncelemeLayout>
      <PageContainer
        title="İşletmenin Sürekliliği ve Analitik İnceleme"
        description="this is İşletmenin Sürekliliği ve Analitik İnceleme"
      >
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "end",
              paddingBottom: showFilteredMenu ? "32px" : "0px",
              paddingRight: "10px",
            }}
          >
            <Button onClick={handleToggle}>
              {showFilteredMenu ? (
                <IconLayoutGrid size={24} />
              ) : (
                <IconList size={24} />
              )}
            </Button>
          </Box>
          {showFilteredMenu ? (
            <FilteredMenu title="İşletmenin Sürekliliği ve Analitik İnceleme" showStatusIcons={false} />
          ) : (
            <TopCards title="İşletmenin Sürekliliği ve Analitik İnceleme" />
          )}
        </Box>
      </PageContainer>
    </IsletmeninSurekliliğiVeAnalitikIncelemeLayout>
  );
};

export default Page;
