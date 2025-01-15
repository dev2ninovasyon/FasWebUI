"use client";

import React, { useState } from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box, Button } from "@mui/material";

import DenetimKanitlariLayout from "./DenetimKanitlariLayout";
import FilteredMenu from "@/app/(Uygulama)/components/Tables/MenuTable";

import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import { IconLayoutGrid, IconList } from "@tabler/icons-react";

const Page = () => {
  const [showFilteredMenu, setShowFilteredMenu] = useState(true);

  const handleToggle = () => {
    setShowFilteredMenu((prev) => !prev);
  };

  return (
    <DenetimKanitlariLayout>
      <PageContainer
        title="Denetim Kanıtları"
        description="this is Denetim Kanıtları"
      >
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
            <FilteredMenu title="DENETİM KANITLARI" />
          ) : (
            <TopCards title="DENETİM KANITLARI" />
          )}
        </Box>
      </PageContainer>
    </DenetimKanitlariLayout>
  );
};

export default Page;
