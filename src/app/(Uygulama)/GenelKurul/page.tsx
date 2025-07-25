"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import GenelKurulLayout from "./GenelKurulLayout";
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
    <GenelKurulLayout>
      <PageContainer title="Genel Kurul" description="this is Genel Kurul">
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
            <FilteredMenu title="GENEL KURUL" />
          ) : (
            <TopCards title="GENEL KURUL" />
          )}
        </Box>
      </PageContainer>
    </GenelKurulLayout>
  );
};

export default Page;
