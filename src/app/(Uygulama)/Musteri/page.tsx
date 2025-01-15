"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";

import MusteriLayout from "./MusteriLayout";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import FilteredMenu from "@/app/(Uygulama)/components/Tables/MenuTable";
import { Box, Button, IconButton } from "@mui/material";
import { IconLayoutGrid, IconList } from "@tabler/icons-react";
import React, { useState } from "react";

const Page = () => {
  const [showFilteredMenu, setShowFilteredMenu] = useState(true);

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
              paddingBottom: "10px",
              paddingRight: "10px",
            }}
          >
            <Button onClick={handleToggle}>
              {showFilteredMenu ? (
                <IconLayoutGrid size={24} />
              ) : (
                <IconList size={24} />
              )}{" "}
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
