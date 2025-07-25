"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import KysLayout from "./KysLayout";
import React, { useState } from "react";
import { Box, Button, IconButton } from "@mui/material";
import FilteredMenu from "@/app/(Uygulama)/components/Tables/MenuTable";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import { IconLayoutGrid, IconList } from "@tabler/icons-react";

const Page = () => {
  const [showFilteredMenu, setShowFilteredMenu] = useState(true);

  const handleToggle = () => {
    setShowFilteredMenu((prev) => !prev);
  };
  return (
    <KysLayout>
      <PageContainer
        title="Kalite Yönetim Sistemi"
        description="this is Kalite Yönetim Sistemi"
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
              {/* Toggle between icons */}
            </Button>
          </Box>

          {showFilteredMenu ? (
            <FilteredMenu title="KYS" />
          ) : (
            <TopCards title="KYS" />
          )}
        </Box>
      </PageContainer>
    </KysLayout>
  );
};

export default Page;
