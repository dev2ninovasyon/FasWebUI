"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import MusteriLayout from "./MusteriLayout";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import FilteredMenu from "@/app/(Uygulama)/components/Tables/MenuTable";
import { Box, Button } from "@mui/material";
import { IconLayoutGrid, IconList } from "@tabler/icons-react";
import React, { useState } from "react";

const Page = () => {
  usePageTitle("Müşteri");
  const [showFilteredMenu, setShowFilteredMenu] = useState(false);

  const handleToggle = () => {
    setShowFilteredMenu((prev) => !prev);
  };

  return (
    <MusteriLayout>
      <PageContainer title="Müşteri" description="this is Müşteri">
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
              {/* Toggle between icons */}
            </Button>
          </Box>

          {showFilteredMenu ? (
            <FilteredMenu title="MÜŞTERİ" />
          ) : (
            <TopCards title="MÜŞTERİ" />
          )}
        </Box>
      </PageContainer>
    </MusteriLayout>
  );
};

export default Page;
